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
Você é um especialista em desenvolvimento React/Next.js. Crie uma interface moderna e responsiva baseada na descrição: "${prompt}".

Diretrizes:
- Use React functional components com TypeScript
- Use Tailwind CSS para styling
- Implemente animações suaves quando apropriado
- Garanta acessibilidade (ARIA labels, semantic HTML)
- Use componentes shadcn/ui quando possível
- Código deve ser limpo e bem comentado
- Implemente estado local quando necessário

Responda em JSON com esta estrutura:
{
  "code": "código React/TSX completo",
  "preview": "HTML para preview",
  "explanation": "explicação detalhada do componente"
}
`

    try {
      const result = await this.model.generateContent(enhancedPrompt)
      const response = await result.response
      const text = response.text()

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      // Fallback se não encontrar JSON
      return {
        code: text,
        preview: `<div class="p-4">${text}</div>`,
        explanation: "Componente gerado pelo Gemini"
      }
    } catch (error) {
      console.error("Error generating interface:", error)
      throw new Error("Failed to generate interface")
    }
  }

  // Análise e sugestões de código
  async analyzeCode(code: string): Promise<{
    suggestions: string[]
    improvements: string[]
    errors: string[]
  }> {
    if (!this.model) {
      throw new Error("Gemini not initialized")
    }

    const prompt = `
Analise o seguinte código React/TypeScript e forneça feedback:

${code}

Responda em JSON com:
{
  "suggestions": ["sugestões de melhoria"],
  "improvements": ["melhorias de performance"],
  "errors": ["possíveis erros ou problemas"]
}
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      return {
        suggestions: ["Análise não disponível"],
        improvements: [],
        errors: []
      }
    } catch (error) {
      console.error("Error analyzing code:", error)
      throw new Error("Failed to analyze code")
    }
  }

  // Geração de componentes com base em descrição
  async generateComponent(description: string, type: string = "component"): Promise<string> {
    if (!this.model) {
      throw new Error("Gemini not initialized")
    }

    const prompt = `
Crie um componente React/TypeScript ${type} baseado na descrição: "${description}"

Requisitos:
- Use TypeScript com tipos apropriados
- Use Tailwind CSS para styling
- Seja responsivo
- Inclua comentários explicativos
- Use boas práticas do React

Retorne apenas o código do componente:
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error("Error generating component:", error)
      throw new Error("Failed to generate component")
    }
  }

  // Otimização de código
  async optimizeCode(code: string): Promise<string> {
    if (!this.model) {
      throw new Error("Gemini not initialized")
    }

    const prompt = `
Otimize o seguinte código React/TypeScript para melhor performance e legibilidade:

${code}

Melhorias a considerar:
- Performance (useMemo, useCallback, etc.)
- Legibilidade e organização
- Acessibilidade
- Boas práticas do React

Retorne o código otimizado:
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error("Error optimizing code:", error)
      throw new Error("Failed to optimize code")
    }
  }
}

// Export singleton instance
const geminiService = new GeminiService()
export default geminiService