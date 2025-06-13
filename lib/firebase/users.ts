
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
