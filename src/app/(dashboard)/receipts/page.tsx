'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Receipt as ReceiptIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrencyTHB } from '@/lib/thai-baht';
import { Receipt } from '@/types/accounting';

export default function ReceiptsListPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReceipts() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch('/api/receipts');
        if (!res.ok) throw new Error('ไม่สามารถโหลดข้อมูลใบเสร็จรับเงินได้');
        const json = await res.json();
        if (json.success) {
          setReceipts(json.data);
        }
      } catch (err: any) {
        setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setIsLoading(false);
      }
    }

    loadReceipts();
  }, []);

  const filtered = receipts.filter(
    (rc) =>
      rc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rc.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<Receipt>[] = [
    {
      key: 'documentNumber',
      header: 'เลขที่ใบเสร็จรับเงิน',
      render: (rc) => (
        <Link
          href={`/receipts/${rc.id}`}
          className="font-mono font-semibold text-accent hover:underline flex items-center gap-1.5"
        >
          <ReceiptIcon className="w-3.5 h-3.5 text-text-subtle" />
          {rc.documentNumber}
        </Link>
      ),
    },
    {
      key: 'date',
      header: 'วันที่รับเงิน',
      render: (rc) => <span className="text-text-muted">{rc.date}</span>,
    },
    {
      key: 'contactName',
      header: 'ลูกค้า / ผู้จ่ายเงิน',
      render: (rc) => (
        <div>
          <div className="font-medium text-text">{rc.contactName}</div>
          <div className="text-xs text-text-subtle font-mono">Tax ID: {rc.contactTaxId}</div>
        </div>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'ช่องทางชำระเงิน',
      render: (rc) => <span className="text-text-muted">{rc.paymentMethod}</span>,
    },
    {
      key: 'totalCents',
      header: 'ยอดเงินที่ได้รับ (บาท)',
      align: 'right',
      render: (rc) => (
        <span className="font-bold font-mono text-success">
          {formatCurrencyTHB(rc.totalCents)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'สถานะ',
      align: 'center',
      render: (rc) => <StatusBadge status={rc.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'จัดการ',
      align: 'right',
      render: (rc) => (
        <Link href={`/receipts/${rc.id}`}>
          <Button variant="ghost" size="sm">
            ดูใบเสร็จ
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
            ใบเสร็จรับเงิน / ใบกำกับภาษี (Receipts / Tax Invoices)
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            หลักฐานการรับเงินที่ออกโดยอัตโนมัติเมื่อมีการบันทึกการชำระเงินของใบแจ้งหนี้
          </p>
        </div>

        <Link href="/invoices">
          <Button variant="outline" size="md">
            ดูใบแจ้งหนี้เพื่อบันทึกรับเงิน
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-danger/10 border border-danger/30 text-danger text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative min-w-[260px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่ใบเสร็จ หรือชื่อลูกค้า..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-bg border border-border rounded-md text-text placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {/* Data Table or Empty State */}
      {!isLoading && receipts.length === 0 ? (
        <EmptyState
          icon={ReceiptIcon}
          title="ยังไม่มีใบเสร็จรับเงินในระบบ"
          description="ใบเสร็จรับเงินจะถูกสร้างโดยอัตโนมัติเมื่อคุณบันทึกการรับชำระเงินในหน้าใบแจ้งหนี้"
          actionText="ไปที่รายการใบแจ้งหนี้"
          actionHref="/invoices"
        />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          emptyMessage={
            searchQuery
              ? 'ไม่พบใบเสร็จรับเงินที่ตรงกับคำค้นหา'
              : 'ยังไม่มีใบเสร็จรับเงิน'
          }
        />
      )}
    </div>
  );
}
