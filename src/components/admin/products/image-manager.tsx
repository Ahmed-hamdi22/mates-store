'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { ArrowDown, ArrowUp, Check, ImagePlus, Loader2, Star, Trash2 } from 'lucide-react';
import { uploadProductImageAction, deleteProductStorageImageAction } from '@/features/admin-products/actions';
import { validateImageFile } from '@/features/admin-products/validation';
import type { AdminImageInput } from '@/features/admin-products/types';

interface ImageManagerProps {
  images: AdminImageInput[];
  onChange: (images: AdminImageInput[]) => void;
  productId?: string;
  locale: string;
  labels: {
    title: string;
    description: string;
    uploadButton: string;
    uploading: string;
    cover: string;
    setAsCover: string;
    remove: string;
    moveUp: string;
    moveDown: string;
    dragDropHint: string;
    maxSizeHint: string;
    saveFirst: string;
    errorGeneric: string;
  };
}

export function ImageManager({
  images,
  onChange,
  productId,
  locale,
  labels
}: ImageManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !productId) return;

    setErrorMessage(null);
    setIsUploading(true);

    try {
      const newImagesList = [...images];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const validation = validateImageFile(file);

        if (!validation.isValid) {
          setErrorMessage(validation.error || 'Invalid file.');
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('productId', productId);

        const res = await uploadProductImageAction(formData);

        if (!res.success || !res.data) {
          setErrorMessage(res.error || 'Failed to upload image.');
        } else {
          newImagesList.push({
            id: res.data.id,
            storagePath: res.data.storagePath,
            publicUrl: res.data.publicUrl,
            sortOrder: res.data.sortOrder,
            isCover: res.data.isCover
          });
        }
      }

      onChange(newImagesList);
    } catch (err) {
      console.error('File upload error:', err);
      setErrorMessage('An unexpected error occurred during image upload.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const setCover = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isCover: i === index
    }));
    onChange(updated);
  };

  const removeImage = async (index: number) => {
    const imgToRemove = images[index];
    if (!productId || !imgToRemove.id) return;
    const result = await deleteProductStorageImageAction(productId, imgToRemove.id);
    if (!result.success) {
      setErrorMessage(result.error || 'Could not remove image.');
      return;
    }
    const updated = images.filter((_, i) => i !== index);

    // If removing the cover image, assign cover to the first remaining image
    if (imgToRemove.isCover && updated.length > 0) {
      updated[0].isCover = true;
    }

    // Re-index sort order
    const reindexed = updated.map((img, i) => ({ ...img, sortOrder: i }));
    onChange(reindexed);

  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    const reindexed = copy.map((img, i) => ({ ...img, sortOrder: i }));
    onChange(reindexed);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-bold text-foreground">{labels.title}</h3>
        <p className="text-xs text-muted-foreground">{labels.description}</p>
      </div>

      {/* Upload Zone */}
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-card p-6 text-center transition-colors hover:border-primary/50">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <ImagePlus className="size-6 stroke-[1.5]" />
        </div>
        <p className="mt-3 text-xs font-semibold text-foreground">
          {labels.dragDropHint}
        </p>
        <p className="mt-1 text-[0.7rem] text-muted-foreground">
          {labels.maxSizeHint}
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="product-image-upload"
          disabled={isUploading || !productId}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || !productId}
          className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl bg-secondary px-4 text-xs font-bold text-secondary-foreground shadow-2xs hover:bg-secondary/80 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>{labels.uploading}</span>
            </>
          ) : (
            <>
              <ImagePlus className="size-3.5" />
              <span>{labels.uploadButton}</span>
            </>
          )}
        </button>

        {!productId && <p className="mt-3 text-xs text-muted-foreground">{labels.saveFirst}</p>}
        {errorMessage && (
          <p className="mt-3 text-xs font-medium text-destructive">
            {locale === 'ar' ? labels.errorGeneric : errorMessage}
          </p>
        )}
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {images.map((img, index) => (
            <div
              key={img.storagePath || index}
              className={`group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all ${
                img.isCover ? 'border-primary ring-2 ring-primary/20' : 'border-border'
              }`}
            >
              <div className="relative aspect-[3/4] w-full bg-muted">
                <Image
                  src={img.publicUrl}
                  alt={`Product image #${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 20vw"
                  className="object-cover"
                />

                {/* Cover Badge */}
                {img.isCover && (
                  <span className="absolute start-2 top-2 inline-flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 text-[0.65rem] font-bold text-primary-foreground shadow-xs">
                    <Star className="size-2.5 fill-current" />
                    {labels.cover}
                  </span>
                )}
              </div>

              {/* Action Controls */}
              <div className="flex items-center justify-between border-t border-border/80 bg-background/80 p-1.5 backdrop-blur-xs">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveImage(index, 'up')}
                    disabled={index === 0}
                    className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                    title={labels.moveUp}
                  >
                    <ArrowUp className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(index, 'down')}
                    disabled={index === images.length - 1}
                    className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                    title={labels.moveDown}
                  >
                    <ArrowDown className="size-3" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {!img.isCover && (
                    <button
                      type="button"
                      onClick={() => setCover(index)}
                      className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      title={labels.setAsCover}
                    >
                      <Check className="size-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title={labels.remove}
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
