
"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import {
  Upload,
  Globe,
  Github,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react"

interface Project {
  id: string
  name: string
  description: string
  components: any[]
}

interface DeploymentDialogProps {
  project: Project
  isOpen: boolean
  onClose: () => void
}

export function DeploymentDialog({ project, isOpen, onClose }: DeploymentDialogProps) {
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState<"idle" | "deploying" | "success" | "error">("idle")
  const [deploymentUrl, setDeploymentUrl] = useState("")
  const [siteName, setSiteName] = useState(project.name.toLowerCase().replace(/\s+/g, "-"))
  const [siteDescription, setSiteDescription] = useState(project.description)
  const [deploymentPlatform, setDeploymentPlatform] = useState("replit")

  const handleDeploy = async () => {
    setIsDeploying(true)
    setDeploymentStatus("deploying")

    try {
      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // In a real implementation, this would:
      // 1. Create a new Replit project
      // 2. Generate the project files
      // 3. Deploy to Replit's hosting
      // 4. Return the deployment URL
      
      const mockUrl = `https://${siteName}.${deploymentPlatform === "replit" ? "replit.app" : "vercel.app"}`
      setDeploymentUrl(mockUrl)
      setDeploymentStatus("success")
      
      toast({
        title: "Deployed Successfully!",
        description: `Your project is now live at ${mockUrl}`
      })
      
    } catch (error) {
      setDeploymentStatus("error")
      toast({
        title: "Deployment Failed",
        description: "There was an error deploying your project. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDeploying(false)
    }
  }

  const handleClose = () => {
    if (!isDeploying) {
      setDeploymentStatus("idle")
      setDeploymentUrl("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Deploy Project
          </DialogTitle>
          <DialogDescription>
            Deploy your project to the web and share it with others.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Project Info */}
          <div className="p-4 bg-secondary/20 rounded-lg">
            <h3 className="font-semibold text-sm">{project.name}</h3>
            <p className="text-sm text-muted-foreground">{project.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{project.components.length} components</Badge>
              <Badge variant="outline">React + TypeScript</Badge>
            </div>
          </div>

          {deploymentStatus === "idle" && (
            <>
              {/* Site Configuration */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="platform">Deployment Platform</Label>
                  <Select value={deploymentPlatform} onValueChange={setDeploymentPlatform}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="replit">Replit (Recommended)</SelectItem>
                      <SelectItem value="vercel" disabled>Vercel (Coming Soon)</SelectItem>
                      <SelectItem value="netlify" disabled>Netlify (Coming Soon)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="my-awesome-project"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your site will be available at: {siteName}.{deploymentPlatform === "replit" ? "replit.app" : "vercel.app"}
                  </p>
                </div>

                <div>
                  <Label htmlFor="siteDescription">Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    placeholder="A brief description of your project"
                    rows={3}
                  />
                </div>
              </div>
            </>
          )}

          {deploymentStatus === "deploying" && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <h3 className="font-semibold">Deploying your project...</h3>
              <p className="text-sm text-muted-foreground">
                This may take a few moments. Please don't close this window.
              </p>
            </div>
          )}

          {deploymentStatus === "success" && (
            <div className="text-center py-8">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-green-700">Deployment Successful!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your project is now live on the web.
              </p>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">{deploymentUrl}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(deploymentUrl, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Site
                  </Button>
                </div>
              </div>
            </div>
          )}

          {deploymentStatus === "error" && (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <h3 className="font-semibold text-red-700">Deployment Failed</h3>
              <p className="text-sm text-muted-foreground">
                There was an error deploying your project. Please try again.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {deploymentStatus === "idle" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleDeploy} disabled={!siteName.trim()}>
                <Upload className="w-4 h-4 mr-2" />
                Deploy Project
              </Button>
            </>
          )}

          {deploymentStatus === "success" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={() => window.open(deploymentUrl, "_blank")}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Site
              </Button>
            </>
          )}

          {deploymentStatus === "error" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={handleDeploy}>
                Try Again
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
