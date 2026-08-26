import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import RegisterForm from './RegisterForm';
import type { RegistrationGroup } from '@/lib/types';

const GROUP_MAP: Record<string, { group: RegistrationGroup; label: string; number: 1 | 2 }> = {
  'group-1': { group: 'GROUP_1', label: 'الفوج 1', number: 1 },
  'group-2': { group: 'GROUP_2', label: 'الفوج 2', number: 2 },
};

interface Props {
  params: Promise<{ group: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { group } = await params;
  const groupInfo = GROUP_MAP[group];
  if (!groupInfo) return {};
  return {
    title: `تأكيد تسجيل القائمة الاحتياطية — ${groupInfo.label} | دروس الدعم`,
    description: `تأكيد تسجيل القائمة الاحتياطية في ${groupInfo.label} لدروس الدعم في العلوم الطبيعية مع الأستاذة بوتمجت فايزة.`,
  };
}

export default async function RegisterPage({ params }: Props) {
  const { group } = await params;
  const groupInfo = GROUP_MAP[group];

  if (!groupInfo) {
    notFound();
  }

  return (
    <RegisterForm
      group={groupInfo.group}
      groupLabel={groupInfo.label}
      groupNumber={groupInfo.number}
    />
  );
}
