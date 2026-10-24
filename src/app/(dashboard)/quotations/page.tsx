'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrencyTHB } from '@/lib/thai-baht';
import { Quotation } from '@/types/accounting';

export default function QuotationsListPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuotations() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch('/api/quotations');
        if (!res.ok) throw new Error('ไม่สามารถโหลดข้อมูลใบเสนอราคาได้');
        const json = await res.json();
        if (json.success) {
          setQuotations(json.data);
        }
      } catch (err: any) {
        setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setIsLoading(false);
      }
    }

    loadQuotations();
  }, []);

  const filtered = quotations.filter((q) => {
    const matchStatus = filterStatus === 'all' || q.status === filterStatus;
    const matchSearch =
      q.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.contactName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const columns: Column<Quotation>[] = [
    {
      key: 'documentNumber',
      header: 'เลขที่เอกสาร',
      render: (q) => (
        <Link
          href={`/quotations/${q.id}`}
          className="font-mono font-semibold text-accent hover:underline flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-text-subtle" />
          {q.documentNumber}
        </Link>
      ),
    },
    {
      key: 'date',
      header: 'วันที่',
      render: (q) => <span className="text-text-muted">{q.date}</span>,
    },
    {
      key: 'contactName',
      header: 'ลูกค้า / ผู้ติดต่อ',
      render: (q) => (
        <div>
          <div className="font-medium text-text">{q.contactName}</div>
          <div className="text-xs text-text-subtle font-mono">Tax ID: {q.contactTaxId}</div>
        </div>
      ),
    },
    {
      key: 'validUntil',
      header: 'ใช้ได้ถึง',
      render: (q) => <span className="text-text-muted">{q.validUntil}</span>,
    },
    {
      key: 'totalCents',
      header: 'มูลค่ารวม (บาท)',
      align: 'right',
      render: (q) => (
        <span className="font-bold font-mono text-text">
          {formatCurrencyTHB(q.totalCents)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'สถานะ',
      align: 'center',
      render: (q) => <StatusBadge status={q.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'จัดการ',
      align: 'right',
      render: (q) => (
        <Link href={`/quotations/${q.id}`}>
          <Button variant="ghost" size="sm">
            ดูเอกสาร
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
            ใบเสนอราคา (Quotations)
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            จัดการรายการเสนอราคา อนุมัติ และแปลงเป็นใบแจ้งหนี้เพื่อเริ่มกระบวนการรับชำระเงิน
          </p>
        </div>

        <Link href="/quotations/new">
          <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
            สร้างใบเสนอราคาใหม่
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
            { id: 'draft', label: 'แบบร่าง' },
            { id: 'approved', label: 'อนุมัติแล้ว' },
            { id: 'converted', label: 'แปลงแล้ว' },
            { id: 'voided', label: 'ยกเลิก' },
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
      {!isLoading && quotations.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="ยังไม่มีใบเสนอราคาในระบบ"
          description="เริ่มต้นสร้างใบเสนอราคาแรกเพื่อส่งให้ลูกค้า เมื่อลูกค้าอนุมัติสามารถแปลงเป็นใบแจ้งหนี้ได้ในคลิกเดียว"
          actionText="สร้างใบเสนอราคาใหม่"
          actionHref="/quotations/new"
        />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          emptyMessage={
            searchQuery || filterStatus !== 'all'
              ? 'ไม่พบใบเสนอราคาที่ตรงกับเงื่อนไขการค้นหา'
              : 'ยังไม่มีใบเสนอราคา'
          }
        />
      )}
    </div>
  );
}
