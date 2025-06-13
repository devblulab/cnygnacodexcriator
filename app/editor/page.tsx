
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Play, Save, FileText, Settings } from "lucide-react"
import Link from "next/link"

export default function EditorPage() {
  const [activeFile, setActiveFile] = useState("index.html")
  const [code, setCode] = useState(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meu Projeto</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
            padding: 40px 20px;
        }
        h1 {
            font-size: 3em;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        p {
            font-size: 1.2em;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        .btn {
            background: rgba(255,255,255,0.2);
            border: 2px solid rgba(255,255,255,0.3);
            color: white;
            padding: 12px 24px;
            font-size: 1.1em;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .btn:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Bem-vindo ao QuantumCode!</h1>
        <p>Seu IDE moderno e livre para desenvolvimento web</p>
        <button class="btn" onclick="changeText()">Clique Aqui!</button>
        <p id="message" style="margin-top: 30px;"></p>
    </div>

    <script>
        function changeText() {
            document.getElementById('message').innerHTML = 
                '✨ Agora você pode começar a programar livremente! ✨';
        }
    </script>
</body>
</html>`)

  const files = [
    { name: "index.html", icon: FileText },
    { name: "style.css", icon: FileText },
    { name: "script.js", icon: FileText }
  ]

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <Code className="h-4 w-4 mr-2" />
              QuantumCode
            </Button>
          </Link>
          <span className="text-sm text-muted-foreground">|</span>
          <span className="text-sm font-medium">Projeto Sem Título</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
          <Button size="sm">
            <Play className="h-4 w-4 mr-2" />
            Executar
          </Button>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - File Explorer */}
        <div className="w-64 border-r bg-muted/50">
          <div className="p-4">
            <h3 className="text-sm font-semibold mb-3">Arquivos</h3>
            <div className="space-y-1">
              {files.map((file) => (
                <button
                  key={file.name}
                  onClick={() => setActiveFile(file.name)}
                  className={`w-full flex items-center gap-2 p-2 rounded text-sm transition-colors ${
                    activeFile === file.name 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted"
                  }`}
                >
                  <file.icon className="h-4 w-4" />
                  {file.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          <Tabs value="editor" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="terminal">Terminal</TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="flex-1 p-0">
              <div className="h-full">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm bg-background border-0 resize-none focus:outline-none"
                  style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace' }}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="flex-1 p-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-sm">Preview</CardTitle>
                </CardHeader>
                <CardContent className="h-full p-0">
                  <iframe
                    srcDoc={code}
                    className="w-full h-full border-0 rounded"
                    title="Preview"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="terminal" className="flex-1 p-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-sm">Terminal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black text-green-400 p-4 rounded font-mono text-sm">
                    <div>$ Bem-vindo ao terminal do QuantumCode!</div>
                    <div>$ Sem restrições - programe livremente!</div>
                    <div className="flex">
                      <span>$ </span>
                      <span className="animate-pulse">_</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
