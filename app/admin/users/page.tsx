import UserManagement from "@/components/admin/user-management"

export default function AdminUsersPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <UserManagement />
    </div>
  )
}
