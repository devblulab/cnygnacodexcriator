"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/firebase/auth-context"
import EditorLayout from "@/components/editor/layout"
import { Loader2 } from "lucide-react"

export default function EditorPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Show loading state
  if (loading || !isClient) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    )
  }

  // Show editor if user is authenticated
  if (user) {
    return <EditorLayout />
  }

  // This should not be visible due to the redirect
  return null
}
