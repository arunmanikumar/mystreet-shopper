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

export type OrderResponse = {
  orderId: string;
  total: number;
  message: string;
};
