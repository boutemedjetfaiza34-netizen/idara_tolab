'use client';

import { useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { adminSignOut } from '@/app/actions';

interface Props {
  children: React.ReactNode;
  userEmail: string;
}

export default function AdminLayoutClient({ children, userEmail }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await adminSignOut();
      router.push('/secure-admin-login');
      router.refresh();
    });
  }

  return (
    <div className="admin-layout">
      {/* Top Bar */}
      <header className="admin-topbar">
        <div className="admin-topbar-brand">
          <Link href="/admin" prefetch={true} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div className="admin-logo-box">
              <img src="/logo.png" alt="Logo" className="admin-topbar-logo" />
            </div>
            <div>
              <div className="admin-topbar-title">لوحة الإدارة</div>
              <div className="admin-topbar-subtitle">الأستاذة بوتمجت فايزة</div>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="admin-nav">
          <Link
            href="/admin"
            prefetch={true}
            className={`admin-nav-link ${pathname === '/admin' ? 'active' : ''}`}
          >
            <span>📊</span>
            <span>الرئيسية</span>
          </Link>
          <Link
            href="/admin/group-1"
            prefetch={true}
            className={`admin-nav-link ${pathname === '/admin/group-1' ? 'active' : ''}`}
          >
            <span>🔬</span>
            <span>الفوج 1</span>
          </Link>
          <Link
            href="/admin/group-2"
            prefetch={true}
            className={`admin-nav-link ${pathname === '/admin/group-2' ? 'active' : ''}`}
          >
            <span>🧪</span>
            <span>الفوج 2</span>
          </Link>
        </nav>

        <div className="admin-topbar-actions">
          <span className="admin-email-badge">
            {userEmail}
          </span>
          <button
            onClick={handleSignOut}
            disabled={isPending}
            className="btn btn-secondary btn-sm-logout"
            id="admin-signout-btn"
          >
            {isPending ? '...' : 'خروج 🚪'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-content">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="admin-mobile-nav">
        <Link
          href="/admin"
          prefetch={true}
          className={`admin-mobile-tab ${pathname === '/admin' ? 'active' : ''}`}
        >
          <span className="tab-icon">📊</span>
          <span className="tab-label">الرئيسية</span>
        </Link>
        <Link
          href="/admin/group-1"
          prefetch={true}
          className={`admin-mobile-tab ${pathname === '/admin/group-1' ? 'active' : ''}`}
        >
          <span className="tab-icon">🔬</span>
          <span className="tab-label">الفوج 1</span>
        </Link>
        <Link
          href="/admin/group-2"
          prefetch={true}
          className={`admin-mobile-tab ${pathname === '/admin/group-2' ? 'active' : ''}`}
        >
          <span className="tab-icon">🧪</span>
          <span className="tab-label">الفوج 2</span>
        </Link>
      </nav>
    </div>
  );
}
