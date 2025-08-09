import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiUrl = process.env.API_URL;
    const adminToken = process.env.ADMIN_TOKEN;

    if (!apiUrl || !adminToken) {
      return NextResponse.json(
        { error: 'Missing API_URL or ADMIN_TOKEN' },
        { status: 500 }
      );
    }

    // Получаем все статьи
    const response = await fetch(`${apiUrl}/articles`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.status}`);
    }

    const articles = await response.json();
    
    if (!Array.isArray(articles)) {
      throw new Error('Invalid response format');
    }

    let updatedCount = 0;
    const errors: string[] = [];

    // Функция для очистки blob URL
    const cleanBlobUrls = (text: string): string => {
      if (!text) return text;
      
      // Заменяем blob URL на плейсхолдер
      return text.replace(
        /<img[^>]+src="blob:http:\/\/localhost[^"]*"[^>]*>/gi,
        '<p><em>[Изображение было удалено - blob URL недействителен]</em></p>'
      ).replace(
        /blob:http:\/\/localhost:[0-9]+\/[a-f0-9-]+/gi,
        '[УДАЛЕНО: недействительная ссылка на изображение]'
      );
    };

    // Обрабатываем каждую статью
    for (const article of articles) {
      try {
        let hasChanges = false;
        const updatedTranslations = article.translations?.map((translation: any) => {
          const originalDescription = translation.description || '';
          const originalTitle = translation.title || '';
          
          const cleanedDescription = cleanBlobUrls(originalDescription);
          const cleanedTitle = cleanBlobUrls(originalTitle);
          
          if (cleanedDescription !== originalDescription || cleanedTitle !== originalTitle) {
            hasChanges = true;
            return {
              ...translation,
              description: cleanedDescription,
              title: cleanedTitle,
            };
          }
          
          return translation;
        }) || [];

        if (hasChanges) {
          // Обновляем статью
          const updateResponse = await fetch(`${apiUrl}/articles/article`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${adminToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: article.id,
              translations: updatedTranslations,
            }),
          });

          if (updateResponse.ok) {
            updatedCount++;
          } else {
            errors.push(`Failed to update article ${article.id}: ${updateResponse.status}`);
          }
        }
      } catch (error) {
        errors.push(`Error processing article ${article.id}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleanup completed. Updated ${updatedCount} articles.`,
      updatedCount,
      totalArticles: articles.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
