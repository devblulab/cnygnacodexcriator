"use client"
import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import { Button } from "@/components/ui/button"
import { isFirebaseInitialized, ensureFirebaseInitialized } from "@/lib/firebase/config"

export default function FirebaseInitStatus() {
  const { firebaseInitialized } = useAuth()
  const [hasFirebaseApp, setHasFirebaseApp] = useState<boolean | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== "undefined") {
      try {
        // Check if Firebase app is initialized
        setHasFirebaseApp(isFirebaseInitialized())
      } catch (error) {
        console.error("Error checking Firebase apps:", error)
        setHasFirebaseApp(false)
      }
    }
  }, [])

  const handleRetry = () => {
    setIsRetrying(true)
    try {
      // Try to initialize Firebase
      const firebase = ensureFirebaseInitialized()
      if (firebase) {
        setHasFirebaseApp(true)
        // Reload the page to apply the changes
        window.location.reload()
      } else {
        setHasFirebaseApp(false)
      }
    } catch (error) {
      console.error("Error initializing Firebase:", error)
      setHasFirebaseApp(false)
    } finally {
      setIsRetrying(false)
    }
  }

  // Only show in development and only if Firebase failed to initialize
  if (process.env.NODE_ENV !== "development" || (hasFirebaseApp !== false && firebaseInitialized !== false)) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Firebase Initialization Error</AlertTitle>
        <AlertDescription>
          <p>
            {!hasFirebaseApp
              ? "No Firebase App '[DEFAULT]' has been created. Make sure to call initializeApp() first."
              : "Firebase failed to initialize. Please check your environment variables and configuration."}
          </p>
          <div className="mt-2 flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center gap-2"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3" />
                  Retry Initialization
                </>
              )}
            </Button>
            <p className="text-sm">
              Visit{" "}
              <a href="/debug/env" className="underline">
                Environment Debug
              </a>{" "}
              or{" "}
              <a href="/debug/firebase" className="underline">
                Firebase Debug
              </a>{" "}
              pages for more information.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
