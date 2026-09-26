/**
 * Шаблон статьи об обитателе: паспорт (поля с числами и выбором) и текстовые
 * разделы. Ключи совпадают с aquaWikiBackend/src/lib/inhabitantProfile.ts —
 * API отклонит незнакомое поле, поэтому новое поле добавлять в оба места.
 */

export type Group = "FISH" | "INVERT" | "PLANT" | "CORAL" | "TERRA";

export function groupOf(subtype: string): Group {
  switch (subtype) {
    case "FISHS":
      return "FISH";
    case "PLANTS":
      return "PLANT";
    case "CORALS":
      return "CORAL";
    case "REPTILES":
    case "AMPHIBIANS":
    case "TURTLES":
    case "FROGS":
      return "TERRA";
    default:
      return "INVERT";
  }
}

export type TemplateContext = { subtype: string; types: string[] };

type Option = { value: string; label: string };

type Base = {
  key: string;
  label: string | ((ctx: TemplateContext) => string);
  show: (ctx: TemplateContext) => boolean;
  hint?: string;
};

export type ProfileField = Base &
  (
    | { kind: "text"; placeholder?: string }
    | { kind: "number"; unit?: string; step?: number }
    | { kind: "range"; unit?: string; step?: number }
    | { kind: "select"; options: Option[] }
    | { kind: "multi"; options: Option[] }
    | { kind: "bool" }
  );

export type RangeValue = { min?: number; max?: number };
export type ProfileValue = string | number | boolean | string[] | RangeValue;
export type Profile = Record<string, ProfileValue>;

const is =
  (...groups: Group[]) =>
  (ctx: TemplateContext) =>
    groups.includes(groupOf(ctx.subtype));

const always = () => true;
const saltwater = (ctx: TemplateContext) => ctx.types.includes("SALTWATER");

const LEVELS: Option[] = [
  { value: "LOW", label: "Низкий" },
  { value: "MEDIUM", label: "Средний" },
  { value: "HIGH", label: "Высокий" },
];

