"use client"

import { useState } from "react"
import { useEditor } from "@/context/editor-context"
import {
  ChevronRight,
  ChevronDown,
  Folder,
  Plus,
  MoreVertical,
  X,
  Code,
  Settings,
  FileText,
  Package,
  Database,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  SidebarProvider,
  Sidebar as SidebarComponent,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/firebase/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectSelector } from "@/components/editor/project-selector"

type FileTreeItem = {
  id: string
  name: string
  path: string
  type: "file" | "folder"
  language?: string
  children?: FileTreeItem[]
}

export function Sidebar() {
  const { currentProject, currentFile, setCurrentFile, createFile } = useEditor()
  const { user } = useAuth()
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({})
  const [newItemPath, setNewItemPath] = useState<string | null>(null)
  const [newItemName, setNewItemName] = useState("")
  const [newItemType, setNewItemType] = useState<"file" | "folder">("file")
  const [activeTab, setActiveTab] = useState("files")

  // Build file tree from flat file list
  const buildFileTree = () => {
    if (!currentProject) return []

    const tree: FileTreeItem[] = []
    const map: Record<string, FileTreeItem> = {}

    // First pass: create all folders
    currentProject.files.forEach((file) => {
      const pathParts = file.path.split("/")
      let currentPath = ""

      // Create folder nodes
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i]
        const parentPath = currentPath
        currentPath = currentPath ? `${currentPath}/${part}` : part

        if (!map[currentPath]) {
          const folderItem: FileTreeItem = {
            id: `folder_${currentPath}`,
            name: part,
            path: currentPath,
            type: "folder",
            children: [],
          }
          map[currentPath] = folderItem

          if (parentPath) {
            map[parentPath].children = map[parentPath].children || []
            map[parentPath].children!.push(folderItem)
          } else {
            tree.push(folderItem)
          }
        }
      }
    })

    // Second pass: add files to their parent folders
    currentProject.files.forEach((file) => {
      const pathParts = file.path.split("/")
      const fileName = pathParts.pop()!
      const parentPath = pathParts.join("/")

      const fileItem: FileTreeItem = {
        id: file.id,
        name: fileName,
        path: file.path,
        type: "file",
        language: file.language,
      }

      if (parentPath) {
        map[parentPath].children = map[parentPath].children || []
        map[parentPath].children!.push(fileItem)
      } else {
        tree.push(fileItem)
      }
    })

    return tree
  }

  const fileTree = buildFileTree()

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }))
  }

  const handleFileClick = (fileId: string) => {
    if (!currentProject) return
    const file = currentProject.files.find((f) => f.id === fileId)
    if (file) {
      setCurrentFile(file)
    }
  }

  const startNewItem = (path: string, type: "file" | "folder") => {
    setNewItemPath(path)
    setNewItemType(type)
    setNewItemName("")
  }

  const cancelNewItem = () => {
    setNewItemPath(null)
    setNewItemName("")
  }

  const createNewItem = async () => {
    if (!newItemPath || !newItemName || !currentProject) return

    if (newItemType === "file") {
      const filePath = newItemPath ? `${newItemPath}/${newItemName}` : newItemName
      const fileExtension = newItemName.split(".").pop() || ""

      let language = "plaintext"
      if (fileExtension === "js") language = "javascript"
      else if (fileExtension === "ts") language = "typescript"
      else if (fileExtension === "jsx" || fileExtension === "tsx") language = "typescriptreact"
      else if (fileExtension === "html") language = "html"
      else if (fileExtension === "css") language = "css"
      else if (fileExtension === "json") language = "json"
      else if (fileExtension === "md") language = "markdown"
      else if (fileExtension === "py") language = "python"

      await createFile(currentProject.id, {
        name: newItemName,
        content: "",
        language,
        path: filePath,
        lastModified: Date.now(),
      })
    }

    // For folders, we don't need to do anything as they're created implicitly
    // when files are added with paths

    cancelNewItem()
  }

  const renderFileTree = (items: FileTreeItem[], depth = 0) => {
    return items.map((item) => {
      if (item.type === "folder") {
        const isExpanded = expandedFolders[item.path] !== false // Default to expanded

        return (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton onClick={() => toggleFolder(item.path)} className="justify-start">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
              <Folder className="h-4 w-4 shrink-0 text-blue-500 mr-2" />
              <span className="truncate">{item.name}</span>
            </SidebarMenuButton>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 absolute right-1 top-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => startNewItem(item.path, "file")}>New File</DropdownMenuItem>
                <DropdownMenuItem onClick={() => startNewItem(item.path, "folder")}>New Folder</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isExpanded && (
              <div className="ml-4 mt-1">
                {newItemPath === item.path && (
                  <div className="flex items-center py-1">
                    <Input
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder={newItemType === "file" ? "filename.ext" : "folder name"}
                      className="h-7 text-xs"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") createNewItem()
                        if (e.key === "Escape") cancelNewItem()
                      }}
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 ml-1" onClick={cancelNewItem}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {item.children && renderFileTree(item.children, depth + 1)}
              </div>
            )}
          </SidebarMenuItem>
        )
      } else {
        // File item
        const isActive = currentFile && currentFile.id === item.id

        let fileIcon = <FileText className="h-4 w-4 shrink-0 mr-2" />
        if (item.language === "javascript" || item.language === "typescript" || item.language === "typescriptreact") {
          fileIcon = <Code className="h-4 w-4 shrink-0 mr-2" />
        } else if (item.language === "json") {
          fileIcon = <Database className="h-4 w-4 shrink-0 mr-2" />
        } else if (item.language === "css") {
          fileIcon = <Package className="h-4 w-4 shrink-0 mr-2" />
        }

        return (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton isActive={isActive} onClick={() => handleFileClick(item.id)} className="justify-start">
              {fileIcon}
              <span className="truncate">{item.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      }
    })
  }

  return (
    <SidebarProvider>
      <SidebarComponent>
        <SidebarHeader className="border-b">
          <ProjectSelector />
        </SidebarHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mx-2 mt-2">
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
          </TabsList>

          <SidebarContent>
            <TabsContent value="files" className="m-0 p-0">
              <SidebarGroup>
                <div className="flex items-center justify-between px-4 py-2">
                  <SidebarGroupLabel>Project Files</SidebarGroupLabel>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startNewItem("", "file")}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <SidebarGroupContent>
                  <SidebarMenu>
                    {newItemPath === "" && (
                      <div className="flex items-center px-4 py-1">
                        <Input
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          placeholder={newItemType === "file" ? "filename.ext" : "folder name"}
                          className="h-7 text-xs"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") createNewItem()
                            if (e.key === "Escape") cancelNewItem()
                          }}
                        />
                        <Button variant="ghost" size="icon" className="h-7 w-7 ml-1" onClick={cancelNewItem}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}

                    {currentProject ? (
                      fileTree.length > 0 ? (
                        renderFileTree(fileTree)
                      ) : (
                        <div className="px-4 py-2 text-sm text-muted-foreground">
                          No files yet. Create a new file to get started.
                        </div>
                      )
                    ) : (
                      <div className="px-4 py-2 text-sm text-muted-foreground">
                        No project selected. Create or select a project to start.
                      </div>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </TabsContent>

            <TabsContent value="components" className="m-0 p-0">
              <SidebarGroup>
                <SidebarGroupLabel className="px-4 py-2">UI Components</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start">
                        <div className="h-4 w-4 rounded border border-foreground/20 mr-2"></div>
                        <span>Button</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start">
                        <div className="h-4 w-4 rounded border border-foreground/20 mr-2"></div>
                        <span>Card</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start">
                        <div className="h-4 w-4 rounded border border-foreground/20 mr-2"></div>
                        <span>Input</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </TabsContent>

            <TabsContent value="assets" className="m-0 p-0">
              <SidebarGroup>
                <SidebarGroupLabel className="px-4 py-2">Project Assets</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start">
                        <div className="h-4 w-4 bg-blue-500/20 text-blue-500 flex items-center justify-center rounded mr-2">
                          <span className="text-[10px]">IMG</span>
                        </div>
                        <span>logo.png</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start">
                        <div className="h-4 w-4 bg-blue-500/20 text-blue-500 flex items-center justify-center rounded mr-2">
                          <span className="text-[10px]">IMG</span>
                        </div>
                        <span>banner.jpg</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </TabsContent>
          </SidebarContent>
        </Tabs>

        <SidebarFooter className="border-t p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL || ""} />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="ml-2 overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.displayName || user?.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      </SidebarComponent>
    </SidebarProvider>
  )
}
