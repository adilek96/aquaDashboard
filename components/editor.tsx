"use client";

import { useEffect, useRef, useState } from "react";

interface EditorProps {
  data?: any;
  onChange?: (data: any) => void;
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
  const editorId = useRef(`editor-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const initEditor = async () => {
      if (!editorRef.current) {
        const { default: EditorJS } = await import("@editorjs/editorjs");
        const { default: Header } = await import("@editorjs/header");
        const { default: List } = await import("@editorjs/list");
        const { default: Paragraph } = await import("@editorjs/paragraph");
        const { default: Quote } = await import("@editorjs/quote");
        const { default: Code } = await import("@editorjs/code");
        const { default: Table } = await import("@editorjs/table");

        const editor = new EditorJS({
          holder: editorId.current,
          tools: {
            header: {
              class: Header,
              config: {
                placeholder: "Введите заголовок...",
                levels: [1, 2, 3, 4],
                defaultLevel: 2,
              },
            },
            paragraph: {
              class: Paragraph,
              config: {
                placeholder: placeholder,
              },
            },
            list: {
              class: List,
              config: {
                defaultStyle: "unordered",
              },
            },
            quote: {
              class: Quote,
              config: {
                quotePlaceholder: "Введите цитату",
                captionPlaceholder: "Автор цитаты",
              },
            },
            code: {
              class: Code,
              config: {
                placeholder: "Введите код...",
              },
            },
            table: {
              class: Table,
              config: {
                rows: 2,
                cols: 3,
              },
            },
          },
          data: data || {},
          onChange: async () => {
            if (onChange && editorRef.current) {
              const outputData = await editorRef.current.save();
              onChange(outputData);
            }
          },
          placeholder: placeholder,
        });

        editorRef.current = editor;
        editor.isReady.then(() => {
          setIsReady(true);
        });
      }
    };

    initEditor();

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [isClient]);

  // Обновляем данные редактора при изменении data
  useEffect(() => {
    if (editorRef.current && isReady && data) {
      editorRef.current.render(data);
    }
  }, [data, isReady]);

  if (!isClient) {
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <div className="min-h-[200px] p-4 border border-border rounded-lg bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <div
        id={editorId.current}
        className="min-h-[200px] p-4 border border-border rounded-lg bg-background"
      />
    </div>
  );
}
