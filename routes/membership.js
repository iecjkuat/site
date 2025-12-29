const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../lib/supabase');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user details from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, membership_status')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ message: 'Invalid token' });
  }
};

// Get membership status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id, name, email, membership_status, created_at,
        registration_number, course, year_of_study, college
      `)
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch membership status' });
    }

    // Check for membership payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, status, amount, created_at')
      .eq('user_id', req.user.id)
      .eq('payment_type', 'membership')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Calculate membership expiry (1 year from payment or registration)
    const membershipDate = payment?.created_at || user.created_at;
    const expiryDate = new Date(membershipDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    // Check if membership has expired
    const isExpired = new Date() > expiryDate;
    let actualStatus = user.membership_status;
    
    if (isExpired && actualStatus === 'active') {
      actualStatus = 'expired';
      // Update status in database
      await supabase
        .from('users')
        .update({ membership_status: 'expired' })
        .eq('id', req.user.id);
    }

    const membershipData = {
      status: actualStatus,
      paymentStatus: payment?.status || 'pending',
      membershipFee: 500, // KSh 500
      paymentDate: payment?.created_at,
      expiryDate: expiryDate.toISOString(),
      isExpired,
      membershipCard: actualStatus === 'active' ? {
        available: true,
        generatedAt: payment?.created_at
      } : null,
      user: {
        name: user.name,
        email: user.email,
        registrationNumber: user.registration_number,
        course: user.course,
        yearOfStudy: user.year_of_study,
        college: user.college
      }
    };

    res.json(membershipData);

  } catch (error) {
    console.error('Membership status error:', error);
    res.status(500).json({ message: 'Server error while fetching membership status' });
  }
});

// Initiate membership payment
router.post('/pay', authenticateToken, [
  body('paymentMethod').isIn(['mpesa', 'card', 'bank']).withMessage('Valid payment method required'),
  body('phoneNumber').optional().isMobilePhone().withMessage('Valid phone number required for M-Pesa')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentMethod, phoneNumber } = req.body;
    const membershipFee = 500; // KSh 500

    // Check if user already has active membership
    if (req.user.membership_status === 'active') {
      return res.status(400).json({ message: 'Membership is already active' });
    }

    // Check for existing pending payment
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, status')
      .eq('user_id', req.user.id)
      .eq('payment_type', 'membership')
      .eq('status', 'pending')
      .single();

    if (existingPayment) {
      return res.status(400).json({ 
        message: 'You already have a pending membership payment',
        paymentId: existingPayment.id
      });
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: req.user.id,
        amount: membershipFee,
        currency: 'KES',
        payment_type: 'membership',
        payment_method: paymentMethod.toUpperCase(),
        status: 'pending',
        description: 'JKUAT Innovation Club Membership Fee',
        reference_number: `MEM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        metadata: {
          phoneNumber: phoneNumber || null,
          membershipYear: new Date().getFullYear()
        }
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      return res.status(500).json({ message: 'Failed to create payment record' });
    }

    // Simulate payment processing based on method
    let paymentResponse = {};
    
    if (paymentMethod === 'mpesa') {
      // Simulate M-Pesa STK Push
      paymentResponse = {
        type: 'mpesa',
        checkoutRequestId: `CHECKOUT-${Date.now()}`,
        merchantRequestId: `MERCHANT-${Date.now()}`,
        responseCode: '0',
        responseDescription: 'Success. Request accepted for processing',
        customerMessage: 'Success. Request accepted for processing'
      };
    } else if (paymentMethod === 'card') {
      // For card payments, redirect to payment gateway would happen here
      paymentResponse = {
        type: 'card',
        redirectUrl: `/payment/card/${payment.id}`,
        sessionId: `SESSION-${Date.now()}`
      };
    } else if (paymentMethod === 'bank') {
      // For bank transfer, provide bank details
      paymentResponse = {
        type: 'bank',
        bankDetails: {
          accountName: 'JKUAT Innovation and Entrepreneurship Club',
          accountNumber: '1234567890',
          bankName: 'KCB Bank',
          branchCode: '001',
          swiftCode: 'KCBLKENX'
        },
        reference: payment.reference_number
      };
    }

    res.status(201).json({
      message: 'Membership payment initiated successfully',
      payment: {
        id: payment.id,
        referenceNumber: payment.reference_number,
        amount: payment.amount,
        status: payment.status,
        method: paymentMethod
      },
      paymentResponse,
      instructions: this.getPaymentInstructions(paymentMethod)
    });

  } catch (error) {
    console.error('Membership payment error:', error);
    res.status(500).json({ message: 'Server error while initiating payment' });
  }
});

