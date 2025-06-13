
"use client"

import geminiService from "@/lib/ai/gemini-service"

interface VoiceCommand {
  command: string
  timestamp: number
  confidence: number
}

class VoiceCommandService {
  private recognition: SpeechRecognition | null = null
  private synthesis: SpeechSynthesis | null = null
  private isListening = false
  private callbacks: ((result: VoiceCommand) => void)[] = []

  constructor() {
    if (typeof window !== "undefined") {
      this.initialize()
    }
  }

  private initialize() {
    // Inicializar Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition()
      this.setupRecognition()
    }

    // Inicializar Speech Synthesis
    if (window.speechSynthesis) {
      this.synthesis = window.speechSynthesis
    }
  }

  private setupRecognition() {
    if (!this.recognition) return

    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = 'pt-BR'

    this.recognition.onresult = (event) => {
      let finalTranscript = ''
      let confidence = 0

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
          confidence = result[0].confidence
        }
      }

      if (finalTranscript) {
        const command: VoiceCommand = {
          command: finalTranscript.trim(),
          timestamp: Date.now(),
          confidence
        }

        this.callbacks.forEach(callback => callback(command))
        this.processVoiceCommand(command.command)
      }
    }

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
    }

    this.recognition.onend = () => {
      if (this.isListening) {
        // Reiniciar automaticamente se ainda estiver no modo de escuta
        this.recognition?.start()
      }
    }
  }

  // Iniciar escuta de comandos de voz
  startListening(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'))
        return
      }

      try {
        this.isListening = true
        this.recognition.start()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  // Parar escuta de comandos de voz
  stopListening() {
    this.isListening = false
    this.recognition?.stop()
  }

  // Processar comando de voz usando Gemini
  private async processVoiceCommand(command: string) {
    try {
      const processedCommand = await this.interpretCommand(command)
      
      // Executar ação baseada no comando interpretado
      switch (processedCommand.action) {
        case 'generate_interface':
          await this.executeGenerateInterface(processedCommand.parameters)
          break
        case 'explain_code':
          await this.executeExplainCode(processedCommand.parameters)
          break
        case 'debug_code':
          await this.executeDebugCode(processedCommand.parameters)
          break
        case 'create_component':
          await this.executeCreateComponent(processedCommand.parameters)
          break
        default:
          await this.provideGeneralResponse(command)
      }
    } catch (error) {
      console.error('Erro ao processar comando de voz:', error)
      this.speak('Desculpe, não consegui processar esse comando.')
    }
  }

  // Interpretar comando usando Gemini
  private async interpretCommand(command: string): Promise<{
    action: string
    parameters: Record<string, any>
    confidence: number
  }> {
    const prompt = `
Interprete este comando de voz para uma IDE web: "${command}"

Identifique a ação que o usuário quer realizar e extraia os parâmetros necessários.

Ações possíveis:
- generate_interface: gerar uma interface/página
- explain_code: explicar código
- debug_code: debugar código
- create_component: criar componente específico
- general_question: pergunta geral

Retorne no formato JSON:
{
  "action": "tipo_da_acao",
  "parameters": {"param1": "valor1"},
  "confidence": 0.8
}
`

    try {
      const result = await geminiService.processMessage(prompt)
      const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/) || result.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0])
      }
      
      return {
        action: 'general_question',
        parameters: { question: command },
        confidence: 0.5
      }
    } catch (error) {
      console.error('Erro ao interpretar comando:', error)
      return {
        action: 'general_question',
        parameters: { question: command },
        confidence: 0.1
      }
    }
  }

  // Executar geração de interface
  private async executeGenerateInterface(params: any) {
    try {
      const description = params.description || params.interface || 'interface básica'
      this.speak(`Gerando interface: ${description}`)
      
      const result = await geminiService.generateInterface(description)
      
      // Disparar evento customizado para a UI
      window.dispatchEvent(new CustomEvent('voice-generate-interface', {
        detail: result
      }))
      
      this.speak('Interface gerada com sucesso!')
    } catch (error) {
      this.speak('Erro ao gerar interface.')
    }
  }

  // Executar explicação de código
  private async executeExplainCode(params: any) {
    try {
      this.speak('Explicando o código atual...')
      
      // Buscar código atual (seria implementado na UI)
      const currentCode = this.getCurrentCode()
      if (!currentCode) {
        this.speak('Nenhum código selecionado para explicar.')
        return
      }
      
      const explanation = await geminiService.explainCode(currentCode)
      
      // Disparar evento para mostrar explicação na UI
      window.dispatchEvent(new CustomEvent('voice-explain-code', {
        detail: { explanation }
      }))
      
      // Ler explicação em voz alta (versão resumida)
      const summary = explanation.substring(0, 200) + '...'
      this.speak(summary)
    } catch (error) {
      this.speak('Erro ao explicar código.')
    }
  }

  // Executar debug de código
  private async executeDebugCode(params: any) {
    try {
      this.speak('Analisando código para debug...')
      
      const currentCode = this.getCurrentCode()
      const currentError = this.getCurrentError()
      
      if (!currentCode || !currentError) {
        this.speak('Código ou erro não encontrado.')
        return
      }
      
      const result = await geminiService.debugCode(currentCode, currentError)
      
      window.dispatchEvent(new CustomEvent('voice-debug-code', {
        detail: result
      }))
      
      this.speak('Solução encontrada! Verifique as sugestões.')
    } catch (error) {
      this.speak('Erro ao debugar código.')
    }
  }

  // Executar criação de componente
  private async executeCreateComponent(params: any) {
    try {
      const componentType = params.type || 'button'
      this.speak(`Criando componente: ${componentType}`)
      
      const code = await geminiService.generateComponent(componentType, params)
      
      window.dispatchEvent(new CustomEvent('voice-create-component', {
        detail: { code, type: componentType }
      }))
      
      this.speak('Componente criado com sucesso!')
    } catch (error) {
      this.speak('Erro ao criar componente.')
    }
  }

  // Resposta geral
  private async provideGeneralResponse(command: string) {
    try {
      const response = await geminiService.processMessage(command, 'IDE colaborativa')
      
      window.dispatchEvent(new CustomEvent('voice-general-response', {
        detail: { response }
      }))
      
      // Ler resposta resumida
      const summary = response.substring(0, 150) + '...'
      this.speak(summary)
    } catch (error) {
      this.speak('Desculpe, não consegui processar sua pergunta.')
    }
  }

  // Text-to-Speech
  speak(text: string, lang = 'pt-BR'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 0.9
      utterance.pitch = 1

      utterance.onend = () => resolve()
      utterance.onerror = (error) => reject(error)

      this.synthesis.speak(utterance)
    })
  }

  // Registrar callback para comandos de voz
  onVoiceCommand(callback: (result: VoiceCommand) => void) {
    this.callbacks.push(callback)
  }

  // Remover callback
  removeVoiceCommand(callback: (result: VoiceCommand) => void) {
    const index = this.callbacks.indexOf(callback)
    if (index > -1) {
      this.callbacks.splice(index, 1)
    }
  }

  // Métodos auxiliares (seriam implementados na UI)
  private getCurrentCode(): string | null {
    // Implementar na UI para buscar código atual
    return null
  }

  private getCurrentError(): string | null {
    // Implementar na UI para buscar erro atual
    return null
  }

  // Comandos de voz pré-definidos
  getAvailableCommands(): string[] {
    return [
      'Gere uma página de login',
      'Crie um navbar responsivo',
      'Adicione um botão animado',
      'Explique este código',
      'Debug este erro',
      'Crie um componente de formulário',
      'Otimize este código',
      'Traduza para TypeScript',
      'Crie um algoritmo quântico',
      'Sugira uma arquitetura'
    ]
  }
}

export const voiceCommandService = new VoiceCommandService()
export default voiceCommandService
