"use client"

import { useState, useEffect } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import Toolbar from "@/components/ide/toolbar"
import FileExplorer from "@/components/ide/file-explorer"
import Editor from "@/components/ide/editor"
import Terminal from "@/components/ide/terminal"
import AIAssistant from "@/components/ide/ai-assistant"
import StatusBar from "@/components/ide/status-bar"
import ProjectSelector from "@/components/ide/project-selector"
import { useEditor } from "@/context/editor-context"
import { useAuth } from "@/lib/firebase/auth-context"
import { Loader2, WifiOff } from "lucide-react"

export default function IDELayout() {
  const { loading } = useEditor()
  const { networkError } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <h2 className="text-xl font-medium">Carregando QuantumCode...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <Toolbar />
      <ProjectSelector />

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <FileExplorer />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={60}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={70}>
                <Editor />
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={30}>
                <Terminal />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
            {networkError ? (
              <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Network Connection Issue</h3>
                <p className="text-muted-foreground mb-4">
                  AI Assistant requires an internet connection. Please check your connection and try again.
                </p>
              </div>
            ) : (
              <AIAssistant />
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <StatusBar networkStatus={networkError ? "offline" : "online"} />
    </div>
  )
}
