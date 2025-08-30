export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  sku?: string;
  price: string;
  comparePrice?: string;
  categoryId: string;
  inventory: number;
  weight?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images: string[];
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductQueryParams {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'price' | 'created' | 'featured';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductsResponse {
  data: Product[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  quantity: number;
  createdAt: string;
  product: {
    id: string;
    name: string;
    price: string;
    comparePrice?: string;
    images: string[];
    inventory: number;
    isActive: boolean;
  };
}

export interface CartResponse {
  items: CartItem[];
  totalItems: number;
  totalAmount: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  subtotal: string;
  taxAmount: string;
  shippingAmount: string;
  totalAmount: string;
  currency: string;
  paymentStatus: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  message: string;
  status?: number;
}