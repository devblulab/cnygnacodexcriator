
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
export function setSessionCookie(name: string, value: string, days = 7) {
  if (typeof window === 'undefined') return
  
  const date = new Date()
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
  const expires = `expires=${date.toUTCString()}`
  document.cookie = `${name}=${value};${expires};path=/`
}

export function clearSessionCookie(name: string) {
  if (typeof window === 'undefined') return
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
}

export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null
  
  const nameEQ = name + "="
  const ca = document.cookie.split(';')
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}
