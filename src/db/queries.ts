import { eq, desc, and } from 'drizzle-orm';
import { db, sql } from './index';
import * as schema from './schema';
import {
  Quotation,
  Invoice,
  Receipt,
  LineItem,
  Contact,
  Product,
  Company,
  DashboardMetrics,
} from '@/types/accounting';

// ----------------------------------------------------
// Document Sequences
// ----------------------------------------------------
export async function getNextDocumentNumber(
  companyId: string,
  docType: 'QT' | 'IV' | 'RC',
  prefix: string,
  fiscalYear: number = 2026
): Promise<string> {
  if (!sql) {
    throw new Error('Database not connected');
  }

  const seqId = `seq_${companyId}_${docType}_${fiscalYear}`;
  
  // Atomic UPSERT preventing concurrency race condition
  const res = await sql`
    INSERT INTO document_sequences (id, company_id, document_type, prefix, fiscal_year, current_sequence)
    VALUES (${seqId}, ${companyId}, ${docType}, ${prefix}, ${fiscalYear}, 1)
    ON CONFLICT (company_id, document_type, fiscal_year)
    DO UPDATE SET current_sequence = document_sequences.current_sequence + 1
    RETURNING current_sequence;
  `;

  const nextSeq = res[0]?.current_sequence ?? 1;
  return `${prefix}-${fiscalYear}-${String(nextSeq).padStart(4, '0')}`;
}

