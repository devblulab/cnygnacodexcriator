"use client"

import { useEditor } from "@/context/editor-context"
import { WifiOff, Wifi } from "lucide-react"

interface StatusBarProps {
  networkStatus?: "online" | "offline"
}

export default function StatusBar({ networkStatus = "online" }: StatusBarProps) {
  const { currentFile } = useEditor()

  return (
    <div className="flex items-center justify-between p-1 text-xs border-t bg-muted/50">
      <div className="flex items-center space-x-4">
        <div className="px-2">{currentFile ? `${currentFile.language}` : "Nenhum arquivo"}</div>

        {currentFile && <div className="px-2 border-l">UTF-8</div>}
      </div>

      <div className="flex items-center space-x-4">
        <div className="px-2 flex items-center">
          {networkStatus === "online" ? (
            <Wifi className="h-3 w-3 mr-1 text-green-500" />
          ) : (
            <WifiOff className="h-3 w-3 mr-1 text-amber-500" />
          )}
          {networkStatus === "online" ? "Online" : "Offline"}
        </div>

        <div className="px-2">{currentFile && new Date(currentFile.lastModified).toLocaleTimeString()}</div>

        <div className="px-2 border-l">QuantumCode v0.1.0</div>
      </div>
    </div>
  )
}
