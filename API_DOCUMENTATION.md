# AquaWiki API - Полная документация

## Обзор

AquaWiki API - это RESTful API для управления контентом базы знаний о водных обитателях. API поддерживает мультиязычность (азербайджанский, русский, английский) и предоставляет полный набор CRUD операций для категорий, подкатегорий и статей.

## Быстрый старт

### Базовый URL

```
https://aqua-wiki-backend.vercel.app/docs
```

### Аутентификация

API использует Bearer токены. Добавьте заголовок:

```
Authorization: Bearer YOUR_TOKEN
```

### Поддерживаемые языки

- `az` - Азербайджанский
- `ru` - Русский (по умолчанию)
- `en` - Английский

## Коды ответов

| Код | Описание                  |
| --- | ------------------------- |
| 200 | Успешный запрос           |
| 201 | Создано                   |
| 400 | Неверный запрос           |
| 401 | Не авторизован            |
| 403 | Доступ запрещен           |
| 404 | Не найдено                |
| 500 | Внутренняя ошибка сервера |

## Эндпоинты

### 🔐 Аутентификация

#### Генерация токенов

```http
POST /tokens/generate
```

**Описание**: Генерирует новые админский и читательский токены.

**Ответ**:

```json
{
  "statusCode": 200,
  "statusMessage": "Tokens generated successfully",
  "tokens": {
    "adminToken": "generated_admin_token",
    "readToken": "generated_read_token"
  },
  "instructions": {
    "adminToken": "Используйте для создания, обновления и удаления контента",
    "readToken": "Используйте для чтения контента",
    "nextSteps": [
      "Скопируйте токены в переменные окружения",
      "ADMIN_TOKEN=ваш_админский_токен",
      "READ_TOKEN=ваш_токен_чтения",
      "Перезапустите сервер"
    ]
  }
}
```

### 📂 Категории

#### Получить все категории

```http
GET /categories?locale=ru
```

**Параметры**:

- `locale` (опционально) - язык для переводов (`az`, `ru`, `en`)

**Ответ**:

```json
{
  "statusCode": 200,
  "statusMessage": "Success",
  "categories": [
    {
      "id": "category_id",
      "translations": [
        {
          "id": "translation_id",
          "locale": "ru",
          "title": "Рыба",
          "description": "О рыбе"
        }
      ]
    }
  ]
}
```

#### Создать категорию

```http
POST /categories/category
Authorization: Bearer ADMIN_TOKEN
```

**Тело запроса**:

```json
{
  "translations": {
    "az": {
      "title": "Balıq",
      "description": "Balıq haqqında"
    },
    "ru": {
      "title": "Рыба",
      "description": "О рыбе"
    },
    "en": {
      "title": "Fish",
      "description": "About fish"
    }
  }
}
```

**Ответ**:

```json
{
  "statusCode": 200,
  "statusMessage": "Created",
  "categoryId": "new_category_id"
}
```

#### Обновить категорию

```http
PATCH /categories/category
Authorization: Bearer ADMIN_TOKEN
```

**Тело запроса**:

```json
{
  "id": "category_id",
  "translations": {
    "az": {
      "title": "Yeni Balıq",
      "description": "Yeni balıq haqqında"
    },
    "ru": {
      "title": "Новая рыба",
      "description": "О новой рыбе"
    },
    "en": {
      "title": "New Fish",
      "description": "About new fish"
    }
  }
}
```

#### Удалить категорию

```http
DELETE /categories/category/{id}
Authorization: Bearer ADMIN_TOKEN
```

### 📁 Подкатегории

#### Получить все подкатегории

```http
GET /subcategories?locale=ru
```

**Параметры**:

- `locale` (опционально) - язык для переводов

**Ответ**:

```json
{
  "statusCode": 200,
  "statusMessage": "Success",
  "subcategories": [
    {
      "id": "subcategory_id",
      "translations": [
        {
          "id": "translation_id",
          "locale": "ru",
          "title": "Морская рыба",
          "description": "О морской рыбе"
        }
      ]
    }
  ]
}
```

