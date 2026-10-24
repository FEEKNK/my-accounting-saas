'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
  Smartphone,
  Layers,
  ChevronDown,
  Building,
  CreditCard,
  Send,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  const [annualBilling, setAnnualBilling] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-accent/10 selection:text-accent">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center text-on-accent font-bold text-lg shadow-sm">
              M
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-text">My Accounting</span>
              <span className="text-[10px] text-text-subtle font-medium -mt-1">Cloud Accounting</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-muted">
            <a href="#problem" className="hover:text-accent transition-colors">ทำไมต้อง My Accounting</a>
            <a href="#how-it-works" className="hover:text-accent transition-colors">วิธีใช้งาน</a>
            <a href="#features" className="hover:text-accent transition-colors">ฟีเจอร์เด่น</a>
            <a href="#pricing" className="hover:text-accent transition-colors">ราคา</a>
            <a href="#faq" className="hover:text-accent transition-colors">คำถามที่พบบ่อย</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                เข้าสู่ระบบ
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                เริ่มใช้งานฟรี
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>สร้างเอกสารใบแรกได้ใน 30 วินาที — ไม่ต้องมีพื้นฐานบัญชี</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text leading-tight sm:leading-tight">
            ระบบบัญชีคลาวด์ที่สร้างเพื่อเจ้าของธุรกิจ <br />
            <span className="text-accent">มั่นใจได้โดยนักบัญชี</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-text-muted leading-relaxed">
            ออกใบเสนอราคา ใบแจ้งหนี้ ใบเสร็จรับเงิน และคำนวณภาษีหัก ณ ที่จ่าย ภ.พ.30 ครบวงจร 
            มีโหมด Simple สำหรับเจ้าของร้าน และโหมด Pro สำหรับนักบัญชี พร้อมแชร์ทีมงานได้ไม่จำกัดจำนวน
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full text-base px-8 py-3 h-auto" rightIcon={<ArrowRight className="w-5 h-5" />}>
                เริ่มต้นใช้งานฟรี (30 เอกสาร/เดือน)
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full text-base px-6 py-3 h-auto">
                เข้าสู่ระบบใช้งาน
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-text-subtle pt-2">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-accent" /> ไม่ต้องใช้บัตรเครดิต</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-accent" /> ฟรีตลอดชีพ 30 เอกสาร/เดือน</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-accent" /> ไม่จำกัดผู้ใช้งานในทีม</span>
          </div>

          {/* Interactive Document Preview Mockup */}
          <div className="mt-12 rounded-xl border border-border bg-bg shadow-pop p-4 sm:p-6 text-left max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-border gap-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">ตัวอย่างเอกสารจริง • Simple Mode</span>
                <h3 className="text-base font-bold text-text">ใบเสนอราคา / Quotation (QT-2026-0001)</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-info-surface text-info-text border border-info/20">
                  รอการอนุมัติ (Sent)
                </span>
                <span className="text-xs text-text-muted">ลิงก์เซ็นออนไลน์พร้อมใช้งาน</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-xs">
              <div className="space-y-1">
                <span className="text-text-subtle">ลูกค้า:</span>
                <p className="font-semibold text-text">บริษัท สยาม ครีเอทีฟ สตูดิโอ จำกัด</p>
                <p className="text-text-muted">เลขประจำตัวผู้เสียภาษี: 0105562012345 (สำนักงานใหญ่)</p>
              </div>
              <div className="sm:text-right space-y-1">
                <span className="text-text-subtle">ยอดรวมสุทธิ:</span>
                <p className="text-xl font-bold text-accent font-mono">฿107,000.00</p>
                <p className="text-[11px] text-text-subtle font-medium">หนึ่งแสนเจ็ดพันบาทถ้วน (รวม VAT 7%)</p>
              </div>
            </div>

            <div className="bg-surface-alt rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border border-border">
              <div className="flex items-center gap-2 text-text">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>ลูกค้าสามารถเปิดลิงก์บนมือถือและเซ็นรับทราบออนไลน์ได้ทันที ไม่ต้องพิมพ์กระดาษ</span>
              </div>
              <Link href="/quotations/QT-2026-0001">
                <span className="font-semibold text-accent hover:underline cursor-pointer flex items-center gap-1">
                  ทดลองเปิดดูเอกสาร <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem & Solution Section */}
      <section id="problem" className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-accent">เปรียบเทียบข้อแตกต่าง</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-text">บอกลาความยุ่งยากของโปรแกรมบัญชีแบบเดิม</h2>
          <p className="text-text-muted max-w-2xl mx-auto text-sm sm:text-base">
            ออกแบบขึ้นใหม่ทั้งหมดจากข้อบกพร่องที่ผู้ประกอบการและคนทำธุรกิจตัวจริงต้องเผชิญทุกวัน
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl border border-border bg-bg space-y-4 shadow-sm hover:border-accent/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-danger-surface text-danger flex items-center justify-center font-bold">
              ✕
            </div>
            <h3 className="font-bold text-base text-text">ซับซ้อนเกินไปสำหรับเจ้าของธุรกิจ</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              โปรแกรมส่วนใหญ่สร้างขึ้นสำหรับนักบัญชี เต็มไปด้วยศัพท์เดบิต/เครดิต ยอดยกมา และผังบัญชีที่เข้าใจยาก ต้องคลิก 5 หน้าเพื่อออกใบแจ้งหนี้ใบเดียว
            </p>
            <div className="pt-2 border-t border-border text-xs font-semibold text-accent flex items-center gap-1.5">
              <Check className="w-4 h-4" /> แก้ด้วย: My Accounting Simple Mode (3 คลิกเสร็จ)
            </div>
          </div>

          <div className="p-6 rounded-xl border border-border bg-bg space-y-4 shadow-sm hover:border-accent/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-danger-surface text-danger flex items-center justify-center font-bold">
              ✕
            </div>
            <h3 className="font-bold text-base text-text">บทลงโทษเมื่อทีมเติบโต (Seat Caps)</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              จำกัดจำนวนผู้ใช้งาน 1-3 คน พอจ้างเซลส์เพิ่มหรือต้องการให้นักบัญชีเข้ามาดู ต้องอัปเกรดไปแพ็กเกจแพงหลักหมื่นต่อปี ต้นทุนบานปลาย
            </p>
            <div className="pt-2 border-t border-border text-xs font-semibold text-accent flex items-center gap-1.5">
              <Check className="w-4 h-4" /> แก้ด้วย: ไม่จำกัด User ฟรีทุกแพ็กเกจ
            </div>
          </div>

          <div className="p-6 rounded-xl border border-border bg-bg space-y-4 shadow-sm hover:border-accent/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-danger-surface text-danger flex items-center justify-center font-bold">
              ✕
            </div>
            <h3 className="font-bold text-base text-text">ส่ง PDF ให้ลูกค้าพิมพ์เซ็นแล้วสแกน</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              ลูกค้าไม่มีเครื่องพิมพ์ ทำให้การอนุมัติใบเสนอราคาล่าช้า ปิดการขายได้ช้าลง และติดตามสถานะเอกสารได้ยาก
            </p>
            <div className="pt-2 border-t border-border text-xs font-semibold text-accent flex items-center gap-1.5">
              <Check className="w-4 h-4" /> แก้ด้วย: ลิงก์ตรวจ & เซ็นออนไลน์ทันที
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section id="how-it-works" className="py-20 bg-surface border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">ขั้นตอนการทำงาน</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-text">3 ขั้นตอนง่ายๆ ในการปิดการขายและรับเงิน</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-bg p-6 rounded-xl border border-border space-y-3 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-accent text-on-accent font-bold text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-base text-text">ออกเอกสารใน 30 วินาที</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                เลือกสินค้าหรือบริการ My Accounting คำนวณภาษีมูลค่าเพิ่ม 7%, ภาษีหัก ณ ที่จ่าย 1-5% และตัวหนังสือภาษาไทยให้อัตโนมัติทันที
              </p>
            </div>

            <div className="bg-bg p-6 rounded-xl border border-border space-y-3 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-accent text-on-accent font-bold text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-base text-text">ส่งลิงก์เซ็นออนไลน์</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                ส่งลิงก์ผ่าน LINE หรืออีเมล ลูกค้าเปิดดูบนสมาร์ทโฟน ตรวจสอบรายการ และกดลงนามได้ทันทีโดยไม่ต้องโหลด PDF ไปพิมพ์
              </p>
            </div>

            <div className="bg-bg p-6 rounded-xl border border-border space-y-3 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-accent text-on-accent font-bold text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-base text-text">บันทึกรับเงิน & ออกใบเสร็จ</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                เมื่อลูกค้าโอนเงิน แนบสลิปและตัดชำระ ระบบจะแปลงเป็นใบกำกับภาษี/ใบเสร็จรับเงินสมบูรณ์ พร้อมส่งเข้าอีเมลลูกค้าอัตโนมัติ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiating Features */}
      <section id="features" className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-accent">ฟีเจอร์เด่นเพื่อธุรกิจยุคใหม่</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-text">แก้ปัญหาที่แท้จริงให้ธุรกิจของคุณ</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-xl border border-border bg-surface space-y-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-text">Dual Mode: สลับโหมดเจ้าของร้าน & นักบัญชี</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              โหมด <strong>Simple</strong> สำหรับเจ้าของร้าน ออกบิลไว ไม่ต้องรู้เรื่องเดบิตเครดิต และโหมด <strong>Pro</strong> สำหรับนักบัญชี มีสมุดรายวันทั่วไป ผังบัญชี และรายงานภาษี ภ.พ.30 ครบถ้วน
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-surface space-y-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-text">Milestone Billing & หักเงินประกันผลงาน 5%</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              สร้างมาเพื่อผู้รับเหมาและธุรกิจบริการ แบ่งงวดงาน 1..N และคำนวณหักเงินประกันผลงาน (Retention Guarantee) อัตโนมัติ ถูกต้องตามระเบียบจัดซื้อและภาษี
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-surface space-y-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-text">Responsive Mobile Web 100% เต็มฟังก์ชัน</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              ใช้งานได้สมบูรณ์บนมือถือและ iPad ทุกขนาดหน้าจอ ออกบิลหน้างาน ส่งใบเสนอราคาให้ลูกค้าตรวจได้ทันที ไม่ถูกจำกัดฟีเจอร์เหมือนแอปคู่หูทั่วไป
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-surface space-y-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-text">Real-time Collaboration & Concurrency Lock</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              ระบบแสดง Avatar ให้เห็นทันทีว่าเพื่อนร่วมทีมคนไหนกำลังดูหรือแก้ไขเอกสารฉบับนี้อยู่ ป้องกันการพิมพ์ทับซ้อนและลดความผิดพลาดในการออกบิล
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Table Section */}
      <section id="pricing" className="py-20 bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">แพ็กเกจราคาโปร่งใส</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-text">ไม่มีค่าใช้จ่ายแอบแฝง ไม่คิดเงินเพิ่มตาม User</h2>
            <p className="text-text-muted text-sm max-w-xl mx-auto">
              ทุกแพ็กเกจใช้งานร่วมกับทีมงานได้ไม่จำกัดจำนวน เริ่มต้นฟรีได้ทันทีโดยไม่ต้องใช้บัตรเครดิต
            </p>

            <div className="pt-6 inline-flex items-center gap-3 bg-bg p-1 rounded-full border border-border shadow-xs">
              <button
                onClick={() => setAnnualBilling(false)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  !annualBilling ? 'bg-accent text-on-accent shadow-xs' : 'text-text-muted hover:text-text'
                }`}
              >
                จ่ายรายเดือน
              </button>
              <button
                onClick={() => setAnnualBilling(true)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  annualBilling ? 'bg-accent text-on-accent shadow-xs' : 'text-text-muted hover:text-text'
                }`}
              >
                <span>จ่ายรายปี</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-warning text-on-accent">
                  ฟรี 2 เดือน
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="p-6 rounded-2xl border border-border bg-bg flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-text">Starter (ฟรีตลอดชีพ)</h3>
                  <p className="text-xs text-text-muted">เหมาะสำหรับฟรีแลนซ์และร้านค้าเริ่มต้น</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-text">฿0</span>
                  <span className="text-xs text-text-subtle">/ ตลอดชีพ</span>
                </div>
                <ul className="space-y-2.5 text-xs text-text-muted pt-4 border-t border-border">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent shrink-0" /> ออกได้ 30 เอกสาร / เดือน</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent shrink-0" /> <strong>ไม่จำกัดผู้ใช้งานในทีม (Unlimited)</strong></li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent shrink-0" /> ใบเสนอราคา, ใบแจ้งหนี้, ใบเสร็จ</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent shrink-0" /> คำนวณ VAT 7% และตัวอักษรภาษาไทย</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent shrink-0" /> ลิงก์เซ็นออนไลน์ 10 ครั้ง/เดือน</li>
                </ul>
              </div>
              <Link href="/register">
                <Button variant="outline" className="w-full">
                  เริ่มต้นใช้งานฟรี
                </Button>
              </Link>
            </div>

            {/* Growth Plan (Popular) */}
            <div className="p-6 rounded-2xl border-2 border-accent bg-bg flex flex-col justify-between space-y-6 shadow-pop relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-accent text-on-accent text-[11px] font-bold rounded-full uppercase tracking-wider">
                ยอดนิยมสำหรับ SME
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-text">Growth (ทีมธุรกิจ)</h3>
                  <p className="text-xs text-text-muted">สำหรับธุรกิจบริการ, ทีมขาย, และ SME</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-accent">
                    {annualBilling ? '฿408' : '฿490'}
                  </span>
                  <span className="text-xs text-text-subtle">
                    / เดือน {annualBilling && '(฿4,900 จ่ายรายปี)'}
                  </span>
                </div>
                <ul className="space-y-2.5 text-xs text-text-muted pt-4 border-t border-border">
                  <li className="flex items-center gap-2 font-semibold text-text"><CheckCircle2 className="w-4 h-4 text-accent shrink-0" /> ออกเอกสารได้ไม่จำกัด (Unlimited)</li>
                  <li className="flex items-center gap-2 font-semibold text-text"><CheckCircle2 className="w-4 h-4 text-accent shrink-0" /> ไม่จำกัดผู้ใช้งานในทีม (Unlimited)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent shrink-0" /> ส่งลิงก์เซ็นออนไลน์ไม่จำกัด</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent shrink-0" /> ระบบงวดงานและหักเงินประกันผลงาน 5%</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent shrink-0" /> รายงานภาษีซื้อ ภาษีขาย ภ.พ.30</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent shrink-0" /> ส่งออกไฟล์ PDF และ Excel สมบูรณ์</li>
                </ul>
              </div>
              <Link href="/register">
                <Button variant="primary" className="w-full">
                  เลือกแพ็กเกจ Growth
                </Button>
              </Link>
            </div>

            {/* Pro Studio Plan */}
            <div className="p-6 rounded-2xl border border-border bg-bg flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-text">Pro Studio (องค์กร & หลายสาขา)</h3>
                  <p className="text-xs text-text-muted">สำหรับสตูดิโอ, เอเจนซี่, และบริษัทรับเหมา</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-text">
                    {annualBilling ? '฿825' : '฿990'}
                  </span>
                  <span className="text-xs text-text-subtle">
                    / เดือน {annualBilling && '(฿9,900 จ่ายรายปี)'}
                  </span>
                </div>
                <ul className="space-y-2.5 text-xs text-text-muted pt-4 border-t border-border">
                  <li className="flex items-center gap-2 font-semibold text-text"><Check className="w-4 h-4 text-accent shrink-0" /> จัดการได้ถึง 3 บริษัทในบัญชีเดียว</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent shrink-0" /> ทุกฟีเจอร์ของแพ็กเกจ Growth</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent shrink-0" /> สิทธิ์เข้าถึง Developer API (มีวงเงินคุม)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent shrink-0" /> สมุดรายวันทั่วไป และกระทบยอดบัญชี</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent shrink-0" /> ซัพพอร์ตพิเศษผ่านผู้ดูแลส่วนตัว</li>
                </ul>
              </div>
              <Link href="/register">
                <Button variant="outline" className="w-full">
                  เลือกแพ็กเกจ Pro Studio
                </Button>
              </Link>

            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-accent">คำถามที่พบบ่อย</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-text">ข้อสงสัยที่พบบ่อยเกี่ยวกับ My Accounting</h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'My Accounting แตกต่างจากโปรแกรมบัญชีอื่นอย่างไร?',
              a: 'โปรแกรมบัญชีส่วนใหญ่สร้างขึ้นสำหรับนักบัญชี ทำให้เจ้าของธุรกิจรู้สึกใช้งานยากและซับซ้อน My Accounting แก้ปัญหานี้ด้วยระบบ Dual Experience ที่มี Simple Mode ให้เจ้าของออกบิลได้ใน 30 วินาที พร้อม Pro Mode ให้นักบัญชีทำงานต่อได้ทันที และเราไม่คิดเงินเพิ่มตามจำนวนผู้ใช้งานในทีม'
            },
            {
              q: 'ข้อมูลเอกสารถูกต้องตามเกณฑ์กรมสรรพากรหรือไม่?',
              a: 'ถูกต้อง 100% เอกสารใบกำกับภาษี ใบเสร็จรับเงิน และใบหัก ณ ที่จ่าย มีรูปแบบเลขที่เอกสาร เลขประจำตัวผู้เสียภาษี 13 หลัก รหัสสาขา และตัวหนังสือแสดงยอดเงินภาษาไทย (BahtText) ตามมาตรฐานกรมสรรพากร และรองรับโครงสร้าง e-Tax Ready'
            },
            {
              q: 'ถ้ามีพนักงานขาย 10 คน ต้องจ่ายค่า User เพิ่มหรือไม่?',
              a: 'ไม่ต้องจ่ายเพิ่ม ทุกแพ็กเกจของ My Accounting อนุญาตให้เชิญสมาชิกทีมได้ไม่จำกัดจำนวน เพื่อให้ทีมขาย ผู้จัดการ และนักบัญชีภายนอกทำงานร่วมกันได้ทันที'
            },
            {
              q: 'ระบบเซ็นใบเสนอราคาออนไลน์ทำงานอย่างไร?',
              a: 'เมื่อคุณสร้างใบเสนอราคาเสร็จ สามารถกดคัดลอกลิงก์ส่งให้ลูกค้าทาง LINE หรืออีเมล ลูกค้าเปิดลิงก์บนมือถือ ตรวจสอบรายการ และกด "อนุมัติและลงนามอิเล็กทรอนิกส์" ได้ทันที ระบบจะบันทึกเวลาและแจ้งเตือนคุณ พร้อมแปลงเป็นใบแจ้งหนี้อัตโนมัติ'
            },
            {
              q: 'สามารถยกเลิกการสมัครสมาชิกได้อย่างไร?',
              a: 'คุณสามารถกดยกเลิกการต่ออายุได้ด้วยตนเองในหน้าการตั้งค่าตลอดเวลาในคลิกเดียว บัญชีของคุณจะยังใช้งานได้จนสิ้นสุดรอบที่ชำระไว้ และระบบจะปรับเป็นแพ็กเกจฟรี 30 เอกสาร/เดือน โดยข้อมูลทั้งหมดไม่สูญหาย'
            }
          ].map((item, idx) => (
            <div key={idx} className="border border-border rounded-xl bg-bg overflow-hidden">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-text hover:bg-surface transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown className={`w-4 h-4 text-text-subtle transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs sm:text-sm text-text-muted leading-relaxed border-t border-border pt-4 bg-surface/50">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 bg-accent text-on-accent text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            พร้อมยกระดับการออกบิลและการจัดการภาษีของธุรกิจคุณแล้วหรือยัง?
          </h2>
          <p className="text-on-accent/80 text-sm sm:text-base max-w-xl mx-auto">
            เริ่มต้นใช้งาน My Accounting ฟรีวันนี้ ออกใบเสนอราคาและใบแจ้งหนี้ใบแรกได้ใน 30 วินาที โดยไม่ต้องใช้บัตรเครดิต
          </p>
          <div className="pt-2">
            <Link href="/quotations/new">
              <Button size="lg" className="bg-text text-bg hover:bg-text-muted font-bold text-base px-8 py-3.5 h-auto shadow-pop">
                เริ่มต้นใช้งานฟรี 30 เอกสาร/เดือน
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-bg text-xs text-text-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-accent flex items-center justify-center text-on-accent font-bold text-xs">
              M
            </div>
            <span className="font-semibold text-text">My Accounting Co., Ltd.</span>
            <span>• บัญชีคลาวด์สำหรับธุรกิจไทย</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-text transition-colors">แดชบอร์ด</Link>
            <Link href="/quotations" className="hover:text-text transition-colors">ใบเสนอราคา</Link>
            <Link href="/invoices" className="hover:text-text transition-colors">ใบแจ้งหนี้</Link>
            <Link href="/receipts" className="hover:text-text transition-colors">ใบเสร็จรับเงิน</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
