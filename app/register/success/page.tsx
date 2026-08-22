import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تم التسجيل بنجاح — دروس الدعم',
};

interface Props {
  searchParams: Promise<{ group?: string }>;
}

export default async function SuccessPage({ searchParams }: Props) {
  const { group } = await searchParams;

  const groupLabel =
    group === 'GROUP_1' ? 'الفوج 1'
    : group === 'GROUP_2' ? 'الفوج 2'
    : 'الفوج المختار';

  return (
    <div className="public-layout">
      <header className="public-header">
        <div className="public-header-logo">
          <Link href="/" prefetch={true}>
            <img src="/logo.png" alt="Boutemdjet Logo" className="site-logo-img" />
          </Link>
        </div>
      </header>

      <main className="public-main">
        <div className="success-container">
          <div className="success-icon">🎉</div>

          <div className="success-card">
            <div className="form-logo-box" style={{ marginBottom: 'var(--space-4)' }}>
              <img src="/logo.png" alt="Boutemdjet Logo" className="form-logo-img" />
            </div>
            <h1 className="success-title">تم تسجيلك بنجاح!</h1>

            <p className="success-message">
              تم تسجيلك مبدئيًا في <strong>{groupLabel}</strong>.
            </p>

            <p className="success-message">
              سيتم تأكيد التسجيل من طرف الأستاذة / الإدارة.
            </p>

            <div className="success-note">
              شكرًا لتسجيلك في دروس الدعم لمادة العلوم الطبيعية مع الأستاذة <strong>بوتمجت فايزة</strong>.
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
            <Link href="/" prefetch={true} className="btn btn-secondary" style={{ display: 'inline-flex' }}>
              ← العودة إلى الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </main>

      <footer className="public-footer">
        دروس الدعم — الأستاذة بوتمجت فايزة · علوم الطبيعة والحياة
      </footer>
    </div>
  );
}
