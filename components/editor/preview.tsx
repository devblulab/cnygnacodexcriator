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
"use client"

import { useEditor } from "@/context/editor-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"

export default function Preview() {
  const { currentFile, currentProject } = useEditor()
  const [previewContent, setPreviewContent] = useState("")
  const [key, setKey] = useState(0)

  useEffect(() => {
    if (currentProject && currentProject.files.length > 0) {
      // Buscar o arquivo HTML principal
      const htmlFile = currentProject.files.find(f => 
        f.name.toLowerCase().includes('index.html') || 
        f.language === 'html'
      )
      
      if (htmlFile) {
        let content = htmlFile.content
        
        // Injetar CSS se existir
        const cssFiles = currentProject.files.filter(f => f.language === 'css')
        if (cssFiles.length > 0) {
          const cssContent = cssFiles.map(f => f.content).join('\n')
          content = content.replace(
            '</head>',
            `<style>\n${cssContent}\n</style>\n</head>`
          )
        }
        
        // Injetar JavaScript se existir
        const jsFiles = currentProject.files.filter(f => f.language === 'javascript')
        if (jsFiles.length > 0) {
          const jsContent = jsFiles.map(f => f.content).join('\n')
          content = content.replace(
            '</body>',
            `<script>\n${jsContent}\n</script>\n</body>`
          )
        }
        
        setPreviewContent(content)
      } else if (currentFile) {
        // Se não há arquivo HTML, mostrar o arquivo atual
        if (currentFile.language === 'html') {
          setPreviewContent(currentFile.content)
        } else {
          setPreviewContent(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Preview - ${currentFile.name}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        padding: 20px; 
                        background-color: #f5f5f5;
                    }
                    pre { 
                        background: #fff; 
                        padding: 15px; 
                        border-radius: 5px; 
                        border: 1px solid #ddd;
                        overflow-x: auto;
                    }
                    .file-info {
                        background: #007bff;
                        color: white;
                        padding: 10px;
                        border-radius: 5px;
                        margin-bottom: 15px;
                    }
                </style>
            </head>
            <body>
                <div class="file-info">
                    <h3>📄 ${currentFile.name}</h3>
                    <p>Linguagem: ${currentFile.language}</p>
                    <p>Tamanho: ${currentFile.content.length} caracteres</p>
                </div>
                <pre><code>${currentFile.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
            </body>
            </html>
          `)
        }
      }
    } else {
      setPreviewContent(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>QuantumCode Preview</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                    padding: 50px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    min-height: 100vh;
                    margin: 0;
                }
                .message {
                    background: rgba(255,255,255,0.1);
                    padding: 30px;
                    border-radius: 10px;
                    display: inline-block;
                }
            </style>
        </head>
        <body>
            <div class="message">
                <h1>🚀 QuantumCode Preview</h1>
                <p>Selecione um projeto e arquivo para visualizar aqui!</p>
            </div>
        </body>
        </html>
      `)
    }
  }, [currentFile, currentProject])

  const refreshPreview = () => {
    setKey(prev => prev + 1)
  }

  const openInNewTab = () => {
    const newWindow = window.open()
    if (newWindow) {
      newWindow.document.write(previewContent)
      newWindow.document.close()
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <h3 className="font-medium">Preview</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshPreview}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={openInNewTab}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 bg-white">
        <iframe
          key={key}
          srcDoc={previewContent}
          className="w-full h-full border-0"
          title="Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  )
}
