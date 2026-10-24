'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrencyTHB, formatThaiBahtText } from '@/lib/thai-baht';
import { Receipt, Company } from '@/types/accounting';

export default function ReceiptDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [rcRes, compRes] = await Promise.all([
          fetch(`/api/receipts/${id}`),
          fetch('/api/company'),
        ]);

        if (rcRes.ok) {
          const rcData = await rcRes.json();
          if (rcData.success) setReceipt(rcData.data);
        }

        if (compRes.ok) {
          const compData = await compRes.json();
          if (compData.success) setCompany(compData.data);
        }
      } catch (e) {
        console.error('Failed to load receipt or company', e);
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-16 text-center text-text-muted space-y-3">
        <div className="inline-flex items-center gap-2">
          <svg className="animate-spin h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm">กำลังโหลดข้อมูลใบเสร็จรับเงิน...</span>
        </div>
      </div>
    );
  }

  if (!receipt || !company) {
    return (
      <div className="p-12 text-center text-text-muted space-y-3">
        <AlertCircle className="w-8 h-8 text-danger mx-auto" />
        <div className="text-base font-semibold">ไม่พบเอกสารใบเสร็จรับเงิน</div>
        <Link href="/receipts">
          <Button variant="outline" size="sm">
            กลับหน้ารายการ
          </Button>
        </Link>
      </div>
    );
  }

  const companyInitial = (company.name ? company.name.trim().charAt(0) : 'K').toUpperCase();

  return (
    <div className="space-y-6 pb-16">
      {/* Top Action Bar (hidden on print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/receipts">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              กลับ
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text font-mono">
                {receipt.documentNumber}
              </h1>
              <StatusBadge status={receipt.status} size="sm" />
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              วันที่รับเงิน: {receipt.date} • ช่องทาง: {receipt.paymentMethod}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-info-surface text-accent text-xs font-semibold border border-info-surface">
            <ShieldCheck className="w-4 h-4" />
            <span>e-Tax Invoice Ready (RD Certified Structure)</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={() => window.print()}
          >
            พิมพ์ใบเสร็จ
          </Button>
        </div>
      </div>

      {/* Official Thai Receipt / Tax Invoice Paper (A4 Preview) */}
      <div className="max-w-4xl mx-auto bg-bg border border-border-strong rounded-lg shadow-card p-8 sm:p-12 text-text print:border-none print:shadow-none print:p-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-border-strong">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-accent text-on-accent font-bold flex items-center justify-center text-sm">
                {companyInitial}
              </div>
              <h2 className="text-base font-bold text-text">{company.name}</h2>
            </div>
            <p className="text-xs text-text-muted leading-relaxed max-w-md">
              {company.address}
            </p>

            <div className="text-xs text-text-muted flex gap-4 font-mono">
              <span>เลขประจำตัวผู้เสียภาษี: <strong>{company.taxId}</strong></span>
              <span>{company.branch}</span>
            </div>
          </div>

          <div className="text-right sm:min-w-64 space-y-2">
            <div className="inline-block px-3 py-1.5 rounded bg-surface border border-border-strong text-right">
              <h3 className="text-base font-bold text-accent tracking-tight">
                ใบเสร็จรับเงิน / ใบกำกับภาษี
              </h3>
              <div className="text-2xs text-text-subtle uppercase">
                RECEIPT / TAX INVOICE (ต้นฉบับ)
              </div>
            </div>
            <div className="text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-text-muted">เลขที่เอกสาร:</span>
                <span className="font-bold text-text">{receipt.documentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">วันที่ชำระ:</span>
                <span className="text-text">{receipt.date}</span>
              </div>
              {receipt.invoiceId && (
                <div className="flex justify-between">
                  <span className="text-text-muted">อ้างอิงใบแจ้งหนี้:</span>
                  <span className="text-accent">{receipt.invoiceId}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Block */}
        <div className="my-6 p-4 rounded-md bg-surface border border-border text-xs space-y-1">
          <div className="text-text-subtle font-semibold uppercase tracking-wider text-2xs mb-1">
            ลูกค้า / ผู้จ่ายเงิน (RECEIVED FROM)
          </div>
          <div className="text-sm font-bold text-text">{receipt.contactName}</div>
          <div className="font-mono text-text-muted">
            เลขประจำตัวผู้เสียภาษี: <strong>{receipt.contactTaxId}</strong>
          </div>
        </div>

        {/* Items Table */}
        <div className="my-6 overflow-x-auto border border-border-strong rounded-md">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface border-b border-border-strong text-text font-bold">
                <th className="py-2.5 px-3 w-10 text-center">ลำดับ</th>
                <th className="py-2.5 px-3">รายละเอียด (Description)</th>
                <th className="py-2.5 px-3 w-16 text-right">จำนวน</th>
                <th className="py-2.5 px-3 w-16 text-center">หน่วย</th>
                <th className="py-2.5 px-3 w-28 text-right">ราคา/หน่วย</th>
                <th className="py-2.5 px-3 w-28 text-right">จำนวนเงิน (บาท)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {receipt.lineItems.map((li, idx) => (
                <tr key={li.id || idx}>
                  <td className="py-3 px-3 text-center text-text-subtle font-mono">{idx + 1}</td>
                  <td className="py-3 px-3 font-medium text-text">{li.description}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">{li.quantity}</td>
                  <td className="py-3 px-3 text-center text-text-muted">{li.unit}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">
                    {formatCurrencyTHB(li.unitPriceCents)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-text tabular-nums">
                    {formatCurrencyTHB(li.totalCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 pt-2">
          <div className="space-y-3">
            <div className="p-3 rounded bg-surface border border-border text-xs">
              <span className="font-semibold text-text block mb-1">ช่องทางการชำระเงิน:</span>
              <p className="text-text-muted">{receipt.paymentMethod}</p>
            </div>

            <div className="p-3 rounded bg-surface-alt border border-border-strong text-xs">
              <span className="text-text-subtle block mb-1">จำนวนเงินตัวอักษร:</span>
              <span className="font-bold text-accent font-sans">
                ( {formatThaiBahtText(receipt.totalCents)} )
              </span>
            </div>
          </div>

          <div className="p-4 rounded-md bg-surface border border-border space-y-2 text-xs">
            <div className="flex justify-between items-center text-text-muted">
              <span>รวมมูลค่าสินค้า/บริการ</span>
              <span className="font-mono font-medium text-text tabular-nums">
                {formatCurrencyTHB(receipt.subtotalCents)}
              </span>
            </div>
            <div className="flex justify-between items-center text-text-muted">
              <span>ภาษีมูลค่าเพิ่ม 7% (VAT 7%)</span>
              <span className="font-mono font-medium text-text tabular-nums">
                {formatCurrencyTHB(receipt.vatCents)}
              </span>
            </div>
            {receipt.whtCents > 0 && (
              <div className="flex justify-between items-center text-text-muted">
                <span>หักภาษี ณ ที่จ่าย (WHT)</span>
                <span className="font-mono font-medium text-danger tabular-nums">
                  -{formatCurrencyTHB(receipt.whtCents)}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-border-strong flex justify-between items-center text-sm font-bold text-text">
              <span>จำนวนเงินที่ชำระสุทธิ</span>
              <span className="font-mono text-base text-success tabular-nums">
                {formatCurrencyTHB(receipt.totalCents)}
              </span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t border-border text-xs text-center">
          <div className="space-y-10">
            <div className="text-text-muted">ผู้จ่ายเงิน</div>
            <div className="border-b border-border-input mx-8" />
            <div className="text-text-subtle">วันที่ ........................................</div>
          </div>
          <div className="space-y-10">
            <div className="text-text-muted">ผู้รับเงิน / ผู้มีอำนาจลงนาม</div>
            <div className="border-b border-border-input mx-8" />
            <div className="text-text-subtle">วันที่ {receipt.date}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
