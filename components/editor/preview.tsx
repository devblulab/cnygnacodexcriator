"use client"

import { useEffect, useRef, useState } from "react"
import { useEditor } from "@/context/editor-context"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Preview() {
  const { currentProject, currentFile } = useEditor()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [key, setKey] = useState(Date.now())

  useEffect(() => {
    if (currentProject) {
      setLoading(true)
      setError(null)

      // In a real implementation, we would compile the project and generate a preview
      // For now, we'll just simulate loading
      const timer = setTimeout(() => {
        setLoading(false)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [currentProject, key])

  const refreshPreview = () => {
    setKey(Date.now())
  }

  const generatePreviewContent = () => {
    if (!currentProject) return ""

    // In a real implementation, we would compile the project and generate HTML
    // For now, we'll just create a simple HTML document with the current file content
    const htmlFile = currentProject.files.find((f) => f.path.endsWith(".html"))
    const cssFiles = currentProject.files.filter((f) => f.path.endsWith(".css"))
    const jsFiles = currentProject.files.filter((f) => f.path.endsWith(".js") || f.path.endsWith(".jsx"))

    let html = htmlFile?.content || "<html><body><div id='root'></div></body></html>"
    const css = cssFiles.map((f) => `<style>${f.content}</style>`).join("\n")
    const js = jsFiles.map((f) => `<script>${f.content}</script>`).join("\n")

    // If the current file is HTML, use it as the main content
    if (currentFile && currentFile.path.endsWith(".html")) {
      html = currentFile.content
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${css}
        </head>
        <body>
          ${html}
          ${js}
        </body>
      </html>
    `
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-destructive">
        <p className="mb-4">Error loading preview</p>
        <p className="text-sm mb-4">{error}</p>
        <Button variant="outline" size="sm" onClick={refreshPreview}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p className="mb-4">No project selected</p>
        <p className="text-sm">Select a project to preview</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="text-sm font-medium">Preview</div>
        <Button size="sm" variant="outline" onClick={refreshPreview}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      <div className="flex-1 bg-white">
        <iframe
          key={key}
          ref={iframeRef}
          className="w-full h-full border-0"
          srcDoc={generatePreviewContent()}
          sandbox="allow-scripts allow-same-origin"
          title="Preview"
        />
      </div>
    </div>
  )
}
