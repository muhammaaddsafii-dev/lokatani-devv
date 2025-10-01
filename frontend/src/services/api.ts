import axios from 'axios';
import { AuthResponse, Product, CartItem, Order } from '../types';
import Constants from 'expo-constants';

const API_URL = `${Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL}/api`;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const api = {
  setAuthToken: (token: string | null) => {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  },

  // Auth
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/login', { username, password });
    return response.data;
  },

  register: async (username: string, password: string, name: string, phone: string, role: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/register', { username, password, name, phone, role });
    return response.data;
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    const response = await axiosInstance.get('/products');
    return response.data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (product: Omit<Product, 'id' | 'farmer_id' | 'farmer_name' | 'created_at'>): Promise<Product> => {
    const response = await axiosInstance.post('/products', product);
    return response.data;
  },

  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    const response = await axiosInstance.put(`/products/${id}`, product);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/products/${id}`);
  },

  getMyProducts: async (): Promise<Product[]> => {
    const response = await axiosInstance.get('/my-products');
    return response.data;
  },

  // Cart
  getCart: async (): Promise<{ user_id: string; items: CartItem[] }> => {
    const response = await axiosInstance.get('/cart');
    return response.data;
  },

  addToCart: async (product_id: string, quantity: number = 1): Promise<void> => {
    await axiosInstance.post('/cart/add', { product_id, quantity });
  },

  removeFromCart: async (product_id: string): Promise<void> => {
    await axiosInstance.delete(`/cart/remove/${product_id}`);
  },

  clearCart: async (): Promise<void> => {
    await axiosInstance.post('/cart/clear');
  },

  // Orders
  createOrder: async (items: any[], total: number): Promise<Order> => {
    const response = await axiosInstance.post('/orders', { items, total });
    return response.data;
  },

  getOrders: async (): Promise<Order[]> => {
    const response = await axiosInstance.get('/orders');
    return response.data;
  },
};

export default api;
