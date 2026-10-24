/**
 * Converts numbers into Thai Baht text (BahtText).
 * Example: 1250.75 -> "หนึ่งพันสองร้อยห้าสิบบาทเจ็ดสิบห้าสตางค์"
 * Example: 100.00 -> "หนึ่งร้อยบาทถ้วน"
 */
export function formatThaiBahtText(cents: number): string {
  if (isNaN(cents) || cents === 0) return 'ศูนย์บาทถ้วน';

  const isNegative = cents < 0;
  const absCents = Math.abs(cents);
  const baht = Math.floor(absCents / 100);
  const satang = absCents % 100;

  const numbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  function convertGroup(val: number): string {
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

export function formatCurrencyTHB(cents: number): string {
  const isNegative = cents < 0;
  const absVal = Math.abs(cents) / 100;
  const formatted = absVal.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return isNegative ? `-฿${formatted}` : `฿${formatted}`;
}
