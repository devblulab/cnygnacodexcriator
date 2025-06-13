"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/lib/firebase/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Loader2 } from "lucide-react"
import { getFirebaseFirestore } from "@/lib/firebase/config"

export default function LoginForm() {
  // Carregar email salvo no localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [availableAuthMethods, setAvailableAuthMethods] = useState<string[]>([])
  const [checkedAuthMethods, setCheckedAuthMethods] = useState(false)
  const {
    signIn,
    signInWithGoogle,
    signInWithGithub,
    error: authError,
    checkAuthMethods,
    firebaseInitialized,
  } = useAuth()
  const router = useRouter()

  // Check if Firebase is initialized
  useEffect(() => {
    if (!firebaseInitialized) {
      setError("Firebase is not properly initialized. Please check your environment variables and configuration.")
    } else {
      setError("")
    }
  }, [firebaseInitialized])

  const handleEmailCheck = async () => {
    if (!email || !firebaseInitialized) return

    try {
      const methods = await checkAuthMethods(email)
      setAvailableAuthMethods(methods)
      setCheckedAuthMethods(true)

      if (methods.length === 0) {
        setError("No authentication methods available for this email. You may need to sign up first.")
      } else {
        setError("")
      }
    } catch (error) {
      console.error("Error checking auth methods:", error)
    }
  }

  // Function to create or update the user document in Firestore
  const createOrUpdateUserDocument = async (user: any) => {
    if (!user?.uid) return

    try {
      // Get Firestore instance
      const firestore = await getFirebaseFirestore()
      if (!firestore) {
        console.error("Firestore is not available")
        return
      }

      // Import Firestore functions dynamically
      const { doc, setDoc, getDoc, serverTimestamp } = await import("firebase/firestore")

      const userRef = doc(firestore, "users", user.uid)

      // Check if the document already exists
      const docSnap = await getDoc(userRef)

      if (docSnap.exists()) {
        // Update only lastLogin if the document already exists
        await setDoc(
          userRef,
          {
            lastLogin: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        )
      } else {
        // Create a new document if it doesn't exist
        await setDoc(userRef, {
          email: user.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          role: "user",
          lastLogin: serverTimestamp(),
        })
      }
    } catch (error) {
      console.error("Error creating/updating user document:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!firebaseInitialized) {
      setError("Firebase não está inicializado. Verifique a configuração.")
      return
    }

    if (!email || !password) {
      setError("Digite email e senha.")
      return
    }

    setLoading(true)

    try {
      console.log("Tentando fazer login com email:", email)
      const userCredential = await signIn(email, password, rememberMe)

      if (userCredential?.user) {
        console.log("Login realizado com sucesso:", userCredential.user.uid)

        // Salvar email se "lembrar" estiver marcado
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email)
        } else {
          localStorage.removeItem('rememberedEmail')
        }

        await createOrUpdateUserDocument(userCredential.user)
        
        // Aguardar um pouco para garantir que o cookie foi definido
        await new Promise(resolve => setTimeout(resolve, 500))
        
        console.log("Redirecionando para dashboard...")
        window.location.href = "/dashboard"
      } else {
        setError("Falha no login: Nenhum usuário retornado.")
      }
    } catch (error: any) {
      console.error("Erro de login:", error)

      if (error.code === "auth/invalid-credential" || error.code === "auth/invalid-email" || error.code === "auth/wrong-password") {
        setError("Email ou senha incorretos.")
      } else if (error.code === "auth/user-not-found") {
        setError("Usuário não encontrado. Crie uma conta primeiro.")
      } else if (error.code === "auth/operation-not-allowed") {
        setError("Login por email/senha não está habilitado no Firebase.")
      } else if (error.code === "auth/too-many-requests") {
        setError("Muitas tentativas. Aguarde alguns minutos.")
      } else if (error.code === "auth/network-request-failed") {
        setError("Erro de rede. Verifique sua conexão.")
      } else {
        setError(error.message || "Erro no login.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!firebaseInitialized) {
      setError("Firebase is not properly initialized. Please check your environment variables and configuration.")
      return
    }

    setError("")
    setLoading(true)

    try {
      console.log("Attempting to sign in with Google")
      const result = await signInWithGoogle()

      if (result?.user) {
        console.log("User signed in with Google successfully:", result.user.uid)

        // Get the token and set the session cookie
        const token = await result.user.getIdToken()
        document.cookie = `session=${token}; path=/; max-age=3600; SameSite=Strict;`
        console.log("Session cookie set")

        await createOrUpdateUserDocument(result.user)
      }

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Google sign in error:", error)

      if (error.code === "auth/invalid-credential") {
        setError("Failed to sign in with Google. There might be an issue with the Firebase configuration.")
      } else if (error.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup was closed before completing the sign in.")
      } else if (error.code === "auth/popup-blocked") {
        setError("Sign-in popup was blocked by your browser. Please allow popups for this site.")
      } else if (error.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection and try again.")
      } else {
        setError(error.message || "Failed to sign in with Google")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    if (!firebaseInitialized) {
      setError("Firebase is not properly initialized. Please check your environment variables and configuration.")
      return
    }

    setError("")
    setLoading(true)

    try {
      console.log("Attempting to sign in with GitHub")
      const result = await signInWithGithub()

      if (result?.user) {
        console.log("User signed in with GitHub successfully:", result.user.uid)

        // Get the token and set the session cookie
        const token = await result.user.getIdToken()
        document.cookie = `session=${token}; path=/; max-age=3600; SameSite=Strict;`
        console.log("Session cookie set")

        await createOrUpdateUserDocument(result.user)
      }

      router.push("/dashboard")
    } catch (error: any) {
      console.error("GitHub sign in error:", error)

      if (error.code === "auth/invalid-credential") {
        setError("Failed to sign in with GitHub. There might be an issue with the Firebase configuration.")
      } else if (error.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup was closed before completing the sign in.")
      } else if (error.code === "auth/popup-blocked") {
        setError("Sign-in popup was blocked by your browser. Please allow popups for this site.")
      } else if (error.code === "auth/account-exists-with-different-credential") {
        setError("An account already exists with the same email address but different sign-in credentials.")
      } else if (error.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection and try again.")
      } else {
        setError(error.message || "Failed to sign in with GitHub")
      }
    } finally {
      setLoading(false)
    }
  }

  // Display Firebase initialization errors
  const displayError = error || authError

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access QuantumCode</CardDescription>
      </CardHeader>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {displayError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Authentication Error</AlertTitle>
                  <AlertDescription>{displayError}</AlertDescription>

                  {error && error.includes("Email/password sign-in is not enabled") && (
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
                      <p className="mt-2">Ou tente fazer login com outro método abaixo.</p>
                    </div>
                  )}

                  {error && error.includes("Firebase is not properly initialized") && (
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

                  {error && error.includes("Invalid email or password. If you're sure") && (
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
                        <li>
                          Se você não tem uma conta,{" "}
                          <a href="/signup" className="underline text-blue-500">
                            cadastre-se
                          </a>{" "}
                          primeiro
                        </li>
                      </ol>
                    </div>
                  )}

                  {error && error.includes("No authentication methods available") && (
                    <div className="mt-2 text-sm">
                      <p>This email is not registered. Would you like to create an account?</p>
                      <Button variant="outline" className="mt-2" onClick={() => router.push("/signup")}>
                        Sign Up
                      </Button>
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
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setCheckedAuthMethods(false)
                    setError("")
                  }}
                  onBlur={handleEmailCheck}
                  required
                  disabled={!firebaseInitialized || loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button variant="link" className="p-0 h-auto" type="button">
                    Forgot password?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={!firebaseInitialized || loading}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  disabled={!firebaseInitialized || loading}
                />
                <Label htmlFor="remember-me" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Manter conectado
                </Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={!firebaseInitialized || loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>

        <TabsContent value="providers">
          <CardContent className="space-y-4">
            {displayError && displayError.includes("Google sign-in is not enabled") && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Google Authentication Error</AlertTitle>
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleGoogleSignIn}
                disabled={!firebaseInitialized || loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path
                        fill="#4285F4"
                        d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                      />
                      <path
                        fill="#34A853"
                        d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                      />
                    </g>
                  </svg>
                )}
                Sign in with Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleGithubSignIn}
                disabled={!firebaseInitialized || loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fill="currentColor"
                      d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                    />
                  </svg>
                )}
                Sign in with GitHub
              </Button>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>

      <div className="px-6 pb-4">
        <Separator className="my-4" />
        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/signup")}>
            Sign up
          </Button>
        </div>
      </div>
    </Card>
  )
}
