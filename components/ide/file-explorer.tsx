"use client"

import { useState } from "react"
import { useEditor } from "@/context/editor-context"
import { ChevronRight, ChevronDown, File, Folder, Plus, MoreVertical, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type FileTreeItem = {
  id: string
  name: string
  path: string
  type: "file" | "folder"
  language?: string
  children?: FileTreeItem[]
}

export default function FileExplorer() {
  const { currentProject, currentFile, setCurrentFile, createFile } = useEditor()
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({})
  const [newItemPath, setNewItemPath] = useState<string | null>(null)
  const [newItemName, setNewItemName] = useState("")
  const [newItemType, setNewItemType] = useState<"file" | "folder">("file")

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
          <div key={item.id} className="select-none">
            <div
              className={cn(
                "flex items-center py-1 px-2 hover:bg-muted/50 rounded-sm cursor-pointer",
                depth > 0 && `pl-${depth * 4 + 2}px`,
              )}
              onClick={() => toggleFolder(item.path)}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 mr-1 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-1 text-muted-foreground" />
              )}
              <Folder className="w-4 h-4 mr-2 text-blue-500" />
              <span className="text-sm">{item.name}</span>

              <div className="ml-auto flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        startNewItem(item.path, "file")
                      }}
                    >
                      New File
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        startNewItem(item.path, "folder")
                      }}
                    >
                      New Folder
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {isExpanded && item.children && (
              <div className="ml-2">
                {newItemPath === item.path && (
                  <div className="flex items-center py-1 px-2">
                    <Input
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder={newItemType === "file" ? "filename.ext" : "folder name"}
                      className="h-6 text-xs"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") createNewItem()
                        if (e.key === "Escape") cancelNewItem()
                      }}
                    />
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={cancelNewItem}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {renderFileTree(item.children, depth + 1)}
              </div>
            )}
          </div>
        )
      } else {
        // File item
        const isActive = currentFile && currentFile.id === item.id

        return (
          <div
            key={item.id}
            className={cn(
              "flex items-center py-1 px-2 hover:bg-muted/50 rounded-sm cursor-pointer",
              isActive && "bg-muted",
              depth > 0 && `pl-${depth * 4 + 2}px`,
            )}
            onClick={() => handleFileClick(item.id)}
          >
            <File className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{item.name}</span>
          </div>
        )
      }
    })
  }

  if (!currentProject) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No project opened</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">{currentProject.name}</h3>
        <Button variant="ghost" size="icon" onClick={() => startNewItem("", "file")}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {newItemPath === "" && (
        <div className="flex items-center py-1 px-2 mb-2">
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={newItemType === "file" ? "filename.ext" : "folder name"}
            className="h-6 text-xs"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") createNewItem()
              if (e.key === "Escape") cancelNewItem()
            }}
          />
          <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={cancelNewItem}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="mt-2">{renderFileTree(fileTree)}</div>
    </div>
  )
}
