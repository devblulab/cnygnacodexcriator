"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { isFirebaseInitialized } from "@/lib/firebase/config"

export default function FirebaseConfigStatus() {
  const [status, setStatus] = useState<{
    initialized: boolean | null
    auth: boolean | null
    firestore: boolean | null
    storage: boolean | null
    functions: boolean | null
  }>({
    initialized: null,
    auth: null,
    firestore: null,
    storage: null,
    functions: null,
  })

  useEffect(() => {
    const checkFirebaseStatus = async () => {
      if (typeof window === "undefined") {
        return
      }

      try {
        // Check if Firebase is initialized
        const initialized = isFirebaseInitialized()
        setStatus((prev) => ({ ...prev, initialized }))

        if (!initialized) {
          return
        }

        // Check Firebase Auth
        try {
          const { getAuth } = await import("firebase/auth")
          const auth = getAuth()
          setStatus((prev) => ({ ...prev, auth: !!auth }))
        } catch (error) {
          console.error("Error checking Firebase Auth:", error)
          setStatus((prev) => ({ ...prev, auth: false }))
        }

        // Check Firebase Firestore
        try {
          const { getFirestore } = await import("firebase/firestore")
          const firestore = getFirestore()
          setStatus((prev) => ({ ...prev, firestore: !!firestore }))
        } catch (error) {
          console.error("Error checking Firebase Firestore:", error)
          setStatus((prev) => ({ ...prev, firestore: false }))
        }

        // Check Firebase Storage
        try {
          const { getStorage } = await import("firebase/storage")
          const storage = getStorage()
          setStatus((prev) => ({ ...prev, storage: !!storage }))
        } catch (error) {
          console.error("Error checking Firebase Storage:", error)
          setStatus((prev) => ({ ...prev, storage: false }))
        }

        // Check Firebase Functions
        try {
          const { getFunctions } = await import("firebase/functions")
          const functions = getFunctions()
          setStatus((prev) => ({ ...prev, functions: !!functions }))
        } catch (error) {
          console.error("Error checking Firebase Functions:", error)
          setStatus((prev) => ({ ...prev, functions: false }))
        }
      } catch (error) {
        console.error("Error checking Firebase status:", error)
      }
    }

    checkFirebaseStatus()
  }, [])

  const renderStatusBadge = (status: boolean | null) => {
    if (status === null) {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Verificando...
        </Badge>
      )
    }

    return status ? (
      <Badge variant="success" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        OK
      </Badge>
    ) : (
      <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Erro
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status do Firebase</CardTitle>
        <CardDescription>Status dos serviços do Firebase</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Firebase Inicializado</span>
            {renderStatusBadge(status.initialized)}
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Firebase Auth</span>
            {renderStatusBadge(status.auth)}
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Firebase Firestore</span>
            {renderStatusBadge(status.firestore)}
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Firebase Storage</span>
            {renderStatusBadge(status.storage)}
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Firebase Functions</span>
            {renderStatusBadge(status.functions)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
