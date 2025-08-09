'use server'

const adminToken = process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
const apiUrl = process.env.API_URL


export async function getSubCategories() {
  
   
    try {
        const response = await fetch(`${apiUrl}/subcategories`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              }
        })
     
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
            data: data.subcategories || data,
            error: null
        };
    } catch (error) {
        console.error('Error fetching subcategories:', error)
        return {
            error: 'Failed to fetch subcategories'
        }
    }
}

// ------------------------------------------------------------








export async function createSubCategory(body: any) {
 
   
    try {
        const response = await fetch(`${apiUrl}/subcategories/subcategory`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            body: JSON.stringify(body)
        })

   
        if (!response.ok) {
            throw new Error('Failed to create subcategory')
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error creating subcategory:', error)
        return {
            error: 'Failed to create subcategory'
        }
    }
}


// ------------------------------------------------------------








export async function updateSubCategory(body: any) {
    console.log(body)
    try {
        const response = await fetch(`${apiUrl}/subcategories/subcategory`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            body: JSON.stringify(body)
        })
        if (!response.ok) {
            throw new Error('Failed to update subcategory')
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error updating subcategory:', error)
        return {
            error: 'Failed to update subcategory'
        }
    }       
}


// ------------------------------------------------------------


export async function deleteSubCategory(id: string) {
    
    try {
        const response = await fetch(`${apiUrl}/subcategories/subcategory/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              }
        })
       
        if (!response.ok) {
            throw new Error('Failed to delete subcategory')
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error deleting subcategory:', error)
        return {
            error: 'Failed to delete subcategory'
        }
    }
}

