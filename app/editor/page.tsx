"use client"

import { useState } from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Play, Save, FileText, Settings, Home, Download } from "lucide-react"
import Link from "next/link"
import { useEditor } from "@/context/editor-context"
import { CodeEditor } from "@/components/editor/code-editor"
import Preview from "@/components/editor/preview"
import Terminal from "@/components/editor/terminal"
import FileExplorer from "@/components/ide/file-explorer"

export default function EditorPage() {
  const { currentProject, currentFile, saveFile } = useEditor()
  const [activeTab, setActiveTab] = useState("editor")

  const handleSave = async () => {
    if (currentFile) {
      await saveFile(currentFile)
    }
  }

  const handleRun = () => {
    setActiveTab("preview")
  }

  const downloadProject = () => {
    if (!currentProject) return

    const projectData = {
      name: currentProject.name,
      description: currentProject.description,
      files: currentProject.files.map(f => ({
        name: f.name,
        content: f.content,
        path: f.path,
        language: f.language
      }))
    }

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentProject.name}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <Home className="h-4 w-4 mr-2" />
              QuantumCode
            </Button>
          </Link>
          <span className="text-sm text-muted-foreground">|</span>
          <span className="text-sm font-medium">
            {currentProject ? currentProject.name : "Nenhum Projeto"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSave} disabled={!currentFile}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
          <Button variant="outline" size="sm" onClick={handleRun} disabled={!currentProject}>
            <Play className="h-4 w-4 mr-2" />
            Executar
          </Button>
          <Button variant="outline" size="sm" onClick={downloadProject} disabled={!currentProject}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Sidebar - File Explorer */}
          <ResizablePanel defaultSize={20} minSize={15}>
            <div className="h-full border-r bg-muted/50">
              <div className="p-4">
                <h3 className="text-sm font-semibold mb-3">Explorador de Arquivos</h3>
                <FileExplorer />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Main Editor Area */}
          <ResizablePanel defaultSize={80}>
            <div className="flex flex-col h-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b">
                  <TabsTrigger value="editor">
                    <Code className="h-4 w-4 mr-2" />
                    Editor
                  </TabsTrigger>
                  <TabsTrigger value="preview">
                    <Play className="h-4 w-4 mr-2" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="terminal">
                    <Settings className="h-4 w-4 mr-2" />
                    Terminal
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="editor" className="flex-1 p-0">
                  <CodeEditor />
                </TabsContent>

                <TabsContent value="preview" className="flex-1 p-0">
                  <Preview />
                </TabsContent>

                <TabsContent value="terminal" className="flex-1 p-0">
                  <Terminal />
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 text-xs border-t bg-muted/50">
        <div className="flex items-center space-x-4">
          <div className="px-2">
            {currentFile ? `${currentFile.language} • ${currentFile.name}` : "Nenhum arquivo"}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="px-2">
            {currentFile && new Date(currentFile.lastModified).toLocaleString('pt-BR')}
          </div>
          <div className="px-2">QuantumCode v0.1.0</div>
        </div>
      </div>
    </div>
  )
}