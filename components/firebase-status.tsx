"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"
import app from "@/lib/firebase/config"

export default function FirebaseStatus() {
  const [status, setStatus] = useState<{
    initialized: boolean
    error: string | null
    config: Record<string, string | undefined>
  }>({
    initialized: false,
    error: null,
    config: {},
  })

  useEffect(() => {
    try {
      // Check if Firebase is initialized
      const isInitialized = !!app.options.apiKey

      // Get config (safe to display in development)
      const config = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY
          ? `${process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 5)}...`
          : "Not set",
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "Not set",
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "Not set",
      }

      setStatus({
        initialized: isInitialized,
        error: null,
        config,
      })
    } catch (err: any) {
      setStatus({
        initialized: false,
        error: err.message || "Unknown error",
        config: {},
      })
    }
  }, [])

  if (process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Alert variant={status.initialized ? "default" : "destructive"}>
        {status.initialized ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
        <AlertTitle>Firebase {status.initialized ? "Initialized" : "Error"}</AlertTitle>
        <AlertDescription>
          {status.initialized ? (
            <div className="text-sm">
              <p>Firebase successfully initialized</p>
              <div className="mt-2">
                <p>
                  <strong>API Key:</strong> {status.config.apiKey}
                </p>
                <p>
                  <strong>Auth Domain:</strong> {status.config.authDomain}
                </p>
                <p>
                  <strong>Project ID:</strong> {status.config.projectId}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-sm">
              <p>Firebase initialization failed: {status.error}</p>
              <p className="mt-2">Check your environment variables and make sure they are correctly set.</p>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  )
}
