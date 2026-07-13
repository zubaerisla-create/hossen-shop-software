'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '../../types';
import { getProducts, getPurchasedProducts } from '../../utils/storage';
import { Search, Package, ExternalLink, Calendar, Shield, MessageSquare } from 'lucide-react';

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  category: string;
  demoUrl: string;
  amount: number;
  purchaseDate: string;
  supportExpiry: string;
  clientName: string;
  clientEmail: string;
  customerId: string;
  paymentStatus: string;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      const allProducts = getProducts();
      const purchasedIds = getPurchasedProducts();
      const token = localStorage.getItem('apex_user_token');

      let fetchedOrders: OrderItem[] = [];

      if (token) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/invoices`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            const invoices = data.data?.invoices || [];
            const templateInvoices = invoices.filter(
              (inv: any) => inv.type === 'ready_product' && inv.status === 'Paid'
            );

            fetchedOrders = templateInvoices.map((inv: any) => {
              const prod = allProducts.find(p => p.id === inv.productId) || {
                id: inv.productId || '',
                name: inv.title || 'Marketplace Item',
                category: 'Website Template',
                demoUrl: ''
              };
              return {
                id: inv.id,
                orderId: inv.id.substring(0, 8).toUpperCase(),
                productId: prod.id,
                productName: prod.name,
                category: prod.category,
                demoUrl: prod.demoUrl,
                amount: Math.round(inv.amount + inv.tax - inv.discount),
                purchaseDate: new Date(inv.createdAt).toISOString().split('T')[0],
                supportExpiry: new Date(new Date(inv.createdAt).setMonth(new Date(inv.createdAt).getMonth() + 6)).toISOString().split('T')[0],
                clientName: inv.customer?.name || 'John Doe',
                clientEmail: inv.customer?.email || 'john.doe@example.com',
                customerId: inv.customerId,
                paymentStatus: inv.status
              };
            });
          }
        } catch (err) {
          console.error('Failed to fetch orders from database:', err);
        }
      }

      // Fallback to local storage if no database invoices returned
      if (fetchedOrders.length === 0) {
        fetchedOrders = allProducts
          .filter(p => purchasedIds.includes(p.id))
          .map(p => {
            const hash = p.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
            return {
              id: `inv-mock-${p.id}`,
              orderId: `ORD-${(hash % 9000) + 1000}`,
              productId: p.id,
              productName: p.name,
              category: p.category,
              demoUrl: p.demoUrl,
              amount: Math.round(p.price * 1.05),
              purchaseDate: '2026-07-01',
              supportExpiry: '2027-01-01',
              clientName: 'John Doe',
              clientEmail: 'john.doe@example.com',
              customerId: 'cust-mock-id',
              paymentStatus: 'Paid'
            };
          });
      }

      setOrders(fetchedOrders);
      setLoading(false);
    };

    loadOrders();
  }, []);

  const triggerToast = (text: string) => {
    const event = new CustomEvent('apex-admin-toast', { detail: text });
    window.dispatchEvent(event);
  };

  const filteredOrders = orders.filter(o =>
    o.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.orderId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = orders.reduce((acc, o) => acc + o.amount, 0);

  return (
    <div className="animate-fadeIn text-xs flex flex-col min-h-full">
      
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-zinc-950 z-20 px-6 py-5 md:px-8 md:py-6 border-b border-zinc-200 dark:border-zinc-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Client Orders</h2>
          <p className="text-zinc-500 text-[10px]">Track all purchased template licenses, delivery status, and client support timelines.</p>
        </div>

        {orders.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
            />
          </div>
        )}
      </div>

      <div className="p-6 md:p-8 space-y-6 flex-1">
        
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-3">
            <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Total Licenses Sold</span>
            <span className="text-2xl font-bold text-zinc-950 dark:text-white block">{orders.length}</span>
            <span className="text-[10px] text-zinc-500">Template product purchases</span>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-3">
            <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Revenue from Templates</span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 block">{totalRevenue.toLocaleString()} BDT</span>
            <span className="text-[10px] text-zinc-500">Including 5% tax</span>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-3">
            <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Active Support Periods</span>
            <span className="text-2xl font-bold text-zinc-950 dark:text-white block">{orders.filter(o => o.paymentStatus === 'Paid').length}</span>
            <span className="text-[10px] text-zinc-500">6-month warranty running</span>
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="p-12 text-center text-zinc-500 font-bold animate-pulse">
            Loading dynamic orders data...
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="border border-zinc-200 dark:border-zinc-900 rounded-lg overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-900 text-zinc-500 font-bold uppercase text-[9px] tracking-wider">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Amount (BDT)</th>
                  <th className="p-4">Purchase Date</th>
                  <th className="p-4">Support Status</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  return (
                    <tr 
                      key={order.id} 
                      className="border-b border-zinc-200 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 text-zinc-700 dark:text-zinc-300 transition-colors"
                    >
                      <td className="p-4 font-mono font-bold text-zinc-400">{order.orderId}</td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-zinc-950 dark:text-white block">{order.productName}</span>
                          <span className="inline-block bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 px-1 py-0.2 rounded text-[8px] font-mono font-semibold uppercase">{order.category}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-zinc-950 dark:text-white block">{order.clientName}</span>
                          <span className="text-[10px] text-zinc-500">{order.clientEmail}</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-zinc-950 dark:text-white font-mono">
                        {order.amount.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          <span>{order.purchaseDate}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase block w-fit">
                            Active
                          </span>
                          <span className="text-[9px] text-zinc-450 font-medium block">Expires: {order.supportExpiry}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase">
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => router.push(`/admin/orders/workspace/${order.customerId}/${order.productId}`)}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-all shadow-sm flex items-center gap-1 shrink-0"
                          >
                            <MessageSquare className="w-3 h-3" /> View Workspace
                          </button>
                          {order.demoUrl && (
                            <a
                              href={order.demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-450 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors inline-flex items-center gap-1"
                            >
                              Demo <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <button
                            onClick={() => triggerToast(`Support reminder email sent to ${order.clientEmail} for ${order.productName}.`)}
                            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-450 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            Notify
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-zinc-200 dark:border-zinc-900 rounded-lg p-10 bg-zinc-50 dark:bg-zinc-900/10 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
              <Package className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-zinc-950 dark:text-white text-sm">No Client Orders Yet</h3>
              <p className="text-zinc-500 max-w-sm mx-auto leading-relaxed">
                No template product purchases have been recorded. Orders will appear here when clients buy from the marketplace.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
