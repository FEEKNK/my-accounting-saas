import React from 'react';
import Link from 'next/link';
import { Percent, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function TaxStubPage() {
  return (
    <div className="py-16 px-6 text-center border border-border rounded-lg bg-bg max-w-xl mx-auto space-y-4 shadow-sm my-8">
      <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
        <Percent className="w-7 h-7" />
      </div>
      <div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-accent/10 text-accent border border-accent/20 mb-2">
          Coming Soon
        </span>
        <h1 className="text-lg font-bold text-text">ระบบภาษี (Thai Tax Compliance)</h1>
      </div>
      <p className="text-xs text-text-muted leading-relaxed max-w-md mx-auto">
        รายงานภาษีมูลค่าเพิ่ม ภ.พ.30, ภาษีหัก ณ ที่จ่าย ภ.ง.ด. 1/2/3/53 และหนังสือรับรองการหักภาษี ณ ที่จ่าย (50 ทวิ) อยู่ในแผนการพัฒนาเวอร์ชันถัดไป
      </p>
      <div className="pt-2">
        <Link href="/">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            กลับหน้าแดชบอร์ด
          </Button>
        </Link>
      </div>
    </div>
  );
}
