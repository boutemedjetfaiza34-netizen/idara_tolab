'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminSignIn } from '@/app/actions';

export default function AdminLoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('أدخل البريد الإلكتروني وكلمة المرور.');
      return;
    }
    setError('');

    startTransition(async () => {
      const result = await adminSignIn(email, password);
      if (result.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-box">
            <img src="/logo.png" alt="Logo" className="login-logo-img" />
          </div>
          <h1 className="login-title">لوحة الإدارة</h1>
          <p className="login-subtitle">
            الأستاذة بوتمجت فايزة · علوم الطبيعة والحياة
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="أدخل البريد الإلكتروني"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isPending}
              autoComplete="email"
              style={{ direction: 'ltr', textAlign: 'right' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isPending}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isPending}
            id="admin-login-btn"
          >
            {isPending ? (
              <>
                <span className="loading-spinner" />
                <span>جاري الدخول...</span>
              </>
            ) : (
              <>
                <span>🔐</span>
                <span>تسجيل الدخول</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
