
// Simple cookie utilities for session management
export function setSessionCookie(token: string, remember: boolean = false) {
  if (typeof window === 'undefined') return

  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 // 30 days or 1 day
  const expires = new Date(Date.now() + maxAge * 1000)
  
  document.cookie = `session-token=${token}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`
}

export function clearSessionCookie() {
  if (typeof window === 'undefined') return

  document.cookie = 'session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
}

export function getSessionCookie(): string | null {
  if (typeof window === 'undefined') return null

  const cookies = document.cookie.split(';')
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'session-token') {
      return value
    }
  }
  return null
}
