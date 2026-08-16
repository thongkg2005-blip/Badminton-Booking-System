const BACKEND_BASE_URL = '/backend-api'

export function backendUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${BACKEND_BASE_URL}${normalizedPath}`
}

export async function backendJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const response = await fetch(backendUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const raw = await response.text()
    let message = raw
    try {
      const parsed = JSON.parse(raw) as { message?: string; error?: string }
      message = parsed.message || parsed.error || raw
    } catch {
      message = raw
    }
    throw new Error(message || `Request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}