#### Создать подкатегорию

```http
POST /subcategories/subcategory
Authorization: Bearer ADMIN_TOKEN
```

**Тело запроса**:

```json
{
  "translations": {
    "az": {
      "title": "Dəniz balığı",
      "description": "Dəniz balığı haqqında"
    },
    "ru": {
      "title": "Морская рыба",
      "description": "О морской рыбе"
    },
    "en": {
      "title": "Sea fish",
      "description": "About sea fish"
    }
  },
  "categoryId": ["category_id_1", "category_id_2"]
}
```

#### Обновить подкатегорию

```http
PATCH /subcategories/subcategory
Authorization: Bearer ADMIN_TOKEN
```

**Тело запроса**:

```json
{
  "id": "subcategory_id",
  "translations": {
    "az": {
      "title": "Yeni dəniz balığı",
      "description": "Yeni dəniz balığı haqqında"
    },
    "ru": {
      "title": "Новая морская рыба",
      "description": "О новой морской рыбе"
    },
    "en": {
      "title": "New sea fish",
      "description": "About new sea fish"
    }
  },
  "categoryId": ["new_category_id"]
}
```

#### Удалить подкатегорию

```http
DELETE /subcategories/subcategory/{id}
Authorization: Bearer ADMIN_TOKEN
```

### 📄 Статьи

#### Получить все статьи

```http
GET /articles?locale=ru&subCategoryId=subcategory_id
```

**Параметры**:

- `locale` (опционально) - язык для переводов
- `subCategoryId` (опционально) - фильтр по подкатегории

**Ответ**:

```json
{
  "statusCode": 200,
  "statusMessage": "Success",
  "articles": [
    {
      "id": "article_id",
      "subCategoryId": "subcategory_id",
      "title": "Виды рыб",
      "description": "О различных видах рыб",
      "subCategory": {
        "id": "subcategory_id",
        "title": "Морская рыба",
        "description": "О морской рыбе"
      },
      "images": [
        {
          "id": "image_id",
          "url": "https://example.com/image.jpg",
          "uploadedAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  ]
}
```

### 🐠 Обитатели

#### Получить всех обитателей

```http
GET /inhabitants?locale=ru&type=fish
```

**Параметры**:

- `locale` (опционально) - язык для переводов (`az`, `ru`, `en`)
- `type` (опционально) - фильтр по типу обитателя

**Ответ**:

```json
{
  "statusCode": 200,
  "statusMessage": "Success",
  "inhabitants": [
    {
      "id": "inhabitant_id",
      "type": ["fish", "marine"],
      "subtype": "tropical",
      "title": "Тропическая рыба",
      "imageUrl": "https://example.com/fish.jpg",
      "articleUrl": "https://example.com/article"
    }
  ]
}
```

#### Получить обитателя по ID

```http
GET /inhabitants/inhabitant/{id}?locale=ru
```

**Параметры**:

- `id` - ID обитателя
- `locale` (опционально) - язык для переводов

**Ответ**:

```json
{
  "statusCode": 200,
  "statusMessage": "Success",
  "inhabitant": {
    "id": "inhabitant_id",
    "type": ["fish", "marine"],
    "subtype": "tropical",
    "title": "Тропическая рыба",
    "imageUrl": "https://example.com/fish.jpg",
    "articleUrl": "https://example.com/article"
  }
}
```

#### Создать обитателя

```http
POST /inhabitants/inhabitant
Authorization: Bearer ADMIN_TOKEN
```

**Тело запроса**:

```json
{
  "type": ["fish", "marine"],
  "subtype": "tropical",
  "translations": {
    "az": {
      "title": "Tropik balıq"
    },
    "ru": {
      "title": "Тропическая рыба"
    },
    "en": {
      "title": "Tropical fish"
    }
  },
  "imageUrl": "https://example.com/fish.jpg",
  "articleUrl": "https://example.com/article"
}
```

**Ответ**:

```json
{
  "statusCode": 200,
  "statusMessage": "Created",
  "inhabitantId": "new_inhabitant_id"
}
```

