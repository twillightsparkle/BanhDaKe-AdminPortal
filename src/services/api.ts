import { apiRequest, API_CONFIG } from '../config/api';
import type { Product } from '../types';

// Auth API services
export const authService = {
  // Admin login
  login: async (username: string, password: string) => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.AUTH}/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  // Verify token
  verify: async () => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.AUTH}/verify`);
  },

  // Register new admin (if needed)
  register: async (username: string, email: string, password: string) => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.AUTH}/register`, {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },
};

// Product API services
export const productService = {
  // Get all products
  getAllProducts: async () => {
    return apiRequest(API_CONFIG.ENDPOINTS.PRODUCTS);
  },

  // Get single product by ID
  getProductById: async (id: string): Promise<Product> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`);
  },
  // Create new product
  createProduct: async (productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>) => {
    return apiRequest(API_CONFIG.ENDPOINTS.PRODUCTS, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  // Update product
  updateProduct: async (id: string, productData: Partial<Product>) => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  // Update product stock
  updateProductStock: async (id: string, stock: number) => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock }),
    });
  },

  // Delete product
  deleteProduct: async (id: string) => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`, {
      method: 'DELETE',
    });
  },
};

// Order API services
export const orderService = {
  // Get all orders
  getAllOrders: async () => {
    return apiRequest(API_CONFIG.ENDPOINTS.ORDERS);
  },

  // Get order by ID
  getOrderById: async (id: string) => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}`);
  },

  // Update order status
  updateOrderStatus: async (id: string, status: string) => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Get order statistics
  getOrderStats: async () => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.ORDERS}/stats/summary`);
  },
};
