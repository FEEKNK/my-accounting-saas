import React from 'react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/landing" className="inline-flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-on-accent font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
            M
          </div>
          <div className="text-left">
            <span className="font-bold text-lg tracking-tight text-text block">My Accounting</span>
            <span className="text-2xs text-text-muted block -mt-1">Cloud Accounting for Thai Businesses</span>
          </div>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-bg py-8 px-6 shadow-card border border-border sm:rounded-xl sm:px-10">
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-text-subtle">
          ระบบบัญชีคลาวด์มาตรฐานไทย รองรับ e-Tax Invoice & e-Receipt
        </p>
      </div>
    </div>
  );
}
