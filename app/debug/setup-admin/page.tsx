
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createAdminUser } from '@/lib/firebase/setup-admin'

export default function SetupAdminPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  const handleCreateAdmin = async () => {
    setIsLoading(true)
    setMessage('')
    
    try {
      const user = await createAdminUser()
      setSuccess(true)
      setMessage(`Usuário administrador criado/verificado com sucesso!\nUID: ${user.uid}\nEmail: gugaadm@gmail.com\nSenha: 123456`)
    } catch (error: any) {
      setSuccess(false)
      setMessage(`Erro: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Setup Usuário Administrador</CardTitle>
          <CardDescription>
            Criar usuário administrador para testes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p><strong>Email:</strong> gugaadm@gmail.com</p>
            <p><strong>Senha:</strong> 123456</p>
            <p><strong>Role:</strong> admin</p>
          </div>
          
          <Button 
            onClick={handleCreateAdmin} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Criando...' : 'Criar Usuário Admin'}
          </Button>
          
          {message && (
            <div className={`p-4 rounded-md whitespace-pre-line ${
              success ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}
          
          {success && (
            <div className="mt-4 p-4 bg-blue-100 text-blue-800 border border-blue-200 rounded-md">
              <p><strong>Próximos passos:</strong></p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Vá para <a href="/login" className="underline text-blue-600">/login</a></li>
                <li>Use o email: gugaadm@gmail.com</li>
                <li>Use a senha: 123456</li>
                <li>Faça login como administrador</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
