import { type NextRequest, NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase/admin"

export async function POST(request: NextRequest) {
  try {
    // Check if request is from an admin (you should implement proper authentication)
    // This is a simplified example
    const { email, role } = await request.json()

    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 })
    }

    // Get user by email
    const userRecord = await adminAuth.getUserByEmail(email)

    // Set custom claims based on role
    let customClaims = {}

    switch (role) {
      case "admin":
        customClaims = { admin: true, premissaoTotal: true }
        break
      case "platinum":
        customClaims = { client: true, tier: "platinum" }
        break
      case "diamond":
        customClaims = { client: true, tier: "diamond" }
        break
      case "nirvana":
        customClaims = { client: true, tier: "nirvana" }
        break
      default:
        customClaims = { client: true, tier: "basic" }
    }

    // Set custom claims for the user
    await adminAuth.setCustomUserClaims(userRecord.uid, customClaims)

    return NextResponse.json({
      success: true,
      message: `User ${email} has been assigned the ${role} role`,
    })
  } catch (error: any) {
    console.error("Error setting user role:", error)
    return NextResponse.json({ error: error.message || "Failed to set user role" }, { status: 500 })
  }
}
