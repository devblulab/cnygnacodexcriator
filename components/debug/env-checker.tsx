"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function EnvChecker() {
  const [envStatus, setEnvStatus] = useState<{
    loaded: boolean
    missing: string[]
    available: string[]
  }>({
    loaded: false,
    missing: [],
    available: [],
  })

  useEffect(() => {
    // Lista de variáveis de ambiente que devemos verificar
    const requiredEnvVars = [
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      "NEXT_PUBLIC_FIREBASE_APP_ID",
      "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
      "NEXT_PUBLIC_GEMINI_API_KEY",
    ]

    const missing: string[] = []
    const available: string[] = []

    // Verificar quais variáveis estão disponíveis
    requiredEnvVars.forEach((envVar) => {
      if (!process.env[envVar]) {
        missing.push(envVar)
      } else {
        available.push(envVar)
      }
    })

    setEnvStatus({
      loaded: true,
      missing,
      available,
    })
  }, [])

  if (process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verificação de Variáveis de Ambiente</CardTitle>
        <CardDescription>
          Verifica se as variáveis de ambiente necessárias do arquivo .env.local estão carregadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!envStatus.loaded ? (
          <p>Verificando variáveis de ambiente...</p>
        ) : (
          <div className="space-y-4">
            {envStatus.missing.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Variáveis de ambiente ausentes</AlertTitle>
                <AlertDescription>
                  <p>As seguintes variáveis de ambiente não foram encontradas:</p>
                  <ul className="list-disc pl-5 mt-2">
                    {envStatus.missing.map((envVar) => (
                      <li key={envVar}>{envVar}</li>
                    ))}
                  </ul>
                  <p className="mt-2">
                    Verifique se o arquivo .env.local existe e contém todas as variáveis necessárias.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {envStatus.available.length > 0 && (
              <div>
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <h3 className="font-medium">Variáveis de ambiente carregadas:</h3>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {envStatus.available.map((envVar) => (
                    <li key={envVar} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-sm">{envVar}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
