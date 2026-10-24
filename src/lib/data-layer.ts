import {
  Company,
  Contact,
  Product,
  Quotation,
  Invoice,
  Receipt,
  DashboardMetrics,
  LineItem,
} from '@/types/accounting';

export const initialCompany: Company = {
  id: 'comp_01',
  name: 'กิจการของฉัน',
  taxId: '',
  branch: 'สำนักงานใหญ่',
  address: '',
  phone: '',
  email: '',
};

export const initialContacts: Contact[] = [];
export const initialProducts: Product[] = [];
export const initialQuotations: Quotation[] = [];
export const initialInvoices: Invoice[] = [];
export const initialReceipts: Receipt[] = [];

// Clean in-memory data store for live user session
let currentCompany: Company = { ...initialCompany };
let contacts: Contact[] = [];
let products: Product[] = [];
let quotations: Quotation[] = [];
let invoices: Invoice[] = [];
let receipts: Receipt[] = [];

export function getCompany(): Company {
  return currentCompany;
}

export function updateCompany(data: Partial<Company>): Company {
  currentCompany = { ...currentCompany, ...data };
  return currentCompany;
}

export function getContacts(): Contact[] {
  return contacts;
}

export function addContact(contact: Omit<Contact, 'id'>): Contact {
  const newContact: Contact = {
    ...contact,
    id: `ct_${Date.now()}`,
  };
  contacts = [newContact, ...contacts];
  return newContact;
}

export function getProducts(): Product[] {
  return products;
}

export function addProduct(product: Omit<Product, 'id'>): Product {
  const newProduct: Product = {
    ...product,
    id: `prod_${Date.now()}`,
  };
  products = [newProduct, ...products];
  return newProduct;
}

export function getQuotations(): Quotation[] {
  return quotations;
}

export function getQuotationById(id: string): Quotation | undefined {
  return quotations.find((q) => q.id === id);
}

export function createQuotation(data: Omit<Quotation, 'id' | 'documentNumber' | 'createdAt'>): Quotation {
  const nextNum = quotations.length + 1;
  const docNum = `QT-2026-${String(nextNum).padStart(4, '0')}`;
  const newQuotation: Quotation = {
    ...data,
    id: `qt_${Date.now()}`,
    documentNumber: docNum,
    createdAt: new Date().toISOString(),
  };
  quotations = [newQuotation, ...quotations];
  return newQuotation;
}

export function approveQuotation(id: string): Quotation | undefined {
  const idx = quotations.findIndex((q) => q.id === id);
  if (idx !== -1) {
    quotations[idx] = { ...quotations[idx], status: 'approved' };
    return quotations[idx];
  }
  return undefined;
}

export function convertQuotationToInvoice(quotationId: string): Invoice | undefined {
  const qt = quotations.find((q) => q.id === quotationId);
  if (!qt) return undefined;

  // Prevent duplicate conversion of already converted quotation
  if (qt.status === 'converted') {
    throw new Error('ใบเสนอราคานี้ได้รับการแปลงเป็นใบแจ้งหนี้ไปแล้ว');
  }

  // mark quotation as converted
  const qIdx = quotations.findIndex((q) => q.id === quotationId);
  if (qIdx !== -1) {
    quotations[qIdx] = { ...quotations[qIdx], status: 'converted' };
  }

  const nextNum = invoices.length + 1;
  const docNum = `IV-2026-${String(nextNum).padStart(4, '0')}`;
  const today = new Date().toISOString().split('T')[0];
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const newInvoice: Invoice = {
    id: `inv_${Date.now()}`,
    documentNumber: docNum,
    quotationId: qt.id,
    contactId: qt.contactId,
    contactName: qt.contactName,
    contactTaxId: qt.contactTaxId,
    date: today,
    dueDate: dueDate,
    creditTermsDays: 30,
    status: 'approved',
    subtotalCents: qt.subtotalCents,
    discountCents: qt.discountCents,
    vatCents: qt.vatCents,
    totalCents: qt.totalCents,
    amountPaidCents: 0,
    amountDueCents: qt.totalCents,
    notes: `แปลงมาจากใบเสนอราคา ${qt.documentNumber}`,
    lineItems: [...qt.lineItems],
    createdAt: new Date().toISOString(),
  };

  invoices = [newInvoice, ...invoices];
  return newInvoice;
}

