export type DocumentStatus =
  | 'draft'
  | 'approved'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'voided'
  | 'converted';

export interface Company {
  id: string;
  name: string;
  taxId: string;
  branch: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
}

export interface Contact {
  id: string;
  name: string;
  taxId: string;
  branch: string;
  type: 'customer' | 'supplier' | 'both';
  address: string;
  phone: string;
  email: string;
  creditTermsDays: number;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  sellPriceCents: number; // in cents (e.g. 150000 = 1,500.00 THB)
  costPriceCents: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isService?: boolean;
}

export interface LineItem {
  id: string;
  productId?: string;
  code: string;
  description: string;
  quantity: number;
  unit: string;
  unitPriceCents: number;
  discountCents: number;
  vatRate: number; // e.g. 7 or 0
  totalCents: number;
}

export interface Quotation {
  id: string;
  documentNumber: string;
  contactId: string;
  contactName: string;
  contactTaxId: string;
  date: string;
  validUntil: string;
  status: DocumentStatus;
  subtotalCents: number;
  discountCents: number;
  vatCents: number;
  totalCents: number;
  notes?: string;
  lineItems: LineItem[];
  createdAt: string;
}

export interface Invoice {
  id: string;
  documentNumber: string;
  quotationId?: string;
  contactId: string;
  contactName: string;
  contactTaxId: string;
  date: string;
  dueDate: string;
  creditTermsDays: number;
  status: DocumentStatus;
  subtotalCents: number;
  discountCents: number;
  vatCents: number;
  totalCents: number;
  amountPaidCents: number;
  amountDueCents: number;
  notes?: string;
  lineItems: LineItem[];
  createdAt: string;
}

export interface Receipt {
  id: string;
  documentNumber: string;
  invoiceId?: string;
  contactId: string;
  contactName: string;
  contactTaxId: string;
  date: string;
  status: DocumentStatus;
  subtotalCents: number;
  vatCents: number;
  whtCents: number;
  totalCents: number;
  paymentMethod: string;
  lineItems: LineItem[];
  createdAt: string;
}

export interface DashboardMetrics {
  totalRevenueCents: number;
  revenueChangePercent: number;
  totalExpenseCents: number;
  expenseChangePercent: number;
  netProfitCents: number;
  profitChangePercent: number;
  overdueInvoicesCount: number;
  overdueInvoicesTotalCents: number;
  pendingQuotationsCount: number;
}
