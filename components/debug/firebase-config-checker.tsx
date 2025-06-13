"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { auth } from "@/lib/firebase/config"
import { signInAnonymously } from "firebase/auth"

export default function FirebaseConfigChecker() {
  const [status, setStatus] = useState<{
    checking: boolean
    error: string | null
    configValid: boolean
    authWorks: boolean
    testResult: string | null
  }>({
    checking: true,
    error: null,
    configValid: false,
    authWorks: false,
    testResult: null,
  })

  const checkFirebaseConfig = async () => {
    setStatus((prev) => ({ ...prev, checking: true, error: null }))

    try {
      // Check if Firebase is initialized
      const isConfigValid = !!auth && !!auth.app && !!auth.app.options.apiKey

      setStatus((prev) => ({ ...prev, configValid: isConfigValid }))

      if (!isConfigValid) {
        throw new Error("Firebase is not properly initialized. Check your environment variables.")
      }

      // Test authentication with anonymous sign-in
      // This is a good way to test if Firebase Auth is working without requiring user credentials
      let authWorks = false
      let testResult = null

      try {
        // Try anonymous sign-in as a test
        const result = await signInAnonymously(auth)
        authWorks = true
        testResult = `Authentication working. Test user ID: ${result.user.uid}`

        // Sign out the anonymous user immediately
        await auth.signOut()
      } catch (authError: any) {
        authWorks = false
        testResult = `Authentication test failed: ${authError.code} - ${authError.message}`
      }

      setStatus((prev) => ({
        ...prev,
        checking: false,
        authWorks,
        testResult,
      }))
    } catch (error: any) {
      setStatus((prev) => ({
        ...prev,
        checking: false,
        error: error.message || "Unknown error checking Firebase configuration",
        configValid: false,
        authWorks: false,
      }))
    }
  }

  useEffect(() => {
    checkFirebaseConfig()
  }, [])

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Firebase Configuration Check</CardTitle>
            <CardDescription>Verifies if Firebase is properly configured and working</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={checkFirebaseConfig} disabled={status.checking}>
            <RefreshCw className={`h-4 w-4 mr-2 ${status.checking ? "animate-spin" : ""}`} />
            {status.checking ? "Checking..." : "Check Again"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {status.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription>{status.error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="font-medium">Firebase Config</div>
            <div className="flex items-center">
              {status.configValid ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-green-600">Valid</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-red-600">Invalid</span>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="font-medium">Authentication</div>
            <div className="flex items-center">
              {status.checking ? (
                <span>Checking...</span>
              ) : status.authWorks ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-green-600">Working</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-red-600">Not Working</span>
                </>
              )}
            </div>
          </div>

          {status.testResult && (
            <div className="mt-4">
              <div className="font-medium mb-1">Test Result:</div>
              <div className="text-sm bg-muted p-2 rounded">{status.testResult}</div>
            </div>
          )}

          {!status.configValid && (
            <div className="mt-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Configuration Issues</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">Your Firebase configuration appears to be invalid. Please check:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Environment variables are properly set in .env.local</li>
                    <li>Firebase project exists and is properly set up</li>
                    <li>API keys and project IDs are correct</li>
                    <li>Authentication methods are enabled in Firebase console</li>
                  </ul>
                  <p className="mt-2">
                    <a href="/debug/env" className="text-blue-500 underline">
                      Check Environment Variables
                    </a>
                  </p>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {!status.authWorks && status.configValid && (
            <div className="mt-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Authentication Issues</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">
                    Your Firebase configuration looks valid, but authentication is not working. Please check:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Authentication methods are enabled in Firebase console</li>
                    <li>Your Firebase project has the correct authentication settings</li>
                    <li>There are no network issues or CORS restrictions</li>
                    <li>Your Firebase project has not exceeded quota limits</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
