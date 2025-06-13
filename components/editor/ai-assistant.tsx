
"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Mic, 
  MicOff, 
  Send, 
  Bot, 
  User, 
  Code, 
  Bug, 
  Zap, 
  Languages, 
  Atom,
  Brain,
  Volume2,
  Copy,
  Download
} from "lucide-react"
import geminiService from "@/lib/ai/gemini-service"
import voiceCommandService from "@/lib/voice/voice-command-service"

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: number
  metadata?: any
}

interface GeneratedCode {
  code: string
  preview: string
  explanation: string
  language: string
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null)
  const [activeTab, setActiveTab] = useState("chat")
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Scroll para a última mensagem
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    // Configurar listeners para eventos de voz
    const handleVoiceGenerateInterface = (event: CustomEvent) => {
      const result = event.detail
      setGeneratedCode({
        code: result.code,
        preview: result.preview,
        explanation: result.explanation,
        language: 'tsx'
      })
      setActiveTab('code')
      
      addMessage({
        type: 'assistant',
        content: `Interface gerada com sucesso! ${result.explanation}`,
        metadata: { type: 'interface_generated', result }
      })
    }

    const handleVoiceExplainCode = (event: CustomEvent) => {
      const { explanation } = event.detail
      addMessage({
        type: 'assistant',
        content: explanation,
        metadata: { type: 'code_explanation' }
      })
    }

    const handleVoiceDebugCode = (event: CustomEvent) => {
      const result = event.detail
      addMessage({
        type: 'assistant',
        content: `**Solução encontrada:**\n\n${result.solution}\n\n**Explicação:**\n${result.explanation}`,
        metadata: { type: 'debug_solution', result }
      })
      
      if (result.fixedCode) {
        setGeneratedCode({
          code: result.fixedCode,
          preview: '',
          explanation: 'Código corrigido',
          language: 'tsx'
        })
        setActiveTab('code')
      }
    }

    const handleVoiceCreateComponent = (event: CustomEvent) => {
      const { code, type } = event.detail
      setGeneratedCode({
        code,
        preview: '',
        explanation: `Componente ${type} gerado`,
        language: 'tsx'
      })
      setActiveTab('code')
      
      addMessage({
        type: 'assistant',
        content: `Componente ${type} criado com sucesso!`,
        metadata: { type: 'component_created' }
      })
    }

    const handleVoiceGeneralResponse = (event: CustomEvent) => {
      const { response } = event.detail
      addMessage({
        type: 'assistant',
        content: response,
        metadata: { type: 'general_response' }
      })
    }

    window.addEventListener('voice-generate-interface', handleVoiceGenerateInterface as EventListener)
    window.addEventListener('voice-explain-code', handleVoiceExplainCode as EventListener)
    window.addEventListener('voice-debug-code', handleVoiceDebugCode as EventListener)
    window.addEventListener('voice-create-component', handleVoiceCreateComponent as EventListener)
    window.addEventListener('voice-general-response', handleVoiceGeneralResponse as EventListener)

    return () => {
      window.removeEventListener('voice-generate-interface', handleVoiceGenerateInterface as EventListener)
      window.removeEventListener('voice-explain-code', handleVoiceExplainCode as EventListener)
      window.removeEventListener('voice-debug-code', handleVoiceDebugCode as EventListener)
      window.removeEventListener('voice-create-component', handleVoiceCreateComponent as EventListener)
      window.removeEventListener('voice-general-response', handleVoiceGeneralResponse as EventListener)
    }
  }, [])

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
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
      // Determinar tipo de comando baseado no input
      const response = await processUserInput(userMessage)
      
      addMessage({
        type: 'assistant',
        content: response.content,
        metadata: response.metadata
      })

      if (response.generatedCode) {
        setGeneratedCode(response.generatedCode)
        setActiveTab('code')
      }
    } catch (error) {
      addMessage({
        type: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.',
        metadata: { type: 'error' }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const processUserInput = async (input: string): Promise<{
    content: string
    metadata?: any
    generatedCode?: GeneratedCode
  }> => {
    const lowerInput = input.toLowerCase()

    // Detectar tipo de comando
    if (lowerInput.includes('gere') || lowerInput.includes('crie uma página') || lowerInput.includes('interface')) {
      const result = await geminiService.generateInterface(input)
      return {
        content: `Interface gerada com sucesso! ${result.explanation}`,
        metadata: { type: 'interface_generated' },
        generatedCode: {
          code: result.code,
          preview: result.preview,
          explanation: result.explanation,
          language: 'tsx'
        }
      }
    }

    if (lowerInput.includes('explique') || lowerInput.includes('o que faz')) {
      if (generatedCode) {
        const explanation = await geminiService.explainCode(generatedCode.code)
        return {
          content: explanation,
          metadata: { type: 'code_explanation' }
        }
      } else {
        return {
          content: 'Por favor, gere ou cole um código primeiro para que eu possa explicá-lo.',
          metadata: { type: 'instruction' }
        }
      }
    }

    if (lowerInput.includes('debug') || lowerInput.includes('erro') || lowerInput.includes('corrigir')) {
      if (generatedCode) {
        const result = await geminiService.debugCode(generatedCode.code, 'Análise geral')
        return {
          content: `**Solução:**\n${result.solution}\n\n**Explicação:**\n${result.explanation}`,
          metadata: { type: 'debug_solution' },
          generatedCode: {
            code: result.fixedCode,
            preview: '',
            explanation: 'Código corrigido',
            language: 'tsx'
          }
        }
      } else {
        return {
          content: 'Por favor, forneça o código que está com problema para que eu possa ajudar a debugar.',
          metadata: { type: 'instruction' }
        }
      }
    }

    if (lowerInput.includes('otimize') || lowerInput.includes('refatore') || lowerInput.includes('melhore')) {
      if (generatedCode) {
        const result = await geminiService.refactorCode(generatedCode.code, 'otimização geral')
        return {
          content: `**Código otimizado!**\n\n**Melhorias aplicadas:**\n${result.improvements.join('\n')}\n\n**Explicação:**\n${result.explanation}`,
          metadata: { type: 'code_refactored' },
          generatedCode: {
            code: result.refactoredCode,
            preview: '',
            explanation: 'Código otimizado',
            language: 'tsx'
          }
        }
      } else {
        return {
          content: 'Por favor, forneça um código para otimizar.',
          metadata: { type: 'instruction' }
        }
      }
    }

    if (lowerInput.includes('traduza') || lowerInput.includes('converta')) {
      // Detectar linguagens
      const toTypeScript = lowerInput.includes('typescript') || lowerInput.includes('ts')
      const toPython = lowerInput.includes('python') || lowerInput.includes('py')
      
      if (generatedCode && (toTypeScript || toPython)) {
        const toLang = toTypeScript ? 'TypeScript' : 'Python'
        const result = await geminiService.translateCode(generatedCode.code, 'React', toLang)
        
        return {
          content: `**Código traduzido para ${toLang}!**\n\n**Explicação:**\n${result.explanation}\n\n**Principais diferenças:**\n${result.differences.join('\n')}`,
          metadata: { type: 'code_translated' },
          generatedCode: {
            code: result.translatedCode,
            preview: '',
            explanation: `Código em ${toLang}`,
            language: toLang.toLowerCase()
          }
        }
      }
    }

    if (lowerInput.includes('quântico') || lowerInput.includes('quantum')) {
      const algorithm = lowerInput.includes('grover') ? 'Grover' : 
                      lowerInput.includes('shor') ? 'Shor' :
                      lowerInput.includes('deutsch') ? 'Deutsch-Jozsa' : 'algoritmo básico'
      
      const result = await geminiService.generateQuantumCode(algorithm)
      return {
        content: `**Código quântico gerado!**\n\n**Algoritmo:** ${algorithm}\n\n**Explicação:**\n${result.explanation}\n\n**Circuito:**\n${result.circuit}`,
        metadata: { type: 'quantum_code' },
        generatedCode: {
          code: result.code,
          preview: '',
          explanation: result.explanation,
          language: 'python'
        }
      }
    }

    if (lowerInput.includes('arquitetura') || lowerInput.includes('estrutura')) {
      const result = await geminiService.suggestArchitecture(input)
      return {
        content: `**Arquitetura sugerida:** ${result.architecture}\n\n**Componentes:**\n${result.components.join('\n')}\n\n**Explicação:**\n${result.explanation}\n\n**Diagrama:**\n\`\`\`\n${result.diagram}\n\`\`\``,
        metadata: { type: 'architecture_suggestion' }
      }
    }

    // Comando geral
    const response = await geminiService.processMessage(input, 'IDE colaborativa com IA')
    return {
      content: response,
      metadata: { type: 'general_response' }
    }
  }

  const toggleVoiceRecognition = async () => {
    try {
      if (isListening) {
        voiceCommandService.stopListening()
        setIsListening(false)
      } else {
        await voiceCommandService.startListening()
        setIsListening(true)
      }
    } catch (error) {
      console.error('Erro no reconhecimento de voz:', error)
    }
  }

  const speakMessage = async (content: string) => {
    try {
      await voiceCommandService.speak(content)
    } catch (error) {
      console.error('Erro na síntese de voz:', error)
    }
  }

  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode.code)
    }
  }

  const downloadCode = () => {
    if (generatedCode) {
      const extension = generatedCode.language === 'python' ? 'py' : 
                       generatedCode.language === 'tsx' ? 'tsx' : 'js'
      const blob = new Blob([generatedCode.code], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `generated-code.${extension}`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Código
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Ferramentas
          </TabsTrigger>
          <TabsTrigger value="quantum" className="flex items-center gap-2">
            <Atom className="h-4 w-4" />
            Quântico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col space-y-4">
          <ScrollArea className="flex-1">
            <div className="space-y-4 p-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex items-start gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}>
                  {message.type === 'assistant' && (
                    <div className="p-2 rounded-full bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-muted'
                  }`}>
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs opacity-60">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                      {message.type === 'assistant' && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => speakMessage(message.content)}
                          className="h-6 w-6 p-0"
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {message.type === 'user' && (
                    <div className="p-2 rounded-full bg-secondary">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua pergunta ou comando..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <Button 
                onClick={toggleVoiceRecognition}
                variant={isListening ? "destructive" : "outline"}
                size="icon"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {isListening && (
              <div className="mt-2 text-sm text-muted-foreground">
                🎤 Escutando... Fale seu comando
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="code" className="flex-1 flex flex-col">
          {generatedCode ? (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{generatedCode.explanation}</h3>
                  <Badge variant="secondary">{generatedCode.language}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={copyCode}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                  <Button size="sm" variant="outline" onClick={downloadCode}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <ScrollArea className="flex-1">
                <pre className="p-4 text-sm">
                  <code>{generatedCode.code}</code>
                </pre>
              </ScrollArea>
              {generatedCode.preview && (
                <div className="border-t">
                  <div className="p-4">
                    <h4 className="font-semibold mb-2">Pré-visualização</h4>
                    <div 
                      className="border rounded p-4" 
                      dangerouslySetInnerHTML={{ __html: generatedCode.preview }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum código gerado ainda</p>
                <p className="text-sm">Use o chat para gerar interfaces e componentes</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tools" className="flex-1 p-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bug className="h-5 w-5" />
                <h3 className="font-semibold">Debug</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Analise e corrija erros no código
              </p>
              <Button size="sm" className="w-full">Debugar Código</Button>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5" />
                <h3 className="font-semibold">Otimizar</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Melhore performance e legibilidade
              </p>
              <Button size="sm" className="w-full">Otimizar</Button>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Languages className="h-5 w-5" />
                <h3 className="font-semibold">Traduzir</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Converta entre linguagens
              </p>
              <Button size="sm" className="w-full">Traduzir</Button>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5" />
                <h3 className="font-semibold">Arquitetura</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Sugestões de design de sistema
              </p>
              <Button size="sm" className="w-full">Analisar</Button>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quantum" className="flex-1 p-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Atom className="h-5 w-5" />
                  Computação Quântica
                </CardTitle>
                <CardDescription>
                  Gere e simule algoritmos quânticos com Qiskit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <span className="font-semibold">Algoritmo de Grover</span>
                    <span className="text-xs text-muted-foreground">Busca quântica</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <span className="font-semibold">Algoritmo de Shor</span>
                    <span className="text-xs text-muted-foreground">Fatoração</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <span className="font-semibold">Deutsch-Jozsa</span>
                    <span className="text-xs text-muted-foreground">Oráculo quântico</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <span className="font-semibold">Teleportação</span>
                    <span className="text-xs text-muted-foreground">Transferência de estado</span>
                  </Button>
                </div>
                
                <Textarea 
                  placeholder="Descreva o algoritmo quântico que deseja implementar..."
                  className="min-h-[100px]"
                />
                
                <Button className="w-full">
                  <Atom className="h-4 w-4 mr-2" />
                  Gerar Código Quântico
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
