'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Receipt as ReceiptIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { formatCurrencyTHB, formatThaiBahtText } from '@/lib/thai-baht';
import { Invoice, Company, Receipt } from '@/types/accounting';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmountBaht, setPaymentAmountBaht] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('โอนเงินผ่านธนาคารกสิกรไทย');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [createdReceipt, setCreatedReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [invRes, compRes] = await Promise.all([
          fetch(`/api/invoices/${id}`),
          fetch('/api/company'),
        ]);

        if (invRes.ok) {
          const invData = await invRes.json();
          if (invData.success) {
            setInvoice(invData.data);
            setPaymentAmountBaht(invData.data.amountDueCents / 100);
          }
        }

        if (compRes.ok) {
          const compData = await compRes.json();
          if (compData.success) {
            setCompany(compData.data);
          }
        }
      } catch (e) {
        console.error('Failed to load invoice or company', e);
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id]);

  // Handle ESC key to dismiss payment modal
  useEffect(() => {
    if (!showPaymentModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPaymentModal(false);
        setPaymentError(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPaymentModal]);

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
          <span className="text-sm">กำลังโหลดข้อมูลใบแจ้งหนี้...</span>
        </div>
      </div>
    );
  }

  if (!invoice || !company) {
    return (
      <div className="p-12 text-center text-text-muted space-y-3">
        <AlertCircle className="w-8 h-8 text-danger mx-auto" />
        <div className="text-base font-semibold">ไม่พบเอกสารใบแจ้งหนี้</div>
        <Link href="/invoices">
          <Button variant="outline" size="sm">
            กลับหน้ารายการ
          </Button>
        </Link>
      </div>
    );
  }

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);
    setIsSubmittingPayment(true);

    try {
      const paymentCents = Math.round(paymentAmountBaht * 100);
      const res = await fetch(`/api/invoices/${invoice.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentAmountCents: paymentCents,
          paymentMethod,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'เกิดข้อผิดพลาดในการบันทึกการรับชำระเงิน');
      }

      setCreatedReceipt(json.data.receipt);
      setInvoice(json.data.invoice);
      setShowPaymentModal(false);
    } catch (err: any) {
      setPaymentError(err.message || 'เกิดข้อผิดพลาดในการบันทึกการรับชำระเงิน');
    } finally {
      setIsSubmittingPayment(false);
    }
  };



  return (
    <div className="space-y-6 pb-16">
      {/* Top Action Bar (hidden on print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/invoices">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              กลับ
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text font-mono">
                {invoice.documentNumber}
              </h1>
              <StatusBadge status={invoice.status} size="sm" />
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              สร้างเมื่อ: {new Date(invoice.createdAt).toLocaleDateString('th-TH')}
              {invoice.quotationId && ` • อ้างอิงใบเสนอราคา`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={() => window.print()}
          >
            พิมพ์เอกสาร
          </Button>

          {invoice.amountDueCents > 0 && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<DollarSign className="w-4 h-4" />}
              onClick={() => setShowPaymentModal(true)}
            >
              บันทึกการรับชำระเงิน (Record Payment)
            </Button>
          )}

          {invoice.status === 'paid' && (
            <span className="text-xs font-semibold text-success-text px-3 py-1.5 rounded bg-success-surface border border-success-surface flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-success" />
              ชำระเงินครบถ้วนแล้ว
            </span>
          )}
        </div>
      </div>

      {/* Success Notification after Payment */}
      {createdReceipt && (
        <div className="p-4 rounded-md bg-success-surface border border-success-surface flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-success-text font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>ออกใบเสร็จรับเงิน {createdReceipt.documentNumber} เรียบร้อยแล้ว!</span>
          </div>
          <Link href={`/receipts/${createdReceipt.id}`}>
            <Button variant="outline" size="sm" leftIcon={<ReceiptIcon className="w-3.5 h-3.5" />}>
              เปิดดูใบเสร็จรับเงิน/ใบกำกับภาษี
            </Button>
          </Link>
        </div>
      )}

      {/* Official Thai Invoice Document Preview */}
      <div className="max-w-4xl mx-auto bg-bg border border-border-strong rounded-lg shadow-card p-8 sm:p-12 text-text print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-border-strong">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-accent text-on-accent font-bold flex items-center justify-center text-sm">
                {(company.name ? company.name.trim().charAt(0) : 'K').toUpperCase()}
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

          <div className="text-right sm:min-w-56 space-y-2">
            <div className="inline-block px-3 py-1 rounded bg-surface border border-border-strong">
              <h3 className="text-lg font-bold text-accent tracking-wide">
                ใบแจ้งหนี้ (INVOICE)
              </h3>
            </div>
            <div className="text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-text-muted">เลขที่เอกสาร:</span>
                <span className="font-bold text-text">{invoice.documentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">วันที่ออก:</span>
                <span className="text-text">{invoice.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">วันครบกำหนด:</span>
                <span className="text-danger font-semibold">{invoice.dueDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="my-6 p-4 rounded-md bg-surface border border-border text-xs space-y-1">
          <div className="text-text-subtle font-semibold uppercase tracking-wider text-2xs mb-1">
            ลูกค้า / ผู้ติดต่อ (CUSTOMER)
          </div>
          <div className="text-sm font-bold text-text">{invoice.contactName}</div>
          <div className="font-mono text-text-muted">
            เลขประจำตัวผู้เสียภาษี: <strong>{invoice.contactTaxId}</strong>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="my-6 overflow-x-auto border border-border-strong rounded-md">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface border-b border-border-strong text-text font-bold">
                <th className="py-2.5 px-3 w-10 text-center">ลำดับ</th>
                <th className="py-2.5 px-3">รายละเอียด (Description)</th>
                <th className="py-2.5 px-3 w-16 text-right">จำนวน</th>
                <th className="py-2.5 px-3 w-16 text-center">หน่วย</th>
                <th className="py-2.5 px-3 w-28 text-right">ราคา/หน่วย</th>
                <th className="py-2.5 px-3 w-24 text-right">ส่วนลด</th>
                <th className="py-2.5 px-3 w-28 text-right">จำนวนเงิน (บาท)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoice.lineItems.map((li, idx) => (
                <tr key={li.id || idx}>
                  <td className="py-3 px-3 text-center text-text-subtle font-mono">{idx + 1}</td>
                  <td className="py-3 px-3 font-medium text-text">{li.description}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">{li.quantity}</td>
                  <td className="py-3 px-3 text-center text-text-muted">{li.unit}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">
                    {formatCurrencyTHB(li.unitPriceCents)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-danger tabular-nums">
                    {li.discountCents > 0 ? `-${formatCurrencyTHB(li.discountCents)}` : '-'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-text tabular-nums">
                    {formatCurrencyTHB(li.totalCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Outstanding Balance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 pt-2">
          <div className="space-y-3">
            <div className="p-3 rounded bg-surface border border-border text-xs">
              <span className="font-semibold text-text block mb-1">หมายเหตุ:</span>
              <p className="text-text-muted">{invoice.notes || '-'}</p>
            </div>

            <div className="p-3 rounded bg-surface-alt border border-border-strong text-xs">
              <span className="text-text-subtle block mb-1">จำนวนเงินตัวอักษร:</span>
              <span className="font-bold text-accent font-sans">
                ( {formatThaiBahtText(invoice.totalCents)} )
              </span>
            </div>
          </div>

          <div className="p-4 rounded-md bg-surface border border-border space-y-2 text-xs">
            <div className="flex justify-between items-center text-text-muted">
              <span>รวมเป็นเงิน (Subtotal)</span>
              <span className="font-mono font-medium text-text tabular-nums">
                {formatCurrencyTHB(invoice.subtotalCents)}
              </span>
            </div>
            <div className="flex justify-between items-center text-text-muted">
              <span>ส่วนลด (Discount)</span>
              <span className="font-mono font-medium text-danger tabular-nums">
                -{formatCurrencyTHB(invoice.discountCents)}
              </span>
            </div>
            <div className="flex justify-between items-center text-text-muted">
              <span>ภาษีมูลค่าเพิ่ม 7% (VAT 7%)</span>
              <span className="font-mono font-medium text-text tabular-nums">
                {formatCurrencyTHB(invoice.vatCents)}
              </span>
            </div>
            <div className="pt-2 border-t border-border-strong flex justify-between items-center text-sm font-bold text-text">
              <span>ยอดเงินรวมทั้งสิ้น (Grand Total)</span>
              <span className="font-mono text-base text-accent tabular-nums">
                {formatCurrencyTHB(invoice.totalCents)}
              </span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between items-center font-semibold">
              <span className="text-text-muted">ชำระแล้ว (Amount Paid)</span>
              <span className="font-mono text-success tabular-nums">
                {formatCurrencyTHB(invoice.amountPaidCents)}
              </span>
            </div>
            <div className="flex justify-between items-center font-bold">
              <span className="text-text">ยอดคงค้าง (Amount Due)</span>
              <span className="font-mono text-danger tabular-nums">
                {formatCurrencyTHB(invoice.amountDueCents)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text/40 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-modal-title"
        >
          <div className="bg-bg rounded-lg border border-border shadow-modal max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 id="payment-modal-title" className="text-base font-bold text-text">
                บันทึกการรับชำระเงิน (Record Payment)
              </h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentError(null);
                }}
                className="text-text-subtle hover:text-text p-1 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="ปิดหน้าต่างบันทึกการรับชำระเงิน"
              >
                ✕
              </button>
            </div>

            {paymentError && (
              <div
                className="p-3 rounded-md bg-danger-surface border border-danger/20 text-danger text-xs flex items-center gap-2"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              <div className="p-3 rounded bg-surface border border-border text-xs space-y-1">
                <div>อ้างอิงใบแจ้งหนี้: <strong>{invoice.documentNumber}</strong></div>
                <div>ลูกค้า: <strong>{invoice.contactName}</strong></div>
                <div>ยอดค้างชำระ: <strong className="text-danger">{formatCurrencyTHB(invoice.amountDueCents)}</strong></div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text mb-1 block">
                  จำนวนเงินที่ได้รับ (บาท) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={invoice.amountDueCents / 100}
                  value={paymentAmountBaht}
                  onChange={(e) => setPaymentAmountBaht(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-bg border border-border-input rounded-md text-sm font-mono tabular-nums text-text focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text mb-1 block">
                  ช่องทางการชำระเงิน <span className="text-danger">*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-10 px-3 bg-bg border border-border-input rounded-md text-xs text-text focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="โอนเงินผ่านธนาคารกสิกรไทย">โอนเงินผ่านธนาคารกสิกรไทย (KBANK)</option>
                  <option value="โอนเงินผ่านธนาคารไทยพาณิชย์">โอนเงินผ่านธนาคารไทยพาณิชย์ (SCB)</option>
                  <option value="เงินสด (Cash)">เงินสด (Cash)</option>
                  <option value="เช็คธนาคาร (Cheque)">เช็คธนาคาร (Cheque)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentError(null);
                  }}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmittingPayment}
                >
                  ยืนยันและออกใบเสร็จ
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
