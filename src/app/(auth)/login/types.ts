export interface LoginFields {
    email_or_phone_number?: string;
}

export interface LoginState {
    success?: boolean;
    error?: string | null;
    fields?: LoginFields;
    timestamp?: number;
}