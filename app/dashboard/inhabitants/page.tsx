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
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Fish,
  Languages,
  Image,
  Link,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createInhabitant,
  deleteInhabitant,
  getInhabitants,
  updateInhabitant,
} from "@/app/action/inhabitants";
import {
  Translation,
  AquariumType,
  Subtype,
  Inhabitant,
  CreateInhabitantRequest,
  UpdateInhabitantRequest,
} from "@/types/dashboard";

export default function InhabitantsPage() {
  const [inhabitants, setInhabitants] = useState<Inhabitant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<AquariumType | "all">("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingInhabitant, setEditingInhabitant] = useState<Inhabitant | null>(
    null
  );
  const [formData, setFormData] = useState({
    az: { title: "", description: "" },
    ru: { title: "", description: "" },
    en: { title: "", description: "" },
    type: AquariumType.FRESHWATER,
    subtype: Subtype.FISHS,
    images: [] as string[],
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchInhabitants();
  }, [searchTerm, typeFilter]);

  const fetchInhabitants = async () => {
    try {
      const response = await getInhabitants();
      if (response.statusCode === 200 && response.data) {
        setInhabitants(response.data);
      } else {
        throw new Error(response.error || "Ошибка загрузки обитателей");
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить обитателей",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const inhabitantData: CreateInhabitantRequest = {
        type: formData.type,
        subtype: formData.subtype,
        translations: {
          az: formData.az,
          ru: formData.ru,
          en: formData.en,
        },
        images: formData.images,
      };
      const response = await createInhabitant(inhabitantData);
      if (response.statusCode === 200) {
        toast({
          title: "Успешно",
          description: "Обитатель создан",
        });
        setIsCreateDialogOpen(false);
        resetForm();
        fetchInhabitants();
      } else {
        throw new Error(response.error || "Ошибка создания обитателя");
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать обитателя",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!editingInhabitant) return;

    try {
      const inhabitantData: UpdateInhabitantRequest = {
        id: editingInhabitant.id,
        type: formData.type,
        subtype: formData.subtype,
        translations: {
          az: formData.az,
          ru: formData.ru,
          en: formData.en,
        },
        images: formData.images,
      };
      const response = await updateInhabitant(inhabitantData);
      if (response.statusCode === 200) {
        toast({
          title: "Успешно",
          description: "Обитатель обновлен",
        });
        setIsEditDialogOpen(false);
        resetForm();
        fetchInhabitants();
      } else {
        throw new Error(response.error || "Ошибка обновления обитателя");
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить обитателя",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этого обитателя?")) return;

    try {
      const response = await deleteInhabitant(id);
      if (response.statusCode === 200) {
        toast({
          title: "Успешно",
          description: "Обитатель удален",
        });
        fetchInhabitants();
      } else {
        throw new Error(response.error || "Ошибка удаления обитателя");
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить обитателя",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (inhabitant: Inhabitant) => {
    setEditingInhabitant(inhabitant);

    // Заполняем форму данными обитателя
    const ruTranslation = inhabitant.translations.find(
      (t: Translation) => t.locale === "ru"
    );
    const azTranslation = inhabitant.translations.find(
      (t: Translation) => t.locale === "az"
    );
    const enTranslation = inhabitant.translations.find(
      (t: Translation) => t.locale === "en"
    );

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
      type: inhabitant.type,
      subtype: inhabitant.subtype,
      images: inhabitant.images,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      az: { title: "", description: "" },
      ru: { title: "", description: "" },
      en: { title: "", description: "" },
      type: AquariumType.FRESHWATER,
      subtype: Subtype.FISHS,
      images: [],
    });
    setEditingInhabitant(null);
  };

  const filteredInhabitants = (inhabitants || []).filter((inhabitant) => {
    const ruTranslation = inhabitant.translations.find(
      (t: Translation) => t.locale === "ru"
    );
    return ruTranslation?.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  const availableTypes = Object.values(AquariumType);

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
          <h1 className="text-3xl font-bold text-foreground">Обитатели</h1>
          <p className="text-muted-foreground">
            Управляйте обитателями аквариума
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Добавить обитателя
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Добавить обитателя</DialogTitle>
              <DialogDescription>
                Добавьте нового обитателя с переводами на трех языках
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Тип аквариума</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: AquariumType) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип аквариума" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={AquariumType.FRESHWATER}>
                        Пресноводный
                      </SelectItem>
                      <SelectItem value={AquariumType.SALTWATER}>
                        Морской
                      </SelectItem>
                      <SelectItem value={AquariumType.PALUDARIUM}>
                        Паладариум
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subtype">Подтип</Label>
                  <Select
                    value={formData.subtype}
                    onValueChange={(value: Subtype) =>
                      setFormData({ ...formData, subtype: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите подтип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Subtype.FISHS}>Рыбы</SelectItem>
                      <SelectItem value={Subtype.REPTILES}>Рептилии</SelectItem>
                      <SelectItem value={Subtype.AMPHIBIANS}>
                        Амфибии
                      </SelectItem>
                      <SelectItem value={Subtype.TURTLES}>Черепахи</SelectItem>
                      <SelectItem value={Subtype.FROGS}>Лягушки</SelectItem>
                      <SelectItem value={Subtype.CORALS}>Кораллы</SelectItem>
                      <SelectItem value={Subtype.PLANTS}>Растения</SelectItem>
                      <SelectItem value={Subtype.SHRIMPS}>Креветки</SelectItem>
                      <SelectItem value={Subtype.CRAYFISH}>Раки</SelectItem>
                      <SelectItem value={Subtype.CRABS}>Крабы</SelectItem>
                      <SelectItem value={Subtype.SNAILS}>Улитки</SelectItem>
                      <SelectItem value={Subtype.STARFISHS}>
                        Морские звезды
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="images">URL изображений (через запятую)</Label>
                <Input
                  id="images"
                  value={formData.images.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      images: e.target.value
                        .split(",")
                        .map((url) => url.trim())
                        .filter((url) => url),
                    })
                  }
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                />
              </div>

              <Tabs defaultValue="ru" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ru">Русский</TabsTrigger>
                  <TabsTrigger value="az">Азербайджанский</TabsTrigger>
                  <TabsTrigger value="en">Английский</TabsTrigger>
                </TabsList>

                <TabsContent value="ru" className="space-y-4">
                  <div>
                    <Label htmlFor="ru-title">Название (Русский)</Label>
                    <Input
                      id="ru-title"
                      value={formData.ru.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ru: {
                            title: e.target.value,
                            description: formData.ru.description,
                          },
                        })
                      }
                      placeholder="Введите название на русском"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="az" className="space-y-4">
                  <div>
                    <Label htmlFor="az-title">Название (Азербайджанский)</Label>
                    <Input
                      id="az-title"
                      value={formData.az.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          az: {
                            title: e.target.value,
                            description: formData.az.description,
                          },
                        })
                      }
                      placeholder="Введите название на азербайджанском"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="en" className="space-y-4">
                  <div>
                    <Label htmlFor="en-title">Название (Английский)</Label>
                    <Input
                      id="en-title"
                      value={formData.en.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          en: {
                            title: e.target.value,
                            description: formData.en.description,
                          },
                        })
                      }
                      placeholder="Введите название на английском"
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
              <Button onClick={handleCreate}>Добавить обитателя</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Поиск обитателей..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-64">
          <Select
            value={typeFilter}
            onValueChange={(value) =>
              setTypeFilter(value as AquariumType | "all")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Все типы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все типы</SelectItem>
              <SelectItem value={AquariumType.FRESHWATER}>
                Пресноводный
              </SelectItem>
              <SelectItem value={AquariumType.SALTWATER}>Морской</SelectItem>
              <SelectItem value={AquariumType.PALUDARIUM}>
                Паладариум
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredInhabitants.map((inhabitant) => {
          const ruTranslation = inhabitant.translations.find(
            (t: Translation) => t.locale === "ru"
          );
          const azTranslation = inhabitant.translations.find(
            (t: Translation) => t.locale === "az"
          );
          const enTranslation = inhabitant.translations.find(
            (t: Translation) => t.locale === "en"
          );

          return (
            <Card key={inhabitant.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Fish className="w-5 h-5" />
                      {ruTranslation?.title || "Без названия"}
                    </CardTitle>
                    <CardDescription>
                      Тип: {inhabitant.type} • Подтип: {inhabitant.subtype}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Languages className="w-3 h-3" />
                      {inhabitant.translations.length}/3
                    </Badge>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditDialog(inhabitant)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(inhabitant.id)}
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
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Тип аквариума:
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {inhabitant.type}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Подтип:</span>
                    <Badge variant="outline">{inhabitant.subtype}</Badge>
                  </div>
                  {inhabitant.images && inhabitant.images.length > 0 && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-muted-foreground">
                        Изображения:
                      </span>
                      <div className="flex items-center gap-1">
                        <Image className="w-3 h-3" />
                        <span className="text-xs">
                          {inhabitant.images.length} шт.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredInhabitants.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Fish className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Обитатели не найдены
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || typeFilter !== "all"
                  ? "Попробуйте изменить фильтры поиска"
                  : "Добавьте первого обитателя для начала работы"}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить обитателя
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать обитателя</DialogTitle>
            <DialogDescription>
              Внесите изменения в данные обитателя
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-type">Тип аквариума</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: AquariumType) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип аквариума" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AquariumType.FRESHWATER}>
                      Пресноводный
                    </SelectItem>
                    <SelectItem value={AquariumType.SALTWATER}>
                      Морской
                    </SelectItem>
                    <SelectItem value={AquariumType.PALUDARIUM}>
                      Паладариум
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-subtype">Подтип</Label>
                <Select
                  value={formData.subtype}
                  onValueChange={(value: Subtype) =>
                    setFormData({ ...formData, subtype: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите подтип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Subtype.FISHS}>Рыбы</SelectItem>
                    <SelectItem value={Subtype.REPTILES}>Рептилии</SelectItem>
                    <SelectItem value={Subtype.AMPHIBIANS}>Амфибии</SelectItem>
                    <SelectItem value={Subtype.TURTLES}>Черепахи</SelectItem>
                    <SelectItem value={Subtype.FROGS}>Лягушки</SelectItem>
                    <SelectItem value={Subtype.CORALS}>Кораллы</SelectItem>
                    <SelectItem value={Subtype.PLANTS}>Растения</SelectItem>
                    <SelectItem value={Subtype.SHRIMPS}>Креветки</SelectItem>
                    <SelectItem value={Subtype.CRAYFISH}>Раки</SelectItem>
                    <SelectItem value={Subtype.CRABS}>Крабы</SelectItem>
                    <SelectItem value={Subtype.SNAILS}>Улитки</SelectItem>
                    <SelectItem value={Subtype.STARFISHS}>
                      Морские звезды
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-images">
                URL изображений (через запятую)
              </Label>
              <Input
                id="edit-images"
                value={formData.images.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    images: e.target.value
                      .split(",")
                      .map((url) => url.trim())
                      .filter((url) => url),
                  })
                }
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              />
            </div>

            <Tabs defaultValue="ru" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ru">Русский</TabsTrigger>
                <TabsTrigger value="az">Азербайджанский</TabsTrigger>
                <TabsTrigger value="en">Английский</TabsTrigger>
              </TabsList>

              <TabsContent value="ru" className="space-y-4">
                <div>
                  <Label htmlFor="edit-ru-title">Название (Русский)</Label>
                  <Input
                    id="edit-ru-title"
                    value={formData.ru.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ru: {
                          title: e.target.value,
                          description: formData.ru.description,
                        },
                      })
                    }
                    placeholder="Введите название на русском"
                  />
                </div>
              </TabsContent>

              <TabsContent value="az" className="space-y-4">
                <div>
                  <Label htmlFor="edit-az-title">
                    Название (Азербайджанский)
                  </Label>
                  <Input
                    id="edit-az-title"
                    value={formData.az.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        az: {
                          title: e.target.value,
                          description: formData.az.description,
                        },
                      })
                    }
                    placeholder="Введите название на азербайджанском"
                  />
                </div>
              </TabsContent>

              <TabsContent value="en" className="space-y-4">
                <div>
                  <Label htmlFor="edit-en-title">Название (Английский)</Label>
                  <Input
                    id="edit-en-title"
                    value={formData.en.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        en: {
                          title: e.target.value,
                          description: formData.en.description,
                        },
                      })
                    }
                    placeholder="Введите название на английском"
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
