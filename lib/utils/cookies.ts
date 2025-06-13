export function setSessionCookie(token: string, persistent: boolean = false) {
  const maxAge = persistent ? 60 * 60 * 24 * 30 : 60 * 60 // 30 dias ou 1 hora
  const secure = window.location.protocol === 'https:' ? 'Secure' : ''

  document.cookie = `session=${token}; path=/; max-age=${maxAge}; SameSite=Strict; ${secure}`
  console.log(`Session cookie set (persistent: ${persistent})`)
}

export function clearSessionCookie() {
  document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict'
  console.log('Session cookie cleared')
}

export function getSessionCookie(): string | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'session') {
      return value
    }
  }
  return null
}

// Função para verificar se há cookie de sessão válido
export const hasValidSessionCookie = (): boolean => {
  const session = getSessionCookie()
  return session !== null && session.length > 10
}