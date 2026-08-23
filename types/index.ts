export type CategoryType = 
  | 'ALL' 
  | 'BEAUTY' 
  | 'FASHION' 
  | 'SNACKS' 
  | 'THAI_POP' 
  | 'SEVEN_ELEVEN' 
  | 'CUSTOM';

export type TripStatus = 'PLANNING' | 'LIVE_SHOPPING' | 'PACKING' | 'SHIPPED' | 'COMPLETED';

export type OrderStatus = 
  | 'AWAITING_PAYMENT'
  | 'SHOPPING'
  | 'PACKED_READY'
  | 'ARRIVED_JKT'
  | 'DELIVERED';

export type FulfillmentStatus = 'PENDING' | 'PURCHASED' | 'PARTIAL' | 'FAILED' | 'CANCELLED';
export type ShortageResolution = 'PENDING' | 'REFUND' | 'REPLACE' | 'CANCEL';
export type RefundStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
}

export interface BangkokStore {
  id: string;
  name: string;
  thaiName: string;
  area: string; // e.g. "Siam", "Pratunam", "Chatuchak", "Asok"
  description: string;
  category: string;
  badgeColor: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  thaiName?: string;
  brand: string;
  category: CategoryType;
  storeId: string;
  storeName: string;
  priceTHB: number;
  weightGrams: number;
  image: string;
  description: string;
  variants?: string[];
  popularBadge?: string;
  isPreOrder?: boolean;
  stockStatus: 'AVAILABLE' | 'LIMITED' | 'SOLD_OUT';
}

export interface CustomRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  itemName: string;
  brandOrStore: string;
  notes: string; // size, shade, flavor, etc.
  referenceUrl?: string;
  imageUrl: string;
  targetPriceTHB: number;
  estimatedWeightGrams: number;
  status: 'PENDING_REVIEW' | 'OFFER_SENT' | 'PUBLISHED' | 'PRIVATE_REQUEST' | 'APPROVED' | 'PURCHASED' | 'REJECTED';
  adminNotes?: string;
  quotedPriceTHB?: number;
  createdAt: string;
}

export interface ShoppingTrip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  orderCloseDate: string;
  flightDate: string;
  deliveryDate: string;
  status: TripStatus;
  quotaPercent: number;
  currentShopperLocation: string;
  announcement: string;
}

export interface ExchangeConfig {
  thbToIdrRate: number; // e.g. 455 IDR per 1 THB
  markupPercent: number; // e.g. 12%
  baseFeePerItemIDR: number; // e.g. 20,000 IDR
  weightRatePer100gIDR: number; // e.g. 12,000 IDR per 100g
}

export interface CartItem {
  id: string; // unique item uuid in cart
  userId?: string;
  productId?: string;
  customRequestId?: string;
  name: string;
  storeName: string;
  priceTHB: number;
  quantity: number;
  weightGrams: number;
  selectedVariant?: string;
  notes?: string;
  image: string;
  isCustomRequest?: boolean;
  fulfillmentStatus?: FulfillmentStatus;
  fulfillmentNote?: string;
  orderedQuantity?: number;
  purchasedQuantity?: number;
  shortageResolution?: ShortageResolution;
}

export interface OrderTrackingStep {
  status: OrderStatus;
  title: string;
  description: string;
  location: string;
  timestamp?: string;
  completed: boolean;
  current?: boolean;
  photoProofUrl?: string;
}

export interface Order {
  id: string;
  userId?: string;
  orderNumber: string;
  customerName: string;
  customerWhatsapp: string;
  customerAddress: string;
  customerCity: string;
  items: CartItem[];
  subtotalTHB: number;
  subtotalIDR: number;
  jastipFeeIDR: number;
  weightFeeIDR: number;
  totalIDR: number; // Single Total Grand Amount
  paymentMethod: 'QRIS' | 'BCA' | 'MANDIRI';
  paymentStatus: 'UNPAID' | 'VERIFYING' | 'CONFIRMED' | 'REJECTED';
  paymentProofUrl?: string;
  status: OrderStatus;
  createdAt: string;
  trackingSteps: OrderTrackingStep[];
  trackingNumber?: string;
  refundAmountIDR?: number;
  customerConfirmedAt?: string;
  deliveryProofUrl?: string;
}

export interface Refund {
  id: string;
  orderId: string;
  orderItemId: string;
  userId: string;
  amountIDR: number;
  reason: string;
  status: RefundStatus;
  paymentReference?: string;
  adminNote?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
}
