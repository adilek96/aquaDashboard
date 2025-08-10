"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";
import { uploadImage } from "@/app/action/images";

type UploadResponse = {
  statusCode: number;
  data?: { imageUrl: string } | null;
  error?: string | null;
};

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  className = "",
}: ImageUploadProps) {
  const [uploadingImages, setUploadingImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  const processFiles = async (files: FileList) => {
    if (images.length + files.length > maxImages) {
      toast({
        title: "Ошибка",
        description: `Максимальное количество изображений: ${maxImages}`,
        variant: "destructive",
      });
      return;
    }

    const validFiles = Array.from(files).filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Ошибка",
          description: `Файл ${file.name} слишком большой (макс 10MB)`,
          variant: "destructive",
        });
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Ошибка",
          description: `Файл ${file.name} имеет неподдерживаемый формат`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Показать превью blob'ов
    const tempUrls = validFiles.map((file) => URL.createObjectURL(file));
    setUploadingImages((prev) => [...prev, ...tempUrls]);

    try {
      const uploadPromises = validFiles.map(async (file, idx) => {
        const formData = new FormData();
        formData.append("file", file);

        const response: UploadResponse = await uploadImage(formData);
        if (response.statusCode === 200 && response.data?.imageUrl) {
          return response.data.imageUrl;
        } else {
          toast({
            title: "Ошибка",
            description: `Не удалось загрузить ${file.name}: ${response.error}`,
            variant: "destructive",
          });
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulImages = results.filter(
        (url): url is string => url !== null
      );

      if (successfulImages.length > 0) {
        onImagesChange([...images, ...successfulImages]);
        toast({
          title: "Успешно",
          description: `Загружено ${successfulImages.length} изображений`,
        });
      }
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить изображения",
        variant: "destructive",
      });
    } finally {
      // Убираем blob'ы из загрузки
      setUploadingImages((prev) =>
        prev.filter((url) => !tempUrls.includes(url))
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processFiles(event.target.files);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer.files.length > 0) {
      processFiles(event.dataTransfer.files);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const copyImageUrl = async (imageUrl: string) => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      toast({
        title: "Ссылка скопирована",
        description: "Ссылка на изображение скопирована в буфер обмена",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать ссылку",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label>Изображения</Label>

      {/* Область загрузки */}
      <div
        className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors hover:border-gray-400`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="space-y-2">
          <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <div className="text-sm text-gray-600">
            <span className="font-medium">Нажмите для загрузки</span> или
            перетащите файлы
          </div>
          <p className="text-xs text-gray-500">
            JPG, PNG, GIF, WebP до 10MB. Максимум {maxImages} изображений
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= maxImages}
        >
          <Upload className="w-4 h-4 mr-2" />
          Выбрать файлы
        </Button>
      </div>

      {/* Предпросмотр */}
      {(images.length > 0 || uploadingImages.length > 0) && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Загруженные изображения:
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <div key={`img-${index}`} className="space-y-2">
                <div className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border cursor-pointer">
                    <img
                      src={imageUrl}
                      alt={`Изображение ${index + 1}`}
                      className="w-full h-full object-cover"
                      onClick={() =>
                        setSelectedImage(
                          selectedImage === imageUrl ? null : imageUrl
                        )
                      }
                      onError={(e) =>
                        ((e.target as HTMLImageElement).src =
                          "/placeholder.jpg")
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                {/* Ссылка на изображение */}
                {selectedImage === imageUrl && (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-600 font-medium">
                      Ссылка на изображение:
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={imageUrl}
                        readOnly
                        className="flex-1 text-xs p-2 border rounded bg-gray-50"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyImageUrl(imageUrl)}
                        className="text-xs"
                      >
                        Копировать
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {uploadingImages.map((tempUrl, index) => (
              <div
                key={`temp-${index}`}
                className="relative aspect-square rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center"
              >
                <img
                  src={tempUrl}
                  alt="Загрузка..."
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-xs">
                  Загрузка...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500">
        {images.length} из {maxImages} изображений
      </div>
    </div>
  );
}
