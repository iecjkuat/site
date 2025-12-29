/**
 * Payment Service Routes
 * Handles M-Pesa and card payment processing
 */

const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../lib/supabase');

const { logActivity } = require('../lib/audit');

const router = express.Router();

// M-Pesa configuration
const MPESA_CONFIG = {
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    shortcode: process.env.MPESA_SHORTCODE || '174379',
    passkey: process.env.MPESA_PASSKEY,
    callbackUrl: process.env.MPESA_CALLBACK_URL || 'https://yourdomain.com/api/payments/mpesa/callback',
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
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

// Initiate M-Pesa STK Push
router.post('/mpesa/initiate', [
    body('phoneNumber').matches(/^254[0-9]{9}$/).withMessage('Valid Kenyan phone number required (254XXXXXXXXX)'),
    body('amount').isFloat({ min: 1 }).withMessage('Valid amount required'),
    body('eventId').isUUID().withMessage('Valid event ID required'),
    body('userId').isUUID().withMessage('Valid user ID required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { phoneNumber, amount, eventId, userId } = req.body;

        // Get event details
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('title, fee')
            .eq('id', eventId)
            .single();

        if (eventError || !event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Verify amount matches event fee
        if (parseFloat(amount) !== parseFloat(event.fee)) {
            return res.status(400).json({ message: 'Amount does not match event fee' });
        }

        // Generate unique transaction reference
        const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
        const transactionRef = `JKUAT${eventId.slice(-6)}${timestamp}`;

        // Create payment record
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .insert({
                user_id: userId,
                event_id: eventId,
                amount: amount,
                payment_method: 'mpesa',
                transaction_reference: transactionRef,
                phone_number: phoneNumber,
                status: 'pending'
            })
            .select()
            .single();

        if (paymentError) {
            return res.status(500).json({ message: 'Failed to create payment record' });
        }

        // For development/testing, simulate successful payment
        if (MPESA_CONFIG.environment === 'sandbox' && !MPESA_CONFIG.consumerKey) {
            // Log activity
            logActivity(userId, 'PAYMENT_INITIATED', {
                amount,
                eventId,
                method: 'mpesa_sandbox',
                txRef: transactionRef
            }, 'PAYMENT', payment.id).catch(console.error);

            // Simulate payment processing
            setTimeout(async () => {
                // Use atomic transaction via RPC
                const { data: result, error: rpcError } = await supabase.rpc('process_payment_success', {
                    p_payment_id: payment.id,
                    p_event_id: eventId,
                    p_user_id: userId,
                    p_receipt_number: `MOCK${Math.random().toString(36).substr(2, 9).toUpperCase()}`
                });

                if (rpcError) {
                    console.error('Mock payment processing failed:', rpcError);
                } else if (result && !result.success) {
                    console.error('Mock payment processing failed:', result.message);
                } else {
                    console.log(`Mock payment completed for transaction ${transactionRef}`);
                }
            }, 3000);

            return res.json({
                message: 'Payment initiated successfully (Mock Mode)',
                transactionRef,
                paymentId: payment.id,
                status: 'pending',
                checkStatusUrl: `/api/payments/status/${payment.id}`
            });
        }

        // Real M-Pesa integration
        try {
            const accessToken = await getMpesaAccessToken();
            const baseUrl = MPESA_CONFIG.environment === 'production'
                ? 'https://api.safaricom.co.ke'
                : 'https://sandbox.safaricom.co.ke';

            const stkPushPayload = {
                BusinessShortCode: MPESA_CONFIG.shortcode,
                Password: Buffer.from(`${MPESA_CONFIG.shortcode}${MPESA_CONFIG.passkey}${timestamp}`).toString('base64'),
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: amount,
                PartyA: phoneNumber,
                PartyB: MPESA_CONFIG.shortcode,
                PhoneNumber: phoneNumber,
                CallBackURL: MPESA_CONFIG.callbackUrl,
                AccountReference: transactionRef,
                TransactionDesc: `Payment for ${event.title}`
            };

            const stkResponse = await axios.post(`${baseUrl}/mpesa/stkpush/v1/processrequest`, stkPushPayload, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            // Update payment with M-Pesa checkout request ID
            await supabase
                .from('payments')
                .update({
                    mpesa_checkout_request_id: stkResponse.data.CheckoutRequestID
                })
                .eq('id', payment.id);

            res.json({
                message: 'Payment initiated successfully',
                transactionRef,
                paymentId: payment.id,
                checkoutRequestId: stkResponse.data.CheckoutRequestID,
                status: 'pending',
                checkStatusUrl: `/api/payments/status/${payment.id}`
            });

        } catch (mpesaError) {
            console.error('M-Pesa STK Push error:', mpesaError);

            // Update payment status to failed
            await supabase
                .from('payments')
                .update({ status: 'failed' })
                .eq('id', payment.id);

            res.status(500).json({
                message: 'Failed to initiate M-Pesa payment',
                error: mpesaError.response?.data || mpesaError.message
            });
        }

    } catch (error) {
        console.error('Error initiating M-Pesa payment:', error);
        res.status(500).json({ message: 'Payment initiation failed' });
    }
});

// M-Pesa callback handler
router.post('/mpesa/callback', async (req, res) => {
    try {
        const { Body } = req.body;

        if (Body && Body.stkCallback) {
            const callback = Body.stkCallback;
            const checkoutRequestId = callback.CheckoutRequestID;
            const resultCode = callback.ResultCode;

            // Find payment by checkout request ID
            const { data: payment, error } = await supabase
                .from('payments')
                .select('*')
                .eq('mpesa_checkout_request_id', checkoutRequestId)
                .single();

            if (error || !payment) {
                console.error('Payment not found for checkout request:', checkoutRequestId);
                return res.status(404).json({ message: 'Payment not found' });
            }

            if (resultCode === 0) {
                // Payment successful
                const callbackMetadata = callback.CallbackMetadata;
                const items = callbackMetadata.Item;

                const receiptNumber = items.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
                const transactionDate = items.find(item => item.Name === 'TransactionDate')?.Value;

                // Update payment status
                await supabase
                    .from('payments')
                    .update({
                        status: 'completed',
                        mpesa_receipt_number: receiptNumber,
                        completed_at: new Date().toISOString()
                    })
                    .eq('id', payment.id);

                // Update event registration payment status
                await supabase
                    .from('event_attendees')
                    .update({ payment_status: 'paid' })
                    .eq('event_id', payment.event_id)
                    .eq('user_id', payment.user_id);

                console.log(`Payment completed: ${receiptNumber} for transaction ${payment.transaction_reference}`);

                // Send confirmation email
                try {
                    await axios.post(`${req.protocol}://${req.get('host')}/api/email/registration-confirmation`, {
                        userId: payment.user_id,
                        eventId: payment.event_id,
                        registrationId: payment.id
                    });
                } catch (emailError) {
                    console.error('Failed to send confirmation email:', emailError);
                }

            } else {
                // Payment failed
                await supabase
                    .from('payments')
                    .update({
                        status: 'failed',
                        failure_reason: callback.ResultDesc
                    })
                    .eq('id', payment.id);

                console.log(`Payment failed: ${callback.ResultDesc} for transaction ${payment.transaction_reference}`);
            }
        }

        res.json({ message: 'Callback processed successfully' });

    } catch (error) {
        console.error('Error processing M-Pesa callback:', error);
        res.status(500).json({ message: 'Callback processing failed' });
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