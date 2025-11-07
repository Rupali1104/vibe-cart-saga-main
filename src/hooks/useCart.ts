import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CartItem, Product } from '@/types/product';
import { toast } from 'sonner';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string>('');

  // Generate or retrieve session ID
  useEffect(() => {
    let sid = localStorage.getItem('cart_session_id');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('cart_session_id', sid);
    }
    setSessionId(sid);
  }, []);

  // Fetch cart items
  const fetchCart = async () => {
    if (!sessionId) return;
    
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('session_id', sessionId);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchCart();
    }
  }, [sessionId]);

  // Add to cart
  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      // Check if item already exists
      const existingItem = cartItems.find(item => item.product_id === product.id);

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Add new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            product_id: product.id,
            quantity,
            session_id: sessionId
          });

        if (error) throw error;
      }

      await fetchCart();
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  // Update quantity
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  // Remove from cart
  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      await fetchCart();
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('session_id', sessionId);

      if (error) throw error;
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  // Calculate total
  const total = cartItems.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  return {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    total,
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
  };
};
