"use client"

import { generateCode } from "@/lib/ai/gemini-service"

type VoiceCommandHandler = {
  execute: (command: string) => Promise<string | void>
  description: string
  examples: string[]
}

// Map of command patterns to their handlers
const commandHandlers: Record<string, VoiceCommandHandler> = {
  "create|generate|make|new": {
    execute: async (command: string) => {
      // Extract what to create from the command
      const match = command.match(/create|generate|make|new\s+(.*)/i)
      if (!match) return "Could not understand what to create"

      const description = match[1]
      return await generateCode(`Create ${description}`, { description })
    },
    description: "Generate code based on a description",
    examples: ["Create a login form with React", "Generate a Next.js API route for user authentication"],
  },

  "explain|describe|what does": {
    execute: async (command: string) => {
      // This would typically use code from the current editor
      // For now, we'll just return a placeholder
      return "To explain code, I need to see the code in the editor first."
    },
    description: "Explain the selected code or code in the current file",
    examples: ["Explain this code", "What does this function do?"],
  },

  "debug|fix|solve": {
    execute: async (command: string) => {
      // This would typically use code from the current editor
      // For now, we'll just return a placeholder
      return "To debug code, I need to see the code in the editor first."
    },
    description: "Debug the selected code or code in the current file",
    examples: ["Debug this code", "Fix this error"],
  },

  "translate|convert": {
    execute: async (command: string) => {
      // Extract languages from the command
      const match = command.match(/translate|convert\s+from\s+(\w+)\s+to\s+(\w+)/i)
      if (!match) return "Could not understand the translation request"

      const fromLanguage = match[1]
      const toLanguage = match[2]

      // This would typically use code from the current editor
      return `Will translate from ${fromLanguage} to ${toLanguage} once code is selected.`
    },
    description: "Translate code from one language to another",
    examples: ["Translate from JavaScript to Python", "Convert from Java to TypeScript"],
  },

  "run|execute|build": {
    execute: async (command: string) => {
      // This would trigger the build/run process
      return "Starting build process..."
    },
    description: "Run or build the current project",
    examples: ["Run the project", "Build and deploy"],
  },

  "help|commands|what can you do": {
    execute: async () => {
      // Return available commands
      let helpText = "Available voice commands:\n\n"

      Object.entries(commandHandlers).forEach(([patterns, handler]) => {
        helpText += `${patterns.split("|").join(", ")}:\n`
        helpText += `  ${handler.description}\n`
        helpText += `  Examples: ${handler.examples.join(", ")}\n\n`
      })

      return helpText
    },
    description: "Show available voice commands",
    examples: ["Help", "What commands can I use?"],
  },
}

export class VoiceCommandService {
  private recognition: SpeechRecognition | null = null
  private isListening = false
  private onResultCallback: ((result: string) => void) | null = null
  private onCommandCallback: ((command: string, response: string) => void) | null = null
  private onErrorCallback: ((error: string) => void) | null = null

  constructor() {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognitionAPI: any = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      this.recognition = new SpeechRecognitionAPI()
      this.recognition.continuous = false
      this.recognition.interimResults = false
      this.recognition.lang = "pt-BR" // Default to Brazilian Portuguese

      this.recognition.onresult = this.handleResult.bind(this)
      this.recognition.onerror = this.handleError.bind(this)
      this.recognition.onend = () => {
        this.isListening = false
      }
    }
  }

  public setLanguage(lang: string): void {
    if (this.recognition) {
      this.recognition.lang = lang
    }
  }

  public start(): boolean {
    if (!this.recognition) {
      this.handleError({ error: "Speech recognition not supported" })
      return false
    }

    try {
      this.recognition.start()
      this.isListening = true
      return true
    } catch (error) {
      this.handleError({ error: "Failed to start speech recognition" })
      return false
    }
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  public isSupported(): boolean {
    return !!this.recognition
  }

  public onResult(callback: (result: string) => void): void {
    this.onResultCallback = callback
  }

  public onCommand(callback: (command: string, response: string) => void): void {
    this.onCommandCallback = callback
  }

  public onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback
  }

  private async handleResult(event: any): Promise<void> {
    const transcript = event.results[0][0].transcript.trim().toLowerCase()

    if (this.onResultCallback) {
      this.onResultCallback(transcript)
    }

    // Process the command
    await this.processCommand(transcript)
  }

  private handleError(event: { error: string }): void {
    if (this.onErrorCallback) {
      this.onErrorCallback(event.error)
    }
  }

  private async processCommand(command: string): Promise<void> {
    try {
      let handled = false

      // Check each command pattern
      for (const [patterns, handler] of Object.entries(commandHandlers)) {
        const patternArray = patterns.split("|")

        for (const pattern of patternArray) {
          if (command.includes(pattern)) {
            const response = await handler.execute(command)

            if (this.onCommandCallback && response) {
              this.onCommandCallback(command, response.toString())
            }

            handled = true
            break
          }
        }

        if (handled) break
      }

      // If no command matched
      if (!handled && this.onCommandCallback) {
        this.onCommandCallback(
          command,
          "I didn't understand that command. Try saying 'help' to see available commands.",
        )
      }
    } catch (error) {
      console.error("Error processing voice command:", error)

      if (this.onErrorCallback) {
        this.onErrorCallback("Error processing command")
      }
    }
  }
}

// Create a singleton instance
let voiceCommandServiceInstance: VoiceCommandService | null = null

export function getVoiceCommandService(): VoiceCommandService {
  if (!voiceCommandServiceInstance) {
    voiceCommandServiceInstance = new VoiceCommandService()
  }
  return voiceCommandServiceInstance
}
