import EnvChecker from "@/components/debug/env-checker"

export default function EnvironmentDebugPage() {
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-4">Verificação de Variáveis de Ambiente</h1>
      <p className="mb-6 text-muted-foreground">
        Esta página verifica se as variáveis de ambiente do arquivo .env.local estão sendo carregadas corretamente.
      </p>

      <EnvChecker />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Como configurar o arquivo .env.local</h2>
        <div className="bg-muted p-4 rounded-md">
          <pre className="text-sm whitespace-pre-wrap">
            {`# Firebase Client SDK (acessível no navegador)
NEXT_PUBLIC_FIREBASE_API_KEY=seu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=seu-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=seu-measurement-id

# Firebase Admin SDK (apenas no servidor)
FIREBASE_PROJECT_ID=seu-projeto
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@seu-projeto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nSua chave privada aqui\\n-----END PRIVATE KEY-----\\n"

# Gemini API
NEXT_PUBLIC_GEMINI_API_KEY=sua-api-key-gemini`}
          </pre>
        </div>
      </div>
    </div>
  )
}
