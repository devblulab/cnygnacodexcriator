"use client"

import React, { useContext, useState, useEffect } from "react"
import { useAuth } from "@/lib/firebase/auth-context"
import { db } from "@/lib/firebase/config"
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore"

export type FileType = {
  id: string
  name: string
  path: string
  content: string
  language: string
  createdAt?: string
  updatedAt?: string
}

export type ProjectType = {
  id: string
  name: string
  description: string
  files: FileType[]
  createdAt: string
  updatedAt: string
  userId: string
}

interface EditorContextType {
  currentProject: ProjectType | null
  projects: ProjectType[]
  activeFile: FileType | null
  loading: boolean
  createProject: (name: string, description: string) => Promise<void>
  loadProject: (projectId: string) => Promise<void>
  saveProject: () => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  createFile: (name: string, content: string, language: string) => void
  updateFile: (fileId: string, content: string) => void
  deleteFile: (fileId: string) => void
  setActiveFile: (file: FileType | null) => void
  refreshProjects: () => Promise<void>
}

const EditorContext = React.createContext<EditorContextType | undefined>(undefined)

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [currentProject, setCurrentProject] = useState<ProjectType | null>(null)
  const [projects, setProjects] = useState<ProjectType[]>([])
  const [activeFile, setActiveFile] = useState<FileType | null>(null)
  const [loading, setLoading] = useState(false)

  const refreshProjects = async () => {
    if (!user) return

    setLoading(true)
    try {
      const projectsRef = collection(db, "projects")
      const q = query(projectsRef, where("userId", "==", user.uid))
      const snapshot = await getDocs(q)

      const userProjects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ProjectType))

      setProjects(userProjects)
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (user) {
      refreshProjects()
    } else {
      setProjects([])
      setCurrentProject(null)
      setActiveFile(null)
    }
  }, [user])

  const createProject = async (name: string, description: string) => {
    if (!user) return

    const newProject: Omit<ProjectType, "id"> = {
      name,
      description,
      files: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: user.uid
    }

    try {
      const docRef = await addDoc(collection(db, "projects"), newProject)
      const project = { id: docRef.id, ...newProject }
      setProjects(prev => [...prev, project])
      setCurrentProject(project)
    } catch (error) {
      console.error("Error creating project:", error)
    }
  }

  const loadProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (project) {
      setCurrentProject(project)
      setActiveFile(project.files[0] || null)
    }
  }

  const saveProject = async () => {
    if (!currentProject) return

    try {
      const projectRef = doc(db, "projects", currentProject.id)
      await updateDoc(projectRef, {
        ...currentProject,
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error("Error saving project:", error)
    }
  }

  const deleteProject = async (projectId: string) => {
    try {
      await deleteDoc(doc(db, "projects", projectId))
      setProjects(prev => prev.filter(p => p.id !== projectId))
      if (currentProject?.id === projectId) {
        setCurrentProject(null)
        setActiveFile(null)
      }
    } catch (error) {
      console.error("Error deleting project:", error)
    }
  }

  const createFile = (name: string, content: string, language: string) => {
    if (!currentProject) return

    const newFile: FileType = {
      id: Date.now().toString(),
      name,
      path: `/${name}`,
      content,
      language,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedProject = {
      ...currentProject,
      files: [...currentProject.files, newFile],
      updatedAt: new Date().toISOString()
    }

    setCurrentProject(updatedProject)
    setActiveFile(newFile)
  }

  const updateFile = (fileId: string, content: string) => {
    if (!currentProject) return

    const updatedFiles = currentProject.files.map(file =>
      file.id === fileId
        ? { ...file, content, updatedAt: new Date().toISOString() }
        : file
    )

    const updatedProject = {
      ...currentProject,
      files: updatedFiles,
      updatedAt: new Date().toISOString()
    }

    setCurrentProject(updatedProject)

    if (activeFile?.id === fileId) {
      setActiveFile({ ...activeFile, content })
    }
  }

  const deleteFile = (fileId: string) => {
    if (!currentProject) return

    const updatedFiles = currentProject.files.filter(file => file.id !== fileId)
    const updatedProject = {
      ...currentProject,
      files: updatedFiles,
      updatedAt: new Date().toISOString()
    }

    setCurrentProject(updatedProject)

    if (activeFile?.id === fileId) {
      setActiveFile(updatedFiles[0] || null)
    }
  }

  const value = {
    currentProject,
    projects,
    activeFile,
    loading,
    createProject,
    loadProject,
    saveProject,
    deleteProject,
    createFile,
    updateFile,
    deleteFile,
    setActiveFile,
    refreshProjects
  }

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (context === undefined) {
    throw new Error("useEditor must be used within an EditorProvider")
  }
  return context
}