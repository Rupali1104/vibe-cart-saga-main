-- Fix search path for the update_updated_at_column function
-- First drop the trigger
DROP TRIGGER IF EXISTS update_cart_items_updated_at ON public.cart_items;

-- Then drop and recreate the function with proper search_path
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER 
   SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();