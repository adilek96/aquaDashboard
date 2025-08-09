'use server'

const adminToken = process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
const apiUrl = process.env.API_URL

export async function getInhabitants() {
    try {
        if (!apiUrl) {
            throw new Error('API_URL не настроен');
        }

        const response = await fetch(`${apiUrl}/inhabitants`, {
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

// ------------------------------------------------------------








export async function createInhabitant(body: any) {
    try {
        const response = await fetch(`${apiUrl}/inhabitants/inhabitant`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            body: JSON.stringify(body)
        })
        if (!response.ok) {
            throw new Error('Failed to create inhabitant')
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error creating inhabitant:', error)
        return {
            error: 'Failed to create inhabitant'
        }
    }
}


// ------------------------------------------------------------








export async function updateInhabitant(body: any) {
    try {
        const response = await fetch(`${apiUrl}/inhabitants/inhabitant`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            body: JSON.stringify(body)
        })
        if (!response.ok) {
            throw new Error('Failed to update inhabitant')
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error updating inhabitant:', error)
        return {
            error: 'Failed to update inhabitant'
        }
    }       
}


// ------------------------------------------------------------


export async function deleteInhabitant(id: string) {
    
    try {
        const response = await fetch(`${apiUrl}/inhabitants/inhabitant/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              }
        })
       
        if (!response.ok) {
            throw new Error('Failed to delete inhabitant')
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error deleting inhabitant:', error)
        return {
            error: 'Failed to delete inhabitant'
        }
    }
}

