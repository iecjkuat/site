const express = require('express');
const { body, param, query } = require('express-validator');
const { supabaseAdmin: supabase } = require('../lib/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { handleValidationErrors, commonValidations, sanitizeInput } = require('../middleware/validation');

const router = express.Router();

const PAYMENT_TYPES = ['membership', 'event', 'fine', 'donation'];
const PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'cancelled', 'refunded'];
const PAYMENT_STATS_PERIODS = ['7d', '30d', '90d', '1y'];
const PRIVILEGED_ROLES = ['admin', 'treasurer'];

const buildRequestMeta = (req) => ({
  requestId: req.requestId
});

const sendSuccess = (res, req, message, data = {}, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
    ...buildRequestMeta(req)
  });
};

const sendError = (res, req, status, message, errors) => {
  const payload = {
    success: false,
    message,
    ...buildRequestMeta(req)
  };

  if (errors) {
    payload.errors = errors;
  }

  return res.status(status).json(payload);
};

const isPrivilegedUser = (req) => PRIVILEGED_ROLES.includes(req.user && req.user.role);

const resolveActorUserId = (req) => {
  const actingForUserId = req.body.actingForUserId || req.query.userId || null;

  if (!actingForUserId) {
    return req.user.id;
  }

  if (!isPrivilegedUser(req)) {
    return null;
  }

  return actingForUserId;
};

const createReferenceNumber = (prefix) => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
};

const buildPaymentQuery = () => {
  return `
    id, user_id, amount, currency, payment_type, payment_method,
    status, reference_number, transaction_id, created_at, updated_at,
    event_id, description, metadata,
    users!inner(name, email, registration_number, phone),
    events(title, start_date)
  `;
};

const canAccessPayment = (req, payment) => {
  if (!payment || !req.user) {
    return false;
  }

  if (isPrivilegedUser(req)) {
    return true;
  }

  return payment.user_id === req.user.id;
};

const fetchUserById = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('id', userId)
    .single();

  return { user: data, error };
};

const fetchPaymentById = async (paymentId) => {
  const { data, error } = await supabase
    .from('payments')
    .select(buildPaymentQuery())
    .eq('id', paymentId)
    .single();

  return { payment: data, error };
};

const paymentCreationValidators = [
  authenticateToken,
  sanitizeInput,
  body('actingForUserId')
    .optional()
    .isUUID()
    .withMessage('Valid actingForUserId is required'),
  commonValidations.amount,
  body('phoneNumber')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Valid phone number is required'),
  body('paymentType')
    .isIn(PAYMENT_TYPES)
    .withMessage('Invalid payment type'),
  body('eventId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Valid event ID required if provided'),
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be 1-500 characters')
];

