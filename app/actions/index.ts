'use server';

import { cookies } from 'next/headers';
import { createClient, createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import {
  getLocalRegistrations,
  saveLocalRegistration,
  updateLocalStatus,
  deleteLocalRegistration,
  findRegistrationByPhone,
} from '@/lib/db';
import type { Registration, RegisterFormData, ActionResult, RegistrationGroup, Stats } from '@/lib/types';

const ADMIN_EMAIL = 'boutemedjetfaiza34@gmail.com';
const ADMIN_PASS = 'PRbou123123';
const SESSION_COOKIE = 'boutimjit_admin_session';

export type RegisterResult =
  | { success: true; data: { group: RegistrationGroup } }
  | {
      success: false;
      error: string;
      alreadyRegistered?: boolean;
      existingRegistration?: Registration;
    };

// =======================================
// Student Registration (Public)
// =======================================

export async function registerStudent(
  formData: RegisterFormData
): Promise<RegisterResult> {
  const { first_name, last_name, phone, group } = formData;

  // Validate
  if (!first_name.trim() || !last_name.trim() || !phone.trim()) {
    return { success: false, error: 'جميع الحقول مطلوبة.' };
  }

  const cleanPhone = phone.replace(/\s/g, '').trim();
  const phoneRegex = /^(05|06|07)[0-9]{8}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return { success: false, error: 'رقم الهاتف غير صحيح. يجب أن يبدأ بـ 05 أو 06 أو 07 ويتكون من 10 أرقام.' };
  }

  if (!['GROUP_1', 'GROUP_2'].includes(group)) {
    return { success: false, error: 'الفوج غير صحيح.' };
  }

  // 1. Always check & save in local persistent DB
  const localResult = saveLocalRegistration({
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    phone: cleanPhone,
    group,
  });

  if (!localResult.success) {
    return {
      success: false,
      error: localResult.error,
      alreadyRegistered: true,
      existingRegistration: localResult.existing,
    };
  }

  // 2. Also save to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('registrations').insert({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        phone: cleanPhone,
        group,
        status: 'PENDING',
      });

      if (error && error.code === '23505') {
        const existing = findRegistrationByPhone(cleanPhone, group);
        const groupLabel = group === 'GROUP_1' ? 'الفوج 1' : 'الفوج 2';
        return {
          success: false,
          error: `هذا الرقم مسجل مسبقًا في ${groupLabel}.`,
          alreadyRegistered: true,
          existingRegistration: existing,
        };
      }
    } catch (err) {
      console.warn('Supabase sync error (saved locally):', err);
    }
  }

  return { success: true, data: { group } };
}

// =======================================
// Check Student Status (Public)
// =======================================

export async function checkStudentRegistration(
  phone: string,
  group: RegistrationGroup
): Promise<{ exists: boolean; registration?: Registration }> {
  const cleanPhone = phone.replace(/\s/g, '').trim();
  const existing = findRegistrationByPhone(cleanPhone, group);
  if (existing) {
    return { exists: true, registration: existing };
  }
  return { exists: false };
}

// =======================================
// Admin Actions (Protected)
// =======================================

export async function getRegistrations(group: RegistrationGroup): Promise<ActionResult<Registration[]>> {
  let records: Registration[] = [];

  // Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createAdminClient();
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('group', group)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return { success: true, data: data as Registration[] };
      }
    } catch {
      // fallback to local
    }
  }

  // Local persistent DB fallback
  records = getLocalRegistrations().filter(r => r.group === group);
  return { success: true, data: records };
}

export async function getStats(): Promise<ActionResult<Stats>> {
  let allRecords: { group: RegistrationGroup; status: string }[] = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createAdminClient();
      const { data, error } = await supabase.from('registrations').select('group, status');
      if (!error && data && data.length > 0) {
        allRecords = data as { group: RegistrationGroup; status: string }[];
      }
    } catch {
      // fallback to local
    }
  }

  if (allRecords.length === 0) {
    allRecords = getLocalRegistrations();
  }

  const stats: Stats = {
    total: allRecords.length,
    group1Total: allRecords.filter(r => r.group === 'GROUP_1').length,
    group2Total: allRecords.filter(r => r.group === 'GROUP_2').length,
    pendingTotal: allRecords.filter(r => r.status === 'PENDING').length,
    confirmedTotal: allRecords.filter(r => r.status === 'CONFIRMED').length,
    group1Pending: allRecords.filter(r => r.group === 'GROUP_1' && r.status === 'PENDING').length,
    group1Confirmed: allRecords.filter(r => r.group === 'GROUP_1' && r.status === 'CONFIRMED').length,
    group2Pending: allRecords.filter(r => r.group === 'GROUP_2' && r.status === 'PENDING').length,
    group2Confirmed: allRecords.filter(r => r.group === 'GROUP_2' && r.status === 'CONFIRMED').length,
  };

  return { success: true, data: stats };
}

export async function confirmRegistration(id: string): Promise<ActionResult> {
  // Update local
  updateLocalStatus(id, 'CONFIRMED');

  // Update Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createAdminClient();
      await supabase
        .from('registrations')
        .update({ status: 'CONFIRMED', confirmed_at: new Date().toISOString() })
        .eq('id', id);
    } catch {
      // ignore
    }
  }

  return { success: true, data: undefined };
}

export async function unconfirmRegistration(id: string): Promise<ActionResult> {
  // Update local
  updateLocalStatus(id, 'PENDING');

  // Update Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createAdminClient();
      await supabase
        .from('registrations')
        .update({ status: 'PENDING', confirmed_at: null })
        .eq('id', id);
    } catch {
      // ignore
    }
  }

  return { success: true, data: undefined };
}

export async function deleteRegistration(id: string): Promise<ActionResult> {
  // Delete local
  deleteLocalRegistration(id);

  // Delete Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createAdminClient();
      await supabase.from('registrations').delete().eq('id', id);
    } catch {
      // ignore
    }
  }

  return { success: true, data: undefined };
}

export async function adminSignIn(
  email: string,
  password: string
): Promise<ActionResult> {
  const cleanEmail = email.trim().toLowerCase();

  // Instant authentication for admin credentials
  if (cleanEmail === ADMIN_EMAIL && password === ADMIN_PASS) {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, 'admin_authenticated_' + Date.now(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true, data: undefined };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });

    if (error) {
      return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
    }

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, 'admin_authenticated_' + Date.now(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true, data: undefined };
  } catch {
    return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
  }
}

export async function adminSignOut(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
