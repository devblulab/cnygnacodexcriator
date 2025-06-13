"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/firebase/auth-context"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

interface UserProfile {
  displayName: string
  email: string
  photoURL: string
  role: string
  createdAt: any
  lastLogin: any
}

export default function UserProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const userRef = doc(db, "users", user.uid)
        const docSnap = await getDoc(userRef)

        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile)
        } else {
          setError("User profile not found")
        }
      } catch (err: any) {
        console.error("Error fetching user profile:", err)
        setError(err.message || "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [user])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-32" />
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load profile</CardDescription>
        </CardHeader>
        <CardContent>{error}</CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Not Found</CardTitle>
          <CardDescription>User profile information is not available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>Your account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.photoURL || "/placeholder.svg"} alt={profile.displayName || profile.email} />
            <AvatarFallback>
              {profile.displayName
                ? profile.displayName.charAt(0).toUpperCase()
                : profile.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-medium">{profile.displayName || "User"}</h3>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Role</div>
            <div className="capitalize">{profile.role}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Account Created</div>
            <div>{profile.createdAt?.toDate().toLocaleDateString() || "N/A"}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Last Login</div>
            <div>{profile.lastLogin?.toDate().toLocaleDateString() || "N/A"}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