router.get(
  '/',
  authenticateToken,
  [
    ...commonValidations.pagination,
    query('userId').optional().isUUID().withMessage('Invalid user ID'),
    query('status').optional().isIn(PAYMENT_STATUSES).withMessage('Invalid status'),
    query('paymentType').optional().isIn(PAYMENT_TYPES).withMessage('Invalid payment type')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId, status, paymentType, page = 1, limit = 20 } = req.query;
      const effectiveUserId = userId || req.user.id;
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);
      const offset = (pageNumber - 1) * limitNumber;

      if (userId && !isPrivilegedUser(req) && userId !== req.user.id) {
        return sendError(res, req, 403, 'Access denied to other user payments');
      }

      let paymentsQuery = supabase
        .from('payments')
        .select(`
          id, user_id, amount, currency, payment_type, payment_method,
          status, reference_number, transaction_id, created_at, updated_at,
          users!inner(name, email, registration_number),
          events(title)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limitNumber - 1);

      if (!isPrivilegedUser(req) || effectiveUserId) {
        paymentsQuery = paymentsQuery.eq('user_id', effectiveUserId);
      }

      if (status) {
        paymentsQuery = paymentsQuery.eq('status', status.toLowerCase());
      }

      if (paymentType) {
        paymentsQuery = paymentsQuery.eq('payment_type', paymentType);
      }

      const { data: payments, error, count } = await paymentsQuery;

      if (error) {
        return sendError(res, req, 500, 'Failed to fetch payments');
      }

      return sendSuccess(res, req, 'Payments retrieved successfully', {
        payments: payments || [],
        pagination: {
          current: pageNumber,
          total: Math.ceil((count || 0) / limitNumber),
          count: payments ? payments.length : 0,
          totalPayments: count || 0
        }
      });
    } catch (error) {
      return sendError(res, req, 500, 'Internal server error');
    }
  }
);

router.get(
  '/stats',
  authenticateToken,
  requireRole(PRIVILEGED_ROLES),
  [
    query('period').optional().isIn(PAYMENT_STATS_PERIODS).withMessage('Invalid period')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { period = '30d' } = req.query;

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
        totalResult,
        periodResult,
        statusResult,
        methodResult,
        typeResult
      ] = await Promise.all([
        supabase.from('payments').select('amount', { count: 'exact' }),
        supabase.from('payments').select('amount', { count: 'exact' }).gte('created_at', startDate.toISOString()),
        supabase.from('payments').select('status, amount'),
        supabase.from('payments').select('payment_method, amount'),
        supabase.from('payments').select('payment_type, amount')
      ]);

      if (totalResult.error || periodResult.error || statusResult.error || methodResult.error || typeResult.error) {
        return sendError(res, req, 500, 'Failed to fetch payment statistics');
      }

      const totalAmount = (totalResult.data || []).reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
      const periodAmount = (periodResult.data || []).reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

      const statusStats = {};
      (statusResult.data || []).forEach((payment) => {
        if (!statusStats[payment.status]) {
          statusStats[payment.status] = { count: 0, amount: 0 };
        }
        statusStats[payment.status].count += 1;
        statusStats[payment.status].amount += parseFloat(payment.amount || 0);
      });

      const methodStats = {};
      (methodResult.data || []).forEach((payment) => {
        if (!methodStats[payment.payment_method]) {
          methodStats[payment.payment_method] = { count: 0, amount: 0 };
        }
        methodStats[payment.payment_method].count += 1;
        methodStats[payment.payment_method].amount += parseFloat(payment.amount || 0);
      });

      const typeStats = {};
      (typeResult.data || []).forEach((payment) => {
        if (!typeStats[payment.payment_type]) {
          typeStats[payment.payment_type] = { count: 0, amount: 0 };
        }
        typeStats[payment.payment_type].count += 1;
        typeStats[payment.payment_type].amount += parseFloat(payment.amount || 0);
      });

      return sendSuccess(res, req, 'Payment statistics retrieved successfully', {
        total: {
          count: totalResult.count || 0,
          amount: totalAmount
        },
        period: {
          count: periodResult.count || 0,
          amount: periodAmount,
          days: period
        },
        breakdown: {
          byStatus: Object.entries(statusStats).map(([statusKey, data]) => ({
            status: statusKey,
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
      });
    } catch (error) {
      return sendError(res, req, 500, 'Internal server error');
    }
  }
);

router.get(
  '/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid payment ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { payment, error } = await fetchPaymentById(req.params.id);

      if (error || !payment) {
        return sendError(res, req, 404, 'Payment not found');
      }

      if (!canAccessPayment(req, payment)) {
        return sendError(res, req, 403, 'Access denied');
      }

      return sendSuccess(res, req, 'Payment retrieved successfully', { payment });
    } catch (error) {
      return sendError(res, req, 500, 'Internal server error');
    }
  }
);

router.post(
  '/mpesa/initiate',
  paymentCreationValidators,
  handleValidationErrors,
  async (req, res) => {
    try {
      const actorUserId = resolveActorUserId(req);

      if (!actorUserId) {
        return sendError(res, req, 403, 'Not allowed to initiate payments for another user');
      }

      const { amount, phoneNumber, paymentType, eventId, description } = req.body;

      if (!phoneNumber) {
        return sendError(res, req, 400, 'Valid phone number is required');
      }

      const { user, error: userError } = await fetchUserById(actorUserId);

      if (userError || !user) {
        return sendError(res, req, 400, 'User not found');
      }

      const insertPayload = {
        user_id: actorUserId,
        amount: parseFloat(amount),
        currency: 'KES',
        payment_type: paymentType,
        payment_method: 'mpesa',
        status: 'pending',
        event_id: eventId || null,
        description: description || `${paymentType} payment`,
        reference_number: createReferenceNumber('PAY'),
        metadata: {
          phoneNumber,
          initiatedAt: new Date().toISOString(),
          initiatedBy: req.user.id
        }
      };

      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert(insertPayload)
        .select('id, user_id, amount, currency, payment_type, status, reference_number, metadata')
        .single();

      if (paymentError || !payment) {
        return sendError(res, req, 500, 'Failed to create payment record');
      }

      const mpesaResponse = {
        MerchantRequestID: `MERCHANT-${Date.now()}`,
        CheckoutRequestID: `CHECKOUT-${Date.now()}`,
        ResponseCode: '0',
        ResponseDescription: 'Request accepted for processing',
        CustomerMessage: 'Please complete the payment on your phone'
      };

      await supabase
        .from('payments')
        .update({
          transaction_id: mpesaResponse.CheckoutRequestID,
          metadata: {
            ...(payment.metadata || {}),
            mpesaRequest: mpesaResponse
          }
        })
        .eq('id', payment.id);

      return sendSuccess(
        res,
        req,
        'M-Pesa payment initiated successfully',
        {
          payment: {
            id: payment.id,
            userId: payment.user_id,
            referenceNumber: payment.reference_number,
            amount: payment.amount,
            status: payment.status
          },
          mpesaResponse,
          instructions: 'Please check your phone for the M-Pesa prompt and complete the transaction.'
        },
        201
      );
    } catch (error) {
      return sendError(res, req, 500, 'Internal server error');
    }
  }
);

router.post(
  '/card/process',
  [
    ...paymentCreationValidators,
    body('cardDetails').isObject().withMessage('Card details are required'),
    body('cardDetails.cardNumber')
      .isString()
      .trim()
      .isLength({ min: 12, max: 19 })
      .withMessage('Valid card number is required'),
    body('cardDetails.expiryMonth')
      .isInt({ min: 1, max: 12 })
      .withMessage('Valid expiry month is required'),
    body('cardDetails.expiryYear')
      .isInt({ min: new Date().getFullYear(), max: new Date().getFullYear() + 20 })
      .withMessage('Valid expiry year is required'),
    body('cardDetails.cvv')
      .isString()
      .trim()
      .isLength({ min: 3, max: 4 })
      .withMessage('Valid CVV is required'),
    body('cardDetails.cardholderName')
      .isString()
      .trim()
      .isLength({ min: 2, max: 120 })
      .withMessage('Cardholder name is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const actorUserId = resolveActorUserId(req);

      if (!actorUserId) {
        return sendError(res, req, 403, 'Not allowed to process payments for another user');
      }

      const { amount, paymentType, cardDetails, eventId, description } = req.body;
      const { cardNumber, cardholderName } = cardDetails;

      const { user, error: userError } = await fetchUserById(actorUserId);

      if (userError || !user) {
        return sendError(res, req, 400, 'User not found');
      }

      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: actorUserId,
          amount: parseFloat(amount),
          currency: 'KES',
          payment_type: paymentType,
          payment_method: 'card',
          status: 'pending',
          event_id: eventId || null,
          description: description || `${paymentType} payment`,
          reference_number: createReferenceNumber('CARD'),
          metadata: {
            maskedCardNumber: `****-****-****-${String(cardNumber).slice(-4)}`,
            cardholderName,
            initiatedBy: req.user.id
          }
        })
        .select('id, user_id, amount, currency, payment_type, payment_method, status, reference_number, metadata, event_id')
        .single();

      if (paymentError || !payment) {
        return sendError(res, req, 500, 'Failed to create payment record');
      }

      const cardResponse = {
        transactionId: `TXN-${Date.now()}`,
        responseCode: '00',
        responseMessage: 'Transaction Approved',
        authCode: `AUTH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        maskedCardNumber: `****-****-****-${String(cardNumber).slice(-4)}`
      };

      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          transaction_id: cardResponse.transactionId,
          metadata: {
            ...(payment.metadata || {}),
            cardResponse
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id)
        .select(buildPaymentQuery())
        .single();

      if (updateError || !updatedPayment) {
        return sendError(res, req, 500, 'Failed to finalize payment');
      }

      if (eventId) {
        await supabase
          .from('event_attendees')
          .update({ payment_status: 'paid' })
          .eq('event_id', eventId)
          .eq('user_id', actorUserId)
          .eq('payment_status', 'pending');
      }

      return sendSuccess(res, req, 'Payment processed successfully', {
        payment: updatedPayment,
        receipt: {
          transactionId: cardResponse.transactionId,
          authCode: cardResponse.authCode,
          amount: updatedPayment.amount,
          currency: updatedPayment.currency,
          timestamp: updatedPayment.updated_at
        }
      });
    } catch (error) {
      return sendError(res, req, 500, 'Internal server error');
    }
  }
);

