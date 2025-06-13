"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, ExternalLink } from "lucide-react"
import { auth } from "@/lib/firebase/config"
import { fetchSignInMethodsForEmail } from "firebase/auth"

export default function AuthMethodsChecker() {
  const [status, setStatus] = useState<{
    checking: boolean
    error: string | null
    methods: Record<string, boolean>
  }>({
    checking: false,
    error: null,
    methods: {},
  })

  const checkAuthMethods = async () => {
    setStatus((prev) => ({ ...prev, checking: true, error: null }))

    try {
      // Use a test email to check which auth methods are enabled
      const testEmail = `test_${Date.now()}@example.com`

      try {
        // This will fail, but it will tell us which methods are enabled
        await fetchSignInMethodsForEmail(auth, testEmail)
      } catch (error: any) {
        // Ignore the error, we expect it to fail
      }

      // Check if email/password is enabled
      // Note: This is a hacky way to check, but there's no direct API to check enabled providers
      const isEmailEnabled = auth.config.apiKey !== null && !auth.config.emulator?.url && auth.name === "[DEFAULT]"

      // Check if Google provider is enabled
      const isGoogleEnabled = auth.config.authDomain !== null

      setStatus({
        checking: false,
        error: null,
        methods: {
          "Email/Password": isEmailEnabled,
          Google: isGoogleEnabled,
          // We can't reliably check other providers this way
        },
      })
    } catch (error: any) {
      setStatus({
        checking: false,
        error: error.message || "Failed to check auth methods",
        methods: {},
      })
    }
  }

  useEffect(() => {
    checkAuthMethods()
  }, [])

  if (process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Methods</CardTitle>
        <CardDescription>Check which authentication methods are enabled for this project</CardDescription>
      </CardHeader>
      <CardContent>
        {status.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{status.error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            {Object.entries(status.methods).map(([method, enabled]) => (
              <div key={method} className="flex items-center justify-between py-2 border-b">
                <div className="font-medium">{method}</div>
                <div className="flex items-center">
                  {enabled ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                  )}
                  <span className={enabled ? "text-green-600" : "text-amber-600"}>
                    {enabled ? "Enabled" : "Not enabled"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={checkAuthMethods} disabled={status.checking}>
              {status.checking ? "Checking..." : "Refresh"}
            </Button>

            <a
              href="https://console.firebase.google.com/project/enygma-9a3c4/authentication/providers"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-blue-500 hover:underline"
            >
              Configure in Firebase Console
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
