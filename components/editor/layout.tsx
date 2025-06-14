"use client"

import React, { useState } from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Code,
  Eye,
  Terminal,
  Bot,
  Settings,
  Play,
  Square,
  RefreshCw
} from "lucide-react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { CodeEditor } from "./code-editor"
import { Preview } from "./preview"
import { Terminal as TerminalComponent } from "./terminal"
import { V0Chat } from "@/components/v0-chat/v0-chat"
import { useEditor } from "@/context/editor-context"

export function EditorLayout() {
  const { currentProject, isRunning, startProject, stopProject } = useEditor()
  const [activeTab, setActiveTab] = useState("code")
  const [showChat, setShowChat] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r bg-sidebar">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="h-12 border-b bg-background flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Badge variant={currentProject ? "default" : "secondary"}>
                {currentProject ? currentProject.name : "No Project"}
              </Badge>
              {currentProject && (
                <Badge variant={isRunning ? "default" : "secondary"} className="gap-1">
                  <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-green-500" : "bg-gray-400"}`} />
                  {isRunning ? "Running" : "Stopped"}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentProject && (
                <>
                  {!isRunning ? (
                    <Button
                      size="sm"
                      onClick={startProject}
                      className="gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Run
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={stopProject}
                      className="gap-2"
                    >
                      <Square className="w-4 h-4" />
                      Stop
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Restart
                  </Button>
                </>
              )}

              <Button
                size="sm"
                variant={showChat ? "default" : "outline"}
                onClick={() => setShowChat(!showChat)}
                className="gap-2"
              >
                <Bot className="w-4 h-4" />
                AI Assistant
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex">
            <ResizablePanelGroup direction="horizontal" className="flex-1">
              {/* Main Editor Panel */}
              <ResizablePanel defaultSize={showChat ? 60 : 100} minSize={30}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                  <div className="border-b bg-muted/20">
                    <TabsList className="grid w-full grid-cols-3 bg-transparent">
                      <TabsTrigger value="code" className="gap-2">
                        <Code className="w-4 h-4" />
                        Code
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Preview
                      </TabsTrigger>
                      <TabsTrigger value="terminal" className="gap-2">
                        <Terminal className="w-4 h-4" />
                        Terminal
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <TabsContent value="code" className="h-full m-0 p-0">
                      <CodeEditor />
                    </TabsContent>

                    <TabsContent value="preview" className="h-full m-0 p-0">
                      <Preview />
                    </TabsContent>

                    <TabsContent value="terminal" className="h-full m-0 p-0">
                      <TerminalComponent />
                    </TabsContent>
                  </div>
                </Tabs>
              </ResizablePanel>

              {/* AI Chat Panel */}
              {showChat && (
                <>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
                    <div className="h-full border-l">
                      <V0Chat />
                    </div>
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </div>
        </div>
      </div>
    </div>
  )
}