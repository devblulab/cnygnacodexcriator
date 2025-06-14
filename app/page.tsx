
"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Search,
  Folder,
  Code,
  Eye,
  Star,
  Clock,
  Users,
  Sparkles,
  Zap,
  ArrowRight,
  FileText,
  Palette,
  Database,
  Globe
} from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import { useEditor } from "@/context/editor-context"

const projectTemplates = [
  {
    id: "react-app",
    name: "React App",
    description: "Modern React application with TypeScript",
    icon: <Code className="w-8 h-8" />,
    color: "bg-blue-500",
    tags: ["React", "TypeScript", "Vite"]
  },
  {
    id: "next-app",
    name: "Next.js App",
    description: "Full-stack React framework with SSR",
    icon: <Globe className="w-8 h-8" />,
    color: "bg-black",
    tags: ["Next.js", "React", "SSR"]
  },
  {
    id: "vue-app",
    name: "Vue App",
    description: "Progressive Vue.js application",
    icon: <Sparkles className="w-8 h-8" />,
    color: "bg-green-500",
    tags: ["Vue", "TypeScript", "Vite"]
  },
  {
    id: "html-css",
    name: "HTML & CSS",
    description: "Static website with modern CSS",
    icon: <FileText className="w-8 h-8" />,
    color: "bg-orange-500",
    tags: ["HTML", "CSS", "JavaScript"]
  }
]

const recentProjects = [
  {
    id: "1",
    name: "E-commerce Dashboard",
    description: "Admin dashboard for online store",
    lastModified: "2 hours ago",
    status: "active",
    preview: "/placeholder.jpg"
  },
  {
    id: "2",
    name: "Portfolio Website",
    description: "Personal portfolio with blog",
    lastModified: "1 day ago",
    status: "draft",
    preview: "/placeholder.jpg"
  },
  {
    id: "3",
    name: "Task Manager",
    description: "Productivity app with team collaboration",
    lastModified: "3 days ago",
    status: "completed",
    preview: "/placeholder.jpg"
  }
]

const suggestedPrompts = [
  {
    icon: <Palette className="w-5 h-5" />,
    text: "Create a modern landing page",
    category: "Design"
  },
  {
    icon: <Database className="w-5 h-5" />,
    text: "Build a user dashboard",
    category: "App"
  },
  {
    icon: <Zap className="w-5 h-5" />,
    text: "Design a pricing section",
    category: "Component"
  },
  {
    icon: <Users className="w-5 h-5" />,
    text: "Create a team page",
    category: "Page"
  }
]

export default function HomePage() {
  const { user } = useAuth()
  const { createProject } = useEditor()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleCreateProject = (templateId: string) => {
    const template = projectTemplates.find(t => t.id === templateId)
    if (template) {
      const project = createProject(template.name, templateId)
      router.push("/editor")
    }
  }

  const handleOpenProject = (projectId: string) => {
    router.push("/editor")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                QuantumCode
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                A modern web-based IDE with AI assistance inspired by v0.dev
              </p>
            </div>

            <div className="flex justify-center gap-4 mb-12">
              <Button size="lg" onClick={() => router.push("/auth/login")} className="gap-2">
                <Code className="w-5 h-5" />
                Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push("/demo")} className="gap-2">
                <Eye className="w-5 h-5" />
                View Demo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-2">
                    <Code className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Code Editor</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Modern code editor with syntax highlighting and IntelliSense</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-2">
                    <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>AI Assistant</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Powered by Gemini AI to help you code faster and smarter</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-2">
                    <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle>Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">See your changes in real-time with instant preview</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user.displayName || "Developer"}!</h1>
            <p className="text-muted-foreground mt-1">What are you building today?</p>
          </div>
          
          <Button onClick={() => router.push("/editor")} className="gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Start Templates */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Quick Start Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${template.color} rounded-lg flex items-center justify-center text-white`}>
                          {template.icon}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription className="text-sm">{template.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {template.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleCreateProject(template.id)}
                          className="gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Create
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Recent Projects */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Projects</h2>
                <Button variant="ghost" size="sm" className="gap-2">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Folder className="w-6 h-6 text-muted-foreground" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{project.name}</h3>
                            <Badge 
                              variant={project.status === "active" ? "default" : project.status === "completed" ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              {project.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {project.lastModified}
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenProject(project.id)}
                        >
                          Open
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Suggestions */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <CardTitle className="text-lg">AI Suggestions</CardTitle>
                </div>
                <CardDescription>Get inspired by AI-generated ideas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestedPrompts.map((prompt, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      {prompt.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{prompt.text}</p>
                      <p className="text-xs text-muted-foreground">{prompt.category}</p>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <Button variant="outline" className="w-full gap-2" onClick={() => router.push("/editor")}>
                  <Sparkles className="w-4 h-4" />
                  Start with AI
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Projects</span>
                  </div>
                  <Badge variant="secondary">12</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Starred</span>
                  </div>
                  <Badge variant="secondary">3</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Shared</span>
                  </div>
                  <Badge variant="secondary">5</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
