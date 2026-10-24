'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  Building,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrencyTHB, formatThaiBahtText } from '@/lib/thai-baht';
import { Quotation, Company } from '@/types/accounting';

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Handle ESC key for modal
  useEffect(() => {
    if (!showConvertModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowConvertModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showConvertModal]);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setActionError(null);

        const [qRes, cRes] = await Promise.all([
          fetch(`/api/quotations/${id}`),
          fetch('/api/company'),
        ]);

        if (qRes.ok) {
          const qData = await qRes.json();
          if (qData.success) setQuotation(qData.data);
        }

        if (cRes.ok) {
          const cData = await cRes.json();
          if (cData.success) setCompany(cData.data);
        }
      } catch (err: any) {
        setActionError(err.message || 'ไม่สามารถโหลดข้อมูลใบเสนอราคาได้');
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
          <span className="text-sm">กำลังโหลดข้อมูลเอกสาร...</span>
        </div>
      </div>
    );
  }

  if (!quotation || !company) {
    return (
      <div className="p-12 text-center text-text-muted space-y-3">
        <AlertCircle className="w-8 h-8 text-danger mx-auto" />
        <div className="text-base font-semibold">ไม่พบเอกสารใบเสนอราคา</div>
        <Link href="/quotations">
          <Button variant="outline" size="sm">
            กลับหน้ารายการ
          </Button>
        </Link>
      </div>
    );
  }

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      setActionError(null);
      const res = await fetch(`/api/quotations/${quotation.id}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'ไม่สามารถอนุมัติเอกสารได้');
      }
      setQuotation(data.data);
    } catch (err: any) {
      setActionError(err.message || 'เกิดข้อผิดพลาดในการอนุมัติ');
    } finally {
      setIsApproving(false);
    }
  };

  const handleConvertToInvoice = async () => {
    try {
      setIsConverting(true);
      setActionError(null);
      const res = await fetch(`/api/quotations/${quotation.id}/convert`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'ไม่สามารถแปลงใบเสนอราคาเป็นใบแจ้งหนี้ได้');
      }
      router.push(`/invoices/${data.data.id}`);
    } catch (err: any) {
      setActionError(err.message || 'เกิดข้อผิดพลาดในการแปลงเอกสาร');
      setIsConverting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const companyInitial = (company.name ? company.name.trim().charAt(0) : 'K').toUpperCase();

  return (
    <div className="space-y-6 pb-16">
      {/* Top Action Bar (hidden on print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/quotations">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              กลับ
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text font-mono">
                {quotation.documentNumber}
              </h1>
              <StatusBadge status={quotation.status} size="sm" />
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              สร้างเมื่อ: {new Date(quotation.createdAt).toLocaleDateString('th-TH')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            onClick={handlePrint}
          >
            พิมพ์ / บันทึก PDF
          </Button>

          {quotation.status === 'draft' && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              onClick={handleApprove}
              isLoading={isApproving}
            >
              อนุมัติใบเสนอราคา
            </Button>
          )}

          {quotation.status === 'approved' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
              onClick={() => setShowConvertModal(true)}
              isLoading={isConverting}
            >
              แปลงเป็นใบแจ้งหนี้ (Convert to Invoice)
            </Button>
          )}

          {quotation.status === 'converted' && (
            <div className="px-3 py-1.5 text-xs rounded bg-surface border border-border text-text-muted flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              แปลงเป็นใบแจ้งหนี้เรียบร้อยแล้ว
            </div>
          )}
        </div>
      </div>

      {actionError && (
        <div className="print:hidden p-3 rounded bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* A4 Printable Document Container */}
      <div className="max-w-4xl mx-auto bg-bg border border-border-strong rounded-lg shadow-card p-8 sm:p-12 text-text print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-border-strong">
          {/* Issuer Details */}
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-accent text-on-accent font-bold flex items-center justify-center text-sm">
                {companyInitial}
              </div>
              <h2 className="text-base font-bold text-text">{company.name}</h2>
            </div>
            <p className="text-xs text-text-muted leading-relaxed max-w-md">
              {company.address || 'ไม่ระบุที่อยู่'}
            </p>
            <div className="text-xs text-text-muted flex gap-4 font-mono">
              <span>เลขประจำตัวผู้เสียภาษี: <strong>{company.taxId || '-'}</strong></span>
              <span>{company.branch || 'สำนักงานใหญ่'}</span>
            </div>
            {(company.phone || company.email) && (
              <p className="text-xs text-text-muted">
                {company.phone && `โทร: ${company.phone}`}
                {company.phone && company.email && ' | '}
                {company.email && `อีเมล: ${company.email}`}
              </p>
            )}
          </div>

          {/* Document Title & Reference */}
          <div className="text-right sm:min-w-56 space-y-2">
            <div className="inline-block px-3 py-1 rounded bg-surface border border-border-strong">
              <h3 className="text-lg font-bold text-accent tracking-wide">
                ใบเสนอราคา (QUOTATION)
              </h3>
            </div>
            <div className="text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-text-muted">เลขที่เอกสาร:</span>
                <span className="font-bold text-text">{quotation.documentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">วันที่ออก:</span>
                <span className="text-text">{quotation.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">ใช้ได้ถึง:</span>
                <span className="text-danger font-semibold">{quotation.validUntil}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer / Recipient Info */}
        <div className="py-6 border-b border-border">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            ลูกค้า / ผู้ติดต่อ (Customer Information)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="font-bold text-sm text-text">{quotation.contactName}</div>
              <div className="text-text-muted mt-1 font-mono">
                เลขประจำตัวผู้เสียภาษี: <strong>{quotation.contactTaxId}</strong>
              </div>
            </div>
            <div className="text-text-muted sm:text-right">
              <div>เงื่อนไขการยืนราคา: 30 วัน</div>
              <div className="mt-1">สถานะ: <span className="font-medium text-text capitalize">{quotation.status}</span></div>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-strong bg-surface">
                <th className="py-2.5 px-3 font-semibold text-text-muted text-center w-12">#</th>
                <th className="py-2.5 px-3 font-semibold text-text-muted">รายการสินค้า / บริการ</th>
                <th className="py-2.5 px-3 font-semibold text-text-muted text-right w-20">จำนวน</th>
                <th className="py-2.5 px-3 font-semibold text-text-muted text-center w-16">หน่วย</th>
                <th className="py-2.5 px-3 font-semibold text-text-muted text-right w-28">ราคา/หน่วย</th>
                <th className="py-2.5 px-3 font-semibold text-text-muted text-right w-24">ส่วนลด</th>
                <th className="py-2.5 px-3 font-semibold text-text-muted text-right w-28">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {quotation.lineItems.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="py-3 px-3 text-center text-text-subtle">{idx + 1}</td>
                  <td className="py-3 px-3 font-sans">
                    <div className="font-medium text-text">{item.description}</div>
                    {item.code && (
                      <div className="text-xs text-text-subtle font-mono">{item.code}</div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">{item.quantity}</td>
                  <td className="py-3 px-3 text-center font-sans text-text-muted">{item.unit}</td>
                  <td className="py-3 px-3 text-right">{formatCurrencyTHB(item.unitPriceCents)}</td>
                  <td className="py-3 px-3 text-right text-text-muted">
                    {item.discountCents > 0 ? formatCurrencyTHB(item.discountCents) : '-'}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-text">
                    {formatCurrencyTHB(item.totalCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary & Baht Text */}
        <div className="pt-4 border-t border-border-strong flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="flex-1 space-y-4">
            <div className="p-3 rounded bg-surface border border-border text-xs">
              <span className="text-text-muted font-medium">ตัวอักษร: </span>
              <span className="font-bold text-text">{formatThaiBahtText(quotation.totalCents)}</span>
            </div>

            {quotation.notes && (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-text-muted">หมายเหตุ:</div>
                <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line">
                  {quotation.notes}
                </p>
              </div>
            )}
          </div>

          {/* Totals Table */}
          <div className="w-full sm:w-72 space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1">
              <span className="text-text-muted">รวมเป็นเงิน (Subtotal):</span>
              <span className="text-text">{formatCurrencyTHB(quotation.subtotalCents)}</span>
            </div>
            {quotation.discountCents > 0 && (
              <div className="flex justify-between py-1 text-danger">
                <span>ส่วนลด (Discount):</span>
                <span>-{formatCurrencyTHB(quotation.discountCents)}</span>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span className="text-text-muted">ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
              <span className="text-text">{formatCurrencyTHB(quotation.vatCents)}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-b border-border-strong text-sm font-bold text-accent">
              <span>จำนวนเงินรวมทั้งสิ้น:</span>
              <span>{formatCurrencyTHB(quotation.totalCents)}</span>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div className="mt-16 pt-8 border-t border-border grid grid-cols-2 gap-12 text-center text-xs">
          <div className="space-y-12">
            <div className="border-b border-dashed border-border-strong w-48 mx-auto h-12"></div>
            <div>
              <div className="text-text font-medium">ผู้สั่งซื้อ / ผู้รับใบเสนอราคา</div>
              <div className="text-text-subtle mt-1 font-mono">วันที่ ...... / ...... / ..........</div>
            </div>
          </div>
          <div className="space-y-12">
            <div className="border-b border-dashed border-border-strong w-48 mx-auto h-12"></div>
            <div>
              <div className="text-text font-medium">ผู้มีอำนาจลงนาม / ผู้ออกเอกสาร</div>
              <div className="text-text-subtle mt-1 font-mono">วันที่ ...... / ...... / ..........</div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Conversion (ROB-01) */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text/40 backdrop-blur-xs">
          <div className="bg-bg border border-border rounded-lg shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/10 text-warning flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-text">
                  ยืนยันการแปลงเป็นใบแจ้งหนี้ (Convert to Invoice)
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  คุณต้องการแปลงใบเสนอราคา <strong className="text-text font-mono">{quotation.documentNumber}</strong> เป็นใบแจ้งหนี้ใช่หรือไม่?
                </p>
              </div>
              <button
                onClick={() => setShowConvertModal(false)}
                className="text-text-subtle hover:text-text p-1 rounded"
                aria-label="ปิดหน้าต่าง"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded bg-surface border border-border text-2xs text-text-muted space-y-1">
              <div>⚠️ <strong>เงื่อนไขสำคัญ:</strong></div>
              <div>• เมื่อแปลงแล้ว ใบเสนอราคาฉบับนี้จะถูกปรับสถานะเป็น "แปลงแล้ว (Converted)" และไม่สามารถแปลงซ้ำได้อีก</div>
              <div>• ระบบจะสร้างใบแจ้งหนี้ฉบับใหม่และส่งคุณไปยังหน้าใบแจ้งหนี้โดยอัตโนมัติ</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConvertModal(false)}
                disabled={isConverting}
              >
                ยกเลิก
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
                onClick={async () => {
                  setShowConvertModal(false);
                  await handleConvertToInvoice();
                }}
                isLoading={isConverting}
              >
                ยืนยันการแปลงเอกสาร
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
