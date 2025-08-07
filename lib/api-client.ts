// API Client для AquaDaddy Dashboard
export interface ApiResponse<T> {
  statusCode: number
  statusMessage: string
  data?: T
  error?: string
}

// Базовые интерфейсы для переводов
export interface Translation {
  id?: string
  locale: 'az' | 'ru' | 'en'
  title: string
  description?: string
}

// Категории
export interface Category {
  id: string
  translations: Translation[]
  subCategories?: SubCategory[]
}

export interface CreateCategoryRequest {
  translations: {
    az: { title: string; description?: string }
    ru: { title: string; description?: string }
    en: { title: string; description?: string }
  }
}

export interface UpdateCategoryRequest {
  id: string
  translations: {
    az: { title: string; description?: string }
    ru: { title: string; description?: string }
    en: { title: string; description?: string }
  }
}

// Подкатегории
export interface SubCategory {
  id: string
  translations: Translation[]
  categoryId: string[]
  article?: Article[]
}

export interface CreateSubCategoryRequest {
  translations: {
    az: { title: string; description?: string }
    ru: { title: string; description?: string }
    en: { title: string; description?: string }
  }
  categoryId: string[]
}

export interface UpdateSubCategoryRequest {
  id: string
  translations: {
    az: { title: string; description?: string }
    ru: { title: string; description?: string }
    en: { title: string; description?: string }
  }
  categoryId: string[]
}

// Статьи
export interface ArticleImage {
  id: string
  url: string
  uploadedAt: string
}

export interface Article {
  id: string
  subCategoryId: string
  translations: Translation[]
  subCategory?: {
    id: string
    title: string
    description: string
  }
  images: ArticleImage[]
  content?: string // EditorJS контент
}

export interface CreateArticleRequest {
  subCategoryId: string
  translations: {
    az: { title: string; description?: string }
    ru: { title: string; description?: string }
    en: { title: string; description?: string }
  }
  images?: string[]
  content?: string // EditorJS контент
}

export interface UpdateArticleRequest {
  id: string
  subCategoryId: string
  translations: {
    az: { title: string; description?: string }
    ru: { title: string; description?: string }
    en: { title: string; description?: string }
  }
  images?: string[]
  content?: string // EditorJS контент
}

// 🐠 Обитатели
export enum AquariumType {
  FRESHWATER = 'FRESHWATER',
  SALTWATER = 'SALTWATER',
  PALUDARIUM = 'PALUDARIUM'
}

export enum Subtype {
  FISHS = 'FISHS',
  REPTILES = 'REPTILES',
  AMPHIBIANS = 'AMPHIBIANS',
  TURTLES = 'TURTLES',
  FROGS = 'FROGS',
  CORALS = 'CORALS',
  PLANTS = 'PLANTS',
  SHRIMPS = 'SHRIMPS',
  CRAYFISH = 'CRAYFISH',
  CRABS = 'CRABS',
  SNAILS = 'SNAILS',
  STARFISHS = 'STARFISHS'
}

export interface Inhabitant {
  id: string
  translations: Translation[]
  type: AquariumType
  subtype: Subtype
  images: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateInhabitantRequest {
  translations: {
    az: { title: string; description?: string }
    ru: { title: string; description?: string }
    en: { title: string; description?: string }
  }
  type: AquariumType
  subtype: Subtype
  images: string[]
}

export interface UpdateInhabitantRequest {
  id: string
  translations: {
    az: { title: string; description?: string }
    ru: { title: string; description?: string }
    en: { title: string; description?: string }
  }
  type: AquariumType
  subtype: Subtype
  images: string[]
}

// Токены
export interface TokenResponse {
  statusCode: number
  statusMessage: string
  tokens: {
    adminToken: string
    readToken: string
  }
  instructions: {
    adminToken: string
    readToken: string
    nextSteps: string[]
  }
}

// Фильтры
export interface ArticleFilters {
  locale?: string
  subCategoryId?: string
}

export interface InhabitantFilters {
  locale?: string
  type?: AquariumType
  subtype?: Subtype
}

// Пользователи
export interface User {
  id: string
  name: string
  email: string
  image?: string
  country?: string
  createdAt: string
  updatedAt: string
}

export interface UsersResponse {
  users: User[]
  totalCount: number
}

export interface DeleteUserRequest {
  userId: string
}

export interface DeleteUserResponse {
  message: string
  deletedUser: {
    id: string
    name: string
    email: string
  }
}

class ApiClient {
  private baseUrl: string
  private adminToken: string | null = null
  private readToken: string | null = null

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://aqua-wiki-backend.vercel.app'
    this.adminToken = process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY || null
    this.readToken = process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY || null
  }

  // Получение токена из переменных окружения
  private getAdminToken(): string | null {
    const token = process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY || this.adminToken
   
    return token
  }

  private getReadToken(): string | null {
    const token = process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY || this.readToken

    return token
  }

