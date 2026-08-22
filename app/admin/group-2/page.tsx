import type { Metadata } from 'next';
import { getRegistrations } from '@/app/actions';
import GroupTable from '../GroupTable';

export const metadata: Metadata = {
  title: 'الفوج 2 — لوحة الإدارة',
};

export const dynamic = 'force-dynamic';

export default async function Group2Page() {
  const result = await getRegistrations('GROUP_2');

  if (!result.success) {
    return (
      <div className="alert alert-error">
        <span>⚠️</span>
        <span>فشل تحميل بيانات الفوج 2: {result.error}</span>
      </div>
    );
  }

  return (
    <GroupTable
      registrations={result.data}
      group="GROUP_2"
      groupNumber={2}
      groupLabel="الفوج 2"
    />
  );
}
