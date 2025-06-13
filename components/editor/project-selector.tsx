"use client"

import { useState } from "react"
import { useEditor } from "@/context/editor-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, FolderOpen, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ProjectSelector() {
  const { projects, currentProject, setCurrentProject, createProject } = useEditor()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return

    try {
      const projectId = await createProject({
        name: newProjectName,
        description: newProjectDescription,
        files: [
          {
            id: `file_${Date.now()}`,
            name: "index.html",
            content:
              '<!DOCTYPE html>\n<html>\n<head>\n  <title>New Project</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <p>Welcome to your new project.</p>\n  <script src="app.js"></script>\n</body>\n</html>',
            language: "html",
            path: "index.html",
            lastModified: Date.now(),
          },
          {
            id: `file_${Date.now() + 1}`,
            name: "styles.css",
            content:
              "body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  line-height: 1.6;\n}\n\nh1 {\n  color: #333;\n}\n",
            language: "css",
            path: "styles.css",
            lastModified: Date.now(),
          },
          {
            id: `file_${Date.now() + 2}`,
            name: "app.js",
            content: "// Your JavaScript code goes here\nconsole.log('Hello from JavaScript!');\n",
            language: "javascript",
            path: "app.js",
            lastModified: Date.now(),
          },
        ],
        isPublic: false,
        collaborators: [],
      })

      // Reset form
      setNewProjectName("")
      setNewProjectDescription("")
      setIsDialogOpen(false)

      // Find and set the newly created project
      const newProject = projects.find((p) => p.id === projectId)
      if (newProject) {
        setCurrentProject(newProject)
      }
    } catch (error) {
      console.error("Error creating project:", error)
    }
  }

  return (
    <div className="flex items-center justify-between p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <FolderOpen className="mr-2 h-4 w-4" />
            {currentProject?.name || "Select Project"}
            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          <DropdownMenuLabel>Projects</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {projects.length > 0 ? (
            projects.map((project) => (
              <DropdownMenuItem key={project.id} onClick={() => setCurrentProject(project)}>
                {project.name}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>No projects yet</DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>Create a new project to start coding.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProject}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
