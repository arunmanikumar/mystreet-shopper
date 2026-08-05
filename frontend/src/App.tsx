import { useEffect, useMemo, useState } from 'react';

export type Sneaker = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
};

export type CartItem = {
  sneaker: Sneaker;
  quantity: number;
};

export type CheckoutRequest = {
  items: Array<{ sneakerId: number; quantity: number }>;
};

const placeholderImage =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Segoe UI, sans-serif" font-size="24"%3EImage not available%3C/text%3E%3C/svg%3E';

function App() {
  const [sneakers, setSneakers] = useState<Sneaker[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutMessage, setCheckoutMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/sneakers')
      .then((response) => response.json())
      .then(setSneakers)
      .catch(() => setSneakers([]));
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
      const response = await fetch('http://localhost:5000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message ?? 'Checkout failed');
      }

      const result = await response.json();
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
        <section className="catalog">
          <h2>Featured sneakers</h2>
          <div className="grid">
            {sneakers.map((sneaker) => (
              <article key={sneaker.id} className="card">
                <img src={sneaker.imageUrl || placeholderImage} alt={sneaker.name} />
                <div className="card-body">
                  <p className="category">{sneaker.category}</p>
                  <h3>{sneaker.name}</h3>
                  <p>{sneaker.description}</p>
                  <div className="card-footer">
                    <strong>${sneaker.price.toFixed(2)}</strong>
                    <button type="button" onClick={() => addToCart(sneaker)}>
                      Add to cart
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="cart-panel">
          <h2>Your cart</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <div className="cart-list">
              {cart.map((item) => (
                <div key={item.sneaker.id} className="cart-item">
                  <div>
                    <strong>{item.sneaker.name}</strong>
                    <p>${item.sneaker.price.toFixed(2)}</p>
                  </div>
                  <div className="quantity-control">
                    <button type="button" onClick={() => updateQuantity(item.sneaker.id, item.quantity - 1)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.sneaker.id, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="checkout-box">
            <p className="subtotal">Subtotal: ${total.toFixed(2)}</p>
            <button type="button" onClick={handleCheckout} disabled={isSubmitting || cart.length === 0}>
              {isSubmitting ? 'Submitting...' : 'Checkout'}
            </button>
            {checkoutMessage && <p className="message">{checkoutMessage}</p>}
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
