/**
 * Payment Service Routes
 * Handles M-Pesa and card payment processing
 */

const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin: supabase } = require('../lib/supabase');

const { logActivity } = require('../lib/audit');

const router = express.Router();

// Lipana.dev M-Pesa configuration
const LIPANA_CONFIG = {
    publishableKey: process.env.LIPANA_PUBLISHABLE_KEY,
    liveKey: process.env.LIPANA_LIVE_KEY,
    baseUrl: process.env.LIPANA_BASE_URL || 'https://api.lipana.dev',
    callbackUrl: process.env.LIPANA_CALLBACK_URL || 'https://yourdomain.com/api/payments/lipana/callback',
    environment: process.env.NODE_ENV === 'production' ? 'live' : 'test'
};

// Get M-Pesa access token
async function getMpesaAccessToken() {
    try {
        const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
        const baseUrl = MPESA_CONFIG.environment === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';

        const response = await axios.get(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });

        return response.data.access_token;
    } catch (error) {
        console.error('Error getting M-Pesa access token:', error);
        throw new Error('Failed to authenticate with M-Pesa');
    }
}

// Initiate Lipana M-Pesa STK Push
router.post('/lipana/initiate', [
    body('phoneNumber').matches(/^254[0-9]{9}$/).withMessage('Valid Kenyan phone number required (254XXXXXXXXX)'),
    body('amount').isFloat({ min: 1 }).withMessage('Valid amount required'),
    body('eventId').optional().isUUID().withMessage('Valid event ID required if provided'),
    body('userId').isUUID().withMessage('Valid user ID required'),
    body('description').optional().isString().withMessage('Description must be a string')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { phoneNumber, amount, eventId, userId, description } = req.body;

        // Validate user exists or create test user for development
        let user;
        const { data: existingUser, error: userError } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('id', userId)
            .single();

        if (userError || !existingUser) {
            if (process.env.NODE_ENV === 'development' && userId === '550e8400-e29b-41d4-a716-446655440000') {
                // Create test user for development
                console.log('Creating test user for development...');
                const { data: newUser, error: createError } = await supabase
                    .from('users')
                    .insert({
                        id: userId,
                        name: 'Test User',
                        email: 'test@jkuat.ac.ke',
                        password_hash: '$2b$10$test.hash.for.development.only',
                        registration_number: 'TEST/001/2024',
                        course: 'Computer Science',
                        year_of_study: 3,
                        phone: phoneNumber,
                        membership_status: 'pending',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select('id, name, email')
                    .single();

                if (createError) {
                    console.error('Failed to create test user:', createError);
                    return res.status(400).json({ message: 'User not found and could not create test user' });
                }
                user = newUser;
            } else {
                return res.status(400).json({ message: 'User not found' });
            }
        } else {
            user = existingUser;
        }

        // Validate event if provided
        let event = null;
        if (eventId) {
            const { data: eventData, error: eventError } = await supabase
                .from('events')
                .select('title, fee')
                .eq('id', eventId)
                .single();

            if (eventError || !eventData) {
                return res.status(404).json({ message: 'Event not found' });
            }
            event = eventData;

            // Verify amount matches event fee
            if (parseFloat(amount) !== parseFloat(event.fee)) {
                return res.status(400).json({ message: 'Amount does not match event fee' });
            }
        }

        // Generate unique transaction reference
        const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
        const transactionRef = `JKUAT${eventId ? eventId.slice(-6) : 'PAY'}${timestamp}`;

        // Create payment record
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .insert({
                user_id: userId,
                event_id: eventId || null,
                amount: amount,
                currency: 'KES',
                payment_method: 'mpesa',
                payment_type: eventId ? 'event' : 'membership',
                status: 'pending',
                reference_number: transactionRef,
                description: description || (event ? `Payment for ${event.title}` : 'General payment'),
                metadata: {
                    phoneNumber,
                    initiatedAt: new Date().toISOString(),
                    provider: 'lipana'
                }
            })
            .select()
            .single();

        if (paymentError) {
            console.error('Payment creation error:', paymentError);
            return res.status(500).json({ message: 'Failed to create payment record' });
        }

        // Lipana API integration
        try {
            // Check if we're in development mode with mock Lipana
            if (process.env.NODE_ENV === 'development' && (!LIPANA_CONFIG.liveKey || LIPANA_CONFIG.liveKey === 'your_lipana_live_key_here')) {
                console.log('🧪 Using mock Lipana response for testing...');
                
                // Simulate successful Lipana response
                const mockLipanaResponse = {
                    success: true,
                    checkout_request_id: `MOCK_CHECKOUT_${Date.now()}`,
                    id: `MOCK_ID_${Date.now()}`,
                    message: 'STK Push initiated successfully',
                    status: 'pending'
                };

                // Update payment with mock response
                await supabase
                    .from('payments')
                    .update({
                        transaction_id: mockLipanaResponse.checkout_request_id,
                        metadata: {
                            ...payment.metadata,
                            lipanaResponse: mockLipanaResponse,
                            mockMode: true
                        }
                    })
                    .eq('id', payment.id);

                // Log activity
                logActivity(userId, 'PAYMENT_INITIATED', {
                    amount,
                    eventId,
                    method: 'lipana_mpesa_mock',
                    txRef: transactionRef
                }, 'PAYMENT', payment.id).catch(console.error);

                res.json({
                    success: true,
                    message: 'Payment initiated successfully (Mock Mode)',
                    data: {
                        paymentId: payment.id,
                        transactionRef,
                        checkoutRequestId: mockLipanaResponse.checkout_request_id,
                        status: 'pending',
                        checkStatusUrl: `/api/payment-service/status/${payment.id}`,
                        instructions: 'MOCK MODE: Check your phone for M-Pesa prompt and enter your PIN to complete the payment',
                        mockMode: true
                    }
                });

                // Simulate callback after 10 seconds for testing
                setTimeout(async () => {
                    try {
                        const mockCallback = {
                            status: 'success',
                            reference: transactionRef,
                            transaction_id: `MOCK_TXN_${Date.now()}`,
                            receipt_number: `MOCK_RECEIPT_${Date.now()}`,
                            amount: amount,
                            phone: phoneNumber,
                            metadata: {
                                payment_id: payment.id
                            }
                        };

                        // Process mock callback
                        await supabase
                            .from('payments')
                            .update({
                                status: 'completed',
                                transaction_id: mockCallback.transaction_id,
                                updated_at: new Date().toISOString(),
                                metadata: {
                                    ...payment.metadata,
                                    callback: mockCallback,
                                    completedAt: new Date().toISOString()
                                }
                            })
                            .eq('id', payment.id);

                        console.log(`🎉 Mock payment completed: ${mockCallback.receipt_number} for transaction ${transactionRef}`);
                    } catch (mockError) {
                        console.error('Mock callback processing failed:', mockError);
                    }
                }, 10000);

                return;
            }

            // Real Lipana API call
            const lipanaPayload = {
                phone: phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`,
                amount: parseFloat(amount) * 100, // Convert to cents (5000 = 50.00 KSh)
                reference: transactionRef, // Add our transaction reference
                callback_url: LIPANA_CONFIG.callbackUrl // Add callback URL for webhooks
            };

            // Correct Lipana.dev endpoint
            const lipanaResponse = await axios.post(`${LIPANA_CONFIG.baseUrl}/api/v1/transactions/push-stk`, lipanaPayload, {
                headers: {
                    'x-api-key': LIPANA_CONFIG.liveKey,
                    'Content-Type': 'application/json'
                }
            });

            // Update payment with Lipana response
            await supabase
                .from('payments')
                .update({
                    transaction_id: lipanaResponse.data.data.transactionId,
                    metadata: {
                        ...payment.metadata,
                        lipanaResponse: lipanaResponse.data,
                        checkoutRequestID: lipanaResponse.data.data.checkoutRequestID
                    }
                })
                .eq('id', payment.id);

            // Log activity
            logActivity(userId, 'PAYMENT_INITIATED', {
                amount,
                eventId,
                method: 'lipana_mpesa',
                txRef: transactionRef
            }, 'PAYMENT', payment.id).catch(console.error);

            res.json({
                success: true,
                message: lipanaResponse.data.message,
                data: {
                    paymentId: payment.id,
                    transactionRef,
                    transactionId: lipanaResponse.data.data.transactionId,
                    checkoutRequestId: lipanaResponse.data.data.checkoutRequestID,
                    status: lipanaResponse.data.data.status,
                    checkStatusUrl: `/api/payment-service/status/${payment.id}`,
                    instructions: lipanaResponse.data.data.message
                }
            });

        } catch (lipanaError) {
            console.error('Lipana API error:', lipanaError.response?.data || lipanaError.message);

            // Update payment status to failed
            await supabase
                .from('payments')
                .update({ 
                    status: 'failed',
                    metadata: {
                        ...payment.metadata,
                        error: lipanaError.response?.data || lipanaError.message
                    }
                })
                .eq('id', payment.id);

            res.status(500).json({
                success: false,
                message: 'Failed to initiate M-Pesa payment',
                error: lipanaError.response?.data?.message || 'Payment service unavailable'
            });
        }

    } catch (error) {
        console.error('Error initiating Lipana payment:', error);
        res.status(500).json({ 
            success: false,
            message: 'Payment initiation failed' 
        });
    }
});

// Lipana callback handler
router.post('/lipana/callback', async (req, res) => {
    try {
        const callbackData = req.body;
        const signature = req.headers['x-lipana-signature'];
        
        console.log('Lipana webhook received:', callbackData);
        console.log('Signature:', signature);

        // Verify webhook signature for security (if signature is provided)
        if (signature && process.env.LIPANA_WEBHOOK_SECRET) {
            const crypto = require('crypto');
            const expectedSignature = crypto
                .createHmac('sha256', process.env.LIPANA_WEBHOOK_SECRET)
                .update(JSON.stringify(callbackData))
                .digest('hex');
            
            if (signature !== expectedSignature) {
                console.error('Invalid webhook signature');
                return res.status(401).json({ message: 'Invalid signature' });
            }
        }
        
        // Extract payment information from Lipana webhook
        const { event, data } = callbackData;
        
        if (event !== 'payment.success') {
            console.log('Ignoring non-success event:', event);
            return res.json({ success: true, message: 'Event acknowledged' });
        }

        const { 
            transactionId, 
            amount, 
            currency, 
            status, 
            phone, 
            checkoutRequestID, // This might not always be present
            timestamp 
        } = data;

        // Find payment by checkout request ID, transaction ID, or phone/amount combination
        let payment = null;

        // Try to find by checkoutRequestID first (if available)
        if (checkoutRequestID) {
            const { data: paymentByCheckout } = await supabase
                .from('payments')
                .select('*')
                .eq('metadata->>checkoutRequestID', checkoutRequestID)
                .single();
            payment = paymentByCheckout;
        }

        // If not found and no checkoutRequestID, try by transaction_id
        if (!payment) {
            const { data: paymentByTxn } = await supabase
                .from('payments')
                .select('*')
                .eq('transaction_id', transactionId)
                .single();
            payment = paymentByTxn;
        }

        // If still not found, try by phone and amount (as fallback)
        if (!payment) {
            const { data: paymentByPhoneAmount } = await supabase
                .from('payments')
                .select('*')
                .eq('metadata->>phoneNumber', phone.replace('+', ''))
                .eq('amount', amount / 100) // Convert cents back to KSh
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            payment = paymentByPhoneAmount;
        }

        if (!payment) {
            console.error('Payment not found for webhook:', { 
                transactionId, 
                checkoutRequestID: checkoutRequestID || 'not_provided', 
                phone, 
                amount 
            });
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (status === 'success') {
            // Payment successful
            const { data: updatedPayment, error: updateError } = await supabase
                .from('payments')
                .update({
                    status: 'completed',
                    transaction_id: transactionId,
                    updated_at: new Date().toISOString(),
                    metadata: {
                        ...payment.metadata,
                        webhook: callbackData,
                        completedAt: timestamp,
                        lipanaTransactionId: transactionId,
                        ...(checkoutRequestID && { checkoutRequestID: checkoutRequestID })
                    }
                })
                .eq('id', payment.id)
                .select()
                .single();

            if (updateError) {
                console.error('Error updating payment:', updateError);
                return res.status(500).json({ message: 'Failed to update payment' });
            }

            // Update event registration if applicable
            if (payment.event_id) {
                await supabase
                    .from('event_attendees')
                    .update({ payment_status: 'paid' })
                    .eq('event_id', payment.event_id)
                    .eq('user_id', payment.user_id);
            }

            // Log successful payment
            logActivity(payment.user_id, 'PAYMENT_COMPLETED', {
                amount: payment.amount,
                transactionId: transactionId,
                ...(checkoutRequestID && { checkoutRequestID: checkoutRequestID }),
                currency: currency
            }, 'PAYMENT', payment.id).catch(console.error);

            console.log(`✅ Payment completed via Lipana: ${transactionId} for amount ${amount/100} ${currency}`);

            // Send confirmation email (optional)
            try {
                await axios.post(`${req.protocol}://${req.get('host')}/api/email/payment-confirmation`, {
                    userId: payment.user_id,
                    paymentId: payment.id,
                    amount: payment.amount,
                    transactionId: transactionId
                });
            } catch (emailError) {
                console.error('Failed to send confirmation email:', emailError);
            }

        } else {
            // Payment failed or other status
            await supabase
                .from('payments')
                .update({
                    status: 'failed',
                    updated_at: new Date().toISOString(),
                    metadata: {
                        ...payment.metadata,
                        webhook: callbackData,
                        failureReason: `Payment ${status}`
                    }
                })
                .eq('id', payment.id);

            console.log(`❌ Payment failed via Lipana: ${transactionId} with status ${status}`);
        }

        res.json({ 
            success: true,
            message: 'Webhook processed successfully' 
        });

    } catch (error) {
        console.error('Error processing Lipana webhook:', error);
        res.status(500).json({ 
            success: false,
            message: 'Webhook processing failed' 
        });
    }
});

