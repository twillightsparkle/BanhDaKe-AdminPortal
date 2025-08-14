export interface Order {
  _id: string; // MongoDB ObjectId as string
  products: OrderItem[];
  total: number;
  shippingFee: number;
  shippingCountry: string;
  totalWeight: number; // in kilograms (kg)
  customerInfo: CustomerInfo;
  status: OrderStatus;
  createdAt: string; // MongoDB timestamps as strings
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  selectedSize: string;
  selectedColor: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  address: string;
}

export type OrderStatus = 'Pending' | 'Shipped' | 'Completed';
