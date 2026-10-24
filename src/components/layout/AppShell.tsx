'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Receipt,
  CreditCard,
  BookOpen,
  BarChart3,
  Percent,
  Briefcase,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  FileSpreadsheet,
  LogOut,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { title: 'ภาพรวม (Dashboard)', href: '/', icon: LayoutDashboard },
  { title: 'ผู้ติดต่อ (Contacts)', href: '/contacts', icon: Users },
  { title: 'สินค้าและบริการ (Products)', href: '/products', icon: Package },
  { title: 'ใบเสนอราคา (Quotations)', href: '/quotations', icon: FileText },
  { title: 'ใบแจ้งหนี้ (Invoices)', href: '/invoices', icon: FileSpreadsheet },
  { title: 'ใบเสร็จรับเงิน (Receipts)', href: '/receipts', icon: Receipt },
  { title: 'รายจ่าย (Expenses)', href: '/expenses', icon: CreditCard },
  { title: 'ผังบัญชีและสมุดรายวัน', href: '/accounting', icon: BookOpen },
  { title: 'รายงานการเงิน (Reports)', href: '/reports', icon: BarChart3 },
  { title: 'ภาษี (VAT & WHT)', href: '/tax', icon: Percent },
  { title: 'เงินเดือน (Payroll)', href: '/payroll', icon: Briefcase },
  { title: 'ตั้งค่าระบบ (Settings)', href: '/settings', icon: Settings },
];

const roleLabels: Record<string, string> = {
  owner: 'เจ้าของกิจการ (Owner)',
  admin: 'ผู้ดูแลระบบ (Admin)',
  editor: 'ผู้จัดการบัญชี (Editor)',
  viewer: 'ผู้ตรวจสอบ (Viewer)',
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [currentCompany, setCurrentCompany] = useState<{ name: string; taxId: string } | null>(null);

  useEffect(() => {
    async function loadAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setCurrentUser(json.data.user);
            setCurrentCompany(json.data.company);
          }
        }
      } catch (e) {
        console.error('Failed to load current user info', e);
      }
    }
    loadAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.href = '/login';
    }
  };

  const userInitial = currentUser?.name ? currentUser.name.trim().charAt(0).toUpperCase() : 'A';

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-bg fixed inset-y-0 z-40">
        {/* Brand / Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border gap-3">
          <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center text-on-accent font-bold text-lg shadow-sm">
            M
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-text">My Accounting</span>
            <span className="text-xs text-text-muted">Cloud Accounting</span>
          </div>
        </div>

        {/* Company Quick Info */}
        <div className="px-4 py-3 mx-3 my-3 rounded-md bg-surface border border-border">
          <div className="text-xs font-semibold text-text truncate">
            {currentCompany?.name || 'กิจการของฉัน'}
          </div>
          <div className="text-xs text-text-subtle font-mono">
            เลขภาษี: {currentCompany?.taxId || '-'}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-info-surface text-accent font-semibold shadow-xs'
                    : 'text-text-muted hover:bg-surface hover:text-text'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-accent' : 'text-text-subtle'}`} />
                <span className="truncate">{item.title}</span>
                {item.badge && (
                  <span className="ml-auto text-xs px-1.5 py-0.5 rounded-pill bg-accent text-on-accent font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer with Working Logout */}
        <div className="p-3 border-t border-border flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-accent-hover text-on-accent flex items-center justify-center font-bold text-xs shrink-0">
              {userInitial}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-text truncate">
                {currentUser?.name || 'ผู้ดูแลระบบ My Accounting'}
              </span>
              <span className="text-2xs text-text-subtle truncate">
                {roleLabels[currentUser?.role || 'owner'] || 'เจ้าของกิจการ'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="ออกจากระบบ (Sign Out)"
            className="p-1.5 rounded-md text-text-subtle hover:text-danger hover:bg-danger/10 transition-colors shrink-0"
            aria-label="ออกจากระบบ"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-bg border-b border-border sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-text-muted hover:bg-surface"
              aria-label="เปิดเมนู"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="relative hidden sm:block w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
              <input
                type="search"
                placeholder="ค้นหาเลขที่เอกสาร, ผู้ติดต่อ, สินค้า..."
                className="w-full h-9 pl-9 pr-4 text-xs bg-surface rounded-md border border-border-input placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/landing"
              className="text-xs text-accent hover:underline font-medium px-2 py-1 rounded bg-accent/5 border border-accent/20 hidden sm:inline-flex items-center gap-1"
            >
              หน้าแรก (Landing Page)
            </Link>

            <button
              className="p-2 rounded-md text-text-muted hover:bg-surface relative"
              aria-label="การแจ้งเตือน"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-danger absolute top-1.5 right-1.5 ring-2 ring-bg" />
            </button>

            <div className="h-6 w-px bg-border hidden sm:block" />

            <div className="text-right hidden md:block">
              <div className="text-xs font-semibold text-text">รอบบัญชี 2569 (2026)</div>
              <div className="text-xs text-success-text">ภาษีมูลค่าเพิ่ม (VAT 7%) ใช้งานปกติ</div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-text/40 backdrop-blur-xs flex">
            <div className="w-64 bg-bg h-full flex flex-col p-4 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="font-bold text-sm text-text">My Accounting เมนู</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-text-muted hover:bg-surface"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium text-text-muted hover:bg-surface"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </nav>

              {/* Mobile Logout Button */}
              <div className="pt-3 border-t border-border">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-danger hover:bg-danger/10 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
