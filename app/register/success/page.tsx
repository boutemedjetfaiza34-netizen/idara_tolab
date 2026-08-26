import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تم تأكيد تسجيلك — BAC 2027 | دروس الدعم',
};

interface Props {
  searchParams: Promise<{ group?: string; type?: string }>;
}

export default async function SuccessPage({ searchParams }: Props) {
  const { group, type } = await searchParams;
  const isWaitlist = type === 'waitlist';

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
          <div className="success-icon">{isWaitlist ? '📋' : '🎉'}</div>

          <div className="success-card">
            <div className="form-logo-box" style={{ marginBottom: 'var(--space-4)' }}>
              <img src="/logo.png" alt="Boutemdjet Logo" className="form-logo-img" />
            </div>

            {isWaitlist ? (
              <>
                <h1 className="success-title">تم تأكيد تسجيلك بنجاح!</h1>

                <div style={{ margin: 'var(--space-3) 0' }}>
                  <span
                    className="status-badge confirmed"
                    style={{ fontSize: 'var(--font-size-sm)', padding: '6px 18px' }}
                  >
                    ✅ حالة التسجيل: مؤكد – القائمة الاحتياطية
                  </span>
                </div>

                <p className="success-message">
                  تم تسجيلك في القائمة الاحتياطية لـ <strong>{groupLabel}</strong> بنجاح.
                </p>

                <p className="success-message">
                  سيتم مراجعة طلبك من طرف الأستاذة / الإدارة.
                </p>

                {/* Required warning notice */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    border: '1.5px solid #fde68a',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-4)',
                    margin: 'var(--space-4) 0',
                    textAlign: 'right',
                  }}
                >
                  <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>⚠️</span>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: '#92400e', lineHeight: 1.8, fontWeight: 600 }}>
                      تأكيد التسجيل في القائمة الاحتياطية لا يعني الحصول على مقعد بشكل نهائي، وإنما يؤكد رغبتك في الاستفادة من مقعد في حال توفره.
                    </p>
                  </div>
                </div>

                <div className="success-note">
                  شكرًا لتسجيلك في دروس الدعم لمادة العلوم الطبيعية مع الأستاذة <strong>بوتمجت فايزة</strong>.
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
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
