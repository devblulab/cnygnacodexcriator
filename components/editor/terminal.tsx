"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Terminal() {
  const [history, setHistory] = useState<string[]>([
    "Welcome to QuantumCode Terminal",
    "Type 'help' to see available commands",
  ])
  const [input, setInput] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when history changes
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const handleCommand = (command: string) => {
    // Add command to history
    setHistory((prev) => [...prev, `$ ${command}`])

    // Process command
    if (command.trim() === "clear") {
      setHistory([])
      return
    }

    if (command.trim() === "help") {
      setHistory((prev) => [
        ...prev,
        "Available commands:",
        "  help - Show this help message",
        "  clear - Clear the terminal",
        "  echo <message> - Print a message",
        "  date - Show current date and time",
        "  ls - List files in current directory",
        "  pwd - Print working directory",
      ])
      return
    }

    if (command.trim().startsWith("echo ")) {
      const message = command.trim().substring(5)
      setHistory((prev) => [...prev, message])
      return
    }

    if (command.trim() === "date") {
      setHistory((prev) => [...prev, new Date().toString()])
      return
    }

    if (command.trim() === "ls") {
      setHistory((prev) => [...prev, "index.html", "styles.css", "app.js", "package.json"])
      return
    }

    if (command.trim() === "pwd") {
      setHistory((prev) => [...prev, "/home/user/project"])
      return
    }

    // Unknown command
    setHistory((prev) => [...prev, `Command not found: ${command}`])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    handleCommand(input)

    // Add to command history
    setCommandHistory((prev) => [input, ...prev])
    setHistoryIndex(-1)
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()

      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()

      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput("")
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="text-sm font-medium">Terminal</div>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-2 font-mono text-sm bg-black text-green-500" ref={terminalRef}>
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">
            {line}
          </div>
        ))}
        <form onSubmit={handleSubmit} className="flex items-center">
          <ChevronRight className="w-4 h-4 mr-1" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-green-500"
            autoFocus
          />
        </form>
      </div>
    </div>
  )
}
