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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  apiClient,
  type Article,
  type Category,
  type SubCategory,
  type CreateArticleRequest,
  type UpdateArticleRequest,
} from "@/lib/api-client";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ContentPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({
    az: { title: "", description: "" },
    ru: { title: "", description: "" },
    en: { title: "", description: "" },
    subCategoryId: "",
    images: [] as string[],
  });
  const [editorData, setEditorData] = useState<any>(null);
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

  const fetchSubCategories = async () => {
    try {
      const response = await apiClient.getSubCategories("ru");
      if (response.statusCode === 200 && response.data) {
        setSubCategories(response.data);
      }
    } catch (error) {
      console.error("Ошибка загрузки подкатегорий:", error);
    }
  };

  const handleCreate = async () => {
    try {
      const articleData: CreateArticleRequest = {
        subCategoryId: formData.subCategoryId,
        translations: {
          az: formData.az,
          ru: formData.ru,
          en: formData.en,
        },
        images: formData.images,
        content: JSON.stringify(editorData),
      };
      const response = await apiClient.createArticle(articleData);
      if (response.statusCode === 200) {
        toast({
          title: "Успешно",
          description: "Статья создана",
        });
        setIsCreateDialogOpen(false);
        resetForm();
        fetchArticles();
      } else {
        throw new Error(response.error || "Ошибка создания статьи");
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать статью",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!editingArticle) return;

    try {
      const articleData: UpdateArticleRequest = {
        id: editingArticle.id,
        subCategoryId: formData.subCategoryId,
        translations: {
          az: formData.az,
          ru: formData.ru,
          en: formData.en,
        },
        images: formData.images,
        content: JSON.stringify(editorData),
      };
      const response = await apiClient.updateArticle(articleData);
      if (response.statusCode === 200) {
        toast({
          title: "Успешно",
          description: "Статья обновлена",
        });
        setIsEditDialogOpen(false);
        resetForm();
        fetchArticles();
      } else {
        throw new Error(response.error || "Ошибка обновления статьи");
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статью",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту статью?")) return;

    try {
      const response = await apiClient.deleteArticle(id);
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

  const openEditDialog = (article: Article) => {
    setEditingArticle(article);

    // Заполняем форму данными статьи
    const ruTranslation = article.translations.find((t) => t.locale === "ru");
    const azTranslation = article.translations.find((t) => t.locale === "az");
    const enTranslation = article.translations.find((t) => t.locale === "en");

    setFormData({
      ru: {
        title: ruTranslation?.title || "",
        description: ruTranslation?.description || "",
      },
      az: {
        title: azTranslation?.title || "",
        description: azTranslation?.description || "",
      },
      en: {
        title: enTranslation?.title || "",
        description: enTranslation?.description || "",
      },
      subCategoryId: article.subCategoryId,
      images: article.images.map((img) => img.url),
    });

    try {
      setEditorData(JSON.parse(article.content || "{}"));
    } catch {
      setEditorData({ blocks: [] });
    }
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      az: { title: "", description: "" },
      ru: { title: "", description: "" },
      en: { title: "", description: "" },
      subCategoryId: "",
      images: [],
    });
    setEditorData(null);
    setEditingArticle(null);
  };

  const filteredArticles = articles.filter((article) => {
    const ruTranslation = article.translations.find((t) => t.locale === "ru");
    const matchesSearch =
      ruTranslation?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ruTranslation?.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesSubCategory =
      subCategoryFilter === "all" ||
      article.subCategoryId === subCategoryFilter;
    return matchesSearch && matchesSubCategory;
  });

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
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Создать статью
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Создать статью</DialogTitle>
              <DialogDescription>
                Создайте новую статью с переводами на трех языках
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subcategory">Подкатегория</Label>
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
                      {subCategories.map((subCategory) => {
                        const ruTranslation = subCategory.translations.find(
                          (t) => t.locale === "ru"
                        );
                        return (
                          <SelectItem
                            key={subCategory.id}
                            value={subCategory.id}
                          >
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
                  <TabsTrigger value="ru">Русский</TabsTrigger>
                  <TabsTrigger value="az">Азербайджанский</TabsTrigger>
                  <TabsTrigger value="en">Английский</TabsTrigger>
                </TabsList>

                <TabsContent value="ru" className="space-y-4">
                  <div>
                    <Label htmlFor="ru-title">Заголовок (Русский)</Label>
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="ru-description">Описание (Русский)</Label>
                    <Textarea
                      id="ru-description"
                      value={formData.ru.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ru: { ...formData.ru, description: e.target.value },
                        })
                      }
                      placeholder="Введите описание на русском"
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="az" className="space-y-4">
                  <div>
                    <Label htmlFor="az-title">
                      Заголовок (Азербайджанский)
                    </Label>
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
                  <div>
                    <Label htmlFor="az-description">
                      Описание (Азербайджанский)
                    </Label>
                    <Textarea
                      id="az-description"
                      value={formData.az.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          az: { ...formData.az, description: e.target.value },
                        })
                      }
                      placeholder="Введите описание на азербайджанском"
                      rows={3}
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
                  <div>
                    <Label htmlFor="en-description">
                      Описание (Английский)
                    </Label>
                    <Textarea
                      id="en-description"
                      value={formData.en.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          en: { ...formData.en, description: e.target.value },
                        })
                      }
                      placeholder="Введите описание на английском"
                      rows={3}
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
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button onClick={handleCreate}>Создать статью</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
              {subCategories.map((subCategory) => {
                const ruTranslation = subCategory.translations.find(
                  (t) => t.locale === "ru"
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
          const ruTranslation = article.translations.find(
            (t) => t.locale === "ru"
          );
          const azTranslation = article.translations.find(
            (t) => t.locale === "az"
          );
          const enTranslation = article.translations.find(
            (t) => t.locale === "en"
          );
          const subCategory = subCategories.find(
            (sc) => sc.id === article.subCategoryId
          );
          const subCategoryRuTranslation = subCategory?.translations.find(
            (t) => t.locale === "ru"
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
                      {article.translations.length}/3
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openEditDialog(article)}
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
                  {article.images.length > 0 && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-muted-foreground">
                        Изображения:
                      </span>
                      <Badge variant="outline">{article.images.length}</Badge>
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
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Создать статью
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать статью</DialogTitle>
            <DialogDescription>Внесите изменения в статью</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-subcategory">Подкатегория</Label>
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
                    {subCategories.map((subCategory) => {
                      const ruTranslation = subCategory.translations.find(
                        (t) => t.locale === "ru"
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
                <TabsTrigger value="ru">Русский</TabsTrigger>
                <TabsTrigger value="az">Азербайджанский</TabsTrigger>
                <TabsTrigger value="en">Английский</TabsTrigger>
              </TabsList>

              <TabsContent value="ru" className="space-y-4">
                <div>
                  <Label htmlFor="edit-ru-title">Заголовок (Русский)</Label>
                  <Input
                    id="edit-ru-title"
                    value={formData.ru.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ru: { ...formData.ru, title: e.target.value },
                      })
                    }
                    placeholder="Введите заголовок на русском"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-ru-description">
                    Описание (Русский)
                  </Label>
                  <Textarea
                    id="edit-ru-description"
                    value={formData.ru.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ru: { ...formData.ru, description: e.target.value },
                      })
                    }
                    placeholder="Введите описание на русском"
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="az" className="space-y-4">
                <div>
                  <Label htmlFor="edit-az-title">
                    Заголовок (Азербайджанский)
                  </Label>
                  <Input
                    id="edit-az-title"
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
                  <Label htmlFor="edit-az-description">
                    Описание (Азербайджанский)
                  </Label>
                  <Textarea
                    id="edit-az-description"
                    value={formData.az.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        az: { ...formData.az, description: e.target.value },
                      })
                    }
                    placeholder="Введите описание на азербайджанском"
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="en" className="space-y-4">
                <div>
                  <Label htmlFor="edit-en-title">Заголовок (Английский)</Label>
                  <Input
                    id="edit-en-title"
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
                  <Label htmlFor="edit-en-description">
                    Описание (Английский)
                  </Label>
                  <Textarea
                    id="edit-en-description"
                    value={formData.en.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        en: { ...formData.en, description: e.target.value },
                      })
                    }
                    placeholder="Введите описание на английском"
                    rows={3}
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button onClick={handleEdit}>Сохранить изменения</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
