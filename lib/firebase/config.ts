
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Verificar se as variáveis de ambiente estão definidas
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
]

const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.error('Firebase: Missing required environment variables:', missingVars)
  console.error('Please check your .env.local file and ensure all Firebase variables are set')
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Verificar se a configuração é válida
const isConfigValid = Object.values(firebaseConfig).every(value => value && value !== 'undefined')

if (!isConfigValid) {
  console.error('Firebase: Invalid configuration. Please check your environment variables.')
}

// Initialize Firebase
let app: any = null
let auth: any = null
let db: any = null
let storage: any = null

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)

  // Use emulators in development if enabled
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true" && typeof window !== "undefined") {
    const { connectAuthEmulator } = require("firebase/auth")
    const { connectFirestoreEmulator } = require("firebase/firestore")
    const { connectStorageEmulator } = require("firebase/storage")

    try {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
      connectFirestoreEmulator(db, "localhost", 8080)
      connectStorageEmulator(storage, "localhost", 9199)
      console.log('Firebase: Connected to emulators')
    } catch (emulatorError) {
      console.warn('Firebase: Could not connect to emulators:', emulatorError)
    }
  }

  console.log('Firebase: Initialized successfully')
} catch (error) {
  console.error('Firebase: Initialization failed:', error)
}

// Helper function to check if Firebase is properly initialized
export const isFirebaseInitialized = () => {
  return !!(app && auth && db && storage)
}

// Helper function to create user document in Firestore
export const createUserDocument = async (uid: string, userData: any) => {
  if (!db) {
    throw new Error('Firestore is not initialized')
  }
  
  const { doc, setDoc } = await import('firebase/firestore')
  const userRef = doc(db, 'users', uid)
  
  return setDoc(userRef, {
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 'user', // papel padrão
  }, { merge: true })
}

export { app, auth, db, storage }
