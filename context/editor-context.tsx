"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
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
  projects: ProjectType[]
  currentProject: ProjectType | null
  currentFile: FileType | null
  loading: boolean
  createProject: (name: string, description: string) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  updateProject: (projectId: string, updates: Partial<ProjectType>) => Promise<void>
  setCurrentProject: (project: ProjectType | null) => void
  setCurrentFile: (file: FileType | null) => void
  addFile: (file: Omit<FileType, "id">) => Promise<void>
  updateFile: (fileId: string, updates: Partial<FileType>) => Promise<void>
  deleteFile: (fileId: string) => Promise<void>
  refreshProjects: () => Promise<void>
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [projects, setProjects] = useState<ProjectType[]>([])
  const [currentProject, setCurrentProject] = useState<ProjectType | null>(null)
  const [currentFile, setCurrentFile] = useState<FileType | null>(null)
  const [loading, setLoading] = useState(false)

  const refreshProjects = async () => {
    if (!user) return

    setLoading(true)
    try {
      const projectsQuery = query(
        collection(db, "projects"),
        where("userId", "==", user.uid)
      )
      const snapshot = await getDocs(projectsQuery)
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProjectType[]

      setProjects(projectsData)
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (name: string, description: string) => {
    if (!user) return

    const projectData = {
      name,
      description,
      files: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: user.uid,
    }

    const docRef = await addDoc(collection(db, "projects"), projectData)
    const newProject = { id: docRef.id, ...projectData }
    setProjects(prev => [...prev, newProject])
  }

  const deleteProject = async (projectId: string) => {
    await deleteDoc(doc(db, "projects", projectId))
    setProjects(prev => prev.filter(p => p.id !== projectId))
    if (currentProject?.id === projectId) {
      setCurrentProject(null)
      setCurrentFile(null)
    }
  }

  const updateProject = async (projectId: string, updates: Partial<ProjectType>) => {
    await updateDoc(doc(db, "projects", projectId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    })

    setProjects(prev => 
      prev.map(p => p.id === projectId ? { ...p, ...updates } : p)
    )

    if (currentProject?.id === projectId) {
      setCurrentProject(prev => prev ? { ...prev, ...updates } : null)
    }
  }

  const addFile = async (file: Omit<FileType, "id">) => {
    if (!currentProject) return

    const newFile = {
      ...file,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedFiles = [...currentProject.files, newFile]
    await updateProject(currentProject.id, { files: updatedFiles })
  }

  const updateFile = async (fileId: string, updates: Partial<FileType>) => {
    if (!currentProject) return

    const updatedFiles = currentProject.files.map(f =>
      f.id === fileId ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
    )

    await updateProject(currentProject.id, { files: updatedFiles })

    if (currentFile?.id === fileId) {
      setCurrentFile(prev => prev ? { ...prev, ...updates } : null)
    }
  }

  const deleteFile = async (fileId: string) => {
    if (!currentProject) return

    const updatedFiles = currentProject.files.filter(f => f.id !== fileId)
    await updateProject(currentProject.id, { files: updatedFiles })

    if (currentFile?.id === fileId) {
      setCurrentFile(null)
    }
  }

  useEffect(() => {
    if (user) {
      refreshProjects()
    } else {
      setProjects([])
      setCurrentProject(null)
      setCurrentFile(null)
    }
  }, [user])

  const value = {
    projects,
    currentProject,
    currentFile,
    loading,
    createProject,
    deleteProject,
    updateProject,
    setCurrentProject,
    setCurrentFile,
    addFile,
    updateFile,
    deleteFile,
    refreshProjects,
  }

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (context === undefined) {
    throw new Error("useEditor must be used within an EditorProvider")
  }
  return context
}