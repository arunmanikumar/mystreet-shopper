import type { CartItem, Sneaker } from '../types';
import { Catalog } from '../components/Catalog';
import { CartPanel } from '../components/CartPanel';

type HomePageProps = {
  sneakers: Sneaker[];
  cart: CartItem[];
  total: number;
  isSubmitting: boolean;
  checkoutMessage: string;
  onAddToCart: (sneaker: Sneaker) => void;
  onUpdateQuantity: (sneakerId: string, quantity: number) => void;
  onCheckout: () => void;
};

export function HomePage({
  sneakers,
  cart,
  total,
  isSubmitting,
  checkoutMessage,
  onAddToCart,
  onUpdateQuantity,
  onCheckout,
}: HomePageProps) {
  return (
    <>
      <section className="hero-panel">
        <p className="eyebrow">Browse and buy locally</p>
        <h2>Find your next sneaker and keep checkout simple.</h2>
        <p>
          Use the sign up and login links in the top navigation to create a local account, then
          continue shopping.
        </p>
      </section>

      <main>
        <Catalog sneakers={sneakers} onAddToCart={onAddToCart} />
        <CartPanel
          cart={cart}
          total={total}
          isSubmitting={isSubmitting}
          message={checkoutMessage}
          onUpdateQuantity={onUpdateQuantity}
          onCheckout={onCheckout}
        />
      </main>
    </>
  );
}