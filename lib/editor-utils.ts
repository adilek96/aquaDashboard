// Утилиты для работы с EditorJS

export interface EditorBlock {
  type: string;
  data: any;
  id?: string;
}

export interface EditorData {
  blocks: EditorBlock[];
  version?: string;
}

/**
 * Валидирует и очищает данные EditorJS
 */
export function validateEditorData(data: any): EditorData {
  if (!data || typeof data !== 'object') {
    return { blocks: [] };
  }

  if (!Array.isArray(data.blocks)) {
    return { blocks: [] };
  }

  // Валидируем каждый блок
  const validBlocks = data.blocks.filter((block: any) => {
    if (!block || typeof block !== 'object') return false;
    if (!block.type || typeof block.type !== 'string') return false;
    if (!block.data || typeof block.data !== 'object') return false;
    return true;
  }).map((block: any) => {
    // Специальная обработка для разных типов блоков
    switch (block.type) {
      case 'header':
        return {
          type: 'header',
          data: {
            text: String(block.data.text || ''),
            level: Math.min(Math.max(Number(block.data.level) || 2, 1), 6)
          },
          id: block.id
        };
      
      case 'paragraph':
        return {
          type: 'paragraph',
          data: {
            text: String(block.data.text || '')
          },
          id: block.id
        };
      
      case 'list':
        return {
          type: 'list',
          data: {
            style: ['ordered', 'unordered'].includes(block.data.style) ? block.data.style : 'unordered',
            items: Array.isArray(block.data.items) ? block.data.items.map(String) : []
          },
          id: block.id
        };
      
      case 'quote':
        return {
          type: 'quote',
          data: {
            text: String(block.data.text || ''),
            caption: String(block.data.caption || ''),
            alignment: ['left', 'center'].includes(block.data.alignment) ? block.data.alignment : 'left'
          },
          id: block.id
        };
      
      case 'code':
        return {
          type: 'code',
          data: {
            code: String(block.data.code || '')
          },
          id: block.id
        };
      
      case 'table':
        return {
          type: 'table',
          data: {
            withHeadings: Boolean(block.data.withHeadings),
            content: Array.isArray(block.data.content) ? 
              block.data.content.map((row: any) => 
                Array.isArray(row) ? row.map(String) : []
              ) : []
          },
          id: block.id
        };

      case 'image':
        return {
          type: 'image',
          data: {
            file: block.data.file || {},
            caption: String(block.data.caption || ''),
            withBorder: Boolean(block.data.withBorder),
            withBackground: Boolean(block.data.withBackground),
            stretched: Boolean(block.data.stretched)
          },
          id: block.id
        };

      case 'simpleImage':
        return {
          type: 'simpleImage',
          data: {
            url: String(block.data.url || ''),
            caption: String(block.data.caption || '')
          },
          id: block.id
        };

      case 'embed':
        return {
          type: 'embed',
          data: {
            service: String(block.data.service || ''),
            source: String(block.data.source || ''),
            embed: String(block.data.embed || ''),
            width: Number(block.data.width) || 580,
            height: Number(block.data.height) || 320,
            caption: String(block.data.caption || '')
          },
          id: block.id
        };

      case 'warning':
        return {
          type: 'warning',
          data: {
            title: String(block.data.title || ''),
            message: String(block.data.message || '')
          },
          id: block.id
        };

      case 'delimiter':
        return {
          type: 'delimiter',
          data: {},
          id: block.id
        };

      case 'link':
        return {
          type: 'link',
          data: {
            link: String(block.data.link || ''),
            meta: block.data.meta || {}
          },
          id: block.id
        };
      
      default:
        // Для неизвестных типов блоков возвращаем как есть, но с валидацией
        return {
          type: block.type,
          data: block.data,
          id: block.id
        };
    }
  });

  return {
    blocks: validBlocks,
    version: data.version || "2.28.2"
  };
}

/**
 * Безопасно парсит строку JSON содержащую данные EditorJS
 */
export function parseEditorContent(content: string): EditorData {
  try {
    const parsed = JSON.parse(content || '{}');
    return validateEditorData(parsed);
  } catch (error) {
    console.error('Ошибка парсинга данных EditorJS:', error);
    return { blocks: [] };
  }
}

/**
 * Проверяет, содержит ли EditorJS данные какой-либо контент
 */
export function hasEditorContent(data: EditorData): boolean {
  if (!data || !Array.isArray(data.blocks) || data.blocks.length === 0) {
    return false;
  }

  return data.blocks.some(block => {
    switch (block.type) {
      case 'header':
      case 'paragraph':
        return block.data.text && block.data.text.trim().length > 0;
      case 'list':
        return Array.isArray(block.data.items) && 
               block.data.items.some((item: string) => item.trim().length > 0);
      case 'quote':
        return (block.data.text && block.data.text.trim().length > 0) ||
               (block.data.caption && block.data.caption.trim().length > 0);
      case 'code':
        return block.data.code && block.data.code.trim().length > 0;
      case 'table':
        return Array.isArray(block.data.content) &&
               block.data.content.some((row: string[]) => 
                 Array.isArray(row) && row.some(cell => cell.trim().length > 0)
               );
      case 'image':
        return !!(block.data.file && (block.data.file.url || block.data.file.path));
      case 'simpleImage':
        return !!(block.data.url && block.data.url.trim().length > 0);
      case 'embed':
        return !!(block.data.source && block.data.source.trim().length > 0);
      case 'warning':
        return (block.data.title && block.data.title.trim().length > 0) ||
               (block.data.message && block.data.message.trim().length > 0);
      case 'delimiter':
        return true; // Разделитель всегда считается контентом
      case 'link':
        return !!(block.data.link && block.data.link.trim().length > 0);
      default:
        return true; // Для неизвестных типов предполагаем, что есть контент
    }
  });
}
