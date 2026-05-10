'use strict';

/**
 * M-Pesa Daraja API Integration
 * Handles STK Push payments for merchandise orders
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { supabaseAdmin } = require('../lib/supabase');

// M-Pesa API Configuration
const MPESA_CONFIG = {
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    businessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE,
    passkey: process.env.MPESA_PASSKEY,
    environment: process.env.MPESA_ENVIRONMENT || 'sandbox',
    callbackUrl: process.env.MPESA_CALLBACK_URL,
    timeoutUrl: process.env.MPESA_TIMEOUT_URL
};

// M-Pesa API URLs
const MPESA_URLS = {
    sandbox: {
        auth: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        stkPush: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
    },
    production: {
        auth: 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        stkPush: 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
    }
};

// Get M-Pesa access token
async function getMpesaAccessToken() {
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
    
    try {
        const response = await fetch(MPESA_URLS[MPESA_CONFIG.environment].auth, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`M-Pesa auth failed: ${response.status}`);
        }
        
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('M-Pesa auth error:', error);
        throw new Error('Failed to get M-Pesa access token');
    }
}

// Generate timestamp for M-Pesa
function generateTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hour}${minute}${second}`;
}

// Generate M-Pesa password
function generatePassword(shortCode, passkey, timestamp) {
    const data = shortCode + passkey + timestamp;
    return Buffer.from(data).toString('base64');
}

// Validate phone number format
function formatPhoneNumber(phone) {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('0')) {
        cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
        cleaned = '254' + cleaned;
    } else if (!cleaned.startsWith('254')) {
        throw new Error('Invalid phone number format');
    }
    
    // Validate length (should be 12 digits for Kenya)
    if (cleaned.length !== 12) {
        throw new Error('Phone number must be 12 digits');
    }
    
    return cleaned;
}

// POST /api/v1/payments/mpesa/stkpush - Initiate STK Push
router.post('/mpesa/stkpush', async (req, res) => {
    try {
        const { phoneNumber, amount, orderId, accountReference, transactionDesc } = req.body;
        
        // Validate required fields
        if (!phoneNumber || !amount || !orderId) {
            return res.status(400).json({
                success: false,
                error: 'Phone number, amount, and order ID are required'
            });
        }
        
        // Validate amount (minimum 1 KES)
        const numAmount = parseInt(amount);
        if (numAmount < 1) {
            return res.status(400).json({
                success: false,
                error: 'Amount must be at least 1 KES'
            });
        }
        
        // Format phone number
        let formattedPhone;
        try {
            formattedPhone = formatPhoneNumber(phoneNumber);
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        // Get access token
        const accessToken = await getMpesaAccessToken();
        
        // Generate timestamp and password
        const timestamp = generateTimestamp();
        const password = generatePassword(MPESA_CONFIG.businessShortCode, MPESA_CONFIG.passkey, timestamp);
        
        // Prepare STK Push request
        const stkPushData = {
            BusinessShortCode: MPESA_CONFIG.businessShortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: numAmount,
            PartyA: formattedPhone,
            PartyB: MPESA_CONFIG.businessShortCode,
            PhoneNumber: formattedPhone,
            CallBackURL: MPESA_CONFIG.callbackUrl,
            AccountReference: accountReference || `IEC-${orderId}`,
            TransactionDesc: transactionDesc || `Payment for IEC Merchandise Order ${orderId}`
        };
        
        // Make STK Push request
        const stkResponse = await fetch(MPESA_URLS[MPESA_CONFIG.environment].stkPush, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(stkPushData)
        });
        
        const stkResult = await stkResponse.json();
        
        if (stkResult.ResponseCode === '0') {
            // Store transaction in database
            const transactionData = {
                checkout_request_id: stkResult.CheckoutRequestID,
                merchant_request_id: stkResult.MerchantRequestID,
                order_id: orderId,
                phone_number: formattedPhone,
                amount: numAmount,
                status: 'pending',
                created_at: new Date().toISOString()
            };
            
            await supabaseAdmin
                .from('mpesa_transactions')
                .insert(transactionData);
            
            return res.json({
                success: true,
                message: 'STK Push sent successfully',
                checkoutRequestId: stkResult.CheckoutRequestID,
                merchantRequestId: stkResult.MerchantRequestID
            });
        } else {
            return res.status(400).json({
                success: false,
                error: stkResult.errorMessage || 'STK Push failed',
                code: stkResult.ResponseCode
            });
        }
        
    } catch (error) {
        console.error('STK Push error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// POST /api/v1/payments/mpesa/callback - Handle M-Pesa callback
router.post('/mpesa/callback', async (req, res) => {
    try {
        console.log('M-Pesa Callback received:', JSON.stringify(req.body, null, 2));
        
        const { Body } = req.body;
        const { stkCallback } = Body;
        
        const checkoutRequestId = stkCallback.CheckoutRequestID;
        const merchantRequestId = stkCallback.MerchantRequestID;
        const resultCode = stkCallback.ResultCode;
        const resultDesc = stkCallback.ResultDesc;
        
        let transactionData = {
            checkout_request_id: checkoutRequestId,
            merchant_request_id: merchantRequestId,
            result_code: resultCode,
            result_desc: resultDesc,
            updated_at: new Date().toISOString()
        };
        
        if (resultCode === 0) {
            // Payment successful
            const callbackMetadata = stkCallback.CallbackMetadata;
            const items = callbackMetadata.Item;
            
            // Extract payment details
            const amount = items.find(item => item.Name === 'Amount')?.Value;
            const mpesaReceiptNumber = items.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
            const transactionDate = items.find(item => item.Name === 'TransactionDate')?.Value;
            const phoneNumber = items.find(item => item.Name === 'PhoneNumber')?.Value;
            
            transactionData = {
                ...transactionData,
                status: 'completed',
                mpesa_receipt_number: mpesaReceiptNumber,
                transaction_date: transactionDate,
                phone_number: phoneNumber,
                amount: amount
            };
            
            // Update transaction in database
            const { data: transaction } = await supabaseAdmin
                .from('mpesa_transactions')
                .update(transactionData)
                .eq('checkout_request_id', checkoutRequestId)
                .select('order_id')
                .single();
            
            if (transaction) {
                // Update order status to paid
                await supabaseAdmin
                    .from('merchandise_orders')
                    .update({ 
                        payment_status: 'paid',
                        payment_method: 'mpesa',
                        mpesa_receipt: mpesaReceiptNumber,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', transaction.order_id);
            }
            
        } else {
            // Payment failed
            transactionData.status = 'failed';
            
            await supabaseAdmin
                .from('mpesa_transactions')
                .update(transactionData)
                .eq('checkout_request_id', checkoutRequestId);
        }
        
        // Always respond with success to M-Pesa
        res.json({ ResultCode: 0, ResultDesc: 'Success' });
        
    } catch (error) {
        console.error('M-Pesa callback error:', error);
        res.json({ ResultCode: 1, ResultDesc: 'Error processing callback' });
    }
});

// POST /api/v1/payments/mpesa/timeout - Handle M-Pesa timeout
router.post('/mpesa/timeout', async (req, res) => {
    try {
        console.log('M-Pesa Timeout received:', JSON.stringify(req.body, null, 2));
        
        const { Body } = req.body;
        const checkoutRequestId = Body.CheckoutRequestID;
        
        // Update transaction status to timeout
        await supabaseAdmin
            .from('mpesa_transactions')
            .update({ 
                status: 'timeout',
                result_desc: 'Transaction timed out',
                updated_at: new Date().toISOString()
            })
            .eq('checkout_request_id', checkoutRequestId);
        
        res.json({ ResultCode: 0, ResultDesc: 'Success' });
        
    } catch (error) {
        console.error('M-Pesa timeout error:', error);
        res.json({ ResultCode: 1, ResultDesc: 'Error processing timeout' });
    }
});

// GET /api/v1/payments/mpesa/status/:checkoutRequestId - Check payment status
router.get('/mpesa/status/:checkoutRequestId', async (req, res) => {
    try {
        const { checkoutRequestId } = req.params;
        
        const { data: transaction, error } = await supabaseAdmin
            .from('mpesa_transactions')
            .select('*')
            .eq('checkout_request_id', checkoutRequestId)
            .single();
        
        if (error || !transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found'
            });
        }
        
        res.json({
            success: true,
            transaction: {
                status: transaction.status,
                amount: transaction.amount,
                phoneNumber: transaction.phone_number,
                mpesaReceipt: transaction.mpesa_receipt_number,
                resultDesc: transaction.result_desc
            }
        });
        
    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;