#### Обновить обитателя

```http
PATCH /inhabitants/inhabitant
Authorization: Bearer ADMIN_TOKEN
```

**Тело запроса**:

```json
{
  "id": "inhabitant_id",
  "type": ["fish", "freshwater"],
  "subtype": "coldwater",
  "translations": {
    "az": {
      "title": "Yeni tropik balıq"
    },
    "ru": {
      "title": "Новая тропическая рыба"
    },
    "en": {
      "title": "New tropical fish"
    }
  },
  "imageUrl": "https://example.com/new_fish.jpg",
  "articleUrl": "https://example.com/new_article"
}
```

#### Удалить обитателя

```http
DELETE /inhabitants/inhabitant/{id}
Authorization: Bearer ADMIN_TOKEN
```

#### Получить статью по ID

```http
GET /articles/article/{id}?locale=ru
```

**Параметры**:

- `id` - ID статьи
- `locale` (опционально) - язык для переводов

#### Создать статью

```http
POST /articles/article
Authorization: Bearer ADMIN_TOKEN
```

**Тело запроса**:

```json
{
  "subCategoryId": "subcategory_id",
  "translations": {
    "az": {
      "title": "Balıq növləri",
      "description": "Müxtəlif balıq növləri haqqında"
    },
    "ru": {
      "title": "Виды рыб",
      "description": "О различных видах рыб"
    },
    "en": {
      "title": "Fish species",
      "description": "About different fish species"
    }
  },
  "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
}
```

#### Обновить статью

```http
PATCH /articles/article
Authorization: Bearer ADMIN_TOKEN
```

**Тело запроса**:

```json
{
  "id": "article_id",
  "subCategoryId": "new_subcategory_id",
  "translations": {
    "az": {
      "title": "Yeni balıq növləri",
      "description": "Yeni müxtəlif balıq növləri haqqında"
    },
    "ru": {
      "title": "Новые виды рыб",
      "description": "О новых различных видах рыб"
    },
    "en": {
      "title": "New fish species",
      "description": "About new different fish species"
    }
  },
  "images": ["https://example.com/new_image.jpg"]
}
```

#### Удалить статью

```http
DELETE /articles/article/{id}
Authorization: Bearer ADMIN_TOKEN
```

## Схема базы данных

### Модели

#### Categories

- `id` (String, Primary Key) - уникальный идентификатор
- `translations` (TranslationCategory[]) - переводы категории
- `subCategories` (SubCategories[]) - связанные подкатегории

#### SubCategories

- `id` (String, Primary Key) - уникальный идентификатор
- `translations` (TranslationSubCategory[]) - переводы подкатегории
- `categories` (Categories[]) - связанные категории
- `article` (Article[]) - связанные статьи

#### Article

- `id` (String, Primary Key) - уникальный идентификатор
- `subCategoryId` (String) - ID подкатегории
- `translations` (TranslationArticle[]) - переводы статьи
- `articleImages` (ArticleImages[]) - изображения статьи

#### TranslationCategory

- `id` (String, Primary Key)
- `locale` (String) - язык (az, ru, en)
- `title` (String) - заголовок
- `description` (String) - описание
- `categoryId` (String) - ID категории

#### TranslationSubCategory

- `id` (String, Primary Key)
- `locale` (String) - язык
- `title` (String) - заголовок
- `description` (String) - описание
- `subCategoryId` (String) - ID подкатегории

#### TranslationArticle

- `id` (String, Primary Key)
- `locale` (String) - язык
- `title` (String) - заголовок
- `description` (String) - описание
- `articleId` (String) - ID статьи

#### ArticleImages

- `id` (String, Primary Key)
- `articleId` (String) - ID статьи
- `url` (String) - URL изображения
- `uploadedAt` (DateTime) - дата загрузки

#### Inhabitant

- `id` (String, Primary Key) - уникальный идентификатор
- `type` (String[]) - типы обитателя (массив)
- `subtype` (String) - подтип обитателя
- `translations` (TranslationInhabitant[]) - переводы обитателя
- `imageUrl` (String) - URL изображения обитателя
- `articleUrl` (String) - URL статьи об обитателе