// ----------------------------------------------------
// Quotations
// ----------------------------------------------------
export async function getQuotationsFromDb(
  companyId: string,
  limit: number = 100
): Promise<Quotation[]> {
  if (!db) return [];
  const rows = await db
    .select()
    .from(schema.quotations)
    .where(eq(schema.quotations.companyId, companyId))
    .orderBy(desc(schema.quotations.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    documentNumber: r.documentNumber,
    contactId: r.contactId,
    contactName: r.contactName,
    contactTaxId: r.contactTaxId,
    date: r.date,
    validUntil: r.validUntil,
    status: r.status as any,
    subtotalCents: Number(r.subtotalCents),
    discountCents: Number(r.discountCents),
    vatCents: Number(r.vatCents),
    totalCents: Number(r.totalCents),
    notes: r.notes || undefined,
    lineItems: (r.lineItemsJson as unknown as LineItem[]) || [],
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getQuotationByIdFromDb(
  companyId: string,
  id: string
): Promise<Quotation | null> {
  if (!db) return null;
  const [r] = await db
    .select()
    .from(schema.quotations)
    .where(
      and(
        eq(schema.quotations.id, id),
        eq(schema.quotations.companyId, companyId)
      )
    );

  if (!r) return null;

  return {
    id: r.id,
    documentNumber: r.documentNumber,
    contactId: r.contactId,
    contactName: r.contactName,
    contactTaxId: r.contactTaxId,
    date: r.date,
    validUntil: r.validUntil,
    status: r.status as any,
    subtotalCents: Number(r.subtotalCents),
    discountCents: Number(r.discountCents),
    vatCents: Number(r.vatCents),
    totalCents: Number(r.totalCents),
    notes: r.notes || undefined,
    lineItems: (r.lineItemsJson as unknown as LineItem[]) || [],
    createdAt: r.createdAt.toISOString(),
  };
}

export async function createQuotationInDb(
  companyId: string,
  data: Omit<Quotation, 'id' | 'documentNumber' | 'createdAt'>
): Promise<Quotation> {
  if (!db) throw new Error('Database not connected');

  const docNum = await getNextDocumentNumber(companyId, 'QT', 'QT', 2026);
  const newId = `qt_${Date.now()}`;

  const [inserted] = await db
    .insert(schema.quotations)
    .values({
      id: newId,
      companyId,
      documentNumber: docNum,
      contactId: data.contactId,
      contactName: data.contactName,
      contactTaxId: data.contactTaxId,
      date: data.date,
      validUntil: data.validUntil,
      status: data.status,
      subtotalCents: data.subtotalCents,
      discountCents: data.discountCents,
      vatCents: data.vatCents,
      totalCents: data.totalCents,
      notes: data.notes || null,
      lineItemsJson: data.lineItems,
    })
    .returning();

  return {
    id: inserted.id,
    documentNumber: inserted.documentNumber,
    contactId: inserted.contactId,
    contactName: inserted.contactName,
    contactTaxId: inserted.contactTaxId,
    date: inserted.date,
    validUntil: inserted.validUntil,
    status: inserted.status as any,
    subtotalCents: Number(inserted.subtotalCents),
    discountCents: Number(inserted.discountCents),
    vatCents: Number(inserted.vatCents),
    totalCents: Number(inserted.totalCents),
    notes: inserted.notes || undefined,
    lineItems: (inserted.lineItemsJson as unknown as LineItem[]) || [],
    createdAt: inserted.createdAt.toISOString(),
  };
}

export async function approveQuotationInDb(
  companyId: string,
  id: string
): Promise<Quotation | null> {
  if (!db) return null;
  const [updated] = await db
    .update(schema.quotations)
    .set({
      status: 'approved',
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(schema.quotations.id, id),
        eq(schema.quotations.companyId, companyId)
      )
    )
    .returning();

  if (!updated) return null;

  return {
    id: updated.id,
    documentNumber: updated.documentNumber,
    contactId: updated.contactId,
    contactName: updated.contactName,
    contactTaxId: updated.contactTaxId,
    date: updated.date,
    validUntil: updated.validUntil,
    status: updated.status as any,
    subtotalCents: Number(updated.subtotalCents),
    discountCents: Number(updated.discountCents),
    vatCents: Number(updated.vatCents),
    totalCents: Number(updated.totalCents),
    notes: updated.notes || undefined,
    lineItems: (updated.lineItemsJson as unknown as LineItem[]) || [],
    createdAt: updated.createdAt.toISOString(),
  };
}

export async function convertQuotationToInvoiceInDb(
  companyId: string,
  quotationId: string
): Promise<Invoice> {
  if (!db || !sql) throw new Error('Database not connected');

  const qt = await getQuotationByIdFromDb(companyId, quotationId);
  if (!qt) throw new Error('ไม่พบเอกสารใบเสนอราคา');

  if (qt.status === 'converted') {
    throw new Error('ใบเสนอราคานี้ได้รับการแปลงเป็นใบแจ้งหนี้ไปแล้ว');
  }

  const docNum = await getNextDocumentNumber(companyId, 'IV', 'IV', 2026);
  const newInvoiceId = `inv_${Date.now()}`;
  const today = new Date().toISOString().split('T')[0];
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const notesText = `แปลงมาจากใบเสนอราคา ${qt.documentNumber}`;
  const lineItemsStr = JSON.stringify(qt.lineItems);

  // Atomic transaction: update quotation and create invoice together
  const [, invRows] = await sql.transaction([
    sql`
      UPDATE quotations
      SET status = 'converted', updated_at = NOW()
      WHERE id = ${quotationId} AND company_id = ${companyId}
      RETURNING id, status;
    `,
    sql`
      INSERT INTO invoices (
        id, company_id, document_number, quotation_id, contact_id, contact_name, contact_tax_id,
        date, due_date, credit_terms_days, status, subtotal_cents, discount_cents, vat_cents,
        total_cents, amount_paid_cents, amount_due_cents, notes, line_items_json
      ) VALUES (
        ${newInvoiceId}, ${companyId}, ${docNum}, ${qt.id}, ${qt.contactId}, ${qt.contactName}, ${qt.contactTaxId},
        ${today}, ${dueDate}, 30, 'approved', ${qt.subtotalCents}, ${qt.discountCents}, ${qt.vatCents},
        ${qt.totalCents}, 0, ${qt.totalCents}, ${notesText}, ${lineItemsStr}::jsonb
      )
      RETURNING *;
    `,
  ]);

  const inserted = invRows[0];

  return {
    id: inserted.id,
    documentNumber: inserted.document_number,
    quotationId: inserted.quotation_id || undefined,
    contactId: inserted.contact_id,
    contactName: inserted.contact_name,
    contactTaxId: inserted.contact_tax_id,
    date: inserted.date,
    dueDate: inserted.due_date,
    creditTermsDays: inserted.credit_terms_days,
    status: inserted.status as any,
    subtotalCents: Number(inserted.subtotal_cents),
    discountCents: Number(inserted.discount_cents),
    vatCents: Number(inserted.vat_cents),
    totalCents: Number(inserted.total_cents),
    amountPaidCents: Number(inserted.amount_paid_cents),
    amountDueCents: Number(inserted.amount_due_cents),
    notes: inserted.notes || undefined,
    lineItems: (inserted.line_items_json as unknown as LineItem[]) || [],
    createdAt: new Date(inserted.created_at).toISOString(),
  };
}

// ----------------------------------------------------
// Invoices
// ----------------------------------------------------
export async function getInvoicesFromDb(
  companyId: string,
  limit: number = 100
): Promise<Invoice[]> {
  if (!db) return [];
  const rows = await db
    .select()
    .from(schema.invoices)
    .where(eq(schema.invoices.companyId, companyId))
    .orderBy(desc(schema.invoices.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    documentNumber: r.documentNumber,
    quotationId: r.quotationId || undefined,
    contactId: r.contactId,
    contactName: r.contactName,
    contactTaxId: r.contactTaxId,
    date: r.date,
    dueDate: r.dueDate,
    creditTermsDays: r.creditTermsDays,
    status: r.status as any,
    subtotalCents: Number(r.subtotalCents),
    discountCents: Number(r.discountCents),
    vatCents: Number(r.vatCents),
    totalCents: Number(r.totalCents),
    amountPaidCents: Number(r.amountPaidCents),
    amountDueCents: Number(r.amountDueCents),
    notes: r.notes || undefined,
    lineItems: (r.lineItemsJson as unknown as LineItem[]) || [],
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getInvoiceByIdFromDb(
  companyId: string,
  id: string
): Promise<Invoice | null> {
  if (!db) return null;
  const [r] = await db
    .select()
    .from(schema.invoices)
    .where(
      and(
        eq(schema.invoices.id, id),
        eq(schema.invoices.companyId, companyId)
      )
    );

  if (!r) return null;

  return {
    id: r.id,
    documentNumber: r.documentNumber,
    quotationId: r.quotationId || undefined,
    contactId: r.contactId,
    contactName: r.contactName,
    contactTaxId: r.contactTaxId,
    date: r.date,
    dueDate: r.dueDate,
    creditTermsDays: r.creditTermsDays,
    status: r.status as any,
    subtotalCents: Number(r.subtotalCents),
    discountCents: Number(r.discountCents),
    vatCents: Number(r.vatCents),
    totalCents: Number(r.totalCents),
    amountPaidCents: Number(r.amountPaidCents),
    amountDueCents: Number(r.amountDueCents),
    notes: r.notes || undefined,
    lineItems: (r.lineItemsJson as unknown as LineItem[]) || [],
    createdAt: r.createdAt.toISOString(),
  };
}

export async function createInvoiceInDb(
  companyId: string,
  data: Omit<Invoice, 'id' | 'documentNumber' | 'createdAt' | 'amountPaidCents' | 'amountDueCents'>
): Promise<Invoice> {
  if (!db) throw new Error('Database not connected');

  const docNum = await getNextDocumentNumber(companyId, 'IV', 'IV', 2026);
  const newId = `inv_${Date.now()}`;

  const [inserted] = await db
    .insert(schema.invoices)
    .values({
      id: newId,
      companyId,
      documentNumber: docNum,
      quotationId: data.quotationId || null,
      contactId: data.contactId,
      contactName: data.contactName,
      contactTaxId: data.contactTaxId,
      date: data.date,
      dueDate: data.dueDate,
      creditTermsDays: data.creditTermsDays,
      status: data.status,
      subtotalCents: data.subtotalCents,
      discountCents: data.discountCents,
      vatCents: data.vatCents,
      totalCents: data.totalCents,
      amountPaidCents: 0,
      amountDueCents: data.totalCents,
      notes: data.notes || null,
      lineItemsJson: data.lineItems,
    })
    .returning();

  return {
    id: inserted.id,
    documentNumber: inserted.documentNumber,
    quotationId: inserted.quotationId || undefined,
    contactId: inserted.contactId,
    contactName: inserted.contactName,
    contactTaxId: inserted.contactTaxId,
    date: inserted.date,
    dueDate: inserted.dueDate,
    creditTermsDays: inserted.creditTermsDays,
    status: inserted.status as any,
    subtotalCents: Number(inserted.subtotalCents),
    discountCents: Number(inserted.discountCents),
    vatCents: Number(inserted.vatCents),
    totalCents: Number(inserted.totalCents),
    amountPaidCents: Number(inserted.amountPaidCents),
    amountDueCents: Number(inserted.amountDueCents),
    notes: inserted.notes || undefined,
    lineItems: (inserted.lineItemsJson as unknown as LineItem[]) || [],
    createdAt: inserted.createdAt.toISOString(),
  };
}

export async function recordPaymentInDb(
  companyId: string,
  invoiceId: string,
  paymentAmountCents: number,
  paymentMethod: string = 'โอนเงินผ่านธนาคาร'
): Promise<{ invoice: Invoice; receipt: Receipt }> {
  if (!db || !sql) throw new Error('Database not connected');

  if (!Number.isInteger(paymentAmountCents) || paymentAmountCents <= 0) {
    throw new Error('ยอดเงินที่ชำระต้องเป็นจำนวนเต็มสตางค์ที่มีค่ามากกว่า 0');
  }

  const inv = await getInvoiceByIdFromDb(companyId, invoiceId);
  if (!inv) throw new Error('ไม่พบเอกสารใบแจ้งหนี้ที่ระบุ');

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

  const rcDocNum = await getNextDocumentNumber(companyId, 'RC', 'RC', 2026);
  const rcId = `rc_${Date.now()}`;
  const today = new Date().toISOString().split('T')[0];
  const lineItemsStr = JSON.stringify(inv.lineItems);

  // Atomic transactional mutation: update invoice balance and insert receipt together
  const [updatedRows, insertedRows] = await sql.transaction([
    sql`
      UPDATE invoices
      SET amount_paid_cents = ${newAmountPaid},
          amount_due_cents = ${newAmountDue},
          status = ${newStatus},
          updated_at = NOW()
      WHERE id = ${invoiceId} AND company_id = ${companyId}
      RETURNING *;
    `,
    sql`
      INSERT INTO receipts (
        id, company_id, document_number, invoice_id, contact_id, contact_name, contact_tax_id,
        date, status, subtotal_cents, vat_cents, wht_cents, total_cents, payment_method, line_items_json
      ) VALUES (
        ${rcId}, ${companyId}, ${rcDocNum}, ${inv.id}, ${inv.contactId}, ${inv.contactName}, ${inv.contactTaxId},
        ${today}, 'approved', ${inv.subtotalCents}, ${inv.vatCents}, 0, ${paymentAmountCents}, ${paymentMethod}, ${lineItemsStr}::jsonb
      )
      RETURNING *;
    `,
  ]);

  const updatedInv = updatedRows[0];
  const insertedRc = insertedRows[0];

  return {
    invoice: {
      id: updatedInv.id,
      documentNumber: updatedInv.document_number,
      quotationId: updatedInv.quotation_id || undefined,
      contactId: updatedInv.contact_id,
      contactName: updatedInv.contact_name,
      contactTaxId: updatedInv.contact_tax_id,
      date: updatedInv.date,
      dueDate: updatedInv.due_date,
      creditTermsDays: updatedInv.credit_terms_days,
      status: updatedInv.status as any,
      subtotalCents: Number(updatedInv.subtotal_cents),
      discountCents: Number(updatedInv.discount_cents),
      vatCents: Number(updatedInv.vat_cents),
      totalCents: Number(updatedInv.total_cents),
      amountPaidCents: Number(updatedInv.amount_paid_cents),
      amountDueCents: Number(updatedInv.amount_due_cents),
      notes: updatedInv.notes || undefined,
      lineItems: (updatedInv.line_items_json as unknown as LineItem[]) || [],
      createdAt: new Date(updatedInv.created_at).toISOString(),
    },
    receipt: {
      id: insertedRc.id,
      documentNumber: insertedRc.document_number,
      invoiceId: insertedRc.invoice_id || undefined,
      contactId: insertedRc.contact_id,
      contactName: insertedRc.contact_name,
      contactTaxId: insertedRc.contact_tax_id,
      date: insertedRc.date,
      status: insertedRc.status as any,
      subtotalCents: Number(insertedRc.subtotal_cents),
      vatCents: Number(insertedRc.vat_cents),
      whtCents: Number(insertedRc.wht_cents),
      totalCents: Number(insertedRc.total_cents),
      paymentMethod: insertedRc.payment_method,
      lineItems: (insertedRc.line_items_json as unknown as LineItem[]) || [],
      createdAt: new Date(insertedRc.created_at).toISOString(),
    },
  };
}

// ----------------------------------------------------
// Receipts
// ----------------------------------------------------
export async function getReceiptsFromDb(
  companyId: string,
  limit: number = 100
): Promise<Receipt[]> {
  if (!db) return [];
  const rows = await db
    .select()
    .from(schema.receipts)
    .where(eq(schema.receipts.companyId, companyId))
    .orderBy(desc(schema.receipts.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    documentNumber: r.documentNumber,
    invoiceId: r.invoiceId || undefined,
    contactId: r.contactId,
    contactName: r.contactName,
    contactTaxId: r.contactTaxId,
    date: r.date,
    status: r.status as any,
    subtotalCents: Number(r.subtotalCents),
    vatCents: Number(r.vatCents),
    whtCents: Number(r.whtCents),
    totalCents: Number(r.totalCents),
    paymentMethod: r.paymentMethod,
    lineItems: (r.lineItemsJson as unknown as LineItem[]) || [],
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getReceiptByIdFromDb(
  companyId: string,
  id: string
): Promise<Receipt | null> {
  if (!db) return null;
  const [r] = await db
    .select()
    .from(schema.receipts)
    .where(
      and(
        eq(schema.receipts.id, id),
        eq(schema.receipts.companyId, companyId)
      )
    );

  if (!r) return null;

  return {
    id: r.id,
    documentNumber: r.documentNumber,
    invoiceId: r.invoiceId || undefined,
    contactId: r.contactId,
    contactName: r.contactName,
    contactTaxId: r.contactTaxId,
    date: r.date,
    status: r.status as any,
    subtotalCents: Number(r.subtotalCents),
    vatCents: Number(r.vatCents),
    whtCents: Number(r.whtCents),
    totalCents: Number(r.totalCents),
    paymentMethod: r.paymentMethod,
    lineItems: (r.lineItemsJson as unknown as LineItem[]) || [],
    createdAt: r.createdAt.toISOString(),
  };
}

// ----------------------------------------------------
// Contacts
// ----------------------------------------------------
export async function getContactsFromDb(
  companyId: string,
  limit: number = 100
): Promise<Contact[]> {
  if (!db) return [];
  const rows = await db
    .select()
    .from(schema.contacts)
    .where(eq(schema.contacts.companyId, companyId))
    .orderBy(desc(schema.contacts.createdAt))
    .limit(limit);

  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    taxId: c.taxId,
    branch: c.branch,
    type: c.type as any,
    address: c.address,
    phone: c.phone || '',
    email: c.email || '',
    creditTermsDays: c.creditTermsDays,
  }));
}

export async function getContactByIdFromDb(
  companyId: string,
  id: string
): Promise<Contact | null> {
  if (!db) return null;
  const [c] = await db
    .select()
    .from(schema.contacts)
    .where(
      and(
        eq(schema.contacts.id, id),
        eq(schema.contacts.companyId, companyId)
      )
    );

  if (!c) return null;

  return {
    id: c.id,
    name: c.name,
    taxId: c.taxId,
    branch: c.branch,
    type: c.type as any,
    address: c.address,
    phone: c.phone || '',
    email: c.email || '',
    creditTermsDays: c.creditTermsDays,
  };
}

export async function createContactInDb(
  companyId: string,
  data: Omit<Contact, 'id'>
): Promise<Contact> {
  if (!db) throw new Error('Database not connected');

  const newId = `ct_${Date.now()}`;
  const [inserted] = await db
    .insert(schema.contacts)
    .values({
      id: newId,
      companyId,
      name: data.name,
      taxId: data.taxId,
      branch: data.branch || 'สำนักงานใหญ่',
      type: data.type,
      address: data.address,
      phone: data.phone || null,
      email: data.email || null,
      creditTermsDays: data.creditTermsDays || 30,
    })
    .returning();

  return {
    id: inserted.id,
    name: inserted.name,
    taxId: inserted.taxId,
    branch: inserted.branch,
    type: inserted.type as any,
    address: inserted.address,
    phone: inserted.phone || '',
    email: inserted.email || '',
    creditTermsDays: inserted.creditTermsDays,
  };
}

// ----------------------------------------------------
// Products
// ----------------------------------------------------
export async function getProductsFromDb(
  companyId: string,
  limit: number = 100
): Promise<Product[]> {
  if (!db) return [];
  const rows = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.companyId, companyId))
    .orderBy(desc(schema.products.createdAt))
    .limit(limit);

  return rows.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    category: p.category,
    unit: p.unit,
    sellPriceCents: Number(p.sellPriceCents),
    costPriceCents: Number(p.costPriceCents),
    stockQuantity: p.stockQuantity,
    lowStockThreshold: p.lowStockThreshold,
    isService: p.isService,
  }));
}

export async function getProductByIdFromDb(
  companyId: string,
  id: string
): Promise<Product | null> {
  if (!db) return null;
  const [p] = await db
    .select()
    .from(schema.products)
    .where(
      and(
        eq(schema.products.id, id),
        eq(schema.products.companyId, companyId)
      )
    );

  if (!p) return null;

  return {
    id: p.id,
    code: p.code,
    name: p.name,
    category: p.category,
    unit: p.unit,
    sellPriceCents: Number(p.sellPriceCents),
    costPriceCents: Number(p.costPriceCents),
    stockQuantity: p.stockQuantity,
    lowStockThreshold: p.lowStockThreshold,
    isService: p.isService,
  };
}

export async function createProductInDb(
  companyId: string,
  data: Omit<Product, 'id'>
): Promise<Product> {
  if (!db) throw new Error('Database not connected');

  const newId = `prod_${Date.now()}`;
  const [inserted] = await db
    .insert(schema.products)
    .values({
      id: newId,
      companyId,
      code: data.code,
      name: data.name,
      category: data.category || 'ทั่วไป',
      unit: data.unit || 'ชิ้น',
      sellPriceCents: data.sellPriceCents || 0,
      costPriceCents: data.costPriceCents || 0,
      stockQuantity: data.stockQuantity || 0,
      lowStockThreshold: data.lowStockThreshold || 5,
      isService: !!data.isService,
      isActive: true,
    })
    .returning();

  return {
    id: inserted.id,
    code: inserted.code,
    name: inserted.name,
    category: inserted.category,
    unit: inserted.unit,
    sellPriceCents: Number(inserted.sellPriceCents),
    costPriceCents: Number(inserted.costPriceCents),
    stockQuantity: inserted.stockQuantity,
    lowStockThreshold: inserted.lowStockThreshold,
    isService: inserted.isService,
  };
}

// ----------------------------------------------------
// Company
// ----------------------------------------------------
export async function getCompanyFromDb(companyId: string): Promise<Company | null> {
  if (!db) return null;
  const [comp] = await db
    .select()
    .from(schema.companies)
    .where(eq(schema.companies.id, companyId));

  if (!comp) return null;

  return {
    id: comp.id,
    name: comp.name,
    taxId: comp.taxId,
    branch: comp.branch,
    address: comp.address,
    phone: comp.phone || '',
    email: comp.email || '',
    logoUrl: comp.logoUrl || undefined,
  };
}

export async function updateCompanyInDb(
  companyId: string,
  data: Partial<Company>
): Promise<Company> {
  if (!db) throw new Error('Database not connected');

  const [updated] = await db
    .update(schema.companies)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.taxId !== undefined && { taxId: data.taxId }),
      ...(data.branch !== undefined && { branch: data.branch }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
      ...(data.email !== undefined && { email: data.email || null }),
      updatedAt: new Date(),
    })
    .where(eq(schema.companies.id, companyId))
    .returning();

  return {
    id: updated.id,
    name: updated.name,
    taxId: updated.taxId,
    branch: updated.branch,
    address: updated.address,
    phone: updated.phone || '',
    email: updated.email || '',
    logoUrl: updated.logoUrl || undefined,
  };
}

