'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { ImageManager } from './image-manager';
import { VariantEditor } from './variant-editor';
import { createProductAction, updateProductAction } from '@/features/admin-products/actions';
import { slugify, type ValidationError } from '@/features/admin-products/validation';
import type {
  AdminImageInput,
  AdminProductFormData,
  AdminReferenceCategory,
  AdminReferenceColor,
  AdminReferenceSize,
  AdminVariantInput
} from '@/features/admin-products/types';
import { Link, useRouter } from '@/i18n/navigation';
import type { ProductStatus } from '@/types/database';

interface ProductFormProps {
  initialData?: AdminProductFormData;
  categories: AdminReferenceCategory[];
  sizes: AdminReferenceSize[];
  colors: AdminReferenceColor[];
  locale: string;
  isEdit?: boolean;
  labels: {
    backToProducts: string;
    createTitle: string;
    editTitle: string;
    generalSection: string;
    titleEn: string;
    titleEnPlaceholder: string;
    titleAr: string;
    titleArPlaceholder: string;
    slug: string;
    slugPlaceholder: string;
    slugAutoGenerate: string;
    category: string;
    selectCategory: string;
    noCategory: string;
    status: string;
    statusDraft: string;
    statusPublished: string;
    statusArchived: string;
    descriptionEn: string;
    descriptionEnPlaceholder: string;
    descriptionAr: string;
    descriptionArPlaceholder: string;
    save: string;
    saving: string;
    create: string;
    creating: string;
    cancel: string;
    successCreated: string;
    successUpdated: string;
    saveFailed: string;
    validationFailed: string;
    imageManager: {
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
    variantEditor: {
      title: string;
      description: string;
      addVariant: string;
      removeVariant: string;
      size: string;
      color: string;
      sku: string;
      price: string;
      compareAtPrice: string;
      stock: string;
      active: string;
      inactive: string;
      duplicateComboWarning: string;
      duplicateSkuWarning: string;
      selectSize: string;
      selectColor: string;
      noVariantsNotice: string;
    };
  };
}

export function ProductForm({
  initialData,
  categories,
  sizes,
  colors,
  locale,
  isEdit = false,
  labels
}: ProductFormProps) {
  const router = useRouter();
  const isArabic = locale === 'ar';

  const [titleEn, setTitleEn] = useState(initialData?.titleEn || '');
  const [titleAr, setTitleAr] = useState(initialData?.titleAr || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [isSlugManual, setIsSlugManual] = useState(Boolean(initialData?.slug));
  const [descriptionEn, setDescriptionEn] = useState(initialData?.descriptionEn || '');
  const [descriptionAr, setDescriptionAr] = useState(initialData?.descriptionAr || '');
  const [categoryId, setCategoryId] = useState<string | null>(initialData?.categoryId || null);
  const [status, setStatus] = useState<ProductStatus>(initialData?.status || 'draft');
  const [variants, setVariants] = useState<AdminVariantInput[]>(initialData?.variants || []);
  const [images, setImages] = useState<AdminImageInput[]>(initialData?.images || []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-generate slug while typing English title if not manually changed
  const handleTitleEnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitleEn(val);
    if (!isSlugManual && !isEdit) {
      setSlug(slugify(val));
    }
  };

  const handleSlugManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManual(true);
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
  };

  const handleRegenerateSlug = () => {
    setSlug(slugify(titleEn));
    setIsSlugManual(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGlobalError(null);
    setValidationErrors([]);
    setSuccessMessage(null);

    const payload: AdminProductFormData = {
      id: initialData?.id,
      titleEn,
      titleAr,
      slug: slug.trim().toLowerCase(),
      descriptionEn,
      descriptionAr,
      categoryId,
      status,
      variants,
      images
    };

    try {
      if (isEdit && initialData?.id) {
        const res = await updateProductAction(initialData.id, payload);
        if (!res.success) {
          setGlobalError(isArabic ? labels.saveFailed : (res.error || labels.saveFailed));
          if (res.validationErrors) setValidationErrors(res.validationErrors);
        } else {
          setSuccessMessage(labels.successUpdated);
          setTimeout(() => {
            router.push('/admin/products');
          }, 800);
        }
      } else {
        const res = await createProductAction(payload);
        if (!res.success) {
          setGlobalError(isArabic ? labels.saveFailed : (res.error || labels.saveFailed));
          if (res.validationErrors) setValidationErrors(res.validationErrors);
        } else {
          if (!res.data?.productId) {
            setGlobalError(labels.saveFailed);
            return;
          }
          const createdProductId = res.data.productId;
          setSuccessMessage(labels.successCreated);
          setTimeout(() => {
            router.push(`/admin/products/${createdProductId}/edit`);
          }, 800);
        }
      }
    } catch (err) {
      console.error('Form submit exception:', err);
      setGlobalError(labels.saveFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 pb-16">
      {/* Top Breadcrumb & Heading */}
      <div className="flex flex-col gap-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/admin/products" className="hover:text-foreground hover:underline">
            {labels.backToProducts}
          </Link>
          <ChevronRight className="size-3 rtl:rotate-180" />
          <span className="font-semibold text-foreground">
            {isEdit ? labels.editTitle : labels.createTitle}
          </span>
        </nav>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {isEdit ? labels.editTitle : labels.createTitle}
        </h1>
      </div>

      {/* Feedback Messages */}
      {globalError && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-medium text-destructive">
          <AlertCircle className="size-4.5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{globalError}</p>
            {validationErrors.length > 0 && (isArabic ? <p className="mt-2">{labels.validationFailed}</p> : (
              <ul className="mt-2 list-disc ps-4 space-y-1">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err.message}</li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-700 dark:border-border dark:bg-muted dark:text-emerald-300">
          <CheckCircle2 className="size-4.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 1. General Product Information Section */}
      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-8">
        <h2 className="text-base font-bold text-foreground">
          {labels.generalSection}
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* English Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground">
              {labels.titleEn} <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={titleEn}
              onChange={handleTitleEnChange}
              placeholder={labels.titleEnPlaceholder}
              className="h-10 rounded-xl border border-border bg-background px-3.5 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Arabic Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground">
              {labels.titleAr} <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              placeholder={labels.titleArPlaceholder}
              className="h-10 rounded-xl border border-border bg-background px-3.5 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">
                {labels.slug} <span className="text-destructive">*</span>
              </label>
              {!isSlugManual && (
                <button
                  type="button"
                  onClick={handleRegenerateSlug}
                  className="inline-flex items-center gap-1 text-[0.7rem] font-medium text-primary hover:underline"
                >
                  <Sparkles className="size-3" />
                  <span>{labels.slugAutoGenerate}</span>
                </button>
              )}
            </div>
            <div className="flex items-center rounded-xl border border-border bg-background px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
              <span className="text-xs text-muted-foreground/70 select-none">/products/</span>
              <input
                type="text"
                required
                value={slug}
                onChange={handleSlugManualChange}
                placeholder={labels.slugPlaceholder}
                className="h-10 w-full bg-transparent px-1.5 text-xs font-mono text-foreground outline-none"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground">
              {labels.category}
            </label>
            <select
              value={categoryId || ''}
              onChange={(e) => setCategoryId(e.target.value || null)}
              className="h-10 rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">{labels.noCategory}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {isArabic ? c.nameAr : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground">
              {labels.status}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus)}
              className="h-10 rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="draft">{labels.statusDraft}</option>
              <option value="published">{labels.statusPublished}</option>
              <option value="archived">{labels.statusArchived}</option>
            </select>
          </div>

          {/* English Description */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-foreground">
              {labels.descriptionEn}
            </label>
            <textarea
              rows={3}
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              placeholder={labels.descriptionEnPlaceholder}
              className="rounded-xl border border-border bg-background p-3 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Arabic Description */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-foreground">
              {labels.descriptionAr}
            </label>
            <textarea
              rows={3}
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              placeholder={labels.descriptionArPlaceholder}
              className="rounded-xl border border-border bg-background p-3 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* 2. Image Manager Section */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-8">
        <ImageManager
          images={images}
          onChange={setImages}
          productId={initialData?.id}
          locale={locale}
          labels={labels.imageManager}
        />
      </div>

      {/* 3. Variant Editor Section */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-8">
        <VariantEditor
          variants={variants}
          onChange={setVariants}
          sizes={sizes}
          colors={colors}
          locale={locale}
          labels={labels.variantEditor}
        />
      </div>

      {/* Action Footer Bar */}
      <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-2xl border border-border/80 bg-background/95 p-4 shadow-lg backdrop-blur-md">
        <Link
          href="/admin/products"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-border px-5 text-xs font-bold text-foreground hover:bg-muted"
        >
          {labels.cancel}
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-6 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          <span>
            {isSubmitting
              ? isEdit
                ? labels.saving
                : labels.creating
              : isEdit
                ? labels.save
                : labels.create}
          </span>
        </button>
      </div>
    </form>
  );
}