router.get(
  '/mpesa/status/:paymentId',
  authenticateToken,
  [
    param('paymentId').isUUID().withMessage('Invalid payment ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { payment, error } = await fetchPaymentById(req.params.paymentId);

      if (error || !payment) {
        return sendError(res, req, 404, 'Payment not found');
      }

      if (!canAccessPayment(req, payment)) {
        return sendError(res, req, 403, 'Access denied');
      }

      if (payment.payment_method !== 'mpesa') {
        return sendError(res, req, 400, 'Not an M-Pesa payment');
      }

      return sendSuccess(res, req, 'Payment status retrieved successfully', {
        payment: {
          id: payment.id,
          userId: payment.user_id,
          amount: payment.amount,
          status: payment.status,
          paymentMethod: payment.payment_method,
          transactionId: payment.transaction_id,
          updatedAt: payment.updated_at
        }
      });
    } catch (error) {
      return sendError(res, req, 500, 'Internal server error');
    }
  }
);

router.get(
  '/:id/receipt',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid payment ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { payment, error } = await fetchPaymentById(req.params.id);

      if (error || !payment) {
        return sendError(res, req, 404, 'Payment not found');
      }

      if (!canAccessPayment(req, payment)) {
        return sendError(res, req, 403, 'Access denied');
      }

      if (payment.status !== 'completed' && payment.status !== 'refunded') {
        return sendError(res, req, 400, 'Receipt is only available for completed payments');
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
        payer: payment.users ? {
          name: payment.users.name,
          email: payment.users.email,
          registrationNumber: payment.users.registration_number
        } : null,
        payee: {
          name: 'JKUAT Innovation and Entrepreneurship Club',
          shortName: 'JKUAT Innovation Club',
          email: 'info@jkuatinnovation.ac.ke'
        },
        ...(payment.events ? {
          event: {
            title: payment.events.title,
            date: payment.events.start_date
          }
        } : {})
      };

      return sendSuccess(res, req, 'Receipt generated successfully', { receipt });
    } catch (error) {
      return sendError(res, req, 500, 'Internal server error');
    }
  }
);

