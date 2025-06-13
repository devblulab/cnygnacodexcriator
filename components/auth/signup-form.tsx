"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import { getFirebaseApp, getFirebaseFirestore } from "@/lib/firebase/config"

export default function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { firebaseInitialized } = useAuth()

  // Check if Firebase is initialized
  useEffect(() => {
    if (!firebaseInitialized) {
      setError("Firebase is not properly initialized. Please check your environment variables and configuration.")
    } else {
      setError("")
    }
  }, [firebaseInitialized])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!firebaseInitialized) {
      setError("Firebase is not properly initialized. Please check your environment variables and configuration.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setLoading(true)

    try {
      console.log("Attempting to create user with email:", email)

      // Ensure Firebase is initialized
      const app = getFirebaseApp()
      if (!app) {
        throw new Error("Failed to initialize Firebase")
      }

      // Dynamically import Firebase auth
      const { getAuth, createUserWithEmailAndPassword } = await import("firebase/auth")
      const auth = getAuth(app)

      // 1. Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      console.log("User created successfully:", user.uid)

      // 2. Create a document in the "users" collection with the same user ID
      try {
        // Get Firestore instance
        const firestore = await getFirebaseFirestore()
        if (!firestore) {
          console.warn("Firestore is not available, skipping user document creation")
        } else {
          // Dynamically import Firestore
          const { doc, setDoc, serverTimestamp } = await import("firebase/firestore")

          await setDoc(doc(firestore, "users", user.uid), {
            email: user.email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            displayName: user.displayName || "",
            photoURL: user.photoURL || "",
            role: "user", // Default role
            lastLogin: serverTimestamp(),
          })
          console.log("User document created in Firestore")
        }
      } catch (firestoreError: any) {
        console.error("Error creating user document:", firestoreError)
        // Continue even if Firestore fails - the user is still created in Auth
      }

      // 3. Set the session cookie manually
      try {
        const token = await user.getIdToken()
        document.cookie = `session=${token}; path=/; max-age=3600; SameSite=Strict;`
        console.log("Session cookie set")
      } catch (tokenError) {
        console.error("Error setting session cookie:", tokenError)
      }

      // 4. Redirect to the dashboard
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Signup error:", error)

      if (error.code === "auth/invalid-credential") {
        setError(
          "Invalid credentials. This could be due to an issue with Firebase configuration or network connectivity.",
        )
      } else if (error.code === "auth/email-already-in-use") {
        setError("This email is already in use. Please try signing in instead.")
      } else if (error.code === "auth/invalid-email") {
        setError("The email address is not valid.")
      } else if (error.code === "auth/weak-password") {
        setError("The password is too weak. Please use a stronger password.")
      } else if (error.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection and try again.")
      } else if (error.code === "auth/operation-not-allowed") {
        setError("Email/password sign-up is not enabled for this project. Please contact the administrator.")
      } else {
        setError(error.message || "Failed to sign up. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>Sign up to start using QuantumCode</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>

              {error.includes("Email/password sign-up is not enabled") && (
                <div className="mt-2 text-sm">
                  <p className="font-semibold">Como resolver:</p>
                  <ol className="list-decimal pl-4 mt-1">
                    <li>
                      Acesse o{" "}
                      <a
                        href="https://console.firebase.google.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-500"
                      >
                        Console do Firebase
                      </a>
                    </li>
                    <li>Vá para Authentication → Sign-in method</li>
                    <li>Clique em "Email/Password" na lista de provedores</li>
                    <li>Ative a opção "Enable" e salve</li>
                  </ol>
                </div>
              )}

              {error.includes("Firebase is not properly initialized") && (
                <div className="mt-2 text-sm">
                  <p className="font-semibold">Possíveis soluções:</p>
                  <ol className="list-decimal pl-4 mt-1">
                    <li>Verifique se as variáveis de ambiente do Firebase estão configuradas corretamente</li>
                    <li>
                      Acesse a página{" "}
                      <a href="/debug/env" className="underline text-blue-500">
                        /debug/env
                      </a>{" "}
                      para verificar a configuração
                    </li>
                    <li>
                      Verifique se o Firebase está configurado corretamente na{" "}
                      <a href="/debug/firebase" className="underline text-blue-500">
                        página de debug do Firebase
                      </a>
                    </li>
                  </ol>
                </div>
              )}

              {error.includes("Invalid credentials") && (
                <div className="mt-2 text-sm">
                  <p className="font-semibold">Possíveis soluções:</p>
                  <ol className="list-decimal pl-4 mt-1">
                    <li>Verifique se as variáveis de ambiente do Firebase estão configuradas corretamente</li>
                    <li>
                      Acesse a página{" "}
                      <a href="/debug/env" className="underline text-blue-500">
                        /debug/env
                      </a>{" "}
                      para verificar a configuração
                    </li>
                    <li>
                      Verifique se o método de autenticação por email/senha está habilitado no console do Firebase
                    </li>
                    <li>Tente usar outro navegador ou limpar os cookies</li>
                  </ol>
                </div>
              )}
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!firebaseInitialized || loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={!firebaseInitialized || loading}
            />
            <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={!firebaseInitialized || loading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={!firebaseInitialized || loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/login")}>
              Sign in
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
