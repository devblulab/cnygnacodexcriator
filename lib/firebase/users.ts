
import { Timestamp } from "firebase/firestore"

export enum UserRole {
  ADMIN = "admin",
  MODERATOR = "moderator", 
  USER = "user",
}

export interface UserData {
  uid: string
  email: string
  displayName: string
  photoURL: string
  role: UserRole
  createdAt: Timestamp | any
  updatedAt: Timestamp | any
  lastLoginAt?: Timestamp | any
  isActive?: boolean
  preferences?: {
    theme?: "light" | "dark" | "system"
    language?: string
    notifications?: boolean
  }
  projects?: string[]
  collaborations?: string[]
}

export interface CreateUserData {
  email: string
  displayName: string
  photoURL?: string
  role?: UserRole
}

export interface UpdateUserData {
  displayName?: string
  photoURL?: string
  role?: UserRole
  isActive?: boolean
  preferences?: UserData["preferences"]
}
export type UserRole = "admin" | "user" | "moderator"

export interface UserData {
  uid: string
  email: string
  displayName: string
  photoURL: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
  isActive?: boolean
  lastLoginAt?: Date
}

export interface ProjectData {
  id: string
  name: string
  description: string
  ownerId: string
  collaborators: string[]
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  files: FileData[]
  settings: ProjectSettings
}

export interface FileData {
  id: string
  name: string
  path: string
  content: string
  language: string
  size: number
  createdAt: Date
  updatedAt: Date
}

export interface ProjectSettings {
  theme: string
  fontSize: number
  tabSize: number
  autoSave: boolean
  livePreview: boolean
}
