'use server'

const adminToken = process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
const apiUrl = process.env.API_URL

export async function uploadImage(formData: FormData) {
    try {
        if (!apiUrl) {
            throw new Error('API_URL не настроен');
        }

        const response = await fetch(`${apiUrl}/images`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                // Не устанавливаем Content-Type для multipart/form-data
                // Браузер автоматически установит правильный Content-Type с boundary
            },
            body: formData
        });

        // Проверяем статус ответа
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API вернул статус ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        
        // API возвращает { statusCode: 200, imageUrl: "..." }
        return {
            statusCode: 200,
            data: { imageUrl: data.imageUrl },
            error: null
        };
    } catch (error) {
        console.error('Error uploading image:', error);
        return {
            statusCode: 500,
            data: null,
            error: error instanceof Error ? error.message : 'Failed to upload image'
        };
    }
}

export async function deleteImage(imageId: string) {
    try {
        if (!apiUrl) {
            throw new Error('API_URL не настроен');
        }

        const response = await fetch(`${apiUrl}/images/${imageId}`, {
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

        const data = await response.json();
        return {
            statusCode: 200,
            data: data,
            error: null
        };
    } catch (error) {
        console.error('Error deleting image:', error);
        return {
            statusCode: 500,
            data: null,
            error: error instanceof Error ? error.message : 'Failed to delete image'
        };
    }
}
