import { backendJson } from '@/lib/backend-api'

export type AuthUser = {
  id: number
  username: string
  fullName: string
  email: string | null
  phone: string | null
  role: string
}

export function countLetters(value: string): number {
  const matches = value.match(/\p{L}/gu)
  return matches ? matches.length : 0
}

export function validateFullName(fullName: string): string | null {
  const trimmed = fullName.trim()
  if (!trimmed) {
    return 'Họ tên không được để trống'
  }
  if (countLetters(trimmed) < 2) {
    return 'Họ tên phải có ít nhất 2 chữ cái'
  }
  return null
}

export async function fetchProfile(): Promise<AuthUser> {
  const data = await backendJson<{ user: AuthUser }>('/auth/profile')
  return data.user
}

export type UpdateProfilePayload = {
  fullName: string
  email: string
  phone: string
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
  const data = await backendJson<{ message: string; user: AuthUser }>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return data.user
}

export const AUTH_SESSION_CHANGED_EVENT = 'auth:user-changed'

function dispatchAuthSessionChangedEvent() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT))
}

export function saveUserToStorage(user: AuthUser) {
  localStorage.setItem('user', JSON.stringify(user))
  dispatchAuthSessionChangedEvent()
}

export function saveTokenToStorage(token: string) {
  localStorage.setItem('token', token)
}

export function removeAuthSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  dispatchAuthSessionChangedEvent()
}

export function readUserFromStorage(): AuthUser | null {
  const raw = localStorage.getItem('user')
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function readTokenFromStorage(): string | null {
  return localStorage.getItem('token')
}

export function requireAuthSession(): { token: string; user: AuthUser } | null {
  const token = readTokenFromStorage()
  const user = readUserFromStorage()
  if (!token || !user) return null
  return { token, user }
}
