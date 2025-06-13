
import { db } from './config'
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore'

export interface UserData {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  role: 'user' | 'admin'
  createdAt: any
  updatedAt: any
  lastLogin?: any
  emailVerified?: boolean
}

// Criar documento de usuário no Firestore
export const createUserInFirestore = async (uid: string, userData: Partial<UserData>) => {
  if (!db) {
    throw new Error('Firestore não está inicializado')
  }

  const userRef = doc(db, 'users', uid)
  
  const newUser: UserData = {
    uid,
    email: userData.email || '',
    displayName: userData.displayName || '',
    photoURL: userData.photoURL || '',
    role: userData.role || 'user',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    emailVerified: userData.emailVerified || false,
  }

  await setDoc(userRef, newUser, { merge: true })
  return newUser
}

// Buscar usuário por UID
export const getUserByUid = async (uid: string): Promise<UserData | null> => {
  if (!db) {
    throw new Error('Firestore não está inicializado')
  }

  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)
  
  if (userSnap.exists()) {
    return userSnap.data() as UserData
  }
  
  return null
}

// Buscar usuário por email
export const getUserByEmail = async (email: string): Promise<UserData | null> => {
  if (!db) {
    throw new Error('Firestore não está inicializado')
  }

  const usersRef = collection(db, 'users')
  const q = query(usersRef, where('email', '==', email))
  const querySnapshot = await getDocs(q)
  
  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0]
    return userDoc.data() as UserData
  }
  
  return null
}

// Atualizar último login do usuário
export const updateUserLastLogin = async (uid: string) => {
  if (!db) {
    throw new Error('Firestore não está inicializado')
  }

  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, {
    lastLogin: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

// Atualizar perfil do usuário
export const updateUserProfile = async (uid: string, updates: Partial<UserData>) => {
  if (!db) {
    throw new Error('Firestore não está inicializado')
  }

  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

// Verificar se usuário existe
export const userExists = async (uid: string): Promise<boolean> => {
  if (!db) {
    throw new Error('Firestore não está inicializado')
  }

  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)
  return userSnap.exists()
}

// Listar todos os usuários (apenas para admins)
export const getAllUsers = async (): Promise<UserData[]> => {
  if (!db) {
    throw new Error('Firestore não está inicializado')
  }

  const usersRef = collection(db, 'users')
  const querySnapshot = await getDocs(usersRef)
  
  return querySnapshot.docs.map(doc => doc.data() as UserData)
}

// Definir papel do usuário (apenas para admins)
export const setUserRole = async (uid: string, role: 'user' | 'admin') => {
  if (!db) {
    throw new Error('Firestore não está inicializado')
  }

  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, {
    role,
    updatedAt: serverTimestamp()
  })
}
