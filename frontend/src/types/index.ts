export type Sneaker = {
  id: string;
  name: string;
  brand?: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  sizes?: string[];
};

export type CartItem = {
  sneaker: Sneaker;
  quantity: number;
};

export type CheckoutRequest = {
  items: CartItem[];
};

export type OrderResponse = {
  orderId: string;
  total: number;
  message: string;
};
