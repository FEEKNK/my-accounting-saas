'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Building, Phone, Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { FormField } from '@/components/ui/FormField';
import { EmptyState } from '@/components/ui/EmptyState';
import { Contact } from '@/types/accounting';

export default function ContactsListPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add Contact Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [branch, setBranch] = useState('สำนักงานใหญ่');
  const [type, setType] = useState<'customer' | 'supplier'>('customer');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [creditTermsDays, setCreditTermsDays] = useState(30);

  async function loadContacts() {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/contacts');
      if (!res.ok) throw new Error('ไม่สามารถโหลดข้อมูลผู้ติดต่อได้');
      const json = await res.json();
      if (json.success) {
        setContacts(json.data);
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadContacts();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          taxId: taxId.trim() || '0000000000000',
          branch: branch.trim() || 'สำนักงานใหญ่',
          type,
          address: address.trim() || '-',
          phone: phone.trim(),
          email: email.trim(),
          creditTermsDays: Number(creditTermsDays) || 30,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'ไม่สามารถเพิ่มผู้ติดต่อได้');
      }

      setContacts((prev) => [json.data, ...prev]);
      setShowAddModal(false);

      // Reset form
      setName('');
      setTaxId('');
      setAddress('');
      setPhone('');
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกผู้ติดต่อ');
    } finally {
      setIsSubmitting(false);
    }
  };


  const filtered = contacts.filter((c) => {
    const matchType = filterType === 'all' || c.type === filterType;
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.taxId.includes(searchQuery);
    return matchType && matchSearch;
  });

  const columns: Column<Contact>[] = [
    {
      key: 'name',
      header: 'ชื่อผู้ติดต่อ / นิติบุคคล',
      render: (c) => (
        <div>
          <div className="font-semibold text-text flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-text-subtle" />
            {c.name}
          </div>
          <div className="text-xs text-text-muted mt-0.5">{c.branch}</div>
        </div>
      ),
    },
    {
      key: 'taxId',
      header: 'เลขประจำตัวผู้เสียภาษี',
      render: (c) => <span className="font-mono text-text">{c.taxId || '-'}</span>,
    },
    {
      key: 'type',
      header: 'ประเภท',
      align: 'center',
      render: (c) => (
        <span
          className={`inline-block px-2 py-0.5 rounded-pill text-xs font-medium ${
            c.type === 'customer'
              ? 'bg-info-surface text-accent'
              : c.type === 'supplier'
              ? 'bg-warning-surface text-warning-text'
              : 'bg-surface text-text'
          }`}
        >
          {c.type === 'customer' ? 'ลูกค้า' : c.type === 'supplier' ? 'ผู้จำหน่าย' : 'ทั้งสองอย่าง'}
        </span>
      ),
    },
    {
      key: 'contact',
      header: 'ช่องทางติดต่อ',
      render: (c) => (
        <div className="text-xs text-text-muted space-y-0.5">
          {c.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-text-subtle" />
              {c.phone}
            </div>
          )}
          {c.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-text-subtle" />
              {c.email}
            </div>
          )}
          {!c.phone && !c.email && <span>-</span>}
        </div>
      ),
    },
    {
      key: 'creditTermsDays',
      header: 'เครดิตเทอม (วัน)',
      align: 'right',
      render: (c) => (
        <span className="font-mono font-medium text-text tabular-nums">
          {c.creditTermsDays} วัน
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
            ผู้ติดต่อ (Contacts: Customers & Suppliers)
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            จัดการฐานข้อมูลลูกค้า ผู้จำหน่าย เลขประจำตัวผู้เสียภาษี และเครดิตเทอม
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowAddModal(true)}
        >
          เพิ่มผู้ติดต่อใหม่
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'customer', label: 'ลูกค้า' },
            { id: 'supplier', label: 'ผู้จำหน่าย' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-colors ${
                filterType === tab.id
                  ? 'bg-accent text-on-accent'
                  : 'bg-surface border border-border text-text-muted hover:bg-surface-alt'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อผู้ติดต่อ หรือเลขภาษี..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-bg rounded-md border border-border-input placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-danger/10 border border-danger/30 text-danger text-sm flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {!isLoading && contacts.length === 0 ? (
        <EmptyState
          icon={Building}
          title="ยังไม่มีผู้ติดต่อในระบบ"
          description="บันทึกข้อมูลลูกค้าหรือผู้จำหน่าย เพื่อใช้ออกใบเสนอราคาและใบแจ้งหนี้ได้อย่างรวดเร็ว"
          actionText="เพิ่มผู้ติดต่อใหม่"
          onActionClick={() => setShowAddModal(true)}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          emptyMessage="ยังไม่มีรายชื่อผู้ติดต่อที่ตรงกับเงื่อนไขการค้นหา"
        />
      )}


      {/* Add Contact Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text/40 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-bg rounded-lg border border-border shadow-modal max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-text flex items-center gap-2">
                <Building className="w-4 h-4 text-accent" />
                เพิ่มผู้ติดต่อใหม่ (Add Contact)
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-text-subtle hover:text-text p-1"
                aria-label="ปิดหน้าต่าง"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text mb-1 block">
                  ประเภทผู้ติดต่อ <span className="text-danger">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-text cursor-pointer">
                    <input
                      type="radio"
                      name="contactType"
                      checked={type === 'customer'}
                      onChange={() => setType('customer')}
                      className="text-accent"
                    />
                    ลูกค้า (Customer)
                  </label>
                  <label className="flex items-center gap-2 text-xs text-text cursor-pointer">
                    <input
                      type="radio"
                      name="contactType"
                      checked={type === 'supplier'}
                      onChange={() => setType('supplier')}
                      className="text-accent"
                    />
                    ผู้จำหน่าย (Supplier)
                  </label>
                </div>
              </div>

              <FormField
                label="ชื่อบริษัท / ชื่อบุคคล"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น บริษัท เจริญทรัพย์ โลจิสติกส์ จำกัด"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  label="เลขประจำตัวผู้เสียภาษี (Tax ID)"
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="เช่น 0105560123456"
                />
                <FormField
                  label="สาขา"
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="สำนักงานใหญ่"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text mb-1 block">
                  ที่อยู่ (สำหรับออกเอกสาร)
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ที่อยู่ตาม ภ.พ.20 หรือที่อยู่ตามบัตรประชาชน"
                  className="w-full p-2.5 text-xs bg-bg border border-border-input rounded-md text-text focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField
                  label="เบอร์โทรศัพท์"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081-234-5678"
                />
                <FormField
                  label="อีเมล"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@customer.com"
                />
                <FormField
                  label="เครดิตเทอม (วัน)"
                  type="number"
                  value={creditTermsDays}
                  onChange={(e) => setCreditTermsDays(Number(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setShowAddModal(false)}
                >
                  ยกเลิก
                </Button>
                <Button type="submit" variant="primary" size="md">
                  บันทึกผู้ติดต่อ
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
