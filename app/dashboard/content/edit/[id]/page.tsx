"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { getArticleById, updateArticle } from "@/app/action/articles";
import { getCategories } from "@/app/action/categories";
import { getSubCategories } from "@/app/action/subcategories";
import {
  Translation,
  ArticleImage,
  Category,
  SubCategory,
  Article,
  UpdateArticleRequest,
} from "@/types/dashboard";
import { parseEditorContent } from "@/lib/editor-utils";

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

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    az: { title: "", description: "" },
    ru: { title: "", description: "" },
    en: { title: "", description: "" },
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
    if (articleId) {
      fetchArticle();
      fetchCategories();
      fetchSubCategories();
    }
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      const response = await getArticleById(articleId, "ru");
      if (response.statusCode === 200 && response.data) {
        const article = response.data;
        // Обеспечиваем обратную совместимость с UI
        const articleWithSubCategoryId = {
          ...article,
          subCategoryId:
            article.subCategories?.[0]?.id || article.subCategoryId || "",
        };
        setArticle(articleWithSubCategoryId);
        fillFormData(articleWithSubCategoryId);
      } else {
        toast({
          title: "Ошибка",
          description: response.error || "Статья не найдена",
          variant: "destructive",
        });
        router.push("/dashboard/content");
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить статью",
        variant: "destructive",
      });
      router.push("/dashboard/content");
    }
  };

  const fillFormData = (article: Article) => {
    const ruTranslation = article.translations?.find(
      (t: Translation) => t.locale === "ru"
    );
    const azTranslation = article.translations?.find(
      (t: Translation) => t.locale === "az"
    );
    const enTranslation = article.translations?.find(
      (t: Translation) => t.locale === "en"
    );

    setFormData({
      ru: {
        title: ruTranslation?.title || "",
        description: "", // Убираем поле description, так как используется EditorJS
      },
      az: {
        title: azTranslation?.title || "",
        description: "", // Убираем поле description, так как используется EditorJS
      },
      en: {
        title: enTranslation?.title || "",
        description: "", // Убираем поле description, так как используется EditorJS
      },
      subCategoryId:
        article.subCategories?.[0]?.id || article.subCategoryId || "",
      images: article.images?.map((img: ArticleImage) => img.url) || [],
    });

    // EditorJS контент берем из description русского перевода
    const validatedData = parseEditorContent(ruTranslation?.description || "");
    setEditorData(validatedData);
  };

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
    if (!article) return;

    // Валидация формы
    if (!formData.subCategoryId) {
      toast({
        title: "Ошибка",
        description: "Выберите подкатегорию",
        variant: "destructive",
      });
      return;
    }

    if (!formData.ru.title.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите заголовок на русском языке",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const articleData: UpdateArticleRequest = {
        id: article.id,
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

      const response = await updateArticle(articleData);
      if (response.statusCode === 200) {
        toast({
          title: "Успешно",
          description: "Статья обновлена",
        });
        router.push("/dashboard/content?refresh=true");
      } else {
        throw new Error(response.error || "Ошибка обновления статьи");
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статью",
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

  const ruTranslation = article?.translations?.find(
    (t: Translation) => t.locale === "ru"
  );

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={handleCancel}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к списку
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Редактировать статью
          </h1>
          <p className="text-muted-foreground">
            {ruTranslation?.title || "Редактирование статьи"}
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
            Внесите изменения в содержание статьи
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

      <div className="flex items-center justify-end gap-4">
        <Button variant="outline" onClick={handleCancel} disabled={submitting}>
          Отмена
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Сохранение...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Сохранить изменения
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
