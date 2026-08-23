'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { 
  ShieldCheck, 
  MapPin, 
  DollarSign, 
  Plane, 
  CheckCircle2, 
  Check, 
  Compass,
  FileCheck,
  Pencil,
  Trash2,
  Plus,
  Send,
  Globe,
  Lock,
  ShoppingBag,
  ClipboardList,
  ChevronDown
} from 'lucide-react';
import { Product, TripStatus, OrderStatus, CategoryType, FulfillmentStatus, RefundStatus } from '@/types';

const RefundRow: React.FC<{
  refund: { id: string; orderId: string; orderItemId: string; amountIDR: number; reason: string; status: RefundStatus; paymentReference?: string; adminNote?: string; createdAt?: string; };
  itemName?: string;
  customerName?: string;
  formatIDR: (amount: number) => string;
  updateRefundStatus: (refundId: string, status: RefundStatus, paymentReference?: string, adminNote?: string) => Promise<void>;
  showToast: (message: string) => void;
}> = ({ refund, itemName, customerName, formatIDR, updateRefundStatus, showToast }) => {
  const [status, setStatus] = useState<RefundStatus>(refund.status);
  const [paymentReference, setPaymentReference] = useState(refund.paymentReference || '');
  const [adminNote, setAdminNote] = useState(refund.adminNote || '');

  const statusClasses: Record<RefundStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    PROCESSING: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    COMPLETED: 'bg-green-100 text-green-700 border border-green-200',
    FAILED: 'bg-red-100 text-red-700 border border-red-200',
  };

  const formatRefundDate = (value?: string) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">{customerName || 'Customer'}</p>
          <p className="text-sm font-black text-slate-900">{itemName || `Item ${refund.orderItemId}`}</p>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black ${statusClasses[status]}`}>
            {status}
          </span>
          <p className="mt-2 text-sm font-black text-rose-600">{formatIDR(refund.amountIDR)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <span>Subtotal item</span>
        <span>{formatRefundDate(refund.createdAt)}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <select value={status} onChange={(event) => setStatus(event.target.value as RefundStatus)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold">
          <option value="PENDING">PENDING</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="FAILED">FAILED</option>
        </select>
        <input value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} placeholder="No. referensi transfer" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
        <button type="button" onClick={async () => { try { await updateRefundStatus(refund.id, status, paymentReference, adminNote); showToast('Status refund berhasil diperbarui.'); } catch (error) { showToast(error instanceof Error ? error.message : 'Gagal memperbarui refund.'); } }} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-3 py-2 text-xs font-bold">Simpan Refund</button>
      </div>
      <input value={adminNote} onChange={(event) => setAdminNote(event.target.value)} placeholder="Catatan admin" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const { 
    currentUser,
    exchangeConfig, 
    setExchangeConfig, 
    trip, 
    updateTrip, 
    orders, 
    updateOrderStatus, 
    updateOrderItemStatus,
    updateOrderItemFulfillment,
    markOrderPaid,
    refunds,
    updateRefundStatus,
    customRequests, 
    updateCustomRequestStatus, 
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    stores,
    formatIDR, 
    formatTHB,
    calculatePriceBreakdown
  } = useApp();

  const [activeTab, setActiveTab] = useState<'routes' | 'currency' | 'trip' | 'requests' | 'manage' | 'list' | 'payments' | 'refunds' | 'sales'>('routes');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Currency controller state
  const [rateInput, setRateInput] = useState<number>(exchangeConfig.thbToIdrRate);
  const [markupInput, setMarkupInput] = useState<number>(exchangeConfig.markupPercent);
  const [baseFeeInput, setBaseFeeInput] = useState<number>(exchangeConfig.baseFeePerItemIDR);
  const [weightRateInput, setWeightRateInput] = useState<number>(exchangeConfig.weightRatePer100gIDR);

  // Trip editor state
  const [tripTitle, setTripTitle] = useState(trip.title);
  const [tripStatus, setTripStatus] = useState<TripStatus>(trip.status);
  const [tripLocation, setTripLocation] = useState(trip.currentShopperLocation);
  const [tripQuota, setTripQuota] = useState(trip.quotaPercent);
  const [tripCloseDate, setTripCloseDate] = useState(trip.orderCloseDate);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Omit<Product, 'id'>>({
    name: '',
    brand: '',
    category: 'FASHION',
    storeId: 'gentle-woman-siam',
    storeName: 'Gentle Woman Flagship Store',
    priceTHB: 0,
    weightGrams: 100,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    description: '',
    variants: [],
    popularBadge: '',
    isPreOrder: false,
    stockStatus: 'AVAILABLE',
  });
  const [requestEdits, setRequestEdits] = useState<Record<string, { priceTHB: number; weightGrams: number; adminNotes: string }>>({});
  const [fulfillmentNotes, setFulfillmentNotes] = useState<Record<string, string>>({});
  const [purchasedQuantities, setPurchasedQuantities] = useState<Record<string, number>>({});
  const [openCustomers, setOpenCustomers] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleSaveCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setExchangeConfig({
        thbToIdrRate: Number(rateInput),
        markupPercent: Number(markupInput),
        baseFeePerItemIDR: Number(baseFeeInput),
        weightRatePer100gIDR: Number(weightRateInput),
      });
      showToast('Kurs & markup berhasil diperbarui secara realtime!');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menyimpan kurs.');
    }
  };

  const handleSaveTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateTrip({
        title: tripTitle,
        status: tripStatus,
        currentShopperLocation: tripLocation,
        quotaPercent: Number(tripQuota),
        orderCloseDate: tripCloseDate,
      });
      showToast('Event trip Bangkok berhasil disimpan!');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menyimpan event trip.');
    }
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm({
      name: '', brand: '', category: 'FASHION', storeId: stores[0]?.id || '', storeName: stores[0]?.name || '',
      priceTHB: 0, weightGrams: 100, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      description: '', variants: [], popularBadge: '', isPreOrder: false, stockStatus: 'AVAILABLE',
    });
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.brand.trim() || productForm.priceTHB <= 0) return;
    const payload = { ...productForm, variants: productForm.variants?.filter(Boolean) };
    if (editingProductId) updateProduct(editingProductId, payload);
    else addProduct({ ...payload, id: `prod-${Date.now()}` });
    resetProductForm();
    showToast(editingProductId ? 'Produk katalog berhasil diperbarui!' : 'Produk berhasil ditambahkan ke katalog!');
  };

  const editProduct = (product: Product) => {
    const { id, ...form } = product;
    setEditingProductId(id);
    setProductForm(form);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getRequestEdit = (req: typeof customRequests[number]) => requestEdits[req.id] || {
    priceTHB: req.quotedPriceTHB || req.targetPriceTHB,
    weightGrams: req.estimatedWeightGrams,
    adminNotes: req.adminNotes || '',
  };

  const sendRequestOffer = (req: typeof customRequests[number]) => {
    const edit = getRequestEdit(req);
    updateCustomRequestStatus(req.id, 'OFFER_SENT', edit.adminNotes || 'Penawaran sudah dikirim ke customer.', edit.priceTHB);
    showToast(`Penawaran ${req.id} berhasil dikirim ke customer.`);
  };

  const publishRequest = (req: typeof customRequests[number], visibility: 'PUBLISHED' | 'PRIVATE_REQUEST') => {
    const edit = getRequestEdit(req);
    if (visibility === 'PUBLISHED') {
      addProduct({
        id: `prod-request-${req.id}-${Date.now()}`,
        name: req.itemName,
        brand: req.brandOrStore,
        category: 'CUSTOM',
        storeId: stores.find((store) => store.name === req.brandOrStore)?.id || stores[0]?.id || '',
        storeName: req.brandOrStore,
        priceTHB: edit.priceTHB,
        weightGrams: edit.weightGrams,
        image: req.imageUrl,
        description: req.notes,
        variants: [],
        popularBadge: 'Request Customer',
        isPreOrder: true,
        stockStatus: 'AVAILABLE',
      });
    }
    updateCustomRequestStatus(req.id, visibility, edit.adminNotes, edit.priceTHB);
    showToast(visibility === 'PUBLISHED' ? 'Request dipublikasikan ke katalog!' : 'Request disimpan sebagai private offer.');
  };

  // Group all order items by Bangkok store location to optimize route
  const fulfillmentByLocation: Record<string, Array<{ orderId: string; orderNumber: string; customerName: string; item: any; orderStatus: OrderStatus }>> = {};

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const locKey = item.storeName || 'Bangkok General Outlets';
      if (!fulfillmentByLocation[locKey]) {
        fulfillmentByLocation[locKey] = [];
      }
      fulfillmentByLocation[locKey].push({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        item,
        orderStatus: order.status,
      });
    });
  });

  const customerGroups = Object.values(orders.reduce<Record<string, {
    customerId: string;
    customerName: string;
    customerWhatsapp: string;
    orders: Array<{ orderId: string; orderNumber: string; item: typeof orders[number]['items'][number] }>;
  }>>((groups, order) => {
    const customerId = order.userId || order.customerWhatsapp || order.customerName;
    if (!groups[customerId]) {
      groups[customerId] = {
        customerId,
        customerName: order.customerName,
        customerWhatsapp: order.customerWhatsapp,
        orders: [],
      };
    }
    order.items.forEach((item) => groups[customerId].orders.push({ orderId: order.id, orderNumber: order.orderNumber, item }));
    return groups;
  }, {}));

  const getItemStatus = (item: typeof orders[number]['items'][number]): FulfillmentStatus => item.fulfillmentStatus || 'PENDING';
  const getCustomerStatus = (items: typeof customerGroups[number]['orders']) => {
    const statuses = items.map(({ item }) => getItemStatus(item));
    if (statuses.some((status) => status === 'FAILED' || status === 'CANCELLED')) return 'Completed with remarks';
    if (statuses.length > 0 && statuses.every((status) => status === 'PURCHASED')) return 'Order Completed';
    return 'Ongoing';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-16">
      
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Admin Dashboard Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 mb-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 text-9xl font-black select-none pointer-events-none">
          ADMIN
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg">
              🇹🇭
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Shopper Ground Control (Bangkok Hub)
                </h1>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  ADMIN JASTIPER
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as: <span className="font-bold text-amber-300">{currentUser?.name || 'Admin'}</span> • Kelola kurs THB/IDR, trip shopping spree, dan optimasi rute belanja Bangkok.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-4 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Kurs Aktif:</span>
              <span className="font-bold text-amber-400">1 THB = Rp {exchangeConfig.thbToIdrRate}</span>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <span className="text-[10px] text-slate-400 block">Total Pesanan:</span>
              <span className="font-bold text-white">{orders.length} Order</span>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <span className="text-[10px] text-slate-400 block">Status Trip:</span>
              <span className="font-bold text-emerald-400">{trip.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation (No Live Drops) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        <button
          onClick={() => setActiveTab('routes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'routes'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Antrean Belanja Berdasarkan Rute ({Object.keys(fulfillmentByLocation).length} Lokasi)</span>
        </button>

        <button
          onClick={() => setActiveTab('currency')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'currency'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Pengatur Kurs & Markup</span>
        </button>

        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'list'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>List Jastip ({customerGroups.length} Customer)</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'payments'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Pembayaran ({orders.filter((order) => order.paymentStatus === 'VERIFYING').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'sales' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Sales Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('refunds')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'refunds' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Refund ({refunds.filter((refund) => refund.status !== 'COMPLETED').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('trip')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'trip'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Plane className="w-4 h-4" />
          <span>Manajemen Event Trip</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'requests'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Review Request Khusus ({customRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('manage')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'manage'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Kelola Jastipan ({customRequests.length})</span>
        </button>
      </div>

      {/* TAB 1: Route-Optimized Order Fulfillment Queue */}
      {activeTab === 'sales' && (() => {
        const confirmedOrders = orders.filter((order) => order.paymentStatus === 'CONFIRMED');
        const grossRevenue = confirmedOrders.reduce((sum, order) => sum + order.totalIDR, 0);
        const totalRefundCompleted = refunds.filter((refund) => refund.status === 'COMPLETED').reduce((sum, refund) => sum + refund.amountIDR, 0);
        const netRevenue = grossRevenue - totalRefundCompleted;
        const totalOrders = confirmedOrders.length;
        const averageOrderValue = totalOrders > 0 ? netRevenue / totalOrders : 0;
        const totalItemsSold = orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + (item.purchasedQuantity ?? 0), 0), 0);
        const conversionRate = orders.length > 0 ? (confirmedOrders.length / orders.length) * 100 : 0;

        const paymentMethodCounts: Record<string, number> = {};
        orders.forEach((order) => {
          paymentMethodCounts[order.paymentMethod] = (paymentMethodCounts[order.paymentMethod] || 0) + 1;
        });

        const paymentStatusCounts: Record<string, number> = { UNPAID: 0, VERIFYING: 0, CONFIRMED: 0, REJECTED: 0 };
        orders.forEach((order) => {
          paymentStatusCounts[order.paymentStatus] = (paymentStatusCounts[order.paymentStatus] || 0) + 1;
        });

        const fulfillmentCounts: Record<string, number> = { PENDING: 0, PURCHASED: 0, PARTIAL: 0, FAILED: 0, CANCELLED: 0 };
        let totalItems = 0;
        orders.forEach((order) => {
          order.items.forEach((item) => {
            const status = item.fulfillmentStatus || 'PENDING';
            fulfillmentCounts[status] = (fulfillmentCounts[status] || 0) + 1;
            totalItems += 1;
          });
        });

        const categorySales: Record<string, number> = {};
        const productSales: Record<string, number> = {};
        orders.forEach((order) => {
          order.items.forEach((item) => {
            const product = products.find((p) => p.id === item.productId);
            const category = product?.category || 'CUSTOM';
            const qty = item.purchasedQuantity ?? item.quantity;
            categorySales[category] = (categorySales[category] || 0) + qty;
            productSales[item.name] = (productSales[item.name] || 0) + qty;
          });
        });
        const topProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5);

        const spendByCustomer: Record<string, { name: string; total: number }> = {};
        confirmedOrders.forEach((order) => {
          const key = order.userId || order.customerName;
          if (!spendByCustomer[key]) spendByCustomer[key] = { name: order.customerName, total: 0 };
          spendByCustomer[key].total += order.totalIDR;
        });
        const topCustomers = Object.values(spendByCustomer).sort((a, b) => b.total - a.total).slice(0, 5);
        const uniqueCustomers = Object.keys(spendByCustomer).length;

        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Sales Dashboard</h3>
              <p className="text-xs text-slate-500 mt-1">Ringkasan penjualan berdasarkan data order & refund saat ini.</p>
            </div>

            {/* Metrik Utama */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <p className="text-[11px] font-bold text-slate-500">Total Revenue (Gross)</p>
                <p className="text-base font-black text-slate-900 mt-1">{formatIDR(grossRevenue)}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <p className="text-[11px] font-bold text-slate-500">Total Refund</p>
                <p className="text-base font-black text-rose-600 mt-1">{formatIDR(totalRefundCompleted)}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <p className="text-[11px] font-bold text-slate-500">Net Revenue</p>
                <p className="text-base font-black text-emerald-600 mt-1">{formatIDR(netRevenue)}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <p className="text-[11px] font-bold text-slate-500">Total Orders</p>
                <p className="text-base font-black text-slate-900 mt-1">{totalOrders}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <p className="text-[11px] font-bold text-slate-500">Average Order Value</p>
                <p className="text-base font-black text-slate-900 mt-1">{formatIDR(averageOrderValue)}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <p className="text-[11px] font-bold text-slate-500">Total Item Terjual</p>
                <p className="text-base font-black text-slate-900 mt-1">{totalItemsSold} pcs</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <p className="text-[11px] font-bold text-slate-500">Conversion Rate Pembayaran</p>
                <p className="text-base font-black text-slate-900 mt-1">{conversionRate.toFixed(1)}%</p>
              </div>
            </div>

            {/* Breakdown Pembayaran */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
              <h4 className="font-extrabold text-slate-900 text-sm mb-3">Breakdown Pembayaran</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 mb-2">Metode Pembayaran</p>
                  <div className="space-y-1.5">
                    {Object.entries(paymentMethodCounts).map(([method, count]) => (
                      <div key={method} className="flex justify-between text-xs">
                        <span className="text-slate-600">{method}</span>
                        <span className="font-bold text-slate-900">{count} order</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 mb-2">Status Pembayaran</p>
                  <div className="space-y-1.5">
                    {Object.entries(paymentStatusCounts).map(([status, count]) => (
                      <div key={status} className="flex justify-between text-xs">
                        <span className="text-slate-600">{status}</span>
                        <span className="font-bold text-slate-900">{count} order</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Fulfillment Health */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
              <h4 className="font-extrabold text-slate-900 text-sm mb-3">Fulfillment Health</h4>
              <div className="space-y-1.5">
                {Object.entries(fulfillmentCounts).map(([status, count]) => {
                  const percent = totalItems > 0 ? Math.round((count / totalItems) * 100) : 0;
                  return (
                    <div key={status} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">{status}</span>
                      <span className="font-bold text-slate-900">{count} item ({percent}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Breakdown Kategori/Produk */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
              <h4 className="font-extrabold text-slate-900 text-sm mb-3">Breakdown Kategori & Produk Terlaris</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 mb-2">Per Kategori (qty terjual)</p>
                  <div className="space-y-1.5">
                    {Object.entries(categorySales).map(([category, qty]) => (
                      <div key={category} className="flex justify-between text-xs">
                        <span className="text-slate-600">{category}</span>
                        <span className="font-bold text-slate-900">{qty} pcs</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 mb-2">Top 5 Produk Terlaris</p>
                  <div className="space-y-1.5">
                    {topProducts.map(([name, qty]) => (
                      <div key={name} className="flex justify-between text-xs">
                        <span className="text-slate-600 truncate max-w-[160px]">{name}</span>
                        <span className="font-bold text-slate-900">{qty} pcs</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Insight */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
              <h4 className="font-extrabold text-slate-900 text-sm mb-3">Customer Insight</h4>
              <p className="text-[11px] text-slate-500 mb-2">Total customer unik yang bertransaksi: <span className="font-bold text-slate-900">{uniqueCustomers}</span></p>
              <p className="text-[11px] font-bold text-slate-500 mb-2">Top 5 Customer by Spend</p>
              <div className="space-y-1.5">
                {topCustomers.map((customer, index) => (
                  <div key={`${customer.name}-${index}`} className="flex justify-between text-xs">
                    <span className="text-slate-600">{customer.name}</span>
                    <span className="font-bold text-slate-900">{formatIDR(customer.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 1: Route-Optimized Order Fulfillment Queue */}
      {activeTab === 'routes' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-amber-700" />
              <div>
                <h3 className="font-bold text-amber-900 text-sm">Optimasi Rute Belanja Bangkok</h3>
                <p className="text-xs text-amber-700">
                  Daftar titipan dikelompokkan per mall/toko di Bangkok agar rute belanja shopper efisien dan tidak bolak-balik.
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-amber-800 bg-white px-3 py-1 rounded-xl border border-amber-300">
              {Object.values(fulfillmentByLocation).flat().length} Total Barang Dibeli
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(fulfillmentByLocation).map(([storeName, itemsList]) => (
              <div key={storeName} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                {/* Store Header */}
                <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <h4 className="font-extrabold text-sm tracking-tight">{storeName}</h4>
                  </div>
                  <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full">
                    {itemsList.length} Item
                  </span>
                </div>

                {/* Items in this Bangkok Store */}
                <div className="p-4 space-y-3 flex-1">
                  {itemsList.map(({ orderId, orderNumber, customerName, item, orderStatus }, idx) => {
                    const isPurchased = orderStatus === 'PURCHASED' || orderStatus === 'PACKED_BANGKOK' || orderStatus === 'AIR_CARGO_TO_JKT' || orderStatus === 'ARRIVED_JKT_HUB' || orderStatus === 'SHIPPED_DOMESTIC';

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isPurchased
                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-200"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <span className="font-bold text-amber-800">{orderNumber}</span>
                            <span>• {customerName}</span>
                          </div>
                          <h5 className="font-bold text-xs truncate leading-snug">{item.name}</h5>
                          {item.selectedVariant && (
                            <p className="text-[11px] text-slate-600 truncate">Varian: {item.selectedVariant}</p>
                          )}
                          <div className="text-[11px] font-extrabold text-slate-900 mt-0.5">
                            {item.quantity}x @ {formatTHB(item.priceTHB)}
                          </div>
                        </div>

                        {/* Fulfillment Action */}
                        <div className="shrink-0">
                          {isPurchased ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-xl">
                              <Check className="w-3.5 h-3.5" />
                              <span>Sudah Dibeli</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                updateOrderItemFulfillment(orderId, item.id, item.orderedQuantity ?? item.quantity, 'Dibeli sesuai pesanan.');
                                showToast(`${item.name} untuk ${orderNumber} ditandai SUDAH DIBELI di ${storeName}!`);
                              }}
                              className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition-transform active:scale-95"
                            >
                              Tandai Dibeli ✓
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer grouped fulfillment list */}
      {activeTab === 'list' && (
        <div className="space-y-5">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">List Jastip per Customer</h3>
            <p className="text-xs text-slate-500 mt-1">Perbarui status setiap barang. Status customer dihitung otomatis dari seluruh barangnya.</p>
          </div>

          {customerGroups.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm text-sm text-slate-500">
              Belum ada item jastip dari customer.
            </div>
          ) : (
            customerGroups.map((customer) => {
              const totalQuantity = customer.orders.reduce((total, entry) => total + entry.item.quantity, 0);
              const customerStatus = getCustomerStatus(customer.orders);
              const isCustomerOpen = openCustomers[customer.customerId] ?? false;
              const statusClass = customerStatus === 'Order Completed'
                ? 'bg-emerald-100 text-emerald-800'
                : customerStatus === 'Completed with remarks'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800';

              return (
                <div key={customer.customerId} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenCustomers((current) => ({
                      ...current,
                      [customer.customerId]: !isCustomerOpen,
                    }))}
                    aria-expanded={isCustomerOpen}
                    className="w-full p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <h4 className="font-black text-slate-900">{customer.customerName}</h4>
                      <p className="text-xs text-slate-500">{customer.customerWhatsapp} • {totalQuantity} barang</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black px-3 py-1.5 rounded-full ${statusClass}`}>{customerStatus}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isCustomerOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {isCustomerOpen && (
                    <div className="p-4 space-y-3">
                      {customer.orders.map(({ orderId, orderNumber, item }) => {
                      const itemStatus = getItemStatus(item);
                      const noteKey = `${orderId}:${item.id}`;
                      const orderedQuantity = item.orderedQuantity ?? item.quantity;
                      const purchasedQuantity = item.purchasedQuantity ?? (itemStatus === 'PURCHASED' ? orderedQuantity : 0);
                      const needsNote = itemStatus === 'FAILED' || itemStatus === 'CANCELLED' || itemStatus === 'PARTIAL';
                      const noteValue = fulfillmentNotes[noteKey] ?? item.fulfillmentNote ?? '';

                        return (
                          <div key={noteKey} className="border border-slate-200 rounded-2xl p-3 flex flex-col lg:flex-row gap-3 lg:items-center">
                          <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h5 className="font-bold text-sm text-slate-900">{item.name}</h5>
                              <span className="text-[10px] font-bold text-slate-400">{orderNumber}</span>
                            </div>
                            <p className="text-xs text-slate-500">Diminta: <span className="font-bold text-slate-800">{orderedQuantity}</span> • Terbeli: <span className="font-bold text-emerald-700">{purchasedQuantity}</span> • {formatTHB(item.priceTHB)} per item</p>
                            {item.selectedVariant && <p className="text-xs text-slate-500">Varian: {item.selectedVariant}</p>}
                            {item.fulfillmentNote && <p className="text-xs text-rose-700 mt-1">Catatan: {item.fulfillmentNote}</p>}
                          </div>
                          <div className="w-full lg:w-48 shrink-0">
                            <div className="flex gap-2">
                              <input
                                type="number"
                                min="0"
                                max={orderedQuantity}
                                value={purchasedQuantities[noteKey] ?? purchasedQuantity}
                                onChange={(event) => setPurchasedQuantities((current) => ({ ...current, [noteKey]: Number(event.target.value) }))}
                                className="w-20 bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs font-bold text-slate-800"
                                aria-label={`Jumlah ${item.name} yang terbeli`}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  updateOrderItemFulfillment(orderId, item.id, purchasedQuantities[noteKey] ?? purchasedQuantity, noteValue);
                                  showToast(`${item.name} diperbarui berdasarkan stok aktual.`);
                                }}
                                className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl px-2 py-2 text-[11px] font-bold"
                              >
                                Simpan Stok
                              </button>
                            </div>
                            <select
                              value={itemStatus}
                              onChange={(event) => {
                                const nextStatus = event.target.value as FulfillmentStatus;
                                updateOrderItemStatus(orderId, item.id, nextStatus, noteValue);
                                showToast(`${item.name} diperbarui menjadi ${nextStatus}.`);
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                            >
                              <option value="PENDING">Pending</option>
                              <option value="PURCHASED">Sudah Dibeli</option>
                              <option value="PARTIAL">Stok Sebagian</option>
                              <option value="FAILED">Gagal Beli</option>
                              <option value="CANCELLED">Cancel</option>
                            </select>
                            {needsNote && (
                              <input
                                required
                                value={noteValue}
                                onChange={(event) => setFulfillmentNotes((current) => ({ ...current, [noteKey]: event.target.value }))}
                                onBlur={() => {
                                  if (noteValue.trim()) updateOrderItemStatus(orderId, item.id, itemStatus, noteValue);
                                }}
                                placeholder="Alasan wajib diisi"
                                className="w-full mt-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-xs"
                              />
                            )}
                          </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-5">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Verifikasi Pembayaran</h3>
            <p className="text-xs text-slate-500 mt-1">Konfirmasi pembayaran setelah dana diterima. Order baru masuk antrean belanja setelah dikonfirmasi.</p>
          </div>
          {orders.filter((order) => order.paymentStatus === 'VERIFYING').length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm text-sm text-slate-500">Tidak ada pembayaran yang menunggu verifikasi.</div>
          ) : (
            orders.filter((order) => order.paymentStatus === 'VERIFYING').map((order) => (
              <div key={order.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black text-amber-700">{order.orderNumber}</p>
                  <h4 className="font-black text-slate-900">{order.customerName}</h4>
                  <p className="text-xs text-slate-500">{order.paymentMethod} • {formatIDR(order.totalIDR)} • {order.items.length} item</p>
                  {order.paymentProofUrl && (
                    <a href={order.paymentProofUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-amber-700 hover:text-amber-900">
                      <img src={order.paymentProofUrl} alt="Bukti transfer" className="w-12 h-12 rounded-lg object-cover border border-amber-200" />
                      Lihat bukti transfer
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await markOrderPaid(order.id);
                      showToast(`Pembayaran ${order.orderNumber} dikonfirmasi.`);
                    } catch (error) {
                      showToast(error instanceof Error ? error.message : 'Gagal mengonfirmasi pembayaran.');
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl"
                >
                  Konfirmasi Pembayaran
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'refunds' && (
        <div className="space-y-5">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Proses Refund</h3>
            <p className="text-xs text-slate-500 mt-1">Catat proses pengembalian dana untuk item yang tidak terbeli.</p>
          </div>
          {refunds.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm text-sm text-slate-500">Belum ada refund.</div>
          ) : (() => {
            const groupedRefunds = refunds.reduce<Record<string, { orderNumber: string; customerName: string; grandTotalIDR: number; items: Array<{ refund: typeof refunds[number]; itemName: string; }> }>>((result, refund) => {
              const order = orders.find((entry) => entry.id === refund.orderId);
              const orderNumber = order?.orderNumber || refund.orderId;
              const customerName = order?.customerName || 'Customer';
              const item = order?.items.find((entry) => entry.id === refund.orderItemId);

              if (!result[orderNumber]) {
                result[orderNumber] = {
                  orderNumber,
                  customerName,
                  grandTotalIDR: 0,
                  items: [],
                };
              }

              result[orderNumber].grandTotalIDR += refund.amountIDR;
              result[orderNumber].items.push({
                refund,
                itemName: item?.name || 'Item tidak tersedia',
              });

              return result;
            }, {});

            return Object.values(groupedRefunds).map((group) => (
              <div key={group.orderNumber} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-amber-700">No. Pesanan</p>
                    <h4 className="text-lg font-black text-slate-900">{group.orderNumber}</h4>
                    <p className="text-xs text-slate-500">{group.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Grand Total Refund</p>
                    <p className="text-base font-black text-rose-600">{formatIDR(group.grandTotalIDR)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {group.items.map(({ refund, itemName }) => (
                    <RefundRow
                      key={refund.id}
                      refund={refund}
                      itemName={itemName}
                      customerName={group.customerName}
                      formatIDR={formatIDR}
                      updateRefundStatus={updateRefundStatus}
                      showToast={showToast}
                    />
                  ))}
                </div>
              </div>
            ));
          })()} 
        </div>
      )}

      {/* TAB 2: Live Exchange Rate Controller */}
      {activeTab === 'currency' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Live Exchange Rate & Fee Controller</h3>
              <p className="text-xs text-slate-500">
                Ubah kurs 1 THB ke IDR dan persentase keuntungan. Seluruh katalog akan otomatis terupdate.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveCurrency} className="space-y-5 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kurs Nilai Tukar (1 THB = X IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={rateInput}
                    onChange={(e) => setRateInput(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Rekomendasi bank rate: Rp 445 - 460</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Markup Margin Service Jastip (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={markupInput}
                    onChange={(e) => setMarkupInput(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500/30"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Standar industri jastip Bangkok: 10% - 15%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Handling Fee Tetap per Item (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    step="1000"
                    value={baseFeeInput}
                    onChange={(e) => setBaseFeeInput(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tarif Kargo Udara per 100 Gram (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    step="1000"
                    value={weightRateInput}
                    onChange={(e) => setWeightRateInput(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl shadow-md text-xs sm:text-sm"
            >
              Simpan & Terapkan Perubahan Kurs
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Trip Management */}
      {activeTab === 'trip' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Manajemen Event Trip Bangkok</h3>
              <p className="text-xs text-slate-500">
                Atur jadwal penerbangan, kuota bagasi koper, dan lokasi belanja terkini shopper di Bangkok.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveTrip} className="space-y-4 mt-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Judul Spree Trip *
              </label>
              <input
                type="text"
                value={tripTitle}
                onChange={(e) => setTripTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Event
                </label>
                <select
                  value={tripStatus}
                  onChange={(e) => setTripStatus(e.target.value as TripStatus)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                >
                  <option value="PLANNING">PLANNING (Buka Titipan Awal)</option>
                  <option value="LIVE_SHOPPING">LIVE_SHOPPING (Shopper di Bangkok)</option>
                  <option value="PACKING">PACKING (Sedang Bungkus Koper)</option>
                  <option value="SHIPPED">SHIPPED (Terbang ke Jakarta)</option>
                  <option value="COMPLETED">COMPLETED (Selesai)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lokasi Shopper Terkini di Bangkok
                </label>
                <input
                  type="text"
                  value={tripLocation}
                  onChange={(e) => setTripLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Waktu Penutupan Order Titipan
                </label>
                <input
                  type="text"
                  value={tripCloseDate}
                  onChange={(e) => setTripCloseDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Persentase Kuota Bagasi Terisi ({tripQuota}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tripQuota}
                  onChange={(e) => setTripQuota(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600 mt-2"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl shadow-md text-xs sm:text-sm mt-2"
            >
              Update Status Trip
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: Custom Requests Queue */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base">
              Antrean Request Khusus dari Pembeli
            </h3>
            <span className="text-xs font-bold text-slate-500">{customRequests.length} Permintaan</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {req.id}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">{req.itemName}</h4>
                      <p className="text-[11px] text-slate-500">Pemesan: <span className="font-semibold text-slate-800">{req.userName}</span> ({req.userPhone})</p>
                    </div>

                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                      req.status === 'APPROVED' || req.status === 'OFFER_SENT' || req.status === 'PUBLISHED' || req.status === 'PRIVATE_REQUEST' ? 'bg-emerald-100 text-emerald-800' :
                      req.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="flex gap-3 mb-3">
                    <img src={req.imageUrl} alt={req.itemName} className="w-20 h-20 rounded-2xl object-cover shrink-0 bg-slate-100 border border-slate-200" />
                    <div className="text-xs text-slate-600 space-y-1">
                      <p><span className="font-semibold text-slate-700">Target Toko:</span> {req.brandOrStore}</p>
                      <p><span className="font-semibold text-slate-700">Catatan:</span> {req.notes}</p>
                      <p><span className="font-semibold text-slate-700">Budget Max THB:</span> {formatTHB(req.targetPriceTHB)}</p>
                    </div>
                  </div>
                </div>

                {req.status !== 'REJECTED' && req.status !== 'PUBLISHED' && req.status !== 'PRIVATE_REQUEST' && (
                  <div className="bg-slate-50 rounded-2xl p-3 space-y-2 mb-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Cek toko & kirim penawaran</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Harga THB"
                        value={getRequestEdit(req).priceTHB}
                        onChange={(e) => setRequestEdits((current) => ({ ...current, [req.id]: { ...getRequestEdit(req), priceTHB: Number(e.target.value) } }))}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Berat gram"
                        value={getRequestEdit(req).weightGrams}
                        onChange={(e) => setRequestEdits((current) => ({ ...current, [req.id]: { ...getRequestEdit(req), weightGrams: Number(e.target.value) } }))}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Catatan admin untuk customer"
                      value={getRequestEdit(req).adminNotes}
                      onChange={(e) => setRequestEdits((current) => ({ ...current, [req.id]: { ...getRequestEdit(req), adminNotes: e.target.value } }))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                    />
                    <p className="text-[10px] text-slate-500">Estimasi IDR: <span className="font-bold text-rose-600">{formatIDR(calculatePriceBreakdown(getRequestEdit(req).priceTHB, getRequestEdit(req).weightGrams).landedSingleItemIdr)}</span></p>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                  {req.status === 'PENDING_REVIEW' && (
                    <>
                      <button
                        onClick={() => {
                          updateCustomRequestStatus(req.id, 'REJECTED', 'Stok toko di Bangkok habis');
                          showToast('Request ditolak');
                        }}
                        className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => {
                          sendRequestOffer(req);
                        }}
                        className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 rounded-xl shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Setujui & Kirim Penawaran
                      </button>
                    </>
                  )}
                  {req.status === 'OFFER_SENT' && (
                    <>
                      <button onClick={() => publishRequest(req, 'PRIVATE_REQUEST')} className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Private Request
                      </button>
                      <button onClick={() => publishRequest(req, 'PUBLISHED')} className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-xl flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" /> Publish ke Catalog
                      </button>
                    </>
                  )}
                  {(req.status === 'PUBLISHED' || req.status === 'PRIVATE_REQUEST') && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      {req.status === 'PUBLISHED' ? 'Tampil di katalog publik' : 'Private offer untuk customer'}
                    </span>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Manage Items */}
      {activeTab === 'manage' && (
        <div className="space-y-5">
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Kelola Jastipan & Titipan</h3>
              <p className="text-xs text-slate-500">
                Kelola item yang tampil di katalog utama. Item request khusus juga dapat dipublish dari menu Request Masuk.
              </p>
            </div>
          </div>

          <form onSubmit={handleProductSubmit} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="font-black text-slate-900">{editingProductId ? 'Edit Item Katalog' : 'Tambah Item Katalog'}</h4>
                <p className="text-xs text-slate-500">Harga dan berat dipakai untuk menghitung estimasi IDR customer.</p>
              </div>
              {editingProductId && <button type="button" onClick={resetProductForm} className="text-xs font-bold text-slate-500 hover:text-slate-900">Batal Edit</button>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input required placeholder="Nama barang *" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
              <input required placeholder="Brand *" value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
              <select value={productForm.storeId} onChange={(e) => { const store = stores.find((item) => item.id === e.target.value); setProductForm({ ...productForm, storeId: e.target.value, storeName: store?.name || productForm.storeName }); }} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium">
                {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
              </select>
              <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value as CategoryType })} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium">
                {(['BEAUTY', 'FASHION', 'SNACKS', 'THAI_POP', 'SEVEN_ELEVEN', 'CUSTOM'] as CategoryType[]).map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
              <input required type="number" min="1" placeholder="Harga THB *" value={productForm.priceTHB || ''} onChange={(e) => setProductForm({ ...productForm, priceTHB: Number(e.target.value) })} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
              <input required type="number" min="1" placeholder="Berat gram *" value={productForm.weightGrams || ''} onChange={(e) => setProductForm({ ...productForm, weightGrams: Number(e.target.value) })} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
              <input placeholder="URL gambar" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:col-span-2" />
              <input placeholder="Varian, pisahkan dengan koma" value={productForm.variants?.join(', ') || ''} onChange={(e) => setProductForm({ ...productForm, variants: e.target.value.split(',').map((variant) => variant.trim()).filter(Boolean) })} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:col-span-2" />
              <textarea placeholder="Deskripsi produk" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:col-span-2 min-h-20" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select value={productForm.stockStatus} onChange={(e) => setProductForm({ ...productForm, stockStatus: e.target.value as Product['stockStatus'] })} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium">
                <option value="AVAILABLE">AVAILABLE</option><option value="LIMITED">LIMITED</option><option value="SOLD_OUT">SOLD_OUT</option>
              </select>
              <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5"><Plus className="w-4 h-4" /> {editingProductId ? 'Simpan Perubahan' : 'Tambah ke Katalog'}</button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl border border-slate-200 p-3 flex gap-3 items-center shadow-sm">
                <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-amber-700 font-bold truncate">{product.storeName}</p>
                  <h4 className="text-sm font-bold text-slate-900 truncate">{product.name}</h4>
                  <p className="text-xs text-slate-500">{formatTHB(product.priceTHB)} • {product.weightGrams}g • {product.stockStatus}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button type="button" onClick={() => editProduct(product)} title="Edit item" className="p-2 rounded-lg text-slate-500 hover:bg-amber-50 hover:text-amber-700"><Pencil className="w-4 h-4" /></button>
                  <button type="button" onClick={() => { if (window.confirm(`Hapus ${product.name} dari katalog?`)) { deleteProduct(product.id); showToast('Item dihapus dari katalog.'); } }} title="Hapus item" className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-700"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
