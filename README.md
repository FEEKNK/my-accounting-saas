<div align="center">

# 🌿 My Accounting

### *Cloud Accounting Built for Founders, Trusted by Accountants*

An open, modern, and compliant cloud accounting platform designed specifically for Thai SMEs, solo entrepreneurs, and growing service teams.

[![Next.js 15](https://img.shields.io/badge/Next.js-15.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?style=flat-square)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=flat-square&logo=postgresql)](https://neon.tech/)
[![WCAG 2.2 AA](https://img.shields.io/badge/WCAG_2.2-AA_Passed-047857?style=flat-square)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Tests](https://img.shields.io/badge/Tests-11%20Passed-brightgreen?style=flat-square)](tests/accounting-test-suite.mjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-getting-started) • [Architecture](#-architecture) • [Testing](#-testing) • [Roadmap](#-roadmap)

---

</div>

## 📖 Overview

Traditional accounting software in Thailand is engineered almost exclusively for certified bookkeepers, burdening business owners with debit/credit jargon, multi-screen navigation, and restrictive per-seat paywalls.

**My Accounting** bridges the gap between founders and accountants with a seamless **Dual Experience**:
- **Simple Mode**: A clean, 30-second billing workflow for business owners, sales teams, and freelancers to create quotations, invoices, and receipts without accounting complexity.
- **Pro Mode**: Full general ledger (GL), journal entries, withholding tax certificates, and ภ.พ.30 VAT reports for internal and external accountants.
- **Fair Collaboration**: **Unlimited team seats on every plan**—never paywall collaboration or charge per user.

---

## ✨ Key Features

### ⚡ Core Sales Lifecycle (30-Second Invoicing)
- **Quotations (ใบเสนอราคา)**: Instant document generation with live item search, unit pricing, discounts, and auto-computed Thai BahtText.
- **Interactive E-Signatures**: Send a public link where clients can review line items, approve, and draw their signature on mobile without printing paper PDFs.
- **1-Click Conversion**: Convert approved quotations into invoices with a single click while preserving discounts and item structures.
- **Invoices (ใบแจ้งหนี้ / ใบวางบิล)**: Automated payment term calculation (Due Date tracking, Overdue status indicators).
- **Payment Recording & Receipts (ใบเสร็จรับเงิน / ใบกำกับภาษี)**: Support for partial and full payments, transfer slip attachments, and official Revenue Department-compliant receipt issuance.

### 🇹🇭 Thai Tax & Compliance Standards
- **Value-Added Tax (VAT 7%)**: Automated standard 7% computation with integer-cent accuracy.
- **Withholding Tax (WHT)**: Native support for standard Thai withholding tax rates (1% transport, 2% advertising, 3% services/professional fees, 5% rent).
- **Thai BahtText Conversion**: Automated, zero-dependency algorithmic conversion from numeric totals to Thai currency text (*e.g., ฿107,000.00 ➔ หนึ่งแสนเจ็ดพันบาทถ้วน*).
- **Revenue Department Verification**: Support for 13-digit Corporate Tax IDs (เลขประจำตัวผู้เสียภาษี) and Branch Codes (`สำนักงานใหญ่` or 5-digit branches).
- **e-Tax Ready**: Data structures structured for future direct Revenue Department e-Tax Invoice submission.

### 🏗️ Contractor & Agency Progress Billing
- **Milestone Billing (แบ่งงวดงาน)**: Native progress billing support (1..N phases) with percentage or fixed sum allocation.
- **Retention Money (หักเงินประกันผลงาน 5%)**: Automatic retention guarantee deduction and tax withholding separation for construction, interior, and service contracts.

### 🔒 Security, Isolation & Multi-Tenancy
- **Strict Multi-Tenant Isolation**: Row-level tenant partitioning via `requireTenant` boundaries, preventing cross-tenant data leaks.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions across 4 standard roles (`owner`, `admin`, `accountant`, `member`).
- **Financial Precision**: All monetary values are strictly stored as integer cents (`bigint`) to eliminate floating-point arithmetic errors.

---

## 🛠 Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Next.js 15 (App Router)](https://nextjs.org/) | Server Components, Server Actions, Dynamic Routing |
| **Frontend** | [React 19](https://react.dev/) + [TypeScript 5.7](https://www.typescriptlang.org/) | Strict type safety, clean reactive state management |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) | Custom design tokens, Emerald Forest palette, responsive UI |
| **Typography** | [Prompt](https://fonts.google.com/specimen/Prompt) + [Inter](https://fonts.google.com/specimen/Inter) | Optimized dual-script Thai & Latin typography |
| **Database** | [PostgreSQL (Neon Serverless)](https://neon.tech/) | Serverless connection pooling, branchable databases |
| **ORM** | [Drizzle ORM 0.45](https://orm.drizzle.team/) | Type-safe SQL schema definitions & relations |
| **Validation** | [Zod v4](https://zod.dev/) | Strict runtime data contracts & input sanitization |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, consistent SVG icon set |

---

## 📁 Repository Structure

```text
my-accounting-saas/
├── src/
│   ├── app/                         # Next.js 15 App Router routes
│   │   ├── (dashboard)/             # Authenticated workspace application
│   │   │   ├── page.tsx             # S01 Executive Dashboard & Revenue KPIs
│   │   │   ├── contacts/            # S02 Customer & Supplier directory
│   │   │   ├── products/            # S04 Product & Service catalog
│   │   │   ├── quotations/          # S08/S09/S10 Quotation builder & preview
│   │   │   ├── invoices/            # S11/S12/S13 Invoice builder & payment modal
│   │   │   ├── receipts/            # S17/S18/S19 Official tax receipts
│   │   │   ├── expenses/            # Purchase orders & vendor expense tracking
│   │   │   ├── accounting/          # General Ledger & Chart of Accounts
│   │   │   ├── reports/             # Financial P&L, Balance Sheet, Cash Flow
│   │   │   ├── tax/                 # VAT (ภ.พ.30) & WHT (ภ.ง.ด.3/53) reports
│   │   │   ├── payroll/             # Monthly salary calculation & bank export
│   │   │   └── settings/            # Company profile, VAT rates & team seats
│   │   ├── api/                     # RESTful JSON API endpoints
│   │   ├── landing/                 # Public marketing & pricing page (/landing)
│   │   ├── globals.css              # Global styles & design token imports
│   │   └── layout.tsx               # Root HTML shell & Prompt web font
│   ├── components/
│   │   ├── layout/                  # Navigation drawer & responsive AppShell
│   │   └── ui/                      # Accessible design primitives (Button, DataTable, etc.)
│   ├── db/                          # Database connection pool & Drizzle schema
│   │   ├── schema.ts                # Relational schema (38 tables)
│   │   ├── access.ts                # Tenant-isolated DB query wrappers
│   │   └── index.ts                 # Neon serverless client initialization
│   ├── design/                      # Design system tokens (CSS/JSON)
│   │   ├── tokens.css               # WCAG 2.2 AA verified color variables
│   │   └── tokens.json              # Design token configuration
│   ├── lib/                         # Shared utilities, auth, and validation
│   │   ├── auth/rbac.ts             # Role-based access control matrix
│   │   ├── utils/baht-text.ts       # Thai BahtText algorithmic parser
│   │   └── validation/              # Zod schemas for accounting entities
│   └── types/                       # Core TypeScript definitions
├── tests/                           # Automated test suites
│   └── accounting-test-suite.mjs    # Core math, VAT, BahtText & RBAC tests
├── .env.example                     # Environment variables template
├── package.json                     # Project manifest & scripts
├── tailwind.config.js               # Tailwind configuration with token mappings
└── tsconfig.json                    # TypeScript compiler options
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: `npm` (comes with Node), `pnpm`, or `bun`
- **PostgreSQL Database**: Free serverless instance on [Neon](https://neon.tech/) or standard PostgreSQL instance.

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/FEEKNK/my-accounting-saas.git
cd my-accounting-saas
npm install
```

### 2. Configure Environment Variables
Create your local environment file:
```bash
cp .env.example .env.local
```
Fill in your database connection string in `.env.local`:
```env
DATABASE_URL="postgresql://user:password@your-neon-host.neon.tech/myaccounting?sslmode=require"
AUTH_SECRET="your-generate-32-char-secret"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.  
To explore the public marketing landing page, navigate to [http://localhost:3000/landing](http://localhost:3000/landing).

---

## 🧪 Testing

My Accounting includes a built-in automated test suite covering financial math, Thai BahtText logic, and multi-tenant security rules:

```bash
npm test
```

### Verified Test Suites (100% Pass Rate)
- [x] **Thai Baht Text Conversion**: Formats zero baht, whole baht, satang groups, and multi-millions.
- [x] **Accounting Math & 7% VAT**: Calculates line items, subtotal, discounts, and tax with zero float inaccuracies.
- [x] **Core Sales Flow Simulation**: Validates state progression from Draft Quotation ➔ Approved ➔ Converted to Invoice ➔ Partial Payment ➔ Full Payment ➔ Paid Receipt.
- [x] **Security & Tenant Isolation**: Verifies strict rejection of missing tenant IDs and RBAC permission enforcement.

---

## 📦 Production Deployment

### Option A: Vercel (Recommended)
1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Set the Root Directory to `my-accounting-saas` (if in a monorepo).
4. Add environment variables from `.env.example`.
5. Deploy.

### Option B: Docker Container
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 🗺️ Product Roadmap

- [x] **Phase 1: Core Sales Loop (Complete)**
  - Full Quotation, Invoice, Receipt, and Payment workflows
  - Customer/Supplier and Product catalogs
  - Automated Thai VAT 7% & BahtText generator
  - Public marketing landing page & pricing model
- [ ] **Phase 2: Purchasing & Expenses (In Progress)**
  - Vendor Purchase Orders (PO) & Bill logging
  - Withholding Tax certificates (หนังสือรับรองหัก ณ ที่จ่าย 50 ทวิ)
- [ ] **Phase 3: Banking & Reconciliation**
  - Bank statement upload (KBank, SCB, BBL format parsers)
  - 1-click cash reconciliation
- [ ] **Phase 4: General Ledger & Tax Filings**
  - Chart of accounts, journal entries, trial balance, and ภ.พ.30 export
- [ ] **Phase 5: Thai E-Sign & Contractor Portals**
  - Public interactive client quotation signing portal
  - Progress billing & 5% retention guarantee management

---

## 🛡 Security & Precision Commitments

1. **Integer Money Representation**: We strictly store all financial transactions as integer cents/satang (`bigint`). Float arithmetic is completely prohibited in accounting calculations.
2. **Multi-Tenant Boundaries**: Every database query is executed within a validated `tenantId` scope.
3. **Clean-Room Codebase**: Zero third-party proprietary assets, copy, or trademarked styling.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
