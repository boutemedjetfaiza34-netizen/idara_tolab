export type RegistrationGroup = 'GROUP_1' | 'GROUP_2';
export type RegistrationStatus = 'PENDING' | 'CONFIRMED';

export interface Registration {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  group: RegistrationGroup;
  status: RegistrationStatus;
  created_at: string;
  confirmed_at: string | null;
}

export interface Stats {
  total: number;
  group1Total: number;
  group2Total: number;
  pendingTotal: number;
  confirmedTotal: number;
  group1Pending: number;
  group1Confirmed: number;
  group2Pending: number;
  group2Confirmed: number;
}

export interface RegisterFormData {
  first_name: string;
  last_name: string;
  phone: string;
  group: RegistrationGroup;
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