// ----------------------------------------------------
// Dashboard Metrics
// ----------------------------------------------------
export async function getDashboardMetricsFromDb(
  companyId: string
): Promise<DashboardMetrics> {
  if (!db) {
    return {
      totalRevenueCents: 0,
      revenueChangePercent: 0,
      totalExpenseCents: 0,
      expenseChangePercent: 0,
      netProfitCents: 0,
      profitChangePercent: 0,
      overdueInvoicesCount: 0,
      overdueInvoicesTotalCents: 0,
      pendingQuotationsCount: 0,
    };
  }

  const allInvoices = await getInvoicesFromDb(companyId);
  const allQuotations = await getQuotationsFromDb(companyId);

  const totalRevenue = allInvoices.reduce((sum, inv) => sum + inv.amountPaidCents, 0);
  const pendingQuotations = allQuotations.filter(
    (q) => q.status === 'draft' || q.status === 'approved'
  ).length;

  const today = new Date().toISOString().split('T')[0];
  const overdueInvoices = allInvoices.filter(
    (inv) =>
      inv.amountDueCents > 0 &&
      (inv.status === 'overdue' || inv.dueDate < today)
  );

  const overdueTotalCents = overdueInvoices.reduce(
    (sum, inv) => sum + inv.amountDueCents,
    0
  );

  return {
    totalRevenueCents: totalRevenue,
    revenueChangePercent: 0,
    totalExpenseCents: 0,
    expenseChangePercent: 0,
    netProfitCents: totalRevenue,
    profitChangePercent: 0,
    overdueInvoicesCount: overdueInvoices.length,
    overdueInvoicesTotalCents: overdueTotalCents,
    pendingQuotationsCount: pendingQuotations,
  };
}
