export type UserRole = {
  id: number;
  name: string;
  is_admin: boolean;
  is_employee: boolean;
  is_customer: boolean;
};

export type SessionUser = {
  id: number;
  name: string;
  email?: string | null;
  phone_number?: string | null;
  role: UserRole | null;
};

export type Session = {
  token: string;
  user: SessionUser;
};

export const PERMISSIONS = {
  'admin:access': 'Access admin dashboard',
  'transactions:manage': 'Manage order fulfillment',
  'products:manage': 'Manage products and items',
  'categories:manage': 'Manage categories',
} as const;

export type Permission = keyof typeof PERMISSIONS;
