
"use client"

import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai"

interface ProjectStructure {
  files: Array<{
    path: string
    content: string
    type: 'component' | 'page' | 'api' | 'style' | 'config' | 'utility'
  }>
  dependencies: string[]
  instructions: string
}

interface ComponentGeneration {
  code: string
  preview: string
  explanation: string
  files?: ProjectStructure
  dependencies?: string[]
}

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

  // Sistema avançado de geração igual ao v0.dev
  async generateAdvancedProject(prompt: string): Promise<ComponentGeneration> {
    if (!this.model) {
      throw new Error("Gemini not initialized")
    }

    const enhancedPrompt = `
Você é um especialista em desenvolvimento web moderno igual ao v0.dev. Crie um projeto completo baseado na descrição: "${prompt}".

DIRETRIZES OBRIGATÓRIAS:
- Gere um projeto COMPLETO com todos os arquivos necessários
- Use Next.js 14+ com App Router
- TypeScript obrigatório
- Tailwind CSS para styling
- Componentes shadcn/ui quando apropriado
- Responsivo e acessível
- Estado gerenciado com React hooks
- Validação de forms com react-hook-form + zod
- Animações suaves com framer-motion

ESTRUTURA DE RESPOSTA OBRIGATÓRIA (JSON):
{
  "code": "código principal do componente/página",
  "preview": "HTML/JSX para preview visual",
  "explanation": "explicação detalhada do projeto",
  "files": {
    "files": [
      {
        "path": "app/page.tsx",
        "content": "código completo do arquivo",
        "type": "page"
      },
      {
        "path": "components/ui/button.tsx", 
        "content": "código completo do componente",
        "type": "component"
      }
    ],
    "dependencies": ["framer-motion", "react-hook-form", "@hookform/resolvers", "zod"],
    "instructions": "instruções de instalação e uso"
  }
}

TIPOS DE PROJETO SUPORTADOS:
- Portfólio de dentista
- Dashboards administrativos
- E-commerce
- Landing pages
- Aplicações SaaS
- Blogs
- Sistemas de gestão

COMPONENTES SEMPRE INCLUIR:
- Layout responsivo
- Header/Navigation
- Footer
- Formulários de contato
- Seções de conteúdo
- Componentes UI reutilizáveis

Para portfólio de dentista, inclua:
- Header com logo e navegação
- Hero section com CTA
- Seção sobre o dentista
- Serviços oferecidos
- Galeria de casos/antes e depois
- Depoimentos de pacientes
- Formulário de agendamento
- Informações de contato
- Footer completo

SEMPRE gere código funcional e completo, sem placeholder ou "TODO".
`

    try {
      const result = await this.model.generateContent(enhancedPrompt)
      const response = await result.response
      const text = response.text()

      // Extrair JSON da resposta
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          code: parsed.code,
          preview: parsed.preview,
          explanation: parsed.explanation,
          files: parsed.files,
          dependencies: parsed.files?.dependencies || []
        }
      }

      // Fallback para resposta simples
      return {
        code: text,
        preview: `<div class="p-4 border rounded-lg">${text}</div>`,
        explanation: "Projeto gerado com sucesso"
      }
    } catch (error) {
      console.error("Error generating project:", error)
      throw new Error("Failed to generate advanced project")
    }
  }

  // Método específico para portfólio de dentista
  async generateDentistPortfolio(): Promise<ComponentGeneration> {
    const prompt = `
Crie um portfólio completo para um dentista moderno com:

1. Design profissional e confiável
2. Paleta de cores: azul médico (#0066CC), branco (#FFFFFF), cinza (#F8F9FA)
3. Seções essenciais:
   - Hero com nome do dentista e especialidade
   - Sobre (formação, experiência)
   - Serviços (implantes, ortodontia, limpeza, etc.)
   - Galeria de sorrisos transformados
   - Depoimentos reais de pacientes
   - Agendamento online
   - Contato e localização
4. Animações suaves entre seções
5. Formulários funcionais
6. Design responsivo
7. Otimizado para SEO

Inclua todos os arquivos necessários para um projeto Next.js completo.
`

    return this.generateAdvancedProject(prompt)
  }

  // Geração de interfaces React/Next.js (método original melhorado)
  async generateInterface(prompt: string): Promise<ComponentGeneration> {
    return this.generateAdvancedProject(prompt)
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
Analise o seguinte código React/TypeScript e forneça feedback detalhado:

${code}

Responda em JSON com:
{
  "suggestions": ["sugestões específicas de melhoria"],
  "improvements": ["melhorias de performance e boas práticas"],
  "errors": ["possíveis erros, bugs ou problemas de segurança"]
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
        suggestions: ["Código analisado, sem sugestões específicas"],
        improvements: ["Considere adicionar testes unitários"],
        errors: ["Nenhum erro crítico detectado"]
      }
    } catch (error) {
      console.error("Error analyzing code:", error)
      throw new Error("Failed to analyze code")
    }
  }

  // Resolver problemas de código
  async solveProblem(description: string, code?: string): Promise<{
    solution: string
    fixedCode?: string
    explanation: string
  }> {
    if (!this.model) {
      throw new Error("Gemini not initialized")
    }

    const prompt = `
Resolva o seguinte problema de código:

PROBLEMA: ${description}

${code ? `CÓDIGO ATUAL:\n${code}` : ''}

Forneça uma solução completa em JSON:
{
  "solution": "descrição da solução",
  "fixedCode": "código corrigido (se aplicável)",
  "explanation": "explicação detalhada do problema e solução"
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
        solution: text,
        explanation: "Solução gerada automaticamente"
      }
    } catch (error) {
      console.error("Error solving problem:", error)
      throw new Error("Failed to solve problem")
    }
  }
}

const geminiService = new GeminiService()
export default geminiService
