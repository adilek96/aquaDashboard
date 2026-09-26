"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/image-upload";
import { cn } from "@/lib/utils";
import { AquariumType, Subtype } from "@/types/dashboard";
import {
  PROFILE_BLOCKS,
  SECTIONS,
  emptySections,
  labelOf,
  type Profile,
  type ProfileField,
  type RangeValue,
  type Sections,
  type TemplateContext,
} from "@/lib/inhabitant-template";

export const LOCALES = [
  { code: "ru", label: "Русский" },
  { code: "az", label: "Азербайджанский" },
  { code: "en", label: "Английский" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

export type GalleryItem = { url: string; credit: string; sourceUrl: string };

export type InhabitantFormState = {
  type: AquariumType[];
  subtype: Subtype;
  images: string[];
  imageUrl: string;
  gallery: GalleryItem[];
  profile: Profile;
  translations: Record<Locale, { title: string } & Sections>;
};

export const emptyInhabitantForm = (): InhabitantFormState => ({
  type: [AquariumType.FRESHWATER],
  subtype: Subtype.FISHS,
  images: [],
  imageUrl: "",
  gallery: [],
  profile: {},
  translations: {
    ru: { title: "", ...emptySections() },
    az: { title: "", ...emptySections() },
    en: { title: "", ...emptySections() },
  },
});

export const TYPE_LABELS: Record<AquariumType, string> = {
  [AquariumType.FRESHWATER]: "Пресноводный",
  [AquariumType.SALTWATER]: "Морской",
  [AquariumType.PALUDARIUM]: "Палюдариум",
};

export const SUBTYPE_LABELS: Record<Subtype, string> = {
  [Subtype.FISHS]: "Рыбы",
  [Subtype.REPTILES]: "Рептилии",
  [Subtype.AMPHIBIANS]: "Амфибии",
  [Subtype.TURTLES]: "Черепахи",
  [Subtype.FROGS]: "Лягушки",
  [Subtype.CORALS]: "Кораллы",
  [Subtype.PLANTS]: "Растения",
  [Subtype.SHRIMPS]: "Креветки",
  [Subtype.CRAYFISH]: "Раки",
  [Subtype.CRABS]: "Крабы",
  [Subtype.SNAILS]: "Улитки",
  [Subtype.STARFISHS]: "Морские звёзды",
};

// Radix Select не принимает пустую строку как значение пункта
const NONE = "__none";

function parseNumber(raw: string): number | undefined {
  if (raw.trim() === "") return undefined;
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

function FieldControl({
  field,
  value,
  onChange,
  ctx,
}: {
  field: ProfileField;
  value: Profile[string] | undefined;
  onChange: (value: Profile[string] | undefined) => void;
  ctx: TemplateContext;
}) {
  const id = `profile-${field.key}`;
  const label = labelOf(field.label, ctx);
  const unit = "unit" in field && field.unit ? `, ${field.unit}` : "";

  const heading = (
    <Label htmlFor={id} className="mb-1.5 block">
      {label}
      {unit}
    </Label>
  );

  switch (field.kind) {
    case "text":
      return (
        <div>
          {heading}
          <Input
            id={id}
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value || undefined)}
          />
        </div>
      );

    case "number":
      return (
        <div>
          {heading}
          <Input
            id={id}
            type="number"
            inputMode="decimal"
            step={field.step ?? 0.5}
            min={0}
            value={value === undefined ? "" : String(value)}
            onChange={(e) => onChange(parseNumber(e.target.value))}
          />
        </div>
      );

    case "range": {
      const range = (value as RangeValue) ?? {};
      const set = (part: "min" | "max", raw: string) => {
        const next = { ...range, [part]: parseNumber(raw) };
        onChange(next.min === undefined && next.max === undefined ? undefined : next);
      };
      return (
        <div>
          {heading}
          <div className="flex items-center gap-2">
            <Input
              id={id}
              type="number"
              inputMode="decimal"
              step={field.step ?? 0.5}
              placeholder="от"
              aria-label={`${label}: от`}
              value={range.min ?? ""}
              onChange={(e) => set("min", e.target.value)}
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="number"
              inputMode="decimal"
              step={field.step ?? 0.5}
              placeholder="до"
              aria-label={`${label}: до`}
              value={range.max ?? ""}
              onChange={(e) => set("max", e.target.value)}
            />
          </div>
          {field.hint && <p className="mt-1 text-xs text-muted-foreground">{field.hint}</p>}
        </div>
      );
    }

    case "select":
      return (
        <div>
          {heading}
          <Select
            value={(value as string) ?? NONE}
            onValueChange={(v) => onChange(v === NONE ? undefined : v)}
          >
            <SelectTrigger id={id}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>— не указано</SelectItem>
              {field.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "multi": {
      const selected = (value as string[]) ?? [];
      const toggle = (v: string) => {
        const next = selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v];
        onChange(next.length > 0 ? next : undefined);
      };
      return (
        <div>
          <span className="mb-1.5 block text-sm font-medium">{label}</span>
          <div className="flex flex-wrap gap-2">
            {field.options.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={selected.includes(option.value) ? "default" : "outline"}
                aria-pressed={selected.includes(option.value)}
                onClick={() => toggle(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      );
    }

    case "bool":
      // Три состояния: «не указано» отличается от «нет»
      return (
        <div>
          {heading}
          <Select
            value={value === undefined ? NONE : value ? "yes" : "no"}
            onValueChange={(v) => onChange(v === NONE ? undefined : v === "yes")}
          >
            <SelectTrigger id={id}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>— не указано</SelectItem>
              <SelectItem value="yes">Да</SelectItem>
              <SelectItem value="no">Нет</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
  }
}

export function InhabitantForm({
  value,
  onChange,
}: {
  value: InhabitantFormState;
  onChange: (value: InhabitantFormState) => void;
}) {
  const ctx: TemplateContext = { subtype: value.subtype, types: value.type };
  const set = (patch: Partial<InhabitantFormState>) => onChange({ ...value, ...patch });

  const setProfile = (key: string, fieldValue: Profile[string] | undefined) => {
    const profile = { ...value.profile };
    if (fieldValue === undefined) delete profile[key];
    else profile[key] = fieldValue;
    set({ profile });
  };

  const setText = (locale: Locale, key: string, text: string) =>
    set({
      translations: {
        ...value.translations,
        [locale]: { ...value.translations[locale], [key]: text },
      },
    });

  const toggleType = (type: AquariumType, checked: boolean) => {
    const next = checked ? [...value.type, type] : value.type.filter((t) => t !== type);
    // Хотя бы один тип обязателен — API иначе отклонит запрос
    if (next.length > 0) set({ type: next });
  };

  const visibleSections = SECTIONS.filter((s) => !s.show || s.show(ctx));

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <span className="mb-1.5 block text-sm font-medium">Тип аквариума</span>
            <div className="flex flex-wrap gap-4 pt-2">
              {Object.values(AquariumType).map((type) => (
                <label key={type} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={value.type.includes(type)}
                    onCheckedChange={(checked) => toggleType(type, checked === true)}
                  />
                  {TYPE_LABELS[type]}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Подтип</Label>
            <Select value={value.subtype} onValueChange={(v) => set({ subtype: v as Subtype })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Subtype).map((subtype) => (
                  <SelectItem key={subtype} value={subtype}>
                    {SUBTYPE_LABELS[subtype]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ImageUpload
          images={value.images}
          onImagesChange={(images) =>
            set({ images, imageUrl: images[0] || value.imageUrl })
          }
          maxImages={1}
        />
        <div>
          <Label htmlFor="imageUrl" className="mb-1.5 block">
            URL изображения
          </Label>
          <Input
            id="imageUrl"
            value={value.imageUrl}
            onChange={(e) => set({ imageUrl: e.target.value })}
            placeholder="Заполняется сам после загрузки"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Галерея</h3>
          <p className="text-sm text-muted-foreground">
            Дополнительные фото на странице обитателя. Для чужих снимков укажите автора и
            лицензию — например «Holger Krisp, CC BY 3.0» — и ссылку на источник.
          </p>
        </div>
        <ImageUpload
          images={value.gallery.map((g) => g.url)}
          onImagesChange={(urls) =>
            set({
              gallery: urls.map(
                (url) =>
                  value.gallery.find((g) => g.url === url) ?? { url, credit: "", sourceUrl: "" }
              ),
            })
          }
          maxImages={8}
        />
        {value.gallery.map((item, index) => {
          const update = (patch: Partial<GalleryItem>) =>
            set({
              gallery: value.gallery.map((g, i) => (i === index ? { ...g, ...patch } : g)),
            });
          return (
            <div key={item.url} className="flex items-start gap-3 rounded-lg border p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt=""
                className="h-16 w-16 shrink-0 rounded-md bg-muted object-cover"
              />
              <div className="grid flex-1 gap-2 md:grid-cols-2">
                <Input
                  value={item.credit}
                  placeholder="Автор и лицензия"
                  aria-label={`Фото ${index + 1}: автор и лицензия`}
                  onChange={(e) => update({ credit: e.target.value })}
                />
                <Input
                  value={item.sourceUrl}
                  placeholder="Ссылка на источник"
                  aria-label={`Фото ${index + 1}: ссылка на источник`}
                  onChange={(e) => update({ sourceUrl: e.target.value })}
                />
              </div>
            </div>
          );
        })}
      </section>

      <section className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Паспорт</h3>
          <p className="text-sm text-muted-foreground">
            Общий для всех языков. Набор полей зависит от подтипа; пустые поля на сайте не
            показываются.
          </p>
        </div>
        {PROFILE_BLOCKS.map((block) => {
          const fields = block.fields.filter((f) => f.show(ctx));
          if (fields.length === 0) return null;
          return (
            <fieldset key={block.title} className="rounded-lg border p-4">
              <legend className="px-1 text-sm font-semibold text-muted-foreground">
                {block.title}
              </legend>
              <div className="grid gap-4 md:grid-cols-2">
                {fields.map((field) => (
                  <FieldControl
                    key={field.key}
                    field={field}
                    ctx={ctx}
                    value={value.profile[field.key]}
                    onChange={(v) => setProfile(field.key, v)}
                  />
                ))}
              </div>
            </fieldset>
          );
        })}
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Статья</h3>
          <p className="text-sm text-muted-foreground">
            Разделы одинаковые у всех обитателей. Пустая строка между абзацами — новый абзац,
            строка с «- » в начале — пункт списка.
          </p>
        </div>
        <Tabs defaultValue="ru">
          <TabsList className="grid w-full grid-cols-3">
            {LOCALES.map(({ code, label }) => {
              const t = value.translations[code];
              const filled = visibleSections.filter((s) => t[s.key].trim()).length;
              return (
                <TabsTrigger key={code} value={code} className="gap-2">
                  {label}
                  <Badge
                    variant="secondary"
                    className={cn("px-1.5 text-[10px]", !t.title.trim() && "text-destructive")}
                  >
                    {filled}/{visibleSections.length}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {LOCALES.map(({ code, label }) => (
            <TabsContent key={code} value={code} className="space-y-4 pt-2">
              <div>
                <Label htmlFor={`${code}-title`} className="mb-1.5 block">
                  Название ({label})
                </Label>
                <Input
                  id={`${code}-title`}
                  value={value.translations[code].title}
                  onChange={(e) => setText(code, "title", e.target.value)}
                />
              </div>
              {visibleSections.map((section) => {
                const id = `${code}-${section.key}`;
                const text = value.translations[code][section.key];
                return (
                  <div key={section.key}>
                    <Label htmlFor={id} className="mb-1.5 block">
                      {labelOf(section.label, ctx)}
                    </Label>
                    {section.short ? (
                      <Input
                        id={id}
                        value={text}
                        placeholder={section.hint}
                        onChange={(e) => setText(code, section.key, e.target.value)}
                      />
                    ) : (
                      <Textarea
                        id={id}
                        rows={5}
                        value={text}
                        placeholder={section.hint}
                        onChange={(e) => setText(code, section.key, e.target.value)}
                      />
                    )}
                  </div>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
}
