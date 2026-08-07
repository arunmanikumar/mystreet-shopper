import type { CartItem, OrderResponse, Sneaker } from '../types';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5197';
const apiRoot = `${apiBaseUrl}/api`;

type ProductApiResponse = {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  imageUrl: string;
  sizes: string[];
};

export async function fetchSneakers(): Promise<Sneaker[]> {
  const response = await fetch(`${apiRoot}/products`);
  if (!response.ok) {
    throw new Error('Unable to load sneaker catalog.');
  }

  const products = (await response.json()) as ProductApiResponse[];

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    description: product.description,
    price: product.price,
    category: product.brand || 'Sneaker',
    imageUrl: product.imageUrl,
    sizes: product.sizes,
  }));
}

export async function checkoutCart(items: CartItem[]): Promise<OrderResponse> {
  const total = items.reduce((sum, item) => sum + item.sneaker.price * item.quantity, 0);

  return {
    orderId: `order-${Date.now()}`,
    total,
    message: 'Order placed locally.',
  };
}