export const PROFILE_BLOCKS: { title: string; fields: ProfileField[] }[] = [
  {
    title: "Общее",
    fields: [
      {
        key: "scientificName",
        kind: "text",
        label: "Научное название",
        placeholder: "Paracheirodon innesi",
        show: always,
      },
      {
        key: "difficulty",
        kind: "select",
        label: "Сложность содержания",
        show: always,
        options: [
          { value: "EASY", label: "Для новичков" },
          { value: "MEDIUM", label: "Средняя" },
          { value: "HARD", label: "Для опытных" },
        ],
      },
      {
        key: "size",
        kind: "number",
        unit: "см",
        label: (ctx) =>
          groupOf(ctx.subtype) === "PLANT" ? "Высота" : "Размер взрослой особи",
        show: always,
      },
      {
        key: "lifespan",
        kind: "number",
        unit: "лет",
        label: "Продолжительность жизни",
        show: is("FISH", "INVERT", "TERRA"),
      },
      {
        key: "minVolume",
        kind: "number",
        unit: "л",
        step: 1,
        label: (ctx) =>
          groupOf(ctx.subtype) === "TERRA"
            ? "Минимальный объём террариума"
            : "Минимальный объём аквариума",
        show: is("FISH", "INVERT", "CORAL", "TERRA"),
      },
    ],
  },
  {
    title: "Параметры воды",
    fields: [
      {
        key: "temperature",
        kind: "range",
        unit: "°C",
        label: (ctx) =>
          groupOf(ctx.subtype) === "TERRA" ? "Температура воды" : "Температура",
        show: always,
      },
      { key: "ph", kind: "range", step: 0.1, label: "pH", show: is("FISH", "INVERT", "PLANT", "CORAL") },
      { key: "gh", kind: "range", unit: "°dH", label: "Общая жёсткость (GH)", show: is("FISH", "INVERT", "PLANT") },
      { key: "kh", kind: "range", unit: "°dH", label: "Карбонатная жёсткость (KH)", show: is("FISH", "INVERT", "PLANT", "CORAL") },
      {
        key: "salinity",
        kind: "range",
        step: 0.001,
        label: "Солёность (удельный вес)",
        hint: "Например 1.023–1.026",
        show: saltwater,
      },
      { key: "calcium", kind: "range", unit: "мг/л", step: 1, label: "Кальций (Ca)", show: is("CORAL") },
      { key: "magnesium", kind: "range", unit: "мг/л", step: 1, label: "Магний (Mg)", show: is("CORAL") },
    ],
  },
  {
    title: "Поведение и содержание",
    fields: [
      {
        key: "temperament",
        kind: "select",
        label: "Характер",
        show: is("FISH", "INVERT", "TERRA"),
        options: [
          { value: "PEACEFUL", label: "Мирный" },
          { value: "SEMI_AGGRESSIVE", label: "Полуагрессивный" },
          { value: "AGGRESSIVE", label: "Агрессивный" },
          { value: "PREDATOR", label: "Хищник" },
        ],
      },
      {
        key: "social",
        kind: "select",
        label: "Образ жизни",
        show: is("FISH"),
        options: [
          { value: "SOLITARY", label: "Одиночный" },
          { value: "PAIR", label: "Парами" },
          { value: "HAREM", label: "Гаремом" },
          { value: "SCHOOL", label: "Стайный" },
        ],
      },
      {
        key: "groupSize",
        kind: "number",
        step: 1,
        unit: "особей",
        label: "Рекомендуемое количество (от)",
        show: is("FISH", "INVERT"),
      },
      {
        key: "swimZone",
        kind: "multi",
        label: "Зона обитания",
        show: is("FISH"),
        options: [
          { value: "BOTTOM", label: "Дно" },
          { value: "MIDDLE", label: "Средние слои" },
          { value: "TOP", label: "Поверхность" },
        ],
      },
      {
        key: "diet",
        kind: "select",
        label: "Питание",
        show: is("FISH", "INVERT", "TERRA"),
        options: [
          { value: "OMNIVORE", label: "Всеядный" },
          { value: "CARNIVORE", label: "Хищник / живой корм" },
          { value: "HERBIVORE", label: "Растительноядный" },
        ],
      },
      { key: "jumps", kind: "bool", label: "Выпрыгивает — нужна крышка", show: is("FISH") },
      { key: "eatsPlants", kind: "bool", label: "Ест растения", show: is("FISH", "INVERT") },
      { key: "copperSensitive", kind: "bool", label: "Чувствителен к меди (лекарства!)", show: is("INVERT") },
    ],
  },
  {
    title: "Свет и рост",
    fields: [
      { key: "light", kind: "select", label: "Освещение", options: LEVELS, show: is("PLANT", "CORAL") },
      {
        key: "co2",
        kind: "select",
        label: "CO₂",
        show: is("PLANT"),
        options: [
          { value: "NONE", label: "Не нужен" },
          { value: "RECOMMENDED", label: "Желателен" },
          { value: "REQUIRED", label: "Обязателен" },
        ],
      },
      {
        key: "growth",
        kind: "select",
        label: "Скорость роста",
        show: is("PLANT", "CORAL"),
        options: [
          { value: "SLOW", label: "Медленная" },
          { value: "MEDIUM", label: "Средняя" },
          { value: "FAST", label: "Быстрая" },
        ],
      },
      {
        key: "placement",
        kind: "multi",
        label: "Расположение",
        show: is("PLANT"),
        options: [
          { value: "FOREGROUND", label: "Передний план" },
          { value: "MIDGROUND", label: "Средний план" },
          { value: "BACKGROUND", label: "Задний план" },
          { value: "FLOATING", label: "Плавающее" },
          { value: "EPIPHYTE", label: "На коряге / камне" },
        ],
      },
      { key: "flow", kind: "select", label: "Течение", options: LEVELS, show: is("CORAL") },
      { key: "stinging", kind: "bool", label: "Жалит соседей", show: is("CORAL") },
      {
        key: "coralFeeding",
        kind: "select",
        label: "Кормление",
        show: is("CORAL"),
        options: [
          { value: "PHOTOSYNTHETIC", label: "Только свет" },
          { value: "SUPPLEMENTAL", label: "Желательна подкормка" },
          { value: "REQUIRED", label: "Обязательна подкормка" },
        ],
      },
    ],
  },
  {
    title: "Палюдариум",
    fields: [
      { key: "airTemperature", kind: "range", unit: "°C", label: "Температура воздуха", show: is("TERRA") },
      { key: "humidity", kind: "range", unit: "%", step: 1, label: "Влажность", show: is("TERRA") },
      {
        key: "needsLand",
        kind: "bool",
        label: "Нужна суша",
        show: (ctx) => groupOf(ctx.subtype) === "TERRA" || ctx.subtype === "CRABS",
      },
      { key: "uvb", kind: "bool", label: "Нужна УФ-лампа", show: is("TERRA") },
    ],
  },
];

