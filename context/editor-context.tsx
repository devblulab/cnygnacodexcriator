
"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type FileType = {
  id: string
  name: string
  content: string
  language: string
  path: string
  lastModified: number
}

export type ProjectType = {
  id: string
  name: string
  description: string
  files: FileType[]
  isPublic: boolean
  collaborators: string[]
  createdAt?: number
  updatedAt?: number
}

type EditorContextType = {
  projects: ProjectType[]
  currentProject: ProjectType | null
  currentFile: FileType | null
  setCurrentProject: (project: ProjectType) => void
  setCurrentFile: (file: FileType) => void
  createProject: (project: Omit<ProjectType, "id" | "createdAt" | "updatedAt">) => Promise<string>
  updateProject: (project: ProjectType) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  createFile: (projectId: string, file: Omit<FileType, "id">) => Promise<string>
  saveFile: (file: FileType) => Promise<void>
  deleteFile: (projectId: string, fileId: string) => Promise<void>
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

// Mock data para projetos exemplo
const mockProjects: ProjectType[] = [
  {
    id: "project_1",
    name: "Meu Primeiro Projeto",
    description: "Um projeto de exemplo",
    files: [
      {
        id: "file_1",
        name: "index.html",
        content: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meu Projeto</title>
</head>
<body>
    <h1>Olá, Mundo!</h1>
    <p>Este é o meu primeiro projeto no QuantumCode.</p>
</body>
</html>`,
        language: "html",
        path: "/index.html",
        lastModified: Date.now()
      },
      {
        id: "file_2",
        name: "style.css",
        content: `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f0f0f0;
}

h1 {
    color: #333;
    text-align: center;
}

p {
    line-height: 1.6;
    color: #666;
}`,
        language: "css",
        path: "/style.css",
        lastModified: Date.now()
      }
    ],
    isPublic: true,
    collaborators: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
]

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<ProjectType[]>([])
  const [currentProject, setCurrentProject] = useState<ProjectType | null>(null)
  const [currentFile, setCurrentFile] = useState<FileType | null>(null)

  // Carregar projetos exemplo na inicialização
  useEffect(() => {
    const savedProjects = localStorage.getItem('quantumcode-projects')
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects)
        setProjects(parsedProjects)
        if (parsedProjects.length > 0) {
          setCurrentProject(parsedProjects[0])
          if (parsedProjects[0].files.length > 0) {
            setCurrentFile(parsedProjects[0].files[0])
          }
        }
      } catch (error) {
        console.error('Erro ao carregar projetos salvos:', error)
        // Se houver erro, usar projetos mock
        setProjects(mockProjects)
        setCurrentProject(mockProjects[0])
        setCurrentFile(mockProjects[0].files[0])
      }
    } else {
      // Primeira vez - usar projetos mock
      setProjects(mockProjects)
      setCurrentProject(mockProjects[0])
      setCurrentFile(mockProjects[0].files[0])
    }
  }, [])

  // Salvar projetos no localStorage sempre que mudarem
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('quantumcode-projects', JSON.stringify(projects))
    }
  }, [projects])

  const createProject = async (project: Omit<ProjectType, "id" | "createdAt" | "updatedAt">) => {
    try {
      const timestamp = Date.now()
      const projectId = `project_${timestamp}`
      
      const newProject = {
        id: projectId,
        ...project,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      setProjects((prev) => [...prev, newProject])
      return projectId
    } catch (error) {
      console.error("Erro ao criar projeto:", error)
      throw error
    }
  }

  const updateProject = async (project: ProjectType) => {
    try {
      const updatedProject = {
        ...project,
        updatedAt: Date.now(),
      }

      setProjects((prev) => prev.map((p) => (p.id === project.id ? updatedProject : p)))

      if (currentProject?.id === project.id) {
        setCurrentProject(updatedProject)
      }
    } catch (error) {
      console.error("Erro ao atualizar projeto:", error)
      throw error
    }
  }

  const deleteProject = async (projectId: string) => {
    try {
      setProjects((prev) => prev.filter((p) => p.id !== projectId))

      if (currentProject?.id === projectId) {
        setCurrentProject(null)
        setCurrentFile(null)
      }
    } catch (error) {
      console.error("Erro ao deletar projeto:", error)
      throw error
    }
  }

  const createFile = async (projectId: string, file: Omit<FileType, "id">) => {
    try {
      const project = projects.find((p) => p.id === projectId)
      if (!project) throw new Error("Projeto não encontrado")

      const fileId = `file_${Date.now()}`
      const newFile = { id: fileId, ...file }

      const updatedProject = {
        ...project,
        files: [...project.files, newFile],
        updatedAt: Date.now(),
      }

      await updateProject(updatedProject)
      return fileId
    } catch (error) {
      console.error("Erro ao criar arquivo:", error)
      throw error
    }
  }

  const saveFile = async (file: FileType) => {
    if (!currentProject) throw new Error("Nenhum projeto selecionado")

    try {
      const updatedFiles = currentProject.files.map((f) =>
        f.id === file.id ? { ...file, lastModified: Date.now() } : f,
      )

      const updatedProject = {
        ...currentProject,
        files: updatedFiles,
        updatedAt: Date.now(),
      }

      await updateProject(updatedProject)

      // Atualizar arquivo atual se for o que está sendo salvo
      if (currentFile?.id === file.id) {
        setCurrentFile({ ...file, lastModified: Date.now() })
      }
    } catch (error) {
      console.error("Erro ao salvar arquivo:", error)
      throw error
    }
  }

  const deleteFile = async (projectId: string, fileId: string) => {
    try {
      const project = projects.find((p) => p.id === projectId)
      if (!project) throw new Error("Projeto não encontrado")

      const updatedProject = {
        ...project,
        files: project.files.filter((f) => f.id !== fileId),
        updatedAt: Date.now(),
      }

      await updateProject(updatedProject)

      // Se o arquivo deletado é o arquivo atual, limpar seleção
      if (currentFile?.id === fileId) {
        setCurrentFile(null)
      }
    } catch (error) {
      console.error("Erro ao deletar arquivo:", error)
      throw error
    }
  }

  return (
    <EditorContext.Provider
      value={{
        projects,
        currentProject,
        currentFile,
        setCurrentProject,
        setCurrentFile,
        createProject,
        updateProject,
        deleteProject,
        createFile,
        saveFile,
        deleteFile,
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (context === undefined) {
    throw new Error("useEditor deve ser usado dentro de um EditorProvider")
  }
  return context
}
