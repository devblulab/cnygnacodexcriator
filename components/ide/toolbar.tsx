"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useEditor } from "@/context/editor-context"
import { useAuth } from "@/lib/firebase/auth-context"
import { Play, Save, Settings, Moon, Sun, Upload, Plus, User, LogOut, Mic } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getVoiceCommandService } from "@/lib/voice/voice-command-service"

export default function Toolbar() {
  const { theme, setTheme } = useTheme()
  const { currentProject, currentFile, saveFile } = useEditor()
  const { user, signOut } = useAuth()
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(
    typeof window !== "undefined" && getVoiceCommandService().isSupported(),
  )

  const handleSave = async () => {
    if (currentFile) {
      await saveFile(currentFile)
    }
  }

  const handleRun = () => {
    // Implement run functionality
    console.log("Run project")
  }

  const handleDeploy = () => {
    // Implement deploy functionality
    console.log("Deploy project")
  }

  const toggleVoiceCommands = () => {
    const voiceService = getVoiceCommandService()

    if (isListening) {
      voiceService.stop()
      setIsListening(false)
    } else {
      const started = voiceService.start()
      setIsListening(started)
    }
  }

  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={handleSave} disabled={!currentFile}>
          <Save className="w-4 h-4 mr-1" />
          Salvar
        </Button>

        <Button variant="outline" size="sm" onClick={handleRun} disabled={!currentProject}>
          <Play className="w-4 h-4 mr-1" />
          Executar
        </Button>

        <Button variant="outline" size="sm" onClick={handleDeploy} disabled={!currentProject}>
          <Upload className="w-4 h-4 mr-1" />
          Deploy
        </Button>

        {voiceSupported && (
          <Button variant={isListening ? "destructive" : "outline"} size="sm" onClick={toggleVoiceCommands}>
            <Mic className="w-4 h-4 mr-1" />
            {isListening ? "Parar" : "Voz"}
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Novo</DropdownMenuLabel>
            <DropdownMenuItem>Projeto</DropdownMenuItem>
            <DropdownMenuItem>Arquivo</DropdownMenuItem>
            <DropdownMenuItem>Pasta</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Configurações</DropdownMenuLabel>
            <DropdownMenuItem>Preferências</DropdownMenuItem>
            <DropdownMenuItem>Atalhos de Teclado</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Tema Claro</DropdownMenuItem>
            <DropdownMenuItem>Tema Escuro</DropdownMenuItem>
            <DropdownMenuItem>Tema Neurofeedback</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.email || "Usuário"}</DropdownMenuLabel>
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Projetos</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
