-- Merchandise Orders Table (create first)
CREATE TABLE IF NOT EXISTS merchandise_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_reg_no VARCHAR(50),
    customer_phone VARCHAR(15) NOT NULL,
    customer_email VARCHAR(255),
    delivery_location VARCHAR(255) NOT NULL,
    items JSONB NOT NULL,
    total_amount INTEGER NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method VARCHAR(20),
    mpesa_receipt VARCHAR(255),
    order_status VARCHAR(20) DEFAULT 'processing' CHECK (order_status IN ('processing', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- M-Pesa Transactions Table (create after orders table)
CREATE TABLE IF NOT EXISTS mpesa_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    checkout_request_id VARCHAR(255) UNIQUE NOT NULL,
    merchant_request_id VARCHAR(255) NOT NULL,
    order_id UUID REFERENCES merchandise_orders(id),
    phone_number VARCHAR(15) NOT NULL,
    amount INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'timeout')),
    mpesa_receipt_number VARCHAR(255),
    transaction_date BIGINT,
    result_code INTEGER,
    result_desc TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_checkout_request_id ON mpesa_transactions(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_order_id ON mpesa_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_status ON mpesa_transactions(status);
CREATE INDEX IF NOT EXISTS idx_merchandise_orders_payment_status ON merchandise_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_merchandise_orders_customer_phone ON merchandise_orders(customer_phone);

-- Row Level Security (RLS) policies
ALTER TABLE mpesa_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchandise_orders ENABLE ROW LEVEL SECURITY;

-- Policy for admin access to transactions
CREATE POLICY "Admin can view all transactions" ON mpesa_transactions
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Policy for admin access to orders
CREATE POLICY "Admin can manage all orders" ON merchandise_orders
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Policy for customers to view their own orders (by phone number)
CREATE POLICY "Customers can view own orders" ON merchandise_orders
    FOR SELECT USING (customer_phone = current_setting('request.jwt.claims', true)::json ->> 'phone');