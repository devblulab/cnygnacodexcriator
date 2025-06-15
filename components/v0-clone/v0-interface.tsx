
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
  Zap,
  FileText,
  Folder,
  Package,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "@/hooks/use-toast"
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
    files?: {
      files: Array<{
        path: string
        content: string
        type: string
      }>
      dependencies: string[]
      instructions: string
    }
    dependencies?: string[]
  }
}

interface ProjectFile {
  path: string
  content: string
  type: string
}

const suggestions = [
  {
    icon: <Lightbulb className="w-4 h-4" />,
    title: "Portfólio de dentista moderno e profissional",
    category: "Portfolio",
    prompt: "Crie um portfólio completo para um dentista com seções sobre, serviços, galeria de casos, depoimentos e agendamento online"
  },
  {
    icon: <Layers className="w-4 h-4" />,
    title: "Dashboard administrativo com gráficos",
    category: "Dashboard",
    prompt: "Desenvolva um dashboard administrativo completo com gráficos, tabelas de dados, filtros e sistema de usuários"
  },
  {
    icon: <Zap className="w-4 h-4" />,
    title: "Landing page para SaaS",
    category: "Landing Page",
    prompt: "Crie uma landing page moderna para um produto SaaS com hero section, features, pricing e formulário de contato"
  },
  {
    icon: <Code2 className="w-4 h-4" />,
    title: "Sistema de e-commerce completo",
    category: "E-commerce",
    prompt: "Desenvolva um sistema de e-commerce com catálogo de produtos, carrinho, checkout e área do cliente"
  }
]

export default function V0Interface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<Message | null>(null)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"preview" | "files">("preview")
  const [downloadingFiles, setDownloadingFiles] = useState(false)
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
      let result

      // Detectar se é pedido para portfólio de dentista
      if (input.toLowerCase().includes("dentista") || input.toLowerCase().includes("dental")) {
        result = await geminiService.generateDentistPortfolio()
      } else {
        result = await geminiService.generateAdvancedProject(input.trim())
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Projeto completo gerado com sucesso! 🎉",
        timestamp: new Date(),
        component: result
      }

      setMessages(prev => [...prev, assistantMessage])
      setSelectedComponent(assistantMessage)

      // Mostrar toast de sucesso
      toast({
        title: "Projeto Gerado!",
        description: `${result.files?.files.length || 1} arquivo(s) criado(s) com sucesso`,
      })

    } catch (error) {
      console.error("Error generating component:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Desculpe, ocorreu um erro ao gerar o projeto. Tente novamente com uma descrição mais específica.",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])

      toast({
        title: "Erro na Geração",
        description: "Não foi possível gerar o projeto. Tente novamente.",
        variant: "destructive"
      })
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
    toast({
      title: "Copiado!",
      description: "Código copiado para a área de transferência",
    })
  }

  const downloadAllFiles = async (files: ProjectFile[]) => {
    setDownloadingFiles(true)
    
    try {
      // Criar um arquivo ZIP com todos os arquivos seria ideal
      // Por enquanto, vamos baixar cada arquivo individualmente
      files.forEach((file, index) => {
        setTimeout(() => {
          const blob = new Blob([file.content], { type: 'text/plain' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = file.path.split('/').pop() || `file${index}.tsx`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }, index * 100) // Pequeno delay entre downloads
      })

      toast({
        title: "Download Iniciado",
        description: `${files.length} arquivo(s) sendo baixado(s)`,
      })
    } catch (error) {
      toast({
        title: "Erro no Download",
        description: "Não foi possível baixar os arquivos",
        variant: "destructive"
      })
    } finally {
      setDownloadingFiles(false)
    }
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
                <h1 className="font-semibold">V0 Clone Pro</h1>
                <p className="text-xs text-muted-foreground">Gerador de Projetos Completos com IA</p>
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
                <h2 className="text-2xl font-bold">Novo Projeto</h2>
                <p className="text-muted-foreground max-w-md">
                  👋 Olá! Sou seu assistente IA avançado. Posso criar projetos completos com múltiplos arquivos, dependências e estruturas profissionais. O que você gostaria de desenvolver hoje?
                </p>
              </div>

              <div className="text-sm text-muted-foreground">
                {getCurrentTime()}
              </div>

              <div className="w-full max-w-2xl space-y-4">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Projetos Populares:
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
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">Projeto Completo Gerado</span>
                        </div>
                        
                        {message.component.files && (
                          <div className="bg-background/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Folder className="w-4 h-4" />
                              <span className="text-xs font-medium">
                                {message.component.files.files.length} arquivo(s) criado(s)
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              {message.component.files.files.slice(0, 3).map((file, index) => (
                                <div key={index} className="flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  {file.path}
                                </div>
                              ))}
                              {message.component.files.files.length > 3 && (
                                <div className="text-xs">
                                  + {message.component.files.files.length - 3} arquivo(s) adicional(is)
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedComponent(message)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Visualizar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(message.component!.code)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copiar Código
                          </Button>
                          {message.component.files && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadAllFiles(message.component!.files!.files)}
                              disabled={downloadingFiles}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Baixar Projeto
                            </Button>
                          )}
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
                      <div className="flex items-center gap-2">
                        <Wand2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Gerando projeto completo...</span>
                      </div>
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
              placeholder="Descreva o projeto completo que você quer criar..."
              className="flex-1"
              disabled={isGenerating}
            />
            <Button type="submit" disabled={!input.trim() || isGenerating}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            Enter para enviar, Shift+Enter para nova linha
          </p>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-1/2 border-l bg-background">
        <div className="flex h-14 items-center justify-between px-6 border-b">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold">
              {selectedComponent ? "Projeto Gerado" : "Nenhum Projeto Selecionado"}
            </h2>
            {selectedComponent?.component?.files && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={activeTab === "preview" ? "default" : "outline"}
                  onClick={() => setActiveTab("preview")}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === "files" ? "default" : "outline"}
                  onClick={() => setActiveTab("files")}
                >
                  <Folder className="w-3 h-3 mr-1" />
                  Arquivos ({selectedComponent.component.files.files.length})
                </Button>
              </div>
            )}
          </div>
          {selectedComponent && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Download className="w-3 h-3 mr-1" />
                Exportar
              </Button>
              <Button size="sm" variant="outline">
                <Share className="w-3 h-3 mr-1" />
                Compartilhar
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 p-6">
          {selectedComponent?.component ? (
            <div className="h-full">
              {activeTab === "preview" && (
                <LivePreview 
                  code={selectedComponent.component.code}
                  preview={selectedComponent.component.preview}
                />
              )}
              
              {activeTab === "files" && selectedComponent.component.files && (
                <div className="space-y-4 h-full">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Estrutura do Projeto</h3>
                    <Button
                      size="sm"
                      onClick={() => downloadAllFiles(selectedComponent.component!.files!.files)}
                      disabled={downloadingFiles}
                    >
                      <Package className="w-3 h-3 mr-1" />
                      Baixar Tudo
                    </Button>
                  </div>
                  
                  <ScrollArea className="h-[calc(100%-80px)]">
                    <div className="space-y-3">
                      {selectedComponent.component.files.files.map((file, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span className="font-mono text-sm">{file.path}</span>
                              <Badge variant="secondary" className="text-xs">
                                {file.type}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(file.content)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <pre className="bg-muted p-3 rounded text-xs overflow-x-auto max-h-32">
                            <code>{file.content.slice(0, 300)}...</code>
                          </pre>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <Eye className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">Nenhum Projeto Selecionado</h3>
                  <p className="text-sm text-muted-foreground">
                    Gere um projeto para visualizá-lo aqui
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