// Process membership payment completion (webhook simulation)
router.post('/payment/complete', [
  body('paymentId').isUUID().withMessage('Valid payment ID required'),
  body('transactionId').notEmpty().withMessage('Transaction ID required'),
  body('status').isIn(['completed', 'failed']).withMessage('Valid status required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentId, transactionId, status } = req.body;

    // Update payment status
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: status,
        transaction_id: transactionId,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select('user_id, amount')
      .single();

    if (paymentError) {
      return res.status(500).json({ message: 'Failed to update payment status' });
    }

    // If payment completed, activate membership
    if (status === 'completed') {
      const { error: userError } = await supabase
        .from('users')
        .update({
          membership_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.user_id);

      if (userError) {
        console.error('User status update error:', userError);
      }

      // Send membership confirmation (in production, send email)
      console.log(`Membership activated for user ${payment.user_id}`);
    }

    res.json({
      message: `Payment ${status} successfully`,
      payment: {
        id: paymentId,
        status,
        transactionId
      }
    });

  } catch (error) {
    console.error('Payment completion error:', error);
    res.status(500).json({ message: 'Server error while completing payment' });
  }
});

// Generate membership card/certificate
router.post('/card/generate', authenticateToken, async (req, res) => {
  try {
    // Check if user has active membership
    if (req.user.membership_status !== 'active') {
      return res.status(400).json({ message: 'Active membership required to generate card' });
    }

    // Get user details
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        name, email, registration_number, course, year_of_study, 
        college, created_at, phone
      `)
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch user details' });
    }

    // Get membership payment details
    const { data: payment } = await supabase
      .from('payments')
      .select('created_at, reference_number')
      .eq('user_id', req.user.id)
      .eq('payment_type', 'membership')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Generate membership card PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="JKUAT-Innovation-Club-Membership-Card.pdf"');
    
    // Pipe PDF to response
    doc.pipe(res);

    // Add club logo and header
    doc.fontSize(24)
       .fillColor('#10b981')
       .text('JKUAT INNOVATION AND ENTREPRENEURSHIP CLUB', 50, 50, { align: 'center' });

    doc.fontSize(18)
       .fillColor('#333')
       .text('MEMBERSHIP CERTIFICATE', 50, 100, { align: 'center' });

    // Add decorative line
    doc.moveTo(50, 130)
       .lineTo(550, 130)
       .strokeColor('#10b981')
       .lineWidth(2)
       .stroke();

    // Member information
    doc.fontSize(14)
       .fillColor('#333')
       .text('This is to certify that', 50, 180, { align: 'center' });

    doc.fontSize(20)
       .fillColor('#10b981')
       .text(user.name.toUpperCase(), 50, 210, { align: 'center' });

    doc.fontSize(14)
       .fillColor('#333')
       .text('is a registered member of the JKUAT Innovation and Entrepreneurship Club', 50, 250, { align: 'center' });

    // Member details
    const membershipDate = payment?.created_at || user.created_at;
    const expiryDate = new Date(membershipDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    doc.fontSize(12)
       .fillColor('#666')
       .text(`Registration Number: ${user.registration_number}`, 50, 320)
       .text(`Course: ${user.course}`, 50, 340)
       .text(`Year of Study: ${user.year_of_study}`, 50, 360)
       .text(`College: ${user.college}`, 50, 380)
       .text(`Membership Date: ${new Date(membershipDate).toLocaleDateString()}`, 50, 400)
       .text(`Valid Until: ${expiryDate.toLocaleDateString()}`, 50, 420);

    // Generate QR code for verification
    const qrData = JSON.stringify({
      memberId: req.user.id,
      name: user.name,
      regNumber: user.registration_number,
      membershipDate: membershipDate,
      expiryDate: expiryDate.toISOString()
    });

    try {
      const qrCodeDataURL = await QRCode.toDataURL(qrData);
      const qrCodeBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
      doc.image(qrCodeBuffer, 450, 320, { width: 100, height: 100 });
      
      doc.fontSize(10)
         .fillColor('#666')
         .text('Scan QR code to verify', 450, 430, { width: 100, align: 'center' });
    } catch (qrError) {
      console.error('QR code generation error:', qrError);
    }

    // Add footer
    doc.fontSize(10)
       .fillColor('#999')
       .text('This certificate is valid for one academic year from the membership date.', 50, 500, { align: 'center' })
       .text('For verification, contact: info@jkuatinnovation.ac.ke', 50, 520, { align: 'center' });

    // Add signature area
    doc.fontSize(12)
       .fillColor('#333')
       .text('_____________________', 100, 600)
       .text('Club Secretary', 100, 620, { align: 'center' })
       .text('_____________________', 400, 600)
       .text('Club President', 400, 620, { align: 'center' });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Membership card generation error:', error);
    res.status(500).json({ message: 'Server error while generating membership card' });
  }
});

// Renew membership
router.post('/renew', authenticateToken, async (req, res) => {
  try {
    // Check if membership is expired or about to expire
    const { data: user, error } = await supabase
      .from('users')
      .select('membership_status, created_at')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch user details' });
    }

    if (user.membership_status === 'active') {
      // Check if membership is about to expire (within 30 days)
      const { data: payment } = await supabase
        .from('payments')
        .select('created_at')
        .eq('user_id', req.user.id)
        .eq('payment_type', 'membership')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const membershipDate = payment?.created_at || user.created_at;
      const expiryDate = new Date(membershipDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      
      const daysUntilExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry > 30) {
        return res.status(400).json({ 
          message: `Membership is still active for ${daysUntilExpiry} days. Renewal available 30 days before expiry.` 
        });
      }
    }

    // Create renewal payment record
    const { data: renewalPayment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: req.user.id,
        amount: 500, // Same fee for renewal
        currency: 'KES',
        payment_type: 'renewal',
        payment_method: 'PENDING', // Will be updated when payment method is selected
        status: 'pending',
        description: 'JKUAT Innovation Club Membership Renewal',
        reference_number: `REN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        metadata: {
          renewalYear: new Date().getFullYear(),
          previousStatus: user.membership_status
        }
      })
      .select()
      .single();

    if (paymentError) {
      return res.status(500).json({ message: 'Failed to create renewal payment' });
    }

    res.json({
      message: 'Membership renewal initiated successfully',
      renewal: {
        id: renewalPayment.id,
        referenceNumber: renewalPayment.reference_number,
        amount: renewalPayment.amount,
        status: renewalPayment.status
      }
    });

  } catch (error) {
    console.error('Membership renewal error:', error);
    res.status(500).json({ message: 'Server error while initiating renewal' });
  }
});

