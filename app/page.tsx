import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code, Sparkles, Zap, Github, FileCode, Layers } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link href="/" className="flex items-center justify-center">
          <Code className="h-6 w-6 mr-2" />
          <span className="font-bold">QuantumCode</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/features" className="text-sm font-medium hover:underline underline-offset-4">
            Features
          </Link>
          <Link href="/pricing" className="text-sm font-medium hover:underline underline-offset-4">
            Pricing
          </Link>
          <Link href="/docs" className="text-sm font-medium hover:underline underline-offset-4">
            Documentation
          </Link>
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
            Sign In
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    The Modern Web IDE for Developers
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Create, edit, and deploy web applications with a powerful browser-based IDE. Featuring AI
                    assistance, real-time preview, and seamless Firebase integration.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="gap-1.5">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/editor">
                    <Button size="lg" variant="outline">
                      Try Demo
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-full overflow-hidden rounded-lg border bg-background p-2 shadow-xl">
                  <div className="flex h-8 items-center border-b bg-muted/50 px-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                    <div className="ml-4 text-xs text-muted-foreground">index.tsx - QuantumCode</div>
                  </div>
                  <div className="grid grid-cols-[auto_1fr] h-[calc(100%-32px)]">
                    <div className="border-r bg-muted/50 p-2 text-xs text-muted-foreground">
                      <div className="mb-1">1</div>
                      <div className="mb-1">2</div>
                      <div className="mb-1">3</div>
                      <div className="mb-1">4</div>
                      <div className="mb-1">5</div>
                      <div className="mb-1">6</div>
                      <div className="mb-1">7</div>
                      <div className="mb-1">8</div>
                      <div className="mb-1">9</div>
                      <div className="mb-1">10</div>
                    </div>
                    <div className="p-2 font-mono text-xs">
                      <div className="text-blue-500">import</div> React from &apos;react&apos;;
                      <br />
                      <br />
                      <div className="text-blue-500">function</div> <div className="text-yellow-500">App</div>() {"{"}
                      <br />
                      &nbsp;&nbsp;<div className="text-blue-500">return</div> (
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&lt;<div className="text-green-500">div</div>&gt;
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<div className="text-green-500">h1</div>&gt;Hello,
                      World!&lt;/<div className="text-green-500">h1</div>&gt;
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<div className="text-green-500">p</div>&gt;Welcome to
                      QuantumCode&lt;/<div className="text-green-500">p</div>&gt;
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&lt;/<div className="text-green-500">div</div>&gt;
                      <br />
                      &nbsp;&nbsp;);
                      <br />
                      {"}"}
                      <br />
                      <br />
                      <div className="text-blue-500">export</div> <div className="text-blue-500">default</div> App;
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need to Code</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  QuantumCode provides a complete development environment in your browser with all the tools you need to
                  build modern web applications.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                <div className="rounded-full border p-4">
                  <FileCode className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Live Preview</h3>
                <p className="text-sm text-muted-foreground text-center">
                  See your changes in real-time with our integrated preview panel.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                <div className="rounded-full border p-4">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">AI Assistant</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Get intelligent code suggestions and help from our built-in AI assistant.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                <div className="rounded-full border p-4">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Firebase Integration</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Seamlessly connect to Firebase for authentication, database, and storage.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                <div className="rounded-full border p-4">
                  <Github className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">GitHub Integration</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Import from and export to GitHub repositories with ease.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                <div className="rounded-full border p-4">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Instant Deployment</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Deploy your projects with a single click to share with the world.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                <div className="rounded-full border p-4">
                  <Code className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Syntax Highlighting</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Enjoy beautiful syntax highlighting for all popular languages.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ready to Start Coding?</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of developers who are already using QuantumCode to build amazing web applications.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/signup">
                  <Button size="lg" className="gap-1.5">
                    Sign Up for Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} QuantumCode. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="/terms" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
