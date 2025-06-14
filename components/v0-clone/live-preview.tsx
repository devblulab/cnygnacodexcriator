
"use client"

import React, { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, ExternalLink, Maximize2 } from "lucide-react"

interface LivePreviewProps {
  code: string
  componentName: string
}

export function LivePreview({ code, componentName }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const generatePreviewHTML = (componentCode: string) => {
    // Transform the component code to make it renderable
    const transformedCode = `
      // React and required imports
      const { useState, useEffect, useRef } = React;
      
      // Mock Tailwind CSS (basic styles)
      const tailwindCSS = \`
        <style>
          /* Basic Tailwind-like styles */
          .p-4 { padding: 1rem; }
          .p-6 { padding: 1.5rem; }
          .p-8 { padding: 2rem; }
          .m-4 { margin: 1rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mt-4 { margin-top: 1rem; }
          .mx-auto { margin-left: auto; margin-right: auto; }
          .text-center { text-align: center; }
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .text-sm { font-size: 0.875rem; }
          .text-lg { font-size: 1.125rem; }
          .text-xl { font-size: 1.25rem; }
          .text-2xl { font-size: 1.5rem; }
          .font-bold { font-weight: bold; }
          .font-semibold { font-weight: 600; }
          .bg-white { background-color: white; }
          .bg-gray-100 { background-color: #f3f4f6; }
          .bg-gray-200 { background-color: #e5e7eb; }
          .bg-blue-500 { background-color: #3b82f6; }
          .bg-blue-600 { background-color: #2563eb; }
          .text-white { color: white; }
          .text-gray-600 { color: #4b5563; }
          .text-gray-800 { color: #1f2937; }
          .rounded { border-radius: 0.25rem; }
          .rounded-lg { border-radius: 0.5rem; }
          .rounded-xl { border-radius: 0.75rem; }
          .shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); }
          .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
          .border { border: 1px solid #e5e7eb; }
          .flex { display: flex; }
          .flex-col { flex-direction: column; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .space-y-4 > * + * { margin-top: 1rem; }
          .w-full { width: 100%; }
          .h-full { height: 100%; }
          .min-h-screen { min-height: 100vh; }
          .max-w-md { max-width: 28rem; }
          .max-w-lg { max-width: 32rem; }
          .hover\\:bg-blue-700:hover { background-color: #1d4ed8; }
          .transition { transition: all 0.15s ease-in-out; }
          .cursor-pointer { cursor: pointer; }
          .select-none { user-select: none; }
          .focus\\:outline-none:focus { outline: none; }
          .focus\\:ring-2:focus { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5); }
          .disabled\\:opacity-50:disabled { opacity: 0.5; }
          .disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }
          .grid { display: grid; }
          .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .gap-4 { gap: 1rem; }
          .gap-2 { gap: 0.5rem; }
          .relative { position: relative; }
          .absolute { position: absolute; }
          .top-0 { top: 0; }
          .left-0 { left: 0; }
          .right-0 { right: 0; }
          .bottom-0 { bottom: 0; }
          .z-10 { z-index: 10; }
          .opacity-0 { opacity: 0; }
          .opacity-100 { opacity: 1; }
          .transform { transform: translateX(var(--tw-translate-x, 0)) translateY(var(--tw-translate-y, 0)); }
          .scale-95 { transform: scale(0.95); }
          .scale-100 { transform: scale(1); }
          .duration-200 { transition-duration: 200ms; }
          .ease-in-out { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
          .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
        </style>
      \`;

      // Component code
      ${componentCode.replace(/export\s+(default\s+)?/g, '')}
      
      // Render the component
      const container = document.getElementById('root');
      const root = ReactDOM.createRoot(container);
      
      try {
        root.render(React.createElement(${componentName}));
      } catch (error) {
        container.innerHTML = '<div style="padding: 20px; color: red; font-family: monospace;">Error rendering component: ' + error.message + '</div>';
      }
    `

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Component Preview</title>
        <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: #f8fafc;
          }
          #root {
            width: 100%;
            height: 100%;
          }
          /* Basic Tailwind-like styles */
          .p-4 { padding: 1rem; }
          .p-6 { padding: 1.5rem; }
          .p-8 { padding: 2rem; }
          .m-4 { margin: 1rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mt-4 { margin-top: 1rem; }
          .mx-auto { margin-left: auto; margin-right: auto; }
          .text-center { text-align: center; }
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .text-sm { font-size: 0.875rem; }
          .text-lg { font-size: 1.125rem; }
          .text-xl { font-size: 1.25rem; }
          .text-2xl { font-size: 1.5rem; }
          .font-bold { font-weight: bold; }
          .font-semibold { font-weight: 600; }
          .bg-white { background-color: white; }
          .bg-gray-100 { background-color: #f3f4f6; }
          .bg-gray-200 { background-color: #e5e7eb; }
          .bg-blue-500 { background-color: #3b82f6; }
          .bg-blue-600 { background-color: #2563eb; }
          .text-white { color: white; }
          .text-gray-600 { color: #4b5563; }
          .text-gray-800 { color: #1f2937; }
          .rounded { border-radius: 0.25rem; }
          .rounded-lg { border-radius: 0.5rem; }
          .rounded-xl { border-radius: 0.75rem; }
          .shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); }
          .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
          .border { border: 1px solid #e5e7eb; }
          .flex { display: flex; }
          .flex-col { flex-direction: column; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .space-y-4 > * + * { margin-top: 1rem; }
          .w-full { width: 100%; }
          .h-full { height: 100%; }
          .min-h-screen { min-height: 100vh; }
          .max-w-md { max-width: 28rem; }
          .max-w-lg { max-width: 32rem; }
          .hover\\:bg-blue-700:hover { background-color: #1d4ed8; }
          .transition { transition: all 0.15s ease-in-out; }
          .cursor-pointer { cursor: pointer; }
          .select-none { user-select: none; }
          .focus\\:outline-none:focus { outline: none; }
          .focus\\:ring-2:focus { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5); }
          .disabled\\:opacity-50:disabled { opacity: 0.5; }
          .disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }
          .grid { display: grid; }
          .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .gap-4 { gap: 1rem; }
          .gap-2 { gap: 0.5rem; }
          .relative { position: relative; }
          .absolute { position: absolute; }
          .top-0 { top: 0; }
          .left-0 { left: 0; }
          .right-0 { right: 0; }
          .bottom-0 { bottom: 0; }
          .z-10 { z-index: 10; }
          .opacity-0 { opacity: 0; }
          .opacity-100 { opacity: 1; }
          .transform { transform: translateX(var(--tw-translate-x, 0)) translateY(var(--tw-translate-y, 0)); }
          .scale-95 { transform: scale(0.95); }
          .scale-100 { transform: scale(1); }
          .duration-200 { transition-duration: 200ms; }
          .ease-in-out { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
          .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/babel">
          ${transformedCode}
        </script>
      </body>
      </html>
    `
  }

  const refreshPreview = () => {
    setIsLoading(true)
    setError(null)
    
    if (iframeRef.current) {
      const html = generatePreviewHTML(code)
      iframeRef.current.srcdoc = html
    }
  }

  useEffect(() => {
    refreshPreview()
  }, [code, componentName])

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setError("Failed to load preview")
  }

  const openInNewTab = () => {
    const html = generatePreviewHTML(code)
    const newWindow = window.open()
    if (newWindow) {
      newWindow.document.write(html)
      newWindow.document.close()
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <span className="text-sm font-medium">Live Preview</span>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={refreshPreview}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={openInNewTab}>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="text-sm text-gray-500">Loading preview...</div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="text-red-500 mb-2">⚠️ Preview Error</div>
              <div className="text-sm text-gray-600">{error}</div>
              <Button size="sm" onClick={refreshPreview} className="mt-2">
                Try Again
              </Button>
            </div>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0 bg-white"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-scripts allow-same-origin"
          title={`Preview of ${componentName}`}
        />
      </div>
    </div>
  )
}
