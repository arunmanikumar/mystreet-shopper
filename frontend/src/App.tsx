import { useEffect, useMemo, useState } from 'react';
import { Catalog } from './components/Catalog';
import { CartPanel } from './components/CartPanel';
import { fetchSneakers, checkoutCart } from './api/sneakerApi';
import type { CartItem, CheckoutRequest, Sneaker } from './types';

function App() {
  const [sneakers, setSneakers] = useState<Sneaker[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutMessage, setCheckoutMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSneakers().then(setSneakers).catch(() => setSneakers([]));
  }, []);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.sneaker.price * item.quantity, 0),
    [cart]
  );

  const addToCart = (sneaker: Sneaker) => {
    setCart((current) => {
      const existing = current.find((item) => item.sneaker.id === sneaker.id);
      if (existing) {
        return current.map((item) =>
          item.sneaker.id === sneaker.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { sneaker, quantity: 1 }];
    });
  };

  const updateQuantity = (sneakerId: number, quantity: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.sneaker.id === sneakerId ? { ...item, quantity } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setCheckoutMessage('Add at least one item to cart.');
      return;
    }

    setIsSubmitting(true);
    setCheckoutMessage('');

    const payload: CheckoutRequest = {
      items: cart.map((item) => ({ sneakerId: item.sneaker.id, quantity: item.quantity })),
    };

    try {
      const result = await checkoutCart(payload);
      setCart([]);
      setCheckoutMessage(`Order ${result.orderId} received. Total: $${result.total.toFixed(2)}`);
    } catch (error) {
      setCheckoutMessage(error instanceof Error ? error.message : 'Checkout failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">MyStreet Shoppers</p>
          <h1>Find your next sneaker</h1>
          <p>Browse the latest sneakers, add favorites to your cart, and checkout locally.</p>
        </div>
      </header>

      <main>
        <Catalog sneakers={sneakers} onAddToCart={addToCart} />
        <CartPanel
          cart={cart}
          total={total}
          isSubmitting={isSubmitting}
          message={checkoutMessage}
          onUpdateQuantity={updateQuantity}
          onCheckout={handleCheckout}
        />
      </main>
    </div>
  );
}

export default App;
