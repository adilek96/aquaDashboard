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
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2, Fish, Loader2, ClipboardList } from "lucide-react";
import {
  createInhabitant,
  deleteInhabitant,
  getInhabitant,
  getInhabitants,
  updateInhabitant,
} from "@/app/action/inhabitants";
import {
  AquariumType,
  Inhabitant,
  InhabitantTranslation,
  CreateInhabitantRequest,
} from "@/types/dashboard";
import {
  InhabitantForm,
  InhabitantFormState,
  LOCALES,
  SUBTYPE_LABELS,
  TYPE_LABELS,
  emptyInhabitantForm,
} from "@/components/inhabitant-form";
import {
  SECTION_KEYS,
  emptySections,
  profileCompleteness,
  visibleProfile,
} from "@/lib/inhabitant-template";

function translationOf(inhabitant: Inhabitant, locale: string) {
  return inhabitant.translations?.find((t: InhabitantTranslation) => t.locale === locale);
}

/** Данные из API → состояние формы. */
function toForm(inhabitant: Inhabitant): InhabitantFormState {
  const form = emptyInhabitantForm();
  for (const { code } of LOCALES) {
    const t = translationOf(inhabitant, code);
    form.translations[code] = {
      ...emptySections(),
      title: t?.title ?? (code === "ru" ? inhabitant.title ?? "" : ""),
      ...Object.fromEntries(SECTION_KEYS.map((key) => [key, t?.[key] ?? ""])),
    };
  }
  return {
    ...form,
    type: inhabitant.type.length > 0 ? inhabitant.type : form.type,
    subtype: inhabitant.subtype,
    images: inhabitant.imageUrl ? [inhabitant.imageUrl] : [],
    imageUrl: inhabitant.imageUrl ?? "",
    gallery: (inhabitant.gallery ?? []).map((g) => ({
      url: g.url,
      credit: g.credit ?? "",
      sourceUrl: g.sourceUrl ?? "",
    })),
    profile: inhabitant.profile ?? {},
  };
}

/** Состояние формы → тело запроса. */
function toRequest(form: InhabitantFormState): CreateInhabitantRequest {
  const ctx = { subtype: form.subtype, types: form.type };
  return {
    type: form.type,
    subtype: form.subtype,
    imageUrl: form.imageUrl.trim(),
    profile: visibleProfile(form.profile, ctx),
    gallery: form.gallery.map((g) => ({
      url: g.url,
      ...(g.credit.trim() ? { credit: g.credit.trim() } : {}),
      ...(g.sourceUrl.trim() ? { sourceUrl: g.sourceUrl.trim() } : {}),
    })),
    translations: {
      ru: form.translations.ru,
      az: form.translations.az,
      en: form.translations.en,
    },
  };
}

export default function InhabitantsPage() {
  const [inhabitants, setInhabitants] = useState<Inhabitant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<AquariumType | "all">("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  // null — создание, иначе id редактируемого обитателя
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<InhabitantFormState>(emptyInhabitantForm);
  const [loadingForm, setLoadingForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInhabitants();
  }, []);

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

  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyInhabitantForm());
    setDialogOpen(true);
  };

  const openEdit = async (inhabitant: Inhabitant) => {
    setEditingId(inhabitant.id);
    setFormData(toForm(inhabitant));
    setDialogOpen(true);

    // В списке нет текстов разделов — догружаем обитателя целиком
    setLoadingForm(true);
    const response = await getInhabitant(inhabitant.id);
    setLoadingForm(false);
    if (response.statusCode === 200 && response.data) {
      setFormData(toForm(response.data));
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить статью обитателя",
        variant: "destructive",
      });
      setDialogOpen(false);
    }
  };

  const handleSave = async () => {
    if (!formData.translations.ru.title.trim()) {
      toast({
        title: "Нужно название",
        description: "Заполните хотя бы название на русском",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const body = toRequest(formData);
      const response = editingId
        ? await updateInhabitant({ ...body, id: editingId })
        : await createInhabitant(body);

      if (response.statusCode !== 200) {
        throw new Error(response.error || "Ошибка сохранения");
      }

      toast({
        title: "Успешно",
        description: editingId ? "Обитатель обновлён" : "Обитатель создан",
      });
      setDialogOpen(false);
      fetchInhabitants();
    } catch (error) {
      toast({
        title: "Ошибка",
        description:
          error instanceof Error ? error.message : "Не удалось сохранить обитателя",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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

  const filteredInhabitants = inhabitants.filter((inhabitant) => {
    const title = translationOf(inhabitant, "ru")?.title || inhabitant.title || "";
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || inhabitant.type.includes(typeFilter);
    return matchesSearch && matchesType;
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
          <h1 className="text-3xl font-bold text-foreground">Обитатели</h1>
          <p className="text-muted-foreground">
            Карточки обитателей для энциклопедии: паспорт и статья по единому шаблону
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить обитателя
        </Button>
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
            onValueChange={(value) => setTypeFilter(value as AquariumType | "all")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Все типы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все типы</SelectItem>
              {Object.values(AquariumType).map((type) => (
                <SelectItem key={type} value={type}>
                  {TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredInhabitants.map((inhabitant) => {
          const title =
            translationOf(inhabitant, "ru")?.title || inhabitant.title || "Без названия";
          const ctx = { subtype: inhabitant.subtype, types: inhabitant.type };
          const { filled, total } = profileCompleteness(inhabitant.profile, ctx);
          const scientificName = inhabitant.profile?.scientificName as string | undefined;

          return (
            <Card key={inhabitant.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-1 items-start gap-4">
                    {inhabitant.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={inhabitant.imageUrl}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-md bg-muted object-cover"
                      />
                    ) : (
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-md bg-muted">
                        <Fish className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <CardTitle>{title}</CardTitle>
                      {scientificName && (
                        <p className="text-sm italic text-muted-foreground">{scientificName}</p>
                      )}
                      <CardDescription className="mt-1">
                        {inhabitant.type.map((t) => TYPE_LABELS[t] ?? t).join(", ")} •{" "}
                        {SUBTYPE_LABELS[inhabitant.subtype] ?? inhabitant.subtype}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEdit(inhabitant)}
                      aria-label="Редактировать"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(inhabitant.id)}
                      aria-label="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant="outline" className="gap-1">
                    <ClipboardList className="h-3 w-3" />
                    Паспорт {filled}/{total}
                  </Badge>
                  {LOCALES.map(({ code }) => {
                    const has = Boolean(translationOf(inhabitant, code)?.title?.trim());
                    return (
                      <Badge key={code} variant={has ? "default" : "secondary"}>
                        {code.toUpperCase()} {has ? "✓" : "✗"}
                      </Badge>
                    );
                  })}
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
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить обитателя
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !saving && setDialogOpen(open)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Редактировать обитателя" : "Добавить обитателя"}
            </DialogTitle>
            <DialogDescription>
              Заполните паспорт и разделы статьи — на сайте они выводятся по единому шаблону
            </DialogDescription>
          </DialogHeader>

          {loadingForm ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Загрузка…
            </div>
          ) : (
            <InhabitantForm value={formData} onChange={setFormData} />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={saving || loadingForm}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Сохранить изменения" : "Добавить обитателя"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