// Check payment status
router.get('/status/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;

        const { data: payment, error } = await supabase
            .from('payments')
            .select(`
                *,
                events:event_id(title),
                users:user_id(name, email)
            `)
            .eq('id', paymentId)
            .single();

        if (error || !payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.json({
            paymentId: payment.id,
            status: payment.status,
            amount: payment.amount,
            transactionReference: payment.transaction_reference,
            mpesaReceiptNumber: payment.mpesa_receipt_number,
            eventTitle: payment.events?.title,
            userName: payment.users?.name,
            createdAt: payment.created_at,
            completedAt: payment.completed_at,
            failureReason: payment.failure_reason
        });

    } catch (error) {
        console.error('Error checking payment status:', error);
        res.status(500).json({ message: 'Failed to check payment status' });
    }
});

// Get user payment history
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data: payments, error } = await supabase
            .from('payments')
            .select(`
                *,
                events:event_id(title, start_date)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ message: 'Failed to fetch payment history' });
        }

        res.json({
            payments: payments.map(payment => ({
                id: payment.id,
                amount: payment.amount,
                status: payment.status,
                paymentMethod: payment.payment_method,
                transactionReference: payment.transaction_reference,
                mpesaReceiptNumber: payment.mpesa_receipt_number,
                eventTitle: payment.events?.title,
                eventDate: payment.events?.start_date,
                createdAt: payment.created_at,
                completedAt: payment.completed_at
            }))
        });

    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({ message: 'Failed to fetch payment history' });
    }
});

module.exports = router;