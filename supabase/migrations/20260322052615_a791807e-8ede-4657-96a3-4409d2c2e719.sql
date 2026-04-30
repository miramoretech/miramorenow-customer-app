ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS password text;
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.riders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_jobs;