router.post(
  '/:id/refund',
  authenticateToken,
  requireRole(['admin']),
  [
    param('id').isUUID().withMessage('Invalid payment ID'),
    body('reason').isString().trim().notEmpty().withMessage('Refund reason is required'),
    body('amount').optional().isFloat({ min: 0.01 }).withMessage('Valid refund amount required if provided')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason, amount } = req.body;

      const { payment, error } = await fetchPaymentById(id);

      if (error || !payment) {
        return sendError(res, req, 404, 'Payment not found');
      }

      if (payment.status !== 'completed') {
        return sendError(res, req, 400, 'Can only refund completed payments');
      }

      const refundAmount = amount ? parseFloat(amount) : parseFloat(payment.amount);

      if (refundAmount > parseFloat(payment.amount)) {
        return sendError(res, req, 400, 'Refund amount cannot exceed original payment');
      }

      const refundDetails = {
        amount: refundAmount,
        reason,
        processedAt: new Date().toISOString(),
        processedBy: req.user.id,
        refundId: createReferenceNumber('REF')
      };

      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'refunded',
          metadata: {
            ...(payment.metadata || {}),
            refund: refundDetails
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(buildPaymentQuery())
        .single();

      if (updateError || !updatedPayment) {
        return sendError(res, req, 500, 'Failed to process refund');
      }

      return sendSuccess(res, req, 'Refund processed successfully', {
        payment: updatedPayment,
        refund: refundDetails
      });
    } catch (error) {
      return sendError(res, req, 500, 'Internal server error');
    }
  }
);

module.exports = router;