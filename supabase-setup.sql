-- =============================================
-- نظام تسجيل دروس الدعم — بوتمجت فايزة
-- شغّل هذا الكود في Supabase SQL Editor
-- =============================================

-- إنشاء جدول التسجيلات
CREATE TABLE IF NOT EXISTS registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  "group" TEXT NOT NULL CHECK ("group" IN ('GROUP_1', 'GROUP_2')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- منع التسجيل المكرر (نفس رقم الهاتف في نفس الفوج)
CREATE UNIQUE INDEX IF NOT EXISTS unique_phone_group 
  ON registrations(phone, "group");

-- تفعيل Row Level Security
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- السماح للطلاب بالتسجيل (INSERT) فقط بدون قراءة
CREATE POLICY "allow_student_insert" ON registrations
  FOR INSERT
  WITH CHECK (true);

-- ملاحظة: عمليات القراءة والتحديث والحذف تتم عبر Service Role Key فقط
-- وهو محفوظ في Server-side فقط ولا يظهر في الـ Frontend أبداً
