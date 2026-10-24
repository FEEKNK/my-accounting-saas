import { z } from 'zod';

export const LineItemSchema = z.object({
  productId: z.string().optional(),
  code: z.string().default(''),
  description: z.string().min(1, 'ต้องระบุคำอธิบายรายการสินค้า/บริการ'),
  quantity: z.number().positive('จำนวนต้องมากกว่า 0'),
  unit: z.string().min(1, 'ต้องระบุหน่วย'),
  unitPriceCents: z.number().nonnegative('ราคาต่อหน่วยต้องไม่ติดลบ'),
  discountCents: z.number().nonnegative('ส่วนลดต้องไม่ติดลบ').default(0),
  vatRate: z.number().default(7),
  totalCents: z.number(),
});

export const CreateQuotationSchema = z.object({
  contactId: z.string().min(1, 'ต้องเลือกลูกค้า/ผู้ติดต่อ'),
  contactName: z.string().min(1),
  contactTaxId: z.string().length(13, 'เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'รูปแบบวันที่ต้องเป็น YYYY-MM-DD'),
  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'รูปแบบวันที่ต้องเป็น YYYY-MM-DD'),
  status: z.enum(['draft', 'approved', 'converted', 'voided']).default('draft'),
  notes: z.string().optional(),
  lineItems: z.array(LineItemSchema).min(1, 'ต้องมีรายการสินค้า/บริการอย่างน้อย 1 รายการ'),
});

export const CreateInvoiceSchema = z.object({
  quotationId: z.string().optional(),
  contactId: z.string().min(1, 'ต้องเลือกลูกค้า/ผู้ติดต่อ'),
  contactName: z.string().min(1),
  contactTaxId: z.string().length(13, 'เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  creditTermsDays: z.number().int().nonnegative().default(30),
  notes: z.string().optional(),
  lineItems: z.array(LineItemSchema).min(1),
});

export const RecordPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  paymentAmountCents: z.number().positive('จำนวนเงินชำระต้องมากกว่า 0'),
  paymentMethod: z.string().min(1, 'ต้องเลือกช่องทางการชำระเงิน'),
});

export const CreateContactSchema = z.object({
  name: z.string().min(1, 'ต้องระบุชื่อผู้ติดต่อหรือชื่อบริษัท'),
  taxId: z.string().default('0000000000000'),
  branch: z.string().default('สำนักงานใหญ่'),
  type: z.enum(['customer', 'supplier', 'both']).default('customer'),
  address: z.string().default('-'),
  phone: z.string().optional().default(''),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional().or(z.literal('')).default(''),
  creditTermsDays: z.number().int().nonnegative().default(30),
});

export const CreateProductSchema = z.object({
  code: z.string().min(1, 'ต้องระบุรหัสสินค้า'),
  name: z.string().min(1, 'ต้องระบุชื่อสินค้า/บริการ'),
  category: z.string().default('ทั่วไป'),
  unit: z.string().default('ชิ้น'),
  sellPriceCents: z.number().int().nonnegative('ราคาขายต้องไม่ติดลบ').default(0),
  costPriceCents: z.number().int().nonnegative('ราคาทุนต้องไม่ติดลบ').default(0),
  stockQuantity: z.number().int().default(0),
  lowStockThreshold: z.number().int().default(5),
  isService: z.boolean().default(false),
});

