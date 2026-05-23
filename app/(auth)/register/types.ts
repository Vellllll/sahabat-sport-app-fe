export type RegisterFields = {
  name: string
  email_or_phone_number: string
  password: string
  password_confirmation: string
}

export type RegisterState = {
  success: boolean
  error?: string
  message?: string
  fields?: Partial<RegisterFields>
}