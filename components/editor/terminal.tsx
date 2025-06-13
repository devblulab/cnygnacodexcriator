"use client"

import React, { useState, useRef, useEffect } from "react"
import { ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Terminal() {
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
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const handleCommand = (command: string) => {
    const newHistory = [...history, `$ ${command}`]

    switch (command.toLowerCase().trim()) {
      case "help":
        newHistory.push("Available commands:")
        newHistory.push("  help - Show this help message")
        newHistory.push("  clear - Clear terminal")
        newHistory.push("  ls - List files")
        newHistory.push("  pwd - Print working directory")
        newHistory.push("  echo <text> - Echo text")
        break
      case "clear":
        setHistory(["Welcome to QuantumCode Terminal", "Type 'help' to see available commands"])
        return
      case "ls":
        newHistory.push("src/")
        newHistory.push("components/")
        newHistory.push("package.json")
        newHistory.push("README.md")
        break
      case "pwd":
        newHistory.push("/workspace/project")
        break
      default:
        if (command.startsWith("echo ")) {
          newHistory.push(command.substring(5))
        } else {
          newHistory.push(`Command not found: ${command}`)
        }
    }

    setHistory(newHistory)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      const newCommandHistory = [...commandHistory, input]
      setCommandHistory(newCommandHistory)
      setHistoryIndex(-1)
      handleCommand(input)
      setInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput("")
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-black text-green-400 font-mono text-sm">
      <div className="flex items-center justify-between p-2 border-b border-gray-700">
        <div className="text-sm font-medium text-white">Terminal</div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setHistory(["Welcome to QuantumCode Terminal", "Type 'help' to see available commands"])}
          className="text-white hover:bg-gray-700"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div
        ref={terminalRef}
        className="flex-1 overflow-auto p-4 space-y-1"
      >
        {history.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap">
            {line}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-green-400" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-green-400"
            placeholder="Enter command..."
            autoFocus
          />
        </div>
      </form>
    </div>
  )
}