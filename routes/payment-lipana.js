/**
 * JKUAT Innovation Club - Lipana.dev Payment Integration
 * Simplified M-Pesa STK Push using Lipana.dev API
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin: supabase } = require('../lib/supabase');
const { authenticateToken } = require('../middleware/auth');
const crypto = require('crypto');
const router = express.Router();

// Lipana.dev Configuration
const LIPANA_CONFIG = {
  apiKey: process.env.LIPANA_API_KEY,
  webhookSecret: process.env.LIPANA_WEBHOOK_SECRET,
  environment: process.env.LIPANA_ENVIRONMENT || 'sandbox',
  baseUrl: 'https://api.lipana.dev/v1', // Correct base URL from documentation
  callbackUrl: process.env.LIPANA_CALLBACK_URL
};

/**
 * POST /api/payment-lipana/initiate
 * Initiate M-Pesa STK Push via Lipana.dev
 */
router.post('/initiate', authenticateToken, [
  body('phoneNumber').matches(/^254[0-9]{9}$/).withMessage('Valid Kenyan phone number required (254XXXXXXXXX)'),
  body('amount').isFloat({ min: 1, max: 1000000 }).withMessage('Amount must be between 1 and 1,000,000'),
  body('paymentType').notEmpty().withMessage('Payment type is required'),
  body('description').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber, amount, paymentType, eventId, description, serviceData } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log('💳 Initiating Lipana payment:', { userId, amount, paymentType });

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email, phone')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create payment record
    const paymentData = {
      user_id: userId,
      amount: parseFloat(amount),
      currency: 'KES',
      payment_type: paymentType,
      payment_method: 'mpesa',
      status: 'pending',
      description: description || `${paymentType} payment`,
      event_id: eventId || null,
      reference_number: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      metadata: {
        phoneNumber,
        serviceData,
        initiatedAt: new Date().toISOString(),
        environment: LIPANA_CONFIG.environment
      }
    };

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();

    if (paymentError) {
      console.error('❌ Payment creation error:', paymentError);
      return res.status(500).json({ message: 'Failed to create payment record' });
    }

    console.log('✅ Payment record created:', payment.id);

    // Initiate STK Push via Lipana.dev
    try {
      console.log('🔗 Calling Lipana API:', `${LIPANA_CONFIG.baseUrl}/transactions/push-stk`);
      console.log('🔑 Using API key:', LIPANA_CONFIG.apiKey ? `${LIPANA_CONFIG.apiKey.substring(0, 20)}...` : 'MISSING');
      
      const lipanaResponse = await fetch(`${LIPANA_CONFIG.baseUrl}/transactions/push-stk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': LIPANA_CONFIG.apiKey
        },
        body: JSON.stringify({
          phone: phoneNumber,
          amount: parseFloat(amount)
        })
      });

      console.log('📡 Lipana response status:', lipanaResponse.status);
      console.log('📡 Lipana response headers:', Object.fromEntries(lipanaResponse.headers.entries()));
      
      // Get response text first to see what we're getting
      const responseText = await lipanaResponse.text();
      console.log('📄 Lipana response body (first 500 chars):', responseText.substring(0, 500));
      
      // Try to parse as JSON
      let lipanaData;
      try {
        lipanaData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse Lipana response as JSON');
        console.error('Response was:', responseText.substring(0, 1000));
        throw new Error('Invalid response from payment service');
      }

      if (!lipanaResponse.ok) {
        console.error('❌ Lipana API error:', lipanaData);
        
        // Update payment status to failed
        await supabase
          .from('payments')
          .update({ 
            status: 'failed',
            metadata: {
              ...payment.metadata,
              error: lipanaData.message || 'STK Push failed'
            }
          })
          .eq('id', payment.id);

        return res.status(400).json({ 
          success: false,
          message: lipanaData.message || 'Failed to initiate payment'
        });
      }

      console.log('✅ Lipana STK Push initiated:', lipanaData);

      // Update payment with Lipana transaction ID
      await supabase
        .from('payments')
        .update({
          transaction_id: lipanaData.checkout_request_id || lipanaData.transaction_id,
          metadata: {
            ...payment.metadata,
            lipana_response: lipanaData,
            checkout_request_id: lipanaData.checkout_request_id
          }
        })
        .eq('id', payment.id);

      res.status(200).json({
        success: true,
        message: 'STK Push sent successfully',
        data: {
          paymentId: payment.id,
          transactionRef: payment.reference_number,
          checkoutRequestId: lipanaData.checkout_request_id,
          amount: payment.amount
        }
      });

    } catch (lipanaError) {
      console.error('❌ Lipana request error:', lipanaError);
      
      // Update payment status
      await supabase
        .from('payments')
        .update({ 
          status: 'failed',
          metadata: {
            ...payment.metadata,
            error: lipanaError.message
          }
        })
        .eq('id', payment.id);

      return res.status(500).json({ 
        success: false,
        message: 'Failed to connect to payment service'
      });
    }

  } catch (error) {
    console.error('❌ Payment initiation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

/**
 * POST /api/payment-lipana/callback
 * Handle Lipana.dev webhook callback
 */
router.post('/callback', async (req, res) => {
  try {
    console.log('📥 Lipana callback received:', JSON.stringify(req.body, null, 2));

    // Verify webhook signature
    const signature = req.headers['x-lipana-signature'];
    if (signature && LIPANA_CONFIG.webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', LIPANA_CONFIG.webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('❌ Invalid webhook signature');
        return res.status(401).json({ message: 'Invalid signature' });
      }
    }

    const callbackData = req.body;
    const { 
      checkout_request_id, 
      transaction_id, 
      result_code, 
      result_desc,
      amount,
      phone_number,
      mpesa_receipt_number,
      transaction_date,
      metadata 
    } = callbackData;

    // Find payment by checkout_request_id or transaction_id
    let payment;
    
    if (checkout_request_id) {
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('transaction_id', checkout_request_id)
        .single();
      payment = data;
    }

    if (!payment && metadata?.payment_id) {
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('id', metadata.payment_id)
        .single();
      payment = data;
    }

    if (!payment) {
      console.error('❌ Payment not found for callback');
      return res.status(404).json({ message: 'Payment not found' });
    }

    console.log('✅ Payment found:', payment.id);

    // Check result code (0 = success)
    if (result_code === 0 || result_code === '0') {
      // Payment successful
      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          transaction_id: transaction_id || payment.transaction_id,
          metadata: {
            ...payment.metadata,
            mpesa_receipt_number,
            transaction_date,
            phone_number,
            result_desc,
            callback_received_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating payment:', updateError);
        return res.status(500).json({ message: 'Failed to update payment' });
      }

      console.log('✅ Payment marked as completed');

      // AUTO-ACTIVATE MEMBERSHIP
      if (payment.payment_type === 'membership') {
        await activateMembership(payment.user_id, payment.metadata);
      }

      // CREATE NOTIFICATION
      await createPaymentNotification(payment.user_id, updatedPayment);

      // GENERATE RECEIPT
      await generateReceipt(updatedPayment);

      // Update event attendance if applicable
      if (payment.event_id) {
        await supabase
          .from('event_attendees')
          .update({ payment_status: 'paid' })
          .eq('event_id', payment.event_id)
          .eq('user_id', payment.user_id);
      }

      res.json({ success: true, message: 'Payment processed successfully' });

    } else {
      // Payment failed
      console.log('❌ Payment failed:', result_desc);

      await supabase
        .from('payments')
        .update({
          status: 'failed',
          metadata: {
            ...payment.metadata,
            result_code,
            result_desc,
            callback_received_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      res.json({ success: false, message: result_desc || 'Payment failed' });
    }

  } catch (error) {
    console.error('❌ Callback processing error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/payment-lipana/status/:paymentId
 * Check payment status
 */
router.get('/status/:paymentId', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user?.id;

    const { data: payment, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('user_id', userId)
      .single();

    if (error || !payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      payment_type: payment.payment_type,
      transactionReference: payment.transaction_id,
      receiptNumber: payment.receipt_number,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at
    });

  } catch (error) {
    console.error('❌ Status check error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== HELPER FUNCTIONS =====

async function activateMembership(userId, paymentMetadata) {
  try {
    const membershipType = paymentMetadata.serviceData?.option || 'annual';
    let validUntil = new Date();

    // Calculate expiry based on membership type
    if (membershipType.includes('monthly')) {
      validUntil.setMonth(validUntil.getMonth() + 1);
    } else if (membershipType.includes('semester')) {
      validUntil.setMonth(validUntil.getMonth() + 6);
    } else {
      validUntil.setFullYear(validUntil.getFullYear() + 1);
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        membership_status: 'active',
        membership_type: membershipType,
        membership_valid_until: validUntil.toISOString().split('T')[0],
        last_payment_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Membership activated for user ${userId} until ${validUntil}`);

    // Mark payment as auto-activated
    await supabase
      .from('payments')
      .update({ auto_activated: true })
      .eq('user_id', userId)
      .eq('payment_type', 'membership')
      .eq('status', 'completed')
      .is('auto_activated', null);

    return data;
  } catch (error) {
    console.error('❌ Error activating membership:', error);
  }
}

