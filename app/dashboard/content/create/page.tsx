"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Languages } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createArticle } from "@/app/action/articles";
import { getCategories } from "@/app/action/categories";
import { getSubCategories } from "@/app/action/subcategories";
import {
  Translation,
  Category,
  SubCategory,
  CreateArticleRequest,
} from "@/types/dashboard";

import dynamic from "next/dynamic";

const Editor = dynamic(
  () => import("@/components/editor").then((mod) => ({ default: mod.Editor })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[200px] p-4 border border-border rounded-lg bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ),
  }
);

export default function CreateArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    az: { title: "", description: "" }, // description не используется, заменяется EditorJS
    ru: { title: "", description: "" }, // description не используется, заменяется EditorJS
    en: { title: "", description: "" }, // description не используется, заменяется EditorJS
    subCategoryId: "",
    images: [] as string[],
  });
  const [editorData, setEditorData] = useState<any>({ blocks: [] });
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCategories("ru");
      if (response.statusCode === 200 && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Ошибка загрузки категорий:", error);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const response = await getSubCategories();
      if (response.statusCode === 200 && response.data) {
        setSubCategories(response.data);
      }
    } catch (error) {
      console.error("Ошибка загрузки подкатегорий:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Валидация формы
    console.log("Валидация формы. Данные:", formData);

    if (!formData.subCategoryId || formData.subCategoryId.trim() === "") {
      toast({
        title: "Ошибка",
        description: "Выберите подкатегорию",
        variant: "destructive",
      });
      return;
    }

    if (!formData.ru.title || formData.ru.title.trim() === "") {
      toast({
        title: "Ошибка",
        description: "Введите заголовок на русском языке",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Убеждаемся, что у всех переводов есть title
      const articleData: CreateArticleRequest = {
        subCategoryIds: [formData.subCategoryId], // преобразуем в массив согласно API
        translations: {
          az: {
            title: formData.az.title || formData.ru.title || "Без названия",
            description: JSON.stringify(editorData || { blocks: [] }), // EditorJS контент
          },
          ru: {
            title: formData.ru.title || "Без названия",
            description: JSON.stringify(editorData || { blocks: [] }), // EditorJS контент
          },
          en: {
            title: formData.en.title || formData.ru.title || "Без названия",
            description: JSON.stringify(editorData || { blocks: [] }), // EditorJS контент
          },
        },
        images: formData.images,
        // content: JSON.stringify(editorData || { blocks: [] }), // Временно убираем content
      };

      console.log("Отправляем данные статьи:", articleData);
      const response = await createArticle(articleData);
      console.log("Ответ от API:", response);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast({
          title: "Успешно",
          description: "Статья создана",
        });
        router.push("/dashboard/content?refresh=true");
      } else {
        console.error("Ошибка создания статьи:", response);
        toast({
          title: "Ошибка",
          description: response.error || "Ошибка создания статьи",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Критическая ошибка создания статьи:", error);
      toast({
        title: "Ошибка",
        description:
          error instanceof Error ? error.message : "Не удалось создать статью",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/content");
  };

  if (!isClient || loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button
          variant="outline"
          onClick={handleCancel}
          className="flex items-center gap-2 self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Назад к списку</span>
          <span className="sm:hidden">Назад</span>
        </Button>
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Создать статью
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Создайте новую статью с поддержкой мультиязычности
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Информация о статье
          </CardTitle>
          <CardDescription>
            Заполните основную информацию и содержание статьи
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subcategory">Подкатегория *</Label>
              <Select
                value={formData.subCategoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, subCategoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите подкатегорию" />
                </SelectTrigger>
                <SelectContent>
                  {(subCategories || []).map((subCategory) => {
                    const ruTranslation = subCategory.translations?.find(
                      (t: Translation) => t.locale === "ru"
                    );
                    return (
                      <SelectItem key={subCategory.id} value={subCategory.id}>
                        {ruTranslation?.title || "Без названия"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="ru" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ru">Русский *</TabsTrigger>
              <TabsTrigger value="az">Азербайджанский</TabsTrigger>
              <TabsTrigger value="en">Английский</TabsTrigger>
            </TabsList>

            <TabsContent value="ru" className="space-y-4">
              <div>
                <Label htmlFor="ru-title">Заголовок (Русский) *</Label>
                <Input
                  id="ru-title"
                  value={formData.ru.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ru: { ...formData.ru, title: e.target.value },
                    })
                  }
                  placeholder="Введите заголовок на русском"
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="az" className="space-y-4">
              <div>
                <Label htmlFor="az-title">Заголовок (Азербайджанский)</Label>
                <Input
                  id="az-title"
                  value={formData.az.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      az: { ...formData.az, title: e.target.value },
                    })
                  }
                  placeholder="Введите заголовок на азербайджанском"
                />
              </div>
            </TabsContent>

            <TabsContent value="en" className="space-y-4">
              <div>
                <Label htmlFor="en-title">Заголовок (Английский)</Label>
                <Input
                  id="en-title"
                  value={formData.en.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      en: { ...formData.en, title: e.target.value },
                    })
                  }
                  placeholder="Введите заголовок на английском"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div>
            <Label>Содержание статьи (EditorJS)</Label>
            <Editor
              data={editorData}
              onChange={setEditorData}
              placeholder="Начните писать вашу статью..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={submitting}
          className="order-2 sm:order-1"
        >
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="order-1 sm:order-2"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              <span className="hidden sm:inline">Создание...</span>
              <span className="sm:hidden">Создание...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Создать статью</span>
              <span className="sm:hidden">Создать</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
