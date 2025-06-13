"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/lib/firebase/auth-context"
import { db } from "@/lib/firebase/config"
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore"

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
  ownerId?: string
}

type EditorContextType = {
  projects: ProjectType[]
  currentProject: ProjectType | null
  currentFile: FileType | null
  setCurrentProject: (project: ProjectType) => void
  setCurrentFile: (file: FileType) => void
  createProject: (project: Omit<ProjectType, "id" | "createdAt" | "updatedAt" | "ownerId">) => Promise<string>
  updateProject: (project: ProjectType) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  createFile: (projectId: string, file: Omit<FileType, "id">) => Promise<string>
  saveFile: (file: FileType) => Promise<void>
  deleteFile: (projectId: string, fileId: string) => Promise<void>
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [projects, setProjects] = useState<ProjectType[]>([])
  const [currentProject, setCurrentProject] = useState<ProjectType | null>(null)
  const [currentFile, setCurrentFile] = useState<FileType | null>(null)

  // Fetch user's projects when user changes
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) {
        setProjects([])
        setCurrentProject(null)
        setCurrentFile(null)
        return
      }

      try {
        const projectsRef = collection(db, "projects")
        const q = query(projectsRef, where("ownerId", "==", user.uid))
        const querySnapshot = await getDocs(q)

        const fetchedProjects: ProjectType[] = []
        querySnapshot.forEach((doc) => {
          fetchedProjects.push({ id: doc.id, ...doc.data() } as ProjectType)
        })

        setProjects(fetchedProjects)

        // Set current project to the first one if none is selected
        if (fetchedProjects.length > 0 && !currentProject) {
          setCurrentProject(fetchedProjects[0])

          // Set current file to the first one in the project
          if (fetchedProjects[0].files.length > 0) {
            setCurrentFile(fetchedProjects[0].files[0])
          }
        }
      } catch (error) {
        console.error("Error fetching projects:", error)
      }
    }

    fetchProjects()
  }, [user])

  const createProject = async (project: Omit<ProjectType, "id" | "createdAt" | "updatedAt" | "ownerId">) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const timestamp = Date.now()
      const projectData = {
        ...project,
        createdAt: timestamp,
        updatedAt: timestamp,
        ownerId: user.uid,
      }

      const docRef = await addDoc(collection(db, "projects"), projectData)

      const newProject = {
        id: docRef.id,
        ...projectData,
      }

      setProjects((prev) => [...prev, newProject])

      return docRef.id
    } catch (error) {
      console.error("Error creating project:", error)
      throw error
    }
  }

  const updateProject = async (project: ProjectType) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const projectRef = doc(db, "projects", project.id)

      await updateDoc(projectRef, {
        ...project,
        updatedAt: Date.now(),
      })

      setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...project, updatedAt: Date.now() } : p)))

      if (currentProject?.id === project.id) {
        setCurrentProject({ ...project, updatedAt: Date.now() })
      }
    } catch (error) {
      console.error("Error updating project:", error)
      throw error
    }
  }

  const deleteProject = async (projectId: string) => {
    if (!user) throw new Error("User not authenticated")

    try {
      await deleteDoc(doc(db, "projects", projectId))

      setProjects((prev) => prev.filter((p) => p.id !== projectId))

      if (currentProject?.id === projectId) {
        setCurrentProject(null)
        setCurrentFile(null)
      }
    } catch (error) {
      console.error("Error deleting project:", error)
      throw error
    }
  }

  const createFile = async (projectId: string, file: Omit<FileType, "id">) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const project = projects.find((p) => p.id === projectId)
      if (!project) throw new Error("Project not found")

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
      console.error("Error creating file:", error)
      throw error
    }
  }

  const saveFile = async (file: FileType) => {
    if (!user || !currentProject) throw new Error("User not authenticated or no project selected")

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

      // Update current file if it's the one being saved
      if (currentFile?.id === file.id) {
        setCurrentFile({ ...file, lastModified: Date.now() })
      }
    } catch (error) {
      console.error("Error saving file:", error)
      throw error
    }
  }

  const deleteFile = async (projectId: string, fileId: string) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const project = projects.find((p) => p.id === projectId)
      if (!project) throw new Error("Project not found")

      const updatedProject = {
        ...project,
        files: project.files.filter((f) => f.id !== fileId),
        updatedAt: Date.now(),
      }

      await updateProject(updatedProject)

      // If the deleted file is the current file, set current file to null
      if (currentFile?.id === fileId) {
        setCurrentFile(null)
      }
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
    throw new Error("useEditor must be used within an EditorProvider")
  }
  return context
}
