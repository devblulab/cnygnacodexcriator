
"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, 
  Code, 
  Mic, 
  MicOff, 
  Brain, 
  Atom, 
  Users, 
  Zap,
  ArrowRight,
  Play,
  Eye
} from "lucide-react"
import { useRouter } from "next/navigation"
import geminiService from "@/lib/ai/gemini-service"
import voiceCommandService from "@/lib/voice/voice-command-service"

const examplePrompts = [
  "Crie uma landing page moderna com formulário de contato",
  "Gere um dashboard com gráficos e métricas",
  "Desenvolva um blog responsivo com dark mode",
  "Construa um e-commerce com carrinho de compras",
  "Faça uma página de login com autenticação social",
  "Crie um algoritmo quântico de busca"
]

const features = [
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "IA Generativa",
    description: "Gere interfaces completas com Gemini AI"
  },
  {
    icon: <Mic className="h-6 w-6" />,
    title: "Comandos de Voz",
    description: "Desenvolva falando naturalmente"
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Colaboração Real",
    description: "Edite em tempo real com sua equipe"
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: "Neurofeedback",
    description: "Otimize sua produtividade"
  },
  {
    icon: <Atom className="h-6 w-6" />,
    title: "Computação Quântica",
    description: "Suporte a algoritmos quânticos"
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Deploy Instantâneo",
    description: "Publique com um clique"
  }
]

export default function HomePage() {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<any>(null)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Auto-focus no input
    inputRef.current?.focus()

    // Configurar listener para comandos de voz
    const handleVoiceCommand = (command: any) => {
      setPrompt(command.command)
    }

    voiceCommandService.onVoiceCommand(handleVoiceCommand)

    return () => {
      voiceCommandService.removeVoiceCommand(handleVoiceCommand)
    }
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return

    setIsLoading(true)
    
    try {
      const result = await geminiService.generateInterface(prompt)
      setGeneratedContent(result)
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error)
    } finally {
      setIsLoading(false)
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

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt)
    inputRef.current?.focus()
  }

  const goToEditor = () => {
    router.push('/editor')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">QuantumCode</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-1">
              <Brain className="h-3 w-3" />
              Neurofeedback
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Atom className="h-3 w-3" />
              Quantum Ready
            </Badge>
            <Button onClick={goToEditor}>
              Abrir Editor
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-6">
            Desenvolva com IA, Voz e Consciência
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            A primeira IDE colaborativa com IA generativa, comandos de voz, neurofeedback e suporte à computação quântica.
            Transforme ideias em código instantaneamente.
          </p>
        </div>

        {/* Main Prompt Input */}
        <div className="max-w-3xl mx-auto mb-12">
          <Card className="p-6 shadow-xl border-2">
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Input
                  ref={inputRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Descreva a interface que você quer criar... (ex: 'Crie uma landing page para um app de delivery')"
                  className="text-lg h-12"
                  onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                />
              </div>
              <Button
                onClick={toggleVoiceRecognition}
                variant={isListening ? "destructive" : "outline"}
                size="lg"
                className="px-4"
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} size="lg" className="px-8">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Gerar
                  </>
                )}
              </Button>
            </div>
            
            {isListening && (
              <div className="text-center text-sm text-muted-foreground">
                <Mic className="h-4 w-4 inline mr-2 animate-pulse" />
                Escutando... Fale sua ideia
              </div>
            )}
          </Card>

          {/* Example Prompts */}
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-3">Experimente estes exemplos:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleExampleClick(example)}
                  className="text-left h-auto py-2 px-3"
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Generated Content Preview */}
        {generatedContent && (
          <div className="max-w-6xl mx-auto mb-12">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Resultado Gerado</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button size="sm" onClick={goToEditor}>
                    <Code className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Código Gerado:</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-60">
                    <code>{generatedContent.code}</code>
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Preview:</h4>
                  <div 
                    className="border rounded-lg p-4 bg-white min-h-60"
                    dangerouslySetInnerHTML={{ __html: generatedContent.preview }}
                  />
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Explicação:</h4>
                <p className="text-sm">{generatedContent.explanation}</p>
              </div>
            </Card>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="text-primary mb-4">{feature.icon}</div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="p-8 max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-purple-600/10">
            <CardContent className="p-0">
              <h2 className="text-2xl font-bold mb-4">Pronto para Revolucionar seu Desenvolvimento?</h2>
              <p className="text-muted-foreground mb-6">
                Acesso 100% gratuito. Sem cadastro. Comece a criar agora mesmo.
              </p>
              <Button size="lg" onClick={goToEditor} className="px-8">
                <Play className="h-5 w-5 mr-2" />
                Começar Agora
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>QuantumCode - IDE Colaborativa com IA | Desenvolvido com ❤️ e Tecnologia Quântica</p>
        </div>
      </footer>
    </div>
  )
}
