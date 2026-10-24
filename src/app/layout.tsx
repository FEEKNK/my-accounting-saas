import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'My Accounting — Cloud Accounting สำหรับธุรกิจยุคใหม่',
  description: 'ระบบออกใบเสนอราคา ใบแจ้งหนี้ ใบเสร็จรับเงิน และภาษีครบวงจร ออกแบบมาเพื่อเจ้าของธุรกิจ มั่นใจได้โดยนักบัญชี',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Prompt:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg text-text antialiased">
        {children}
      </body>
    </html>
  );
}
