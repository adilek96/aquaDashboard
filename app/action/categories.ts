'use server'

const adminToken = process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
const apiUrl = process.env.API_URL

export async function getCategories(locale?: string) {
    try {
        if (!apiUrl) {
            throw new Error('API_URL не настроен');
        }

        // Строим URL с параметрами
        let url = `${apiUrl}/categories`;
        if (locale) {
            url += `?locale=${locale}`;
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
            data: data.categories || data,
            error: null
        };
    } catch (error) {
        console.error('Error fetching categories:', error);
        return {
            statusCode: 500,
            data: null,
            error: error instanceof Error ? error.message : 'Failed to fetch categories'
        };
    }
}

// ------------------------------------------------------------








export async function createCategory(body: any) {
    try {
        const response = await fetch(`${apiUrl}/categories/category`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            body: JSON.stringify(body)
        })
        if (!response.ok) {
            throw new Error('Failed to create category')
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error creating category:', error)
        return {
            error: 'Failed to create category'
        }
    }
}


// ------------------------------------------------------------








export async function updateCategory(body: any) {
    try {
        const response = await fetch(`${apiUrl}/categories/category`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            body: JSON.stringify(body)
        })
        if (!response.ok) {
            throw new Error('Failed to update category')
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error updating category:', error)
        return {
            error: 'Failed to update category'
        }
    }       
}


// ------------------------------------------------------------


export async function deleteCategory(id: string) {
    
    try {
        const response = await fetch(`${apiUrl}/categories/category/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              }
        })
       
        if (!response.ok) {
            throw new Error('Failed to delete category')
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error deleting category:', error)
        return {
            error: 'Failed to delete category'
        }
    }
}

