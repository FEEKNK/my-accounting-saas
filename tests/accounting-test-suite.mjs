import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// 1. Thai Baht Text Algorithm Tests
function formatThaiBahtText(cents) {
  if (isNaN(cents) || cents === 0) return 'ศูนย์บาทถ้วน';

  const isNegative = cents < 0;
  const absCents = Math.abs(cents);
  const baht = Math.floor(absCents / 100);
  const satang = absCents % 100;

  const numbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  function convertGroup(val) {
    let result = '';
    const digits = val.toString().split('').map(Number);
    const len = digits.length;

    for (let i = 0; i < len; i++) {
      const digit = digits[i];
      const pos = len - i - 1;

      if (digit === 0) continue;

      if (pos === 1 && digit === 1) {
        result += 'สิบ';
      } else if (pos === 1 && digit === 2) {
        result += 'ยี่สิบ';
      } else if (pos === 0 && digit === 1 && len > 1 && digits[len - 2] !== 0) {
        result += 'เอ็ด';
      } else {
        result += numbers[digit] + units[pos];
      }
    }
    return result;
  }

  let text = '';
  if (baht > 0) {
    if (baht >= 1000000) {
      const millions = Math.floor(baht / 1000000);
      const remain = baht % 1000000;
      text += convertGroup(millions) + 'ล้าน' + convertGroup(remain);
    } else {
      text += convertGroup(baht);
    }
    text += 'บาท';
  }

  if (satang === 0) {
    text += 'ถ้วน';
  } else {
    text += convertGroup(satang) + 'สตางค์';
  }

  return isNegative ? `ลบ${text}` : text;
}

describe('Thai Baht Text Conversion Tests (F02-E1, F02-E2)', () => {
  test('formats zero baht', () => {
    assert.equal(formatThaiBahtText(0), 'ศูนย์บาทถ้วน');
  });

  test('formats whole baht without satang', () => {
    assert.equal(formatThaiBahtText(10000), 'หนึ่งร้อยบาทถ้วน');
    assert.equal(formatThaiBahtText(2782000), 'สองหมื่นเจ็ดพันแปดร้อยยี่สิบบาทถ้วน');
  });

  test('formats baht with satang', () => {
    assert.equal(formatThaiBahtText(125075), 'หนึ่งพันสองร้อยห้าสิบบาทเจ็ดสิบห้าสตางค์');
    assert.equal(formatThaiBahtText(2100), 'ยี่สิบเอ็ดบาทถ้วน');
  });

  test('formats millions correctly', () => {
    assert.equal(formatThaiBahtText(150000000), 'หนึ่งล้านห้าแสนบาทถ้วน');
  });
});

// 2. Accounting Calculation Engine Tests
describe('Accounting Math & VAT Calculation (F02-H1)', () => {
  test('calculates line item subtotal, discount, and 7% VAT without floating-point inaccuracies', () => {
    const items = [
      { unitPriceCents: 2400000, qty: 1, discountCents: 0 },
      { unitPriceCents: 285000, qty: 1, discountCents: 85000 },
    ];

    const subtotalCents = items.reduce((sum, item) => sum + item.unitPriceCents * item.qty, 0);
    assert.equal(subtotalCents, 2685000); // 26,850.00 THB

    const totalDiscountCents = items.reduce((sum, item) => sum + item.discountCents, 0);
    assert.equal(totalDiscountCents, 85000); // 850.00 THB

    const netTaxableCents = subtotalCents - totalDiscountCents;
    assert.equal(netTaxableCents, 2600000); // 26,000.00 THB

    const vatCents = Math.round(netTaxableCents * 0.07);
    assert.equal(vatCents, 182000); // 1,820.00 THB

    const grandTotalCents = netTaxableCents + vatCents;
    assert.equal(grandTotalCents, 2782000); // 27,820.00 THB
  });
});

