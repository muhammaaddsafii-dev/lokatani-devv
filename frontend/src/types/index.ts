export interface User {
  id: string;
  username: string;
  name: string;
  phone: string;
  role: 'farmer' | 'buyer';
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  location: string;
  image_base64: string;
  farmer_id: string;
  farmer_name: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  buyer_id: string;
  buyer_name: string;
  items: any[];
  total: number;
  status: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
