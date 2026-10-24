'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building, Lock, Mail, User, Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      setError('กรุณาระบุชื่อบริษัทหรือชื่อกิจการ');
      return;
    }
    if (!name.trim()) {
      setError('กรุณาระบุชื่อ-นามสกุลของคุณ');
      return;
    }
    if (!email.trim()) {
      setError('กรุณาระบุอีเมล');
      return;
    }
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          taxId: taxId.trim(),
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'เกิดข้อผิดพลาดในการลงทะเบียน');
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text tracking-tight">สร้างบัญชีกิจการใหม่ (Register)</h2>
        <p className="text-xs text-text-muted mt-1">
          กรอกข้อมูลเพื่อเริ่มต้นใช้งาน My Accounting Thai Cloud Accounting
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-text mb-1.5">
            ชื่อกิจการ / บริษัท (Company Name) <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="เช่น บริษัท สยามเทรดดิ้ง จำกัด"
              required
              className="w-full h-10 pl-9 pr-3 text-xs bg-bg border border-border-input rounded-md text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text mb-1.5">
            เลขประจำตัวผู้เสียภาษี 13 หลัก (Tax ID)
          </label>
          <input
            type="text"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            placeholder="เช่น 0105558000123 (ระบุภายหลังได้)"
            maxLength={13}
            className="w-full h-10 px-3 text-xs bg-bg border border-border-input rounded-md text-text font-mono placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text mb-1.5">
            ชื่อ-นามสกุล เจ้าของกิจการ (Full Name) <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น สมชาย ใจดี"
              required
              className="w-full h-10 pl-9 pr-3 text-xs bg-bg border border-border-input rounded-md text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text mb-1.5">
            อีเมลสำหรับเข้าสู่ระบบ (Email) <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@company.com"
              required
              className="w-full h-10 pl-9 pr-3 text-xs bg-bg border border-border-input rounded-md text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text mb-1.5">
            รหัสผ่าน (Password) <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="อย่างน้อย 6 ตัวอักษร"
              required
              minLength={6}
              className="w-full h-10 pl-9 pr-10 text-xs bg-bg border border-border-input rounded-md text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text p-1"
              aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full h-10 text-sm font-semibold justify-center"
          isLoading={isLoading}
        >
          สร้างบัญชีและเริ่มต้นใช้งาน
        </Button>
      </form>

      <div className="flex items-center justify-between text-xs text-text-muted pt-4 border-t border-border">
        <span>มีบัญชีผู้ใช้อยู่แล้ว?</span>
        <Link href="/login" className="font-semibold text-accent hover:underline flex items-center gap-1">
          เข้าสู่ระบบ <ArrowLeft className="w-3 h-3 rotate-180" />
        </Link>
      </div>
    </div>
  );
}
