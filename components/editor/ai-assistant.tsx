"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mic, MicOff, Send, Loader2, Code, Wand2, Sparkles } from "lucide-react"
import { useEditor } from "@/context/editor-context"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI coding assistant. How can I help you today?",
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { currentFile } = useEditor()

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
      // Simulate AI response
      await new Promise((resolve) => setTimeout(resolve, 1000))

      let response = ""

      if (input.toLowerCase().includes("generate") || input.toLowerCase().includes("create")) {
        response =
          "Here's a sample code for a button component:\n\n```jsx\nfunction Button({ children, onClick, variant = 'primary' }) {\n  return (\n    <button\n      className={`px-4 py-2 rounded font-medium ${variant === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}\n      onClick={onClick}\n    >\n      {children}\n    </button>\n  );\n}\n```\n\nYou can use it like this:\n\n```jsx\n<Button onClick={() => alert('Clicked!')}>Click Me</Button>\n```"
      } else if (input.toLowerCase().includes("explain") && currentFile) {
        response =
          "This code defines a React component that renders a button with different styling based on the 'variant' prop. It accepts children elements, an onClick handler, and a variant prop with a default value of 'primary'. The component applies Tailwind CSS classes for styling, with blue background for primary buttons and gray for secondary ones."
      } else if (input.toLowerCase().includes("fix") || input.toLowerCase().includes("debug")) {
        response =
          "I found a potential issue in your code. The onClick handler is not properly typed. You should add TypeScript types like this:\n\n```tsx\nfunction Button({ \n  children, \n  onClick, \n  variant = 'primary' \n}: { \n  children: React.ReactNode; \n  onClick: () => void; \n  variant?: 'primary' | 'secondary'; \n}) {\n  // Rest of your code\n}\n```"
      } else {
        // General query
        response =
          "I can help you with coding tasks like generating components, explaining code, fixing bugs, or optimizing your code. Just let me know what you need!"
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
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleVoiceRecognition = () => {
    setIsListening(!isListening)
  }

  const formatMessage = (content: string) => {
    // Format code blocks
    return content.replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre class="bg-muted p-2 rounded-md my-2 overflow-x-auto"><code>${code}</code></pre>`
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="text-sm font-medium">AI Assistant</div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Wand2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Code className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="chat" className="flex flex-col h-full">
        <div className="border-b px-2">
          <TabsList className="h-9">
            <TabsTrigger value="chat" className="text-xs">
              Chat
            </TabsTrigger>
            <TabsTrigger value="commands" className="text-xs">
              Commands
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0 data-[state=active]:flex">
          <div className="flex-1 overflow-auto p-4">
            {messages.map((message) => (
              <div key={message.id} className={`mb-4 ${message.role === "assistant" ? "pl-2" : "pl-4"}`}>
                <div className="font-semibold text-xs mb-1">{message.role === "assistant" ? "Assistant" : "You"}</div>
                <div className="text-sm" dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />
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
                placeholder="Ask me anything about coding..."
                disabled={isProcessing}
              />
              <Button
                type="button"
                size="icon"
                variant={isListening ? "destructive" : "outline"}
                onClick={toggleVoiceRecognition}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button type="submit" size="icon" disabled={!input.trim() || isProcessing}>
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="commands" className="flex-1 overflow-auto p-4 m-0">
          <h3 className="font-medium mb-4">Available AI Commands</h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm">Code Generation</h4>
              <p className="text-xs text-muted-foreground mb-2">Create code from descriptions</p>
              <div className="bg-muted p-2 rounded-md text-xs">
                "Generate a login form with React"
                <br />
                "Create a REST API endpoint for users"
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm">Code Explanation</h4>
              <p className="text-xs text-muted-foreground mb-2">Understand what code does</p>
              <div className="bg-muted p-2 rounded-md text-xs">
                "Explain this code"
                <br />
                "What does this function do?"
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm">Debugging</h4>
              <p className="text-xs text-muted-foreground mb-2">Find and fix errors</p>
              <div className="bg-muted p-2 rounded-md text-xs">
                "Debug this code"
                <br />
                "Fix this error"
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm">Code Transformation</h4>
              <p className="text-xs text-muted-foreground mb-2">Convert between languages</p>
              <div className="bg-muted p-2 rounded-md text-xs">
                "Convert from JavaScript to TypeScript"
                <br />
                "Transform this to use async/await"
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="p-4 m-0">
          <h3 className="font-medium mb-4">AI Assistant Settings</h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">AI Model</h4>
              <select className="w-full p-2 border rounded-md text-sm">
                <option value="gemini-pro">Gemini Pro</option>
                <option value="gemini-pro-vision">Gemini Pro Vision</option>
                <option value="claude">Claude</option>
                <option value="gpt-4">GPT-4</option>
              </select>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Code Style</h4>
              <select className="w-full p-2 border rounded-md text-sm">
                <option value="standard">Standard</option>
                <option value="functional">Functional</option>
                <option value="object-oriented">Object-Oriented</option>
                <option value="concise">Concise</option>
              </select>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Response Length</h4>
              <select className="w-full p-2 border rounded-md text-sm">
                <option value="concise">Concise</option>
                <option value="balanced">Balanced</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