async function createPaymentNotification(userId, payment) {
  try {
    const notificationData = {
      user_id: userId,
      type: 'payment',
      priority: 'high',
      title: 'Payment Successful! 🎉',
      message: `Your payment of KSh ${payment.amount.toLocaleString()} for ${payment.payment_type} has been processed successfully.`,
      action_url: `/dashboard`,
      action_text: 'View Dashboard',
      metadata: {
        payment_id: payment.id,
        amount: payment.amount,
        payment_type: payment.payment_type,
        transaction_id: payment.transaction_id,
        receipt_number: payment.receipt_number
      },
      related_entity_type: 'payment',
      related_entity_id: payment.id
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('payments')
      .update({ notification_sent: true })
      .eq('id', payment.id);

    console.log(`✅ Notification created for payment ${payment.id}`);
    return data;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
  }
}

async function generateReceipt(payment) {
  try {
    // Get user details
    const { data: user } = await supabase
      .from('users')
      .select('name, email, phone, registration_number')
      .eq('id', payment.user_id)
      .single();

    // Generate receipt number if not exists
    const receiptNumber = payment.receipt_number || `RCP-${Date.now()}`;

    const receiptData = {
      receipt_number: receiptNumber,
      payment_id: payment.id,
      transaction_id: payment.transaction_id,
      date: payment.updated_at,
      payer: {
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        registration_number: user?.registration_number
      },
      payment_details: {
        amount: payment.amount,
        currency: payment.currency,
        payment_type: payment.payment_type,
        payment_method: payment.payment_method,
        description: payment.description
      },
      organization: {
        name: 'JKUAT Innovation and Entrepreneurship Club',
        email: 'info@jkuatinnovation.ac.ke'
      },
      mpesa_details: payment.metadata?.mpesa_receipt_number ? {
        receipt_number: payment.metadata.mpesa_receipt_number,
        phone_number: payment.metadata.phone_number
      } : null
    };

    // Update payment with receipt number
    await supabase
      .from('payments')
      .update({ receipt_number: receiptNumber })
      .eq('id', payment.id)
      .is('receipt_number', null);

    // Store receipt
    const { data, error } = await supabase
      .from('payment_receipts')
      .insert([{
        payment_id: payment.id,
        receipt_number: receiptNumber,
        receipt_data: receiptData
      }])
      .select()
      .single();

    if (error && error.code !== '23505') {
      throw error;
    }

    console.log(`✅ Receipt generated: ${receiptNumber}`);
    return data;
  } catch (error) {
    console.error('❌ Error generating receipt:', error);
  }
}

module.exports = router;
