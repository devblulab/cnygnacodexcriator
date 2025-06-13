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
  const [files, setFiles] = useState<FileType[]>([])
  const [currentFile, setCurrentFile] = useState<FileType | null>(null)
  const [projects, setProjects] = useState<ProjectType[]>([])
  const [currentProject, setCurrentProject] = useState<ProjectType | null>(null)
  const [loading, setLoading] = useState(false)

  // Load mock projects for testing
  useEffect(() => {
    loadMockProjects()
  }, [])

  const loadMockProjects = () => {
    const mockProjects: ProjectType[] = [
      {
        id: "1",
        name: "Projeto Teste",
        description: "Projeto de exemplo para teste",
        ownerId: "mock-user",
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: false,
        collaborators: [],
        tags: ["react", "typescript"]
      }
    ]

    setProjects(mockProjects)
    setCurrentProject(mockProjects[0])
    loadMockFiles()
  }

  const loadMockFiles = () => {
    const mockFiles: FileType[] = [
      {
        id: "1",
        name: "App.tsx",
        content: `import React from 'react'

function App() {
  return (
    <div className="App">
      <h1>Hello, World!</h1>
    </div>
  )
}

export default App`,
        type: "file",
        projectId: "1",
        path: "/src/App.tsx",
        language: "typescript",
        size: 150,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    setFiles(mockFiles)
    setCurrentFile(mockFiles[0])
  }

  const loadProjectFiles = async (projectId: string) => {
    // Mock implementation
    loadMockFiles()
  }

  const createProject = async (projectData: Omit<ProjectType, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newProject = {
        id: Date.now().toString(),
        ...projectData,
        ownerId: "mock-user",
        createdAt: new Date(),
        updatedAt: new Date()
      }

      setProjects(prev => [...prev, newProject])
      setCurrentProject(newProject)
      return newProject
    } catch (error) {
      console.error("Error creating project:", error)
      throw error
    }
  }

  const createFile = async (fileData: Omit<FileType, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newFile = {
        id: Date.now().toString(),
        ...fileData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      setFiles(prev => [...prev, newFile])
      return newFile
    } catch (error) {
      console.error("Error creating file:", error)
      throw error
    }
  }

  const saveFile = async (file: FileType) => {
    try {
      setFiles(prev => 
        prev.map(f => f.id === file.id ? { ...f, content: file.content, updatedAt: new Date() } : f)
      )

      if (currentFile?.id === file.id) {
        setCurrentFile({ ...file, updatedAt: new Date() })
      }

      console.log("File saved:", file.name)
    } catch (error) {
      console.error("Error saving file:", error)
      throw error
    }
  }

  const deleteFile = async (fileId: string) => {
    try {
      setFiles(prev => prev.filter(f => f.id !== fileId))

      if (currentFile?.id === fileId) {
        const remainingFiles = files.filter(f => f.id !== fileId)
        setCurrentFile(remainingFiles.length > 0 ? remainingFiles[0] : null)
      }

      console.log("File deleted:", fileId)
    } catch (error) {
      console.error("Error deleting file:", error)
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
        updateProject: async () => {},
        deleteProject: async () => {},
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