import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}
const sql = neon(connectionString);

async function run(query) {
  return await sql.query(query);
}

async function migrateAndSeed() {
  console.log('🔄 1. Dropping existing tables (Confirmed by user)...');
  
  const drops = [
    'DROP TABLE IF EXISTS audit_logs CASCADE',
    'DROP TABLE IF EXISTS document_sequences CASCADE',
    'DROP TABLE IF EXISTS receipts CASCADE',
    'DROP TABLE IF EXISTS invoices CASCADE',
    'DROP TABLE IF EXISTS quotations CASCADE',
    'DROP TABLE IF EXISTS products CASCADE',
    'DROP TABLE IF EXISTS contacts CASCADE',
    'DROP TABLE IF EXISTS users CASCADE',
    'DROP TABLE IF EXISTS companies CASCADE',
    'DROP TABLE IF EXISTS alerts CASCADE',
    'DROP TABLE IF EXISTS submissions CASCADE',
    'DROP TABLE IF EXISTS bundles CASCADE',
    'DROP TABLE IF EXISTS forms CASCADE',
    'DROP TABLE IF EXISTS schedules CASCADE',
    'DROP TABLE IF EXISTS config CASCADE',
    'DROP TYPE IF EXISTS document_status CASCADE',
    'DROP TYPE IF EXISTS contact_type CASCADE',
    'DROP TYPE IF EXISTS user_role CASCADE',
  ];

  for (const d of drops) {
    await run(d);
  }

  console.log('✅ Dropped old tables successfully.');

  console.log('🔄 2. Creating Enums & Types...');
  await run("CREATE TYPE user_role AS ENUM ('owner', 'admin', 'editor', 'viewer')");
  await run("CREATE TYPE contact_type AS ENUM ('customer', 'supplier', 'both')");
  await run("CREATE TYPE document_status AS ENUM ('draft', 'approved', 'partially_paid', 'paid', 'overdue', 'voided', 'converted')");

  console.log('🔄 3. Creating Kanta Accounting Tables...');

  await run(`
    CREATE TABLE companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tax_id TEXT NOT NULL,
      branch TEXT NOT NULL DEFAULT 'สำนักงานใหญ่',
      address TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      logo_url TEXT,
      fiscal_year_start_month INTEGER NOT NULL DEFAULT 1,
      currency TEXT NOT NULL DEFAULT 'THB',
      plan TEXT NOT NULL DEFAULT 'pro',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )
  `);

  await run(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      role user_role NOT NULL DEFAULT 'editor',
      status TEXT NOT NULL DEFAULT 'active',
      avatar_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      CONSTRAINT users_company_email_unique UNIQUE (company_id, email)
    )
  `);
  await run('CREATE INDEX users_company_idx ON users(company_id)');

  await run(`
    CREATE TABLE contacts (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      tax_id TEXT NOT NULL,
      branch TEXT NOT NULL DEFAULT 'สำนักงานใหญ่',
      type contact_type NOT NULL DEFAULT 'customer',
      address TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      credit_terms_days INTEGER NOT NULL DEFAULT 30,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )
  `);
  await run('CREATE INDEX contacts_company_idx ON contacts(company_id)');

  await run(`
    CREATE TABLE products (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'ทั่วไป',
      unit TEXT NOT NULL DEFAULT 'ชิ้น',
      sell_price_cents BIGINT NOT NULL DEFAULT 0,
      cost_price_cents BIGINT NOT NULL DEFAULT 0,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      low_stock_threshold INTEGER NOT NULL DEFAULT 5,
      is_service BOOLEAN NOT NULL DEFAULT FALSE,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      CONSTRAINT products_company_code_unique UNIQUE (company_id, code)
    )
  `);
  await run('CREATE INDEX products_company_idx ON products(company_id)');

  await run(`
    CREATE TABLE quotations (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      document_number TEXT NOT NULL,
      contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
      contact_name TEXT NOT NULL,
      contact_tax_id TEXT NOT NULL,
      date TEXT NOT NULL,
      valid_until TEXT NOT NULL,
      status document_status NOT NULL DEFAULT 'draft',
      subtotal_cents BIGINT NOT NULL DEFAULT 0,
      discount_cents BIGINT NOT NULL DEFAULT 0,
      vat_cents BIGINT NOT NULL DEFAULT 0,
      total_cents BIGINT NOT NULL DEFAULT 0,
      notes TEXT,
      line_items_json JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      CONSTRAINT quotations_company_doc_unique UNIQUE (company_id, document_number)
    )
  `);
  await run('CREATE INDEX quotations_company_idx ON quotations(company_id)');

  await run(`
    CREATE TABLE invoices (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      document_number TEXT NOT NULL,
      quotation_id TEXT,
      contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
      contact_name TEXT NOT NULL,
      contact_tax_id TEXT NOT NULL,
      date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      credit_terms_days INTEGER NOT NULL DEFAULT 30,
      status document_status NOT NULL DEFAULT 'draft',
      subtotal_cents BIGINT NOT NULL DEFAULT 0,
      discount_cents BIGINT NOT NULL DEFAULT 0,
      vat_cents BIGINT NOT NULL DEFAULT 0,
      total_cents BIGINT NOT NULL DEFAULT 0,
      amount_paid_cents BIGINT NOT NULL DEFAULT 0,
      amount_due_cents BIGINT NOT NULL DEFAULT 0,
      notes TEXT,
      line_items_json JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      CONSTRAINT invoices_company_doc_unique UNIQUE (company_id, document_number)
    )
  `);
  await run('CREATE INDEX invoices_company_idx ON invoices(company_id)');

  await run(`
    CREATE TABLE receipts (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      document_number TEXT NOT NULL,
      invoice_id TEXT,
      contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
      contact_name TEXT NOT NULL,
      contact_tax_id TEXT NOT NULL,
      date TEXT NOT NULL,
      status document_status NOT NULL DEFAULT 'approved',
      subtotal_cents BIGINT NOT NULL DEFAULT 0,
      vat_cents BIGINT NOT NULL DEFAULT 0,
      wht_cents BIGINT NOT NULL DEFAULT 0,
      total_cents BIGINT NOT NULL DEFAULT 0,
      payment_method TEXT NOT NULL DEFAULT 'โอนเงินผ่านธนาคาร',
      line_items_json JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      CONSTRAINT receipts_company_doc_unique UNIQUE (company_id, document_number)
    )
  `);
  await run('CREATE INDEX receipts_company_idx ON receipts(company_id)');

  await run(`
    CREATE TABLE document_sequences (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      document_type TEXT NOT NULL,
      prefix TEXT NOT NULL,
      fiscal_year INTEGER NOT NULL,
      current_sequence INTEGER NOT NULL DEFAULT 0,
      CONSTRAINT doc_seq_company_type_year UNIQUE (company_id, document_type, fiscal_year)
    )
  `);

  await run(`
    CREATE TABLE audit_logs (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      metadata JSONB,
      ip_address TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )
  `);
  await run('CREATE INDEX audit_logs_company_idx ON audit_logs(company_id)');

  console.log('✅ Created all 9 tables successfully.');

  console.log('🔄 4. Seeding Initial Accounting Data...');

  await sql`
    INSERT INTO companies (id, name, tax_id, branch, address, phone, email)
    VALUES (
      'comp_01',
      'บริษัท สยาม ซอฟต์แวร์ อินโนเวชั่น จำกัด (มหาชน)',
      '0107558000123',
      'สำนักงานใหญ่',
      'เลขที่ 88/1 ถนนสาทรใต้ แขวงยานนาวา เขตสาทร กรุงเทพมหานคร 10120',
      '02-123-4567',
      'finance@siamsoftware.co.th'
    )
  `;

  await sql`
    INSERT INTO users (id, company_id, email, name, role, status)
    VALUES (
      'usr_dev_01',
      'comp_01',
      'developer@siamsoftware.co.th',
      'Developer Admin',
      'owner',
      'active'
    )
  `;

  await sql`
    INSERT INTO contacts (id, company_id, name, tax_id, branch, type, address, phone, email, credit_terms_days)
    VALUES
    (
      'ct_01',
      'comp_01',
      'บริษัท ไทยดิจิทัล รีเทล จำกัด',
      '0105556012345',
      'สาขา 00001 (เซ็นทรัลเวิลด์)',
      'customer',
      '999/9 ถนนพระราม 1 แขวงปทุมวัน เขตปทุมวัน กรุงเทพฯ 10330',
      '02-987-6543',
      'ap@thaidigital.co.th',
      30
    ),
    (
      'ct_02',
      'comp_01',
      'ห้างหุ้นส่วนจำกัด ธนบุรี โลจิสติกส์',
      '0103554009876',
      'สำนักงานใหญ่',
      'customer',
      '45 ถนนจรัญสนิทวงศ์ แขวงบางกอกน้อย เขตบางกอกน้อย กรุงเทพฯ 10700',
      '081-555-4321',
      'contact@thonburilogistics.com',
      15
    ),
    (
      'ct_03',
      'comp_01',
      'บริษัท คลาวด์ โฮสติ้ง โซลูชั่นส์ จำกัด',
      '0105560112233',
      'สำนักงานใหญ่',
      'supplier',
      '123 อาคารซันทาวเวอร์ส ถนนวิภาวดีรังสิต แขวงจอมพล เขตจตุจักร กรุงเทพฯ 10900',
      '02-777-8888',
      'billing@cloudhosting.co.th',
      30
    )
  `;

  await sql`
    INSERT INTO products (id, company_id, code, name, category, unit, sell_price_cents, cost_price_cents, stock_quantity, low_stock_threshold, is_service)
    VALUES
    (
      'prod_01',
      'comp_01',
      'SW-ERP-01',
      'แพ็กเกจระบบจัดการสต็อกสินค้า Cloud Inventory (รายปี)',
      'Software License',
      'แพ็กเกจ',
      2400000,
      800000,
      99,
      5,
      TRUE
    ),
    (
      'prod_02',
      'comp_01',
      'SRV-IMP-02',
      'บริการติดตั้งและฝึกอบรมการใช้งานระบบ (Implementation & Training)',
      'Consulting',
      'ครั้ง',
      1500000,
      600000,
      50,
      2,
      TRUE
    ),
    (
      'prod_03',
      'comp_01',
      'POS-TERM-03',
      'เครื่องสแกนบาร์โค้ดไร้สาย Barcode Scanner 2D QR Code',
      'Hardware',
      'เครื่อง',
      285000,
      160000,
      18,
      5,
      FALSE
    )
  `;

  const qtLineItems = [
    {
      id: 'li_qt_01',
      productId: 'prod_01',
      code: 'SW-ERP-01',
      description: 'แพ็กเกจระบบจัดการสต็อกสินค้า Cloud Inventory (รายปี)',
      quantity: 1,
      unit: 'แพ็กเกจ',
      unitPriceCents: 2400000,
      discountCents: 0,
      vatRate: 7,
      totalCents: 2400000,
    },
    {
      id: 'li_qt_02',
      productId: 'prod_03',
      code: 'POS-TERM-03',
      description: 'เครื่องสแกนบาร์โค้ดไร้สาย Barcode Scanner 2D QR Code',
      quantity: 1,
      unit: 'เครื่อง',
      unitPriceCents: 285000,
      discountCents: 85000,
      vatRate: 7,
      totalCents: 200000,
    },
  ];

  await sql`
    INSERT INTO quotations (
      id, company_id, document_number, contact_id, contact_name, contact_tax_id,
      date, valid_until, status, subtotal_cents, discount_cents, vat_cents, total_cents,
      notes, line_items_json
    )
    VALUES (
      'qt_01',
      'comp_01',
      'QT-2026-0001',
      'ct_01',
      'บริษัท ไทยดิจิทัล รีเทล จำกัด',
      '0105556012345',
      '2026-03-01',
      '2026-03-31',
      'converted',
      2685000,
      85000,
      182000,
      2782000,
      'กำหนดยืนราคา 30 วันนับจากวันที่ออกเอกสาร',
      ${JSON.stringify(qtLineItems)}
    )
  `;

  await sql`
    INSERT INTO invoices (
      id, company_id, document_number, quotation_id, contact_id, contact_name, contact_tax_id,
      date, due_date, credit_terms_days, status, subtotal_cents, discount_cents, vat_cents,
      total_cents, amount_paid_cents, amount_due_cents, notes, line_items_json
    )
    VALUES (
      'inv_01',
      'comp_01',
      'IV-2026-0001',
      'qt_01',
      'ct_01',
      'บริษัท ไทยดิจิทัล รีเทล จำกัด',
      '0105556012345',
      '2026-03-05',
      '2026-04-04',
      30,
      'partially_paid',
      2685000,
      85000,
      182000,
      2782000,
      1000000,
      1782000,
      'อ้างอิงใบเสนอราคา QT-2026-0001',
      ${JSON.stringify(qtLineItems)}
    )
  `;

  await sql`
    INSERT INTO receipts (
      id, company_id, document_number, invoice_id, contact_id, contact_name, contact_tax_id,
      date, status, subtotal_cents, vat_cents, wht_cents, total_cents, payment_method, line_items_json
    )
    VALUES (
      'rc_01',
      'comp_01',
      'RC-2026-0001',
      'inv_01',
      'ct_01',
      'บริษัท ไทยดิจิทัล รีเทล จำกัด',
      '0105556012345',
      '2026-03-10',
      'approved',
      934579,
      65421,
      0,
      1000000,
      'โอนเงินผ่านธนาคารกสิกรไทย',
      ${JSON.stringify(qtLineItems)}
    )
  `;

  await sql`
    INSERT INTO document_sequences (id, company_id, document_type, prefix, fiscal_year, current_sequence)
    VALUES
      ('seq_qt_2026', 'comp_01', 'QT', 'QT-2026-', 2026, 1),
      ('seq_iv_2026', 'comp_01', 'IV', 'IV-2026-', 2026, 1),
      ('seq_rc_2026', 'comp_01', 'RC', 'RC-2026-', 2026, 1)
  `;

  console.log('🎉 5. Database successfully migrated and seeded with clean Kanta data!');
}

migrateAndSeed().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
