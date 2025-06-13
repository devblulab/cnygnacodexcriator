
"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth"
import { auth, db } from "./config"
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore"
import { 
  UserRole, 
  UserData 
} from "./users"
import { setSessionCookie, clearSessionCookie } from "../utils/cookies"

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user data from Firestore
  const fetchUserData = async (user: User): Promise<UserData | null> => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (userDoc.exists()) {
        return userDoc.data() as UserData
      }
      return null
    } catch (error) {
      console.error("Error fetching user data:", error)
      return null
    }
  }

  // Create user document in Firestore
  const createUserDocument = async (user: User, additionalData: any = {}) => {
    const userRef = doc(db, "users", user.uid)
    const userData: UserData = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || additionalData.displayName || "",
      photoURL: user.photoURL || "",
      role: UserRole.USER,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...additionalData,
    }

    try {
      await setDoc(userRef, userData, { merge: true })
      return userData
    } catch (error) {
      console.error("Error creating user document:", error)
      throw error
    }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      await setSessionCookie(await result.user.getIdToken())
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, { displayName })
      await createUserDocument(result.user, { displayName })
      await setSessionCookie(await result.user.getIdToken())
    } catch (error) {
      console.error("Sign up error:", error)
      throw error
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: "select_account" })
      const result = await signInWithPopup(auth, provider)
      await createUserDocument(result.user)
      await setSessionCookie(await result.user.getIdToken())
    } catch (error) {
      console.error("Google sign in error:", error)
      throw error
    }
  }

  // Sign in with GitHub
  const signInWithGithub = async () => {
    try {
      const provider = new GithubAuthProvider()
      provider.setCustomParameters({ prompt: "select_account" })
      const result = await signInWithPopup(auth, provider)
      await createUserDocument(result.user)
      await setSessionCookie(await result.user.getIdToken())
    } catch (error) {
      console.error("GitHub sign in error:", error)
      throw error
    }
  }

  // Logout
  const logout = async () => {
    try {
      await signOut(auth)
      await clearSessionCookie()
      setUser(null)
      setUserData(null)
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error("Reset password error:", error)
      throw error
    }
  }

  // Update user profile
  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (!user) throw new Error("No user logged in")

    try {
      await updateProfile(user, { displayName, photoURL })
      await updateDoc(doc(db, "users", user.uid), {
        displayName,
        photoURL: photoURL || user.photoURL,
        updatedAt: serverTimestamp(),
      })
      await refreshUserData()
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    }
  }

  // Refresh user data
  const refreshUserData = async () => {
    if (user) {
      const userData = await fetchUserData(user)
      setUserData(userData)
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      if (user) {
        try {
          let userData = await fetchUserData(user)
          if (!userData) {
            userData = await createUserDocument(user)
          }
          setUserData(userData)
        } catch (error) {
          console.error("Error handling auth state change:", error)
        }
      } else {
        setUserData(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value: AuthContextType = {
    user,
    userData,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithGithub,
    logout,
    resetPassword,
    updateUserProfile,
    refreshUserData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  GithubAuthProvider
} from "firebase/auth"
import { auth, db } from "./config"
import { doc, setDoc, getDoc } from "firebase/firestore"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && db) {
        // Salvar dados do usuário no Firestore
        const userRef = doc(db, "users", user.uid)
        const userSnap = await getDoc(userRef)
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: new Date(),
            lastLogin: new Date()
          })
        } else {
          // Atualizar último login
          await setDoc(userRef, {
            lastLogin: new Date()
          }, { merge: true })
        }
      }
      
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase not initialized")
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase not initialized")
    try {
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error("Sign up error:", error)
      throw error
    }
  }

  const signOut = async () => {
    if (!auth) throw new Error("Firebase not initialized")
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error("Sign out error:", error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    if (!auth) throw new Error("Firebase not initialized")
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error("Google sign in error:", error)
      throw error
    }
  }

  const signInWithGithub = async () => {
    if (!auth) throw new Error("Firebase not initialized")
    try {
      const provider = new GithubAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error("GitHub sign in error:", error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithGithub
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
