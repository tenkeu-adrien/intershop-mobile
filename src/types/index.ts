// Types principaux de l'application InterShop Mobile

export type UserRole = 'client' | 'fournisseur' | 'marketiste' | 'admin';
export type AccountStatus = 'email_unverified' | 'phone_unverified' | 'pending_admin_approval' | 'active' | 'rejected' | 'suspended';
export type ProductCategory = 'ecommerce' | 'restaurant' | 'hotel' | 'dating';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface Product {
  id: string;
  fournisseurId: string;
  name: string;
  description: string;
  images: string[];
  category: string;
  subcategory?: string;
  tags: string[];
  certifications?: string[];
  moq: number;
  prices: PriceTier[];
  stock: number;
  country: string;
  rating: number;
  reviewCount: number;
  sales?: number;
  deliveryTime?: string;
  isActive: boolean;
  serviceCategory: ProductCategory;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    country: string;
  };
  // Restaurant specific data
  restaurantData?: {
    cuisineType: string[];
    priceRange: string;
    openingHours: {
      [key: string]: { open: string; close: string } | { closed: boolean };
    };
    features: string[];
  };
  // Hotel specific data
  hotelData?: {
    starRating: number;
    roomTypes: Array<{
      type: string;
      price: number;
      description: string;
      capacity: number;
    }>;
    checkInTime: string;
    checkOutTime: string;
    amenities: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceTier {
  minQuantity: number;
  maxQuantity?: number;
  price: number;
  currency: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantsData: {
    [userId: string]: {
      name: string;
      photo?: string;
      role: string;
    };
  };
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: { [userId: string]: number };
  type: 'order' | 'product_inquiry' | 'dating_inquiry' | 'hotel_inquiry' | 'restaurant_inquiry' | 'general' | 'support';
  createdAt: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  pendingBalance: number;
  currency: 'XAF' | 'XOF';
  status: 'active' | 'suspended' | 'closed';
  pin?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  walletId: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund';
  amount: number;
  fees: number;
  totalAmount: number;
  currency: 'XAF' | 'XOF';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  fournisseurId: string;
  products: OrderProduct[];
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderProduct {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

// Payment Method Types
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'mobile_money' | 'mpesa' | 'crypto' | 'bank_transfer' | 'other';
  instructions: string;
  accountDetails?: {
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    walletAddress?: string;
    network?: string;
  };
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlexibleDepositData {
  paymentMethodId: string;
  clientName: string;
  amount: number;
}

export interface FlexibleWithdrawalData {
  paymentMethodId: string;
  amount: number;
  accountName: string;
  accountNumber: string;
}

export interface TransferData {
  toUserId: string;
  amount: number;
  description?: string;
  pin: string;
}
