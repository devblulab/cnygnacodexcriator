import { type NextRequest, NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase/admin"

export async function POST(request: NextRequest) {
  try {
    // Check if request is from an admin (implement proper authentication)
    const { email, password, role } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Create user
    const userRecord = await adminAuth.createUser({
      email,
      password,
      emailVerified: true,
    })

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
      message: `User ${email} has been created with ${role} role`,
      uid: userRecord.uid,
    })
  } catch (error: any) {
    console.error("Error adding user:", error)
    return NextResponse.json({ error: error.message || "Failed to add user" }, { status: 500 })
  }
}
