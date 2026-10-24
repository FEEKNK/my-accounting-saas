import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}
const sql = neon(connectionString);

async function wipeFakeData() {
  console.log('🗑️ Wiping all fake data from Neon PostgreSQL...');

  await sql.query('TRUNCATE TABLE receipts CASCADE');
  await sql.query('TRUNCATE TABLE invoices CASCADE');
  await sql.query('TRUNCATE TABLE quotations CASCADE');
  await sql.query('TRUNCATE TABLE products CASCADE');
  await sql.query('TRUNCATE TABLE contacts CASCADE');
  await sql.query('TRUNCATE TABLE audit_logs CASCADE');
  await sql.query('UPDATE document_sequences SET current_sequence = 0');
  
  await sql`
    UPDATE companies 
    SET 
      name = 'กิจการของฉัน (โปรดระบุชื่อในหน้าตั้งค่า)',
      tax_id = '',
      branch = 'สำนักงานใหญ่',
      address = '',
      phone = '',
      email = ''
    WHERE id = 'comp_01'
  `;

  console.log('✅ All fake accounting records have been completely wiped from Neon!');
}

wipeFakeData().catch((err) => {
  console.error('❌ Wipe failed:', err);
  process.exit(1);
});
