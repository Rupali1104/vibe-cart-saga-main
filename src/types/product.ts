export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number;
  created_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  session_id: string;
  product?: Product;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  total: number;
  items: CartItem[];
  created_at: string;
}
