import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { fetchSneakers, checkoutCart } from './api/sneakerApi';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RegisterPage } from './pages/RegisterPage';
import type { CartItem, Sneaker } from './types';

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
    [cart],
  );

  const addToCart = (sneaker: Sneaker) => {
    setCart((current) => {
      const existing = current.find((item) => item.sneaker.id === sneaker.id);
      if (existing) {
        return current.map((item) =>
          item.sneaker.id === sneaker.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [...current, { sneaker, quantity: 1 }];
    });
  };

  const updateQuantity = (sneakerId: number, quantity: number) => {
    setCart((current) =>
      current
        .map((item) => (item.sneaker.id === sneakerId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setCheckoutMessage('Add at least one item to cart.');
      return;
    }

    setIsSubmitting(true);
    setCheckoutMessage('');

    try {
      const result = await checkoutCart(cart);
      setCart([]);
      setCheckoutMessage(`Order ${result.orderId} received. Total: $${result.total.toFixed(2)}`);
    } catch (error) {
      setCheckoutMessage(error instanceof Error ? error.message : 'Checkout failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route
              path="/"
              element={
                <HomePage
                  sneakers={sneakers}
                  cart={cart}
                  total={total}
                  isSubmitting={isSubmitting}
                  checkoutMessage={checkoutMessage}
                  onAddToCart={addToCart}
                  onUpdateQuantity={updateQuantity}
                  onCheckout={handleCheckout}
                />
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
