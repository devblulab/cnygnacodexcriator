"use client"

import { useState, useEffect, useRef } from "react"
import { useEditor } from "@/context/editor-context"
import { useTheme } from "next-themes"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

// This is a placeholder for the Monaco Editor
// In a real implementation, you would use @monaco-editor/react
export default function Editor() {
  const { currentFile, saveFile } = useEditor()
  const { theme } = useTheme()
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)

  useEffect(() => {
    // Simulate loading Monaco Editor
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (currentFile) {
      setContent(currentFile.content)
    }
  }, [currentFile])

  const handleSave = async () => {
    if (currentFile) {
      await saveFile({
        ...currentFile,
        content,
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!currentFile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p className="mb-4">No file selected</p>
        <p className="text-sm">Select a file from the file explorer or create a new file</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="text-sm font-medium">{currentFile.path}</div>
        <Button size="sm" onClick={handleSave}>
          Save
        </Button>
      </div>
      <div className="flex-1 p-4 font-mono text-sm overflow-auto">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full bg-transparent resize-none focus:outline-none"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
