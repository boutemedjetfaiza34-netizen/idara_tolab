import type { Registration, RegistrationGroup } from './types';

// In-memory fallback for environments where fs is not writable (e.g. Vercel serverless)
const memoryStore: Registration[] = [];

let fsModule: typeof import('fs') | null = null;
let pathModule: typeof import('path') | null = null;
let DATA_FILE = '';

function initFs() {
  if (fsModule) return;
  try {
    // Dynamic require to avoid Vercel bundling issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    fsModule = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    pathModule = require('path');
    DATA_FILE = pathModule!.join(process.cwd(), 'data', 'registrations.json');

    // Test write access
    const dir = pathModule!.join(process.cwd(), 'data');
    if (!fsModule!.existsSync(dir)) {
      fsModule!.mkdirSync(dir, { recursive: true });
    }
    if (!fsModule!.existsSync(DATA_FILE)) {
      fsModule!.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch {
    fsModule = null;
  }
}

export function getLocalRegistrations(): Registration[] {
  initFs();
  if (!fsModule) return [...memoryStore];
  try {
    const raw = fsModule.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [...memoryStore];
  }
}

export function findRegistrationByPhone(phone: string, group: RegistrationGroup): Registration | undefined {
  return getLocalRegistrations().find(r => r.phone === phone && r.group === group);
}

export function saveLocalRegistration(item: {
  first_name: string;
  last_name: string;
  phone: string;
  group: RegistrationGroup;
}): { success: true; data: Registration } | { success: false; error: string; existing?: Registration } {
  initFs();
  const list = getLocalRegistrations();

  const duplicate = list.find(r => r.phone === item.phone && r.group === item.group);
  if (duplicate) {
    const groupLabel = item.group === 'GROUP_1' ? 'الفوج 1' : 'الفوج 2';
    return { success: false, error: `هذا الرقم مسجل مسبقًا في ${groupLabel}.`, existing: duplicate };
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
  persist(list);

  return { success: true, data: newRecord };
}

export function updateLocalStatus(id: string, status: 'PENDING' | 'CONFIRMED'): boolean {
  const list = getLocalRegistrations();
  const item = list.find(r => r.id === id);
  if (!item) return false;
  item.status = status;
  item.confirmed_at = status === 'CONFIRMED' ? new Date().toISOString() : null;
  persist(list);

  // Update memory store too
  const memItem = memoryStore.find(r => r.id === id);
  if (memItem) {
    memItem.status = status;
    memItem.confirmed_at = item.confirmed_at;
  }
  return true;
}

export function deleteLocalRegistration(id: string): boolean {
  const list = getLocalRegistrations();
  const newList = list.filter(r => r.id !== id);
  if (newList.length === list.length) return false;
  persist(newList);

  // Update memory store too
  const idx = memoryStore.findIndex(r => r.id === id);
  if (idx !== -1) memoryStore.splice(idx, 1);
  return true;
}

function persist(list: Registration[]) {
  initFs();
  if (!fsModule) {
    // Update in-memory store
    memoryStore.length = 0;
    memoryStore.push(...list);
    return;
  }
  try {
    fsModule.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch {
    // Fallback to memory
    memoryStore.length = 0;
    memoryStore.push(...list);
  }
}