#### TranslationInhabitant

- `id` (String, Primary Key)
- `locale` (String) - язык (az, ru, en)
- `title` (String) - заголовок
- `inhabitantId` (String) - ID обитателя

## Примеры использования

### Создание полной структуры контента

1. **Создание категории**:

```bash
curl -X POST http://localhost:3000/categories/category \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "translations": {
      "az": {"title": "Balıq", "description": "Balıq haqqında"},
      "ru": {"title": "Рыба", "description": "О рыбе"},
      "en": {"title": "Fish", "description": "About fish"}
    }
  }'
```

2. **Создание подкатегории**:

```bash
curl -X POST http://localhost:3000/subcategories/subcategory \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "translations": {
      "az": {"title": "Dəniz balığı", "description": "Dəniz balığı haqqında"},
      "ru": {"title": "Морская рыба", "description": "О морской рыбе"},
      "en": {"title": "Sea fish", "description": "About sea fish"}
    },
    "categoryId": ["category_id_from_step_1"]
  }'
```

3. **Создание статьи**:

```bash
curl -X POST http://localhost:3000/articles/article \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subCategoryId": "subcategory_id_from_step_2",
    "translations": {
      "az": {"title": "Balıq növləri", "description": "Müxtəlif balıq növləri haqqında"},
      "ru": {"title": "Виды рыб", "description": "О различных видах рыб"},
      "en": {"title": "Fish species", "description": "About different fish species"}
    },
    "images": ["https://example.com/fish1.jpg", "https://example.com/fish2.jpg"]
  }'
```

4. **Создание обитателя**:

```bash
curl -X POST http://localhost:3000/inhabitants/inhabitant \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": ["fish", "marine"],
    "subtype": "tropical",
    "translations": {
      "az": {"title": "Tropik balıq"},
      "ru": {"title": "Тропическая рыба"},
      "en": {"title": "Tropical fish"}
    },
    "imageUrl": "https://example.com/fish.jpg",
    "articleUrl": "https://example.com/article"
  }'
```

### Получение контента

**Получение всех категорий на русском языке**:

```bash
curl http://localhost:3000/categories?locale=ru
```

**Получение статей конкретной подкатегории**:

```bash
curl "http://localhost:3000/articles?subCategoryId=subcategory_id&locale=ru"
```

**Получение конкретной статьи**:

```bash
curl "http://localhost:3000/articles/article/article_id?locale=ru"
```

**Получение всех обитателей**:

```bash
curl "http://localhost:3000/inhabitants?locale=ru"
```

**Получение обитателей определенного типа**:

```bash
curl "http://localhost:3000/inhabitants?type=fish&locale=ru"
```

**Получение конкретного обитателя**:

```bash
curl "http://localhost:3000/inhabitants/inhabitant/inhabitant_id?locale=ru"
```

## Обработка ошибок

Все ошибки возвращаются в едином формате:

```json
{
  "statusCode": 400,
  "statusMessage": "Bad Request",
  "error": "Описание ошибки"
}
```

### Частые ошибки

- **401 Unauthorized**: Отсутствует или неверный токен аутентификации
- **403 Forbidden**: Недостаточно прав для выполнения операции
- **404 Not Found**: Запрашиваемый ресурс не найден
- **500 Internal Server Error**: Внутренняя ошибка сервера

## Ограничения

- Максимальный размер запроса: 10MB
- Поддерживаемые форматы изображений: JPG, PNG, GIF, WebP
- Максимальное количество изображений на статью: 10
- Длина заголовка: до 255 символов
- Длина описания: до 1000 символов

## Версионирование

Текущая версия API: **2.0.0**

Изменения в API будут документироваться в changelog и сопровождаться увеличением версии.

## Поддержка

Для получения поддержки:

- Email: support@aquawiki.com
- Документация: http://localhost:3000/docs
- GitHub Issues: [ссылка на репозиторий]
