// Общие типы для всех страниц dashboard

// Типы для переводов
export interface Translation {
  id?: string;
  locale: "az" | "ru" | "en";
  title: string;
  description?: string;
}

// Типы для изображений
export interface ArticleImage {
  id?: string;
  url: string;
}

// Типы для категорий
export interface Category {
  id: string;
  translations: Translation[];
  subCategories?: any[];
}

// Типы для подкатегорий
export interface SubCategory {
  id: string;
  translations: Translation[];
  categories: Category[];
}

// Типы для статей
export interface Article {
  id: string;
  translations: Translation[];
  subCategoryId: string; // для обратной совместимости в UI
  subCategories: SubCategory[]; // как возвращает API
  images: ArticleImage[];
  content?: string;
}

// Типы для пользователей
export interface UserType {
  id: string;
  name: string;
  email: string;
  image?: string;
  country?: string;
  createdAt: string;
}

// Типы для аквариума
export enum AquariumType {
  FRESHWATER = "FRESHWATER",
  SALTWATER = "SALTWATER",
  PALUDARIUM = "PALUDARIUM",
}

// Типы для подтипов
export enum Subtype {
  FISHS = "FISHS",
  REPTILES = "REPTILES",
  AMPHIBIANS = "AMPHIBIANS",
  TURTLES = "TURTLES",
  FROGS = "FROGS",
  CORALS = "CORALS",
  PLANTS = "PLANTS",
  SHRIMPS = "SHRIMPS",
  CRAYFISH = "CRAYFISH",
  CRABS = "CRABS",
  SNAILS = "SNAILS",
  STARFISHS = "STARFISHS",
}

// Типы для обитателей
export interface Inhabitant {
  id: string;
  translations: Translation[];
  type: AquariumType;
  subtype: Subtype;
  images: string[];
}

// Типы для запросов создания
export interface CreateCategoryRequest {
  translations: {
    az: { title: string; description?: string };
    ru: { title: string; description?: string };
    en: { title: string; description?: string };
  };
}

export interface UpdateCategoryRequest {
  id: string;
  translations: {
    az: { title: string; description?: string };
    ru: { title: string; description?: string };
    en: { title: string; description?: string };
  };
}

export interface CreateSubCategoryRequest {
  translations: {
    az: { title: string; description?: string };
    ru: { title: string; description?: string };
    en: { title: string; description?: string };
  };
  categoryIds: string[];
}

export interface UpdateSubCategoryRequest {
  id: string;
  translations: {
    az: { title: string; description?: string };
    ru: { title: string; description?: string };
    en: { title: string; description?: string };
  };
  categoryIds: string[];
}

export interface CreateArticleRequest {
  subCategoryIds: string[]; // согласно API docs
  translations: {
    az: { title: string; description?: string };
    ru: { title: string; description?: string };
    en: { title: string; description?: string };
  };
  images: string[];
  content?: string; // опционально - возможно API не поддерживает
}

export interface UpdateArticleRequest {
  id: string;
  subCategoryIds: string[]; // согласно API docs
  translations: {
    az: { title: string; description?: string };
    ru: { title: string; description?: string };
    en: { title: string; description?: string };
  };
  images: string[];
  content?: string; // опционально - возможно API не поддерживает
}

export interface CreateInhabitantRequest {
  type: AquariumType;
  subtype: Subtype;
  translations: {
    az: { title: string; description?: string };
    ru: { title: string; description?: string };
    en: { title: string; description?: string };
  };
  images: string[];
}

export interface UpdateInhabitantRequest {
  id: string;
  type: AquariumType;
  subtype: Subtype;
  translations: {
    az: { title: string; description?: string };
    ru: { title: string; description?: string };
    en: { title: string; description?: string };
  };
  images: string[];
}
