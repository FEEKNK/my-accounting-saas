import {
  pgTable,
  text,
  bigint,
  integer,
  boolean,
  timestamp,
  pgEnum,
  unique,
  index,
  jsonb,
} from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'editor', 'viewer']);
export const contactTypeEnum = pgEnum('contact_type', ['customer', 'supplier', 'both']);
export const documentStatusEnum = pgEnum('document_status', [
  'draft',
  'approved',
  'partially_paid',
  'paid',
  'overdue',
  'voided',
  'converted',
]);

// 1. Companies (Tenants)
export const companies = pgTable('companies', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  taxId: text('tax_id').notNull(),
  branch: text('branch').notNull().default('สำนักงานใหญ่'),
  address: text('address').notNull(),
  phone: text('phone'),
  email: text('email'),
  logoUrl: text('logo_url'),
  fiscalYearStartMonth: integer('fiscal_year_start_month').notNull().default(1),
  currency: text('currency').notNull().default('THB'),
  plan: text('plan').notNull().default('pro'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Users
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  companyId: text('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull().default('editor'),
  status: text('status').notNull().default('active'),
  passwordHash: text('password_hash'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  unique().on(t.companyId, t.email),
  index('users_company_idx').on(t.companyId),
]);

// 3. Contacts
export const contacts = pgTable('contacts', {
  id: text('id').primaryKey(),
  companyId: text('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  taxId: text('tax_id').notNull(),
  branch: text('branch').notNull().default('สำนักงานใหญ่'),
  type: contactTypeEnum('type').notNull().default('customer'),
  address: text('address').notNull(),
  phone: text('phone'),
  email: text('email'),
  creditTermsDays: integer('credit_terms_days').notNull().default(30),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('contacts_company_idx').on(t.companyId),
]);

// 4. Products & Services
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  companyId: text('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  category: text('category').notNull().default('ทั่วไป'),
  unit: text('unit').notNull().default('ชิ้น'),
  sellPriceCents: bigint('sell_price_cents', { mode: 'number' }).notNull().default(0),
  costPriceCents: bigint('cost_price_cents', { mode: 'number' }).notNull().default(0),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  lowStockThreshold: integer('low_stock_threshold').notNull().default(5),
  isService: boolean('is_service').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  unique().on(t.companyId, t.code),
  index('products_company_idx').on(t.companyId),
]);

// 5. Quotations
export const quotations = pgTable('quotations', {
  id: text('id').primaryKey(),
  companyId: text('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  documentNumber: text('document_number').notNull(),
  contactId: text('contact_id').references(() => contacts.id, { onDelete: 'restrict' }).notNull(),
  contactName: text('contact_name').notNull(),
  contactTaxId: text('contact_tax_id').notNull(),
  date: text('date').notNull(),
  validUntil: text('valid_until').notNull(),
  status: documentStatusEnum('status').notNull().default('draft'),
  subtotalCents: bigint('subtotal_cents', { mode: 'number' }).notNull().default(0),
  discountCents: bigint('discount_cents', { mode: 'number' }).notNull().default(0),
  vatCents: bigint('vat_cents', { mode: 'number' }).notNull().default(0),
  totalCents: bigint('total_cents', { mode: 'number' }).notNull().default(0),
  notes: text('notes'),
  lineItemsJson: jsonb('line_items_json').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  unique().on(t.companyId, t.documentNumber),
  index('quotations_company_idx').on(t.companyId),
]);

// 6. Invoices
export const invoices = pgTable('invoices', {
  id: text('id').primaryKey(),
  companyId: text('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  documentNumber: text('document_number').notNull(),
  quotationId: text('quotation_id'),
  contactId: text('contact_id').references(() => contacts.id, { onDelete: 'restrict' }).notNull(),
  contactName: text('contact_name').notNull(),
  contactTaxId: text('contact_tax_id').notNull(),
  date: text('date').notNull(),
  dueDate: text('due_date').notNull(),
  creditTermsDays: integer('credit_terms_days').notNull().default(30),
  status: documentStatusEnum('status').notNull().default('draft'),
  subtotalCents: bigint('subtotal_cents', { mode: 'number' }).notNull().default(0),
  discountCents: bigint('discount_cents', { mode: 'number' }).notNull().default(0),
  vatCents: bigint('vat_cents', { mode: 'number' }).notNull().default(0),
  totalCents: bigint('total_cents', { mode: 'number' }).notNull().default(0),
  amountPaidCents: bigint('amount_paid_cents', { mode: 'number' }).notNull().default(0),
  amountDueCents: bigint('amount_due_cents', { mode: 'number' }).notNull().default(0),
  notes: text('notes'),
  lineItemsJson: jsonb('line_items_json').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  unique().on(t.companyId, t.documentNumber),
  index('invoices_company_idx').on(t.companyId),
]);

// 7. Receipts (Tax Invoices)
export const receipts = pgTable('receipts', {
  id: text('id').primaryKey(),
  companyId: text('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  documentNumber: text('document_number').notNull(),
  invoiceId: text('invoice_id'),
  contactId: text('contact_id').references(() => contacts.id, { onDelete: 'restrict' }).notNull(),
  contactName: text('contact_name').notNull(),
  contactTaxId: text('contact_tax_id').notNull(),
  date: text('date').notNull(),
  status: documentStatusEnum('status').notNull().default('approved'),
  subtotalCents: bigint('subtotal_cents', { mode: 'number' }).notNull().default(0),
  vatCents: bigint('vat_cents', { mode: 'number' }).notNull().default(0),
  whtCents: bigint('wht_cents', { mode: 'number' }).notNull().default(0),
  totalCents: bigint('total_cents', { mode: 'number' }).notNull().default(0),
  paymentMethod: text('payment_method').notNull().default('โอนเงินผ่านธนาคาร'),
  lineItemsJson: jsonb('line_items_json').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  unique().on(t.companyId, t.documentNumber),
  index('receipts_company_idx').on(t.companyId),
]);

// 8. Document Sequence Generator
export const documentSequences = pgTable('document_sequences', {
  id: text('id').primaryKey(),
  companyId: text('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  documentType: text('document_type').notNull(), // 'QT', 'IV', 'RC', etc.
  prefix: text('prefix').notNull(),
  fiscalYear: integer('fiscal_year').notNull(),
  currentSequence: integer('current_sequence').notNull().default(0),
}, (t) => [
  unique().on(t.companyId, t.documentType, t.fiscalYear),
]);

// 9. Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  companyId: text('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(), // 'create', 'update', 'approve', 'void', 'delete'
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  metadata: jsonb('metadata'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('audit_logs_company_idx').on(t.companyId),
]);
