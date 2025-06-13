
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Verificar se todas as variáveis estão definidas
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
  console.log('Current process.env keys:', Object.keys(process.env))
}

let app
let db
let auth
let storage

try {
  if (missingVars.length === 0) {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    auth = getAuth(app)
    storage = getStorage(app)
    console.log('Firebase: Initialized successfully')
  } else {
    console.error('Firebase: Cannot initialize due to missing configuration')
    throw new Error('Firebase configuration incomplete')
  }
} catch (error) {
  console.error('Firebase: Initialization failed:', error)
  throw error
}

export { app, db, auth, storage }
import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Verificar se todas as variáveis de ambiente estão definidas
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
]

const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingVars.length > 0) {
  console.error('Firebase: Missing required environment variables:', missingVars)
  console.error('Please check your .env.local file and ensure all Firebase variables are set')
}

// Inicializar Firebase apenas se as variáveis de ambiente estiverem definidas
let app
let db
let auth
let storage

try {
  if (missingVars.length === 0) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
    db = getFirestore(app)
    auth = getAuth(app)
    storage = getStorage(app)
    console.log('Firebase: Initialized successfully')
  } else {
    console.error('Firebase: Cannot initialize due to missing configuration')
    // Criar objetos mock para evitar erros
    db = null
    auth = null
    storage = null
  }
} catch (error) {
  console.error('Firebase initialization error:', error)
  db = null
  auth = null
  storage = null
}

export { db, auth, storage, app }
export default app
