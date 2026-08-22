import Link from 'next/link';
import type { Metadata } from 'next';
import { getStats } from '@/app/actions';

export const metadata: Metadata = {
  title: 'لوحة الإدارة — دروس الدعم',
};

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const result = await getStats();

  const stats = result.success ? result.data : {
    total: 0,
    group1Total: 0,
    group2Total: 0,
    pendingTotal: 0,
    confirmedTotal: 0,
    group1Pending: 0,
    group1Confirmed: 0,
    group2Pending: 0,
    group2Confirmed: 0,
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">لوحة الإدارة</h1>
        <p style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)', fontWeight: 600 }}>
          دروس الدعم في العلوم الطبيعية — الأستاذة بوتمجت فايزة
        </p>
      </div>

      {/* Global Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">إجمالي المسجلين</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-sub">في كلا الفوجين</div>
        </div>

        <div className="stat-card group1">
          <div className="stat-label">الفوج 1</div>
          <div className="stat-value">{stats.group1Total}</div>
          <div className="stat-sub">إجمالي الطلبة</div>
        </div>

        <div className="stat-card group2">
          <div className="stat-label">الفوج 2</div>
          <div className="stat-value">{stats.group2Total}</div>
          <div className="stat-sub">إجمالي الطلبة</div>
        </div>

        <div className="stat-card pending">
          <div className="stat-label">التسجيل الأولي</div>
          <div className="stat-value">{stats.pendingTotal}</div>
          <div className="stat-sub">في انتظار التأكيد</div>
        </div>

        <div className="stat-card confirmed">
          <div className="stat-label">تم التأكيد</div>
          <div className="stat-value">{stats.confirmedTotal}</div>
          <div className="stat-sub">تم تأكيد التسجيل</div>
        </div>
      </div>

      {/* Group Cards */}
      <div className="admin-groups-grid">
        {/* Group 1 */}
        <div className="admin-group-card">
          <div className="admin-group-card-header">
            <h2 className="admin-group-card-title">🔬 الفوج 1</h2>
            <span className="admin-group-card-badge">
              {stats.group1Total} طالب
            </span>
          </div>

          <div className="admin-group-stats">
            <div className="admin-group-stat">
              <div className="admin-group-stat-value">{stats.group1Total}</div>
              <div className="admin-group-stat-label">إجمالي</div>
            </div>
            <div className="admin-group-stat">
              <div className="admin-group-stat-value" style={{ color: 'var(--color-pending)' }}>
                {stats.group1Pending}
              </div>
              <div className="admin-group-stat-label">أولي</div>
            </div>
            <div className="admin-group-stat">
              <div className="admin-group-stat-value" style={{ color: 'var(--color-primary)' }}>
                {stats.group1Confirmed}
              </div>
              <div className="admin-group-stat-label">مؤكد</div>
            </div>
          </div>

          <Link href="/admin/group-1" prefetch={true} style={{ display: 'block' }}>
            <span className="btn btn-primary" id="open-group-1-btn" style={{ display: 'inline-flex', width: '100%' }}>
              <span>👁️</span>
              <span>فتح الفوج 1</span>
            </span>
          </Link>
        </div>

        {/* Group 2 */}
        <div className="admin-group-card">
          <div className="admin-group-card-header">
            <h2 className="admin-group-card-title">🧪 الفوج 2</h2>
            <span className="admin-group-card-badge">
              {stats.group2Total} طالب
            </span>
          </div>

          <div className="admin-group-stats">
            <div className="admin-group-stat">
              <div className="admin-group-stat-value">{stats.group2Total}</div>
              <div className="admin-group-stat-label">إجمالي</div>
            </div>
            <div className="admin-group-stat">
              <div className="admin-group-stat-value" style={{ color: 'var(--color-pending)' }}>
                {stats.group2Pending}
              </div>
              <div className="admin-group-stat-label">أولي</div>
            </div>
            <div className="admin-group-stat">
              <div className="admin-group-stat-value" style={{ color: 'var(--color-primary)' }}>
                {stats.group2Confirmed}
              </div>
              <div className="admin-group-stat-label">مؤكد</div>
            </div>
          </div>

          <Link href="/admin/group-2" prefetch={true} style={{ display: 'block' }}>
            <span className="btn btn-primary" id="open-group-2-btn" style={{ display: 'inline-flex', width: '100%' }}>
              <span>👁️</span>
              <span>فتح الفوج 2</span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
