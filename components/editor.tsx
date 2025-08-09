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
        ] = await Promise.all([
          import("@editorjs/editorjs"),
          import("@editorjs/header"),
          import("@editorjs/list"),
          import("@editorjs/paragraph"),
          import("@editorjs/quote"),
          import("@editorjs/code"),
          import("@editorjs/table"),
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
            header: {
              class: Header,
              config: {
                placeholder: "Введите заголовок...",
                levels: [1, 2, 3, 4, 5, 6],
                defaultLevel: 2,
              },
              shortcut: "CMD+SHIFT+H",
            },
            paragraph: {
              class: Paragraph,
              config: {
                placeholder: placeholder,
              },
              inlineToolbar: true,
            },
            list: {
              class: List,
              config: {
                defaultStyle: "unordered",
              },
              inlineToolbar: true,
              shortcut: "CMD+SHIFT+L",
            },
            quote: {
              class: Quote,
              config: {
                quotePlaceholder: "Введите цитату",
                captionPlaceholder: "Автор цитаты",
              },
              inlineToolbar: true,
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
              class: Table,
              config: {
                rows: 2,
                cols: 3,
              },
              inlineToolbar: true,
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
        className="min-h-[200px] p-4 border border-border rounded-lg bg-background focus-within:border-primary"
        style={{ fontSize: "14px" }}
      />
    </div>
  );
}
