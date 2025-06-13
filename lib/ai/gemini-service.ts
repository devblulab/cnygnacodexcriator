
"use client"

import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai"

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null
  private model: GenerativeModel | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.initialize()
    }
  }

  private initialize() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      console.error("Gemini API key not found")
      return
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey)
      this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" })
    } catch (error) {
      console.error("Failed to initialize Gemini:", error)
    }
  }

  // Geração de interfaces React/Next.js
  async generateInterface(prompt: string): Promise<{
    code: string
    preview: string
    explanation: string
  }> {
    if (!this.model) {
      throw new Error("Gemini not initialized")
    }

    const enhancedPrompt = `
Gere uma interface React/Next.js moderna e responsiva baseada nesta descrição: "${prompt}"

Requisitos:
- Use Tailwind CSS para estilização
- Componentes funcionais com TypeScript
- Design moderno e minimalista inspirado no v0.dev
- Código limpo e bem estruturado
- Componentes reutilizáveis
- Acessibilidade (ARIA labels)
- Responsividade (mobile-first)

Retorne no formato JSON:
{
  "code": "código React/TypeScript completo",
  "preview": "HTML preview da interface",
  "explanation": "explicação detalhada em português do que foi criado"
}
`

    try {
      const result = await this.model.generateContent(enhancedPrompt)
      const response = await result.response
      const text = response.text()
      
      // Parse da resposta JSON
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0])
      }
      
      // Fallback se não conseguir parsear JSON
      return {
        code: text,
        preview: "<div>Preview não disponível</div>",
        explanation: "Interface gerada com sucesso"
      }
    } catch (error) {
      console.error("Erro ao gerar interface:", error)
      throw error
    }
  }

  // Geração de componentes específicos
  async generateComponent(type: string, props: Record<string, any>): Promise<string> {
    if (!this.model) {
      throw new Error("Gemini not initialized")
    }

    const prompt = `
Gere um componente React ${type} com as seguintes propriedades: ${JSON.stringify(props)}

Requisitos:
- TypeScript
- Tailwind CSS
- Acessível
- Responsivo
- Moderno

Retorne apenas o código do componente.
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error("Erro ao gerar componente:", error)
      throw error
    }
  }

  // Explicação de código
  async explainCode(code: string): Promise<string> {
    if (!this.model) {
      throw new Error("Gemini not initialized")
    }

    const prompt = `
Explique este código em português brasileiro de forma didática e detalhada:

\`\`\`
${code}
\`\`\`

Inclua:
- O que o código faz
- Como funciona cada parte
- Conceitos utilizados
- Melhores práticas aplicadas
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error("Erro ao explicar código:", error)
      throw error
    }
  }

  // Debug inteligente
  async debugCode(code: string, error: string): Promise<{
    solution: string
    explanation: string
    fixedCode: string
  }> {
    if (!this.model) {
      throw new Error("Gemini not initialized")
    }

    const prompt = `
Analise este código com erro e forneça uma solução:

Código:
\`\`\`
${code}
\`\`\`

Erro:
${error}

Retorne no formato JSON:
{
  "solution": "solução em português",
  "explanation": "explicação detalhada do problema e como corrigir",
  "fixedCode": "código corrigido"
}
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0])
      }
      
      return {
        solution: "Solução não encontrada automaticamente",
        explanation: text,
        fixedCode: code
      }
    } catch (error) {
      console.error("Erro ao debugar código:", error)
      throw error
    }
  }

  // Refatoração automática
  async refactorCode(code: string, goal: string = "otimização"): Promise<{
    refactoredCode: string
    improvements: string[]
    explanation: string
  }> {
    if (!this.model) {
      throw new Error("Gemini not initialized")
    }

    const prompt = `
Refatore este código para ${goal}:

\`\`\`
${code}
\`\`\`

Foque em:
- Performance
- Legibilidade
- Manutenibilidade
- Acessibilidade
- Boas práticas

Retorne no formato JSON:
{
  "refactoredCode": "código refatorado",
  "improvements": ["lista de melhorias aplicadas"],
  "explanation": "explicação das mudanças em português"
}
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0])
      }
      
      return {
        refactoredCode: code,
        improvements: [],
        explanation: text
      }
    } catch (error) {
      console.error("Erro ao refatorar código:", error)
      throw error
    }
  }

  // Tradução de código entre linguagens
  async translateCode(code: string, fromLang: string, toLang: string): Promise<{
    translatedCode: string
    explanation: string
    differences: string[]
  }> {
    if (!this.model) {
      throw new Error("Gemini not initialized")
    }

    const prompt = `
Traduza este código de ${fromLang} para ${toLang}:

\`\`\`${fromLang}
${code}
\`\`\`

Retorne no formato JSON:
{
  "translatedCode": "código traduzido para ${toLang}",
  "explanation": "explicação da tradução em português",
  "differences": ["principais diferenças entre as linguagens"]
}
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0])
      }
      
      return {
        translatedCode: code,
        explanation: text,
        differences: []
      }
    } catch (error) {
      console.error("Erro ao traduzir código:", error)
      throw error
    }
  }

  // Geração de código quântico
  async generateQuantumCode(algorithm: string): Promise<{
    code: string
    explanation: string
    circuit: string
  }> {
    if (!this.model) {
      throw new Error("Gemini not initialized")
    }

    const prompt = `
Gere código de computação quântica para o algoritmo: ${algorithm}

Use Qiskit (Python) e inclua:
- Código completo e funcional
- Comentários em português
- Explicação do algoritmo
- Representação do circuito

Retorne no formato JSON:
{
  "code": "código Python com Qiskit",
  "explanation": "explicação detalhada em português",
  "circuit": "representação textual do circuito"
}
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0])
      }
      
      return {
        code: text,
        explanation: "Código quântico gerado",
        circuit: "Circuito não disponível"
      }
    } catch (error) {
      console.error("Erro ao gerar código quântico:", error)
      throw error
    }
  }

  // Sugestões de arquitetura
  async suggestArchitecture(projectDescription: string): Promise<{
    architecture: string
    components: string[]
    explanation: string
    diagram: string
  }> {
    if (!this.model) {
      throw new Error("Gemini not initialized")
    }

    const prompt = `
Sugira uma arquitetura de software para: ${projectDescription}

Inclua:
- Padrões de arquitetura recomendados
- Componentes principais
- Fluxo de dados
- Tecnologias recomendadas
- Diagrama textual

Retorne no formato JSON:
{
  "architecture": "tipo de arquitetura recomendada",
  "components": ["lista de componentes"],
  "explanation": "explicação detalhada em português",
  "diagram": "diagrama textual da arquitetura"
}
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0])
      }
      
      return {
        architecture: "Arquitetura modular",
        components: [],
        explanation: text,
        diagram: "Diagrama não disponível"
      }
    } catch (error) {
      console.error("Erro ao sugerir arquitetura:", error)
      throw error
    }
  }

  // Chat colaborativo
  async processMessage(message: string, context: string = ""): Promise<string> {
    if (!this.model) {
      throw new Error("Gemini not initialized")
    }

    const prompt = `
${context ? `Contexto: ${context}\n` : ""}
Usuário: ${message}

Responda de forma útil e amigável em português brasileiro. Se for uma pergunta técnica, forneça exemplos de código quando apropriado.
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error("Erro ao processar mensagem:", error)
      throw error
    }
  }
}

export const geminiService = new GeminiService()
export default geminiService
