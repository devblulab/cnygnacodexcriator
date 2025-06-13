
"use client"

import { useState, useEffect } from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Code, 
  Play, 
  Eye, 
  Terminal, 
  Bot, 
  Users, 
  Share2, 
  Settings,
  Mic,
  MicOff,
  Brain,
  Atom,
  Zap
} from "lucide-react"
import { useEditor } from "@/context/editor-context"
import Sidebar from "./sidebar"
import Header from "./header"
import CodeEditor from "./code-editor"
import Preview from "./preview"
import TerminalComponent from "./terminal"
import AIAssistant from "./ai-assistant"
import voiceCommandService from "@/lib/voice/voice-command-service"
import { Badge } from "@/components/ui/badge"

interface Collaborator {
  id: string
  name: string
  cursor?: { line: number; column: number }
  color: string
}

export default function EditorLayout() {
  const { currentFile, currentProject } = useEditor()
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [activePanel, setActivePanel] = useState<'editor' | 'preview' | 'terminal' | 'ai'>('editor')
  const [isNeurofeedbackActive, setIsNeurofeedbackActive] = useState(false)
  const [productivityScore, setProductivityScore] = useState(85)

  useEffect(() => {
    // Simular colaboradores online
    const mockCollaborators: Collaborator[] = [
      { id: '1', name: 'Ana Silva', color: '#ff6b6b', cursor: { line: 15, column: 8 } },
      { id: '2', name: 'João Santos', color: '#4ecdc4', cursor: { line: 23, column: 12 } },
      { id: '3', name: 'Maria Oliveira', color: '#45b7d1', cursor: { line: 45, column: 20 } }
    ]
    setCollaborators(mockCollaborators)

    // Simular mudanças de produtividade
    const interval = setInterval(() => {
      setProductivityScore(prev => {
        const change = (Math.random() - 0.5) * 10
        return Math.max(0, Math.min(100, prev + change))
      })
    }, 30000) // A cada 30 segundos

    return () => clearInterval(interval)
  }, [])

  const toggleVoiceRecognition = async () => {
    try {
      if (isVoiceActive) {
        voiceCommandService.stopListening()
        setIsVoiceActive(false)
      } else {
        await voiceCommandService.startListening()
        setIsVoiceActive(true)
      }
    } catch (error) {
      console.error('Erro no reconhecimento de voz:', error)
    }
  }

  const getProductivityColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const handleRunCode = () => {
    // Implementar execução de código
    console.log('Executando código:', currentFile?.content)
  }

  const handleShareProject = () => {
    // Implementar compartilhamento
    if (currentProject) {
      const shareUrl = `${window.location.origin}/shared/${currentProject.id}`
      navigator.clipboard.writeText(shareUrl)
      console.log('Link copiado:', shareUrl)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <Header />

      {/* Status Bar com Colaboradores e Neurofeedback */}
      <div className="border-b px-4 py-2 flex items-center justify-between bg-muted/50">
        <div className="flex items-center gap-4">
          {/* Colaboradores Online */}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <div className="flex -space-x-2">
              {collaborators.slice(0, 3).map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-xs text-white font-medium"
                  style={{ backgroundColor: collaborator.color }}
                  title={collaborator.name}
                >
                  {collaborator.name.charAt(0)}
                </div>
              ))}
              {collaborators.length > 3 && (
                <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs">
                  +{collaborators.length - 3}
                </div>
              )}
            </div>
          </div>

          {/* Controles de Voz */}
          <Button
            size="sm"
            variant={isVoiceActive ? "destructive" : "outline"}
            onClick={toggleVoiceRecognition}
            className="gap-2"
          >
            {isVoiceActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isVoiceActive ? 'Parar Voz' : 'Comando de Voz'}
          </Button>

          {/* Neurofeedback */}
          <Button
            size="sm"
            variant={isNeurofeedbackActive ? "default" : "outline"}
            onClick={() => setIsNeurofeedbackActive(!isNeurofeedbackActive)}
            className="gap-2"
          >
            <Brain className="h-4 w-4" />
            Neurofeedback
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {/* Score de Produtividade */}
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="text-sm">Produtividade:</span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${getProductivityColor(productivityScore)}`} />
              <span className="text-sm font-medium">{productivityScore.toFixed(0)}%</span>
            </div>
          </div>

          {/* Status do Projeto */}
          {currentProject && (
            <div className="flex items-center gap-2">
              <Badge variant="outline">{currentProject.name}</Badge>
              <Button size="sm" variant="ghost" onClick={handleShareProject}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        <ResizablePanelGroup direction="horizontal">
          {/* Sidebar */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <Sidebar />
          </ResizablePanel>

          <ResizableHandle />

          {/* Main Editor Area */}
          <ResizablePanel defaultSize={60}>
            <ResizablePanelGroup direction="vertical">
              {/* Editor/Preview */}
              <ResizablePanel defaultSize={70}>
                <Tabs value={activePanel} onValueChange={(value) => setActivePanel(value as any)} className="h-full">
                  <div className="border-b px-4">
                    <TabsList className="grid w-full max-w-md grid-cols-4">
                      <TabsTrigger value="editor" className="gap-2">
                        <Code className="h-4 w-4" />
                        Editor
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Preview
                      </TabsTrigger>
                      <TabsTrigger value="terminal" className="gap-2">
                        <Terminal className="h-4 w-4" />
                        Terminal
                      </TabsTrigger>
                      <TabsTrigger value="ai" className="gap-2">
                        <Bot className="h-4 w-4" />
                        IA
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="editor" className="flex-1 m-0">
                    {currentFile ? (
                      <div className="h-full relative">
                        <CodeEditor />
                        
                        {/* Cursores dos Colaboradores */}
                        {collaborators.map((collaborator) => (
                          collaborator.cursor && (
                            <div
                              key={collaborator.id}
                              className="absolute pointer-events-none z-10"
                              style={{
                                top: `${collaborator.cursor.line * 1.5}rem`,
                                left: `${collaborator.cursor.column * 0.6}rem`,
                              }}
                            >
                              <div 
                                className="w-0.5 h-5 animate-pulse"
                                style={{ backgroundColor: collaborator.color }}
                              />
                              <div 
                                className="absolute -top-6 left-0 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
                                style={{ backgroundColor: collaborator.color }}
                              >
                                {collaborator.name}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">Bem-vindo à IDE Colaborativa</p>
                          <p>Selecione um arquivo para começar a editar</p>
                          <p className="text-sm mt-2">Use comandos de voz ou o chat IA para gerar código</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="preview" className="flex-1 m-0">
                    <Preview />
                  </TabsContent>

                  <TabsContent value="terminal" className="flex-1 m-0">
                    <TerminalComponent />
                  </TabsContent>

                  <TabsContent value="ai" className="flex-1 m-0">
                    <AIAssistant />
                  </TabsContent>
                </Tabs>
              </ResizablePanel>

              {/* Bottom Panel (pode ser expandido para mostrar logs, debug, etc.) */}
              {isNeurofeedbackActive && (
                <>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={30} minSize={20}>
                    <Card className="h-full p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Brain className="h-5 w-5" />
                        <h3 className="font-semibold">Neurofeedback</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm">Concentração</span>
                            <span className="text-sm font-medium">78%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm">Fadiga Visual</span>
                            <span className="text-sm font-medium">23%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '23%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm">Stress</span>
                            <span className="text-sm font-medium">15%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }} />
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <p className="text-sm text-muted-foreground">
                            💡 Sugestão: Considere fazer uma pausa de 5 minutos para manter a produtividade.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Panel - AI Assistant (sempre visível) */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
            <AIAssistant />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Voice Command Feedback */}
      {isVoiceActive && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <Mic className="h-4 w-4 animate-pulse" />
          <span className="text-sm">Escutando comandos de voz...</span>
        </div>
      )}

      {/* Quantum Computing Indicator */}
      <div className="fixed bottom-4 left-4">
        <Button size="sm" variant="outline" className="gap-2 bg-background/80 backdrop-blur">
          <Atom className="h-4 w-4" />
          Quantum Ready
        </Button>
      </div>
    </div>
  )
}
