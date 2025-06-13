
"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Send, 
  Bot, 
  User, 
  Code, 
  Sparkles, 
  Copy, 
  Download,
  Wand2,
  Zap,
  Eye,
  Play
} from "lucide-react"
import { useEditor } from "@/context/editor-context"
import geminiService from "@/lib/ai/gemini-service"

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: number
  code?: string
  preview?: string
  language?: string
}

export default function V0Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "assistant",
      content: "👋 Olá! Sou o assistente QuantumCode, inspirado no v0.dev.\n\nPosso ajudar você a:\n\n🎨 **Criar interfaces** - Descreva o que quer e gero o código\n🔧 **Corrigir bugs** - Analiso e corrijo problemas no código\n⚡ **Otimizar código** - Melhoro performance e legibilidade\n🌐 **Traduzir linguagens** - Converto entre diferentes tecnologias\n\nDigite sua ideia ou comando para começar!",
      timestamp: Date.now(),
    },
  ])
  
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { createFile, setCurrentFile } = useEditor()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Math.random().toString(36),
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    
    addMessage({
      type: 'user',
      content: userMessage
    })

    setIsLoading(true)

    try {
      // Detectar tipo de comando
      const lowerInput = userMessage.toLowerCase()
      
      if (lowerInput.includes('crie') || lowerInput.includes('gere') || lowerInput.includes('faça')) {
        // Gerar interface
        const result = await geminiService.generateInterface(userMessage)
        addMessage({
          type: 'assistant',
          content: `✨ **Interface criada com sucesso!**\n\n${result.explanation}\n\nO código foi gerado e está pronto para usar. Você pode visualizar, copiar ou baixar o arquivo.`,
          code: result.code,
          preview: result.preview,
          language: 'tsx'
        })
      } else if (lowerInput.includes('explique') || lowerInput.includes('o que faz')) {
        if (selectedCode) {
          const explanation = await geminiService.explainCode(selectedCode)
          addMessage({
            type: 'assistant',
            content: `📖 **Explicação do código:**\n\n${explanation}`
          })
        } else {
          addMessage({
            type: 'assistant',
            content: "Por favor, selecione um código primeiro ou cole o código que deseja que eu explique."
          })
        }
      } else if (lowerInput.includes('corrija') || lowerInput.includes('debug') || lowerInput.includes('erro')) {
        if (selectedCode) {
          const result = await geminiService.debugCode(selectedCode, 'Análise geral do código')
          addMessage({
            type: 'assistant',
            content: `🔧 **Problemas encontrados e soluções:**\n\n**Solução:** ${result.solution}\n\n**Explicação:** ${result.explanation}`,
            code: result.fixedCode,
            language: 'tsx'
          })
        } else {
          addMessage({
            type: 'assistant',
            content: "Por favor, forneça o código que está com problema para que eu possa analisar e corrigir."
          })
        }
      } else if (lowerInput.includes('otimize') || lowerInput.includes('melhore')) {
        if (selectedCode) {
          const result = await geminiService.refactorCode(selectedCode, 'otimização geral')
          addMessage({
            type: 'assistant',
            content: `⚡ **Código otimizado!**\n\n**Melhorias aplicadas:**\n${result.improvements.map(imp => `• ${imp}`).join('\n')}\n\n**Explicação:** ${result.explanation}`,
            code: result.refactoredCode,
            language: 'tsx'
          })
        } else {
          addMessage({
            type: 'assistant',
            content: "Por favor, forneça o código que deseja otimizar."
          })
        }
      } else {
        // Resposta geral
        const response = await geminiService.processMessage(userMessage, 'IDE colaborativa inspirada no v0.dev')
        addMessage({
          type: 'assistant',
          content: response
        })
      }
    } catch (error) {
      addMessage({
        type: 'assistant',
        content: '❌ Ops! Ocorreu um erro ao processar sua solicitação. Verifique sua conexão e tente novamente.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const downloadCode = (code: string, filename: string = 'generated-code.tsx') => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const addToProject = (code: string, filename: string = 'generated-component.tsx') => {
    const file = createFile(filename, code, 'tsx')
    setCurrentFile(file)
  }

  const quickCommands = [
    { label: "Criar landing page", command: "Crie uma landing page moderna com header, hero section e footer" },
    { label: "Formulário de contato", command: "Gere um formulário de contato responsivo com validação" },
    { label: "Dashboard admin", command: "Faça um dashboard administrativo com sidebar e cards" },
    { label: "Navbar responsivo", command: "Crie um navbar moderno e responsivo com menu mobile" },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">QuantumCode Assistant</h3>
            <p className="text-xs text-muted-foreground">Inspirado no v0.dev • Powered by Gemini</p>
          </div>
        </div>
        
        {/* Quick Commands */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          {quickCommands.map((cmd, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="h-auto p-2 text-xs justify-start"
              onClick={() => setInput(cmd.command)}
            >
              <Wand2 className="h-3 w-3 mr-1" />
              {cmd.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}>
              {message.type === 'assistant' && (
                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              
              <div className={`max-w-[85%] ${message.type === 'user' ? 'order-first' : ''}`}>
                <Card className={message.type === 'user' ? 'bg-primary text-primary-foreground' : ''}>
                  <CardContent className="p-3">
                    <div className="whitespace-pre-wrap text-sm mb-2">
                      {message.content}
                    </div>
                    
                    {/* Code Block */}
                    {message.code && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            <Badge variant="secondary">{message.language}</Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => copyCode(message.code!)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => downloadCode(message.code!)}>
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => addToProject(message.code!)}>
                              <Play className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                          <code>{message.code}</code>
                        </pre>
                      </div>
                    )}
                    
                    {/* Preview */}
                    {message.preview && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="h-4 w-4" />
                          <span className="text-sm font-medium">Preview</span>
                        </div>
                        <div 
                          className="border rounded p-3 bg-white" 
                          dangerouslySetInnerHTML={{ __html: message.preview }}
                        />
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {message.type === 'user' && (
                <div className="p-2 rounded-full bg-secondary shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="text-sm text-muted-foreground ml-2">Gerando resposta...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-muted/30">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Descreva o que você quer criar... (ex: 'Crie uma landing page moderna')"
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim() || isLoading} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
        
        <div className="flex items-center justify-center mt-2">
          <p className="text-xs text-muted-foreground">
            💡 Dica: Seja específico sobre o que deseja criar para melhores resultados
          </p>
        </div>
      </div>
    </div>
  )
}
