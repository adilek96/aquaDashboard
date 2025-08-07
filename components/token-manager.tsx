"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { apiClient, type TokenResponse } from '@/lib/api-client'
import { Key, Copy, RefreshCw } from 'lucide-react'

export default function TokenManager() {
  const [tokens, setTokens] = useState<{
    adminToken: string
    readToken: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Загружаем токены из localStorage при инициализации
    const savedTokens = localStorage.getItem('aqua-wiki-tokens')
    if (savedTokens) {
      const parsedTokens = JSON.parse(savedTokens)
      setTokens(parsedTokens)
      apiClient.setTokens(parsedTokens.adminToken, parsedTokens.readToken)
    }
  }, [])

  const generateTokens = async () => {
    setLoading(true)
    try {
      const response = await apiClient.generateTokens()
      if (response.statusCode === 200 && response.data) {
        const newTokens = response.data.tokens
        setTokens(newTokens)
        
        // Сохраняем токены в localStorage
        localStorage.setItem('aqua-wiki-tokens', JSON.stringify(newTokens))
        
        // Устанавливаем токены в API клиент
        apiClient.setTokens(newTokens.adminToken, newTokens.readToken)
        
        toast({
          title: "Токены сгенерированы",
          description: "Новые токены успешно созданы и сохранены",
        })
      } else {
        throw new Error(response.error || 'Ошибка генерации токенов')
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось сгенерировать токены",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Скопировано",
      description: `${type} токен скопирован в буфер обмена`,
    })
  }

  const clearTokens = () => {
    setTokens(null)
    localStorage.removeItem('aqua-wiki-tokens')
    apiClient.setTokens('', '')
    toast({
      title: "Токены очищены",
      description: "Токены удалены из памяти и localStorage",
    })
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Управление токенами</h1>
          <p className="text-muted-foreground">
            Генерируйте и управляйте токенами для доступа к API
          </p>
        </div>
        <Button onClick={generateTokens} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Генерация...' : 'Сгенерировать токены'}
        </Button>
      </div>

      {tokens ? (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Админский токен
              </CardTitle>
              <CardDescription>
                Используйте для создания, обновления и удаления контента
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="admin-token">Токен администратора</Label>
                <div className="flex gap-2">
                  <Input
                    id="admin-token"
                    value={tokens.adminToken}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(tokens.adminToken, 'Админский')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Токен чтения
              </CardTitle>
              <CardDescription>
                Используйте для чтения контента
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="read-token">Токен чтения</Label>
                <div className="flex gap-2">
                  <Input
                    id="read-token"
                    value={tokens.readToken}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(tokens.readToken, 'Токен чтения')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Инструкции</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Следующие шаги:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Скопируйте токены в переменные окружения</li>
                    <li>ADMIN_TOKEN=ваш_админский_токен</li>
                    <li>READ_TOKEN=ваш_токен_чтения</li>
                    <li>Перезапустите сервер</li>
                  </ol>
                </div>
                <Button variant="destructive" onClick={clearTokens}>
                  Очистить токены
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Токены не настроены</CardTitle>
            <CardDescription>
              Для работы с API необходимо сгенерировать токены
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={generateTokens} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Генерация...' : 'Сгенерировать токены'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
