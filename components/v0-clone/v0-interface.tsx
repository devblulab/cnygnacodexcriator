
"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import {
  Send,
  Bot,
  User,
  Code,
  Copy,
  Download,
  Play,
  Eye,
  Sparkles,
  Loader2,
  FileText,
  Palette,
  Zap,
  Moon,
  Sun,
  Settings,
  Share2,
  Save,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Folder,
  File
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"
import geminiService from "@/lib/ai/gemini-service"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  codeBlocks?: CodeBlock[]
  component?: GeneratedComponent
}

interface CodeBlock {
  language: string
  code: string
  filename?: string
}

interface GeneratedComponent {
  id: string
  name: string
  code: string
  preview: string
  description: string
  tags: string[]
  createdAt: Date
}

interface Project {
  id: string
  name: string
  description: string
  components: GeneratedComponent[]
  createdAt: Date
  updatedAt: Date
}

export function V0Interface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: "👋 Hello! I'm your AI assistant. I can help you build beautiful React components with Tailwind CSS and TypeScript. What would you like to create today?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<GeneratedComponent | null>(null)
  const [previewMode, setPreviewMode] = useState<"code" | "preview">("preview")
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [isEditingProject, setIsEditingProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { theme, setTheme } = useTheme()

  const suggestedPrompts = [
    {
      icon: <Palette className="w-4 h-4" />,
      text: "Create a modern login form with animations",
      category: "Form"
    },
    {
      icon: <Code className="w-4 h-4" />,
      text: "Build a responsive pricing card component",
      category: "Component"
    },
    {
      icon: <Zap className="w-4 h-4" />,
      text: "Design a dashboard with charts and stats",
      category: "Layout"
    },
    {
      icon: <FileText className="w-4 h-4" />,
      text: "Create a blog post card with author info",
      category: "Content"
    }
  ]

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    // Load projects from localStorage
    const savedProjects = localStorage.getItem("v0-projects")
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects).map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
        components: p.components.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt)
        }))
      }))
      setProjects(parsedProjects)
    }
  }, [])

  const saveProjects = (updatedProjects: Project[]) => {
    localStorage.setItem("v0-projects", JSON.stringify(updatedProjects))
    setProjects(updatedProjects)
  }

  const createNewProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName || `Project ${projects.length + 1}`,
      description: "New project created",
      components: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const updatedProjects = [...projects, newProject]
    saveProjects(updatedProjects)
    setCurrentProject(newProject)
    setNewProjectName("")
    setIsEditingProject(false)
  }

  const addComponentToProject = (component: GeneratedComponent) => {
    if (!currentProject) {
      // Create a new project if none exists
      const newProject: Project = {
        id: Date.now().toString(),
        name: `Project ${projects.length + 1}`,
        description: "Auto-created project",
        components: [component],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      const updatedProjects = [...projects, newProject]
      saveProjects(updatedProjects)
      setCurrentProject(newProject)
    } else {
      // Add to existing project
      const updatedProject = {
        ...currentProject,
        components: [...currentProject.components, component],
        updatedAt: new Date()
      }
      const updatedProjects = projects.map(p => 
        p.id === currentProject.id ? updatedProject : p
      )
      saveProjects(updatedProjects)
      setCurrentProject(updatedProject)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsLoading(true)

    try {
      // Generate component using Gemini
      const result = await geminiService.generateInterface(currentInput)
      
      // Create generated component
      const generatedComponent: GeneratedComponent = {
        id: Date.now().toString(),
        name: extractComponentName(result.code) || "Generated Component",
        code: result.code,
        preview: result.preview,
        description: result.explanation,
        tags: extractTags(currentInput),
        createdAt: new Date()
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: result.explanation,
        timestamp: new Date(),
        component: generatedComponent,
        codeBlocks: [{
          language: "tsx",
          filename: `${generatedComponent.name}.tsx`,
          code: result.code
        }]
      }

      setMessages(prev => [...prev, assistantMessage])
      setSelectedComponent(generatedComponent)
      addComponentToProject(generatedComponent)
      
    } catch (error) {
      console.error("Error generating component:", error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Sorry, I encountered an error while generating your component. Please try again with a different prompt.",
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
      
      toast({
        title: "Error",
        description: "Failed to generate component. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const extractComponentName = (code: string): string | null => {
    const match = code.match(/(?:function|const)\s+(\w+)|export\s+(?:default\s+)?(?:function\s+)?(\w+)/)
    return match ? (match[1] || match[2]) : null
  }

  const extractTags = (prompt: string): string[] => {
    const tags = []
    if (prompt.toLowerCase().includes("form")) tags.push("form")
    if (prompt.toLowerCase().includes("card")) tags.push("card")
    if (prompt.toLowerCase().includes("button")) tags.push("button")
    if (prompt.toLowerCase().includes("modal")) tags.push("modal")
    if (prompt.toLowerCase().includes("nav")) tags.push("navigation")
    if (prompt.toLowerCase().includes("responsive")) tags.push("responsive")
    if (prompt.toLowerCase().includes("dark")) tags.push("dark-mode")
    return tags.length > 0 ? tags : ["component"]
  }

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "Code copied to clipboard"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      })
    }
  }

  const downloadComponent = (component: GeneratedComponent) => {
    const blob = new Blob([component.code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${component.name}.tsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportProject = () => {
    if (!currentProject) return

    const files = currentProject.components.map(component => ({
      name: `${component.name}.tsx`,
      content: component.code
    }))

    // Create a simple project structure
    const projectStructure = {
      "package.json": JSON.stringify({
        name: currentProject.name.toLowerCase().replace(/\s+/g, "-"),
        version: "1.0.0",
        dependencies: {
          "react": "^18.0.0",
          "react-dom": "^18.0.0",
          "@types/react": "^18.0.0",
          "@types/react-dom": "^18.0.0",
          "tailwindcss": "^3.0.0",
          "typescript": "^5.0.0"
        }
      }, null, 2),
      "README.md": `# ${currentProject.name}\n\n${currentProject.description}\n\nGenerated with V0 Clone`,
      ...files.reduce((acc, file) => ({ ...acc, [`src/components/${file.name}`]: file.content }), {})
    }

    // For now, just download the main component
    if (files.length > 0) {
      downloadComponent(currentProject.components[0])
    }
  }

  const renderPreview = (component: GeneratedComponent) => {
    // In a real implementation, we would use a sandboxed iframe or a proper preview renderer
    // For now, we'll show a placeholder
    return (
      <div className="w-full h-full bg-white dark:bg-gray-900 p-4 rounded-lg border overflow-auto">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Live Preview</p>
          <p className="text-sm">Component: {component.name}</p>
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
            {component.description}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl">V0 Clone</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Component Generator</p>
            </div>
          </div>
          
          {currentProject && (
            <div className="flex items-center gap-2">
              <Separator orientation="vertical" className="h-6" />
              <Badge variant="outline">{currentProject.name}</Badge>
              <Button size="sm" variant="ghost" onClick={() => setIsEditingProject(true)}>
                <Edit3 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          
          {currentProject && (
            <>
              <Button variant="outline" size="sm" onClick={exportProject}>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-1" />
                Deploy
              </Button>
            </>
          )}
          
          <Button size="sm" onClick={() => setIsEditingProject(true)}>
            <Plus className="w-4 h-4 mr-1" />
            New Project
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Chat Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col">
              {/* Messages */}
              <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                <div className="space-y-4">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${message.type === "user" ? "flex-row-reverse" : ""}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.type === "user" 
                            ? "bg-blue-500" 
                            : "bg-gradient-to-r from-purple-500 to-pink-500"
                        }`}>
                          {message.type === "user" ? (
                            <User className="w-4 h-4 text-white" />
                          ) : (
                            <Bot className="w-4 h-4 text-white" />
                          )}
                        </div>
                        
                        <div className={`flex-1 max-w-[80%] ${message.type === "user" ? "text-right" : ""}`}>
                          <Card className={`${
                            message.type === "user" 
                              ? "bg-blue-500 text-white ml-auto" 
                              : "bg-card"
                          }`}>
                            <CardContent className="p-4">
                              <p className="text-sm whitespace-pre-wrap mb-2">{message.content}</p>
                              
                              {message.component && (
                                <div className="mt-3 p-3 bg-secondary/50 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-sm">{message.component.name}</h4>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setSelectedComponent(message.component!)}
                                        className="h-6 px-2 text-xs"
                                      >
                                        <Eye className="w-3 h-3 mr-1" />
                                        View
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => copyToClipboard(message.component!.code)}
                                        className="h-6 px-2 text-xs"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {message.component.tags.map(tag => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {message.codeBlocks && message.codeBlocks.map((block, index) => (
                                <div key={index} className="mt-3">
                                  <div className="flex items-center justify-between bg-secondary/80 px-3 py-2 rounded-t-lg">
                                    <div className="flex items-center gap-2">
                                      <Code className="w-4 h-4" />
                                      <span className="text-xs font-mono">{block.filename || block.language}</span>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => copyToClipboard(block.code)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <pre className="bg-secondary p-3 rounded-b-lg overflow-x-auto">
                                    <code className="text-xs">{block.code}</code>
                                  </pre>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                          <p className="text-xs text-muted-foreground mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <Card className="bg-card">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Generating component...</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              {/* Suggested Prompts */}
              {messages.length === 1 && (
                <div className="p-4 border-t bg-secondary/20">
                  <p className="text-sm font-medium mb-3">✨ Try these suggestions:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {suggestedPrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="justify-start h-auto p-3 text-left hover:bg-secondary/50"
                        onClick={() => handleSuggestedPrompt(prompt.text)}
                      >
                        <div className="flex items-start gap-2 w-full">
                          {prompt.icon}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{prompt.text}</p>
                            <p className="text-xs text-muted-foreground">{prompt.category}</p>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
                <div className="flex gap-2">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe the component you want to build..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    disabled={isLoading}
                    className="flex-1 min-h-[60px] resize-none"
                    rows={2}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 h-[60px] w-[60px]"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Preview Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col">
              {selectedComponent ? (
                <>
                  <div className="p-4 border-b bg-background/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{selectedComponent.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedComponent.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as "code" | "preview")}>
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                            <TabsTrigger value="code">Code</TabsTrigger>
                          </TabsList>
                        </Tabs>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadComponent(selectedComponent)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-4">
                    {previewMode === "preview" ? (
                      renderPreview(selectedComponent)
                    ) : (
                      <ScrollArea className="h-full">
                        <pre className="text-sm">
                          <code>{selectedComponent.code}</code>
                        </pre>
                      </ScrollArea>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Component Selected</h3>
                    <p className="text-sm">Generate a component to see it here</p>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Project Creation Dialog */}
      {isEditingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    createNewProject()
                  }
                }}
              />
              <div className="flex gap-2">
                <Button onClick={createNewProject} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Create
                </Button>
                <Button variant="outline" onClick={() => setIsEditingProject(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
