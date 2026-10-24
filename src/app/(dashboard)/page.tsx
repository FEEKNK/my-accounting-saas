'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  CreditCard,
  Wallet,
  AlertCircle,
  Plus,
  ArrowRight,
  FileText,
  FileSpreadsheet,
  Building,
} from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrencyTHB } from '@/lib/thai-baht';
import { Quotation, Invoice, DashboardMetrics } from '@/types/accounting';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentQuotations, setRecentQuotations] = useState<Quotation[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);

        const [metricsRes, quotationsRes, invoicesRes] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/quotations'),
          fetch('/api/invoices'),
        ]);

        if (!metricsRes.ok || !quotationsRes.ok || !invoicesRes.ok) {
          throw new Error('ไม่สามารถโหลดข้อมูลแดชบอร์ดได้');
        }

        const metricsData = await metricsRes.json();
        const quotationsData = await quotationsRes.json();
        const invoicesData = await invoicesRes.json();

        if (metricsData.success) {
          setMetrics(metricsData.data);
        }
        if (quotationsData.success) {
          setRecentQuotations(quotationsData.data.slice(0, 5));
        }
        if (invoicesData.success) {
          setRecentInvoices(invoicesData.data.slice(0, 5));
        }
      } catch (err: any) {
        setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
            ภาพรวมธุรกิจ (Financial Dashboard)
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            สรุปข้อมูลรายรับ รายจ่าย กำไรสุทธิ และเอกสารสำคัญประจำเดือน
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/quotations/new">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              สร้างใบเสนอราคา
            </Button>
          </Link>
          <Link href="/contacts">
            <Button variant="outline" size="sm" leftIcon={<Building className="w-3.5 h-3.5" />}>
              จัดการผู้ติดต่อ
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-danger/10 border border-danger/30 text-danger text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="รายรับรวม (Total Revenue)"
          value={formatCurrencyTHB(metrics?.totalRevenueCents ?? 0)}
          changePercent={metrics?.revenueChangePercent ?? 0}
          icon={<TrendingUp className="w-5 h-5 text-accent" />}
        />
        <KPICard
          title="รายจ่ายรวม (Total Expenses)"
          value={formatCurrencyTHB(metrics?.totalExpenseCents ?? 0)}
          changePercent={metrics?.expenseChangePercent ?? 0}
          icon={<CreditCard className="w-5 h-5 text-warning" />}
        />
        <KPICard
          title="กำไรสุทธิ (Net Profit)"
          value={formatCurrencyTHB(metrics?.netProfitCents ?? 0)}
          changePercent={metrics?.profitChangePercent ?? 0}
          icon={<Wallet className="w-5 h-5 text-success" />}
        />
        <KPICard
          title="ยอดค้างชำระ (Overdue Invoices)"
          value={formatCurrencyTHB(metrics?.overdueInvoicesTotalCents ?? 0)}
          changePercent={0}
          icon={<AlertCircle className="w-5 h-5 text-danger" />}
        />
      </div>

      {/* Business Process Banner */}
      <div className="p-4 rounded-lg bg-surface border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-text">
            วงจรขายครบวงจร: ใบเสนอราคา → ใบแจ้งหนี้ → ใบเสร็จรับเงิน/ใบกำกับภาษี
          </div>
          <div className="text-xs text-text-muted">
            เริ่มต้นด้วยการสร้างใบเสนอราคา เมื่อได้รับการอนุมัติ สามารถแปลงเป็นใบแจ้งหนี้และบันทึกการรับชำระเงินได้ทันที
          </div>
        </div>
        <Link href="/quotations/new">
          <Button variant="outline" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            สร้างเอกสารใบเสนอราคา
          </Button>
        </Link>
      </div>

      {/* Dual Table Section: Recent Quotations & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotations */}
        <div className="rounded-md border border-border bg-bg shadow-sm flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-bold text-text">ใบเสนอราคาล่าสุด</h2>
            </div>
            <Link
              href="/quotations"
              className="text-xs text-accent hover:underline inline-flex items-center gap-1 font-medium"
            >
              ดูทั้งหมด <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-border flex-1">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-text-muted">กำลังโหลดข้อมูล...</div>
            ) : recentQuotations.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-muted space-y-2">
                <div>ยังไม่มีรายการใบเสนอราคา</div>
                <Link href="/quotations/new">
                  <Button variant="ghost" size="sm" className="text-xs text-accent">
                    + สร้างใบเสนอราคาแรก
                  </Button>
                </Link>
              </div>
            ) : (
              recentQuotations.map((qt) => (
                <Link
                  key={qt.id}
                  href={`/quotations/${qt.id}`}
                  className="p-3.5 hover:bg-surface flex items-center justify-between transition-colors text-xs block"
                >
                  <div>
                    <div className="font-semibold text-text font-mono">{qt.documentNumber}</div>
                    <div className="text-text-muted mt-0.5 truncate max-w-xs">{qt.contactName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-text tabular-nums">
                      {formatCurrencyTHB(qt.totalCents)}
                    </div>
                    <div className="mt-1">
                      <StatusBadge status={qt.status} size="sm" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="rounded-md border border-border bg-bg shadow-sm flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-bold text-text">ใบแจ้งหนี้ล่าสุด</h2>
            </div>
            <Link
              href="/invoices"
              className="text-xs text-accent hover:underline inline-flex items-center gap-1 font-medium"
            >
              ดูทั้งหมด <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-border flex-1">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-text-muted">กำลังโหลดข้อมูล...</div>
            ) : recentInvoices.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-muted space-y-2">
                <div>ยังไม่มีรายการใบแจ้งหนี้</div>
                <Link href="/quotations">
                  <Button variant="ghost" size="sm" className="text-xs text-accent">
                    ออกใบแจ้งหนี้จากใบเสนอราคา
                  </Button>
                </Link>
              </div>
            ) : (
              recentInvoices.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="p-3.5 hover:bg-surface flex items-center justify-between transition-colors text-xs block"
                >
                  <div>
                    <div className="font-semibold text-text font-mono">{inv.documentNumber}</div>
                    <div className="text-text-muted mt-0.5 truncate max-w-xs">{inv.contactName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-text tabular-nums">
                      {formatCurrencyTHB(inv.totalCents)}
                    </div>
                    <div className="mt-1">
                      <StatusBadge status={inv.status} size="sm" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