  private async request<T>(
    endpoint: string, 
    options?: RequestInit & { useAdminToken?: boolean }
  ): Promise<ApiResponse<T>> {
    try {
      const token = options?.useAdminToken ? this.getAdminToken() : this.getReadToken()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options?.headers as Record<string, string> || {}),
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers,
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      return {
        statusCode: 500,
        statusMessage: 'Error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // 🔐 Аутентификация
  async generateTokens(): Promise<ApiResponse<TokenResponse>> {
    return this.request<TokenResponse>('/tokens/generate', {
      method: 'POST'
    })
  }

  // 📂 Категории
  async getCategories(locale: string = 'ru'): Promise<ApiResponse<Category[]>> {
    return this.request<Category[]>(`/categories?locale=${locale}`)
  }

  async createCategory(category: CreateCategoryRequest): Promise<ApiResponse<{ categoryId: string }>> {
    return this.request<{ categoryId: string }>('/categories/category', {
      method: 'POST',
      body: JSON.stringify(category),
      useAdminToken: true
    })
  }

  async updateCategory(category: UpdateCategoryRequest): Promise<ApiResponse<void>> {
    return this.request<void>('/categories/category', {
      method: 'PATCH',
      body: JSON.stringify(category),
      useAdminToken: true
    })
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/categories/category/${id}`, {
      method: 'DELETE',
      useAdminToken: true
    })
  }

  // 📁 Подкатегории
  async getSubCategories(locale: string = 'ru'): Promise<ApiResponse<SubCategory[]>> {
    return this.request<SubCategory[]>(`/subcategories?locale=${locale}`)
  }

  async createSubCategory(subCategory: CreateSubCategoryRequest): Promise<ApiResponse<{ subCategoryId: string }>> {
    return this.request<{ subCategoryId: string }>('/subcategories/subcategory', {
      method: 'POST',
      body: JSON.stringify(subCategory),
      useAdminToken: true
    })
  }

  async updateSubCategory(subCategory: UpdateSubCategoryRequest): Promise<ApiResponse<void>> {
    return this.request<void>('/subcategories/subcategory', {
      method: 'PATCH',
      body: JSON.stringify(subCategory),
      useAdminToken: true
    })
  }

  async deleteSubCategory(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/subcategories/subcategory/${id}`, {
      method: 'DELETE',
      useAdminToken: true
    })
  }

  // 📄 Статьи
  async getArticles(filters?: ArticleFilters): Promise<ApiResponse<Article[]>> {
    const params = new URLSearchParams()
    if (filters?.locale) params.append('locale', filters.locale)
    if (filters?.subCategoryId) params.append('subCategoryId', filters.subCategoryId)
    
    const queryString = params.toString()
    return this.request<Article[]>(`/articles${queryString ? `?${queryString}` : ''}`)
  }

  async getArticle(id: string, locale: string = 'ru'): Promise<ApiResponse<Article>> {
    return this.request<Article>(`/articles/article/${id}?locale=${locale}`)
  }

  async createArticle(article: CreateArticleRequest): Promise<ApiResponse<{ articleId: string }>> {
    return this.request<{ articleId: string }>('/articles/article', {
      method: 'POST',
      body: JSON.stringify(article),
      useAdminToken: true
    })
  }

  async updateArticle(article: UpdateArticleRequest): Promise<ApiResponse<void>> {
    return this.request<void>('/articles/article', {
      method: 'PATCH',
      body: JSON.stringify(article),
      useAdminToken: true
    })
  }

  async deleteArticle(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/articles/article/${id}`, {
      method: 'DELETE',
      useAdminToken: true
    })
  }

  // 🐠 Обитатели
  async getInhabitants(filters?: InhabitantFilters): Promise<ApiResponse<Inhabitant[]>> {
    const params = new URLSearchParams()
    if (filters?.locale) params.append('locale', filters.locale)
    if (filters?.type) params.append('type', filters.type)
    
    const queryString = params.toString()
    return this.request<Inhabitant[]>(`/inhabitants${queryString ? `?${queryString}` : ''}`)
  }

  async getInhabitant(id: string, locale: string = 'ru'): Promise<ApiResponse<Inhabitant>> {
    return this.request<Inhabitant>(`/inhabitants/inhabitant/${id}?locale=${locale}`)
  }

  async createInhabitant(inhabitant: CreateInhabitantRequest): Promise<ApiResponse<{ inhabitantId: string }>> {
    return this.request<{ inhabitantId: string }>('/inhabitants/inhabitant', {
      method: 'POST',
      body: JSON.stringify(inhabitant),
      useAdminToken: true
    })
  }

  async updateInhabitant(inhabitant: UpdateInhabitantRequest): Promise<ApiResponse<void>> {
    return this.request<void>('/inhabitants/inhabitant', {
      method: 'PATCH',
      body: JSON.stringify(inhabitant),
      useAdminToken: true
    })
  }

  async deleteInhabitant(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/inhabitants/inhabitant/${id}`, {
      method: 'DELETE',
      useAdminToken: true
    })
  }

  // 👥 Пользователи
  async getUsers(page: number = 1, limit: number = 10, search?: string): Promise<ApiResponse<UsersResponse>> {
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('limit', limit.toString())

    if (search) params.append('search', search)

    // Используем локальный API роут для избежания CORS проблем
    const response = await fetch(`/api/users?${params.toString()}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return {
      statusCode: response.status,
      statusMessage: response.statusText,
      data,
      error: undefined
    }
  }

  async deleteUser(userId: string): Promise<ApiResponse<DeleteUserResponse>> {
    // Используем локальный API роут для избежания CORS проблем
    const response = await fetch('/api/users', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return {
      statusCode: response.status,
      statusMessage: response.statusText,
      data,
      error: undefined
    }
  }
}

export const apiClient = new ApiClient()
