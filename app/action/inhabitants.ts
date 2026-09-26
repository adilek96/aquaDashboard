'use server'

// ADMIN_TOKEN — тот самый ключ, который проверяет вики.
// NEXT_SERVER_ACTIONS_ENCRYPTION_KEY — переменная Next для шифрования
// server actions, к авторизации отношения не имеет; оставлен запасным
// вариантом для окружений, где переменную ещё не переименовали.
const adminToken = process.env.ADMIN_TOKEN ?? process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
const apiUrl = process.env.API_URL

export async function getInhabitants() {
    try {
        if (!apiUrl) {
            throw new Error('API_URL не настроен');
        }

        const response = await fetch(`${apiUrl}/inhabitants?all=1`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });

        // Проверяем статус ответа
        if (!response.ok) {
            const errorText = await response.text();
          
            throw new Error(`API вернул статус ${response.status}: ${errorText}`);
        }

        // Проверяем, что ответ действительно JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error('API вернул не JSON ответ');
        }

        const data = await response.json();
        return {
            statusCode: 200,
            data: data.inhabitants || data,
            error: null
        };
    } catch (error) {
        console.error('Error fetching inhabitants:', error);
        return {
            statusCode: 500,
            data: null,
            error: error instanceof Error ? error.message : 'Failed to fetch inhabitants'
        };
    }
}

// Один обитатель со всеми переводами и разделами — для формы редактирования.
// Список отдаёт разделы без текста, а сохранение формы перезаписывает все языки.
export async function getInhabitant(id: string) {
    try {
        if (!apiUrl) {
            throw new Error('API_URL не настроен');
        }

        const response = await fetch(`${apiUrl}/inhabitants/inhabitant/${encodeURIComponent(id)}?all=1`, {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API вернул статус ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return { statusCode: 200, data: data.inhabitant, error: null };
    } catch (error) {
        console.error('Error fetching inhabitant:', error);
        return {
            statusCode: 500,
            data: null,
            error: error instanceof Error ? error.message : 'Failed to fetch inhabitant'
        };
    }
}

// ------------------------------------------------------------








export async function createInhabitant(body: any) {
    
    try {
        if (!apiUrl) {
            throw new Error('API_URL не настроен');
        }

        const response = await fetch(`${apiUrl}/inhabitants/inhabitant`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        // Проверяем статус ответа
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API вернул статус ${response.status}: ${errorText}`);
        }

        // Проверяем, что ответ действительно JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error('API вернул не JSON ответ');
        }

        const data = await response.json();
        return {
            statusCode: 200,
            data: data,
            error: null
        };
    } catch (error) {
        console.error('Error creating inhabitant:', error);
        return {
            statusCode: 500,
            data: null,
            error: error instanceof Error ? error.message : 'Failed to create inhabitant'
        };
    }
}


// ------------------------------------------------------------








export async function updateInhabitant(body: any) {
    try {
        if (!apiUrl) {
            throw new Error('API_URL не настроен');
        }

        const response = await fetch(`${apiUrl}/inhabitants/inhabitant`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        // Проверяем статус ответа
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API вернул статус ${response.status}: ${errorText}`);
        }

        // Проверяем, что ответ действительно JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error('API вернул не JSON ответ');
        }

        const data = await response.json();
        return {
            statusCode: 200,
            data: data,
            error: null
        };
    } catch (error) {
        console.error('Error updating inhabitant:', error);
        return {
            statusCode: 500,
            data: null,
            error: error instanceof Error ? error.message : 'Failed to update inhabitant'
        };
    }
}


// ------------------------------------------------------------


export async function deleteInhabitant(id: string) {
    try {
        if (!apiUrl) {
            throw new Error('API_URL не настроен');
        }

        const response = await fetch(`${apiUrl}/inhabitants/inhabitant/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });

        // Проверяем статус ответа
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API вернул статус ${response.status}: ${errorText}`);
        }

        // Проверяем, что ответ действительно JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error('API вернул не JSON ответ');
        }

        const data = await response.json();
        return {
            statusCode: 200,
            data: data,
            error: null
        };
    } catch (error) {
        console.error('Error deleting inhabitant:', error);
        return {
            statusCode: 500,
            data: null,
            error: error instanceof Error ? error.message : 'Failed to delete inhabitant'
        };
    }
}

