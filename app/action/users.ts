"use server"
// ADMIN_TOKEN — тот же токен, что проверяет aquaDaddy.
// Fallback оставлен для окружений, где переменную ещё не переименовали.
const adminToken = process.env.ADMIN_TOKEN ?? process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
const apiUrl = process.env.USER_API_URL

export const getUsers = async (page: number, limit: number) => {

    try {
        if (!apiUrl) {
            throw new Error('USER_API_URL не настроен');
        }
       
        const response = await fetch(`${apiUrl}/api/get-users?page=${page}&limit=${limit}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`,
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
        console.error('Error fetching users:', error);
        return {
            statusCode: 500,
            data: null,
            error: error instanceof Error ? error.message : 'Failed to fetch users'
        };
    }
};

export const deleteUser = async (id: string) => {
    try {
        if (!apiUrl) {
            throw new Error('USER_API_URL не настроен');
        }

        // Эндпоинт aquaDaddy принимает userId в теле, а не в пути
        const response = await fetch(`${apiUrl}/api/delete-user`, {
            method: "DELETE",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ userId: id }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`API вернул статус ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return {
            statusCode: 200,
            data: data,
            error: null
        };
    } catch (error) {
        console.error('Error deleting user:', error);
        return {
            statusCode: 500,
            data: null,
            error: error instanceof Error ? error.message : 'Failed to delete user'
        };
    }
};

