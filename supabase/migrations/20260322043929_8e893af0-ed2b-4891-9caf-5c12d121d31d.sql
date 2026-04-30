
-- Enums
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');
CREATE TYPE public.order_category AS ENUM ('food', 'gas', 'fashion', 'pharmacy');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed');
CREATE TYPE public.delivery_status AS ENUM ('assigned', 'picked_up', 'delivered');
CREATE TYPE public.payout_status AS ENUM ('pending', 'paid');

-- Customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_orders INT NOT NULL DEFAULT 0,
  last_order_at TIMESTAMP WITH TIME ZONE
);

-- Vendors table
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category order_category NOT NULL DEFAULT 'food',
  phone TEXT,
  email TEXT,
  address TEXT,
  commission_rate DECIMAL NOT NULL DEFAULT 12,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Riders table
CREATE TABLE public.riders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  vehicle_type TEXT,
  license_plate TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_deliveries INT NOT NULL DEFAULT 0,
  wallet_balance DECIMAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  rider_id UUID REFERENCES public.riders(id) ON DELETE SET NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total_amount DECIMAL NOT NULL DEFAULT 0,
  delivery_fee DECIMAL NOT NULL DEFAULT 500,
  status order_status NOT NULL DEFAULT 'pending',
  category order_category NOT NULL DEFAULT 'food',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT NOT NULL DEFAULT 'card',
  payment_status payment_status NOT NULL DEFAULT 'pending'
);

-- Delivery jobs table
CREATE TABLE public.delivery_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  rider_id UUID REFERENCES public.riders(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  picked_up_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  earnings DECIMAL NOT NULL DEFAULT 0,
  status delivery_status NOT NULL DEFAULT 'assigned'
);

-- Payouts table
CREATE TABLE public.payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rider_id UUID REFERENCES public.riders(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  status payout_status NOT NULL DEFAULT 'pending'
);

-- Admin settings table
CREATE TABLE public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Allow anon read/write for admin dashboard (since we use simple auth)
CREATE POLICY "Allow all access for anon" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for anon" ON public.vendors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for anon" ON public.riders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for anon" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for anon" ON public.delivery_jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for anon" ON public.payouts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for anon" ON public.admin_settings FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
