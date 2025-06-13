"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import IDELayout from "@/components/ide/layout"
import { useAuth } from "@/lib/firebase/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import DashboardDebug from "@/components/debug/dashboard-debug"
import ProjectActions from "@/components/dashboard/project-actions"
import ProjectList from "@/components/dashboard/project-list"
import { useEditor } from "@/context/editor-context"

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get("project")
  const { networkError, refreshUserRoles, user, loading: authLoading } = useAuth()
  const { projects, setCurrentProject, loading: projectsLoading } = useEditor()
  const [showNetworkError, setShowNetworkError] = useState(false)
  const [showIDE, setShowIDE] = useState(false)

  useEffect(() => {
    // Show network error after a short delay to avoid flashing
    if (networkError) {
      const timer = setTimeout(() => {
        setShowNetworkError(true)
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setShowNetworkError(false)
    }
  }, [networkError])

  // Set current project based on URL parameter
  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find((p) => p.id === projectId)
      if (project) {
        setCurrentProject(project)
        setShowIDE(true)
      }
    } else if (!projectId) {
      setShowIDE(false)
    }
  }, [projectId, projects, setCurrentProject])

  const handleRetry = async () => {
    setShowNetworkError(false)
    await refreshUserRoles()
  }

  // Adicione um log para depuração
  console.log(
    "Dashboard rendering. User:",
    user?.email,
    "Auth Loading:",
    authLoading,
    "Projects Loading:",
    projectsLoading,
  )

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Carregando Dashboard...</h2>
          <p className="text-muted-foreground">
            Se esta tela persistir, verifique sua conexão ou faça login novamente.
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <DashboardDebug />
  }

  return (
    <>
      <DashboardDebug />

      {showNetworkError && (
        <Alert variant="warning" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Network Connection Issue</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              Some features may be limited due to network connectivity issues. You can continue working offline with
              limited functionality.
            </span>
            <Button variant="outline" size="sm" className="ml-2" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {showIDE ? (
        <IDELayout />
      ) : (
        <div className="container mx-auto py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Your Projects</h1>
            <ProjectActions />
          </div>
          <ProjectList />
        </div>
      )}
    </>
  )
}
