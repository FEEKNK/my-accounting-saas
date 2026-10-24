'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Package, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { FormField } from '@/components/ui/FormField';
import { formatCurrencyTHB } from '@/lib/thai-baht';
import { EmptyState } from '@/components/ui/EmptyState';
import { Product } from '@/types/accounting';

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('สินค้าทั่วไป');
  const [unit, setUnit] = useState('ชิ้น');
  const [sellPriceBaht, setSellPriceBaht] = useState<number | string>('');
  const [costPriceBaht, setCostPriceBaht] = useState<number | string>('');
  const [stockQuantity, setStockQuantity] = useState(0);
  const [isService, setIsService] = useState(false);

  async function loadProducts() {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('ไม่สามารถโหลดข้อมูลสินค้าได้');
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim() || `PRD-${Date.now().toString().slice(-4)}`,
          name: name.trim(),
          category: category.trim() || 'ทั่วไป',
          unit: unit.trim() || 'ชิ้น',
          sellPriceCents: Math.round(Number(sellPriceBaht || 0) * 100),
          costPriceCents: Math.round(Number(costPriceBaht || 0) * 100),
          stockQuantity: isService ? 999 : Number(stockQuantity) || 0,
          lowStockThreshold: 5,
          isService,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'ไม่สามารถเพิ่มสินค้าได้');
      }

      setProducts((prev) => [json.data, ...prev]);
      setShowAddModal(false);

      // Reset Form
      setCode('');
      setName('');
      setSellPriceBaht('');
      setCostPriceBaht('');
      setStockQuantity(0);
      setIsService(false);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกสินค้า');
    } finally {
      setIsSubmitting(false);
    }
  };


  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<Product>[] = [
    {
      key: 'code',
      header: 'รหัสสินค้า',
      render: (p) => (
        <span className="font-mono font-semibold text-accent flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-text-subtle" />
          {p.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'ชื่อสินค้า / บริการ',
      render: (p) => (
        <div>
          <div className="font-medium text-text">{p.name}</div>
          <div className="text-xs text-text-subtle">{p.category}</div>
        </div>
      ),
    },
    {
      key: 'unit',
      header: 'หน่วย',
      render: (p) => <span className="text-text-muted">{p.unit}</span>,
    },
    {
      key: 'sellPriceCents',
      header: 'ราคาขาย (บาท)',
      align: 'right',
      render: (p) => (
        <span className="font-mono font-semibold text-text tabular-nums">
          {formatCurrencyTHB(p.sellPriceCents)}
        </span>
      ),
    },
    {
      key: 'stockQuantity',
      header: 'คงเหลือ',
      align: 'right',
      render: (p) =>
        p.isService ? (
          <span className="text-xs text-text-subtle">งานบริการ</span>
        ) : (
          <span className="font-mono font-medium text-text tabular-nums">
            {p.stockQuantity} {p.unit}
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
            สินค้าและบริการ (Products & Services)
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            จัดการรายการสินค้า สต็อกคงเหลือ ราคาขาย และบริการ
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowAddModal(true)}
        >
          เพิ่มสินค้าใหม่
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหารหัส หรือชื่อสินค้า..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-bg rounded-md border border-border-input placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-danger/10 border border-danger/30 text-danger text-sm flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {!isLoading && products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="ยังไม่มีสินค้าหรือบริการในระบบ"
          description="บันทึกรายการสินค้าหรือบริการ พร้อมกำหนดราคาขายและราคาทุน เพื่อดึงไปเปิดใบเสนอราคาได้อย่างสะดวก"
          actionText="เพิ่มสินค้าใหม่"
          onActionClick={() => setShowAddModal(true)}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          emptyMessage="ไม่พบรายการสินค้าที่ตรงกับคำค้นหา"
        />
      )}


      {/* Add Product Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text/40 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-bg rounded-lg border border-border shadow-modal max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-text flex items-center gap-2">
                <Package className="w-4 h-4 text-accent" />
                เพิ่มสินค้า / บริการใหม่ (Add Product)
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  label="รหัสสินค้า (SKU)"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="เช่น PRD-001 (เว้นว่างเพื่อสร้างให้อัตโนมัติ)"
                />
                <FormField
                  label="หมวดหมู่สินค้า"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="เช่น อุปกรณ์ไอที, งานบริการ"
                />
              </div>

              <FormField
                label="ชื่อสินค้าหรือบริการ"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น บริการให้คำปรึกษารายเดือน หรือ สินค้าชิ้นที่ 1"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField
                  label="ราคาขาย (บาท)"
                  type="number"
                  step="0.01"
                  value={sellPriceBaht}
                  onChange={(e) => setSellPriceBaht(e.target.value)}
                  placeholder="0.00"
                  required
                />
                <FormField
                  label="ราคาทุน (บาท)"
                  type="number"
                  step="0.01"
                  value={costPriceBaht}
                  onChange={(e) => setCostPriceBaht(e.target.value)}
                  placeholder="0.00"
                />
                <FormField
                  label="หน่วยนับ"
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="เช่น ชิ้น, กล่อง, ครั้ง"
                />
              </div>

              <div className="p-3 rounded bg-surface border border-border flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-text">เป็นรายการบริการ (Service)</div>
                  <div className="text-text-subtle">ไม่มีการตัดสต็อกสินค้าคงคลัง</div>
                </div>
                <input
                  type="checkbox"
                  checked={isService}
                  onChange={(e) => setIsService(e.target.checked)}
                  className="w-4 h-4 text-accent rounded"
                />
              </div>

              {!isService && (
                <FormField
                  label="จำนวนสต็อกคงเหลือเริ่มต้น"
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                />
              )}

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
                  บันทึกสินค้า
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
