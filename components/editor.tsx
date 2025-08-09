"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { validateEditorData, EditorData } from "@/lib/editor-utils";

interface EditorProps {
  data?: any;
  onChange?: (data: EditorData) => void;
  placeholder?: string;
}

export function Editor({
  data,
  onChange,
  placeholder = "Начните писать...",
}: EditorProps) {
  const editorRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const editorId = useRef(
    `editor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );

  const handleChange = useCallback(async () => {
    try {
      if (onChange && editorRef.current) {
        const outputData = await editorRef.current.save();
        const validatedData = validateEditorData(outputData);
        onChange(validatedData);
      }
    } catch (error) {
      console.error("Ошибка сохранения данных EditorJS:", error);
    }
  }, [onChange]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    let isMounted = true;

    const initEditor = async () => {
      if (editorRef.current) return;

      try {
        setInitError(null);

        // Динамически импортируем все необходимые модули
        const [
          { default: EditorJS },
          { default: Header },
          { default: List },
          { default: Paragraph },
          { default: Quote },
          { default: Code },
          { default: Table },
          { default: Image },
          { default: LinkTool },
          { default: Delimiter },
          { default: Warning },
          { default: Marker },
          { default: InlineCode },
          { default: Embed },
          { default: SimpleImage },
        ] = await Promise.all([
          import("@editorjs/editorjs"),
          import("@editorjs/header"),
          import("@editorjs/list"),
          import("@editorjs/paragraph"),
          import("@editorjs/quote"),
          import("@editorjs/code"),
          import("@editorjs/table"),
          import("@editorjs/image"),
          // @ts-ignore
          import("@editorjs/link"),
          import("@editorjs/delimiter"),
          import("@editorjs/warning"),
          // @ts-ignore
          import("@editorjs/marker"),
          import("@editorjs/inline-code"),
          // @ts-ignore
          import("@editorjs/embed"),
          // @ts-ignore
          import("@editorjs/simple-image"),
        ]);

        if (!isMounted) return;

        // Очищаем holder
        const holder = document.getElementById(editorId.current);
        if (holder) {
          holder.innerHTML = "";
        }

        // Валидируем начальные данные
        const validatedData = validateEditorData(data);
        console.log("Инициализация EditorJS с данными:", validatedData);

        const editor = new EditorJS({
          holder: editorId.current,
          tools: {
            // Основные блочные инструменты
            header: {
              // @ts-ignore
              class: Header,
              config: {
                placeholder: "Введите заголовок...",
                levels: [1, 2, 3, 4, 5, 6],
                defaultLevel: 2,
              },
              shortcut: "CMD+SHIFT+H",
            },
            paragraph: {
              // @ts-ignore
              class: Paragraph,
              config: {
                placeholder: placeholder,
              },
              inlineToolbar: ["marker", "link", "inlineCode"],
            },
            list: {
              // @ts-ignore
              class: List,
              config: {
                defaultStyle: "unordered",
              },
              inlineToolbar: ["marker", "link", "inlineCode"],
              shortcut: "CMD+SHIFT+L",
            },
            quote: {
              class: Quote,
              config: {
                quotePlaceholder: "Введите цитату",
                captionPlaceholder: "Автор цитаты",
              },
              inlineToolbar: ["marker", "link"],
              shortcut: "CMD+SHIFT+O",
            },
            code: {
              class: Code,
              config: {
                placeholder: "Введите код...",
              },
              shortcut: "CMD+SHIFT+C",
            },
            table: {
              // @ts-ignore
              class: Table,
              config: {
                rows: 2,
                cols: 3,
              },
              inlineToolbar: ["marker", "link"],
            },

            // Медиа инструменты
            image: {
              // @ts-ignore
              class: Image,
              config: {
                captionPlaceholder: "Подпись к изображению",
                buttonContent: "Выберите изображение",
                additionalRequestHeaders: {},
                uploader: {
                  uploadByFile: async (file: File) => {
                    // Создаем временный URL для предварительного просмотра
                    const tempUrl = URL.createObjectURL(file);

                    // В будущем здесь будет настоящая загрузка на сервер
                    // const formData = new FormData();
                    // formData.append('image', file);
                    // const response = await fetch('/api/upload-image', {
                    //   method: 'POST',
                    //   body: formData
                    // });
                    // const result = await response.json();

                    return {
                      success: 1,
                      file: {
                        url: tempUrl,
                        name: file.name,
                        size: file.size,
                      },
                    };
                  },
                  uploadByUrl: async (url: string) => {
                    return {
                      success: 1,
                      file: {
                        url: url,
                      },
                    };
                  },
                },
              },
              shortcut: "CMD+SHIFT+I",
            },
            simpleImage: {
              // @ts-ignore
              class: SimpleImage,
              config: {
                placeholder: "Вставьте URL изображения...",
              },
            },

            // Встраивание контента
            embed: {
              // @ts-ignore
              class: Embed,
              config: {
                services: {
                  youtube: true,
                  vimeo: true,
                  twitter: true,
                  instagram: true,
                  github: true,
                },
              },
            },

            // Специальные блоки
            warning: {
              // @ts-ignore
              class: Warning,
              config: {
                titlePlaceholder: "Заголовок предупреждения",
                messagePlaceholder: "Текст предупреждения",
              },
              inlineToolbar: ["marker", "link"],
              shortcut: "CMD+SHIFT+W",
            },
            delimiter: {
              // @ts-ignore
              class: Delimiter,
              shortcut: "CMD+SHIFT+D",
            },

            // Inline инструменты
            marker: {
              // @ts-ignore
              class: Marker,
              shortcut: "CMD+SHIFT+M",
            },
            link: {
              // @ts-ignore
              class: LinkTool,
              config: {
                // endpoint: '/api/link-info', // endpoint для получения мета-данных ссылки (отключен пока)
              },
            },
            inlineCode: {
              // @ts-ignore
              class: InlineCode,
              shortcut: "CMD+SHIFT+`",
            },
          },
          data: validatedData,
          onChange: handleChange,
          placeholder: placeholder,
          autofocus: false,
          logLevel: "ERROR" as any,
        });

        await editor.isReady;

        if (!isMounted) {
          editor.destroy();
          return;
        }

        editorRef.current = editor;
        setIsReady(true);
        console.log("EditorJS успешно инициализирован");
      } catch (error) {
        console.error("Критическая ошибка инициализации EditorJS:", error);
        setInitError(
          error instanceof Error ? error.message : "Неизвестная ошибка"
        );
      }
    };

    initEditor();

    return () => {
      isMounted = false;
      if (editorRef.current) {
        try {
          editorRef.current.destroy();
        } catch (error) {
          console.error("Ошибка при уничтожении EditorJS:", error);
        }
        editorRef.current = null;
      }
      setIsReady(false);
    };
  }, [isClient, placeholder, handleChange]);

  // НЕ обновляем данные после инициализации, чтобы избежать конфликтов
  // EditorJS сам управляет своими данными после инициализации

  if (!isClient) {
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <div className="min-h-[200px] p-4 border border-border rounded-lg bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <div className="min-h-[200px] p-4 border border-red-300 rounded-lg bg-red-50 flex items-center justify-center">
          <div className="text-red-600 text-center">
            <p className="font-semibold">Ошибка загрузки редактора</p>
            <p className="text-sm">{initError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <div
        id={editorId.current}
        className="min-h-[200px] p-3 lg:p-4 border border-border rounded-lg bg-background focus-within:border-primary editor-container"
        style={{ fontSize: "14px" }}
      />
      <style jsx>{`
        .editor-container :global(.ce-block__content) {
          max-width: 100% !important;
        }
        .editor-container :global(.ce-toolbar__settings-btn) {
          width: 32px !important;
          height: 32px !important;
        }
        .editor-container :global(.ce-toolbar__plus) {
          width: 32px !important;
          height: 32px !important;
        }
        @media (max-width: 768px) {
          .editor-container :global(.ce-block__content) {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .editor-container :global(.ce-toolbar) {
            left: -20px !important;
          }
          .editor-container :global(.ce-toolbar__actions) {
            right: -20px !important;
          }
        }
        .editor-container :global(.ce-paragraph) {
          line-height: 1.6;
          margin: 0.5em 0;
        }
        .editor-container :global(.ce-header) {
          margin: 1em 0 0.5em 0;
          font-weight: 600;
        }
        .editor-container :global(.ce-quote) {
          border-left: 4px solid #e5e7eb;
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
        }
        .editor-container :global(.ce-warning) {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 1em;
          margin: 1em 0;
          border-radius: 4px;
        }
        .editor-container :global(.ce-code) {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 1em;
          margin: 1em 0;
          font-family: "Monaco", "Consolas", monospace;
          font-size: 0.9em;
        }
        .editor-container :global(.ce-delimiter) {
          text-align: center;
          margin: 2em 0;
        }
        .editor-container :global(.ce-delimiter::before) {
          content: "***";
          color: #9ca3af;
          font-size: 1.5em;
          letter-spacing: 0.5em;
        }
        .editor-container :global(.ce-table) {
          margin: 1em 0;
        }
        .editor-container :global(.ce-table table) {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #e5e7eb;
        }
        .editor-container :global(.ce-table th),
        .editor-container :global(.ce-table td) {
          border: 1px solid #e5e7eb;
          padding: 0.5em;
          text-align: left;
        }
        .editor-container :global(.ce-table th) {
          background: #f9fafb;
          font-weight: 600;
        }
        .editor-container :global(.ce-list) {
          margin: 0.5em 0;
        }
        .editor-container :global(.ce-list__item) {
          margin: 0.25em 0;
        }
        .editor-container :global(mark) {
          background: #fef08a;
          padding: 0.1em 0.2em;
          border-radius: 2px;
        }
        .editor-container :global(.inline-code) {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          padding: 0.1em 0.3em;
          border-radius: 3px;
          font-family: "Monaco", "Consolas", monospace;
          font-size: 0.9em;
        }
        .editor-container :global(.ce-popover) {
          z-index: 9999 !important;
        }
        .editor-container :global(.ce-toolbar) {
          z-index: 9998 !important;
        }
        @media (max-width: 640px) {
          .editor-container :global(.ce-popover) {
            left: 10px !important;
            right: 10px !important;
            width: auto !important;
            max-width: calc(100vw - 20px) !important;
          }
          .editor-container :global(.ce-inline-toolbar) {
            left: 10px !important;
            right: 10px !important;
            width: auto !important;
            max-width: calc(100vw - 20px) !important;
          }
          .editor-container :global(.ce-conversion-toolbar) {
            left: 10px !important;
            right: 10px !important;
            width: auto !important;
            max-width: calc(100vw - 20px) !important;
          }
        }
      `}</style>
    </div>
  );
}
