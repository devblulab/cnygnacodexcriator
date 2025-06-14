
"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Send,
  Bot,
  User,
  Code,
  Copy,
  Download,
  Sparkles,
  Loader2,
  FileText,
  Palette,
  Zap
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  codeBlocks?: CodeBlock[]
}

interface CodeBlock {
  language: string
  code: string
  filename?: string
}

export function V0Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: "Hello! I'm your AI assistant. I can help you build components, write code, and create amazing web experiences. What would you like to build today?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestedPrompts = [
    {
      icon: <Code className="w-4 h-4" />,
      text: "Create a modern button component",
      category: "Component"
    },
    {
      icon: <Palette className="w-4 h-4" />,
      text: "Design a dashboard layout",
      category: "Layout"
    },
    {
      icon: <FileText className="w-4 h-4" />,
      text: "Build a form with validation",
      category: "Form"
    },
    {
      icon: <Zap className="w-4 h-4" />,
      text: "Add animations to my component",
      category: "Animation"
    }
  ]

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Simulate AI response - In a real app, this would call your AI service
      await new Promise(resolve => setTimeout(resolve, 2000))

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `I understand you want to: "${input}". Here's a solution for you:`,
        timestamp: new Date(),
        codeBlocks: [
          {
            language: "tsx",
            filename: "MyComponent.tsx",
            code: `import React from 'react'
import { Button } from '@/components/ui/button'

export function MyComponent() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Your Component</h2>
      <p className="text-gray-600 mb-4">
        This component was generated based on your request.
      </p>
      <Button className="bg-blue-600 hover:bg-blue-700">
        Click me
      </Button>
    </div>
  )
}`
          }
        ]
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "Code copied to clipboard"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      })
    }
  }

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">AI Assistant</h2>
            <p className="text-sm text-muted-foreground">Powered by Gemini</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
          Online
        </Badge>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === "user" 
                  ? "bg-blue-500" 
                  : "bg-gradient-to-r from-purple-500 to-pink-500"
              }`}>
                {message.type === "user" ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              
              <div className={`flex-1 max-w-[80%] ${message.type === "user" ? "text-right" : ""}`}>
                <Card className={`${
                  message.type === "user" 
                    ? "bg-blue-500 text-white ml-auto" 
                    : "bg-white dark:bg-slate-800"
                }`}>
                  <CardContent className="p-3">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {message.codeBlocks && message.codeBlocks.map((block, index) => (
                      <div key={index} className="mt-3">
                        <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-t-lg">
                          <div className="flex items-center gap-2">
                            <Code className="w-4 h-4" />
                            <span className="text-xs font-mono">{block.filename || block.language}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(block.code)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => downloadCode(block.code, block.filename || `code.${block.language}`)}
                              className="h-6 w-6 p-0"
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <pre className="bg-slate-50 dark:bg-slate-900 p-3 rounded-b-lg overflow-x-auto">
                          <code className="text-xs">{block.code}</code>
                        </pre>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <p className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggested Prompts */}
      {messages.length === 1 && (
        <div className="p-4 border-t bg-white/50 dark:bg-slate-900/50">
          <p className="text-sm font-medium mb-3">Try these suggestions:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="justify-start h-auto p-3 text-left"
                onClick={() => handleSuggestedPrompt(prompt.text)}
              >
                <div className="flex items-start gap-2 w-full">
                  {prompt.icon}
                  <div>
                    <p className="text-sm">{prompt.text}</p>
                    <p className="text-xs text-muted-foreground">{prompt.category}</p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to build something amazing..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
