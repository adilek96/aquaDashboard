"use server"

const adminToken = process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
const apiUrl = process.env.API_URL

export const getArticles = async (filters?: { locale?: string; subCategoryId?: string }) => {
    try {
        if (!apiUrl) {
            throw new Error('API_URL не настроен');
        }

        // Строим URL с параметрами
        let url = `${apiUrl}/articles`;
        const params = new URLSearchParams();
        
        if (filters?.locale) {
            params.append('locale', filters.locale);
        }
        if (filters?.subCategoryId) {
            params.append('subCategoryId', filters.subCategoryId);
        }
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });

        // Проверяем статус ответа
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`API вернул статус ${response.status}: ${errorText}`);
        }

        // Проверяем, что ответ действительно JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Неверный Content-Type:', contentType, 'Response:', text);
            throw new Error('API вернул не JSON ответ');
        }

        const data = await response.json();
        return {
            statusCode: 200,
            data: data.articles || data,
            error: null
        };
    } catch (error) {
        console.error('Error fetching articles:', error);
        return {
            statusCode: 500,
            data: null,
            error: error instanceof Error ? error.message : 'Failed to fetch articles'
        };
    }
};



// ------------------------------------------------------------






export const createArticle = async (body: any) => {
    console.log('createArticle', body);
    try {
        if (!apiUrl) {
            throw new Error('API_URL не настроен');
        }

        if (!adminToken) {
            throw new Error('ADMIN_TOKEN не настроен');
        }

        console.log('Создание статьи. API URL:', apiUrl);
        console.log('Данные для отправки:', body);

        const response = await fetch(`${apiUrl}/articles/article`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        console.log('Ответ сервера. Статус:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            
            // Пытаемся распарсить ошибку как JSON для более детального вывода
            let parsedError = errorText;
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.error) {
                    parsedError = JSON.stringify(errorJson.error, null, 2);
                }
            } catch (e) {
                // Если не JSON, оставляем как есть
            }
            
            return {
                statusCode: response.status,
                statusMessage: 'Error',
                articleId: null,
                error: `API вернул статус ${response.status}: ${parsedError}`
            };
        }

        const data = await response.json();
        console.log('Успешный ответ API:', data);
        
        return {
            statusCode: response.status === 201 ? 201 : (data.statusCode || 200),
            statusMessage: data.statusMessage || 'Success',
            articleId: data.articleId,
            error: null
        };
    } catch (error) {
        console.error('Error creating article:', error);
        return {
            statusCode: 500,
            statusMessage: 'Error',
            articleId: null,
            error: error instanceof Error ? error.message : 'Failed to create article'
        };
    }
}


// ------------------------------------------------------------






export const updateArticle = async (body: any) => {
    try {
        if (!apiUrl) {
            throw new Error('API_URL не настроен');
        }

        const response = await fetch(`${apiUrl}/articles/article`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`API вернул статус ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return {
            statusCode: data.statusCode || 200,
            statusMessage: data.statusMessage || 'Success',
            error: null
        };
    } catch (error) {
        console.error('Error updating article:', error);
        return {
            statusCode: 500,
            statusMessage: 'Error',
            error: error instanceof Error ? error.message : 'Failed to update article'
        };
    }
}



// ------------------------------------------------------------







export const getArticleById = async (id: string, locale: string = 'ru') => {
    try {
        if (!apiUrl) {
            throw new Error('API_URL не настроен');
        }

        const response = await fetch(`${apiUrl}/articles/article/${id}?locale=${locale}`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`API вернул статус ${response.status}: ${errorText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Неверный Content-Type:', contentType, 'Response:', text);
            throw new Error('API вернул не JSON ответ');
        }

        const data = await response.json();
        return {
            statusCode: data.statusCode || 200,
            data: data.article || data,
            error: null
        };
    } catch (error) {
        console.error('Error fetching article:', error);
        return {
            statusCode: 500,
            data: null,
            error: error instanceof Error ? error.message : 'Failed to fetch article'
        };
    }
};

export const deleteArticle = async (id: string) => {
    try {
        if (!apiUrl) {
            throw new Error('API_URL не настроен');
        }

        const response = await fetch(`${apiUrl}/articles/article/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
       
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`API вернул статус ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return {
            statusCode: data.statusCode || 200,
            statusMessage: data.statusMessage || 'Success',
            error: null
        };
    } catch (error) {
        console.error('Error deleting article:', error);
        return {
            statusCode: 500,
            statusMessage: 'Error',
            error: error instanceof Error ? error.message : 'Failed to delete article'
        };
    }
};