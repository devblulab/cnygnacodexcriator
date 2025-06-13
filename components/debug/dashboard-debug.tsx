"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import { useRouter } from "next/navigation"

export default function DashboardDebug() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [cookieExists, setCookieExists] = useState(false)

  useEffect(() => {
    // Verificar se o cookie de sessão existe
    const sessionCookie = document.cookie.split(";").find((c) => c.trim().startsWith("session="))
    setCookieExists(!!sessionCookie)

    // Verificar se o usuário está autenticado
    if (!loading && !user) {
      setError("Usuário não autenticado. Você será redirecionado para a página de login.")

      // Redirecionar após um breve atraso para mostrar a mensagem
      const timer = setTimeout(() => {
        router.push("/login")
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [user, loading, router])

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro de Autenticação</AlertTitle>
        <AlertDescription>
          <p>{error}</p>
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/debug/auth")} className="mr-2">
              Diagnóstico de Autenticação
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push("/login")}>
              Ir para Login
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (!cookieExists) {
    return (
      <Alert variant="warning" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Aviso</AlertTitle>
        <AlertDescription>
          <p>O cookie de sessão não foi encontrado. Isso pode causar redirecionamentos inesperados.</p>
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/debug/auth")}>
              Diagnóstico de Autenticação
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
