import type { CartItem } from '../types';

interface CartPanelProps {
  cart: CartItem[];
  total: number;
  isSubmitting: boolean;
  message: string;
  onUpdateQuantity: (sneakerId: number, quantity: number) => void;
  onCheckout: () => void;
}

export function CartPanel({ cart, total, isSubmitting, message, onUpdateQuantity, onCheckout }: CartPanelProps) {
  return (
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
                <button type="button" onClick={() => onUpdateQuantity(item.sneaker.id, item.quantity - 1)}>
                  -
                </button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => onUpdateQuantity(item.sneaker.id, item.quantity + 1)}>
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="checkout-box">
        <p className="subtotal">Subtotal: ${total.toFixed(2)}</p>
        <button type="button" onClick={onCheckout} disabled={isSubmitting || cart.length === 0}>
          {isSubmitting ? 'Submitting...' : 'Checkout'}
        </button>
        {message && <p className="message">{message}</p>}
      </div>
    </aside>
  );
}
