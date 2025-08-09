"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Trash2, CheckCircle, AlertTriangle } from "lucide-react";

export default function CleanupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCleanup = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/cleanup-blob-urls", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Произошла ошибка при очистке");
      }
    } catch (err) {
      setError("Ошибка сети при выполнении очистки");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Очистка данных</h1>
        <p className="text-muted-foreground mt-2">
          Утилиты для очистки и обслуживания базы данных
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Очистка blob URL изображений
          </CardTitle>
          <CardDescription>
            Удаляет недействительные blob URL из описаний статей и заменяет их
            на информационные сообщения. Blob URL создаются временно при
            загрузке изображений и становятся недействительными после
            перезагрузки страницы.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>{result.message}</p>
                  <div className="text-sm text-muted-foreground">
                    <p>Всего статей: {result.totalArticles}</p>
                    <p>Обновлено: {result.updatedCount}</p>
                    {result.errors && result.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="font-semibold">Ошибки:</p>
                        <ul className="list-disc list-inside">
                          {result.errors.map((error: string, index: number) => (
                            <li key={index} className="text-red-600">
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Что будет сделано:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Поиск всех статей в базе данных</li>
                <li>• Обнаружение blob URL в заголовках и описаниях</li>
                <li>• Замена blob URL на информационные сообщения</li>
                <li>• Сохранение обновленных статей</li>
              </ul>
            </div>

            <Button
              onClick={handleCleanup}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Выполняется очистка...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Запустить очистку blob URL
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
