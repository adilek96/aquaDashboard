"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Image as ImageIcon,
  Table as TableIcon,
  Link as LinkIcon,
  Highlighter,
  Minus,
} from "lucide-react";
import { EditorData } from "@/lib/editor-utils";

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
  // Функция для очистки blob URL
  const cleanBlobUrls = (html: string): string => {
    // Заменяем blob URL на плейсхолдер или удаляем изображения с blob URL
    return html.replace(
      /<img[^>]+src="blob:http:\/\/localhost[^"]*"[^>]*>/gi,
      "<p><em>[Изображение было удалено - blob URL недействителен]</em></p>"
    );
  };

  // Конвертируем данные Editor.js в HTML для Tiptap
  const convertEditorJsToHtml = (editorData: any): string => {
    if (
      !editorData ||
      !editorData.blocks ||
      !Array.isArray(editorData.blocks)
    ) {
      return "";
    }

    let html = "";
    editorData.blocks.forEach((block: any) => {
      switch (block.type) {
        case "header":
          const level = block.data.level || 2;
          html += `<h${level}>${block.data.text || ""}</h${level}>`;
          break;
        case "paragraph":
          // Очищаем blob URL из текста параграфа
          const cleanText = cleanBlobUrls(block.data.text || "");
          html += `<p>${cleanText}</p>`;
          break;
        case "list":
          const tag = block.data.style === "ordered" ? "ol" : "ul";
          const items = (block.data.items || [])
            .map((item: string) => `<li>${cleanBlobUrls(item)}</li>`)
            .join("");
          html += `<${tag}>${items}</${tag}>`;
          break;
        case "quote":
          html += `<blockquote><p>${cleanBlobUrls(block.data.text || "")}</p>${
            block.data.caption
              ? `<footer>${cleanBlobUrls(block.data.caption)}</footer>`
              : ""
          }</blockquote>`;
          break;
        case "code":
          html += `<pre><code>${block.data.code || ""}</code></pre>`;
          break;
        case "image":
          const imageSrc = block.data.file?.url || "";
          // Если это blob URL, не добавляем изображение
          if (imageSrc && !imageSrc.startsWith("blob:")) {
            html += `<img src="${imageSrc}" alt="${
              block.data.caption || ""
            }" />`;
          } else if (imageSrc.startsWith("blob:")) {
            html +=
              "<p><em>[Изображение было удалено - blob URL недействителен]</em></p>";
          }
          break;
        case "simpleImage":
          const simpleImageSrc = block.data.url || "";
          // Если это blob URL, не добавляем изображение
          if (simpleImageSrc && !simpleImageSrc.startsWith("blob:")) {
            html += `<img src="${simpleImageSrc}" alt="${
              block.data.caption || ""
            }" />`;
          } else if (simpleImageSrc.startsWith("blob:")) {
            html +=
              "<p><em>[Изображение было удалено - blob URL недействителен]</em></p>";
          }
          break;
        case "table":
          if (block.data.content && Array.isArray(block.data.content)) {
            let tableHtml = "<table>";
            block.data.content.forEach((row: string[], index: number) => {
              const tag = index === 0 && block.data.withHeadings ? "th" : "td";
              const cells = row
                .map((cell) => `<${tag}>${cleanBlobUrls(cell)}</${tag}>`)
                .join("");
              tableHtml += `<tr>${cells}</tr>`;
            });
            tableHtml += "</table>";
            html += tableHtml;
          }
          break;
        case "delimiter":
          html += "<hr />";
          break;
        default:
          if (block.data && block.data.text) {
            html += `<p>${cleanBlobUrls(block.data.text)}</p>`;
          }
      }
    });

    return html;
  };

  // Конвертируем HTML обратно в формат Editor.js для совместимости с API
  const convertHtmlToEditorJs = (html: string): EditorData => {
    const blocks = [];

    if (html.trim()) {
      // Для совместимости с существующим API сохраняем HTML как один блок
      blocks.push({
        type: "paragraph",
        data: {
          text: html,
        },
      });
    }

    return {
      blocks,
      version: "2.28.2",
    };
  };

  const initialContent = data ? cleanBlobUrls(convertEditorJsToHtml(data)) : "";

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        link: false, // Отключаем встроенный Link
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Typography,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4 dark:prose-invert",
        placeholder: placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        const html = cleanBlobUrls(editor.getHTML());
        const editorData = convertHtmlToEditorJs(html);
        onChange(editorData);
      }
    },
  });

  // Обработчики кнопок
  const handleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const handleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const handleStrike = useCallback(() => {
    editor?.chain().focus().toggleStrike().run();
  }, [editor]);

  const handleCode = useCallback(() => {
    editor?.chain().focus().toggleCode().run();
  }, [editor]);

  const handleHeading = useCallback(
    (level: 1 | 2 | 3) => {
      editor?.chain().focus().toggleHeading({ level }).run();
    },
    [editor]
  );

  const handleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run();
  }, [editor]);

  const handleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run();
  }, [editor]);

  const handleBlockquote = useCallback(() => {
    editor?.chain().focus().toggleBlockquote().run();
  }, [editor]);

  const handleUndo = useCallback(() => {
    editor?.chain().focus().undo().run();
  }, [editor]);

  const handleRedo = useCallback(() => {
    editor?.chain().focus().redo().run();
  }, [editor]);

  const handleAlign = useCallback(
    (alignment: "left" | "center" | "right" | "justify") => {
      editor?.chain().focus().setTextAlign(alignment).run();
    },
    [editor]
  );

  const handleImage = useCallback(() => {
    // Создаем input элемент для загрузки файла
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        // Конвертируем в base64 для сохранения
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          editor?.chain().focus().setImage({ src: base64 }).run();
        };
        reader.readAsDataURL(file);
      } else {
        // Fallback - запрос URL
        const url = window.prompt("URL изображения:");
        if (url) {
          editor?.chain().focus().setImage({ src: url }).run();
        }
      }
    };

    input.click();
  }, [editor]);

  const handleLink = useCallback(() => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("URL ссылки:", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  const handleHighlight = useCallback(() => {
    editor?.chain().focus().toggleHighlight().run();
  }, [editor]);

  const handleTable = useCallback(() => {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor]);

  const handleHorizontalRule = useCallback(() => {
    editor?.chain().focus().setHorizontalRule().run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="min-h-[200px] p-4 border border-border rounded-lg bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg bg-background">
      {/* Toolbar */}
      <div className="border-b border-border p-3 flex flex-wrap gap-2 bg-muted/20">
        {/* Text Formatting */}
        <div className="flex gap-1">
          <Button
            variant={editor.isActive("bold") ? "default" : "ghost"}
            size="sm"
            onClick={handleBold}
            title="Жирный (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive("italic") ? "default" : "ghost"}
            size="sm"
            onClick={handleItalic}
            title="Курсив (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive("strike") ? "default" : "ghost"}
            size="sm"
            onClick={handleStrike}
            title="Зачеркнутый"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive("code") ? "default" : "ghost"}
            size="sm"
            onClick={handleCode}
            title="Код"
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive("highlight") ? "default" : "ghost"}
            size="sm"
            onClick={handleHighlight}
            title="Выделение"
          >
            <Highlighter className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Headings */}
        <div className="flex gap-1">
          <Button
            variant={
              editor.isActive("heading", { level: 1 }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() => handleHeading(1)}
            title="Заголовок 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant={
              editor.isActive("heading", { level: 2 }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() => handleHeading(2)}
            title="Заголовок 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant={
              editor.isActive("heading", { level: 3 }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() => handleHeading(3)}
            title="Заголовок 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Lists */}
        <div className="flex gap-1">
          <Button
            variant={editor.isActive("bulletList") ? "default" : "ghost"}
            size="sm"
            onClick={handleBulletList}
            title="Маркированный список"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive("orderedList") ? "default" : "ghost"}
            size="sm"
            onClick={handleOrderedList}
            title="Нумерованный список"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive("blockquote") ? "default" : "ghost"}
            size="sm"
            onClick={handleBlockquote}
            title="Цитата"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Alignment */}
        <div className="flex gap-1">
          <Button
            variant={
              editor.isActive({ textAlign: "left" }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() => handleAlign("left")}
            title="По левому краю"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={
              editor.isActive({ textAlign: "center" }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() => handleAlign("center")}
            title="По центру"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={
              editor.isActive({ textAlign: "right" }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() => handleAlign("right")}
            title="По правому краю"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            variant={
              editor.isActive({ textAlign: "justify" }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() => handleAlign("justify")}
            title="По ширине"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Insert */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleImage}
            title="Изображение"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLink} title="Ссылка">
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTable}
            title="Таблица"
          >
            <TableIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHorizontalRule}
            title="Разделитель"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* History */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={!editor.can().undo()}
            title="Отменить (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={!editor.can().redo()}
            title="Повторить (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="min-h-[200px] focus-within:ring-0"
      />
    </div>
  );
}
