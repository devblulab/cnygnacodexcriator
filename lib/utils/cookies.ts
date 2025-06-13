
// Função para definir cookie de sessão
export const setSessionCookie = (token: string, rememberMe: boolean = false) => {
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 // 30 dias ou 1 dia
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'Secure;' : ''
  
  if (typeof document !== 'undefined') {
    document.cookie = `session=${token}; path=/; max-age=${maxAge}; SameSite=Strict; ${secure}`
  }
}

// Função para limpar cookie de sessão
export const clearSessionCookie = () => {
  if (typeof document !== 'undefined') {
    document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
  }
}

// Função para obter cookie de sessão
export const getSessionCookie = (): string | null => {
  if (typeof document === 'undefined') {
    return null
  }

  const cookies = document.cookie.split(';')
  for (let cookie of cookies) {
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
