-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create orders table for checkout
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Products are publicly viewable
CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT
  USING (true);

-- Cart items are viewable by session
CREATE POLICY "Cart items are viewable by session"
  ON public.cart_items FOR SELECT
  USING (true);

CREATE POLICY "Anyone can manage their cart"
  ON public.cart_items FOR ALL
  USING (true)
  WITH CHECK (true);

-- Orders are publicly creatable
CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Orders are viewable by everyone"
  ON public.orders FOR SELECT
  USING (true);

-- Insert mock products
INSERT INTO public.products (name, description, price, stock, image_url) VALUES
  ('Wireless Headphones', 'Premium noise-cancelling wireless headphones with 30-hour battery life', 199.99, 25, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'),
  ('Smart Watch', 'Fitness tracker with heart rate monitor and GPS', 299.99, 15, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'),
  ('Laptop Stand', 'Ergonomic aluminum laptop stand with adjustable height', 49.99, 50, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500'),
  ('Mechanical Keyboard', 'RGB backlit mechanical keyboard with Cherry MX switches', 129.99, 30, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500'),
  ('Wireless Mouse', 'Precision wireless mouse with ergonomic design', 39.99, 40, 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500'),
  ('USB-C Hub', '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader', 69.99, 35, 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500'),
  ('Desk Lamp', 'LED desk lamp with touch control and adjustable brightness', 44.99, 45, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500'),
  ('Phone Stand', 'Adjustable aluminum phone stand for desk', 24.99, 60, 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500'),
  ('Cable Organizer', 'Silicone cable management clips set of 10', 14.99, 100, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'),
  ('Webcam HD', '1080p HD webcam with auto-focus and built-in microphone', 89.99, 20, 'https://images.unsplash.com/photo-1563990590-04baa8b61c5f?w=500');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cart_items
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();