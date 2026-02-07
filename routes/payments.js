const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { supabaseAdmin: supabase } = require('../lib/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { handleValidationErrors, commonValidations } = require('../middleware/validation');
const router = express.Router();

// Get all payments - Requires authentication and proper authorization
router.get('/', 
  authenticateToken,
  requireRole(['admin', 'treasurer']),
  [
    ...commonValidations.pagination,
    query('userId').optional().isUUID().withMessage('Invalid user ID'),
    query('status').optional().isIn(['pending', 'completed', 'failed', 'cancelled']).withMessage('Invalid status'),
    query('paymentType').optional().isIn(['membership', 'event', 'fine', 'donation']).withMessage('Invalid payment type')
  ],
  handleValidationErrors,
  async (req, res) => {
  try {
    const { userId, status, paymentType, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('payments')
      .select(`
        id, user_id, amount, currency, payment_type, payment_method, 
        status, reference_number, transaction_id, created_at, updated_at,
        users!inner(name, email, registration_number),
        events(title)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    // Apply filters with proper validation
    if (userId) {
      // Ensure user can only view their own payments unless admin/treasurer
      if (req.user.role !== 'admin' && req.user.role !== 'treasurer' && userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied to other user payments' });
      }
      query = query.eq('user_id', userId);
    }
    
    if (status) {
      query = query.eq('status', status.toLowerCase());
    }
    
    if (paymentType) {
      query = query.eq('payment_type', paymentType);
    }

    const { data: payments, error, count } = await query;

    if (error) {
      console.error('Error fetching payments:', {
        error: error.message,
        userId: req.user.id,
        filters: { userId, status, paymentType }
      });
      return res.status(500).json({ message: 'Server error' });
    }

    res.json({
      payments: payments || [],
      pagination: {
        current: parseInt(page),
        total: Math.ceil((count || 0) / parseInt(limit)),
        count: payments?.length || 0,
        totalPayments: count || 0
      }
    });
  } catch (error) {
    console.error('Payments route error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single payment
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: payment, error } = await supabase
      .from('payments')
      .select(`
        id, user_id, amount, currency, payment_type, payment_method,
        status, reference_number, transaction_id, created_at, updated_at,
        users!inner(name, email, registration_number, phone),
        events(title, start_date)
      `)
      .eq('id', id)
      .single();

    if (error || !payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Initiate M-Pesa payment
router.post('/mpesa/initiate', [
  body('userId').isUUID().withMessage('Valid user ID is required'),
  body('amount').isDecimal({ decimal_digits: '0,2' }).withMessage('Valid amount is required'),
  body('phoneNumber').isMobilePhone().withMessage('Valid phone number is required'),
  body('paymentType').notEmpty().withMessage('Payment type is required'),
  body('eventId').optional().isUUID().withMessage('Valid event ID required if provided')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, amount, phoneNumber, paymentType, eventId, description } = req.body;

    // Validate user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        amount: parseFloat(amount),
        currency: 'KES',
        payment_type: paymentType,
        payment_method: 'mpesa',
        status: 'pending',
        event_id: eventId || null,
        description: description || `${paymentType} payment`,
        reference_number: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        metadata: {
          phoneNumber,
          initiatedAt: new Date().toISOString()
        }
      })
      .select(`
        id, user_id, amount, currency, payment_type, status, reference_number,
        users!inner(name, email)
      `)
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      return res.status(500).json({ message: 'Failed to create payment record' });
    }

    // Simulate M-Pesa STK Push (in production, integrate with actual M-Pesa API)
    const mpesaResponse = {
      MerchantRequestID: `MERCHANT-${Date.now()}`,
      CheckoutRequestID: `CHECKOUT-${Date.now()}`,
      ResponseCode: "0",
      ResponseDescription: "Success. Request accepted for processing",
      CustomerMessage: "Success. Request accepted for processing"
    };

    // Update payment with M-Pesa response
    await supabase
      .from('payments')
      .update({
        transaction_id: mpesaResponse.CheckoutRequestID,
        metadata: {
          ...payment.metadata,
          mpesaResponse
        }
      })
      .eq('id', payment.id);

    res.status(201).json({
      message: 'M-Pesa payment initiated successfully',
      payment: {
        id: payment.id,
        referenceNumber: payment.reference_number,
        amount: payment.amount,
        status: payment.status
      },
      mpesaResponse,
      instructions: 'Please check your phone for M-Pesa prompt and enter your PIN to complete the payment'
    });
  } catch (error) {
    console.error('Error initiating M-Pesa payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Process card payment
router.post('/card/process', [
  body('userId').isUUID().withMessage('Valid user ID is required'),
  body('amount').isDecimal({ decimal_digits: '0,2' }).withMessage('Valid amount is required'),
  body('paymentType').notEmpty().withMessage('Payment type is required'),
  body('cardDetails').isObject().withMessage('Card details are required'),
  body('eventId').optional().isUUID().withMessage('Valid event ID required if provided')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, amount, paymentType, cardDetails, eventId } = req.body;

    // Validate card details (basic validation)
    const { cardNumber, expiryMonth, expiryYear, cvv, cardholderName } = cardDetails;
    
    if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !cardholderName) {
      return res.status(400).json({ message: 'Complete card details are required' });
    }

    // Validate user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        amount: parseFloat(amount),
        currency: 'KES',
        payment_type: paymentType,
        payment_method: 'card',
        status: 'pending',
        event_id: eventId || null,
        reference_number: `CARD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        metadata: {
          maskedCardNumber: `****-****-****-${cardNumber.slice(-4)}`,
          cardholderName
        }
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      return res.status(500).json({ message: 'Failed to create payment record' });
    }

    // Simulate card processing (in production, integrate with payment gateway)
    const isSuccessful = Math.random() > 0.1; // 90% success rate for simulation
    
    const cardResponse = {
      transactionId: `TXN-${Date.now()}`,
      authCode: isSuccessful ? `AUTH-${Math.random().toString(36).substr(2, 6).toUpperCase()}` : null,
      responseCode: isSuccessful ? "00" : "05",
      responseMessage: isSuccessful ? "Transaction Approved" : "Transaction Declined",
      maskedCardNumber: `****-****-****-${cardNumber.slice(-4)}`
    };

    // Update payment status
    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update({
        status: isSuccessful ? 'completed' : 'failed',
        transaction_id: cardResponse.transactionId,
        metadata: {
          ...payment.metadata,
          cardResponse
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id)
      .select(`
        id, user_id, amount, currency, status, transaction_id, updated_at,
        users!inner(name, email)
      `)
      .single();

    if (updateError) {
      console.error('Payment update error:', updateError);
      return res.status(500).json({ message: 'Failed to update payment status' });
    }

    if (isSuccessful) {
      // Update event registration payment status if applicable
      if (eventId) {
        await supabase
          .from('event_attendees')
          .update({ payment_status: 'paid' })
          .eq('event_id', eventId)
          .eq('user_id', userId)
          .eq('payment_status', 'pending');
      }

      res.json({
        message: 'Payment processed successfully',
        payment: updatedPayment,
        receipt: {
          transactionId: cardResponse.transactionId,
          authCode: cardResponse.authCode,
          amount: updatedPayment.amount,
          currency: updatedPayment.currency,
          timestamp: updatedPayment.updated_at
        }
      });
    } else {
      res.status(400).json({
        message: 'Payment failed',
        error: cardResponse.responseMessage,
        payment: updatedPayment
      });
    }
  } catch (error) {
    console.error('Error processing card payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check M-Pesa payment status
router.get('/mpesa/status/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const { data: payment, error } = await supabase
      .from('payments')
      .select(`
        id, user_id, amount, status, payment_method, event_id, metadata,
        users!inner(name, email)
      `)
      .eq('id', paymentId)
      .single();

    if (error || !payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.payment_method !== 'mpesa') {
      return res.status(400).json({ message: 'Not an M-Pesa payment' });
    }

    // Simulate status check (in production, query M-Pesa API)
    const isCompleted = Math.random() > 0.3; // 70% chance of completion for simulation
    
    if (isCompleted && payment.status === 'pending') {
      const mpesaCallback = {
        ResultCode: 0,
        ResultDesc: "The service request is processed successfully.",
        TransactionID: `MP${Date.now()}`,
        TransactionReceipt: `MP${Date.now().toString().slice(-8)}`,
        TransactionAmount: payment.amount,
        TransactionDate: new Date().toISOString(),
        PhoneNumber: "254700000000"
      };

      // Update payment status
      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          transaction_id: mpesaCallback.TransactionID,
          metadata: {
            ...payment.metadata,
            callback: mpesaCallback
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (updateError) {
        console.error('Payment update error:', updateError);
        return res.status(500).json({ message: 'Failed to update payment status' });
      }

      // Update event registration if applicable
      if (payment.event_id) {
        await supabase
          .from('event_attendees')
          .update({ payment_status: 'paid' })
          .eq('event_id', payment.event_id)
          .eq('user_id', payment.user_id)
          .eq('payment_status', 'pending');
      }

      res.json({
        status: 'completed',
        message: 'Payment completed successfully',
        payment: updatedPayment,
        receipt: {
          transactionId: mpesaCallback.TransactionID,
          receipt: mpesaCallback.TransactionReceipt,
          amount: mpesaCallback.TransactionAmount,
          timestamp: mpesaCallback.TransactionDate
        }
      });
    } else {
      res.json({
        status: payment.status,
        message: payment.status === 'pending' ? 'Payment is still processing' : 'Payment status unchanged',
        payment
      });
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment receipt
router.get('/:id/receipt', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: payment, error } = await supabase
      .from('payments')
      .select(`
        id, user_id, amount, currency, payment_type, payment_method, status,
        reference_number, transaction_id, updated_at,
        users!inner(name, email, registration_number),
        events(title, start_date)
      `)
      .eq('id', id)
      .single();

    if (error || !payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    const receipt = {
      receiptNumber: payment.reference_number,
      transactionId: payment.transaction_id,
      paymentDate: payment.updated_at,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.payment_method,
      paymentType: payment.payment_type,
      status: payment.status,
      payer: {
        name: payment.users.name,
        email: payment.users.email,
        registrationNumber: payment.users.registration_number
      },
      payee: {
        name: 'JKUAT Innovation and Entrepreneurship Club',
        shortName: 'JKUAT Innovation Club',
        email: 'info@jkuatinnovation.ac.ke'
      },
      ...(payment.events && {
        event: {
          title: payment.events.title,
          date: payment.events.start_date
        }
      })
    };

    res.json({
      message: 'Receipt generated successfully',
      receipt
    });
  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refund payment (admin only)
router.post('/:id/refund', [
  body('reason').notEmpty().withMessage('Refund reason is required'),
  body('amount').optional().isDecimal({ decimal_digits: '0,2' }).withMessage('Valid refund amount required if provided')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { reason, amount } = req.body;

    const { data: payment, error } = await supabase
      .from('payments')
      .select('id, amount, status, metadata')
      .eq('id', id)
      .single();

    if (error || !payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ message: 'Can only refund completed payments' });
    }

    const refundAmount = amount ? parseFloat(amount) : payment.amount;

    if (refundAmount > payment.amount) {
      return res.status(400).json({ message: 'Refund amount cannot exceed original payment' });
    }

    // Update payment status
    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'refunded',
        metadata: {
          ...payment.metadata,
          refund: {
            amount: refundAmount,
            reason,
            processedAt: new Date().toISOString(),
            refundId: `REF-${Date.now()}`
          }
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        id, amount, status, metadata,
        users!inner(name, email)
      `)
      .single();

    if (updateError) {
      console.error('Refund update error:', updateError);
      return res.status(500).json({ message: 'Failed to process refund' });
    }

    res.json({
      message: 'Refund processed successfully',
      payment: updatedPayment,
      refund: {
        amount: refundAmount,
        reason,
        processedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment statistics
router.get('/stats', async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [
      { count: totalCount, data: totalData },
      { count: periodCount, data: periodData },
      { data: statusData },
      { data: methodData },
      { data: typeData }
    ] = await Promise.all([
      // Total stats
      supabase
        .from('payments')
        .select('amount', { count: 'exact' }),
      
      // Period stats
      supabase
        .from('payments')
        .select('amount', { count: 'exact' })
        .gte('created_at', startDate.toISOString()),
      
      // By status
      supabase
        .from('payments')
        .select('status, amount'),
      
      // By method
      supabase
        .from('payments')
        .select('payment_method, amount'),
      
      // By type
      supabase
        .from('payments')
        .select('payment_type, amount')
    ]);

    // Calculate totals
    const totalAmount = totalData?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0;
    const periodAmount = periodData?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0;

    // Group by status
    const statusStats = {};
    statusData?.forEach(payment => {
      const status = payment.status;
      if (!statusStats[status]) {
        statusStats[status] = { count: 0, amount: 0 };
      }
      statusStats[status].count++;
      statusStats[status].amount += parseFloat(payment.amount || 0);
    });

    // Group by method
    const methodStats = {};
    methodData?.forEach(payment => {
      const method = payment.payment_method;
      if (!methodStats[method]) {
        methodStats[method] = { count: 0, amount: 0 };
      }
      methodStats[method].count++;
      methodStats[method].amount += parseFloat(payment.amount || 0);
    });

    // Group by type
    const typeStats = {};
    typeData?.forEach(payment => {
      const type = payment.payment_type;
      if (!typeStats[type]) {
        typeStats[type] = { count: 0, amount: 0 };
      }
      typeStats[type].count++;
      typeStats[type].amount += parseFloat(payment.amount || 0);
    });

    const stats = {
      total: {
        count: totalCount || 0,
        amount: totalAmount
      },
      period: {
        count: periodCount || 0,
        amount: periodAmount,
        days: period
      },
      breakdown: {
        byStatus: Object.entries(statusStats).map(([status, data]) => ({
          status,
          count: data.count,
          amount: data.amount
        })),
        byMethod: Object.entries(methodStats).map(([method, data]) => ({
          method,
          count: data.count,
          amount: data.amount
        })),
        byType: Object.entries(typeStats).map(([type, data]) => ({
          type,
          count: data.count,
          amount: data.amount
        }))
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;