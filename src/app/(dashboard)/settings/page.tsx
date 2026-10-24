'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Save, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { updateCompany } from '@/lib/data-layer';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [branch, setBranch] = useState('สำนักงานใหญ่');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadCompany() {
      try {
        const res = await fetch('/api/company');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const comp = json.data;
            setName(comp.name === 'กิจการของฉัน' ? '' : comp.name);
            setTaxId(comp.taxId || '');
            setBranch(comp.branch || 'สำนักงานใหญ่');
            setAddress(comp.address || '');
            setPhone(comp.phone || '');
            setEmail(comp.email || '');
          }
        }
      } catch (e) {
        console.error('Failed to load company profile', e);
      }
    }
    loadCompany();
  }, []);


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('กรุณาระบุชื่อบริษัท / ร้านค้า');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: name.trim(),
        taxId: taxId.trim(),
        branch: branch.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
      };

      // 1. Update in-memory reactive state
      updateCompany(payload);

      // 2. Persist to Neon DB via API
      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'ไม่สามารถบันทึกข้อมูลได้');
      }

      setSuccessMessage('บันทึกข้อมูลกิจการเรียบร้อยแล้ว! ข้อมูลจะปรากฏบนหัวเอกสารทุกฉบับทันที');
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              กลับหน้าหลัก
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text tracking-tight flex items-center gap-2">
              <Building2 className="w-6 h-6 text-accent" />
              ข้อมูลกิจการของคุณ (Company Profile)
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              ระบุข้อมูลจริงสำหรับใช้แสดงบนหัวใบเสนอราคา ใบแจ้งหนี้ และใบเสร็จรับเงิน/ใบกำกับภาษี
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-md bg-success-surface border border-success-surface flex items-center gap-2 text-xs font-semibold text-success-text">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-success" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-md bg-danger-surface border border-danger/20 flex items-center gap-2 text-xs font-semibold text-danger">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-bg border border-border rounded-lg shadow-sm p-6 sm:p-8 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FormField
              label="ชื่อบริษัท / กิจการ / ร้านค้า"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น บริษัท เอสเอ็มอี ซัพพลาย แอนด์ เซอร์วิส จำกัด หรือ ร้านสมชายการค้า"
              required
            />
          </div>

          <div>
            <FormField
              label="เลขประจำตัวผู้เสียภาษี (Tax ID 13 หลัก)"
              type="text"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="เช่น 0105561000000"
            />
          </div>

          <div>
            <FormField
              label="สาขา"
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="เช่น สำนักงานใหญ่ หรือ สาขาที่ 00001"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-text mb-1.5 block">
              ที่อยู่สถานประกอบการ (แสดงบนหัวเอกสาร)
            </label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="เลขที่, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์"
              className="w-full p-3 text-xs bg-bg border border-border-input rounded-md text-text focus:outline-none focus:ring-2 focus:ring-accent leading-relaxed"
            />
          </div>

          <div>
            <FormField
              label="เบอร์โทรศัพท์ติดต่อ"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="เช่น 02-123-4567 หรือ 081-234-5678"
            />
          </div>

          <div>
            <FormField
              label="อีเมลติดต่อ / ฝ่ายบัญชี"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="เช่น billing@yourcompany.co.th"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
          <Link href="/">
            <Button variant="ghost" size="md">
              ยกเลิก
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="md"
            leftIcon={<Save className="w-4 h-4" />}
            isLoading={isLoading}
            disabled={isLoading}
          >
            บันทึกข้อมูลกิจการ
          </Button>
        </div>
      </form>
    </div>
  );
}
