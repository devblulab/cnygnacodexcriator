
"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  Copy,
  Download,
  Eye,
  Star,
  Calendar,
  Filter,
  Grid3X3,
  List
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface GeneratedComponent {
  id: string
  name: string
  code: string
  preview: string
  description: string
  tags: string[]
  createdAt: Date
  favorite?: boolean
}

interface ComponentGalleryProps {
  components: GeneratedComponent[]
  onSelectComponent: (component: GeneratedComponent) => void
  onToggleFavorite?: (componentId: string) => void
}

export function ComponentGallery({ 
  components, 
  onSelectComponent, 
  onToggleFavorite 
}: ComponentGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"date" | "name" | "favorites">("date")

  // Get all unique tags
  const allTags = Array.from(
    new Set(components.flatMap(component => component.tags))
  ).sort()

  // Filter and sort components
  const filteredComponents = components
    .filter(component => {
      const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           component.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => component.tags.includes(tag))
      return matchesSearch && matchesTags
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "favorites":
          return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0)
        case "date":
        default:
          return b.createdAt.getTime() - a.createdAt.getTime()
      }
    })

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const copyComponent = async (component: GeneratedComponent) => {
    try {
      await navigator.clipboard.writeText(component.code)
      toast({
        title: "Copied!",
        description: `${component.name} code copied to clipboard`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      })
    }
  }

  const downloadComponent = (component: GeneratedComponent) => {
    const blob = new Blob([component.code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${component.name}.tsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Component Gallery</h2>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "outline"}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search components..."
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "name" | "favorites")}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="date">Latest</option>
            <option value="name">Name</option>
            <option value="favorites">Favorites</option>
          </select>
        </div>
      </div>

      {/* Components */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {filteredComponents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="mb-4">🔍</div>
              <p>No components found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className={`gap-4 ${
              viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                : "space-y-4"
            }`}>
              {filteredComponents.map(component => (
                <Card 
                  key={component.id} 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    viewMode === "list" ? "flex" : ""
                  }`}
                  onClick={() => onSelectComponent(component)}
                >
                  {viewMode === "grid" ? (
                    <>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-sm">{component.name}</CardTitle>
                          {onToggleFavorite && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                onToggleFavorite(component.id)
                              }}
                              className="p-1 h-auto"
                            >
                              <Star 
                                className={`w-4 h-4 ${
                                  component.favorite ? "fill-yellow-400 text-yellow-400" : ""
                                }`} 
                              />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {component.description}
                        </p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-1 mb-3">
                          {component.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {component.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{component.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {component.createdAt.toLocaleDateString()}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                onSelectComponent(component)
                              }}
                              className="p-1 h-auto"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                copyComponent(component)
                              }}
                              className="p-1 h-auto"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                downloadComponent(component)
                              }}
                              className="p-1 h-auto"
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </>
                  ) : (
                    <div className="flex w-full">
                      <CardContent className="flex-1 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold">{component.name}</h3>
                            <p className="text-sm text-muted-foreground">{component.description}</p>
                          </div>
                          {onToggleFavorite && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                onToggleFavorite(component.id)
                              }}
                              className="p-1 h-auto"
                            >
                              <Star 
                                className={`w-4 h-4 ${
                                  component.favorite ? "fill-yellow-400 text-yellow-400" : ""
                                }`} 
                              />
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {component.tags.slice(0, 4).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {component.createdAt.toLocaleDateString()}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  copyComponent(component)
                                }}
                                className="p-1 h-auto"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  downloadComponent(component)
                                }}
                                className="p-1 h-auto"
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
