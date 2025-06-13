
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, FolderOpen, Code } from "lucide-react"
import Link from "next/link"

// Mock data para projetos
const mockProjects = [
  {
    id: "1",
    name: "Meu Primeiro Projeto",
    description: "Projeto React com TypeScript",
    updatedAt: new Date().toISOString(),
    language: "typescript"
  },
  {
    id: "2", 
    name: "App Todo",
    description: "Aplicativo de tarefas simples",
    updatedAt: new Date().toISOString(),
    language: "javascript"
  },
  {
    id: "3",
    name: "Portfolio Website",
    description: "Site pessoal em HTML/CSS",
    updatedAt: new Date().toISOString(),
    language: "html"
  }
]

export default function DashboardPage() {
  const [projects, setProjects] = useState(mockProjects)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      javascript: "bg-yellow-500",
      typescript: "bg-blue-500", 
      python: "bg-green-500",
      html: "bg-orange-500",
      css: "bg-purple-500"
    }
    return colors[language] || "bg-gray-500"
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Meus Projetos</h1>
          <p className="text-muted-foreground">Gerencie seus projetos de desenvolvimento</p>
        </div>
        <Link href="/editor">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Projeto
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar projetos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                </div>
                <div className={`w-3 h-3 rounded-full ${getLanguageColor(project.language)}`} />
              </div>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Atualizado em {formatDate(project.updatedAt)}
                </span>
                <Link href="/editor">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Code className="h-3 w-3" />
                    Abrir
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum projeto encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Tente ajustar sua busca" : "Crie seu primeiro projeto para começar"}
          </p>
          <Link href="/editor">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Projeto
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
