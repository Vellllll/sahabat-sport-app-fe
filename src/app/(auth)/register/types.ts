export interface RegisterFields {
  name?: string;
  email_or_phone_number?: string;
  password?: string;
  password_confirmation?: string;
}

export interface RegisterState {
  success: boolean;
  error?: string | null;
  message?: string | null;
  fields?: RegisterFields;
  timestamp?: number;
}