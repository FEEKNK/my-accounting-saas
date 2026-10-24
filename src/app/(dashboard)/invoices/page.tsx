'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrencyTHB } from '@/lib/thai-baht';
import { Invoice } from '@/types/accounting';

export default function InvoicesListPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvoices() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch('/api/invoices');
        if (!res.ok) throw new Error('ไม่สามารถโหลดข้อมูลใบแจ้งหนี้ได้');
        const json = await res.json();
        if (json.success) {
          setInvoices(json.data);
        }
      } catch (err: any) {
        setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setIsLoading(false);
      }
    }

    loadInvoices();
  }, []);

  const filtered = invoices.filter((inv) => {
    const matchStatus = filterStatus === 'all' || inv.status === filterStatus;
    const matchSearch =
      inv.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.contactName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const columns: Column<Invoice>[] = [
    {
      key: 'documentNumber',
      header: 'เลขที่ใบแจ้งหนี้',
      render: (inv) => (
        <Link
          href={`/invoices/${inv.id}`}
          className="font-mono font-semibold text-accent hover:underline flex items-center gap-1.5"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-text-subtle" />
          {inv.documentNumber}
        </Link>
      ),
    },
    {
      key: 'date',
      header: 'วันที่',
      render: (inv) => <span className="text-text-muted">{inv.date}</span>,
    },
    {
      key: 'contactName',
      header: 'ลูกค้า / ผู้ติดต่อ',
      render: (inv) => (
        <div>
          <div className="font-medium text-text">{inv.contactName}</div>
          <div className="text-xs text-text-subtle font-mono">Tax ID: {inv.contactTaxId}</div>
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'ครบกำหนดชำระ',
      render: (inv) => (
        <span
          className={`font-mono text-xs ${
            inv.status === 'overdue' ? 'text-danger font-bold' : 'text-text-muted'
          }`}
        >
          {inv.dueDate}
        </span>
      ),
    },
    {
      key: 'totalCents',
      header: 'ยอดรวม (บาท)',
      align: 'right',
      render: (inv) => (
        <span className="font-bold font-mono text-text">
          {formatCurrencyTHB(inv.totalCents)}
        </span>
      ),
    },
    {
      key: 'amountDueCents',
      header: 'ค้างชำระ (บาท)',
      align: 'right',
      render: (inv) => (
        <span
          className={`font-bold font-mono ${
            inv.amountDueCents > 0 ? 'text-danger' : 'text-success'
          }`}
        >
          {formatCurrencyTHB(inv.amountDueCents)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'สถานะ',
      align: 'center',
      render: (inv) => <StatusBadge status={inv.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'จัดการ',
      align: 'right',
      render: (inv) => (
        <Link href={`/invoices/${inv.id}`}>
          <Button variant="ghost" size="sm">
            ดูรายละเอียด
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
            ใบแจ้งหนี้ (Invoices)
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            จัดการรายการเรียกเก็บเงิน ติดตามยอดค้างชำระ และบันทึกการรับชำระเงิน
          </p>
        </div>

        <Link href="/quotations">
          <Button variant="outline" size="md" leftIcon={<Plus className="w-4 h-4" />}>
            ออกใบแจ้งหนี้จากใบเสนอราคา
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-danger/10 border border-danger/30 text-danger text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'approved', label: 'รอชำระเงิน' },
            { id: 'partially_paid', label: 'ชำระบางส่วน' },
            { id: 'paid', label: 'ชำระแล้ว' },
            { id: 'overdue', label: 'เกินกำหนด' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-accent text-on-accent'
                  : 'bg-surface text-text-muted hover:bg-surface-alt hover:text-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่เอกสาร หรือชื่อลูกค้า..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-bg border border-border rounded-md text-text placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {/* Data Table or Empty State */}
      {!isLoading && invoices.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="ยังไม่มีใบแจ้งหนี้ในระบบ"
          description="เมื่อลูกค้าอนุมัติใบเสนอราคา คุณสามารถกด 'แปลงเป็นใบแจ้งหนี้' ได้ทันทีเพื่อเริ่มบันทึกการรับชำระเงิน"
          actionText="ไปที่รายการใบเสนอราคา"
          actionHref="/quotations"
        />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          emptyMessage={
            searchQuery || filterStatus !== 'all'
              ? 'ไม่พบใบแจ้งหนี้ที่ตรงกับเงื่อนไขการค้นหา'
              : 'ยังไม่มีใบแจ้งหนี้'
          }
        />
      )}
    </div>
  );
}
