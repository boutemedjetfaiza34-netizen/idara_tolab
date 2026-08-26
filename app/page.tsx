import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تأكيد تسجيل القائمة الاحتياطية — BAC 2027 | دروس الدعم',
  description: 'تأكيد تسجيل الطلبة الموجودين في القائمة الاحتياطية لدروس الدعم في العلوم الطبيعية مع الأستاذة بوتمجت فايزة.',
};

export default function HomePage() {
  return (
    <div className="public-layout">
      {/* Header */}
      <header className="public-header">
        <div className="public-header-logo">
          <div className="header-logo-box">
            <img src="/logo.png" alt="Logo" className="site-logo-img" />
          </div>
          <span className="logo-text">دروس الدعم في العلوم الطبيعية</span>
        </div>
      </header>

      {/* Main */}
      <main className="public-main">
        {/* Hero */}
        <div className="hero">
          <div className="hero-logo-wrapper">
            <img src="/logo.png" alt="Boutemdjet Logo" className="site-logo-hero" />
          </div>

          <div className="hero-badge">
            <span>🧬</span>
            <span>BAC 2027 · دروس الدعم في العلوم الطبيعية</span>
          </div>

          <h1 className="hero-title">
            الأستاذة بوتمجت فايزة
          </h1>

          <h2 className="hero-subtitle">
            تأكيد تسجيل القائمة الاحتياطية
          </h2>
        </div>

        {/* Notice: Main registration phase is closed */}
        <div
          style={{
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
            border: '2px solid #fed7aa',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-5) var(--space-6)',
            marginBottom: 'var(--space-6)',
            width: '100%',
            maxWidth: '740px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>⏰</div>
          <p style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: 800,
            color: '#92400e',
            marginBottom: 'var(--space-2)',
          }}>
            انتهت مرحلة تأكيد تسجيل الطلبة المقبولين
          </p>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: '#b45309',
            fontWeight: 600,
          }}>
            الموقع أصبح الآن مخصصًا لتأكيد تسجيل الطلبة الموجودين في القائمة الاحتياطية فقط.
          </p>
        </div>

        {/* Waitlist Section Title */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)', width: '100%', maxWidth: '740px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              background: 'var(--color-primary-50)',
              color: 'var(--color-primary)',
              border: '1.5px solid var(--color-primary-200)',
              borderRadius: 'var(--radius-full)',
              padding: 'var(--space-2) var(--space-6)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 800,
              marginBottom: 'var(--space-4)',
            }}
          >
            <span>📋</span>
            <span>تأكيد تسجيل القائمة الاحتياطية</span>
          </div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-600)', fontWeight: 500 }}>
            إذا كنت موجودًا في القائمة الاحتياطية، اختر فوجك وأكّد رغبتك في الانتساب.
          </p>
        </div>

        {/* Group Cards */}
        <div className="groups-grid">
          {/* Group 1 */}
          <Link href="/register/group-1" prefetch={true} style={{ display: 'block' }}>
            <div className="group-card">
              <div className="group-card-icon-box">
                🔬
              </div>
              <div className="group-card-number">الفوج 1</div>
              <div className="group-card-label">المجموعة الأولى</div>
              <span className="btn btn-primary" style={{ display: 'inline-flex', width: '100%' }}>
                تأكيد تسجيل القائمة الاحتياطية — الفوج 1
              </span>
            </div>
          </Link>

          {/* Group 2 */}
          <Link href="/register/group-2" prefetch={true} style={{ display: 'block' }}>
            <div className="group-card">
              <div className="group-card-icon-box">
                🧪
              </div>
              <div className="group-card-number">الفوج 2</div>
              <div className="group-card-label">المجموعة الثانية</div>
              <span className="btn btn-primary" style={{ display: 'inline-flex', width: '100%' }}>
                تأكيد تسجيل القائمة الاحتياطية — الفوج 2
              </span>
            </div>
          </Link>
        </div>

        {/* Waitlist Warning Notice */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-50) 0%, #f5e8ff 100%)',
            border: '1.5px solid var(--color-primary-200)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-5) var(--space-6)',
            marginTop: 'var(--space-8)',
            width: '100%',
            maxWidth: '740px',
            textAlign: 'right',
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>⚠️</span>
            <div>
              <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: 'var(--space-1)' }}>
                تنبيه مهم بشأن القائمة الاحتياطية
              </p>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-700)', lineHeight: 1.8 }}>
                تأكيد التسجيل في القائمة الاحتياطية لا يعني الحصول على مقعد بشكل نهائي، وإنما يؤكد رغبتك في الاستفادة من مقعد في حال توفره.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="public-footer">
        دروس الدعم — الأستاذة بوتمجت فايزة · علوم الطبيعة والحياة
      </footer>
    </div>
  );
}
