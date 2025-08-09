"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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

function EditArticlePage() {
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
  const [editorData, setEditorData] = useState<{
    ru: any;
    az: any;
    en: any;
  }>({
    ru: { blocks: [] },
    az: { blocks: [] },
    en: { blocks: [] },
  });
  const [activeTab, setActiveTab] = useState<"ru" | "az" | "en">("ru");
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  // Refs для debounce timeouts
  const editorTimeouts = useRef<{
    ru?: NodeJS.Timeout;
    az?: NodeJS.Timeout;
    en?: NodeJS.Timeout;
  }>({});

  // Debounced функции для EditorJS чтобы уменьшить ререндеры
  const debouncedEditorChange = useCallback(
    (lang: "ru" | "az" | "en", data: any) => {
      // Очищаем предыдущий timeout для этого языка
      if (editorTimeouts.current[lang]) {
        clearTimeout(editorTimeouts.current[lang]);
      }

      // Устанавливаем новый timeout
      editorTimeouts.current[lang] = setTimeout(() => {
        setEditorData((prev) => ({ ...prev, [lang]: data }));
      }, 200); // 200ms debounce для быстрой печати
    },
    []
  );

  // Создаем отдельные debounced функции для каждого языка
  const handleRuEditorChange = useCallback(
    (data: any) => {
      debouncedEditorChange("ru", data);
    },
    [debouncedEditorChange]
  );

  const handleAzEditorChange = useCallback(
    (data: any) => {
      debouncedEditorChange("az", data);
    },
    [debouncedEditorChange]
  );

  const handleEnEditorChange = useCallback(
    (data: any) => {
      debouncedEditorChange("en", data);
    },
    [debouncedEditorChange]
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Отслеживаем изменения активной вкладки (только для важной логики)
  useEffect(() => {
    console.log("=== АКТИВНАЯ ВКЛАДКА ИЗМЕНИЛАСЬ ===", activeTab);
  }, [activeTab]);

  // Принудительное обновление формы после загрузки статьи
  useEffect(() => {
    if (article && article.id) {
      // Принудительно устанавливаем данные формы еще раз
      setTimeout(() => {
        // Умная логика и здесь тоже
        let timeoutFormData;
        if (article.translations && article.translations.length > 0) {
          const ruTranslation = article.translations.find(
            (t: Translation) => t.locale === "ru"
          );
          const azTranslation = article.translations.find(
            (t: Translation) => t.locale === "az"
          );
          const enTranslation = article.translations.find(
            (t: Translation) => t.locale === "en"
          );

          timeoutFormData = {
            ru: {
              title: ruTranslation?.title || "",
              description: "",
            },
            az: {
              title: azTranslation?.title || "",
              description: "",
            },
            en: {
              title: enTranslation?.title || "",
              description: "",
            },
            subCategoryId:
              article.subCategories?.[0]?.id || article.subCategoryId || "",
            images: article.images?.map((img: ArticleImage) => img.url) || [],
          };
        } else {
          timeoutFormData = {
            ru: {
              title: article.title || "",
              description: "",
            },
            az: {
              title: article.title || "",
              description: "",
            },
            en: {
              title: article.title || "",
              description: "",
            },
            subCategoryId:
              article.subCategories?.[0]?.id || article.subCategoryId || "",
            images: article.images?.map((img: ArticleImage) => img.url) || [],
          };
        }

        setFormData(timeoutFormData);

        // Принудительно обновляем EditorJS
        let editorContent = "";
        if (article.translations && article.translations.length > 0) {
          const ruTranslation = article.translations.find(
            (t: Translation) => t.locale === "ru"
          );
          editorContent = ruTranslation?.description || article.content || "";
        } else {
          editorContent = article.description || article.content || "";
        }
        if (editorContent && editorContent.trim() !== "") {
          try {
            // Проверяем, это JSON или обычный текст
            let parsedContent;
            if (
              editorContent.startsWith("{") ||
              editorContent.startsWith("[")
            ) {
              // Это JSON - парсим как обычно
              parsedContent = parseEditorContent(editorContent);
            } else {
              // Это обычный текст - создаем блок параграфа
              parsedContent = {
                blocks: [
                  {
                    type: "paragraph",
                    data: {
                      text: editorContent,
                    },
                  },
                ],
                version: "2.28.2",
              };
            }

            console.log(
              "=== ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ EDITOR ===",
              parsedContent
            );
            setEditorData((prev) => ({ ...prev, ru: parsedContent }));
          } catch (error) {
            console.error("Ошибка принудительного парсинга:", error);
          }
        }
      }, 100);
    }
  }, [article]);

  const fillFormFromCombinedData = (combinedArticle: any) => {
    console.log(
      "=== ЗАПОЛНЯЕМ ФОРМУ ИЗ ОБЪЕДИНЕННЫХ ДАННЫХ ===",
      combinedArticle
    );

    const ruTranslation = combinedArticle.translations?.find(
      (t: any) => t.locale === "ru"
    );
    const azTranslation = combinedArticle.translations?.find(
      (t: any) => t.locale === "az"
    );
    const enTranslation = combinedArticle.translations?.find(
      (t: any) => t.locale === "en"
    );

    const formData = {
      ru: {
        title: ruTranslation?.title || "",
        description: "",
      },
      az: {
        title: azTranslation?.title || "",
        description: "",
      },
      en: {
        title: enTranslation?.title || "",
        description: "",
      },
      subCategoryId:
        combinedArticle.subCategories?.[0]?.id ||
        combinedArticle.subCategoryId ||
        "",
      images: combinedArticle.images?.map((img: ArticleImage) => img.url) || [],
    };

    setFormData(formData);

    // EditorJS для всех языков
    const newEditorData = {
      ru: { blocks: [] },
      az: { blocks: [] },
      en: { blocks: [] },
    };

    // Заполняем данные для каждого языка
    [ruTranslation, azTranslation, enTranslation].forEach(
      (translation, index) => {
        const langKey = ["ru", "az", "en"][index] as "ru" | "az" | "en";
        let editorContent =
          translation?.description ||
          (langKey === "ru" ? combinedArticle.content : "") ||
          "";

        if (editorContent && editorContent.trim() !== "") {
          try {
            let parsedContent;
            if (
              editorContent.startsWith("{") ||
              editorContent.startsWith("[")
            ) {
              parsedContent = parseEditorContent(editorContent);
            } else {
              parsedContent = {
                blocks: [{ type: "paragraph", data: { text: editorContent } }],
                version: "2.28.2",
              };
            }
            (newEditorData as any)[langKey] = parsedContent;
          } catch (error) {
            console.error(`Ошибка парсинга контента для ${langKey}:`, error);
            (newEditorData as any)[langKey] = { blocks: [] };
          }
        }
      }
    );

    setEditorData(newEditorData);
  };

  // Простая логика загрузки как в create/page.tsx
  useEffect(() => {
    if (!isClient) return;
    fetchCategories();
    fetchSubCategories();
    fetchArticleAllLanguages(); // Используем новую функцию
  }, [isClient, articleId]);

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
    }
  };

  const fetchArticleAllLanguages = async () => {
    try {
      // Загружаем статью для каждого языка
      const [ruResponse, azResponse, enResponse] = await Promise.all([
        getArticleById(articleId, "ru"),
        getArticleById(articleId, "az"),
        getArticleById(articleId, "en"),
      ]);

      if (ruResponse.statusCode === 200 && ruResponse.data) {
        const ruData = ruResponse.data;
        const azData = azResponse.statusCode === 200 ? azResponse.data : null;
        const enData = enResponse.statusCode === 200 ? enResponse.data : null;

        // Создаем объединенную структуру данных
        const combinedArticle = {
          ...ruData,
          translations: [
            {
              locale: "ru",
              title: ruData.title || "",
              description: ruData.description || "",
            },
            {
              locale: "az",
              title: azData?.title || "",
              description: azData?.description || "",
            },
            {
              locale: "en",
              title: enData?.title || "",
              description: enData?.description || "",
            },
          ],
        };

        setArticle(combinedArticle);
        fillFormFromCombinedData(combinedArticle);
      } else {
        throw new Error("Не удалось загрузить основную статью");
      }
    } catch (error) {
      console.error("Ошибка загрузки статьи для всех языков:", error);
      // Fallback к старому методу
      await fetchArticleSingleLanguage();
    } finally {
      setLoading(false);
    }
  };

  const fetchArticleSingleLanguage = async () => {
    try {
      // Попробуем получить все языки, убрав параметр locale
      const response = await getArticleById(articleId);

      if (response.statusCode === 200 && response.data) {
        const articleData = response.data;

        setArticle(articleData);

        // API возвращает данные напрямую без translations

        // Умная логика: используем translations если есть, иначе прямые поля
        let formDataToSet;
        if (articleData.translations && articleData.translations.length > 0) {
          // Есть переводы - используем их
          const ruTranslation = articleData.translations.find(
            (t: Translation) => t.locale === "ru"
          );
          const azTranslation = articleData.translations.find(
            (t: Translation) => t.locale === "az"
          );
          const enTranslation = articleData.translations.find(
            (t: Translation) => t.locale === "en"
          );

          formDataToSet = {
            ru: {
              title: ruTranslation?.title || "",
              description: "",
            },
            az: {
              title: azTranslation?.title || "",
              description: "",
            },
            en: {
              title: enTranslation?.title || "",
              description: "",
            },
            subCategoryId:
              articleData.subCategories?.[0]?.id ||
              articleData.subCategoryId ||
              "",
            images:
              articleData.images?.map((img: ArticleImage) => img.url) || [],
          };
        } else {
          // Нет переводов - используем прямые поля для всех языков

          formDataToSet = {
            ru: {
              title: articleData.title || "", // Берем title напрямую
              description: "",
            },
            az: {
              title: articleData.title || "", // Тот же title для всех языков
              description: "",
            },
            en: {
              title: articleData.title || "", // Тот же title для всех языков
              description: "",
            },
            subCategoryId:
              articleData.subCategories?.[0]?.id ||
              articleData.subCategoryId ||
              "",
            images:
              articleData.images?.map((img: ArticleImage) => img.url) || [],
          };
        }

        const newFormData = formDataToSet;

        setFormData(newFormData);

        // Устанавливаем данные для EditorJS
        let editorContent = "";
        if (articleData.translations && articleData.translations.length > 0) {
          // Если есть переводы, берем description из русского перевода
          const ruTranslation = articleData.translations.find(
            (t: Translation) => t.locale === "ru"
          );
          editorContent =
            ruTranslation?.description || articleData.content || "";
        } else {
          // Иначе используем прямое поле
          editorContent = articleData.description || articleData.content || "";
        }

        if (editorContent && editorContent.trim() !== "") {
          try {
            // Проверяем, это JSON или обычный текст
            let parsedContent;
            if (
              editorContent.startsWith("{") ||
              editorContent.startsWith("[")
            ) {
              // Это JSON - парсим как обычно
              parsedContent = parseEditorContent(editorContent);
            } else {
              // Это обычный текст - создаем блок параграфа
              parsedContent = {
                blocks: [
                  {
                    type: "paragraph",
                    data: {
                      text: editorContent,
                    },
                  },
                ],
                version: "2.28.2",
              };
            }

            setEditorData((prev) => ({ ...prev, ru: parsedContent }));
          } catch (error) {
            console.error("Ошибка парсинга:", error);
            setEditorData((prev) => ({ ...prev, ru: { blocks: [] } }));
          }
        } else {
          setEditorData((prev) => ({ ...prev, ru: { blocks: [] } }));
        }
      } else {
        toast({
          title: "Ошибка",
          description: response.error || "Статья не найдена",
          variant: "destructive",
        });
        router.push("/dashboard/content");
      }
    } catch (error) {
      console.error("Ошибка загрузки статьи:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить статью",
        variant: "destructive",
      });
      router.push("/dashboard/content");
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
      // Берем существующие переводы и обновляем только то что изменилось
      const existingTranslations = article.translations || [];
      const ruTranslation = existingTranslations.find((t) => t.locale === "ru");
      const azTranslation = existingTranslations.find((t) => t.locale === "az");
      const enTranslation = existingTranslations.find((t) => t.locale === "en");

      const articleData: UpdateArticleRequest = {
        id: article.id,
        subCategoryIds: [formData.subCategoryId],
        translations: {
          az: {
            title: formData.az.title || azTranslation?.title || "Без названия",
            description: JSON.stringify(editorData.az || { blocks: [] }),
          },
          ru: {
            title: formData.ru.title || "Без названия",
            description: JSON.stringify(editorData.ru || { blocks: [] }),
          },
          en: {
            title: formData.en.title || enTranslation?.title || "Без названия",
            description: JSON.stringify(editorData.en || { blocks: [] }),
          },
        },
        images: formData.images,
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
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 mx-auto max-w-6xl">
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
            Редактировать статью
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base break-words">
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

          <Tabs
            defaultValue="ru"
            className="w-full"
            onValueChange={(value) => setActiveTab(value as "ru" | "az" | "en")}
          >
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
                  key={`ru-title-${article?.id || "loading"}`}
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
              <div>
                <Label>Содержание статьи (Русский)</Label>
                <Editor
                  key={`editor-ru-${article?.id || "loading"}`}
                  data={editorData.ru}
                  onChange={handleRuEditorChange}
                  placeholder="Начните писать статью на русском..."
                />
              </div>
            </TabsContent>

            <TabsContent value="az" className="space-y-4">
              <div>
                <Label htmlFor="az-title">Заголовок (Азербайджанский)</Label>
                <Input
                  id="az-title"
                  key={`az-title-${article?.id || "loading"}`}
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
              <div>
                <Label>Содержание статьи (Азербайджанский)</Label>
                <Editor
                  key={`editor-az-${article?.id || "loading"}`}
                  data={editorData.az}
                  onChange={handleAzEditorChange}
                  placeholder="Начните писать статью на азербайджанском..."
                />
              </div>
            </TabsContent>

            <TabsContent value="en" className="space-y-4">
              <div>
                <Label htmlFor="en-title">Заголовок (Английский)</Label>
                <Input
                  id="en-title"
                  key={`en-title-${article?.id || "loading"}`}
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
              <div>
                <Label>Содержание статьи (Английский)</Label>
                <Editor
                  key={`editor-en-${article?.id || "loading"}`}
                  data={editorData.en}
                  onChange={handleEnEditorChange}
                  placeholder="Начните писать статью на английском..."
                />
              </div>
            </TabsContent>
          </Tabs>
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
              <span className="hidden sm:inline">Сохранение...</span>
              <span className="sm:hidden">Сохранение...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Сохранить изменения</span>
              <span className="sm:hidden">Сохранить</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default React.memo(EditArticlePage);
