"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
  memo,
} from "react";
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

// Мемоизированный компонент карточки статьи для предотвращения лишних ререндеров
const ArticleCard = memo(
  ({
    article,
    subCategories,
    onEdit,
    onDelete,
  }: {
    article: Article;
    subCategories: SubCategory[];
    onEdit: (article: Article) => void;
    onDelete: (id: string) => void;
  }) => {
    const ruTranslation = article.translations?.find(
      (t: Translation) => t.locale === "ru"
    );
    const azTranslation = article.translations?.find(
      (t: Translation) => t.locale === "az"
    );
    const enTranslation = article.translations?.find(
      (t: Translation) => t.locale === "en"
    );
    const subCategory = subCategories.find(
      (sc) => sc.id === article.subCategoryId
    );
    const subCategoryRuTranslation = subCategory?.translations.find(
      (t: Translation) => t.locale === "ru"
    );

    const handleEdit = useCallback(() => onEdit(article), [article, onEdit]);
    const handleDelete = useCallback(
      () => onDelete(article.id),
      [article.id, onDelete]
    );

    return (
      <Card key={article.id}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="flex items-start gap-2 mb-3 text-base lg:text-lg">
                <FileText className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="break-words">
                  {ruTranslation?.title || "Без названия"}
                </span>
              </CardTitle>
              <div className="flex items-center gap-2">
                {/* Индикаторы языков */}
                <div className="flex items-center gap-1">
                  <Badge
                    variant={ruTranslation?.title ? "default" : "secondary"}
                    className="text-xs px-2 py-0.5"
                  >
                    RU
                  </Badge>
                  <Badge
                    variant={azTranslation?.title ? "default" : "secondary"}
                    className="text-xs px-2 py-0.5"
                  >
                    AZ
                  </Badge>
                  <Badge
                    variant={enTranslation?.title ? "default" : "secondary"}
                    className="text-xs px-2 py-0.5"
                  >
                    EN
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="w-4 h-4 mr-2" />
                    Редактировать
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
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
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground shrink-0">
                  Подкатегория:
                </span>
                <Badge variant="secondary" className="text-xs">
                  {subCategoryRuTranslation?.title || "Не указана"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground shrink-0">
                  Изображений:
                </span>
                <Badge variant="outline" className="text-xs">
                  {article.images?.length || 0}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

ArticleCard.displayName = "ArticleCard";

const ContentPageContent = memo(() => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Все useState вместе
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");
  const [isClient, setIsClient] = useState(false);

  // Все useCallback вместе
  const fetchArticles = useCallback(async () => {
    try {
      const filters = {
        locale: "ru",
        subCategoryId:
          subCategoryFilter !== "all" ? subCategoryFilter : undefined,
      };
      const response = await getArticles(filters);

      if (response.statusCode === 200 && response.data) {
        // Преобразуем данные API для совместимости с UI
        const articlesWithSubCategoryId = response.data.map((article: any) => ({
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
        }));
        setArticles(articlesWithSubCategoryId);
      } else {
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
  }, [subCategoryFilter, toast]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await getCategories("ru");
      if (response.statusCode === 200 && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Ошибка загрузки категорий:", error);
    }
  }, []);

  const fetchSubCategories = useCallback(async () => {
    try {
      const response = await getSubCategories();
      if (response.statusCode === 200 && response.data) {
        setSubCategories(response.data);
      }
    } catch (error) {
      console.error("Ошибка загрузки подкатегорий:", error);
    }
  }, []);

  const handleCreateNew = useCallback(() => {
    router.push("/dashboard/content/create");
  }, [router]);

  const handleDelete = useCallback(
    async (id: string) => {
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
    },
    [fetchArticles, toast]
  );

  const handleEditArticle = useCallback(
    (article: Article) => {
      router.push(`/dashboard/content/edit/${article.id}`);
    },
    [router]
  );

  // Обработчики для форм
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  const handleSubCategoryChange = useCallback((value: string) => {
    setSubCategoryFilter(value);
  }, []);

  // Все useMemo вместе
  const filteredArticles = useMemo(() => {
    return (articles || []).filter((article) => {
      const ruTranslation = article.translations?.find(
        (t: Translation) => t.locale === "ru"
      );

      const matchesSearch =
        !searchTerm ||
        ruTranslation?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ruTranslation?.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesSubCategory =
        subCategoryFilter === "all" ||
        article.subCategoryId === subCategoryFilter;

      return matchesSearch && matchesSubCategory;
    });
  }, [articles, searchTerm, subCategoryFilter]);

  const subCategoryOptions = useMemo(
    () =>
      (subCategories || []).map((subCategory) => {
        const ruTranslation = subCategory.translations.find(
          (t: Translation) => t.locale === "ru"
        );
        return {
          id: subCategory.id,
          title: ruTranslation?.title || "Без названия",
        };
      }),
    [subCategories]
  );

  // Все useEffect в конце
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, [fetchCategories, fetchSubCategories]);

  useEffect(() => {
    const refresh = searchParams.get("refresh");
    if (refresh === "true") {
      fetchArticles();
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("refresh");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [searchParams, fetchArticles]);

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
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
      {/* Заголовок и кнопка */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Управление статьями
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Создавайте и редактируйте статьи с поддержкой мультиязычности
          </p>
        </div>
        <Button onClick={handleCreateNew} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Создать статью</span>
          <span className="sm:hidden">Создать</span>
        </Button>
      </div>

      {/* Поиск и фильтры */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Поиск статей..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        <div className="w-full sm:w-64">
          <Select
            value={subCategoryFilter}
            onValueChange={handleSubCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Все подкатегории" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все подкатегории</SelectItem>
              {subCategoryOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredArticles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            subCategories={subCategories}
            onEdit={handleEditArticle}
            onDelete={handleDelete}
          />
        ))}
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
});

ContentPageContent.displayName = "ContentPageContent";

export default function ContentPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <ContentPageContent />
    </Suspense>
  );
}
