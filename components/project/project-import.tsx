"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useEditor } from "@/context/editor-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, Upload, GitBranch, FileUp } from "lucide-react"
import JSZip from "jszip"

export default function ProjectImport() {
  const router = useRouter()
  const { createProject } = useEditor()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gitUrl, setGitUrl] = useState("")
  const [gitBranch, setGitBranch] = useState("main")
  const [uploadProgress, setUploadProgress] = useState(0)

  // Handle file upload from desktop
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setLoading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Check if it's a zip file
      const file = files[0]
      if (file.type !== "application/zip" && !file.name.endsWith(".zip")) {
        throw new Error("Please upload a ZIP file containing your project")
      }

      // Read the zip file
      const fileData = await readFileAsArrayBuffer(file, (progress) => {
        setUploadProgress(Math.round(progress * 50)) // First 50% is reading the file
      })

      // Process the zip file
      const projectFiles = await processZipFile(fileData, (progress) => {
        setUploadProgress(50 + Math.round(progress * 50)) // Last 50% is processing the zip
      })

      // Create a new project with the extracted files
      const projectName = file.name.replace(".zip", "")
      const projectId = await createProject({
        name: projectName,
        description: `Imported from ${file.name}`,
        files: projectFiles,
        collaborators: [],
        isPublic: false,
      })

      // Redirect to the new project
      router.push(`/dashboard?project=${projectId}`)
    } catch (err: any) {
      console.error("Error uploading project:", err)
      setError(err.message || "Failed to upload project")
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  // Handle Git repository import
  const handleGitImport = async () => {
    if (!gitUrl) {
      setError("Please enter a Git repository URL")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Extract repository name from URL
      const repoName = extractRepoName(gitUrl)
      if (!repoName) {
        throw new Error("Invalid Git repository URL")
      }

      // For now, we'll just create an empty project with the repository name
      // In a real implementation, you would fetch the repository contents
      const projectId = await createProject({
        name: repoName,
        description: `Imported from ${gitUrl} (${gitBranch} branch)`,
        files: [
          {
            id: `file_${Date.now()}`,
            name: "README.md",
            content: `# ${repoName}\n\nImported from ${gitUrl}\nBranch: ${gitBranch}\n\nThis is a placeholder file. In a real implementation, the repository contents would be fetched.`,
            language: "markdown",
            path: "README.md",
            lastModified: Date.now(),
          },
        ],
        collaborators: [],
        isPublic: false,
      })

      // Redirect to the new project
      router.push(`/dashboard?project=${projectId}`)
    } catch (err: any) {
      console.error("Error importing Git repository:", err)
      setError(err.message || "Failed to import Git repository")
    } finally {
      setLoading(false)
    }
  }

  // Helper function to read a file as ArrayBuffer with progress
  const readFileAsArrayBuffer = (file: File, onProgress: (progress: number) => void): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = event.loaded / event.total
          onProgress(progress)
        }
      }

      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result)
        } else {
          reject(new Error("Failed to read file"))
        }
      }

      reader.onerror = () => {
        reject(reader.error || new Error("Failed to read file"))
      }

      reader.readAsArrayBuffer(file)
    })
  }

  // Helper function to process a zip file
  const processZipFile = async (data: ArrayBuffer, onProgress: (progress: number) => void): Promise<Array<any>> => {
    const zip = new JSZip()

    // Load the zip file
    const zipContents = await zip.loadAsync(data)
    const files: Array<any> = []
    let processedFiles = 0
    const totalFiles = Object.keys(zipContents.files).length

    // Process each file in the zip
    for (const [path, zipEntry] of Object.entries(zipContents.files)) {
      // Skip directories
      if (zipEntry.dir) {
        processedFiles++
        onProgress(processedFiles / totalFiles)
        continue
      }

      // Skip hidden files and directories
      if (path.split("/").some((part) => part.startsWith("."))) {
        processedFiles++
        onProgress(processedFiles / totalFiles)
        continue
      }

      // Skip binary files and large files
      if (isBinaryPath(path) || zipEntry.uncompressedSize > 1024 * 1024) {
        processedFiles++
        onProgress(processedFiles / totalFiles)
        continue
      }

      try {
        // Get the file content
        const content = await zipEntry.async("string")

        // Determine the language based on file extension
        const language = getLanguageFromPath(path)

        // Add the file to the list
        files.push({
          id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          name: path.split("/").pop() || path,
          content,
          language,
          path,
          lastModified: Date.now(),
        })
      } catch (err) {
        console.warn(`Skipping file ${path}: ${err}`)
      }

      processedFiles++
      onProgress(processedFiles / totalFiles)
    }

    return files
  }

  // Helper function to determine if a file is binary based on its path
  const isBinaryPath = (path: string): boolean => {
    const binaryExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".ico",
      ".svg",
      ".pdf",
      ".doc",
      ".docx",
      ".ppt",
      ".pptx",
      ".xls",
      ".xlsx",
      ".zip",
      ".rar",
      ".tar",
      ".gz",
      ".7z",
      ".mp3",
      ".mp4",
      ".avi",
      ".mov",
      ".wmv",
      ".exe",
      ".dll",
      ".so",
      ".dylib",
      ".ttf",
      ".otf",
      ".woff",
      ".woff2",
    ]

    return binaryExtensions.some((ext) => path.toLowerCase().endsWith(ext))
  }

  // Helper function to determine the language based on file extension
  const getLanguageFromPath = (path: string): string => {
    const ext = path.split(".").pop()?.toLowerCase() || ""

    const languageMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascriptreact",
      ts: "typescript",
      tsx: "typescriptreact",
      html: "html",
      css: "css",
      scss: "scss",
      less: "less",
      json: "json",
      md: "markdown",
      py: "python",
      rb: "ruby",
      java: "java",
      c: "c",
      cpp: "cpp",
      cs: "csharp",
      go: "go",
      rs: "rust",
      php: "php",
      sql: "sql",
      sh: "shell",
      bat: "bat",
      ps1: "powershell",
      yaml: "yaml",
      yml: "yaml",
      toml: "toml",
      ini: "ini",
      xml: "xml",
      svg: "svg",
    }

    return languageMap[ext] || "plaintext"
  }

  // Helper function to extract repository name from URL
  const extractRepoName = (url: string): string | null => {
    // Handle GitHub URLs
    const githubMatch = url.match(/github\.com\/([^/]+)\/([^/.]+)/)
    if (githubMatch) {
      return githubMatch[2]
    }

    // Handle GitLab URLs
    const gitlabMatch = url.match(/gitlab\.com\/([^/]+)\/([^/.]+)/)
    if (gitlabMatch) {
      return gitlabMatch[2]
    }

    // Handle Bitbucket URLs
    const bitbucketMatch = url.match(/bitbucket\.org\/([^/]+)\/([^/.]+)/)
    if (bitbucketMatch) {
      return bitbucketMatch[2]
    }

    // Handle direct Git URLs
    const gitMatch = url.match(/\/([^/]+)\.git$/)
    if (gitMatch) {
      return gitMatch[1]
    }

    return null
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Import Project</CardTitle>
        <CardDescription>Import a project from your computer or a Git repository</CardDescription>
      </CardHeader>

      <Tabs defaultValue="upload">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="git">Git Repository</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <CardContent className="space-y-4 pt-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="project-file">Upload ZIP File</Label>
              <div className="border-2 border-dashed rounded-md p-6 text-center">
                <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop a ZIP file here, or click to select a file
                </p>
                <Input
                  id="project-file"
                  type="file"
                  accept=".zip"
                  onChange={handleFileUpload}
                  disabled={loading}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("project-file")?.click()}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Select ZIP File
                    </>
                  )}
                </Button>
              </div>

              {loading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground text-center">
                    {uploadProgress < 100 ? "Processing..." : "Creating project..."}
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground mt-4">
                <p className="font-medium">Supported files:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>ZIP archives containing your project files</li>
                  <li>Maximum size: 10MB</li>
                  <li>Binary files (images, etc.) will be skipped</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </TabsContent>

        <TabsContent value="git">
          <CardContent className="space-y-4 pt-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="git-url">Git Repository URL</Label>
              <Input
                id="git-url"
                placeholder="https://github.com/username/repository.git"
                value={gitUrl}
                onChange={(e) => setGitUrl(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Enter the URL of a public Git repository (GitHub, GitLab, Bitbucket)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="git-branch">Branch</Label>
              <Input
                id="git-branch"
                placeholder="main"
                value={gitBranch}
                onChange={(e) => setGitBranch(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">The branch to import (defaults to main)</p>
            </div>
          </CardContent>

          <CardFooter>
            <Button onClick={handleGitImport} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <GitBranch className="mr-2 h-4 w-4" />
                  Import Repository
                </>
              )}
            </Button>
          </CardFooter>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
