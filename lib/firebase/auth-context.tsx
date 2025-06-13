"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { auth } from "./config"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth"
import { 
  createUserInFirestore, 
  getUserByUid, 
  updateUserLastLogin,
  UserData 
} from "./users"

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  signUp: (email: string, password: string, displayName?: string) => Promise<User>
  signIn: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        try {
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
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error)
          setUserData(null)
        }
      } else {
        setUserData(null)
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

const signIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)

    // Atualizar último login
    await updateUserLastLogin(userCredential.user.uid)

    return userCredential.user
  }

  const logout = () => {
    return signOut(auth)
  }

  const value = {
    user,
    userData,
    loading,
    signUp,
    signIn,
    logout,
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