"use client";

import { useState, useEffect } from "react";
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
import { Search, FileText, Eye, Calendar, User } from "lucide-react";
import { apiClient, type Article, type Category } from "@/lib/api-client";
import Link from "next/link";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, [searchTerm, subCategoryFilter]);

  const fetchArticles = async () => {
    try {
      const filters = {
        locale: "ru",
        subCategoryId:
          subCategoryFilter !== "all" ? subCategoryFilter : undefined,
      };
      const response = await apiClient.getArticles(filters);
      if (response.statusCode === 200 && response.data) {
        setArticles(response.data);
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
      const response = await apiClient.getCategories("ru");
      if (response.statusCode === 200 && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Ошибка загрузки категорий:", error);
    }
  };

  // Функция для получения заголовка статьи на русском языке
  const getArticleTitle = (article: Article) => {
    const ruTranslation = article.translations.find((t) => t.locale === "ru");
    return ruTranslation?.title || "Без названия";
  };

  // Функция для получения описания статьи на русском языке
  const getArticleDescription = (article: Article) => {
    const ruTranslation = article.translations.find((t) => t.locale === "ru");
    return ruTranslation?.description || "";
  };

  // Функция для получения названия категории на русском языке
  const getCategoryName = (category: Category) => {
    const ruTranslation = category.translations.find((t) => t.locale === "ru");
    return ruTranslation?.title || "Без названия";
  };

  const filteredArticles = articles.filter((article) => {
    const title = getArticleTitle(article);
    const matchesSearch = title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSubCategory =
      subCategoryFilter === "all" ||
      article.subCategoryId === subCategoryFilter;
    return matchesSearch && matchesSubCategory;
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Все статьи</h1>
          <p className="text-muted-foreground">
            Просмотр всех статей в системе
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard">На главную</Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Поиск статей..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={subCategoryFilter}
              onValueChange={setSubCategoryFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Подкатегория" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все подкатегории</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {getCategoryName(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Badge variant="default">Статья</Badge>
                {article.images && article.images.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    {article.images.length} фото
                  </div>
                )}
              </div>
              <CardTitle className="line-clamp-2">
                {getArticleTitle(article)}
              </CardTitle>
              {getArticleDescription(article) && (
                <CardDescription className="line-clamp-3">
                  {getArticleDescription(article)}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>ID: {article.id}</span>
                </div>
                {article.subCategoryId && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>Подкатегория: {article.subCategoryId}</span>
                  </div>
                )}
                {article.translations && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Переводы: {article.translations.length} языков</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredArticles.length === 0 && (
          <div className="col-span-full">
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
                      : "В системе пока нет статей"}
                  </p>
                  <Button asChild>
                    <Link href="/dashboard">На главную</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
