"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function UserManagement() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("basic")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  const handleAddUser = async () => {
    setLoading(true)
    setStatus({ type: null, message: "" })

    try {
      const response = await fetch("/api/admin/add-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add user")
      }

      setStatus({
        type: "success",
        message: data.message || "User added successfully",
      })

      // Clear form
      setEmail("")
      setPassword("")
      setRole("basic")
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "An error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSetRole = async () => {
    if (!email || !role) {
      setStatus({
        type: "error",
        message: "Email and role are required",
      })
      return
    }

    setLoading(true)
    setStatus({ type: null, message: "" })

    try {
      const response = await fetch("/api/admin/set-user-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to set user role")
      }

      setStatus({
        type: "success",
        message: data.message || "User role updated successfully",
      })
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "An error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  // Add the specific user with admin permissions
  const addSpecificUser = async () => {
    setLoading(true)
    setStatus({ type: null, message: "" })

    try {
      const response = await fetch("/api/admin/set-user-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "guga1trance@gmail.com",
          role: "admin",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to set user role")
      }

      setStatus({
        type: "success",
        message: `User guga1trance@gmail.com has been assigned admin role with total permissions`,
      })
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "An error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add Specific User</CardTitle>
          <CardDescription>Add guga1trance@gmail.com with total permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={addSpecificUser} disabled={loading} className="w-full">
            {loading ? "Processing..." : "Add guga1trance@gmail.com as Admin"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Add new users or update existing user roles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password (for new users)</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin (Total Permissions)</SelectItem>
                <SelectItem value="platinum">Client - Platinum</SelectItem>
                <SelectItem value="diamond">Client - Diamond</SelectItem>
                <SelectItem value="nirvana">Client - Nirvana</SelectItem>
                <SelectItem value="basic">Basic User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status.type && (
            <Alert variant={status.type === "error" ? "destructive" : "default"}>
              {status.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              <AlertTitle>{status.type === "error" ? "Error" : "Success"}</AlertTitle>
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleSetRole} disabled={loading || !email || !role}>
            {loading ? "Processing..." : "Update Role"}
          </Button>
          <Button onClick={handleAddUser} disabled={loading || !email || !password || !role}>
            {loading ? "Processing..." : "Add New User"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
