"use client"

import { useEffect, useState } from "react"
import FirebaseConfigStatus from "@/components/debug/firebase-config-status"
import AuthMethodsChecker from "@/components/debug/auth-methods-checker"
import FirebaseConfigChecker from "@/components/debug/firebase-config-checker"
import { ExternalLink, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { isFirebaseInitialized } from "@/lib/firebase/config"

export default function FirebaseDebugPage() {
  const [initialized, setInitialized] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setInitialized(isFirebaseInitialized())
    }
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Debug do Firebase</h1>

      {initialized === false && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Firebase não está inicializado</AlertTitle>
          <AlertDescription>
            O Firebase não foi inicializado corretamente. Verifique suas variáveis de ambiente e configuração.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FirebaseConfigChecker />
        <FirebaseConfigStatus />
        <AuthMethodsChecker />
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Solução de problemas comuns</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">1. Erro "auth/invalid-credential"</h3>
            <p className="text-sm text-muted-foreground">
              Este erro ocorre quando as credenciais fornecidas são inválidas ou quando há um problema com a configuração
              do Firebase. Verifique se as variáveis de ambiente estão configuradas corretamente e se o método de
              autenticação está habilitado.
            </p>
            <a
              href="https://console.firebase.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline flex items-center"
            >
              Abrir console do Firebase
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">2. Erro "auth/operation-not-allowed"</h3>
            <p className="text-sm text-muted-foreground">
              Este erro ocorre quando o método de autenticação não está habilitado no console do Firebase. Vá para o
              Console do Firebase &gt; Authentication &gt; Sign-in method e habilite os métodos desejados.
            </p>
            <a
              href={`https://console.firebase.google.com/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'liviaos'}/authentication/providers`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline flex items-center"
            >
              Abrir configurações de autenticação
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">3. Erro "auth/network-request-failed"</h3>
            <p className="text-sm text-muted-foreground">
              Este erro pode ocorrer quando há problemas de rede ou quando você está usando HTTP em vez de HTTPS. Firebase
              Authentication requer HTTPS em produção.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">4. Erro "auth/invalid-api-key"</h3>
            <p className="text-sm text-muted-foreground">
              Verifique se a API key está correta nas variáveis de ambiente. A API key deve corresponder ao projeto do Firebase.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">5. Como habilitar autenticação por email/senha</h3>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Acesse o Console do Firebase</li>
              <li>Vá para Authentication → Sign-in method</li>
              <li>Clique em "Email/Password"</li>
              <li>Ative a primeira opção "Email/Password"</li>
              <li>Clique em "Save"</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}