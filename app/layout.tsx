import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'دروس الدعم في العلوم الطبيعية — الأستاذة بوتمجت فايزة',
  description: 'سجّل في دروس الدعم في مادة العلوم الطبيعية مع الأستاذة بوتمجت فايزة. اختر فوجك واملأ بياناتك.',
  robots: 'noindex, nofollow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
