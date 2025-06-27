export interface Product {
  _id: string; // MongoDB ObjectId as string
  name: string;
  price: number;
  image: string;
  images: string[];
  shortDescription: string;
  detailDescription: string;
  sizes: string[];
  specifications: Record<string, string>;
  inStock: boolean;
  stock: number;
  createdAt: string; // MongoDB timestamps as strings
  updatedAt: string;
}

export interface Order {
  _id: string; // MongoDB ObjectId as string
  products: OrderItem[];
  total: number;
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
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  address: string;
}

export type OrderStatus = 'Pending' | 'Shipped' | 'Completed';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  isAuthenticated: boolean;
}

export interface LoginResponse {
  message: string;
  token: string;
  admin: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}
