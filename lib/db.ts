import fs from 'fs';
import path from 'path';
import type { Registration, RegistrationGroup } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'registrations.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function getLocalRegistrations(): Registration[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function findRegistrationByPhone(phone: string, group: RegistrationGroup): Registration | undefined {
  const list = getLocalRegistrations();
  return list.find(r => r.phone === phone && r.group === group);
}

export function saveLocalRegistration(item: {
  first_name: string;
  last_name: string;
  phone: string;
  group: RegistrationGroup;
}): { success: true; data: Registration } | { success: false; error: string; existing?: Registration } {
  ensureDataFile();
  const list = getLocalRegistrations();

  // Check duplicate phone in same group
  const duplicate = list.find(
    r => r.phone === item.phone && r.group === item.group
  );

  if (duplicate) {
    const groupLabel = item.group === 'GROUP_1' ? 'الفوج 1' : 'الفوج 2';
    return {
      success: false,
      error: `هذا الرقم مسجل مسبقًا في ${groupLabel}.`,
      existing: duplicate,
    };
  }

  const newRecord: Registration = {
    id: 'reg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    first_name: item.first_name,
    last_name: item.last_name,
    phone: item.phone,
    group: item.group,
    status: 'PENDING',
    created_at: new Date().toISOString(),
    confirmed_at: null,
  };

  list.unshift(newRecord);
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');

  return { success: true, data: newRecord };
}

export function updateLocalStatus(id: string, status: 'PENDING' | 'CONFIRMED'): boolean {
  ensureDataFile();
  const list = getLocalRegistrations();
  const item = list.find(r => r.id === id);
  if (!item) return false;

  item.status = status;
  item.confirmed_at = status === 'CONFIRMED' ? new Date().toISOString() : null;

  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  return true;
}

export function deleteLocalRegistration(id: string): boolean {
  ensureDataFile();
  let list = getLocalRegistrations();
  const initialLen = list.length;
  list = list.filter(r => r.id !== id);
  if (list.length === initialLen) return false;

  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  return true;
}
