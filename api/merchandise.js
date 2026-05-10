'use strict';

/**
 * Merchandise Orders API
 * Handles order creation and management
 */

const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../lib/supabase');

// POST /api/v1/merchandise/orders - Create new order
router.post('/orders', async (req, res) => {
    try {
        const {
            customerName,
            customerRegNo,
            customerPhone,
            customerEmail,
            deliveryLocation,
            items,
            totalAmount
        } = req.body;

        // Validate required fields
        if (!customerName || !customerPhone || !deliveryLocation || !items || !totalAmount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Validate items array
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Items must be a non-empty array'
            });
        }

        // Validate total amount
        if (typeof totalAmount !== 'number' || totalAmount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Total amount must be a positive number'
            });
        }

        // Create order
        const orderData = {
            customer_name: customerName,
            customer_reg_no: customerRegNo || null,
            customer_phone: customerPhone,
            customer_email: customerEmail || null,
            delivery_location: deliveryLocation,
            items: items,
            total_amount: totalAmount,
            payment_status: 'pending',
            order_status: 'processing',
            created_at: new Date().toISOString()
        };

        const { data: order, error } = await supabaseAdmin
            .from('merchandise_orders')
            .insert(orderData)
            .select('id')
            .single();

        if (error) {
            console.error('Order creation error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to create order'
            });
        }

        res.status(201).json({
            success: true,
            orderId: order.id,
            message: 'Order created successfully'
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// GET /api/v1/merchandise/orders/:id - Get order by ID
router.get('/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: order, error } = await supabaseAdmin
            .from('merchandise_orders')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        res.json({
            success: true,
            order: order
        });

    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// PUT /api/v1/merchandise/orders/:id/status - Update order status
router.put('/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }

        const { data: order, error } = await supabaseAdmin
            .from('merchandise_orders')
            .update({ 
                order_status: status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select('*')
            .single();

        if (error || !order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        res.json({
            success: true,
            order: order
        });

    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// GET /api/v1/merchandise/orders - Get orders (with pagination)
router.get('/orders', async (req, res) => {
    try {
        const { page = 1, limit = 10, status, phone } = req.query;
        const offset = (page - 1) * limit;

        let query = supabaseAdmin
            .from('merchandise_orders')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (status) {
            query = query.eq('order_status', status);
        }

        if (phone) {
            query = query.eq('customer_phone', phone);
        }

        const { data: orders, error, count } = await query;

        if (error) {
            console.error('Get orders error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch orders'
            });
        }

        res.json({
            success: true,
            orders: orders || [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;