export function getInvoices(): Invoice[] {
  return invoices;
}

export function getInvoiceById(id: string): Invoice | undefined {
  return invoices.find((inv) => inv.id === id);
}

export function recordInvoicePayment(
  invoiceId: string,
  paymentAmountCents: number,
  paymentMethod: string = 'โอนเงินผ่านธนาคาร'
): Receipt | undefined {
  if (!Number.isInteger(paymentAmountCents) || paymentAmountCents <= 0) {
    throw new Error('ยอดเงินที่ชำระต้องเป็นจำนวนเต็มสตางค์ที่มีค่ามากกว่า 0');
  }

  const idx = invoices.findIndex((inv) => inv.id === invoiceId);
  if (idx === -1) {
    throw new Error('ไม่พบเอกสารใบแจ้งหนี้ที่ระบุ');
  }

  const inv = invoices[idx];
  if (inv.amountDueCents <= 0 || inv.status === 'paid') {
    throw new Error('ใบแจ้งหนี้นี้ได้รับการชำระเงินเต็มจำนวนเรียบร้อยแล้ว');
  }

  if (paymentAmountCents > inv.amountDueCents) {
    const formattedPaid = (paymentAmountCents / 100).toLocaleString('th-TH', { minimumFractionDigits: 2 });
    const formattedDue = (inv.amountDueCents / 100).toLocaleString('th-TH', { minimumFractionDigits: 2 });
    throw new Error(`ยอดเงินที่ระบุ (฿${formattedPaid}) เกินยอดค้างชำระจริง (฿${formattedDue})`);
  }

  const newAmountPaid = inv.amountPaidCents + paymentAmountCents;
  const newAmountDue = Math.max(0, inv.totalCents - newAmountPaid);
  const newStatus = newAmountDue === 0 ? 'paid' : 'partially_paid';

  invoices[idx] = {
    ...inv,
    amountPaidCents: newAmountPaid,
    amountDueCents: newAmountDue,
    status: newStatus,
  };

  const nextNum = receipts.length + 1;
  const docNum = `RC-2026-${String(nextNum).padStart(4, '0')}`;
  const today = new Date().toISOString().split('T')[0];

  const newReceipt: Receipt = {
    id: `rc_${Date.now()}`,
    documentNumber: docNum,
    invoiceId: inv.id,
    contactId: inv.contactId,
    contactName: inv.contactName,
    contactTaxId: inv.contactTaxId,
    date: today,
    status: 'approved',
    subtotalCents: inv.subtotalCents,
    vatCents: inv.vatCents,
    whtCents: 0,
    totalCents: paymentAmountCents,
    paymentMethod,
    lineItems: [...inv.lineItems],
    createdAt: new Date().toISOString(),
  };

  receipts = [newReceipt, ...receipts];
  return newReceipt;
}

export function getReceipts(): Receipt[] {
  return receipts;
}

export function getReceiptById(id: string): Receipt | undefined {
  return receipts.find((r) => r.id === id);
}

export function getDashboardMetrics(): DashboardMetrics {
  const totalRev = invoices.reduce((sum, inv) => sum + inv.amountPaidCents, 0);
  const pendingQuotations = quotations.filter((q) => q.status === 'draft' || q.status === 'approved').length;
  const overdueInvoices = invoices.filter((inv) => inv.status === 'overdue' || inv.amountDueCents > 0);

  return {
    totalRevenueCents: totalRev,
    revenueChangePercent: 0,
    totalExpenseCents: 0,
    expenseChangePercent: 0,
    netProfitCents: totalRev,
    profitChangePercent: 0,
    overdueInvoicesCount: overdueInvoices.length,
    overdueInvoicesTotalCents: overdueInvoices.reduce((acc, i) => acc + i.amountDueCents, 0),
    pendingQuotationsCount: pendingQuotations,
  };
}
