import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CheckoutModal = ({ open, onOpenChange }: CheckoutModalProps) => {
  const { cartItems, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create order
      const { data, error } = await supabase
        .from('orders')
        .insert({
          customer_name: formData.name,
          customer_email: formData.email,
          total: total,
          items: cartItems as any
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Failed to create order');

      setOrderId(data.id);
      setOrderComplete(true);
      await clearCart();
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOrderComplete(false);
    setFormData({ name: '', email: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {orderComplete ? 'Order Confirmed!' : 'Checkout'}
          </DialogTitle>
        </DialogHeader>

        {orderComplete ? (
          <div className="text-center py-6">
            <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Thank you for your order!</h3>
            <p className="text-muted-foreground mb-4">
              Order ID: <span className="font-mono text-sm">{orderId.slice(0, 8)}</span>
            </p>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-semibold">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items:</span>
                <span className="font-semibold">{cartItems.length}</span>
              </div>
            </div>
            <Button onClick={handleClose} className="w-full">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="john@example.com"
              />
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading} size="lg">
              {loading ? 'Processing...' : 'Place Order'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
