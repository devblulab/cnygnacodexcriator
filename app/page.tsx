import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Code, Zap, Users, Sparkles } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <Code className="h-6 w-6" />
          <span className="ml-2 font-bold">QuantumCode</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/editor">
            <Button variant="ghost">Editor</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Bem-vindo ao QuantumCode
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  IDE moderna e livre para desenvolvimento web com assistência de IA integrada.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/editor">
                  <Button size="lg" className="gap-1.5">
                    Começar a Codificar
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg">
                    Ver Projetos
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Rápido & Moderno
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Interface moderna e responsiva para uma experiência de desenvolvimento fluida.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    IA Integrada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Assistente de IA powered by Gemini para ajudar no desenvolvimento.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Acesso Livre
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Sem necessidade de login ou cadastro. Comece a programar imediatamente!</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}