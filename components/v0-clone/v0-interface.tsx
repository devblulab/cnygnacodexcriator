
"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { LivePreview } from "./live-preview"
import { ComponentGallery } from "./component-gallery"
import { 
  Send, 
  Sparkles, 
  Code2, 
  Eye, 
  Copy, 
  Download, 
  Share,
  Wand2,
  Lightbulb,
  Layers,
  Zap
} from "lucide-react"
import { useTheme } from "next-themes"
import geminiService from "@/lib/ai/gemini-service"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  component?: {
    code: string
    preview: string
    explanation: string
  }
}

const suggestions = [
  {
    icon: <Lightbulb className="w-4 h-4" />,
    title: "Create a modern login form with animations",
    category: "Form",
    prompt: "Create a sleek login form with email and password fields, smooth animations, and a gradient background"
  },
  {
    icon: <Layers className="w-4 h-4" />,
    title: "Build a responsive pricing card component",
    category: "Component",
    prompt: "Design a pricing card with three tiers, feature lists, and call-to-action buttons with hover effects"
  },
  {
    icon: <Zap className="w-4 h-4" />,
    title: "Design a dashboard with charts and stats",
    category: "Layout",
    prompt: "Create a modern dashboard layout with chart widgets, stat cards, and a sidebar navigation"
  },
  {
    icon: <Code2 className="w-4 h-4" />,
    title: "Create a blog post card with author info",
    category: "Content",
    prompt: "Design a blog post card component with image, title, excerpt, author avatar, and reading time"
  }
]

export default function V0Interface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<Message | null>(null)
  const [mounted, setMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isGenerating) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsGenerating(true)

    try {
      const result = await geminiService.generateInterface(input.trim())

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Componente gerado com sucesso!",
        timestamp: new Date(),
        component: result
      }

      setMessages(prev => [...prev, assistantMessage])
      setSelectedComponent(assistantMessage)
    } catch (error) {
      console.error("Error generating component:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Desculpe, ocorreu um erro ao gerar o componente. Tente novamente.",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    }

    setIsGenerating(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getCurrentTime = () => {
    if (!mounted) return "00:00"
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!mounted) {
    return <div className="flex h-screen bg-background" />
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Chat Panel */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold">V0 Clone</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Component Generator</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Wand2 className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">New Project</h2>
                <p className="text-muted-foreground max-w-md">
                  👋 Hello! I'm your AI assistant. I can help you build beautiful React components with Tailwind CSS and TypeScript. What would you like to create today?
                </p>
              </div>

              <div className="text-sm text-muted-foreground">
                {getCurrentTime()}
              </div>

              <div className="w-full max-w-2xl space-y-4">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Try these suggestions:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestions.map((suggestion, index) => (
                    <Card 
                      key={index}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleSuggestionClick(suggestion.prompt)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 text-primary">
                            {suggestion.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-sm">{suggestion.title}</h3>
                            <Badge variant="secondary" className="mt-2 text-xs">
                              {suggestion.category}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.type === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className={`max-w-[80%] ${message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted"} rounded-lg p-4`}>
                    <p className="text-sm">{message.content}</p>

                    {message.component && (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Code2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Generated Component</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedComponent(message)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(message.component!.code)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy Code
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="mt-2 text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {message.type === "user" && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground text-sm font-medium">U</span>
                    </div>
                  )}
                </div>
              ))}

              {isGenerating && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div className="bg-muted rounded-lg p-4 max-w-[80%]">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the component you want to build..."
              className="flex-1"
              disabled={isGenerating}
            />
            <Button type="submit" disabled={!input.trim() || isGenerating}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-1/2 border-l bg-background">
        <div className="flex h-14 items-center justify-between px-6 border-b">
          <h2 className="font-semibold">
            {selectedComponent ? "Component Preview" : "No Component Selected"}
          </h2>
          {selectedComponent && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Download className="w-3 h-3 mr-1" />
                Export
              </Button>
              <Button size="sm" variant="outline">
                <Share className="w-3 h-3 mr-1" />
                Share
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 p-6">
          {selectedComponent?.component ? (
            <LivePreview 
              code={selectedComponent.component.code}
              preview={selectedComponent.component.preview}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <Eye className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">No Component Selected</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate a component to see it here
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
