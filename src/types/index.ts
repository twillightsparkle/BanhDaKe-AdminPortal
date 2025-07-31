export type LocalizedString = {
  en: string;
  vi: string;
};

export type ProductSpecification = {
  key: LocalizedString;
  value: LocalizedString;
};

export interface Product {
  _id: string; // MongoDB ObjectId as string
  name: LocalizedString;
  price: number;
  image: string;
  images: string[];
  shortDescription: LocalizedString;
  detailDescription: LocalizedString;
  sizes: string[];
  specifications: ProductSpecification[];
  inStock: boolean;
  stock: number;
  weight: number; // in grams
  createdAt: string; // MongoDB timestamps as strings
  updatedAt: string;
}

export interface Order {
  _id: string; // MongoDB ObjectId as string
  products: OrderItem[];
  total: number;
  shippingFee: number;
  shippingCountry: string;
  totalWeight: number;
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

// Utility functions for working with localized strings
export const getLocalizedString = (
  localizedString: LocalizedString, 
  currentLanguage: string = 'en'
): string => {
  return localizedString[currentLanguage as keyof LocalizedString] || localizedString.en;
};

// Helper function to create a localized string
export const createLocalizedString = (en: string, vi: string): LocalizedString => ({
  en,
  vi,
});

// Shipping Fee types
export interface ShippingFee {
  _id: string;
  country: string;
  baseFee: number;
  perKgRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


