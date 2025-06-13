"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { auth } from "./config"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  fetchSignInMethodsForEmail
} from "firebase/auth"
import { 
  createUserInFirestore, 
  getUserByUid, 
  updateUserLastLogin,
  UserData 
} from "./users"
import { setSessionCookie, clearSessionCookie } from "../utils/cookies"

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  firebaseInitialized: boolean
  isAdmin: boolean
  error: string | null
  signUp: (email: string, password: string, displayName?: string) => Promise<User>
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<any>
  signInWithGoogle: () => Promise<any>
  signInWithGithub: () => Promise<any>
  logout: () => Promise<void>
  checkAuthMethods: (email: string) => Promise<string[]>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [firebaseInitialized, setFirebaseInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)

  useEffect(() => {
    // Verificar se estamos no cliente e se o Firebase está inicializado
    if (typeof window === 'undefined') {
      return
    }

    if (!auth) {
      setError("Firebase Auth não está inicializado")
      setLoading(false)
      return
    }

    setFirebaseInitialized(true)
    setError(null)

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user?.uid || "No user")
      setUser(user)

      if (user) {
        try {
          // Definir cookie de sessão
          const token = await user.getIdToken()
          setSessionCookie(token, false)

          // Buscar dados do usuário no Firestore
          let firestoreUser = await getUserByUid(user.uid)

          // Se o usuário não existe no Firestore, criar
          if (!firestoreUser) {
            firestoreUser = await createUserInFirestore(user.uid, {
              email: user.email || '',
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
              emailVerified: user.emailVerified
            })
          } else {
            // Atualizar último login
            await updateUserLastLogin(user.uid)
          }

          setUserData(firestoreUser)
          setIsAdmin(firestoreUser?.role === 'admin')
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error)
          setUserData(null)
          setIsAdmin(false)
        }
      } else {
        setUserData(null)
        // Limpar cookie de sessão quando não há usuário
        clearSessionCookie()
        setIsAdmin(false)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

const signUp = async (email: string, password: string, displayName?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    // Criar documento do usuário no Firestore
    await createUserInFirestore(userCredential.user.uid, {
      email,
      displayName: displayName || '',
      photoURL: '',
      emailVerified: userCredential.user.emailVerified
    })

    return userCredential.user
  }

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      // Configurar persistência baseada na escolha do usuário
      if (rememberMe) {
        await setPersistence(auth, browserLocalPersistence)
      } else {
        await setPersistence(auth, browserSessionPersistence)
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      if (userCredential?.user) {
        // Atualizar último login
        await updateUserLastLogin(userCredential.user.uid)
        return userCredential
      } else {
        throw new Error("No user returned from authentication")
      }
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      return result
    } catch (error) {
      console.error("Google sign in error:", error)
      throw error
    }
  }

  const signInWithGithub = async () => {
    try {
      const provider = new GithubAuthProvider()
      const result = await signInWithPopup(auth, provider)
      return result
    } catch (error) {
      console.error("GitHub sign in error:", error)
      throw error
    }
  }

  const checkAuthMethods = async (email: string) => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email)
      return methods
    } catch (error) {
      console.error("Error checking auth methods:", error)
      return []
    }
  }

  const logout = async () => {
    try {
      // Limpar cookie de sessão
      clearSessionCookie()
      await signOut(auth)
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }

  const value = {
    user,
    userData,
    loading,
    firebaseInitialized,
    isAdmin,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGithub,
    logout,
    checkAuthMethods,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}