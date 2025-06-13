import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyC67eeXRdRKE6dgDHE37ryw1NjE3ijwJis",
)

// Get the generative model
const model = genAI.getGenerativeModel({ model: "gemini-pro" })

export type CodeGenerationOptions = {
  language?: string
  framework?: string
  description?: string
  context?: string
}

export async function generateCode(prompt: string, options?: CodeGenerationOptions): Promise<string> {
  try {
    // Build a more detailed prompt with the options
    let enhancedPrompt = prompt

    if (options) {
      enhancedPrompt += "\n\n"

      if (options.language) {
        enhancedPrompt += `Language: ${options.language}\n`
      }

      if (options.framework) {
        enhancedPrompt += `Framework: ${options.framework}\n`
      }

      if (options.description) {
        enhancedPrompt += `Additional context: ${options.description}\n`
      }
    }

    // Add instructions to format the response as code only
    enhancedPrompt += "\nPlease provide only the code without explanations or markdown formatting."

    const result = await model.generateContent(enhancedPrompt)
    return result.response.text()
  } catch (error) {
    console.error("Error generating code:", error)
    throw new Error("Failed to generate code. Please try again.")
  }
}

export async function explainCode(code: string, language: string): Promise<string> {
  try {
    const prompt = `Explain the following ${language} code in detail, highlighting key concepts and potential improvements:\n\n${code}`
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error) {
    console.error("Error explaining code:", error)
    throw new Error("Failed to explain code. Please try again.")
  }
}

export async function debugCode(code: string, error: string, language: string): Promise<string> {
  try {
    const prompt = `Debug the following ${language} code that's producing this error: "${error}".\n\nCode:\n${code}\n\nPlease explain the issue and provide a corrected version.`
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error) {
    console.error("Error debugging code:", error)
    throw new Error("Failed to debug code. Please try again.")
  }
}

export async function translateCode(code: string, fromLanguage: string, toLanguage: string): Promise<string> {
  try {
    const prompt = `Translate the following ${fromLanguage} code to ${toLanguage}:\n\n${code}\n\nPlease provide only the translated code without explanations.`
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error) {
    console.error("Error translating code:", error)
    throw new Error("Failed to translate code. Please try again.")
  }
}

export async function getCodeCompletion(code: string, language: string): Promise<string> {
  try {
    const prompt = `Complete the following ${language} code. Only return the completion, not the entire code:\n\n${code}`
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error) {
    console.error("Error getting code completion:", error)
    throw new Error("Failed to complete code. Please try again.")
  }
}
