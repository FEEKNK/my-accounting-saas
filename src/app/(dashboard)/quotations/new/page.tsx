'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2, ArrowLeft, Save, CheckCircle2, AlertCircle, Building, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { formatCurrencyTHB, formatThaiBahtText } from '@/lib/thai-baht';
import { Contact, Product, LineItem } from '@/types/accounting';

interface FormLineItem {
  id: string;
  productId: string;
  code: string;
  description: string;
  quantity: number;
  unit: string;
  unitPriceBaht: number;
  discountBaht: number;
  vatRate: number;
}

function createEmptyLineItem(prodId = ''): FormLineItem {
  return {
    id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    productId: prodId,
    code: '',
    description: '',
    quantity: 1,
    unit: 'ชิ้น',
    unitPriceBaht: 0,
    discountBaht: 0,
    vatRate: 7,
  };
}

export default function NewQuotationPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedContactId, setSelectedContactId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [validDays, setValidDays] = useState(30);
  const [notes, setNotes] = useState('กำหนดยืนราคา 30 วันนับจากวันที่ออกเอกสาร');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [quickContactName, setQuickContactName] = useState('');
  const [quickContactTaxId, setQuickContactTaxId] = useState('');
  const [quickContactAddress, setQuickContactAddress] = useState('');
  const [quickContactPhone, setQuickContactPhone] = useState('');

  const [lineItems, setLineItems] = useState<FormLineItem[]>([
    createEmptyLineItem(),
  ]);

  useEffect(() => {
    async function init() {
      try {
        const [cRes, pRes] = await Promise.all([
          fetch('/api/contacts'),
          fetch('/api/products'),
        ]);
        if (cRes.ok) {
          const cData = await cRes.json();
          if (cData.success && Array.isArray(cData.data)) {
            setContacts(cData.data);
            if (cData.data.length > 0) {
              setSelectedContactId(cData.data[0].id);
            }
          }
        }
        if (pRes.ok) {
          const pData = await pRes.json();
          if (pData.success && Array.isArray(pData.data)) {
            setProducts(pData.data);
          }
        }
      } catch (e) {
        console.error('Failed to load initial contacts/products', e);
      }
    }
    init();
  }, []);


  const validUntilDate = new Date(
    new Date(date).getTime() + validDays * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .split('T')[0];

  const handleProductSelect = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;

    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      productId: prod.id,
      code: prod.code,
      description: prod.name,
      unitPriceBaht: prod.sellPriceCents / 100,
      unit: prod.unit,
    };
    setLineItems(updated);
  };

  const updateLineItem = (index: number, field: string, val: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: val };
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, createEmptyLineItem()]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    const target = lineItems[index];
    const hasData = target.description.trim() !== '' || target.unitPriceBaht > 0;
    if (hasData && typeof window !== 'undefined') {
      const confirmed = window.confirm(`คุณต้องการลบรายการ "${target.description || 'รายการนี้'}" ใช่หรือไม่?`);
      if (!confirmed) return;
    }
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Computations in integer cents
  const subtotalCents = lineItems.reduce((acc, item) => {
    const lineGross = Math.round(item.quantity * item.unitPriceBaht * 100);
    return acc + lineGross;
  }, 0);

  const discountCents = lineItems.reduce((acc, item) => {
    return acc + Math.round(item.discountBaht * 100);
  }, 0);

  const netTaxableCents = Math.max(0, subtotalCents - discountCents);
  const vatCents = Math.round(netTaxableCents * 0.07);
  const totalCents = netTaxableCents + vatCents;
  const bahtText = formatThaiBahtText(totalCents);

  const selectedContact = contacts.find((c) => c.id === selectedContactId);

  const handleSubmit = async (approveImmediately: boolean) => {
    if (isSubmitting) return;

    if (!selectedContact) {
      setSubmitError('กรุณาเลือกลูกค้าหรือผู้ติดต่อก่อนบันทึกเอกสาร');
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const items: LineItem[] = lineItems.map((li) => ({
        id: li.id,
        productId: li.productId,
        code: li.code,
        description: li.description,
        quantity: Number(li.quantity),
        unit: li.unit,
        unitPriceCents: Math.round(li.unitPriceBaht * 100),
        discountCents: Math.round(li.discountBaht * 100),
        vatRate: li.vatRate,
        totalCents: Math.round((li.quantity * li.unitPriceBaht - li.discountBaht) * 100),
      }));

      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: selectedContact.id,
          contactName: selectedContact.name,
          contactTaxId: selectedContact.taxId,
          date,
          validUntil: validUntilDate,
          status: approveImmediately ? 'approved' : 'draft',
          notes,
          lineItems: items,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'เกิดข้อผิดพลาดในการสร้างใบเสนอราคา');
      }

      router.push(`/quotations/${json.data.id}`);
    } catch (err: any) {
      setSubmitError(err.message || 'เกิดข้อผิดพลาดในการสร้างใบเสนอราคา');
      setIsSubmitting(false);
    }
  };

  const handleQuickContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickContactName.trim()) return;

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: quickContactName.trim(),
          taxId: quickContactTaxId.trim() || '0000000000000',
          branch: 'สำนักงานใหญ่',
          type: 'customer',
          address: quickContactAddress.trim() || '-',
          phone: quickContactPhone.trim(),
          email: '',
          creditTermsDays: 30,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'เกิดข้อผิดพลาดในการเพิ่มลูกค้า');
      }

      const newC = json.data;
      setContacts((prev) => [newC, ...prev]);
      setSelectedContactId(newC.id);
      setShowAddContactModal(false);

      setQuickContactName('');
      setQuickContactTaxId('');
      setQuickContactAddress('');
      setQuickContactPhone('');
    } catch (err: any) {
      setSubmitError(err.message || 'เกิดข้อผิดพลาดในการเพิ่มลูกค้า');
    }
  };


  return (
    <div className="space-y-6 pb-16">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/quotations">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              กลับ
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
              สร้างใบเสนอราคาใหม่ (New Quotation)
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              เลขที่เอกสารจะถูกจัดลำดับอัตโนมัติ (เช่น QT-2026-0001)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Save className="w-4 h-4" />}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            onClick={() => handleSubmit(false)}
          >
            บันทึกร่าง
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            onClick={() => handleSubmit(true)}
          >
            บันทึกและอนุมัติ
          </Button>
        </div>
      </div>

      {/* Validation / Submission Error Banner */}
      {submitError && (
        <div
          className="p-3.5 rounded-md bg-danger-surface border border-danger/20 text-danger text-xs flex items-center justify-between gap-2"
          role="alert"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
          <button
            onClick={() => setSubmitError(null)}
            className="text-danger hover:opacity-75 text-xs font-semibold px-2 py-0.5"
            aria-label="ปิดการแจ้งเตือนข้อผิดพลาด"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Builder Form Card */}
      <div className="rounded-lg border border-border bg-bg shadow-sm p-6 space-y-6">
        {/* Contact and Date Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Contact Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-text">
                ลูกค้า / ผู้ติดต่อ <span className="text-danger">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowAddContactModal(true)}
                className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
              >
                <Plus className="w-3 h-3" /> เพิ่มลูกค้าใหม่
              </button>
            </div>
            <select
              value={selectedContactId}
              onChange={(e) => setSelectedContactId(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-bg border border-border-input rounded-md text-text focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {contacts.length === 0 ? (
                <option value="">-- ยังไม่มีรายชื่อลูกค้า (กดปุ่ม '+ เพิ่มลูกค้าใหม่' ด้านบน) --</option>
              ) : (
                <>
                  <option value="">-- เลือกลูกค้า --</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.branch})
                    </option>
                  ))}
                </>
              )}
            </select>

            {selectedContact && (
              <div className="mt-2 p-2.5 rounded bg-surface border border-border text-xs text-text-muted space-y-1">
                <div>Tax ID: <span className="font-mono font-medium text-text">{selectedContact.taxId || '-'}</span></div>
                <div className="truncate">{selectedContact.address || '-'}</div>
                <div>โทร: {selectedContact.phone || '-'}</div>
              </div>
            )}
          </div>


          {/* Date Picker */}
          <div>
            <FormField
              label="วันที่เอกสาร"
              type="date"
              value={date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Valid Days */}
          <div>
            <FormField
              label="กำหนดยืนราคา (วัน)"
              type="number"
              value={validDays}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValidDays(Number(e.target.value))}
              helperText={`ใช้ได้ถึงวันที่: ${validUntilDate}`}
              required
            />
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text">รายการสินค้าและบริการ</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={addLineItem}
            >
              เพิ่มแถวรายการ
            </Button>
          </div>

          <div className="overflow-x-auto border border-border rounded-md">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface border-b border-border-strong text-text-muted font-semibold">
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3 w-48">เลือกจากสินค้าในระบบ</th>
                  <th className="py-2.5 px-3">คำอธิบายรายการ</th>
                  <th className="py-2.5 px-3 w-20 text-right">จำนวน</th>
                  <th className="py-2.5 px-3 w-20">หน่วย</th>
                  <th className="py-2.5 px-3 w-32 text-right">ราคา/หน่วย (บาท)</th>
                  <th className="py-2.5 px-3 w-24 text-right">ส่วนลด (บาท)</th>
                  <th className="py-2.5 px-3 w-20 text-center">ภาษี VAT</th>
                  <th className="py-2.5 px-3 w-32 text-right">รวมเงิน (บาท)</th>
                  <th className="py-2.5 px-3 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lineItems.map((item, idx) => {
                  const lineTotal =
                    Math.max(0, item.quantity * item.unitPriceBaht - item.discountBaht);

                  return (
                    <tr key={item.id} className="hover:bg-surface/50">
                      <td className="py-2 px-3 text-center text-text-subtle font-mono">
                        {idx + 1}
                      </td>

                      <td className="py-2 px-3">
                        <select
                          value={item.productId}
                          onChange={(e) => handleProductSelect(idx, e.target.value)}
                          className="w-full h-8 px-2 bg-bg border border-border-input rounded text-xs text-text focus:outline-none"
                        >
                          <option value="">-- กำหนดเอง --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.code} - {p.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                          placeholder="รายละเอียดสินค้าหรือบริการ"
                          className="w-full h-8 px-2 bg-bg border border-border-input rounded text-xs text-text focus:outline-none"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateLineItem(idx, 'quantity', Math.max(1, Number(e.target.value)))
                          }
                          className="w-full h-8 px-2 bg-bg border border-border-input rounded text-xs text-text text-right font-mono focus:outline-none"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => updateLineItem(idx, 'unit', e.target.value)}
                          className="w-full h-8 px-2 bg-bg border border-border-input rounded text-xs text-text focus:outline-none"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPriceBaht}
                          onChange={(e) =>
                            updateLineItem(idx, 'unitPriceBaht', Number(e.target.value))
                          }
                          className="w-full h-8 px-2 bg-bg border border-border-input rounded text-xs text-text text-right font-mono focus:outline-none"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.discountBaht}
                          onChange={(e) =>
                            updateLineItem(idx, 'discountBaht', Number(e.target.value))
                          }
                          className="w-full h-8 px-2 bg-bg border border-border-input rounded text-xs text-text text-right font-mono focus:outline-none"
                        />
                      </td>

                      <td className="py-2 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded bg-surface border border-border text-xs font-semibold text-text-muted">
                          7%
                        </span>
                      </td>

                      <td className="py-2 px-3 text-right font-mono font-semibold text-text tabular-nums">
                        {lineTotal.toLocaleString('th-TH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeLineItem(idx)}
                          className="p-1 rounded text-text-subtle hover:text-danger hover:bg-surface"
                          aria-label="ลบรายการ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes and Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-text mb-1.5 block">
              หมายเหตุท้ายเอกสาร
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เงื่อนไขการชำระเงิน, ข้อมูลการส่งมอบ, ข้อตกลงเพิ่มเติม..."
              className="w-full p-2.5 text-xs bg-bg border border-border-input rounded-md text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-accent"
            />

            {/* Thai Baht Text Display */}
            <div className="mt-3 p-3 rounded-md bg-surface border border-border">
              <span className="text-xs text-text-subtle block mb-1">
                จำนวนเงินตัวอักษร (Baht Text):
              </span>
              <span className="text-xs font-bold text-accent font-sans">
                ( {bahtText} )
              </span>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="p-4 rounded-md bg-surface border border-border space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-text-muted">
              <span>รวมเป็นเงิน (Subtotal)</span>
              <span className="font-mono font-medium text-text tabular-nums">
                {formatCurrencyTHB(subtotalCents)}
              </span>
            </div>

            <div className="flex justify-between items-center text-text-muted">
              <span>ส่วนลดรวม (Discount)</span>
              <span className="font-mono font-medium text-danger tabular-nums">
                -{formatCurrencyTHB(discountCents)}
              </span>
            </div>

            <div className="flex justify-between items-center text-text-muted">
              <span>มูลค่าหลังหักส่วนลด (Net Taxable)</span>
              <span className="font-mono font-medium text-text tabular-nums">
                {formatCurrencyTHB(netTaxableCents)}
              </span>
            </div>

            <div className="flex justify-between items-center text-text-muted">
              <span>ภาษีมูลค่าเพิ่ม 7% (VAT 7%)</span>
              <span className="font-mono font-medium text-text tabular-nums">
                {formatCurrencyTHB(vatCents)}
              </span>
            </div>

            <div className="pt-2 border-t border-border-strong flex justify-between items-center text-sm font-bold text-text">
              <span>จำนวนเงินรวมทั้งสิ้น (Grand Total)</span>
              <span className="font-mono text-base text-accent tabular-nums">
                {formatCurrencyTHB(totalCents)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Contact Modal */}
      {showAddContactModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text/40 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-bg rounded-lg border border-border shadow-modal max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-text flex items-center gap-2">
                <Building className="w-4 h-4 text-accent" />
                เพิ่มลูกค้าใหม่ด่วน (Quick Add Customer)
              </h3>
              <button
                type="button"
                onClick={() => setShowAddContactModal(false)}
                className="text-text-subtle hover:text-text p-1"
                aria-label="ปิดหน้าต่าง"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickContactSubmit} className="space-y-4">
              <FormField
                label="ชื่อลูกค้า / บริษัท / นิติบุคคล"
                type="text"
                value={quickContactName}
                onChange={(e) => setQuickContactName(e.target.value)}
                placeholder="เช่น บริษัท สยามเทรดดิ้ง จำกัด หรือ คุณสมศักดิ์"
                required
              />

              <FormField
                label="เลขประจำตัวผู้เสียภาษี (Tax ID)"
                type="text"
                value={quickContactTaxId}
                onChange={(e) => setQuickContactTaxId(e.target.value)}
                placeholder="0105560000000 (ถ้ามี)"
              />

              <div>
                <label className="text-xs font-semibold text-text mb-1 block">
                  ที่อยู่ลูกค้า (สำหรับออกเอกสาร)
                </label>
                <textarea
                  rows={2}
                  value={quickContactAddress}
                  onChange={(e) => setQuickContactAddress(e.target.value)}
                  placeholder="เลขที่, ถนน, แขวง, เขต, จังหวัด"
                  className="w-full p-2.5 text-xs bg-bg border border-border-input rounded-md text-text focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <FormField
                label="เบอร์โทรศัพท์"
                type="text"
                value={quickContactPhone}
                onChange={(e) => setQuickContactPhone(e.target.value)}
                placeholder="081-234-5678"
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setShowAddContactModal(false)}
                >
                  ยกเลิก
                </Button>
                <Button type="submit" variant="primary" size="md">
                  บันทึกและเลือกลูกค้าคนนี้
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

