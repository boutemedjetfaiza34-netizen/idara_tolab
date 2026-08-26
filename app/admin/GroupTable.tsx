'use client';

import { useState, useTransition, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { confirmRegistration, unconfirmRegistration, deleteRegistration } from '@/app/actions';
import { exportToExcel } from '@/lib/excel';
import type { Registration, RegistrationGroup } from '@/lib/types';

interface Props {
  registrations: Registration[];
  group: RegistrationGroup;
  groupNumber: 1 | 2;
  groupLabel: string;
}

type FilterStatus = 'ALL' | 'CONFIRMED' | 'PENDING';
type SortOrder = 'desc' | 'asc';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'مقعد احتياطي',
  CONFIRMED: 'مقبول',
};

export default function GroupTable({ registrations, groupNumber, groupLabel }: Props) {
  const [, startTransition] = useTransition();

  // Local optimistic data list
  const [dataList, setDataList] = useState<Registration[]>(registrations);

  useEffect(() => {
    setDataList(registrations);
  }, [registrations]);

  // Filters
  const [searchName, setSearchName] = useState('');
  const [searchFamily, setSearchFamily] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Delete confirmation modal target
  const [deleteTarget, setDeleteTarget] = useState<Registration | null>(null);

  // Action feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  function showFeedback(type: 'success' | 'error', message: string) {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  }

  // Filtered & sorted data
  const filtered = useMemo(() => {
    let data = [...dataList];

    if (searchName.trim()) {
      data = data.filter(r =>
        r.first_name.toLowerCase().includes(searchName.trim().toLowerCase())
      );
    }

    if (searchFamily.trim()) {
      data = data.filter(r =>
        r.last_name.toLowerCase().includes(searchFamily.trim().toLowerCase())
      );
    }

    if (searchPhone.trim()) {
      data = data.filter(r => r.phone.includes(searchPhone.trim()));
    }

    if (filterStatus !== 'ALL') {
      data = data.filter(r => r.status === filterStatus);
    }

    data.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return data;
  }, [dataList, searchName, searchFamily, searchPhone, filterStatus, sortOrder]);

  // Counts
  const acceptedCount = useMemo(() => dataList.filter(r => r.status === 'CONFIRMED').length, [dataList]);
  const reserveCount = useMemo(() => dataList.filter(r => r.status === 'PENDING').length, [dataList]);

  // Instant Optimistic Actions
  function handleAcceptStudent(id: string) {
    setDataList(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'CONFIRMED' as const, confirmed_at: new Date().toISOString() } : r))
    );
    showFeedback('success', 'تم قبول الطالب بنجاح ونقله إلى قائمة المقبولين.');

    startTransition(async () => {
      try {
        const result = await confirmRegistration(id);
        if (!result.success) {
          setDataList(prev =>
            prev.map(r => (r.id === id ? { ...r, status: 'PENDING' as const, confirmed_at: null } : r))
          );
          showFeedback('error', (result as { success: false; error: string }).error);
        }
      } catch {
        setDataList(prev =>
          prev.map(r => (r.id === id ? { ...r, status: 'PENDING' as const, confirmed_at: null } : r))
        );
        showFeedback('error', 'حدث خطأ. يرجى المحاولة مجددًا.');
      }
    });
  }

  function handleMoveToReserve(id: string) {
    setDataList(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'PENDING' as const, confirmed_at: null } : r))
    );
    showFeedback('success', 'تم نقل الطالب إلى القائمة الاحتياطية.');

    startTransition(async () => {
      try {
        const result = await unconfirmRegistration(id);
        if (!result.success) {
          setDataList(prev =>
            prev.map(r => (r.id === id ? { ...r, status: 'CONFIRMED' as const } : r))
          );
          showFeedback('error', (result as { success: false; error: string }).error);
        }
      } catch {
        setDataList(prev =>
          prev.map(r => (r.id === id ? { ...r, status: 'CONFIRMED' as const } : r))
        );
        showFeedback('error', 'حدث خطأ. يرجى المحاولة مجددًا.');
      }
    });
  }

  function handleDelete(target: Registration) {
    const targetId = target.id;
    setDataList(prev => prev.filter(r => r.id !== targetId));
    setDeleteTarget(null);
    showFeedback('success', 'تم حذف التسجيل بنجاح.');

    startTransition(async () => {
      try {
        const result = await deleteRegistration(targetId);
        if (!result.success) {
          setDataList(prev => [...prev, target]);
          showFeedback('error', (result as { success: false; error: string }).error);
        }
      } catch {
        setDataList(prev => [...prev, target]);
        showFeedback('error', 'حدث خطأ أثناء الحذف. يرجى المحاولة مجددًا.');
      }
    });
  }

  function handleExcel() {
    exportToExcel(dataList, groupNumber);
  }

  return (
    <div className="group-page-wrapper">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-breadcrumb">
          <Link href="/admin" prefetch={true}>الرئيسية</Link>
          <span className="page-breadcrumb-sep">›</span>
          <span>{groupLabel}</span>
        </div>
        <div className="page-header-top">
          <h1 className="page-title">
            {groupNumber === 1 ? '🔬' : '🧪'} {groupLabel}
          </h1>
          <button
            className="btn btn-excel"
            onClick={handleExcel}
            id={`export-excel-group-${groupNumber}-btn`}
          >
            <span>📊</span>
            <span>تحميل Excel — {groupLabel}</span>
          </button>
        </div>
      </div>

      {/* Group Summary Badges */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        <div style={{
          background: 'white',
          border: '1.5px solid var(--color-primary-100)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-2) var(--space-4)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 700,
        }}>
          إجمالي المسجلين: <strong style={{ color: 'var(--color-gray-900)' }}>{dataList.length}</strong>
        </div>
        <div style={{
          background: 'var(--color-primary-50)',
          border: '1.5px solid var(--color-primary-200)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-2) var(--space-4)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 700,
          color: 'var(--color-primary)',
        }}>
          المقبولون: <strong>{acceptedCount}</strong>
        </div>
        <div style={{
          background: '#fff7ed',
          border: '1.5px solid #fed7aa',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-2) var(--space-4)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 700,
          color: '#c2410c',
        }}>
          القائمة الاحتياطية: <strong>{reserveCount}</strong>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className={`alert alert-${feedback.type}`} style={{ marginBottom: 'var(--space-4)' }}>
          <span>{feedback.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Container */}
      <div className="table-container">
        <div className="table-header">
          <div className="table-header-top">
            <div>
              <span className="table-title">{groupLabel}</span>
              <span className="table-count"> — {filtered.length} من {dataList.length} طالب</span>
            </div>
          </div>

          {/* Filters Grid */}
          <div className="table-filters">
            <input
              type="text"
              className="filter-input"
              placeholder="🔍 بحث بالاسم"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              id="filter-name"
            />
            <input
              type="text"
              className="filter-input"
              placeholder="🔍 بحث باللقب"
              value={searchFamily}
              onChange={e => setSearchFamily(e.target.value)}
              id="filter-family"
            />
            <input
              type="text"
              className="filter-input"
              placeholder="🔍 بحث برقم الهاتف"
              value={searchPhone}
              onChange={e => setSearchPhone(e.target.value)}
              id="filter-phone"
              style={{ direction: 'ltr', textAlign: 'right' }}
            />
            <select
              className="filter-select"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as FilterStatus)}
              id="filter-status"
            >
              <option value="ALL">جميع الطلبة ({dataList.length})</option>
              <option value="CONFIRMED">المقبولون ({acceptedCount})</option>
              <option value="PENDING">القائمة الاحتياطية ({reserveCount})</option>
            </select>
            <select
              className="filter-select"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as SortOrder)}
              id="sort-order"
            >
              <option value="desc">الأحدث أولاً</option>
              <option value="asc">الأقدم أولاً</option>
            </select>
          </div>
        </div>

        {/* Empty State */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">
              {dataList.length === 0
                ? `لا توجد تسجيلات في ${groupLabel} حاليًا.`
                : 'لا توجد نتائج تطابق معايير الفلترة أو البحث.'}
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View (Hidden on mobile) */}
            <div className="table-wrapper desktop-only-table">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>الاسم واللقب</th>
                    <th>رقم الهاتف</th>
                    <th>الحالة</th>
                    <th>تاريخ التسجيل</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((reg, index) => {
                    const isConfirmed = reg.status === 'CONFIRMED';
                    return (
                      <tr key={reg.id}>
                        <td className="td-number">{index + 1}</td>
                        <td className="td-name">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span>{reg.first_name} {reg.last_name}</span>
                            {!isConfirmed && (
                              <span className="badge-reserve">
                                مقعد احتياطي
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="td-phone">
                          <a href={`tel:${reg.phone}`} style={{ color: 'inherit' }}>
                            {reg.phone}
                          </a>
                        </td>
                        <td>
                          <span className={`status-badge ${isConfirmed ? 'confirmed' : 'pending'}`}>
                            {isConfirmed ? '✅ مقبول' : '📋 مقعد احتياطي'}
                          </span>
                        </td>
                        <td className="td-date" suppressHydrationWarning>
                          {new Date(reg.created_at).toLocaleString('fr-DZ', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td>
                          <div className="td-actions">
                            {!isConfirmed ? (
                              <button
                                type="button"
                                className="btn btn-success"
                                onClick={() => handleAcceptStudent(reg.id)}
                                id={`accept-btn-${reg.id}`}
                                title="قبول الطالب ونقله إلى قائمة المقبولين"
                              >
                                ✅ قبول الطالب
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-warning"
                                onClick={() => handleMoveToReserve(reg.id)}
                                id={`reserve-btn-${reg.id}`}
                                title="نقل الطالب إلى القائمة الاحتياطية"
                              >
                                ↩️ تحويل للاحتياط
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => setDeleteTarget(reg)}
                              id={`delete-btn-${reg.id}`}
                            >
                              🗑️ حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (Visible on mobile screens) */}
            <div className="mobile-cards-list">
              {filtered.map((reg, index) => {
                const isConfirmed = reg.status === 'CONFIRMED';
                return (
                  <div className="student-mobile-card" key={reg.id}>
                    <div className="student-card-header">
                      <div className="student-card-title-group" style={{ flexWrap: 'wrap' }}>
                        <span className="student-card-num">#{index + 1}</span>
                        <strong className="student-card-name">{reg.first_name} {reg.last_name}</strong>
                        {!isConfirmed && (
                          <span className="badge-reserve">
                            مقعد احتياطي
                          </span>
                        )}
                      </div>
                      <span className={`status-badge ${isConfirmed ? 'confirmed' : 'pending'}`}>
                        {isConfirmed ? '✅ مقبول' : '📋 احتياط'}
                      </span>
                    </div>

                    <div className="student-card-details">
                      <a href={`tel:${reg.phone}`} className="student-phone-pill">
                        <span>📞</span>
                        <span dir="ltr">{reg.phone}</span>
                      </a>
                      <span className="student-date-pill" suppressHydrationWarning>
                        <span>📅</span>
                        <span suppressHydrationWarning>
                          {new Date(reg.created_at).toLocaleString('fr-DZ', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </span>
                    </div>

                    <div className="student-card-actions">
                      {!isConfirmed ? (
                        <button
                          type="button"
                          className="btn btn-success mobile-action-btn"
                          onClick={() => handleAcceptStudent(reg.id)}
                        >
                          ✅ قبول الطالب (تحويل لمقبول)
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-warning mobile-action-btn"
                          onClick={() => handleMoveToReserve(reg.id)}
                        >
                          ↩️ تحويل للاحتياط
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-danger mobile-delete-btn"
                        onClick={() => setDeleteTarget(reg)}
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🗑️</div>
            <div className="modal-title">هل أنت متأكد من حذف هذا التسجيل؟</div>
            <div className="modal-message">
              سيتم حذف تسجيل الطالب <strong>{deleteTarget.first_name} {deleteTarget.last_name}</strong> نهائيًا.
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary modal-btn"
                onClick={() => setDeleteTarget(null)}
                id="cancel-delete-btn"
              >
                إلغاء
              </button>
              <button
                type="button"
                className="btn btn-danger modal-btn"
                onClick={() => handleDelete(deleteTarget)}
                id="confirm-delete-btn"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