// Get member directory (public members who opted in)
router.get('/directory', async (req, res) => {
  try {
    const { search, course, year, college, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('users')
      .select(`
        id, name, registration_number, course, year_of_study, 
        college, created_at
      `)
      .eq('membership_status', 'active')
      .order('name', { ascending: true });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,course.ilike.%${search}%,registration_number.ilike.%${search}%`);
    }
    
    if (course) {
      query = query.ilike('course', `%${course}%`);
    }
    
    if (year) {
      query = query.eq('year_of_study', parseInt(year));
    }
    
    if (college) {
      query = query.ilike('college', `%${college}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: members, error, count } = await query;

    if (error) {
      console.error('Directory fetch error:', error);
      return res.status(500).json({ message: 'Failed to fetch member directory' });
    }

    // Get unique values for filters
    const { data: filterData } = await supabase
      .from('users')
      .select('course, year_of_study, college')
      .eq('membership_status', 'active');

    const filters = {
      courses: [...new Set(filterData?.map(m => m.course).filter(Boolean))],
      years: [...new Set(filterData?.map(m => m.year_of_study).filter(Boolean))].sort(),
      colleges: [...new Set(filterData?.map(m => m.college).filter(Boolean))]
    };

    res.json({
      members: members || [],
      filters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Member directory error:', error);
    res.status(500).json({ message: 'Server error while fetching member directory' });
  }
});

// Get membership statistics (admin only)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    if (!['admin', 'executive'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const [
      totalMembers,
      activeMembers,
      pendingMembers,
      expiredMembers,
      recentPayments,
      monthlyStats
    ] = await Promise.all([
      // Total members
      supabase.from('users').select('id', { count: 'exact' }),
      
      // Active members
      supabase.from('users').select('id', { count: 'exact' }).eq('membership_status', 'active'),
      
      // Pending members
      supabase.from('users').select('id', { count: 'exact' }).eq('membership_status', 'pending'),
      
      // Expired members
      supabase.from('users').select('id', { count: 'exact' }).eq('membership_status', 'expired'),
      
      // Recent payments (last 30 days)
      supabase
        .from('payments')
        .select('amount', { count: 'exact' })
        .eq('payment_type', 'membership')
        .eq('status', 'completed')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      
      // Monthly membership stats
      supabase
        .from('payments')
        .select('created_at, amount')
        .eq('payment_type', 'membership')
        .eq('status', 'completed')
        .gte('created_at', new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    const stats = {
      members: {
        total: totalMembers.count || 0,
        active: activeMembers.count || 0,
        pending: pendingMembers.count || 0,
        expired: expiredMembers.count || 0
      },
      revenue: {
        recent: recentPayments.data?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0,
        recentCount: recentPayments.count || 0
      },
      growth: this.calculateGrowthStats(monthlyStats.data || [])
    };

    res.json(stats);

  } catch (error) {
    console.error('Membership stats error:', error);
    res.status(500).json({ message: 'Server error while fetching membership statistics' });
  }
});

// Helper function to get payment instructions
function getPaymentInstructions(method) {
  const instructions = {
    mpesa: 'Please check your phone for the M-Pesa prompt and enter your PIN to complete the payment.',
    card: 'You will be redirected to our secure payment gateway to complete your card payment.',
    bank: 'Please transfer the amount to the provided bank account and use the reference number provided.'
  };
  return instructions[method] || 'Please follow the payment instructions provided.';
}

// Helper function to calculate growth statistics
function calculateGrowthStats(payments) {
  const monthlyData = {};
  
  payments.forEach(payment => {
    const month = new Date(payment.created_at).toISOString().slice(0, 7); // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { count: 0, revenue: 0 };
    }
    monthlyData[month].count++;
    monthlyData[month].revenue += parseFloat(payment.amount);
  });

  const months = Object.keys(monthlyData).sort();
  const currentMonth = months[months.length - 1];
  const previousMonth = months[months.length - 2];

  if (!currentMonth || !previousMonth) {
    return { memberGrowth: 0, revenueGrowth: 0 };
  }

  const currentData = monthlyData[currentMonth];
  const previousData = monthlyData[previousMonth];

  const memberGrowth = previousData.count > 0 
    ? ((currentData.count - previousData.count) / previousData.count) * 100 
    : 0;

  const revenueGrowth = previousData.revenue > 0 
    ? ((currentData.revenue - previousData.revenue) / previousData.revenue) * 100 
    : 0;

  return {
    memberGrowth: Math.round(memberGrowth * 100) / 100,
    revenueGrowth: Math.round(revenueGrowth * 100) / 100
  };
}

module.exports = router;