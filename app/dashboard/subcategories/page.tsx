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
import { Checkbox } from "@/components/ui/checkbox";
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
  Languages,
  FolderTree,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createSubCategory,
  deleteSubCategory,
  getSubCategories,
  updateSubCategory,
} from "@/app/action/subcategories";
import { getCategories } from "@/app/action/categories";
import {
  Translation,
  Category,
  SubCategory,
  CreateSubCategoryRequest,
  UpdateSubCategoryRequest,
} from "@/types/dashboard";

export default function SubCategoriesPage() {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] =
    useState<SubCategory | null>(null);
  const [formData, setFormData] = useState({
    az: { title: "", description: "" },
    ru: { title: "", description: "" },
    en: { title: "", description: "" },
    categoryId: [] as string[],
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
  }, []);

  const fetchSubCategories = async () => {
    try {
      const response = await getSubCategories();

      setSubCategories(response.data);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить подкатегории",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();

      setCategories(response.data);
    } catch (error) {
      console.error("Ошибка загрузки категорий:", error);
    }
  };

  const handleCreate = async () => {
    try {
      const subCategoryData: CreateSubCategoryRequest = {
        translations: {
          az: formData.az,
          ru: formData.ru,
          en: formData.en,
        },
        categoryIds: formData.categoryId,
      };
      const response = await createSubCategory(subCategoryData);
      if (response.statusCode === 200) {
        toast({
          title: "Успешно",
          description: "Подкатегория создана",
        });
        setIsCreateDialogOpen(false);
        resetForm();
        fetchSubCategories();
      } else {
        throw new Error(response.error || "Ошибка создания подкатегории");
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать подкатегорию",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!editingSubCategory) return;

    try {
      const subCategoryData: UpdateSubCategoryRequest = {
        id: editingSubCategory.id,
        translations: {
          az: formData.az,
          ru: formData.ru,
          en: formData.en,
        },
        categoryIds: formData.categoryId,
      };
      const response = await updateSubCategory(subCategoryData);
      if (response.statusCode === 200) {
        toast({
          title: "Успешно",
          description: "Подкатегория обновлена",
        });
        setIsEditDialogOpen(false);
        resetForm();
        fetchSubCategories();
      } else {
        throw new Error(response.error || "Ошибка обновления подкатегории");
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить подкатегорию",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту подкатегорию?")) return;

    try {
      const response = await deleteSubCategory(id);
      if (response.statusCode === 200) {
        toast({
          title: "Успешно",
          description: "Подкатегория удалена",
        });
        fetchSubCategories();
      } else {
        throw new Error(response.error || "Ошибка удаления подкатегории");
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить подкатегорию",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);

    // Заполняем форму данными подкатегории
    const ruTranslation = subCategory.translations.find(
      (t: Translation) => t.locale === "ru"
    );
    const azTranslation = subCategory.translations.find(
      (t: Translation) => t.locale === "az"
    );
    const enTranslation = subCategory.translations.find(
      (t: Translation) => t.locale === "en"
    );

    const categoryIds = subCategory.categories?.map((cat) => cat.id) || [];

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
      categoryId: categoryIds,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      az: { title: "", description: "" },
      ru: { title: "", description: "" },
      en: { title: "", description: "" },
      categoryId: [],
    });
    setEditingSubCategory(null);
  };

  const filteredSubCategories = (subCategories || []).filter((subCategory) => {
    const ruTranslation = subCategory.translations.find(
      (t: Translation) => t.locale === "ru"
    );
    return (
      ruTranslation?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ruTranslation?.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
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
          <h1 className="text-3xl font-bold text-foreground">Подкатегории</h1>
          <p className="text-muted-foreground">
            Управляйте подкатегориями контента
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Создать подкатегорию
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Создать подкатегорию</DialogTitle>
              <DialogDescription>
                Создайте новую подкатегорию с переводами на трех языках
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Категории</Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                  {(categories || []).map((category) => {
                    const ruTranslation = category.translations.find(
                      (t: Translation) => t.locale === "ru"
                    );
                    const isChecked = formData.categoryId.includes(category.id);

                    return (
                      <div
                        key={category.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                categoryId: [
                                  ...formData.categoryId,
                                  category.id,
                                ],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                categoryId: formData.categoryId.filter(
                                  (id) => id !== category.id
                                ),
                              });
                            }
                          }}
                        />
                        <Label
                          htmlFor={`category-${category.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {ruTranslation?.title || "Без названия"}
                        </Label>
                      </div>
                    );
                  })}
                  {(!categories || categories.length === 0) && (
                    <p className="text-muted-foreground text-sm">
                      Категории не найдены
                    </p>
                  )}
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
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button onClick={handleCreate}>Создать подкатегорию</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Поиск подкатегорий..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredSubCategories.map((subCategory) => {
          const ruTranslation = subCategory.translations.find(
            (t: Translation) => t.locale === "ru"
          );
          const azTranslation = subCategory.translations.find(
            (t: Translation) => t.locale === "az"
          );
          const enTranslation = subCategory.translations.find(
            (t: Translation) => t.locale === "en"
          );

          return (
            <Card key={subCategory.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <FolderTree className="w-5 h-5" />
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
                      {subCategory.translations.length}/3
                    </Badge>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditDialog(subCategory)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(subCategory.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
                  <div className="text-sm">
                    <span className="text-muted-foreground mb-2 block">
                      Родительские категории:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {subCategory.categories &&
                      subCategory.categories.length > 0 ? (
                        subCategory.categories.map((category) => {
                          const categoryRuTranslation =
                            category.translations.find(
                              (t: Translation) => t.locale === "ru"
                            );
                          return (
                            <Badge key={category.id} variant="secondary">
                              {categoryRuTranslation?.title || "Без названия"}
                            </Badge>
                          );
                        })
                      ) : (
                        <Badge variant="outline">Не указаны</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredSubCategories.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FolderTree className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Подкатегории не найдены
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Попробуйте изменить поисковый запрос"
                  : "Создайте первую подкатегорию для начала работы"}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Создать подкатегорию
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать подкатегорию</DialogTitle>
            <DialogDescription>
              Внесите изменения в подкатегорию
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Категории</Label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {(categories || []).map((category) => {
                  const ruTranslation = category.translations.find(
                    (t: Translation) => t.locale === "ru"
                  );
                  const isChecked = formData.categoryId.includes(category.id);

                  return (
                    <div
                      key={category.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`edit-category-${category.id}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              categoryId: [...formData.categoryId, category.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              categoryId: formData.categoryId.filter(
                                (id) => id !== category.id
                              ),
                            });
                          }
                        }}
                      />
                      <Label
                        htmlFor={`edit-category-${category.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {ruTranslation?.title || "Без названия"}
                      </Label>
                    </div>
                  );
                })}
                {(!categories || categories.length === 0) && (
                  <p className="text-muted-foreground text-sm">
                    Категории не найдены
                  </p>
                )}
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
