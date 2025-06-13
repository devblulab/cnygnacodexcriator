"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/firebase/config"
import { onAuthStateChanged } from "firebase/auth"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export default function AuthDebugPage() {
  const [authState, setAuthState] = useState<{
    user: any | null
    loading: boolean
    error: string | null
    cookieExists: boolean
    tokenExists: boolean
  }>({
    user: null,
    loading: true,
    error: null,
    cookieExists: false,
    tokenExists: false,
  })

  useEffect(() => {
    // Verificar se o cookie de sessão existe
    const cookieExists = document.cookie.includes("session=")

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        try {
          let tokenExists = false

          if (user) {
            // Verificar se o token existe
            const token = await user.getIdToken(false)
            tokenExists = !!token
          }

          setAuthState({
            user,
            loading: false,
            error: null,
            cookieExists,
            tokenExists,
          })
        } catch (error: any) {
          setAuthState({
            user: null,
            loading: false,
            error: error.message,
            cookieExists,
            tokenExists: false,
          })
        }
      },
      (error) => {
        setAuthState({
          user: null,
          loading: false,
          error: error.message,
          cookieExists,
          tokenExists: false,
        })
      },
    )

    return () => unsubscribe()
  }, [])

  const refreshState = () => {
    window.location.reload()
  }

  const clearCookies = () => {
    // Limpar cookies relacionados à autenticação
    document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "firebase-session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    alert("Cookies limpos. A página será recarregada.")
    window.location.reload()
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Diagnóstico de Autenticação</h1>
        <Button onClick={refreshState} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {authState.loading ? (
        <Card>
          <CardContent className="pt-6">
            <p>Carregando informações de autenticação...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Estado da Autenticação</CardTitle>
              <CardDescription>{authState.user ? "Usuário autenticado" : "Usuário não autenticado"}</CardDescription>
            </CardHeader>
            <CardContent>
              {authState.error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro de Autenticação</AlertTitle>
                  <AlertDescription>{authState.error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">Status</div>
                  <div className="flex items-center">
                    {authState.user ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-green-600">Autenticado</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                        <span className="text-red-600">Não autenticado</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">Cookie de Sessão</div>
                  <div className="flex items-center">
                    {authState.cookieExists ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-green-600">Presente</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                        <span className="text-red-600">Ausente</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">Token de ID</div>
                  <div className="flex items-center">
                    {authState.tokenExists ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-green-600">Válido</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                        <span className="text-red-600">Inválido ou ausente</span>
                      </>
                    )}
                  </div>
                </div>

                {authState.user && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">Email</div>
                      <div>{authState.user.email}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">UID</div>
                      <div className="break-all">{authState.user.uid}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">Email Verificado</div>
                      <div>{authState.user.emailVerified ? "Sim" : "Não"}</div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6">
                <Button onClick={clearCookies} variant="destructive" size="sm">
                  Limpar Cookies de Autenticação
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Solução de Problemas</CardTitle>
              <CardDescription>Passos para resolver problemas de autenticação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Problema: Tela branca no Dashboard</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Verifique se você está autenticado (veja acima)</li>
                    <li>Verifique se o cookie de sessão está sendo definido corretamente</li>
                    <li>Verifique se o middleware está redirecionando corretamente</li>
                    <li>Verifique se há erros no console do navegador</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Problema: Redirecionamento para Login</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>O middleware está redirecionando porque não detecta uma sessão válida</li>
                    <li>Verifique se o cookie de sessão está sendo definido após o login</li>
                    <li>Tente limpar os cookies e fazer login novamente</li>
                    <li>Verifique se o Firebase está inicializado corretamente</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