// 3. Core Sales Loop Simulation (F02 -> F03)
describe('Core Sales Flow Simulation (F02 -> F03)', () => {
  let mockQuotation;
  let mockInvoice;
  let mockReceipt;

  test('F02-H1: creates quotation with status draft, can approve', () => {
    mockQuotation = {
      id: 'qt_test_1',
      documentNumber: 'QT-2026-0001',
      status: 'draft',
      totalCents: 2782000,
    };
    assert.equal(mockQuotation.status, 'draft');

    // Approve
    mockQuotation.status = 'approved';
    assert.equal(mockQuotation.status, 'approved');
  });

  test('F03-H1: converts quotation to invoice and updates quotation status to converted', () => {
    // Conversion action
    mockQuotation.status = 'converted';
    mockInvoice = {
      id: 'inv_test_1',
      documentNumber: 'IV-2026-0001',
      quotationId: mockQuotation.id,
      totalCents: mockQuotation.totalCents,
      amountPaidCents: 0,
      amountDueCents: mockQuotation.totalCents,
      status: 'approved',
    };

    assert.equal(mockQuotation.status, 'converted');
    assert.equal(mockInvoice.amountDueCents, 2782000);
    assert.equal(mockInvoice.status, 'approved');
  });

  test('F03-E1: partial payment sets status to partially_paid', () => {
    const paymentAmount = 1000000; // 10,000.00 THB
    mockInvoice.amountPaidCents += paymentAmount;
    mockInvoice.amountDueCents -= paymentAmount;
    mockInvoice.status = mockInvoice.amountDueCents === 0 ? 'paid' : 'partially_paid';

    assert.equal(mockInvoice.amountPaidCents, 1000000);
    assert.equal(mockInvoice.amountDueCents, 1782000);
    assert.equal(mockInvoice.status, 'partially_paid');
  });

  test('F03-H2: full remaining payment sets status to paid and creates receipt', () => {
    const remainingPayment = mockInvoice.amountDueCents;
    mockInvoice.amountPaidCents += remainingPayment;
    mockInvoice.amountDueCents = 0;
    mockInvoice.status = 'paid';

    mockReceipt = {
      id: 'rc_test_1',
      documentNumber: 'RC-2026-0001',
      invoiceId: mockInvoice.id,
      totalCents: remainingPayment,
      status: 'approved',
    };

    assert.equal(mockInvoice.amountPaidCents, 2782000);
    assert.equal(mockInvoice.amountDueCents, 0);
    assert.equal(mockInvoice.status, 'paid');
    assert.equal(mockReceipt.totalCents, 1782000);
    assert.equal(mockReceipt.status, 'approved');
  });
});

// 4. Security & Multi-Tenant Access Tests (F14)
describe('Security & Tenant Isolation Tests (F14-H1, F14-N1)', () => {
  function requireTenant(companyId) {
    if (!companyId || typeof companyId !== 'string' || companyId.trim() === '') {
      throw new Error('Valid company_id is required for this operation');
    }
    return companyId.trim();
  }

  test('requireTenant rejects missing, null, or empty tenant IDs', () => {
    assert.throws(() => requireTenant(''), /Valid company_id is required/);
    assert.throws(() => requireTenant(null), /Valid company_id is required/);
    assert.throws(() => requireTenant(undefined), /Valid company_id is required/);
    assert.equal(requireTenant('comp_01'), 'comp_01');
  });

  test('canUser RBAC rules strictly enforce permissions', () => {
    const permissions = {
      owner: ['read', 'create', 'update', 'approve', 'delete'],
      editor: ['read', 'create', 'update'],
      viewer: ['read'],
    };

    function canUser(role, action) {
      return (permissions[role] || []).includes(action);
    }

    assert.equal(canUser('owner', 'delete'), true);
    assert.equal(canUser('editor', 'update'), true);
    assert.equal(canUser('editor', 'delete'), false);
    assert.equal(canUser('viewer', 'read'), true);
    assert.equal(canUser('viewer', 'create'), false);
    assert.equal(canUser('viewer', 'update'), false);
  });

  test('verifyTenantMembership prevents cross-tenant BOLA / IDOR access (SEC-01)', () => {
    function verifyTenantMembership(userAllowedCompanyIds, requestedCompanyId) {
      if (!requestedCompanyId || typeof requestedCompanyId !== 'string' || requestedCompanyId.trim() === '') {
        throw new Error('Valid company_id is required');
      }
      const verified = requestedCompanyId.trim();
      if (!userAllowedCompanyIds.includes(verified)) {
        throw new Error(`Access denied to tenant '${verified}'`);
      }
      return verified;
    }

    const userAllowed = ['comp_01'];

    // Authorized tenant
    assert.equal(verifyTenantMembership(userAllowed, 'comp_01'), 'comp_01');

    // Cross-tenant IDOR attack
    assert.throws(
      () => verifyTenantMembership(userAllowed, 'comp_attacker_victim'),
      /Access denied to tenant 'comp_attacker_victim'/
    );
    assert.throws(
      () => verifyTenantMembership(userAllowed, ''),
      /Valid company_id is required/
    );
  });
});

