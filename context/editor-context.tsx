"use client"

import { createContext, useContext, useState, useEffect } from "react"
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
  createProject: (name: string, description: string) => Promise<ProjectType>
  deleteProject: (projectId: string) => Promise<void>
  setCurrentProject: (project: ProjectType | null) => void
  createFile: (name: string, content: string, language: string) => FileType
  saveFile: (file: FileType) => Promise<void>
  deleteFile: (fileId: string) => Promise<void>
  setCurrentFile: (file: FileType | null) => void
  loadProjects: () => Promise<void>
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [projects, setProjects] = useState<ProjectType[]>([])
  const [currentProject, setCurrentProject] = useState<ProjectType | null>(null)
  const [currentFile, setCurrentFile] = useState<FileType | null>(null)
  const [loading, setLoading] = useState(false)

  const loadProjects = async () => {
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

  const createProject = async (name: string, description: string): Promise<ProjectType> => {
    if (!user) throw new Error("User not authenticated")

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
    return newProject
  }

  const deleteProject = async (projectId: string) => {
    await deleteDoc(doc(db, "projects", projectId))
    setProjects(prev => prev.filter(p => p.id !== projectId))

    if (currentProject?.id === projectId) {
      setCurrentProject(null)
      setCurrentFile(null)
    }
  }

  const createFile = (name: string, content: string, language: string): FileType => {
    const file: FileType = {
      id: Math.random().toString(36),
      name,
      path: name,
      content,
      language,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (currentProject) {
      const updatedProject = {
        ...currentProject,
        files: [...currentProject.files, file],
        updatedAt: new Date().toISOString(),
      }
      setCurrentProject(updatedProject)
      setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p))
    }

    return file
  }

  const saveFile = async (file: FileType) => {
    if (!currentProject) return

    const updatedFiles = currentProject.files.map(f => f.id === file.id ? file : f)
    const updatedProject = {
      ...currentProject,
      files: updatedFiles,
      updatedAt: new Date().toISOString(),
    }

    await updateDoc(doc(db, "projects", currentProject.id), {
      files: updatedFiles,
      updatedAt: updatedProject.updatedAt,
    })

    setCurrentProject(updatedProject)
    setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p))
  }

  const deleteFile = async (fileId: string) => {
    if (!currentProject) return

    const updatedFiles = currentProject.files.filter(f => f.id !== fileId)
    const updatedProject = {
      ...currentProject,
      files: updatedFiles,
      updatedAt: new Date().toISOString(),
    }

    await updateDoc(doc(db, "projects", currentProject.id), {
      files: updatedFiles,
      updatedAt: updatedProject.updatedAt,
    })

    setCurrentProject(updatedProject)
    setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p))

    if (currentFile?.id === fileId) {
      setCurrentFile(null)
    }
  }

  useEffect(() => {
    if (user) {
      loadProjects()
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
    setCurrentProject,
    createFile,
    saveFile,
    deleteFile,
    setCurrentFile,
    loadProjects,
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
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface Project {
  id: string;
  name: string;
  description: string;
  files: ProjectFile[];
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectFile {
  id: string;
  name: string;
  content: string;
  language: string;
  path: string;
}

interface EditorContextType {
  // Projects
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  createProject: (name: string, description: string) => Promise<Project>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  
  // Files
  currentFile: ProjectFile | null;
  setCurrentFile: (file: ProjectFile | null) => void;
  createFile: (projectId: string, name: string, content: string, language: string) => Promise<ProjectFile>;
  updateFile: (fileId: string, updates: Partial<ProjectFile>) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  
  // Editor state
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentFile, setCurrentFile] = useState<ProjectFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem("editor-projects");
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects).map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        }));
        setProjects(parsedProjects);
      } catch (error) {
        console.error("Error loading projects:", error);
      }
    }
  }, []);

  // Save projects to localStorage whenever projects change
  useEffect(() => {
    localStorage.setItem("editor-projects", JSON.stringify(projects));
  }, [projects]);

  const createProject = async (name: string, description: string): Promise<Project> => {
    setIsLoading(true);
    setError(null);

    try {
      const newProject: Project = {
        id: Date.now().toString(),
        name,
        description,
        files: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setProjects(prev => [...prev, newProject]);
      setCurrentProject(newProject);
      
      return newProject;
    } catch (error) {
      const errorMessage = "Failed to create project";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, ...updates, updatedAt: new Date() }
          : p
      ));

      if (currentProject?.id === projectId) {
        setCurrentProject(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
      }
    } catch (error) {
      const errorMessage = "Failed to update project";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (projectId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
        setCurrentFile(null);
      }
    } catch (error) {
      const errorMessage = "Failed to delete project";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createFile = async (
    projectId: string, 
    name: string, 
    content: string, 
    language: string
  ): Promise<ProjectFile> => {
    setIsLoading(true);
    setError(null);

    try {
      const newFile: ProjectFile = {
        id: Date.now().toString(),
        name,
        content,
        language,
        path: name,
      };

      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, files: [...p.files, newFile], updatedAt: new Date() }
          : p
      ));

      if (currentProject?.id === projectId) {
        setCurrentProject(prev => prev ? {
          ...prev,
          files: [...prev.files, newFile],
          updatedAt: new Date()
        } : null);
      }

      return newFile;
    } catch (error) {
      const errorMessage = "Failed to create file";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFile = async (fileId: string, updates: Partial<ProjectFile>): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      setProjects(prev => prev.map(p => ({
        ...p,
        files: p.files.map(f => f.id === fileId ? { ...f, ...updates } : f),
        updatedAt: new Date()
      })));

      if (currentProject) {
        setCurrentProject(prev => prev ? {
          ...prev,
          files: prev.files.map(f => f.id === fileId ? { ...f, ...updates } : f),
          updatedAt: new Date()
        } : null);
      }

      if (currentFile?.id === fileId) {
        setCurrentFile(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      const errorMessage = "Failed to update file";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFile = async (fileId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      setProjects(prev => prev.map(p => ({
        ...p,
        files: p.files.filter(f => f.id !== fileId),
        updatedAt: new Date()
      })));

      if (currentProject) {
        setCurrentProject(prev => prev ? {
          ...prev,
          files: prev.files.filter(f => f.id !== fileId),
          updatedAt: new Date()
        } : null);
      }

      if (currentFile?.id === fileId) {
        setCurrentFile(null);
      }
    } catch (error) {
      const errorMessage = "Failed to delete file";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const value: EditorContextType = {
    projects,
    currentProject,
    setCurrentProject,
    createProject,
    updateProject,
    deleteProject,
    currentFile,
    setCurrentFile,
    createFile,
    updateFile,
    deleteFile,
    isLoading,
    error,
    setError,
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
}
