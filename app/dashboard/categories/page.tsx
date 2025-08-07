"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search, Edit, Trash2, FolderOpen, Languages } from 'lucide-react'
import { apiClient, type Category, type CreateCategoryRequest, type UpdateCategoryRequest } from '@/lib/api-client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    az: { title: '', description: '' },
    ru: { title: '', description: '' },
    en: { title: '', description: '' }
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await apiClient.getCategories('ru')
      if (response.statusCode === 200 && response.data) {
        setCategories(response.data)
      } else {
        throw new Error(response.error || 'Ошибка загрузки категорий')
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить категории",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const categoryData: CreateCategoryRequest = {
        translations: formData
      }
      const response = await apiClient.createCategory(categoryData)
      if (response.statusCode === 200) {
        toast({
          title: "Успешно",
          description: "Категория создана",
        })
        setIsCreateDialogOpen(false)
        resetForm()
        fetchCategories()
      } else {
        throw new Error(response.error || 'Ошибка создания категории')
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать категорию",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async () => {
    if (!editingCategory) return

    try {
      const categoryData: UpdateCategoryRequest = {
        id: editingCategory.id,
        translations: formData
      }
      const response = await apiClient.updateCategory(categoryData)
      if (response.statusCode === 200) {
        toast({
          title: "Успешно",
          description: "Категория обновлена",
        })
        setIsEditDialogOpen(false)
        resetForm()
        fetchCategories()
      } else {
        throw new Error(response.error || 'Ошибка обновления категории')
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить категорию",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return

    try {
      const response = await apiClient.deleteCategory(id)
      if (response.statusCode === 200) {
        toast({
          title: "Успешно",
          description: "Категория удалена",
        })
        fetchCategories()
      } else {
        throw new Error(response.error || 'Ошибка удаления категории')
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить категорию",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    
    // Заполняем форму данными категории
    const ruTranslation = category.translations.find(t => t.locale === 'ru')
    const azTranslation = category.translations.find(t => t.locale === 'az')
    const enTranslation = category.translations.find(t => t.locale === 'en')
    
    setFormData({
      ru: {
        title: ruTranslation?.title || '',
        description: ruTranslation?.description || ''
      },
      az: {
        title: azTranslation?.title || '',
        description: azTranslation?.description || ''
      },
      en: {
        title: enTranslation?.title || '',
        description: enTranslation?.description || ''
      }
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      az: { title: '', description: '' },
      ru: { title: '', description: '' },
      en: { title: '', description: '' }
    })
    setEditingCategory(null)
  }

  const filteredCategories = categories.filter(category => {
    const ruTranslation = category.translations.find(t => t.locale === 'ru')
    return ruTranslation?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           ruTranslation?.description?.toLowerCase().includes(searchTerm.toLowerCase())
  })

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
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Категории</h1>
          <p className="text-muted-foreground">
            Управляйте категориями контента
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Создать категорию
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Создать категорию</DialogTitle>
              <DialogDescription>
                Создайте новую категорию с переводами на трех языках
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
                      onChange={(e) => setFormData({
                        ...formData,
                        ru: { ...formData.ru, title: e.target.value }
                      })}
                      placeholder="Введите заголовок на русском"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ru-description">Описание (Русский)</Label>
                    <Textarea
                      id="ru-description"
                      value={formData.ru.description}
                      onChange={(e) => setFormData({
                        ...formData,
                        ru: { ...formData.ru, description: e.target.value }
                      })}
                      placeholder="Введите описание на русском"
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="az" className="space-y-4">
                  <div>
                    <Label htmlFor="az-title">Заголовок (Азербайджанский)</Label>
                    <Input
                      id="az-title"
                      value={formData.az.title}
                      onChange={(e) => setFormData({
                        ...formData,
                        az: { ...formData.az, title: e.target.value }
                      })}
                      placeholder="Введите заголовок на азербайджанском"
                    />
                  </div>
                  <div>
                    <Label htmlFor="az-description">Описание (Азербайджанский)</Label>
                    <Textarea
                      id="az-description"
                      value={formData.az.description}
                      onChange={(e) => setFormData({
                        ...formData,
                        az: { ...formData.az, description: e.target.value }
                      })}
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
                      onChange={(e) => setFormData({
                        ...formData,
                        en: { ...formData.en, title: e.target.value }
                      })}
                      placeholder="Введите заголовок на английском"
                    />
                  </div>
                  <div>
                    <Label htmlFor="en-description">Описание (Английский)</Label>
                    <Textarea
                      id="en-description"
                      value={formData.en.description}
                      onChange={(e) => setFormData({
                        ...formData,
                        en: { ...formData.en, description: e.target.value }
                      })}
                      placeholder="Введите описание на английском"
                      rows={3}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreate}>Создать категорию</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Поиск категорий..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredCategories.map((category) => {
          const ruTranslation = category.translations.find(t => t.locale === 'ru')
          const azTranslation = category.translations.find(t => t.locale === 'az')
          const enTranslation = category.translations.find(t => t.locale === 'en')
          
          return (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="w-5 h-5" />
                      {ruTranslation?.title || 'Без названия'}
                    </CardTitle>
                    <CardDescription>
                      {ruTranslation?.description || 'Без описания'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Languages className="w-3 h-3" />
                      {category.translations.length}/3
                    </Badge>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditDialog(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(category.id)}
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
                    <p className="text-muted-foreground">{ruTranslation?.title || 'Не переведено'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Азербайджанский</h4>
                    <p className="text-muted-foreground">{azTranslation?.title || 'Не переведено'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Английский</h4>
                    <p className="text-muted-foreground">{enTranslation?.title || 'Не переведено'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredCategories.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Категории не найдены
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? 'Попробуйте изменить поисковый запрос'
                  : 'Создайте первую категорию для начала работы'
                }
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Создать категорию
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать категорию</DialogTitle>
            <DialogDescription>
              Внесите изменения в категорию
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
                    onChange={(e) => setFormData({
                      ...formData,
                      ru: { ...formData.ru, title: e.target.value }
                    })}
                    placeholder="Введите заголовок на русском"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-ru-description">Описание (Русский)</Label>
                  <Textarea
                    id="edit-ru-description"
                    value={formData.ru.description}
                    onChange={(e) => setFormData({
                      ...formData,
                      ru: { ...formData.ru, description: e.target.value }
                    })}
                    placeholder="Введите описание на русском"
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="az" className="space-y-4">
                <div>
                  <Label htmlFor="edit-az-title">Заголовок (Азербайджанский)</Label>
                  <Input
                    id="edit-az-title"
                    value={formData.az.title}
                    onChange={(e) => setFormData({
                      ...formData,
                      az: { ...formData.az, title: e.target.value }
                    })}
                    placeholder="Введите заголовок на азербайджанском"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-az-description">Описание (Азербайджанский)</Label>
                  <Textarea
                    id="edit-az-description"
                    value={formData.az.description}
                    onChange={(e) => setFormData({
                      ...formData,
                      az: { ...formData.az, description: e.target.value }
                    })}
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
                    onChange={(e) => setFormData({
                      ...formData,
                      en: { ...formData.en, title: e.target.value }
                    })}
                    placeholder="Введите заголовок на английском"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-en-description">Описание (Английский)</Label>
                  <Textarea
                    id="edit-en-description"
                    value={formData.en.description}
                    onChange={(e) => setFormData({
                      ...formData,
                      en: { ...formData.en, description: e.target.value }
                    })}
                    placeholder="Введите описание на английском"
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleEdit}>Сохранить изменения</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
