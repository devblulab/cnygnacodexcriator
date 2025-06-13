"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mic, MicOff, Send, Loader2 } from "lucide-react"
import { getVoiceCommandService } from "@/lib/voice/voice-command-service"
import { generateCode, explainCode, debugCode, translateCode } from "@/lib/ai/gemini-service"
import { useEditor } from "@/context/editor-context"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Olá! Sou o assistente do QuantumCode. Como posso ajudar você hoje?",
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { currentFile } = useEditor()

  // Initialize voice command service
  useEffect(() => {
    const voiceService = getVoiceCommandService()
    setVoiceSupported(voiceService.isSupported())

    voiceService.onResult((result) => {
      setInput(result)
    })

    voiceService.onCommand((command, response) => {
      // Add the command as a user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: command,
        timestamp: Date.now(),
      }

      // Add the response as an assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMessage, assistantMessage])
      setIsListening(false)
    })

    voiceService.onError((error) => {
      console.error("Voice command error:", error)
      setIsListening(false)
    })
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    try {
      let response = ""

      // Process different types of requests
      if (input.toLowerCase().includes("gerar") || input.toLowerCase().includes("criar")) {
        response = await generateCode(input)
      } else if (input.toLowerCase().includes("explicar") && currentFile) {
        response = await explainCode(currentFile.content, currentFile.language)
      } else if (input.toLowerCase().includes("depurar") && currentFile) {
        response = await debugCode(currentFile.content, "Unknown error", currentFile.language)
      } else if (input.toLowerCase().includes("traduzir") && currentFile) {
        const match = input.match(/traduzir\s+(?:de\s+)?(\w+)\s+(?:para\s+)?(\w+)/i)
        if (match) {
          const fromLang = match[1]
          const toLang = match[2]
          response = await translateCode(currentFile.content, fromLang, toLang)
        } else {
          response = "Por favor, especifique as linguagens de origem e destino."
        }
      } else {
        // General query
        response = "Desculpe, ainda não posso processar esse tipo de solicitação."
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error processing message:", error)

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.",
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleVoiceRecognition = () => {
    const voiceService = getVoiceCommandService()

    if (isListening) {
      voiceService.stop()
      setIsListening(false)
    } else {
      const started = voiceService.start()
      setIsListening(started)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="chat" className="flex flex-col h-full">
        <div className="border-b px-4">
          <TabsList className="h-10">
            <TabsTrigger value="chat" className="text-xs">
              Chat
            </TabsTrigger>
            <TabsTrigger value="commands" className="text-xs">
              Comandos
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              Configurações
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0 data-[state=active]:flex">
          <div className="flex-1 overflow-auto p-4">
            {messages.map((message) => (
              <div key={message.id} className={`mb-4 ${message.role === "assistant" ? "pl-2" : "pl-4"}`}>
                <div className="font-semibold text-xs mb-1">{message.role === "assistant" ? "Assistente" : "Você"}</div>
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite uma mensagem ou comando..."
                disabled={isProcessing}
              />
              {voiceSupported && (
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={toggleVoiceRecognition}
                  className={isListening ? "bg-red-100 dark:bg-red-900" : ""}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}
              <Button type="submit" size="icon" disabled={!input.trim() || isProcessing}>
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="commands" className="flex-1 overflow-auto p-4 m-0">
          <h3 className="font-medium mb-4">Comandos de Voz Disponíveis</h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm">Geração de Código</h4>
              <p className="text-xs text-muted-foreground mb-2">Crie código a partir de descrições</p>
              <div className="bg-muted p-2 rounded-md text-xs">
                "Crie um formulário de login com React"
                <br />
                "Gere uma API REST para usuários"
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm">Explicação de Código</h4>
              <p className="text-xs text-muted-foreground mb-2">Entenda o que o código faz</p>
              <div className="bg-muted p-2 rounded-md text-xs">
                "Explique este código"
                <br />
                "O que esta função faz?"
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm">Depuração</h4>
              <p className="text-xs text-muted-foreground mb-2">Encontre e corrija erros</p>
              <div className="bg-muted p-2 rounded-md text-xs">
                "Depure este código"
                <br />
                "Corrija este erro"
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm">Tradução de Código</h4>
              <p className="text-xs text-muted-foreground mb-2">Converta entre linguagens</p>
              <div className="bg-muted p-2 rounded-md text-xs">
                "Traduza de JavaScript para Python"
                <br />
                "Converta de Java para TypeScript"
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="p-4 m-0">
          <h3 className="font-medium mb-4">Configurações do Assistente</h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Idioma do Reconhecimento de Voz</h4>
              <select
                className="w-full p-2 border rounded-md text-sm"
                onChange={(e) => {
                  const voiceService = getVoiceCommandService()
                  voiceService.setLanguage(e.target.value)
                }}
                defaultValue="pt-BR"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Modelo de IA</h4>
              <select className="w-full p-2 border rounded-md text-sm" defaultValue="gemini-pro">
                <option value="gemini-pro">Gemini Pro</option>
                <option value="gemini-pro-vision">Gemini Pro Vision</option>
              </select>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
