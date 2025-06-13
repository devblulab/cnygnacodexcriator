import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"

// Função para verificar se estamos no cliente
const isClient = typeof window !== 'undefined'

// Verificar se as variáveis de ambiente estão definidas
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
]

// Carregar variáveis de ambiente
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC5yiVDwIKfoJw1F6-FJnwtDdVYaRFhysk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "liviaos.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "liviaos",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "liviaos.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "380153424750",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:380153424750:web:cdf7e427518ccd64d0ef7f",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-4KYHL3LD0B",
}

// Verificar se alguma variável está faltando
const missingVars = requiredEnvVars.filter(varName => !firebaseConfig[varName.replace('NEXT_PUBLIC_FIREBASE_', '').toLowerCase().replace('_', '')])

if (missingVars.length > 0 && isClient) {
  console.error('Firebase: Missing required environment variables:', missingVars)
  console.log('Please check your .env.local file and ensure all Firebase variables are set')
}

// Inicializar Firebase app
let app
let auth
let db

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

  // Inicializar Auth
  auth = getAuth(app)

  // Inicializar Firestore
  db = getFirestore(app)

  if (isClient) {
    console.log('Firebase: Initialized successfully')
  }
} catch (error) {
  console.error('Firebase: Initialization failed:', error)
  if (isClient) {
    // Criar instâncias vazias para evitar erros
    auth = null
    db = null
  }
}

// Conectar aos emuladores se necessário (apenas em desenvolvimento)
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true' && isClient && auth && db) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, 'localhost', 8080)
  } catch (error) {
    console.log('Emulators already connected or not available')
  }
}

export const getFirebaseFirestore = async () => {
  try {
    return db
  } catch (error) {
    console.error('Error getting Firestore instance:', error)
    return null
  }
}

export { auth, db }
export default app