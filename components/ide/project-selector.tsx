"use client"

import { useState } from "react"
import { useEditor } from "@/context/editor-context"
import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, FolderOpen, Plus } from "lucide-react"

export default function ProjectSelector() {
  const { projects, currentProject, setCurrentProject, createProject } = useEditor()
  const [isOpen, setIsOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return

    try {
      await createProject({
        name: newProjectName,
        description: newProjectDescription,
        files: [],
        collaborators: [],
        isPublic: false,
      })

      setNewProjectName("")
      setNewProjectDescription("")
      setIsOpen(false)
    } catch (error) {
      console.error("Error creating project:", error)
    }
  }

  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="flex items-center">
        <FolderOpen className="w-4 h-4 mr-2 text-muted-foreground" />

        <div className="flex items-center cursor-pointer">
          <span className="text-sm font-medium">{currentProject ? currentProject.name : "Selecione um projeto"}</span>
          <ChevronDown className="w-4 h-4 ml-1 text-muted-foreground" />
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Novo Projeto
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Projeto</DialogTitle>
            <DialogDescription>Crie um novo projeto para começar a desenvolver.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Projeto</Label>
              <Input
                id="name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Meu Projeto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Descrição do projeto"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateProject}>Criar Projeto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
