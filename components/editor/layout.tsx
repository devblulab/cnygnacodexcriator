"use client"

import { useState } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Sidebar } from "@/components/editor/sidebar"
import { EditorHeader } from "@/components/editor/header"
import { CodeEditor } from "@/components/editor/code-editor"
import { Preview } from "@/components/editor/preview"
import { Terminal } from "@/components/editor/terminal"
import { AIAssistant } from "@/components/editor/ai-assistant"
import { useEditor } from "@/context/editor-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function EditorLayout() {
  const { currentFile } = useEditor()
  const [activeTab, setActiveTab] = useState<string>("editor")
  const [showTerminal, setShowTerminal] = useState(false)
  const [showAI, setShowAI] = useState(false)

  // Toggle terminal visibility
  const toggleTerminal = () => setShowTerminal((prev) => !prev)

  // Toggle AI assistant visibility
  const toggleAI = () => setShowAI((prev) => !prev)

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <EditorHeader toggleTerminal={toggleTerminal} showTerminal={showTerminal} toggleAI={toggleAI} showAI={showAI} />

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Sidebar */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <Sidebar />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Main content area */}
          <ResizablePanel defaultSize={showAI ? 55 : 80}>
            <ResizablePanelGroup direction="vertical">
              {/* Editor/Preview area */}
              <ResizablePanel defaultSize={70}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                  <div className="border-b px-4">
                    <TabsList>
                      <TabsTrigger value="editor">Editor</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                      <TabsTrigger value="split">Split View</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="editor" className="h-[calc(100%-40px)] p-0 m-0 data-[state=active]:flex">
                    <CodeEditor />
                  </TabsContent>

                  <TabsContent value="preview" className="h-[calc(100%-40px)] p-0 m-0 data-[state=active]:flex">
                    <Preview />
                  </TabsContent>

                  <TabsContent value="split" className="h-[calc(100%-40px)] p-0 m-0 data-[state=active]:flex">
                    <ResizablePanelGroup direction="horizontal">
                      <ResizablePanel defaultSize={50}>
                        <CodeEditor />
                      </ResizablePanel>
                      <ResizableHandle withHandle />
                      <ResizablePanel defaultSize={50}>
                        <Preview />
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  </TabsContent>
                </Tabs>
              </ResizablePanel>

              {/* Terminal area (collapsible) */}
              {showTerminal && (
                <>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={30} minSize={15}>
                    <Terminal />
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>

          {/* AI Assistant panel (collapsible) */}
          {showAI && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                <AIAssistant />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