export const SECTION_KEYS = [
  "otherNames",
  "origin",
  "overview",
  "appearance",
  "care",
  "feeding",
  "compatibility",
  "breeding",
  "facts",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];
export type Sections = Record<SectionKey, string>;

export const SECTIONS: {
  key: SectionKey;
  label: string | ((ctx: TemplateContext) => string);
  hint: string;
  short?: boolean;
  show?: (ctx: TemplateContext) => boolean;
}[] = [
  { key: "otherNames", label: "Другие названия", hint: "Через запятую", short: true },
  { key: "origin", label: "Родина / ареал", hint: "Например: бассейн Амазонки", short: true },
  { key: "overview", label: "Общие сведения", hint: "Что за вид и чем интересен" },
  {
    key: "appearance",
    label: "Внешний вид",
    hint: "Окраска, размер, как отличить самца от самки",
  },
  { key: "care", label: "Содержание", hint: "Оформление, грунт, укрытия, фильтрация, течение" },
  {
    key: "feeding",
    label: (ctx) => (groupOf(ctx.subtype) === "PLANT" ? "Удобрения и подкормки" : "Кормление"),
    hint: "Чем и как часто",
  },
  {
    key: "compatibility",
    label: "Совместимость",
    hint: "С кем можно и с кем нельзя содержать",
    show: (ctx) => groupOf(ctx.subtype) !== "PLANT",
  },
  {
    key: "breeding",
    label: "Размножение",
    hint: "Нерест, сложность, уход за потомством; для растений — черенки, усы, дочерние растения",
  },
  { key: "facts", label: "Интересные факты", hint: "Необязательно" },
];

export const emptySections = (): Sections =>
  Object.fromEntries(SECTION_KEYS.map((k) => [k, ""])) as Sections;

export const labelOf = (
  label: string | ((ctx: TemplateContext) => string),
  ctx: TemplateContext
) => (typeof label === "function" ? label(ctx) : label);

/**
 * Перед отправкой оставляем только поля, видимые для выбранного подтипа:
 * если сменили «рыбу» на «растение», её характер и зона обитания не должны
 * остаться висеть в паспорте невидимыми.
 */
export function visibleProfile(profile: Profile, ctx: TemplateContext): Profile | null {
  const out: Profile = {};
  for (const block of PROFILE_BLOCKS) {
    for (const field of block.fields) {
      if (!field.show(ctx)) continue;
      const value = profile[field.key];
      if (value === undefined || value === "") continue;
      if (Array.isArray(value) && value.length === 0) continue;
      if (field.kind === "range") {
        const r = value as RangeValue;
        if (r.min === undefined && r.max === undefined) continue;
      }
      out[field.key] = value;
    }
  }
  return Object.keys(out).length > 0 ? out : null;
}

/** Сколько видимых полей паспорта заполнено — для индикатора в списке. */
export function profileCompleteness(profile: Profile | null | undefined, ctx: TemplateContext) {
  let total = 0;
  let filled = 0;
  for (const block of PROFILE_BLOCKS) {
    for (const field of block.fields) {
      if (!field.show(ctx)) continue;
      total += 1;
      if (profile && profile[field.key] !== undefined) filled += 1;
    }
  }
  return { total, filled };
}
