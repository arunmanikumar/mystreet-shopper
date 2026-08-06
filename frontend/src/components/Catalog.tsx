import type { Sneaker } from '../types';

interface CatalogProps {
  sneakers: Sneaker[];
  onAddToCart: (sneaker: Sneaker) => void;
}

const placeholderImage =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Segoe UI, sans-serif" font-size="24"%3EImage not available%3C/text%3E%3C/svg%3E';

export function Catalog({ sneakers, onAddToCart }: CatalogProps) {
  return (
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
                <button type="button" onClick={() => onAddToCart(sneaker)}>
                  Add to cart
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
