import type { Metadata } from 'next';
import { getRegistrations } from '@/app/actions';
import GroupTable from '../GroupTable';

export const metadata: Metadata = {
  title: 'الفوج 1 — لوحة الإدارة',
};

export const dynamic = 'force-dynamic';

export default async function Group1Page() {
  const result = await getRegistrations('GROUP_1');

  if (!result.success) {
    return (
      <div className="alert alert-error">
        <span>⚠️</span>
        <span>فشل تحميل بيانات الفوج 1: {result.error}</span>
      </div>
    );
  }

  return (
    <GroupTable
      registrations={result.data}
      group="GROUP_1"
      groupNumber={1}
      groupLabel="الفوج 1"
    />
  );
}
