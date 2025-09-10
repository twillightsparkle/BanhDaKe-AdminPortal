import { apiRequest, API_CONFIG } from '../config/api';
import type { Product, ShippingFee, SizeOption } from '../types';

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

  // Delete order
  deleteOrder: async (id: string) => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}`, {
      method: 'DELETE',
    });
  },

  // Get order statistics
  getOrderStats: async () => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.ORDERS}/stats/summary`);
  },
};

// Shipping Fee API services
export const shippingService = {
  // Get all shipping fees
  getAllShippingFees: async (): Promise<ShippingFee[]> => {
    const response = await apiRequest(`${API_CONFIG.ENDPOINTS.SHIPPING}/admin`);
    return response.data || [];
  },

  // Get shipping fee by ID
  getShippingFeeById: async (id: string): Promise<ShippingFee> => {
    const response = await apiRequest(`${API_CONFIG.ENDPOINTS.SHIPPING}/admin/${id}`);
    return response.data;
  },

  // Create new shipping fee
  createShippingFee: async (shippingData: Omit<ShippingFee, '_id' | 'createdAt' | 'updatedAt'>): Promise<ShippingFee> => {
    const response = await apiRequest(`${API_CONFIG.ENDPOINTS.SHIPPING}/admin`, {
      method: 'POST',
      body: JSON.stringify(shippingData),
    });
    return response.data;
  },

  // Update shipping fee
  updateShippingFee: async (id: string, shippingData: Partial<ShippingFee>): Promise<ShippingFee> => {
    const response = await apiRequest(`${API_CONFIG.ENDPOINTS.SHIPPING}/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(shippingData),
    });
    return response.data;
  },

  // Delete shipping fee
  deleteShippingFee: async (id: string): Promise<void> => {
    await apiRequest(`${API_CONFIG.ENDPOINTS.SHIPPING}/admin/${id}`, {
      method: 'DELETE',
    });
  },

  // Toggle active status
  toggleShippingFeeStatus: async (id: string): Promise<ShippingFee> => {
    const response = await apiRequest(`${API_CONFIG.ENDPOINTS.SHIPPING}/admin/${id}/toggle`, {
      method: 'PATCH',
    });
    return response.data;
  },
};

// Size API services
export const sizeService = {
  // Get all sizes
  getAllSizes: async (): Promise<SizeOption[]> => {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.SIZES);
    return response.data || [];
  },

  // Create new size
  createSize: async (sizeData: Omit<SizeOption, '_id'>): Promise<SizeOption> => {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.SIZES, {
      method: 'POST',
      body: JSON.stringify(sizeData),
    });
    return response.data;
  },

  // Update size
  updateSize: async (id: string, sizeData: Partial<Omit<SizeOption, '_id'>>): Promise<SizeOption> => {
    const response = await apiRequest(`${API_CONFIG.ENDPOINTS.SIZES}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sizeData),
    });
    return response.data;
  },

  // Delete size
  deleteSize: async (id: string): Promise<void> => {
    await apiRequest(`${API_CONFIG.ENDPOINTS.SIZES}/${id}`, {
      method: 'DELETE',
    });
  },
};
