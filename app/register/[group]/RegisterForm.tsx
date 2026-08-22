'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerStudent } from '@/app/actions';
import type { Registration, RegistrationGroup } from '@/lib/types';

interface Props {
  group: RegistrationGroup;
  groupLabel: string;
  groupNumber: 1 | 2;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  phone?: string;
  general?: string;
}

export default function RegisterForm({ group, groupLabel, groupNumber }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  // Status state if student is already registered
  const [existingStudent, setExistingStudent] = useState<Registration | null>(null);

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!firstName.trim()) {
      newErrors.first_name = 'الاسم مطلوب.';
    }

    if (!lastName.trim()) {
      newErrors.last_name = 'اللقب مطلوب.';
    }

    if (!phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب.';
    } else {
      const phoneRegex = /^(05|06|07)[0-9]{8}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        newErrors.phone = 'رقم الهاتف غير صحيح. يجب أن يبدأ بـ 05 أو 06 أو 07 ويتكون من 10 أرقام.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    startTransition(async () => {
      const result = await registerStudent({
        first_name: firstName,
        last_name: lastName,
        phone: phone.replace(/\s/g, ''),
        group,
      });

      if (result.success) {
        router.push(`/register/success?group=${group}`);
      } else if (result.alreadyRegistered && result.existingRegistration) {
        setExistingStudent(result.existingRegistration);
      } else {
        setErrors({ general: result.error });
      }
    });
  }

  // If student is already registered, show dedicated Status Card
  if (existingStudent) {
    const isConfirmed = existingStudent.status === 'CONFIRMED';

    return (
      <div className="public-layout">
        <header className="public-header">
          <div className="public-header-logo">
            <Link href="/" prefetch={true}>
              <div className="header-logo-box">
                <img src="/logo.png" alt="Boutemdjet Logo" className="site-logo-img" />
              </div>
            </Link>
          </div>
        </header>

        <main className="public-main">
          <div className="form-container" style={{ textAlign: 'center' }}>
            <div className="form-logo-box" style={{ marginBottom: 'var(--space-3)' }}>
              <img src="/logo.png" alt="Boutemdjet Logo" className="form-logo-img" />
            </div>

            {isConfirmed ? (
              <>
                <div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-2)' }}>🎉</div>
                <h1 className="form-title" style={{ color: 'var(--color-primary)' }}>
                  أنت مسجل بالفعل!
                </h1>
                <div style={{ margin: 'var(--space-3) 0' }}>
                  <span className="status-badge confirmed" style={{ fontSize: 'var(--font-size-sm)', padding: '6px 14px' }}>
                    ✅ تم تأكيد تسجيلك رسميًا
                  </span>
                </div>

                <div
                  style={{
                    background: 'var(--color-primary-50)',
                    border: '1.5px solid var(--color-primary-200)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-4)',
                    margin: 'var(--space-4) 0',
                    textAlign: 'right',
                  }}
                >
                  <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)' }}>
                    مرحبًا بك يا {existingStudent.first_name} {existingStudent.last_name} 👋
                  </p>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-700)', marginBottom: 'var(--space-2)' }}>
                    لقد تم <strong>قبول وتأكيد تسجيلك</strong> في <strong>{groupLabel}</strong> لدروس الدعم في العلوم الطبيعية مع الأستاذة <strong>بوتمجت فايزة</strong>.
                  </p>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', borderTop: '1px solid var(--color-primary-100)', paddingTop: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                    <span>📞 رقم الهاتف: <strong dir="ltr">{existingStudent.phone}</strong></span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-2)' }}>⏳</div>
                <h1 className="form-title" style={{ color: 'var(--color-pending)' }}>
                  أنت مسجل مسبقًا
                </h1>
                <div style={{ margin: 'var(--space-3) 0' }}>
                  <span className="status-badge pending" style={{ fontSize: 'var(--font-size-sm)', padding: '6px 14px' }}>
                    ⏳ التسجيل الأولي (قيد المراجعة)
                  </span>
                </div>

                <div
                  style={{
                    background: '#fffbeb',
                    border: '1.5px solid #fde68a',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-4)',
                    margin: 'var(--space-4) 0',
                    textAlign: 'right',
                  }}
                >
                  <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)' }}>
                    مرحبًا بك يا {existingStudent.first_name} {existingStudent.last_name} 👋
                  </p>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-700)', marginBottom: 'var(--space-2)' }}>
                    طلب تسجيلك في <strong>{groupLabel}</strong> مسجل لدينا ومحفوظ بنجاح، وهو حاليًا <strong>في انتظار تأكيد الإدارة والأستاذة</strong>.
                  </p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', marginTop: 'var(--space-1)' }}>
                    لا داعي لإعادة التسجيل مرة أخرى، سيتم تأكيد طلبك قريبًا.
                  </p>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', borderTop: '1px solid #fef3c7', paddingTop: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                    <span>📞 رقم الهاتف: <strong dir="ltr">{existingStudent.phone}</strong></span>
                  </div>
                </div>
              </>
            )}

            <div style={{ marginTop: 'var(--space-6)' }}>
              <Link href="/" prefetch={true} className="btn btn-primary" style={{ display: 'inline-flex', width: '100%' }}>
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

  // Normal Registration Form
  return (
    <div className="public-layout">
      <header className="public-header">
        <div className="public-header-logo">
          <Link href="/" prefetch={true}>
            <div className="header-logo-box">
              <img src="/logo.png" alt="Boutemdjet Logo" className="site-logo-img" />
            </div>
          </Link>
        </div>
      </header>

      <main className="public-main">
        <div className="form-container">
          <div className="form-header">
            <div className="form-logo-box">
              <img src="/logo.png" alt="Boutemdjet Logo" className="form-logo-img" />
            </div>
            <h1 className="form-title">التسجيل في {groupLabel}</h1>
            <p className="form-subtitle">
              الأستاذة بوتمجت فايزة · علوم الطبيعة و الحياة
            </p>
          </div>

          <div className="form-badge">
            <span>📋</span>
            <span>{groupLabel}</span>
          </div>

          {errors.general && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="first_name" className="form-label">
                الاسم <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                id="first_name"
                type="text"
                className={`form-input ${errors.first_name ? 'error' : ''}`}
                placeholder="أدخل اسمك"
                value={firstName}
                onChange={e => { setFirstName(e.target.value); setErrors(p => ({ ...p, first_name: undefined })); }}
                disabled={isPending}
                autoComplete="given-name"
              />
              {errors.first_name && (
                <div className="form-error">
                  <span>⚠️</span>
                  <span>{errors.first_name}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="last_name" className="form-label">
                اللقب <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                id="last_name"
                type="text"
                className={`form-input ${errors.last_name ? 'error' : ''}`}
                placeholder="أدخل لقبك"
                value={lastName}
                onChange={e => { setLastName(e.target.value); setErrors(p => ({ ...p, last_name: undefined })); }}
                disabled={isPending}
                autoComplete="family-name"
              />
              {errors.last_name && (
                <div className="form-error">
                  <span>⚠️</span>
                  <span>{errors.last_name}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                رقم الهاتف <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                id="phone"
                type="tel"
                className={`form-input ${errors.phone ? 'error' : ''}`}
                placeholder="05xxxxxxxx"
                value={phone}
                onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: undefined })); }}
                disabled={isPending}
                autoComplete="tel"
                inputMode="numeric"
                style={{ direction: 'ltr', textAlign: 'right' }}
              />
              {errors.phone && (
                <div className="form-error">
                  <span>⚠️</span>
                  <span>{errors.phone}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isPending}
              id="submit-registration"
            >
              {isPending ? (
                <>
                  <span className="loading-spinner" />
                  <span>جاري التحقق والتسجيل...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>تأكيد التسجيل</span>
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: 'var(--space-5)', textAlign: 'center' }}>
            <Link
              href="/"
              prefetch={true}
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-primary)',
                fontWeight: 700,
                textDecoration: 'underline',
              }}
            >
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
