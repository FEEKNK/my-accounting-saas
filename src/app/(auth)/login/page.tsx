'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('admin@kanta.co');
    setPassword('Kanta2026!');
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text tracking-tight">เข้าสู่ระบบ (Sign In)</h2>
        <p className="text-xs text-text-muted mt-1">
          กรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งานระบบบัญชีของคุณ
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
          <label className="block text-xs font-semibold text-text mb-1.5">อีเมล (Email)</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@yourdomain.com"
              required
              className="w-full h-10 pl-9 pr-3 text-xs bg-bg border border-border-input rounded-md text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text mb-1.5">รหัสผ่าน (Password)</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
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
          เข้าสู่ระบบ
        </Button>
      </form>

      {/* Demo Account Quick Access (Development only — Pre-Production Sanitization PROD-01) */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="pt-2 border-t border-border">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full p-2.5 rounded-lg border border-dashed border-accent/40 bg-accent/5 hover:bg-accent/10 transition-colors text-xs text-accent flex items-center justify-center gap-2 font-medium"
          >
            <Zap className="w-3.5 h-3.5 text-accent" />
            <span>กรอกบัญชีผู้ดูแลระบบ (admin@kanta.co)</span>
          </button>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border">
        <span>ยังไม่มีบัญชีใช้งาน?</span>
        <Link href="/register" className="font-semibold text-accent hover:underline flex items-center gap-1">
          สร้างบัญชีกิจการใหม่ <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
