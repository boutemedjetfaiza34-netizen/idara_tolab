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

type FilterStatus = 'ALL' | 'PENDING' | 'CONFIRMED';
type SortOrder = 'desc' | 'asc';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'التسجيل الأولي',
  CONFIRMED: 'تم تأكيد التسجيل',
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

  // Instant Optimistic Actions
  function handleConfirm(id: string) {
    setDataList(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'CONFIRMED' as const, confirmed_at: new Date().toISOString() } : r))
    );
    showFeedback('success', 'تم تأكيد التسجيل بنجاح.');

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

  function handleUnconfirm(id: string) {
    setDataList(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'PENDING' as const, confirmed_at: null } : r))
    );
    showFeedback('success', 'تم إلغاء تأكيد التسجيل.');

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
              <option value="ALL">جميع الحالات</option>
              <option value="PENDING">التسجيل الأولي</option>
              <option value="CONFIRMED">تم التأكيد</option>
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
                : 'لا توجد نتائج تطابق البحث.'}
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
                    <th>الاسم</th>
                    <th>اللقب</th>
                    <th>رقم الهاتف</th>
                    <th>الحالة</th>
                    <th>تاريخ التسجيل</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((reg, index) => (
                    <tr key={reg.id}>
                      <td className="td-number">{index + 1}</td>
                      <td className="td-name">{reg.first_name}</td>
                      <td className="td-name">{reg.last_name}</td>
                      <td className="td-phone">
                        <a href={`tel:${reg.phone}`} style={{ color: 'inherit' }}>
                          {reg.phone}
                        </a>
                      </td>
                      <td>
                        <span className={`status-badge ${reg.status === 'CONFIRMED' ? 'confirmed' : 'pending'}`}>
                          {reg.status === 'CONFIRMED' ? '✅' : '⏳'} {STATUS_LABELS[reg.status]}
                        </span>
                      </td>
                      <td className="td-date">
                        {new Date(reg.created_at).toLocaleDateString('ar-DZ', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td>
                        <div className="td-actions">
                          {reg.status === 'PENDING' ? (
                            <button
                              type="button"
                              className="btn btn-success"
                              onClick={() => handleConfirm(reg.id)}
                              id={`confirm-btn-${reg.id}`}
                            >
                              ✅ تأكيد
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-warning"
                              onClick={() => handleUnconfirm(reg.id)}
                              id={`unconfirm-btn-${reg.id}`}
                            >
                              ↩️ إلغاء التأكيد
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (Visible on mobile screens) */}
            <div className="mobile-cards-list">
              {filtered.map((reg, index) => (
                <div className="student-mobile-card" key={reg.id}>
                  <div className="student-card-header">
                    <div className="student-card-title-group">
                      <span className="student-card-num">#{index + 1}</span>
                      <strong className="student-card-name">{reg.first_name} {reg.last_name}</strong>
                    </div>
                    <span className={`status-badge ${reg.status === 'CONFIRMED' ? 'confirmed' : 'pending'}`}>
                      {reg.status === 'CONFIRMED' ? '✅ مؤكد' : '⏳ أولي'}
                    </span>
                  </div>

                  <div className="student-card-details">
                    <a href={`tel:${reg.phone}`} className="student-phone-pill">
                      <span>📞</span>
                      <span dir="ltr">{reg.phone}</span>
                    </a>
                    <span className="student-date-pill">
                      <span>📅</span>
                      <span>
                        {new Date(reg.created_at).toLocaleDateString('ar-DZ', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </span>
                  </div>

                  <div className="student-card-actions">
                    {reg.status === 'PENDING' ? (
                      <button
                        type="button"
                        className="btn btn-success mobile-action-btn"
                        onClick={() => handleConfirm(reg.id)}
                      >
                        ✅ تأكيد التسجيل
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-warning mobile-action-btn"
                        onClick={() => handleUnconfirm(reg.id)}
                      >
                        ↩️ إلغاء التأكيد
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
              ))}
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
