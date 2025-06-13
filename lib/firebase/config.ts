import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { firebaseConfig, isConfigValid, useEmulators } from "./client-config"

let app: any = null
let auth: any = null
let firestore: any = null

// Inicializar Firebase apenas se a configuração for válida
if (isConfigValid) {
  try {
    // Inicializar app apenas se ainda não foi inicializado
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

    // Inicializar Auth
    auth = getAuth(app)

    // Inicializar Firestore  
    firestore = getFirestore(app)

    // Conectar aos emuladores se necessário (apenas em desenvolvimento)
    if (useEmulators && typeof window !== 'undefined') {
      try {
        connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
        connectFirestoreEmulator(firestore, "localhost", 8080)
        console.log("Firebase: Connected to emulators")
      } catch (error) {
        console.log("Firebase: Emulators already connected or not available")
      }
    }

    console.log("Firebase: Initialized successfully")
  } catch (error) {
    console.error("Firebase: Failed to initialize:", error)
  }
} else {
  console.error("Firebase: Cannot initialize due to missing configuration")
}

export { auth, app }

export async function getFirebaseFirestore() {
  if (!firestore) {
    console.error("Firestore is not initialized")
    return null
  }
  return firestore
}

// Função para verificar se o Firebase está pronto
export function isFirebaseReady() {
  return !!(app && auth && firestore && isConfigValid)
}