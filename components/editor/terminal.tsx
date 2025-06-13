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
"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Download } from "lucide-react"

interface TerminalOutput {
  type: 'command' | 'output' | 'error'
  content: string
  timestamp: Date
}

export default function Terminal() {
  const [history, setHistory] = useState<TerminalOutput[]>([
    {
      type: 'output',
      content: 'Bem-vindo ao Terminal QuantumCode! 🚀\nDigite "help" para ver os comandos disponíveis.',
      timestamp: new Date()
    }
  ])
  const [currentCommand, setCurrentCommand] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Comandos disponíveis
  const commands = {
    help: () => `Comandos disponíveis:
• help - Mostra esta ajuda
• clear - Limpa o terminal
• date - Mostra data e hora atual
• echo <texto> - Exibe o texto
• ls - Lista arquivos do projeto
• pwd - Mostra diretório atual
• whoami - Mostra informações do usuário
• version - Mostra versão do QuantumCode
• calc <expressão> - Calculadora básica`,

    clear: () => {
      setHistory([])
      return ''
    },

    date: () => new Date().toLocaleString('pt-BR'),

    echo: (args: string) => args || '',

    ls: () => `index.html
style.css
script.js
README.md`,

    pwd: () => '/projeto-quantumcode',

    whoami: () => 'Usuário do QuantumCode (modo livre)',

    version: () => 'QuantumCode IDE v0.1.0 - Edição Livre',

    calc: (args: string) => {
      try {
        // Validar expressão matemática simples
        const expression = args.replace(/[^0-9+\-*/.() ]/g, '')
        if (!expression) return 'Uso: calc <expressão matemática>'
        
        const result = Function(`"use strict"; return (${expression})`)()
        return `${expression} = ${result}`
      } catch (error) {
        return 'Erro: Expressão matemática inválida'
      }
    }
  }

  useEffect(() => {
    // Auto scroll para o final
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const executeCommand = (command: string) => {
    if (!command.trim()) return

    // Adicionar comando ao histórico
    setHistory(prev => [...prev, {
      type: 'command',
      content: `$ ${command}`,
      timestamp: new Date()
    }])

    setCommandHistory(prev => [...prev, command])
    setHistoryIndex(-1)

    // Processar comando
    const [cmd, ...args] = command.trim().split(' ')
    const commandKey = cmd.toLowerCase() as keyof typeof commands
    
    let output = ''
    
    if (commands[commandKey]) {
      output = commands[commandKey](args.join(' '))
    } else {
      output = `Comando não encontrado: ${cmd}\nDigite "help" para ver comandos disponíveis.`
    }

    if (output) {
      setHistory(prev => [...prev, {
        type: commands[commandKey] === commands.clear ? 'output' : 'output',
        content: output,
        timestamp: new Date()
      }])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    executeCommand(currentCommand)
    setCurrentCommand('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex + 1
        if (newIndex < commandHistory.length) {
          setHistoryIndex(newIndex)
          setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex])
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCurrentCommand('')
      }
    }
  }

  const clearTerminal = () => {
    setHistory([{
      type: 'output',
      content: 'Terminal limpo! Digite "help" para ver comandos disponíveis.',
      timestamp: new Date()
    }])
  }

  const downloadLog = () => {
    const log = history.map(item => 
      `[${item.timestamp.toLocaleTimeString()}] ${item.content}`
    ).join('\n')
    
    const blob = new Blob([log], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quantumcode-terminal-${new Date().getTime()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-green-400">
      <div className="flex items-center justify-between p-2 border-b border-gray-700">
        <h3 className="font-medium text-white">Terminal</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clearTerminal}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={downloadLog}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div 
        ref={terminalRef}
        className="flex-1 p-4 overflow-y-auto font-mono text-sm"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((item, index) => (
          <div key={index} className="mb-1">
            <span className={
              item.type === 'command' ? 'text-yellow-400' :
              item.type === 'error' ? 'text-red-400' : 'text-green-400'
            }>
              {item.content}
            </span>
          </div>
        ))}
        
        <form onSubmit={handleSubmit} className="flex items-center mt-2">
          <span className="text-yellow-400 mr-2">$</span>
          <Input
            ref={inputRef}
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none text-green-400 focus:ring-0 font-mono text-sm p-0"
            placeholder="Digite um comando..."
            autoFocus
          />
        </form>
      </div>
    </div>
  )
}
