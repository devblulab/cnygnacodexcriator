
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

// Initialize Firebase Admin SDK
let adminApp
if (getApps().length === 0) {
  // For production, you would need to set up service account credentials
  // For now, we'll use a basic configuration
  try {
    adminApp = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    })
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error)
  }
} else {
  adminApp = getApps()[0]
}

export const adminAuth = adminApp ? getAuth(adminApp) : null

// Export a default to prevent errors
export default adminApp
