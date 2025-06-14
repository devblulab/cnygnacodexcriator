
"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth"
import { auth, db } from "./config"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
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
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user && db) {
        // Get additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData)
          } else {
            // Create user document if it doesn't exist
            const newUserData: UserData = {
              uid: user.uid,
              email: user.email || "",
              displayName: user.displayName || "",
              photoURL: user.photoURL || "",
              role: "user" as UserRole,
              createdAt: new Date(),
              updatedAt: new Date()
            }
            await setDoc(doc(db, "users", user.uid), {
              ...newUserData,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            })
            setUserData(newUserData)
          }

          // Set session cookie
          const token = await user.getIdToken()
          setSessionCookie(token)
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      } else {
        setUserData(null)
        clearSessionCookie()
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase auth not initialized")

    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      console.error("Sign in error:", error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    if (!auth) throw new Error("Firebase auth not initialized")

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)

      if (displayName) {
        await updateProfile(user, { displayName })
      }
    } catch (error: any) {
      console.error("Sign up error:", error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    if (!auth) throw new Error("Firebase auth not initialized")

    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error: any) {
      console.error("Google sign in error:", error)
      throw error
    }
  }

  const signInWithGithub = async () => {
    if (!auth) throw new Error("Firebase auth not initialized")

    try {
      const provider = new GithubAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error: any) {
      console.error("GitHub sign in error:", error)
      throw error
    }
  }

  const logout = async () => {
    if (!auth) throw new Error("Firebase auth not initialized")

    try {
      await signOut(auth)
      clearSessionCookie()
    } catch (error: any) {
      console.error("Logout error:", error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error("Firebase auth not initialized")

    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      console.error("Reset password error:", error)
      throw error
    }
  }

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (!auth?.currentUser) throw new Error("No user logged in")

    try {
      await updateProfile(auth.currentUser, {
        displayName,
        ...(photoURL && { photoURL })
      })

      // Update Firestore document
      if (db) {
        await setDoc(doc(db, "users", auth.currentUser.uid), {
          displayName,
          ...(photoURL && { photoURL }),
          updatedAt: serverTimestamp()
        }, { merge: true })
      }
    } catch (error: any) {
      console.error("Update profile error:", error)
      throw error
    }
  }

  const value = {
    user,
    userData,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithGithub,
    logout,
    resetPassword,
    updateUserProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
