
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
  projectId: string
  size?: number
  type?: string
  createdAt?: Date
  updatedAt?: Date
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
  ownerId?: string
  tags?: string[]
}

type EditorContextType = {
  projects: ProjectType[]
  currentProject: ProjectType | null
  currentFile: FileType | null
  setCurrentProject: (project: ProjectType) => void
  setCurrentFile: (file: FileType) => void
  createProject: (project: Omit<ProjectType, "id" | "createdAt" | "updatedAt">) => Promise<ProjectType>
  updateProject: (project: ProjectType) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  createFile: (projectId: string, file: Omit<FileType, "id">) => Promise<FileType>
  saveFile: (file: FileType) => Promise<void>
  deleteFile: (projectId: string, fileId: string) => Promise<void>
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<ProjectType[]>([])
  const [currentProject, setCurrentProject] = useState<ProjectType | null>(null)
  const [currentFile, setCurrentFile] = useState<FileType | null>(null)

  // Load mock projects for testing
  useEffect(() => {
    loadMockProjects()
  }, [])

  const loadMockProjects = () => {
    const mockProjects: ProjectType[] = [
      {
        id: "1",
        name: "Projeto Exemplo",
        description: "Projeto de exemplo para teste",
        files: [
          {
            id: "1",
            name: "index.html",
            content: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QuantumCode - Exemplo</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
            padding: 40px 20px;
        }
        h1 {
            font-size: 3em;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        p {
            font-size: 1.2em;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        .btn {
            background: rgba(255,255,255,0.2);
            border: 2px solid rgba(255,255,255,0.3);
            color: white;
            padding: 12px 24px;
            font-size: 1.1em;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .btn:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Bem-vindo ao QuantumCode!</h1>
        <p>Seu IDE moderno e livre para desenvolvimento web</p>
        <button class="btn" onclick="changeText()">Clique Aqui!</button>
        <p id="message" style="margin-top: 30px;"></p>
    </div>

    <script>
        function changeText() {
            document.getElementById('message').innerHTML = 
                '✨ Agora você pode começar a programar livremente! ✨';
        }
    </script>
</body>
</html>`,
            language: "html",
            path: "/index.html",
            lastModified: Date.now(),
            projectId: "1"
          },
          {
            id: "2",
            name: "style.css",
            content: `/* Estilos globais */
body {
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Botões */
.btn {
    display: inline-block;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    transition: background-color 0.3s ease;
}

.btn:hover {
    background-color: #0056b3;
}

/* Responsivo */
@media (max-width: 768px) {
    .container {
        padding: 0 10px;
    }
}`,
            language: "css",
            path: "/style.css",
            lastModified: Date.now(),
            projectId: "1"
          },
          {
            id: "3",
            name: "script.js",
            content: `// JavaScript para QuantumCode
console.log('QuantumCode carregado!');

// Função para mudança de tema
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-theme');
    
    const isDark = body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Carregar tema salvo
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
});

// Função para animações suaves
function smoothScroll(targetId) {
    const target = document.getElementById(targetId);
    if (target) {
        target.scrollIntoView({
            behavior: 'smooth'
        });
    }
}

// Exemplo de função interativa
function showMessage(message) {
    const messageEl = document.getElementById('message');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.style.opacity = '1';
        
        setTimeout(() => {
            messageEl.style.opacity = '0';
        }, 3000);
    }
}`,
            language: "javascript",
            path: "/script.js",
            lastModified: Date.now(),
            projectId: "1"
          }
        ],
        isPublic: true,
        collaborators: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ownerId: "mock-user"
      }
    ]

    setProjects(mockProjects)
    setCurrentProject(mockProjects[0])
    setCurrentFile(mockProjects[0].files[0])
  }

  const createProject = async (projectData: Omit<ProjectType, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newProject: ProjectType = {
        id: Date.now().toString(),
        ...projectData,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      setProjects(prev => [...prev, newProject])
      setCurrentProject(newProject)
      return newProject
    } catch (error) {
      console.error("Error creating project:", error)
      throw error
    }
  }

  const updateProject = async (project: ProjectType) => {
    try {
      setProjects(prev => 
        prev.map(p => p.id === project.id ? { ...project, updatedAt: Date.now() } : p)
      )
      if (currentProject?.id === project.id) {
        setCurrentProject({ ...project, updatedAt: Date.now() })
      }
    } catch (error) {
      console.error("Error updating project:", error)
      throw error
    }
  }

  const deleteProject = async (projectId: string) => {
    try {
      setProjects(prev => prev.filter(p => p.id !== projectId))
      if (currentProject?.id === projectId) {
        setCurrentProject(null)
        setCurrentFile(null)
      }
    } catch (error) {
      console.error("Error deleting project:", error)
      throw error
    }
  }

  const createFile = async (projectId: string, fileData: Omit<FileType, "id">) => {
    try {
      const newFile: FileType = {
        id: Date.now().toString(),
        ...fileData,
        projectId,
        lastModified: Date.now()
      }

      setProjects(prev => 
        prev.map(p => 
          p.id === projectId 
            ? { ...p, files: [...p.files, newFile], updatedAt: Date.now() }
            : p
        )
      )

      if (currentProject?.id === projectId) {
        setCurrentProject(prev => prev ? {
          ...prev,
          files: [...prev.files, newFile],
          updatedAt: Date.now()
        } : null)
      }

      return newFile
    } catch (error) {
      console.error("Error creating file:", error)
      throw error
    }
  }

  const saveFile = async (file: FileType) => {
    try {
      const updatedFile = { ...file, lastModified: Date.now() }

      setProjects(prev => 
        prev.map(p => 
          p.id === file.projectId 
            ? { ...p, files: p.files.map(f => f.id === file.id ? updatedFile : f), updatedAt: Date.now() }
            : p
        )
      )

      if (currentProject?.id === file.projectId) {
        setCurrentProject(prev => prev ? {
          ...prev,
          files: prev.files.map(f => f.id === file.id ? updatedFile : f),
          updatedAt: Date.now()
        } : null)
      }

      if (currentFile?.id === file.id) {
        setCurrentFile(updatedFile)
      }

      console.log("File saved:", file.name)
    } catch (error) {
      console.error("Error saving file:", error)
      throw error
    }
  }

  const deleteFile = async (projectId: string, fileId: string) => {
    try {
      setProjects(prev => 
        prev.map(p => 
          p.id === projectId 
            ? { ...p, files: p.files.filter(f => f.id !== fileId), updatedAt: Date.now() }
            : p
        )
      )

      if (currentProject?.id === projectId) {
        const updatedFiles = currentProject.files.filter(f => f.id !== fileId)
        setCurrentProject(prev => prev ? {
          ...prev,
          files: updatedFiles,
          updatedAt: Date.now()
        } : null)

        if (currentFile?.id === fileId) {
          setCurrentFile(updatedFiles.length > 0 ? updatedFiles[0] : null)
        }
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
