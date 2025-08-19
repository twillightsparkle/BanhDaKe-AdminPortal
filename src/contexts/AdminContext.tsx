import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, Order, AdminUser } from '../types';
import { productService, orderService, authService } from '../services/api';

interface AdminContextType {
  // Auth
  user: AdminUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Products
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (product: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  updateProductStock: (id: string, stock: number) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  refreshProducts: () => Promise<void>;
  
  // Orders
  orders: Order[];
  updateOrderStatus: (orderId: string, status: 'Pending' | 'Shipped' | 'Completed') => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      const savedToken = localStorage.getItem('adminToken');
      const savedUser = localStorage.getItem('adminUser');
      
      if (savedToken && savedUser) {
        try {
          // Verify token is still valid
          await authService.verify();
          setUser(JSON.parse(savedUser));
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }
      }
    };
    
    checkExistingAuth();
  }, []);

  // Load products and orders when user logs in
  useEffect(() => {
    if (user?.isAuthenticated) {
      refreshProducts();
      refreshOrders();
    }
  }, [user?.isAuthenticated]);

  const refreshProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getAllProducts();
      setProducts(data.products || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = async () => {
    try {
      const data = await orderService.getAllOrders();
      setOrders(data.orders || data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      const response = await authService.login(username, password);
      
      // Store token
      localStorage.setItem('adminToken', response.token);
      
      // Create user object
      const adminUser: AdminUser = {
        id: response.admin.id,
        username: response.admin.username,
        email: response.admin.email,
        role: response.admin.role,
        isAuthenticated: true
      };
      
      setUser(adminUser);
      localStorage.setItem('adminUser', JSON.stringify(adminUser));
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setProducts([]);
    setOrders([]);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  const addProduct = async (productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newProduct = await productService.createProduct(productData);
      setProducts(prev => [...prev, newProduct]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      setError(null);
      const updatedProduct = await productService.updateProduct(id, updates);
      setProducts(prev => prev.map(product => 
        product._id === id ? updatedProduct : product
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      throw err;
    }
  };

  const updateProductStock = async (id: string, stock: number) => {
    try {
      setError(null);
      const updatedProduct = await productService.updateProductStock(id, stock);
      setProducts(prev => prev.map(product => 
        product._id === id ? updatedProduct : product
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stock');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      setError(null);
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(product => product._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'Pending' | 'Shipped' | 'Completed') => {    try {
      setError(null);
      const updatedOrder = await orderService.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(order =>
        order._id === orderId ? updatedOrder : order
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
      throw err;
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      setError(null);
      await orderService.deleteOrder(orderId);
      setOrders(prev => prev.filter(order => order._id !== orderId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete order');
      throw err;
    }
  };

  const value: AdminContextType = {
    user,
    login,
    logout,
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    updateProductStock,
    deleteProduct,
    refreshProducts,
    orders,
    updateOrderStatus,
    deleteOrder,
    refreshOrders
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
