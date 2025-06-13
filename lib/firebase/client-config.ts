
"use client"

import { auth, db } from './config'

// Verificar se o Firebase está inicializado
export const isFirebaseInitialized = () => {
  return auth !== null && db !== null
}

// Função para aguardar a inicialização do Firebase
export const waitForFirebaseInit = async (timeout = 10000): Promise<boolean> => {
  return new Promise((resolve) => {
    if (isFirebaseInitialized()) {
      resolve(true)
      return
    }

    const startTime = Date.now()
    const checkInterval = setInterval(() => {
      if (isFirebaseInitialized()) {
        clearInterval(checkInterval)
        resolve(true)
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval)
        resolve(false)
      }
    }, 100)
  })
}

// Função para verificar se o usuário está autenticado
export const checkAuthStatus = async () => {
  if (!isFirebaseInitialized()) {
    return false
  }

  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe()
      resolve(!!user)
    })
  })
}

export { auth, db }
