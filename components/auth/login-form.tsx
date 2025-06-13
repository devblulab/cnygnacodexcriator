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
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Loader2 } from "lucide-react"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { signIn, signInWithGoogle, signInWithGithub, firebaseInitialized } = useAuth()
  const router = useRouter()

  // Carregar email salvo
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!firebaseInitialized) {
      setError("Firebase não está inicializado. Aguarde um momento e tente novamente.")
      return
    }

    if (!email || !password) {
      setError("Digite email e senha.")
      return
    }

    setLoading(true)

    try {
      console.log("Tentando fazer login com:", email)
      const result = await signIn(email, password, rememberMe)

      if (result?.user) {
        console.log("Login realizado com sucesso:", result.user.uid)

        // Salvar/remover email baseado na opção "lembrar"
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email)
        } else {
          localStorage.removeItem('rememberedEmail')
        }

        // Forçar redirecionamento
        console.log("Redirecionando para dashboard...")
        window.location.href = "/dashboard"
      } else {
        setError("Falha no login: Nenhum usuário retornado.")
      }
    } catch (error: any) {
      console.error("Erro de login:", error)

      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
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
      setError("Firebase não está inicializado.")
      return
    }

    setError("")
    setLoading(true)

    try {
      console.log("Tentando login com Google...")
      const result = await signInWithGoogle()

      if (result?.user) {
        console.log("Login com Google realizado:", result.user.uid)
        window.location.href = "/dashboard"
      }
    } catch (error: any) {
      console.error("Erro no login com Google:", error)

      if (error.code === "auth/popup-closed-by-user") {
        setError("Popup foi fechado. Tente novamente.")
      } else if (error.code === "auth/popup-blocked") {
        setError("Popup foi bloqueado pelo navegador. Permita popups para este site.")
      } else {
        setError(error.message || "Erro no login com Google.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    if (!firebaseInitialized) {
      setError("Firebase não está inicializado.")
      return
    }

    setError("")
    setLoading(true)

    try {
      console.log("Tentando login com GitHub...")
      const result = await signInWithGithub()

      if (result?.user) {
        console.log("Login com GitHub realizado:", result.user.uid)
        window.location.href = "/dashboard"
      }
    } catch (error: any) {
      console.error("Erro no login com GitHub:", error)

      if (error.code === "auth/popup-closed-by-user") {
        setError("Popup foi fechado. Tente novamente.")
      } else if (error.code === "auth/popup-blocked") {
        setError("Popup foi bloqueado pelo navegador. Permita popups para este site.")
      } else {
        setError(error.message || "Erro no login com GitHub.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>Digite suas credenciais para acessar o QuantumCode</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro de Autenticação</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!firebaseInitialized && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Inicializando...</AlertTitle>
              <AlertDescription>Aguarde a inicialização do Firebase...</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!firebaseInitialized || loading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Button variant="link" className="p-0 h-auto" type="button">
                Esqueceu a senha?
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
            <Label htmlFor="remember-me" className="text-sm font-medium leading-none">
              Manter conectado
            </Label>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={!firebaseInitialized || loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>

          <div className="relative w-full">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-2 text-muted-foreground text-sm">ou</span>
            </div>
          </div>

          <div className="flex flex-col w-full space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={!firebaseInitialized || loading}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" className="mr-2">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Entrar com Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGithubSignIn}
              disabled={!firebaseInitialized || loading}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" className="mr-2" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Entrar com GitHub
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/signup")}>
              Criar conta
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}