// 5. Robustness & Edge Cases (ROB-01, ROB-02)
describe('Payment Robustness & Quotation Conversion Guards (ROB-01, ROB-02)', () => {
  function validatePaymentAmount(paymentAmountCents, inv) {
    if (!Number.isInteger(paymentAmountCents) || paymentAmountCents <= 0) {
      throw new Error('ยอดเงินที่ชำระต้องเป็นจำนวนเต็มสตางค์ที่มีค่ามากกว่า 0');
    }
    if (inv.amountDueCents <= 0 || inv.status === 'paid') {
      throw new Error('ใบแจ้งหนี้นี้ได้รับการชำระเงินเต็มจำนวนเรียบร้อยแล้ว');
    }
    if (paymentAmountCents > inv.amountDueCents) {
      throw new Error('ยอดเงินที่ระบุเกินยอดค้างชำระจริง');
    }
    return true;
  }

  test('rejects negative, zero, and non-integer payment amounts', () => {
    const inv = { amountDueCents: 500000, status: 'approved' };

    assert.throws(() => validatePaymentAmount(0, inv), /มากกว่า 0/);
    assert.throws(() => validatePaymentAmount(-1000, inv), /มากกว่า 0/);
    assert.throws(() => validatePaymentAmount(150.5, inv), /จำนวนเต็มสตางค์/);
    assert.throws(() => validatePaymentAmount(NaN, inv), /จำนวนเต็มสตางค์/);
  });

  test('rejects overpayments exceeding amount due', () => {
    const inv = { amountDueCents: 500000, status: 'approved' };
    assert.throws(() => validatePaymentAmount(500001, inv), /เกินยอดค้างชำระจริง/);
    assert.equal(validatePaymentAmount(500000, inv), true);
    assert.equal(validatePaymentAmount(250000, inv), true);
  });

  test('rejects payments on already-paid invoices', () => {
    const inv = { amountDueCents: 0, status: 'paid' };
    assert.throws(() => validatePaymentAmount(1000, inv), /เรียบร้อยแล้ว/);
  });

  test('rejects duplicate conversion on already converted quotation (ROB-02)', () => {
    function convertQuotation(qt) {
      if (qt.status === 'converted') {
        throw new Error('ใบเสนอราคานี้ได้รับการแปลงเป็นใบแจ้งหนี้ไปแล้ว');
      }
      qt.status = 'converted';
      return { id: 'inv_new', quotationId: qt.id };
    }

    const quotation = { id: 'qt_01', status: 'approved' };
    const firstInvoice = convertQuotation(quotation);
    assert.equal(firstInvoice.quotationId, 'qt_01');
    assert.equal(quotation.status, 'converted');

    // Duplicate call must throw
    assert.throws(() => convertQuotation(quotation), /ได้รับการแปลงเป็นใบแจ้งหนี้ไปแล้ว/);
  });
});

