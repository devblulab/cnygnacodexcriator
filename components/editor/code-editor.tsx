"use client"

import { useEffect, useRef, useState } from "react"
import { useEditor } from "@/context/editor-context"
import { useTheme } from "next-themes"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Editor from "@monaco-editor/react"

export function CodeEditor() {
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
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (currentFile) {
      setContent(currentFile.content)
    }
  }, [currentFile])

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // Configure editor
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderLineHighlight: "all",
      lineNumbers: "on",
      renderWhitespace: "selection",
      tabSize: 2,
      wordWrap: "on",
    })
  }

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
      <div className="flex-1">
        <Editor
          height="100%"
          language={currentFile.language}
          value={content}
          onChange={(value) => setContent(value || "")}
          theme={theme === "dark" ? "vs-dark" : "light"}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            renderLineHighlight: "all",
            lineNumbers: "on",
            renderWhitespace: "selection",
            tabSize: 2,
            wordWrap: "on",
          }}
        />
      </div>
    </div>
  )
}
