"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  FileText,
  Languages,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteArticle, getArticles } from "@/app/action/articles";
import { getCategories } from "@/app/action/categories";
import { getSubCategories } from "@/app/action/subcategories";
import {
  Translation,
  ArticleImage,
  Category,
  SubCategory,
  Article,
} from "@/types/dashboard";

export default function ContentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");

  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
    fetchSubCategories();
  }, [searchTerm, subCategoryFilter]);

  // Обработка параметра refresh для принудительного обновления
  useEffect(() => {
    const refresh = searchParams.get("refresh");
    if (refresh === "true") {
      fetchArticles();
      // Удаляем параметр из URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("refresh");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [searchParams]);

  const fetchArticles = async () => {
    try {
      const filters = {
        locale: "ru",
        subCategoryId:
          subCategoryFilter !== "all" ? subCategoryFilter : undefined,
      };
      const response = await getArticles(filters);

      console.log("Ответ API при получении статей:", response);
      if (response.statusCode === 200 && response.data) {
        console.log("Количество статей получено:", response.data.length);
        console.log("Первая статья:", response.data[0]);
        console.log(
          "Структура первой статьи:",
          JSON.stringify(response.data[0], null, 2)
        );

        // Преобразуем данные API для совместимости с UI
        const articlesWithSubCategoryId = response.data.map((article: any) => {
          console.log("Преобразуем статью:", article);

          const transformed = {
            ...article,
            // Берем первую подкатегорию для обратной совместимости с UI
            subCategoryId:
              article.subCategories?.[0]?.id || article.subCategoryId || "",
            // Если нет translations, создаем их из title/description
            translations: article.translations || [
              {
                locale: "ru",
                title: article.title || "",
                description: article.description || "",
              },
            ],
          };

          console.log("Результат преобразования:", transformed);
          return transformed;
        });
        console.log("Все преобразованные статьи:", articlesWithSubCategoryId);
        setArticles(articlesWithSubCategoryId);
      } else {
        console.log("Ошибка API или нет данных:", response);
        throw new Error(response.error || "Ошибка загрузки статей");
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить статьи",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
    }
  };

  const handleCreateNew = () => {
    router.push("/dashboard/content/create");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту статью?")) return;

    try {
      const response = await deleteArticle(id);
      if (response.statusCode === 200) {
        toast({
          title: "Успешно",
          description: "Статья удалена",
        });
        fetchArticles();
      } else {
        throw new Error(response.error || "Ошибка удаления статьи");
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить статью",
        variant: "destructive",
      });
    }
  };

  const handleEditArticle = (article: Article) => {
    router.push(`/dashboard/content/edit/${article.id}`);
  };

  const filteredArticles = (articles || []).filter((article) => {
    console.log("Фильтруем статью:", article);
    console.log("Translations статьи:", article.translations);

    const ruTranslation = article.translations?.find(
      (t: Translation) => t.locale === "ru"
    );

    console.log("Найден русский перевод:", ruTranslation);

    const matchesSearch =
      !searchTerm ||
      ruTranslation?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ruTranslation?.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesSubCategory =
      subCategoryFilter === "all" ||
      article.subCategoryId === subCategoryFilter;

    console.log(
      "Поиск совпадает:",
      matchesSearch,
      "Категория совпадает:",
      matchesSubCategory
    );
    return matchesSearch && matchesSubCategory;
  });

  console.log("Количество отфильтрованных статей:", filteredArticles.length);
  console.log("Отфильтрованные статьи:", filteredArticles);

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
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Управление контентом
          </h1>
          <p className="text-muted-foreground">
            Создавайте и редактируйте статьи с поддержкой мультиязычности
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Создать статью
        </Button>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Поиск статей..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-64">
          <Select
            value={subCategoryFilter}
            onValueChange={setSubCategoryFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Все подкатегории" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все подкатегории</SelectItem>
              {(subCategories || []).map((subCategory) => {
                const ruTranslation = subCategory.translations.find(
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

      <div className="grid gap-4">
        {filteredArticles.map((article) => {
          const ruTranslation = article.translations?.find(
            (t: Translation) => t.locale === "ru"
          );
          const azTranslation = article.translations?.find(
            (t: Translation) => t.locale === "az"
          );
          const enTranslation = article.translations?.find(
            (t: Translation) => t.locale === "en"
          );
          const subCategory = (subCategories || []).find(
            (sc) => sc.id === article.subCategoryId
          );
          const subCategoryRuTranslation = subCategory?.translations.find(
            (t: Translation) => t.locale === "ru"
          );

          return (
            <Card key={article.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      {ruTranslation?.title || "Без названия"}
                    </CardTitle>
                    <CardDescription>
                      {ruTranslation?.description || "Без описания"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Languages className="w-3 h-3" />
                      {article.translations?.length || 0}/3
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditArticle(article)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(article.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-1">Русский</h4>
                    <p className="text-muted-foreground">
                      {ruTranslation?.title || "Не переведено"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Азербайджанский</h4>
                    <p className="text-muted-foreground">
                      {azTranslation?.title || "Не переведено"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Английский</h4>
                    <p className="text-muted-foreground">
                      {enTranslation?.title || "Не переведено"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Подкатегория:</span>
                    <Badge variant="secondary">
                      {subCategoryRuTranslation?.title || "Не указана"}
                    </Badge>
                  </div>
                  {(article.images?.length || 0) > 0 && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-muted-foreground">
                        Изображения:
                      </span>
                      <Badge variant="outline">
                        {article.images?.length || 0}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredArticles.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Статьи не найдены
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || subCategoryFilter !== "all"
                  ? "Попробуйте изменить фильтры поиска"
                  : "Создайте первую статью для начала работы"}
              </p>
              <Button onClick={handleCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Создать статью
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
