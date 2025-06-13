
"use client"

import { useState, useRef, useEffect } from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Plus, 
  Code, 
  Eye, 
  FileText, 
  Settings,
  Sparkles,
  Zap,
  Clock,
  Users,
  Send,
  User,
  Bot
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { AuthProvider } from "@/lib/firebase/auth-context"
import { EditorProvider } from "@/context/editor-context"
import { CodeEditor } from "@/components/editor/code-editor"
import Preview from "@/components/editor/preview"
import V0Chat from "@/components/v0-chat/v0-chat"

interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  tags: string[]
}

export default function HomePage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeView, setActiveView] = useState<"design" | "code">("design")
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const projects: Project[] = [
    {
      id: "1",
      name: "Ecommerce completo",
      description: "Sistema completo de e-commerce com carrinho e pagamento",
      createdAt: "2024-01-15",
      tags: ["React", "Next.js", "Stripe"]
    },
    {
      id: "2", 
      name: "Dashboard design",
      description: "Dashboard administrativo moderno e responsivo",
      createdAt: "2024-01-10",
      tags: ["React", "Tailwind", "Charts"]
    },
    {
      id: "3",
      name: "Landing page",
      description: "Landing page para startup de tecnologia",
      createdAt: "2024-01-05",
      tags: ["HTML", "CSS", "JavaScript"]
    }
  ]

  const recentProjects = projects.slice(0, 3)
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    if (!mounted) return dateString
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <AuthProvider>
      <EditorProvider>
        <div className="h-screen flex flex-col bg-background">
          {/* Top Navigation */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-6">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Code className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xl font-bold">QuantumCode</span>
                </div>
                
                <nav className="flex items-center space-x-6 text-sm font-medium">
                  <Button variant="ghost" size="sm">Search</Button>
                  <Button variant="ghost" size="sm">Projects</Button>
                  <Button variant="ghost" size="sm">Recents</Button>
                  <Button variant="ghost" size="sm">Community</Button>
                </nav>
              </div>

              <div className="ml-auto flex items-center space-x-4">
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  The v0 API is now in beta
                </Badge>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          <div className="flex-1 flex">
            <ResizablePanelGroup direction="horizontal">
              {/* Left Sidebar - Projects */}
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                <div className="flex flex-col h-full border-r">
                  {/* Search */}
                  <div className="p-4 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-4 space-y-6">
                      {/* Recent Projects */}
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Projects</h3>
                        <div className="space-y-2">
                          {recentProjects.map((project) => (
                            <Card 
                              key={project.id} 
                              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                                selectedProject?.id === project.id ? 'bg-muted border-primary' : ''
                              }`}
                              onClick={() => setSelectedProject(project)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center flex-shrink-0">
                                    <Code className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium truncate">{project.name}</h4>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      {project.description}
                                    </p>
                                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {formatDate(project.createdAt)}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* All Projects */}
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">All Projects</h3>
                        <div className="space-y-2">
                          {filteredProjects.map((project) => (
                            <Card 
                              key={project.id}
                              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                                selectedProject?.id === project.id ? 'bg-muted border-primary' : ''
                              }`}
                              onClick={() => setSelectedProject(project)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start space-x-3">
                                  <div className="w-6 h-6 bg-muted rounded flex items-center justify-center flex-shrink-0">
                                    <FileText className="h-3 w-3" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium truncate">{project.name}</h4>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                      {project.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {project.tags.slice(0, 2).map((tag) => (
                                        <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </ResizablePanel>

              <ResizableHandle />

              {/* Main Content Area */}
              <ResizablePanel defaultSize={55}>
                <div className="flex flex-col h-full">
                  {!selectedProject ? (
                    /* Welcome Screen */
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                      <h1 className="text-3xl font-bold mb-4">What can I help you build?</h1>
                      <p className="text-muted-foreground mb-8 max-w-md">
                        Descreva o que você quer criar e eu vou gerar o código para você. 
                        Selecione um projeto existente ou comece um novo.
                      </p>
                      <div className="flex gap-4">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Novo Projeto
                        </Button>
                        <Button variant="outline">
                          Ver Exemplos
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Project View */
                    <div className="flex flex-col h-full">
                      {/* Project Header */}
                      <div className="border-b p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-lg font-semibold">{selectedProject.name}</h2>
                            <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "design" | "code")}>
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="design" className="gap-2">
                                  <Eye className="h-4 w-4" />
                                  Design
                                </TabsTrigger>
                                <TabsTrigger value="code" className="gap-2">
                                  <Code className="h-4 w-4" />
                                  Code
                                </TabsTrigger>
                              </TabsList>
                            </Tabs>
                          </div>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="flex-1">
                        <Tabs value={activeView} className="h-full">
                          <TabsContent value="design" className="h-full m-0">
                            <Preview />
                          </TabsContent>
                          <TabsContent value="code" className="h-full m-0">
                            <CodeEditor />
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>
                  )}
                </div>
              </ResizablePanel>

              <ResizableHandle />

              {/* Right Panel - AI Chat */}
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                <V0Chat />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>

          {/* Bottom Status Bar */}
          <div className="border-t bg-muted/50 px-6 py-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-1">
                <Zap className="h-3 w-3" />
                Quantum Ready
              </Badge>
              <span className="text-muted-foreground">
                You are out of credits. Your limit will reset on June 16.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">Upgrade Plan</Button>
            </div>
          </div>
        </div>
      </EditorProvider>
    </AuthProvider>
  )
}
