
"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
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

  const executeCommand = (command: string) => {
    const cmd = command.trim().toLowerCase()
    let output = ""

    switch (cmd) {
      case "help":
        output = `Available commands:
  help     - Show this help message
  clear    - Clear terminal
  ls       - List files
  pwd      - Show current directory
  echo     - Echo text
  npm      - Run npm commands
  node     - Run Node.js`
        break
      case "clear":
        setHistory([])
        return
      case "ls":
        output = "index.html  style.css  script.js  package.json"
        break
      case "pwd":
        output = "/workspace/project"
        break
      default:
        if (cmd.startsWith("echo ")) {
          output = command.substring(5)
        } else if (cmd.startsWith("npm ")) {
          output = `Running: ${command}\n✓ Command executed successfully`
        } else if (cmd.startsWith("node ")) {
          output = `Running: ${command}\n✓ Node.js script executed`
        } else {
          output = `Command not found: ${cmd}\nType 'help' for available commands`
        }
    }

    setHistory(prev => [...prev, `$ ${command}`, output])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setCommandHistory(prev => [...prev, input])
    setHistoryIndex(-1)
    executeCommand(input)
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = Math.min(commandHistory.length - 1, historyIndex + 1)
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-black text-green-400 font-mono text-sm">
      <div className="flex items-center justify-between p-2 border-b border-gray-700">
        <div className="text-sm font-medium text-white">Terminal</div>
        <Button size="sm" variant="ghost" onClick={() => setHistory([])}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div ref={terminalRef} className="flex-1 p-4 overflow-y-auto">
        {history.map((line, index) => (
          <div key={index} className="mb-1 whitespace-pre-wrap">
            {line}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="flex items-center p-4 border-t border-gray-700">
        <ChevronRight className="w-4 h-4 mr-2 text-green-400" />
        <span className="text-green-400 mr-2">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-green-400"
          placeholder="Type a command..."
          autoFocus
        />
      </form>
    </div>
  )
}
