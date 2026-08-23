'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  ShoppingTrip, 
  ExchangeConfig, 
  CartItem, 
  Order, 
  CustomRequest, 
  BangkokStore,
  CategoryType,
  OrderStatus,
  FulfillmentStatus,
  User,
  UserRole,
  ShortageResolution,
  Refund,
  RefundStatus
} from '@/types';
import { 
  INITIAL_EXCHANGE_CONFIG, 
  BANGKOK_STORES, 
  INITIAL_PRODUCTS, 
  INITIAL_TRIP, 
  INITIAL_CUSTOM_REQUESTS, 
  INITIAL_ORDERS
} from '@/lib/mockData';
import { getSupabaseClient, usernameToAuthEmail } from '@/lib/supabase';
import { migrateLegacyBusinessStateToBackup, clearBusinessLocalStorage } from '@/lib/localStorageMigration';

export interface PriceBreakdown {
  rawIdr: number;
  markupIdr: number;
  baseWithMarkupIdr: number;
  jastipFeeIdr: number;
  weightFeeIdr: number;
  landedSingleItemIdr: number;
}

interface AppContextType {
  // Auth & Session
  currentUser: User | null;
  users: (User & { password: string })[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Configurations
  exchangeConfig: ExchangeConfig;
  setExchangeConfig: (config: ExchangeConfig) => Promise<void>;
  updateExchangeRate: (rate: number, markup: number) => Promise<void>;

  // Stores & Products
  stores: BangkokStore[];
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  selectedCategory: CategoryType;
  setSelectedCategory: (cat: CategoryType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Trips
  trip: ShoppingTrip;
  updateTrip: (updated: Partial<ShoppingTrip>) => Promise<void>;

  // Custom Requests
  customRequests: CustomRequest[];
  submitCustomRequest: (req: Omit<CustomRequest, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateCustomRequestStatus: (id: string, status: CustomRequest['status'], adminNotes?: string, quotedPriceTHB?: number) => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateCartQuantity: (cartItemId: string, delta: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotalCount: number;

  // Orders & Checkout
  orders: Order[];
  createOrder: (orderData: {
    customerName: string;
    customerWhatsapp: string;
    customerAddress: string;
    customerCity: string;
    paymentMethod: 'QRIS' | 'BCA' | 'MANDIRI';
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, photoProofUrl?: string) => Promise<void>;
  updateOrderItemStatus: (orderId: string, itemId: string, status: FulfillmentStatus, fulfillmentNote?: string) => Promise<void>;
  updateOrderItemFulfillment: (orderId: string, itemId: string, purchasedQuantity: number, fulfillmentNote?: string) => Promise<void>;
  resolveOrderItemShortage: (orderId: string, itemId: string, resolution: ShortageResolution) => Promise<void>;
  markOrderPaid: (orderId: string, proofUrl?: string) => Promise<void>;
  refunds: Refund[];
  updateRefundStatus: (refundId: string, status: RefundStatus, paymentReference?: string, adminNote?: string) => Promise<void>;
  submitPayment: (orderId: string, amountIDR: number, method: Order['paymentMethod'], proofFile: File) => Promise<void>;
  currentActiveOrderId: string | null;
  setCurrentActiveOrderId: (id: string | null) => void;

  // Navigation & Modals
  activeView: 'buyer' | 'admin';
  setActiveView: (view: 'buyer' | 'admin') => void;
  buyerTab: 'home' | 'custom' | 'tracking' | 'stores';
  setBuyerTab: (tab: 'home' | 'custom' | 'tracking' | 'stores') => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCustomModalOpen: boolean;
  setIsCustomModalOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;

  // Calculation helpers
  calculatePriceBreakdown: (priceTHB: number, weightGrams?: number) => PriceBreakdown;
  formatIDR: (amount: number) => string;
  formatTHB: (amount: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [users] = useState<(User & { password: string })[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // App data state
  const [exchangeConfig, setExchangeConfigState] = useState<ExchangeConfig>(INITIAL_EXCHANGE_CONFIG);
  const [stores, setStores] = useState<BangkokStore[]>(BANGKOK_STORES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [trip, setTripState] = useState<ShoppingTrip>(INITIAL_TRIP);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>(INITIAL_CUSTOM_REQUESTS);
  
  // All carts mapped by userId: Record<userId, CartItem[]>
  const [userCarts, setUserCarts] = useState<Record<string, CartItem[]>>({
    'usr-customer-1': [],
    'usr-customer-2': [],
  });

  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [currentActiveOrderId, setCurrentActiveOrderId] = useState<string | null>(INITIAL_ORDERS[0]?.id || null);

  // UI Navigation state
  const [activeView, setActiveView] = useState<'buyer' | 'admin'>('buyer');
  const [buyerTab, setBuyerTab] = useState<'home' | 'custom' | 'tracking' | 'stores'>('home');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Active user's specific cart
  const currentUserId = currentUser?.id || 'guest';
  const cart = userCarts[currentUserId] || [];

  const loadUserCart = async (userId: string) => {
    const supabase = getSupabaseClient();
    const { data: cartRecord, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    if (cartError) throw cartError;

    if (!cartRecord) {
      setUserCarts((current) => ({ ...current, [userId]: [] }));
      return;
    }

    const { data: itemRows, error: itemError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartRecord.id)
      .order('created_at', { ascending: true });
    if (itemError) throw itemError;

    const loadedItems: CartItem[] = (itemRows || []).map((row) => ({
      id: row.id,
      userId,
      productId: row.product_id || undefined,
      name: row.name,
      storeName: row.store_name || '',
      priceTHB: Number(row.price_thb),
      quantity: row.quantity,
      weightGrams: row.weight_grams,
      selectedVariant: row.selected_variant || undefined,
      notes: row.notes || undefined,
      image: row.image_url || '',
      isCustomRequest: row.is_custom_request || false,
    }));
    setUserCarts((current) => ({ ...current, [userId]: loadedItems }));
  };

  const loadUserOrders = async (userId: string) => {
    const supabase = getSupabaseClient();
    const { data: orderRows, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (orderError) throw orderError;

    const { data: paymentRows, error: paymentsError } = await supabase
      .from('payments')
      .select('order_id, status, proof_url, created_at')
      .order('created_at', { ascending: false });
    if (paymentsError) throw paymentsError;
    const latestPaymentByOrder = new Map<string, { status: string; proofUrl?: string }>();
    (paymentRows || []).forEach((payment: Record<string, any>) => {
      if (!latestPaymentByOrder.has(payment.order_id)) {
        latestPaymentByOrder.set(payment.order_id, { status: payment.status, proofUrl: payment.proof_url || undefined });
      }
    });
    await Promise.all(Array.from(latestPaymentByOrder.entries()).map(async ([orderId, payment]) => {
      if (!payment.proofUrl) return;
      const { data, error } = await supabase.storage.from('payment-proofs').createSignedUrl(payment.proofUrl, 3600);
      if (!error && data?.signedUrl) {
        latestPaymentByOrder.set(orderId, { ...payment, proofUrl: data.signedUrl });
      }
    }));

    const loadedOrders: Order[] = [];
    for (const row of orderRows || []) {
      const { data: itemRows, error: itemError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', row.id)
        .order('created_at', { ascending: true });
      if (itemError) throw itemError;
      loadedOrders.push({
        id: row.id,
        userId: row.user_id,
        orderNumber: row.order_number,
        customerName: row.customer_name,
        customerWhatsapp: row.customer_whatsapp,
        customerAddress: row.customer_address,
        customerCity: row.customer_city,
        items: (itemRows || []).map((item) => ({
          id: item.id,
          userId: row.user_id,
          productId: item.product_id || undefined,
          name: item.name,
          storeName: item.store_name,
          priceTHB: Number(item.price_thb),
          quantity: item.ordered_quantity,
          weightGrams: item.weight_grams,
          selectedVariant: item.selected_variant || undefined,
          notes: item.notes || undefined,
          image: item.image_url || '',
          isCustomRequest: item.is_custom_request,
          orderedQuantity: item.ordered_quantity,
          purchasedQuantity: item.purchased_quantity,
          fulfillmentStatus: item.fulfillment_status,
          fulfillmentNote: item.fulfillment_note || undefined,
          shortageResolution: item.shortage_resolution || 'PENDING',
        })),
        subtotalTHB: Number(row.subtotal_thb),
        subtotalIDR: Number(row.subtotal_idr),
        jastipFeeIDR: Number(row.jastip_fee_idr),
        weightFeeIDR: Number(row.weight_fee_idr),
        totalIDR: Number(row.total_idr),
        paymentMethod: row.payment_method,
        paymentStatus: latestPaymentByOrder.get(row.id)?.status === 'VERIFYING'
          ? 'VERIFYING'
          : latestPaymentByOrder.get(row.id)?.status === 'CONFIRMED'
            ? 'CONFIRMED'
            : latestPaymentByOrder.get(row.id)?.status === 'REJECTED'
              ? 'REJECTED'
              : row.payment_status,
        paymentProofUrl: latestPaymentByOrder.get(row.id)?.proofUrl || row.payment_proof_url || undefined,
        status: row.order_status,
        createdAt: row.created_at,
        trackingNumber: row.tracking_number || undefined,
        refundAmountIDR: Number(row.refund_amount_idr || 0),
        trackingSteps: row.tracking_steps || [],
      });
    }
    setOrders(loadedOrders);
    setCurrentActiveOrderId(loadedOrders[0]?.id || null);
  };

  const loadCustomRequests = async () => {
    const { data, error } = await getSupabaseClient()
      .from('custom_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (data?.length) {
      setCustomRequests(data.map((row: Record<string, any>) => ({
        id: row.id,
        userId: row.user_id,
        userName: row.user_name,
        userPhone: row.user_phone,
        itemName: row.item_name,
        brandOrStore: row.brand_or_store,
        notes: row.notes,
        referenceUrl: row.reference_url || undefined,
        imageUrl: row.image_url || '',
        targetPriceTHB: Number(row.target_price_thb),
        estimatedWeightGrams: row.estimated_weight_grams,
        status: row.status,
        adminNotes: row.admin_notes || undefined,
        quotedPriceTHB: row.quoted_price_thb ? Number(row.quoted_price_thb) : undefined,
        createdAt: row.created_at,
      })));
    } else {
      setCustomRequests([]);
    }
  };

  const loadRefunds = async () => {
    const { data, error } = await getSupabaseClient().from('refunds').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    setRefunds((data || []).map((row: Record<string, any>) => ({
      id: row.id,
      orderId: row.order_id,
      orderItemId: row.order_item_id,
      userId: row.user_id,
      amountIDR: Number(row.amount_idr),
      reason: row.reason,
      status: row.status,
      paymentReference: row.payment_reference || undefined,
      adminNote: row.admin_note || undefined,
      processedBy: row.processed_by || undefined,
      processedAt: row.processed_at || undefined,
      createdAt: row.created_at,
    })));
  };

  const mapStoreRow = (row: Record<string, any>): BangkokStore => ({
    id: row.id,
    name: row.name,
    thaiName: row.thai_name || '',
    area: row.area || '',
    description: row.description || '',
    category: row.category || '',
    badgeColor: row.badge_color || 'bg-amber-600',
    image: row.image_url || '',
  });

  const mapProductRow = (row: Record<string, any>): Product => ({
    id: row.id,
    name: row.name,
    thaiName: row.thai_name || undefined,
    brand: row.brand || '',
    category: row.category,
    storeId: row.store_id,
    storeName: row.store_name || '',
    priceTHB: Number(row.price_thb),
    weightGrams: row.weight_grams,
    image: row.image_url || '',
    description: row.description || '',
    variants: Array.isArray(row.variants) ? row.variants : [],
    popularBadge: row.popular_badge || undefined,
    isPreOrder: Boolean(row.is_pre_order),
    stockStatus: row.stock_status,
  });

  const loadCatalog = async () => {
    const supabase = getSupabaseClient();
    const [{ data: storeRows, error: storesError }, { data: productRows, error: productsError }] = await Promise.all([
      supabase.from('stores').select('*').order('name'),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
    ]);
    if (storesError) throw storesError;
    if (productsError) throw productsError;
    if (storeRows?.length) setStores(storeRows.map(mapStoreRow));
    if (productRows?.length) setProducts(productRows.map(mapProductRow));
  };

  const loadExchangeConfig = async () => {
    const { data, error } = await getSupabaseClient()
      .from('exchange_configs')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();
    if (error) throw error;
    if (data) {
      setExchangeConfigState({
        thbToIdrRate: Number(data.thb_to_idr_rate),
        markupPercent: Number(data.markup_percent),
        baseFeePerItemIDR: Number(data.base_fee_per_item_idr),
        weightRatePer100gIDR: Number(data.weight_rate_per_100g_idr),
      });
    }
  };

  const loadShoppingTrip = async () => {
    const { data, error } = await getSupabaseClient()
      .from('shopping_trips')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (data) {
      setTripState({
        id: data.id,
        title: data.title,
        destination: data.destination,
        startDate: data.start_date,
        endDate: data.end_date,
        orderCloseDate: data.order_close_date,
        flightDate: data.flight_date,
        deliveryDate: data.delivery_date,
        status: data.status,
        quotaPercent: data.quota_percent,
        currentShopperLocation: data.current_shopper_location,
        announcement: data.announcement,
      });
    }
  };

  // Back up legacy localStorage state once, then clear any business data from browser storage.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      migrateLegacyBusinessStateToBackup();
      clearBusinessLocalStorage();
    } catch (error) {
      console.warn('Legacy business localStorage cleanup skipped', error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async (userId: string) => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) throw error;
      if (isMounted) {
        const profile = data as User;
        setCurrentUser(profile);
        setActiveView(profile.role === 'ADMIN' ? 'admin' : 'buyer');
      }
    };

    let unsubscribe = () => {};
    try {
      loadCatalog().catch((error) => console.error('Failed to load catalog', error));
      loadExchangeConfig().catch((error) => console.error('Failed to load exchange config', error));
      loadShoppingTrip().catch((error) => console.error('Failed to load shopping trip', error));
      const supabase = getSupabaseClient();
      const realtimeChannel = supabase
        .channel('app-data-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) loadUserOrders(session.user.id).catch((error) => console.error('Failed to refresh orders', error));
          });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) loadUserOrders(session.user.id).catch((error) => console.error('Failed to refresh order items', error));
          });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) loadUserOrders(session.user.id).catch((error) => console.error('Failed to refresh payments', error));
          });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'custom_requests' }, () => {
          loadCustomRequests().catch((error) => console.error('Failed to refresh custom requests', error));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          loadCatalog().catch((error) => console.error('Failed to refresh products', error));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_trips' }, () => {
          loadShoppingTrip().catch((error) => console.error('Failed to refresh shopping trip', error));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'refunds' }, () => {
          loadRefunds().catch((error) => console.error('Failed to refresh refunds', error));
        })
        .subscribe();
      unsubscribe = () => {
        realtimeChannel.unsubscribe();
      };
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setOrders([]);
          loadProfile(session.user.id).catch((error) => console.error('Failed to load profile', error));
          loadUserCart(session.user.id).catch((error) => console.error('Failed to load cart', error));
          loadUserOrders(session.user.id).catch((error) => console.error('Failed to load orders', error));
          loadCustomRequests().catch((error) => console.error('Failed to load custom requests', error));
          loadRefunds().catch((error) => console.error('Failed to load refunds', error));
        }
      });
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setOrders([]);
          loadProfile(session.user.id).catch((error) => console.error('Failed to load profile', error));
          loadUserCart(session.user.id).catch((error) => console.error('Failed to load cart', error));
          loadUserOrders(session.user.id).catch((error) => console.error('Failed to load orders', error));
          loadCustomRequests().catch((error) => console.error('Failed to load custom requests', error));
          loadRefunds().catch((error) => console.error('Failed to load refunds', error));
        } else if (isMounted) {
          setCurrentUser(null);
          setActiveView('buyer');
        }
      });
      unsubscribe = () => data.subscription.unsubscribe();
    } catch (error) {
      console.error(error);
    }

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Business data is stored in Supabase only. Legacy localStorage is backup-only and no longer used as the source of truth.
  const saveState = (_updated: Record<string, unknown>) => {
    // intentionally left blank: business state persists in Supabase
  };

  // Auth Operations
  const login = async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: usernameToAuthEmail(usernameInput),
      password: passwordInput,
    });
    if (error || !data.user) return false;
    return true;
  };

  const logout = async (): Promise<void> => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    const supabase = getSupabaseClient();
    const username = userData.username.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: usernameToAuthEmail(username),
      password: userData.password,
    });
    if (error || !data.user) return false;

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      username,
      name: userData.name,
      phone: userData.phone,
      address: userData.address,
      city: userData.city,
      role: 'CUSTOMER',
    });
    if (profileError) {
      await supabase.auth.signOut();
      return false;
    }
    return true;
  };

  // Configurations
  const setExchangeConfig = async (config: ExchangeConfig): Promise<void> => {
    const { error } = await getSupabaseClient().rpc('update_exchange_config', {
      p_thb_to_idr_rate: config.thbToIdrRate,
      p_markup_percent: config.markupPercent,
      p_base_fee_per_item_idr: config.baseFeePerItemIDR,
      p_weight_rate_per_100g_idr: config.weightRatePer100gIDR,
    });
    if (error) throw error;
    setExchangeConfigState(config);
    saveState({ exchangeConfig: config });
  };

  const updateExchangeRate = async (rate: number, markup: number): Promise<void> => {
    const updated = {
      ...exchangeConfig,
      thbToIdrRate: rate,
      markupPercent: markup,
    };
    await setExchangeConfig(updated);
  };

  const addProduct = async (prod: Product): Promise<void> => {
    const { error } = await getSupabaseClient().from('products').insert({
      id: prod.id,
      name: prod.name,
      thai_name: prod.thaiName || null,
      brand: prod.brand,
      category: prod.category,
      store_id: prod.storeId,
      store_name: prod.storeName,
      price_thb: prod.priceTHB,
      weight_grams: prod.weightGrams,
      image_url: prod.image,
      description: prod.description,
      variants: prod.variants || [],
      popular_badge: prod.popularBadge || null,
      is_pre_order: prod.isPreOrder || false,
      stock_status: prod.stockStatus,
    });
    if (error) throw error;
    const updated = [prod, ...products];
    setProducts(updated);
    saveState({ products: updated });
  };

  const updateProduct = async (id: string, product: Omit<Product, 'id'>): Promise<void> => {
    const { error } = await getSupabaseClient().from('products').update({
      name: product.name,
      thai_name: product.thaiName || null,
      brand: product.brand,
      category: product.category,
      store_id: product.storeId,
      store_name: product.storeName,
      price_thb: product.priceTHB,
      weight_grams: product.weightGrams,
      image_url: product.image,
      description: product.description,
      variants: product.variants || [],
      popular_badge: product.popularBadge || null,
      is_pre_order: product.isPreOrder || false,
      stock_status: product.stockStatus,
    }).eq('id', id);
    if (error) throw error;
    const updated = products.map((existing) => existing.id === id ? { ...product, id } : existing);
    setProducts(updated);
    saveState({ products: updated });
  };

  const deleteProduct = async (id: string): Promise<void> => {
    const { error } = await getSupabaseClient().from('products').delete().eq('id', id);
    if (error) throw error;
    const updated = products.filter((product) => product.id !== id);
    setProducts(updated);
    saveState({ products: updated });
  };

  const updateTrip = async (updated: Partial<ShoppingTrip>): Promise<void> => {
    const newTrip = { ...trip, ...updated };
    const { error } = await getSupabaseClient().from('shopping_trips').upsert({
      id: newTrip.id,
      title: newTrip.title,
      destination: newTrip.destination,
      start_date: newTrip.startDate,
      end_date: newTrip.endDate,
      order_close_date: newTrip.orderCloseDate,
      flight_date: newTrip.flightDate,
      delivery_date: newTrip.deliveryDate,
      status: newTrip.status,
      quota_percent: newTrip.quotaPercent,
      current_shopper_location: newTrip.currentShopperLocation,
      announcement: newTrip.announcement,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    setTripState(newTrip);
    saveState({ trip: newTrip });
  };

  const submitCustomRequest = async (reqData: Omit<CustomRequest, 'id' | 'createdAt' | 'status'>): Promise<string> => {
    const newId = `cr-${Date.now().toString().slice(-4)}`;
    const newRequest: CustomRequest = {
      ...reqData,
      id: newId,
      status: 'PENDING_REVIEW',
      createdAt: new Date().toISOString(),
    };
    if (!currentUser?.id) throw new Error('Silakan login sebelum membuat request.');
    const { error } = await getSupabaseClient().from('custom_requests').insert({
      id: newId,
      user_id: currentUser.id,
      user_name: newRequest.userName,
      user_phone: newRequest.userPhone,
      item_name: newRequest.itemName,
      brand_or_store: newRequest.brandOrStore,
      notes: newRequest.notes,
      reference_url: newRequest.referenceUrl || null,
      image_url: newRequest.imageUrl,
      target_price_thb: newRequest.targetPriceTHB,
      estimated_weight_grams: newRequest.estimatedWeightGrams,
      status: newRequest.status,
    });
    if (error) throw error;
    const updated = [newRequest, ...customRequests];
    setCustomRequests(updated);
    saveState({ customRequests: updated });
    return newId;
  };

  const updateCustomRequestStatus = async (
    id: string, 
    status: CustomRequest['status'], 
    adminNotes?: string, 
    quotedPriceTHB?: number
  ): Promise<void> => {
    const { error } = await getSupabaseClient().from('custom_requests').update({
      status,
      admin_notes: adminNotes || null,
      quoted_price_thb: quotedPriceTHB ?? null,
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    if (error) throw error;
    const updated = customRequests.map((req) => {
      if (req.id === id) {
        return {
          ...req,
          status,
          adminNotes: adminNotes ?? req.adminNotes,
          quotedPriceTHB: quotedPriceTHB ?? req.quotedPriceTHB,
        };
      }
      return req;
    });
    setCustomRequests(updated);
    saveState({ customRequests: updated });
  };

  // Cart operations per User
  const addToCart = async (item: Omit<CartItem, 'id'>): Promise<void> => {
    const targetUserId = currentUser?.id || 'guest';
    const newItem: CartItem = {
      ...item,
      id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: targetUserId,
    };
    if (targetUserId !== 'guest') {
      const supabase = getSupabaseClient();
      const { data: cartRecord, error: cartError } = await supabase
        .from('carts')
        .upsert({ user_id: targetUserId }, { onConflict: 'user_id' })
        .select('id')
        .single();
      if (cartError) throw cartError;

      const { data: savedItem, error: itemError } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cartRecord.id,
          product_id: item.productId || null,
          name: item.name,
          store_name: item.storeName,
          price_thb: item.priceTHB,
          quantity: item.quantity,
          weight_grams: item.weightGrams,
          selected_variant: item.selectedVariant || null,
          notes: item.notes || null,
          image_url: item.image,
          is_custom_request: item.isCustomRequest || false,
        })
        .select('*')
        .single();
      if (itemError) throw itemError;
      const savedCartItem: CartItem = {
        ...item,
        id: savedItem.id,
        userId: targetUserId,
      };
      setUserCarts((current) => ({
        ...current,
        [targetUserId]: [...(current[targetUserId] || []), savedCartItem],
      }));
      setIsCartOpen(true);
      return;
    }

    const currentList = userCarts[targetUserId] || [];
    const updatedList = [...currentList, newItem];
    const newUserCarts = {
      ...userCarts,
      [targetUserId]: updatedList,
    };
    setUserCarts(newUserCarts);
    saveState({ userCarts: newUserCarts });
    setIsCartOpen(true);
  };

  const removeFromCart = async (cartItemId: string): Promise<void> => {
    const targetUserId = currentUser?.id || 'guest';
    if (targetUserId !== 'guest') {
      const { error } = await getSupabaseClient().from('cart_items').delete().eq('id', cartItemId);
      if (error) throw error;
    }
    const currentList = userCarts[targetUserId] || [];
    const updatedList = currentList.filter((i) => i.id !== cartItemId);
    const newUserCarts = {
      ...userCarts,
      [targetUserId]: updatedList,
    };
    setUserCarts(newUserCarts);
    saveState({ userCarts: newUserCarts });
  };

  const updateCartQuantity = async (cartItemId: string, delta: number): Promise<void> => {
    const targetUserId = currentUser?.id || 'guest';
    const currentList = userCarts[targetUserId] || [];
    const existingItem = currentList.find((item) => item.id === cartItemId);
    if (targetUserId !== 'guest' && existingItem) {
      const nextQuantity = existingItem.quantity + delta;
      if (nextQuantity <= 0) {
        await removeFromCart(cartItemId);
        return;
      }
      const { error } = await getSupabaseClient().from('cart_items').update({ quantity: nextQuantity }).eq('id', cartItemId);
      if (error) throw error;
    }
    const updatedList = currentList
      .map((item) => {
        if (item.id === cartItemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter((i): i is CartItem => i !== null);

    const newUserCarts = {
      ...userCarts,
      [targetUserId]: updatedList,
    };
    setUserCarts(newUserCarts);
    saveState({ userCarts: newUserCarts });
  };

  const clearCart = async (): Promise<void> => {
    const targetUserId = currentUser?.id || 'guest';
    if (targetUserId !== 'guest') {
      const cartRecord = await getSupabaseClient().from('carts').select('id').eq('user_id', targetUserId).maybeSingle();
      if (cartRecord.error) throw cartRecord.error;
      if (cartRecord.data) {
        const { error } = await getSupabaseClient().from('cart_items').delete().eq('cart_id', cartRecord.data.id);
        if (error) throw error;
      }
    }
    const newUserCarts = {
      ...userCarts,
      [targetUserId]: [],
    };
    setUserCarts(newUserCarts);
    saveState({ userCarts: newUserCarts });
  };

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Calculations
  const calculatePriceBreakdown = (priceTHB: number, weightGrams: number = 100): PriceBreakdown => {
    const rawIdr = Math.round(priceTHB * exchangeConfig.thbToIdrRate);
    const markupIdr = Math.round(rawIdr * (exchangeConfig.markupPercent / 100));
    const baseWithMarkupIdr = rawIdr + markupIdr;
    const jastipFeeIdr = exchangeConfig.baseFeePerItemIDR;
    const weightFeeIdr = Math.round((Math.max(weightGrams, 50) / 100) * exchangeConfig.weightRatePer100gIDR);
    const landedSingleItemIdr = baseWithMarkupIdr + jastipFeeIdr + weightFeeIdr;

    return {
      rawIdr,
      markupIdr,
      baseWithMarkupIdr,
      jastipFeeIdr,
      weightFeeIdr,
      landedSingleItemIdr,
    };
  };

  const formatIDR = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTHB = (amount: number): string => {
    return `฿${amount.toLocaleString('en-US')}`;
  };

  // Orders: Total Cart Checkout (Grand Total)
  const createOrder = async ({
    customerName,
    customerWhatsapp,
    customerAddress,
    customerCity,
    paymentMethod,
  }: {
    customerName: string;
    customerWhatsapp: string;
    customerAddress: string;
    customerCity: string;
    paymentMethod: 'QRIS' | 'BCA' | 'MANDIRI';
  }): Promise<Order> => {
    let subtotalTHB = 0;
    let subtotalIDR = 0;
    let jastipFeeIDR = 0;
    let weightFeeIDR = 0;

    cart.forEach((item) => {
      const breakdown = calculatePriceBreakdown(item.priceTHB, item.weightGrams);
      subtotalTHB += item.priceTHB * item.quantity;
      subtotalIDR += breakdown.baseWithMarkupIdr * item.quantity;
      jastipFeeIDR += breakdown.jastipFeeIdr * item.quantity;
      weightFeeIDR += breakdown.weightFeeIdr * item.quantity;
    });

    const totalIDR = subtotalIDR + jastipFeeIDR + weightFeeIDR;
    const newOrderNumber = `JSTP-TH-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrderId = `ord-${Date.now()}`;

    const newOrder: Order = {
      id: newOrderId,
      userId: currentUser?.id,
      orderNumber: newOrderNumber,
      customerName,
      customerWhatsapp,
      customerAddress,
      customerCity,
      items: cart.map((item) => ({
        ...item,
        orderedQuantity: item.quantity,
        purchasedQuantity: 0,
        fulfillmentStatus: 'PENDING' as const,
        shortageResolution: 'PENDING' as const,
      })),
      subtotalTHB,
      subtotalIDR,
      jastipFeeIDR,
      weightFeeIDR,
      totalIDR,
      paymentMethod,
      paymentStatus: 'UNPAID',
      status: 'AWAITING_PAYMENT',
      createdAt: new Date().toISOString(),
      trackingNumber: `PXL-BKK-${Math.floor(100000 + Math.random() * 900000)}`,
      trackingSteps: [
        {
          status: 'AWAITING_PAYMENT',
          title: 'Pesanan Dibuat & Menunggu Pembayaran',
          description: `Menunggu verifikasi pembayaran ${paymentMethod} total ${formatIDR(totalIDR)}.`,
          location: 'Jakarta, Indonesia',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          completed: false,
        },
        {
          status: 'IN_SHOPPING_QUEUE',
          title: 'Masuk Antrean Rute Shopper Bangkok',
          description: 'Daftar titipan masuk rute mall Siam Square & Pratunam.',
          location: 'Bangkok, Thailand',
          timestamp: 'Baru saja',
          completed: false,
          current: false,
        },
        {
          status: 'PURCHASED',
          title: 'Barang Dibelikan di Toko Bangkok',
          description: 'Shopper membelikan barang langsung di outlet resmi.',
          location: 'Bangkok Store Outlets',
          completed: false,
        },
        {
          status: 'PACKED_BANGKOK',
          title: 'Packing Ekstra Koper & Bubble Wrap',
          description: 'Dipacking aman dengan segel pelindung.',
          location: 'Bangkok Hub Hotel',
          completed: false,
        },
        {
          status: 'AIR_CARGO_TO_JKT',
          title: 'Terbang Bagasi Bangkok ✈️ Jakarta',
          description: 'Penerbangan kargo bagasi tiba di Bandara Soekarno Hatta.',
          location: 'Flight BKK - CGK',
          completed: false,
        },
        {
          status: 'ARRIVED_JKT_HUB',
          title: 'Sortir Hub Jakarta & Quality Control',
          description: 'Unboxing koper dan sortir pengiriman.',
          location: 'Hub Jastipyudin Jakarta',
          completed: false,
        },
        {
          status: 'SHIPPED_DOMESTIC',
          title: 'Dikirim ke Alamat Pembeli',
          description: 'Pesanan dikirimkan langsung ke alamat tujuan.',
          location: `${customerCity}`,
          completed: false,
        },
      ],
    };

    if (!currentUser?.id) throw new Error('Silakan login sebelum membuat pesanan.');
    const supabase = getSupabaseClient();
    const { error: orderError } = await supabase.from('orders').insert({
      id: newOrder.id,
      order_number: newOrder.orderNumber,
      user_id: currentUser.id,
      customer_name: newOrder.customerName,
      customer_whatsapp: newOrder.customerWhatsapp,
      customer_address: newOrder.customerAddress,
      customer_city: newOrder.customerCity,
      subtotal_thb: newOrder.subtotalTHB,
      subtotal_idr: newOrder.subtotalIDR,
      jastip_fee_idr: newOrder.jastipFeeIDR,
      weight_fee_idr: newOrder.weightFeeIDR,
      total_idr: newOrder.totalIDR,
      payment_method: newOrder.paymentMethod,
      payment_status: newOrder.paymentStatus,
      order_status: newOrder.status,
      payment_proof_url: newOrder.paymentProofUrl || null,
      tracking_number: newOrder.trackingNumber || null,
      tracking_steps: newOrder.trackingSteps,
    });
    if (orderError) throw orderError;

    const { error: itemsError } = await supabase.from('order_items').insert(newOrder.items.map((item) => ({
      id: item.id,
      order_id: newOrder.id,
      product_id: item.productId || null,
      name: item.name,
      store_name: item.storeName,
      price_thb: item.priceTHB,
      weight_grams: item.weightGrams,
      ordered_quantity: item.orderedQuantity ?? item.quantity,
      purchased_quantity: item.purchasedQuantity ?? 0,
      selected_variant: item.selectedVariant || null,
      notes: item.notes || null,
      image_url: item.image,
      is_custom_request: item.isCustomRequest || false,
      fulfillment_status: item.fulfillmentStatus || 'PENDING',
      fulfillment_note: item.fulfillmentNote || null,
      shortage_resolution: item.shortageResolution || 'PENDING',
    })));
    if (itemsError) throw itemsError;

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    setCurrentActiveOrderId(newOrderId);
    await clearCart();
    saveState({ orders: updatedOrders, currentActiveOrderId: newOrderId });

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, photoProofUrl?: string): Promise<void> => {
    const updated = orders.map((order) => {
      if (order.id === orderId) {
        const stepOrder: OrderStatus[] = [
          'AWAITING_PAYMENT',
          'PAID',
          'IN_SHOPPING_QUEUE',
          'PURCHASED',
          'PACKED_BANGKOK',
          'AIR_CARGO_TO_JKT',
          'ARRIVED_JKT_HUB',
          'SHIPPED_DOMESTIC',
          'DELIVERED',
        ];
        const targetIndex = stepOrder.indexOf(status);

        const updatedSteps = order.trackingSteps.map((step) => {
          const thisIndex = stepOrder.indexOf(step.status);
          const isDone = thisIndex <= targetIndex;
          const isCurr = thisIndex === targetIndex;
          return {
            ...step,
            completed: isDone,
            current: isCurr,
            photoProofUrl: step.status === 'PURCHASED' && photoProofUrl ? photoProofUrl : step.photoProofUrl,
            timestamp: isCurr ? new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : step.timestamp,
          };
        });

        return {
          ...order,
          status,
          trackingSteps: updatedSteps,
        };
      }
      return order;
    });

    const changedOrder = updated.find((order) => order.id === orderId);
    if (changedOrder) {
      const { error } = await getSupabaseClient().from('orders').update({
        order_status: changedOrder.status,
        tracking_steps: changedOrder.trackingSteps,
      }).eq('id', orderId);
      if (error) throw error;
    }
    setOrders(updated);
    saveState({ orders: updated });
  };

  const updateOrderItemStatus = async (
    orderId: string,
    itemId: string,
    status: FulfillmentStatus,
    fulfillmentNote?: string
  ): Promise<void> => {
    const updated = orders.map((order) => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        items: order.items.map((item) => {
          if (item.id !== itemId) return item;
          const orderedQuantity = item.orderedQuantity ?? item.quantity;
          return {
            ...item,
            orderedQuantity,
            purchasedQuantity: status === 'PURCHASED' ? orderedQuantity : status === 'FAILED' || status === 'CANCELLED' ? 0 : item.purchasedQuantity,
            fulfillmentStatus: status,
            shortageResolution: status === 'PURCHASED' ? undefined : item.shortageResolution || 'PENDING',
            fulfillmentNote: fulfillmentNote?.trim() || undefined,
          };
        }),
      };
    });
    const changedOrder = updated.find((order) => order.id === orderId);
    const changedItem = changedOrder?.items.find((item) => item.id === itemId);
    if (changedItem) {
      const { error } = await getSupabaseClient().from('order_items').update({
        purchased_quantity: changedItem.purchasedQuantity ?? 0,
        fulfillment_status: changedItem.fulfillmentStatus,
        fulfillment_note: changedItem.fulfillmentNote || null,
        shortage_resolution: changedItem.shortageResolution || 'PENDING',
      }).eq('id', itemId).eq('order_id', orderId);
      if (error) throw error;
      if (status === 'FAILED' || status === 'CANCELLED') {
        const { error: refundError } = await getSupabaseClient().rpc('create_order_item_refund', { p_order_item_id: itemId });
        if (refundError) throw refundError;
        await loadRefunds();
      }
    }
    setOrders(updated);
    saveState({ orders: updated });
  };

  const updateOrderItemFulfillment = async (
    orderId: string,
    itemId: string,
    purchasedQuantity: number,
    fulfillmentNote?: string
  ): Promise<void> => {
    const updated = orders.map((order) => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        items: order.items.map((item) => {
          if (item.id !== itemId) return item;
          const orderedQuantity = item.orderedQuantity ?? item.quantity;
          const actualQuantity = Math.max(0, Math.min(orderedQuantity, Math.floor(purchasedQuantity)));
          const status: FulfillmentStatus = actualQuantity === orderedQuantity
            ? 'PURCHASED'
            : actualQuantity > 0
              ? 'PARTIAL'
              : 'FAILED';
          return {
            ...item,
            orderedQuantity,
            purchasedQuantity: actualQuantity,
            fulfillmentStatus: status,
            shortageResolution: actualQuantity === orderedQuantity ? undefined : 'PENDING' as const,
            fulfillmentNote: fulfillmentNote?.trim() || undefined,
          };
        }),
      };
    });
    const changedOrder = updated.find((order) => order.id === orderId);
    const changedItem = changedOrder?.items.find((item) => item.id === itemId);
    if (changedItem) {
      const { error } = await getSupabaseClient().from('order_items').update({
        purchased_quantity: changedItem.purchasedQuantity ?? 0,
        fulfillment_status: changedItem.fulfillmentStatus,
        fulfillment_note: changedItem.fulfillmentNote || null,
        shortage_resolution: changedItem.shortageResolution || 'PENDING',
      }).eq('id', itemId).eq('order_id', orderId);
      if (error) throw error;
      if (changedItem.fulfillmentStatus === 'FAILED') {
        const { error: refundError } = await getSupabaseClient().rpc('create_order_item_refund', { p_order_item_id: itemId });
        if (refundError) throw refundError;
        await loadRefunds();
      }
    }
    setOrders(updated);
    saveState({ orders: updated });
  };

  const resolveOrderItemShortage = async (
    orderId: string,
    itemId: string,
    resolution: ShortageResolution
  ): Promise<void> => {
    const updated = orders.map((order) => {
      if (order.id !== orderId) return order;
      const items = order.items.map((item) => {
        if (item.id !== itemId) return item;
        const orderedQuantity = item.orderedQuantity ?? item.quantity;
        const purchasedQuantity = item.purchasedQuantity ?? 0;
        return { ...item, shortageResolution: resolution };
      });
      const refundAmountIDR = items.reduce((total, item) => {
        if (item.shortageResolution !== 'REFUND' && item.shortageResolution !== 'CANCEL') return total;
        const orderedQuantity = item.orderedQuantity ?? item.quantity;
        const purchasedQuantity = item.purchasedQuantity ?? 0;
        const missingQuantity = Math.max(0, orderedQuantity - purchasedQuantity);
        return total + calculatePriceBreakdown(item.priceTHB, item.weightGrams).landedSingleItemIdr * missingQuantity;
      }, 0);
      return { ...order, items, refundAmountIDR };
    });
    const changedOrder = updated.find((order) => order.id === orderId);
    const changedItem = changedOrder?.items.find((item) => item.id === itemId);
    if (changedItem) {
      const { error } = await getSupabaseClient().rpc('resolve_order_item_shortage', {
        p_order_item_id: itemId,
        p_resolution: changedItem.shortageResolution,
      });
      if (error) throw error;
      if (resolution === 'REFUND' || resolution === 'CANCEL') {
        const { error: refundError } = await getSupabaseClient().rpc('create_order_item_refund', { p_order_item_id: itemId });
        if (refundError) throw refundError;
        await loadRefunds();
      }
    }
    setOrders(updated);
    saveState({ orders: updated });
  };

  const markOrderPaid = async (orderId: string, proofUrl?: string): Promise<void> => {
    const updated = orders.map((order) => {
      if (order.id === orderId) {
        return {
          ...order,
          paymentStatus: 'CONFIRMED' as const,
          paymentProofUrl: proofUrl || order.paymentProofUrl,
          status: order.status === 'AWAITING_PAYMENT' ? 'IN_SHOPPING_QUEUE' : order.status,
        };
      }
      return order;
    });
    const changedOrder = updated.find((order) => order.id === orderId);
    if (changedOrder) {
      const supabase = getSupabaseClient();
      const { error } = await supabase.rpc('confirm_order_payment', {
        p_order_id: orderId,
        p_proof_url: proofUrl || null,
      });
      if (error) throw error;
    }
    setOrders(updated);
    saveState({ orders: updated });
  };

  const submitPayment = async (orderId: string, amountIDR: number, method: Order['paymentMethod'], proofFile: File): Promise<void> => {
    if (!currentUser?.id) throw new Error('Silakan login sebelum mengirim pembayaran.');
    const supabase = getSupabaseClient();
    const extension = proofFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const proofPath = `${currentUser.id}/${orderId}-${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from('payment-proofs').upload(proofPath, proofFile, {
      contentType: proofFile.type,
      upsert: false,
    });
    if (uploadError) throw uploadError;
    const { error } = await supabase.rpc('submit_order_payment', {
      p_order_id: orderId,
      p_amount_idr: amountIDR,
      p_method: method,
      p_proof_url: proofPath,
    });
    if (error) throw error;
    setOrders((current) => {
      const updated = current.map((item) => item.id === orderId ? { ...item, paymentStatus: 'VERIFYING' as const } : item);
      saveState({ orders: updated });
      return updated;
    });
  };

  const updateRefundStatus = async (refundId: string, status: RefundStatus, paymentReference?: string, adminNote?: string): Promise<void> => {
    if (!currentUser?.id) throw new Error('Silakan login sebagai admin.');
    const { error } = await getSupabaseClient().from('refunds').update({
      status,
      payment_reference: paymentReference || null,
      admin_note: adminNote || null,
      processed_by: status === 'COMPLETED' ? currentUser.id : null,
      processed_at: status === 'COMPLETED' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }).eq('id', refundId);
    if (error) throw error;
    await loadRefunds();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        register,
        isAuthModalOpen,
        setIsAuthModalOpen,
        exchangeConfig,
        setExchangeConfig,
        updateExchangeRate,
        stores,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        trip,
        updateTrip,
        customRequests,
        submitCustomRequest,
        updateCustomRequestStatus,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotalCount,
        orders,
        createOrder,
        updateOrderStatus,
        updateOrderItemStatus,
        updateOrderItemFulfillment,
        resolveOrderItemShortage,
        markOrderPaid,
        refunds,
        updateRefundStatus,
        submitPayment,
        currentActiveOrderId,
        setCurrentActiveOrderId,
        activeView,
        setActiveView,
        buyerTab,
        setBuyerTab,
        isCartOpen,
        setIsCartOpen,
        isCustomModalOpen,
        setIsCustomModalOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        selectedProduct,
        setSelectedProduct,
        calculatePriceBreakdown,
        formatIDR,
        formatTHB,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
