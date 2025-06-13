"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useEditor } from "@/context/editor-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, Trash2, ExternalLink, Clock, User } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ProjectList() {
  const router = useRouter()
  const { projects, loading, deleteProject } = useEditor()
  const [deletingProject, setDeletingProject] = useState<string | null>(null)

  const handleOpenProject = (projectId: string) => {
    router.push(`/dashboard?project=${projectId}`)
  }

  const handleDeleteProject = async (projectId: string) => {
    setDeletingProject(projectId)
    try {
      await deleteProject(projectId)
    } catch (error) {
      console.error("Error deleting project:", error)
    } finally {
      setDeletingProject(null)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <Card className="text-center p-6">
        <h3 className="text-lg font-medium mb-2">No Projects Yet</h3>
        <p className="text-muted-foreground mb-4">Create a new project or import an existing one to get started.</p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle>{project.name}</CardTitle>
            <CardDescription className="line-clamp-2">{project.description || "No description"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>
                Updated {new Date(project.updatedAt).toLocaleDateString()} at{" "}
                {new Date(project.updatedAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5 mr-1" />
              <span>{project.collaborators.length + 1} user(s)</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={() => handleOpenProject(project.id)}>
              <Edit className="h-4 w-4 mr-2" />
              Open
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={`/projects/${project.id}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">Open in new tab</span>
                </a>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Project</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{project.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteProject(project.id)}
                      disabled={deletingProject === project.id}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deletingProject === project.id ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