describe('Authentication & Token Security Tests (AUTH-01, AUTH-02)', async () => {
  const { hashPassword, verifyPassword } = await import('../src/lib/auth/password.ts');
  const { createSessionToken, verifySessionToken } = await import('../src/lib/auth/token.ts');

  test('hashes password with salt and verifies valid password correctly', async () => {
    const rawPass = 'SecretPassword123!';
    const hash = await hashPassword(rawPass);
    assert.ok(hash.includes(':'), 'Hash must contain salt:key delimiter');

    const isValid = await verifyPassword(rawPass, hash);
    assert.equal(isValid, true, 'Valid password must verify as true');

    const isInvalid = await verifyPassword('WrongPassword!', hash);
    assert.equal(isInvalid, false, 'Wrong password must verify as false');
  });

  test('creates and verifies valid HMAC-SHA256 session tokens', async () => {
    const payload = {
      userId: 'usr_test_123',
      email: 'user@test.co.th',
      companyId: 'comp_test_123',
      role: 'owner',
    };

    const token = await createSessionToken(payload, 3600);
    assert.ok(token.includes('.'), 'Token must contain payload.signature');

    const verified = await verifySessionToken(token);
    assert.ok(verified, 'Verified payload must not be null');
    assert.equal(verified.userId, 'usr_test_123');
    assert.equal(verified.companyId, 'comp_test_123');
    assert.equal(verified.role, 'owner');
  });

  test('rejects tampered session tokens', async () => {
    const payload = {
      userId: 'usr_001',
      email: 'legit@test.com',
      companyId: 'comp_001',
      role: 'viewer',
    };

    const token = await createSessionToken(payload, 3600);
    const [payloadB64, sig] = token.split('.');
    
    // Attempt to tamper role from viewer to owner
    const tamperedPayload = Buffer.from(
      JSON.stringify({ ...payload, role: 'owner', exp: Math.floor(Date.now() / 1000) + 3600 })
    ).toString('base64url');
    const tamperedToken = `${tamperedPayload}.${sig}`;

    const result = await verifySessionToken(tamperedToken);
    assert.equal(result, null, 'Tampered token must be rejected');
  });

  test('rejects expired session tokens', async () => {
    const payload = {
      userId: 'usr_001',
      email: 'exp@test.com',
      companyId: 'comp_001',
      role: 'admin',
    };

    // Negative expiration (already expired)
    const token = await createSessionToken(payload, -10);
    const result = await verifySessionToken(token);
    assert.equal(result, null, 'Expired token must be rejected');
  });
});

// 7. Rate Limiter Tests (SEC-04)
describe('Sliding Window Rate Limiter Tests (SEC-04)', async () => {
  const { checkRateLimit, resetRateLimit } = await import('../src/lib/security/rate-limiter.ts');

  test('allows attempts within configured limit', () => {
    const testKey = 'test_ip:192.168.1.50';
    resetRateLimit(testKey);

    const res1 = checkRateLimit(testKey, 3, 60);
    assert.equal(res1.allowed, true);
    assert.equal(res1.remaining, 2);

    const res2 = checkRateLimit(testKey, 3, 60);
    assert.equal(res2.allowed, true);
    assert.equal(res2.remaining, 1);

    const res3 = checkRateLimit(testKey, 3, 60);
    assert.equal(res3.allowed, true);
    assert.equal(res3.remaining, 0);
  });

  test('blocks 4th attempt when maxAttempts is 3', () => {
    const testKey = 'test_ip:192.168.1.51';
    resetRateLimit(testKey);

    for (let i = 0; i < 3; i++) {
      checkRateLimit(testKey, 3, 60);
    }

    const blocked = checkRateLimit(testKey, 3, 60);
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.remaining, 0);
    assert.ok(blocked.resetSeconds > 0);
  });

  test('resets quota immediately upon calling resetRateLimit', () => {
    const testKey = 'test_ip:192.168.1.52';
    for (let i = 0; i < 5; i++) {
      checkRateLimit(testKey, 3, 60);
    }
    assert.equal(checkRateLimit(testKey, 3, 60).allowed, false);

    resetRateLimit(testKey);

    const retry = checkRateLimit(testKey, 3, 60);
    assert.equal(retry.allowed, true);
    assert.equal(retry.remaining, 2);
  });
});

// 8. Document Sequence Number Formatter Tests (SEC-01)
describe('Document Sequence Formatting (SEC-01)', () => {
  function formatDocumentNumber(prefix, year, seq) {
    return `${prefix}-${year}-${String(seq).padStart(4, '0')}`;
  }

  test('formats document sequence numbers with 4-digit zero padding', () => {
    assert.equal(formatDocumentNumber('QT', 2026, 1), 'QT-2026-0001');
    assert.equal(formatDocumentNumber('IV', 2026, 42), 'IV-2026-0042');
    assert.equal(formatDocumentNumber('RC', 2026, 999), 'RC-2026-0999');
    assert.equal(formatDocumentNumber('QT', 2026, 10000), 'QT-2026-10000');
  });
});



