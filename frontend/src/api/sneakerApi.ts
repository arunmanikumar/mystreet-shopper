import type { CheckoutRequest, OrderResponse, Sneaker } from '../types';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';
const apiRoot = `${apiBaseUrl}/api`;

export async function fetchSneakers(): Promise<Sneaker[]> {
  const response = await fetch(`${apiRoot}/sneakers`);
  if (!response.ok) {
    throw new Error('Unable to load sneaker catalog.');
  }
  return response.json();
}

export async function checkoutCart(payload: CheckoutRequest): Promise<OrderResponse> {
  const response = await fetch(`${apiRoot}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Checkout failed.' }));
    throw new Error(error.message ?? 'Checkout failed.');
  }

  return response.json();
}
