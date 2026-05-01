import { useCallback, useEffect, useMemo, useState } from "react";
import type { CurrencyCode } from "@/lib/currency";

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceState {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  from: {
    name: string;
    tagline: string;
    email: string;
    phone: string;
    address: string;
  };
  billTo: {
    name: string;
    company: string;
    email: string;
    phone: string;
    address: string;
  };
  items: LineItem[];
  currency: CurrencyCode;
  discountType: "none" | "flat" | "percent";
  discountValue: number;
  paymentPhases: {
    phase1Label: string;
    phase2Label: string;
  };
  notes: string;
  paymentInstructions: string;
  signature: string;
}

const STORAGE_KEY = "sst-invoice-draft-v1";

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const DEFAULT_INVOICE: InvoiceState = {
  invoiceNumber: `SST-${new Date().getFullYear()}-001`,
  issueDate: today(),
  dueDate: addDays(7),
  from: {
    name: "Simon Star Tech",
    tagline: "A spark of creativity and innovation in tech",
    email: "symonstartech@gmail.com",
    phone: "+251 988 499 136",
    address: "Addis Ababa, Ethiopia",
  },
  billTo: {
    name: "Client Name",
    company: "Client Company",
    email: "client@email.com",
    phone: "",
    address: "",
  },
  items: [
    { id: crypto.randomUUID(), description: "Website design & development", quantity: 1, unitPrice: 0 },
  ],
  currency: "ETB",
  discountType: "none",
  discountValue: 0,
  paymentPhases: {
    phase1Label: "Phase 1 — 50% (Project start)",
    phase2Label: "Phase 2 — 50% (On delivery)",
  },
  notes: "Thank you for your business. Payment is due within 7 days of the issue date.",
  paymentInstructions: "Bank: [Bank name]\nAccount name: Simon Star Tech\nAccount number: [xxxx-xxxx]",
  signature: "Simon Star Tech",
};

export function useInvoice() {
  const [invoice, setInvoice] = useState<InvoiceState>(() => {
    if (typeof window === "undefined") return DEFAULT_INVOICE;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULT_INVOICE, ...JSON.parse(raw) } as InvoiceState;
    } catch {}
    return DEFAULT_INVOICE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invoice));
    } catch {}
  }, [invoice]);

  const update = useCallback(<K extends keyof InvoiceState>(key: K, value: InvoiceState[K]) => {
    setInvoice((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateFrom = useCallback((patch: Partial<InvoiceState["from"]>) => {
    setInvoice((p) => ({ ...p, from: { ...p.from, ...patch } }));
  }, []);

  const updateBillTo = useCallback((patch: Partial<InvoiceState["billTo"]>) => {
    setInvoice((p) => ({ ...p, billTo: { ...p.billTo, ...patch } }));
  }, []);

  const addItem = useCallback(() => {
    setInvoice((p) => ({
      ...p,
      items: [...p.items, { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0 }],
    }));
  }, []);

  const updateItem = useCallback((id: string, patch: Partial<LineItem>) => {
    setInvoice((p) => ({
      ...p,
      items: p.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setInvoice((p) => ({ ...p, items: p.items.filter((it) => it.id !== id) }));
  }, []);

  const totals = useMemo(() => {
    const subtotal = invoice.items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
    let discount = 0;
    if (invoice.discountType === "flat") discount = Number(invoice.discountValue) || 0;
    if (invoice.discountType === "percent") discount = (subtotal * (Number(invoice.discountValue) || 0)) / 100;
    discount = Math.min(discount, subtotal);
    const total = subtotal - discount;
    return { subtotal, discount, total };
  }, [invoice.items, invoice.discountType, invoice.discountValue]);

  const reset = useCallback(() => setInvoice(DEFAULT_INVOICE), []);

  return { invoice, setInvoice, update, updateFrom, updateBillTo, addItem, updateItem, removeItem, totals, reset };
}
