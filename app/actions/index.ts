'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getDirectSupabase } from '@/lib/supabase/server';
import {
  getLocalRegistrations,
  saveLocalRegistration,
  updateLocalStatus,
  deleteLocalRegistration,
  findRegistrationByPhone,
} from '@/lib/db';
import type { Registration, RegisterFormData, ActionResult, RegistrationGroup, Stats } from '@/lib/types';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'boutemedjetfaiza34@gmail.com';
const ADMIN_PASS = process.env.ADMIN_PASSWORD ?? 'PRbou123123';
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

  const groupLabel = group === 'GROUP_1' ? 'الفوج 1' : 'الفوج 2';
  const supabase = getDirectSupabase();

  // 1. Supabase Mode (Primary)
  if (supabase) {
    try {
      // Check if student already registered in this group
      const { data: existingRecords } = await supabase
        .from('registrations')
        .select('*')
        .eq('phone', cleanPhone)
        .eq('group', group);

      if (existingRecords && existingRecords.length > 0) {
        return {
          success: false,
          error: `هذا الرقم مسجل مسبقًا في ${groupLabel}.`,
          alreadyRegistered: true,
          existingRegistration: existingRecords[0] as Registration,
        };
      }

      // Insert new record into Supabase
      const { data: inserted, error: insertError } = await supabase
        .from('registrations')
        .insert({
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          phone: cleanPhone,
          group,
          status: 'PENDING',
        })
        .select();

      if (insertError) {
        if (insertError.code === '23505') {
          return {
            success: false,
            error: `هذا الرقم مسجل مسبقًا في ${groupLabel}.`,
            alreadyRegistered: true,
          };
        }
        console.error('Supabase insert error:', insertError);
      } else {
        // Also save to local as backup
        saveLocalRegistration({
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          phone: cleanPhone,
          group,
        });

        try {
          revalidatePath('/admin', 'layout');
        } catch {
          // ignore
        }

        return { success: true, data: { group } };
      }
    } catch (err) {
      console.error('Supabase exception in registerStudent:', err);
    }
  }

  // 2. Local Fallback Mode
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

  try {
    revalidatePath('/admin', 'layout');
  } catch {
    // ignore
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
  const supabase = getDirectSupabase();

  if (supabase) {
    try {
      const { data } = await supabase
        .from('registrations')
        .select('*')
        .eq('phone', cleanPhone)
        .eq('group', group);

      if (data && data.length > 0) {
        return { exists: true, registration: data[0] as Registration };
      }
      return { exists: false };
    } catch {
      // fallback
    }
  }

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
  const supabase = getDirectSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('group', group)
        .order('created_at', { ascending: false });

      if (!error && data !== null) {
        return { success: true, data: data as Registration[] };
      }
      console.error('getRegistrations error from Supabase:', error);
    } catch (err) {
      console.error('getRegistrations exception:', err);
    }
  }

  // Local persistent DB fallback
  const records = getLocalRegistrations().filter(r => r.group === group);
  return { success: true, data: records };
}

export async function getStats(): Promise<ActionResult<Stats>> {
  const supabase = getDirectSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase.from('registrations').select('group, status');
      if (!error && data !== null) {
        const all = data as { group: RegistrationGroup; status: string }[];
        return {
          success: true,
          data: {
            total: all.length,
            group1Total: all.filter(r => r.group === 'GROUP_1').length,
            group2Total: all.filter(r => r.group === 'GROUP_2').length,
            pendingTotal: all.filter(r => r.status === 'PENDING').length,
            confirmedTotal: all.filter(r => r.status === 'CONFIRMED').length,
            group1Pending: all.filter(r => r.group === 'GROUP_1' && r.status === 'PENDING').length,
            group1Confirmed: all.filter(r => r.group === 'GROUP_1' && r.status === 'CONFIRMED').length,
            group2Pending: all.filter(r => r.group === 'GROUP_2' && r.status === 'PENDING').length,
            group2Confirmed: all.filter(r => r.group === 'GROUP_2' && r.status === 'CONFIRMED').length,
          },
        };
      }
      console.error('getStats Supabase error:', error);
    } catch (err) {
      console.error('getStats exception:', err);
    }
  }

  const allRecords = getLocalRegistrations();
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
  const supabase = getDirectSupabase();

  // 1. Supabase Update
  if (supabase) {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status: 'CONFIRMED', confirmed_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Supabase confirm error:', error);
        return { success: false, error: 'فشل تأكيد التسجيل في قاعدة البيانات.' };
      }
    } catch (err) {
      console.error('Supabase confirm exception:', err);
    }
  }

  // 2. Local fallback update
  updateLocalStatus(id, 'CONFIRMED');

  try {
    revalidatePath('/admin', 'layout');
  } catch {
    // ignore
  }

  return { success: true, data: undefined };
}

export async function unconfirmRegistration(id: string): Promise<ActionResult> {
  const supabase = getDirectSupabase();

  // 1. Supabase Update
  if (supabase) {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status: 'PENDING', confirmed_at: null })
        .eq('id', id);

      if (error) {
        console.error('Supabase unconfirm error:', error);
        return { success: false, error: 'فشل إلغاء التأكيد في قاعدة البيانات.' };
      }
    } catch (err) {
      console.error('Supabase unconfirm exception:', err);
    }
  }

  // 2. Local fallback update
  updateLocalStatus(id, 'PENDING');

  try {
    revalidatePath('/admin', 'layout');
  } catch {
    // ignore
  }

  return { success: true, data: undefined };
}

export async function deleteRegistration(id: string): Promise<ActionResult> {
  const supabase = getDirectSupabase();

  // 1. Supabase Delete
  if (supabase) {
    try {
      const { error } = await supabase.from('registrations').delete().eq('id', id);

      if (error) {
        console.error('Supabase delete error:', error);
        return { success: false, error: 'فشل حذف التسجيل من قاعدة البيانات.' };
      }
    } catch (err) {
      console.error('Supabase delete exception:', err);
    }
  }

  // 2. Local fallback delete
  deleteLocalRegistration(id);

  try {
    revalidatePath('/admin', 'layout');
  } catch {
    // ignore
  }

  return { success: true, data: undefined };
}

export async function adminSignIn(
  email: string,
  password: string
): Promise<ActionResult> {
  const cleanEmail = email.trim().toLowerCase();

  // Instant authentication for admin credentials
  if (cleanEmail === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASS) {
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

  return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
}

export async function adminSignOut(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
