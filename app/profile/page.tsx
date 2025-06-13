import UserProfile from "@/components/user/profile"

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <div className="max-w-md">
        <UserProfile />
      </div>
    </div>
  )
}
