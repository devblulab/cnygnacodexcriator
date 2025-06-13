"use client"
import { useRouter } from "next/navigation"
import { useEditor } from "@/context/editor-context"
import { useAuth } from "@/lib/firebase/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Play,
  Save,
  Settings,
  Moon,
  Sun,
  Upload,
  Plus,
  User,
  LogOut,
  TerminalIcon,
  Code,
  Share2,
  Download,
  Github,
  Sparkles,
} from "lucide-react"
import { useTheme } from "next-themes"

interface EditorHeaderProps {
  toggleTerminal: () => void
  showTerminal: boolean
  toggleAI: () => void
  showAI: boolean
}

export function EditorHeader({ toggleTerminal, showTerminal, toggleAI, showAI }: EditorHeaderProps) {
  const { theme, setTheme } = useTheme()
  const { currentProject, currentFile, saveFile } = useEditor()
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSave = async () => {
    if (currentFile) {
      await saveFile(currentFile)
    }
  }

  const handleRun = () => {
    // Implement run functionality
    console.log("Run project")
  }

  const handleDeploy = () => {
    // Implement deploy functionality
    console.log("Deploy project")
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="flex items-center space-x-2">
        <div className="font-bold text-lg mr-4">QuantumCode</div>

        <Button variant="outline" size="sm" onClick={handleSave} disabled={!currentFile}>
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>

        <Button variant="outline" size="sm" onClick={handleRun} disabled={!currentProject}>
          <Play className="w-4 h-4 mr-1" />
          Run
        </Button>

        <Button variant="outline" size="sm" onClick={handleDeploy} disabled={!currentProject}>
          <Upload className="w-4 h-4 mr-1" />
          Deploy
        </Button>

        <Button variant={showTerminal ? "secondary" : "outline"} size="sm" onClick={toggleTerminal}>
          <TerminalIcon className="w-4 h-4 mr-1" />
          Terminal
        </Button>

        <Button variant={showAI ? "secondary" : "outline"} size="sm" onClick={toggleAI}>
          <Sparkles className="w-4 h-4 mr-1" />
          AI Assistant
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Create New</DropdownMenuLabel>
            <DropdownMenuItem>
              <Code className="w-4 h-4 mr-2" />
              Project
            </DropdownMenuItem>
            <DropdownMenuItem>
              <File className="w-4 h-4 mr-2" />
              File
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Folder className="w-4 h-4 mr-2" />
              Folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Share</DropdownMenuLabel>
            <DropdownMenuItem>
              <Github className="w-4 h-4 mr-2" />
              Push to GitHub
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="w-4 h-4 mr-2" />
              Export Project
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link className="w-4 h-4 mr-2" />
              Copy Share Link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuItem>Keyboard Shortcuts</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme("light")}>Light Theme</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>Dark Theme</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>System Theme</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.email || "User"}</DropdownMenuLabel>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Projects</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function File(props: any) {
  return <FileText {...props} />
}

function Folder(props: any) {
  return <FolderIcon {...props} />
}

function Link(props: any) {
  return <LinkIcon {...props} />
}

function FileText(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  )
}

function FolderIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    </svg>
  )
}

function LinkIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}
