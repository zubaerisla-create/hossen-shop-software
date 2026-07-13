'use client';

import { Product, CustomDeal, ChatMessage, Invoice, SupportTicket, Milestone } from '../types';
import { mockProducts, mockCustomDeals, mockChatMessages, mockInvoices, mockSupportTickets } from '../mockData';

// Standard keys
const PRODUCTS_KEY = 'apex_products';
const DEALS_KEY = 'apex_deals';
const CHAT_KEY = 'apex_chats';
const INVOICES_KEY = 'apex_invoices';
const TICKETS_KEY = 'apex_tickets';
const PURCHASED_KEY = 'apex_purchased';

export function initializeStorage() {
  if (typeof window === 'undefined') return;

  const storedProductsStr = localStorage.getItem(PRODUCTS_KEY);
  if (!storedProductsStr) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(mockProducts));
  } else {
    try {
      const stored = JSON.parse(storedProductsStr) as Product[];
      if (stored.length < mockProducts.length) {
        const merged = [...stored];
        mockProducts.forEach(mp => {
          if (!merged.some(p => p.id === mp.id)) {
            merged.push(mp);
          }
        });
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(merged));
      }
    } catch (e) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(mockProducts));
    }
  }
  if (!localStorage.getItem(DEALS_KEY)) {
    localStorage.setItem(DEALS_KEY, JSON.stringify(mockCustomDeals));
  }
  if (!localStorage.getItem(CHAT_KEY)) {
    localStorage.setItem(CHAT_KEY, JSON.stringify(mockChatMessages));
  }
  if (!localStorage.getItem(INVOICES_KEY)) {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(mockInvoices));
  }
  if (!localStorage.getItem(TICKETS_KEY)) {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(mockSupportTickets));
  }
  if (!localStorage.getItem(PURCHASED_KEY)) {
    // Start with 1 pre-purchased product for John Doe client demo
    localStorage.setItem(PURCHASED_KEY, JSON.stringify([mockProducts[0].id]));
  }
}

// Products
export function getProducts(): Product[] {
  if (typeof window === 'undefined') return mockProducts;
  const data = localStorage.getItem(PRODUCTS_KEY);
  return data ? JSON.parse(data) : mockProducts;
}

export function saveProducts(products: Product[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

// Purchased products ids
export function getPurchasedProducts(): string[] {
  if (typeof window === 'undefined') return [mockProducts[0].id];
  const data = localStorage.getItem(PURCHASED_KEY);
  return data ? JSON.parse(data) : [mockProducts[0].id];
}

export function purchaseProduct(id: string) {
  if (typeof window === 'undefined') return;
  const current = getPurchasedProducts();
  if (!current.includes(id)) {
    const updated = [...current, id];
    localStorage.setItem(PURCHASED_KEY, JSON.stringify(updated));
  }
}

// Custom Deals
export function getDeals(): CustomDeal[] {
  if (typeof window === 'undefined') return mockCustomDeals;
  const data = localStorage.getItem(DEALS_KEY);
  return data ? JSON.parse(data) : mockCustomDeals;
}

export function saveDeals(deals: CustomDeal[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEALS_KEY, JSON.stringify(deals));
}

export function getDealById(id: string): CustomDeal | undefined {
  return getDeals().find(d => d.id === id);
}

// Chat Messages
export function getChats(): Record<string, ChatMessage[]> {
  if (typeof window === 'undefined') return mockChatMessages;
  const data = localStorage.getItem(CHAT_KEY);
  return data ? JSON.parse(data) : mockChatMessages;
}

export function saveChats(chats: Record<string, ChatMessage[]>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CHAT_KEY, JSON.stringify(chats));
}

export function addChatMessage(dealId: string, message: ChatMessage) {
  const current = getChats();
  const thread = current[dealId] || [];
  const updated = {
    ...current,
    [dealId]: [...thread, message]
  };
  saveChats(updated);
}

// Invoices
export function getInvoices(): Invoice[] {
  if (typeof window === 'undefined') return mockInvoices;
  const data = localStorage.getItem(INVOICES_KEY);
  return data ? JSON.parse(data) : mockInvoices;
}

export function saveInvoices(invoices: Invoice[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
}

export function addInvoice(invoice: Invoice) {
  const current = getInvoices();
  saveInvoices([invoice, ...current]);
}

// Tickets
export function getTickets(): SupportTicket[] {
  if (typeof window === 'undefined') return mockSupportTickets;
  const data = localStorage.getItem(TICKETS_KEY);
  return data ? JSON.parse(data) : mockSupportTickets;
}

export function saveTickets(tickets: SupportTicket[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
}

export function addTicket(ticket: SupportTicket) {
  const current = getTickets();
  saveTickets([ticket, ...current]);
}

export function replyToTicket(ticketId: string, reply: { sender: 'customer' | 'admin'; content: string; timestamp: string }) {
  const current = getTickets();
  const updated = current.map(t => {
    if (t.id === ticketId) {
      return {
        ...t,
        status: reply.sender === 'admin' ? ('In Progress' as const) : ('Open' as const),
        messages: [...t.messages, reply]
      };
    }
    return t;
  });
  saveTickets(updated);
}

export async function syncWithBackend() {
  if (typeof window === 'undefined') return;

  try {
    // 1. Fetch Products (Public endpoint)
    const productsRes = await fetch('http://localhost:5000/api/products', {
      cache: 'no-store'
    });
    if (productsRes.ok) {
      const data = await productsRes.json();
      if (data.data?.products) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(data.data.products));
      }
    }
  } catch (err) {
    console.error('Failed to sync products with backend:', err);
  }

  const token = localStorage.getItem('apex_user_token');
  if (!token) return;

  try {
    // 2. Fetch Deals
    const dealsRes = await fetch('http://localhost:5000/api/deals', {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    });
    if (dealsRes.ok) {
      const data = await dealsRes.json();
      if (data.data?.deals) {
        localStorage.setItem(DEALS_KEY, JSON.stringify(data.data.deals));
      }
    }

    // 3. Fetch Invoices
    const invoicesRes = await fetch('http://localhost:5000/api/invoices', {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    });
    if (invoicesRes.ok) {
      const data = await invoicesRes.json();
      if (data.data?.invoices) {
        localStorage.setItem(INVOICES_KEY, JSON.stringify(data.data.invoices));
      }
    }

    // 4. Fetch Support Tickets
    const ticketsRes = await fetch('http://localhost:5000/api/tickets', {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    });
    if (ticketsRes.ok) {
      const data = await ticketsRes.json();
      if (data.data?.tickets) {
        localStorage.setItem(TICKETS_KEY, JSON.stringify(data.data.tickets));
      }
    }

    // 5. Update Purchased templates (Paid ready-product invoices)
    const storedInvoices = localStorage.getItem(INVOICES_KEY);
    if (storedInvoices) {
      const invoices = JSON.parse(storedInvoices) as Invoice[];
      const purchasedIds = invoices
        .filter(inv => inv.status === 'Paid' && inv.type === 'ready_product' && inv.productId)
        .map(inv => inv.productId as string);
      
      const currentPurchased = JSON.parse(localStorage.getItem(PURCHASED_KEY) || '[]');
      const merged = Array.from(new Set([...currentPurchased, ...purchasedIds]));
      localStorage.setItem(PURCHASED_KEY, JSON.stringify(merged));
    }

  } catch (err) {
    console.error('Failed to sync state with backend:', err);
  }
}
