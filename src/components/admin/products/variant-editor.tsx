'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { AdminReferenceColor, AdminReferenceSize, AdminVariantInput } from '@/features/admin-products/types';

interface VariantEditorProps {
  variants: AdminVariantInput[];
  onChange: (variants: AdminVariantInput[]) => void;
  sizes: AdminReferenceSize[];
  colors: AdminReferenceColor[];
  locale: string;
  labels: {
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
}

export function VariantEditor({
  variants,
  onChange,
  sizes,
  colors,
  locale,
  labels
}: VariantEditorProps) {
  const isArabic = locale === 'ar';

  const handleAddVariant = () => {
    const newVariant: AdminVariantInput = {
      sizeId: '',
      colorId: '',
      sku: '',
      priceEGP: 0,
      compareAtPriceEGP: null,
      stockQuantity: 0,
      isActive: true
    };

    onChange([...variants, newVariant]);
  };

  const handleRemoveVariant = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleFieldChange = (index: number, field: keyof AdminVariantInput, value: unknown) => {
    const copy = [...variants];
    copy[index] = {
      ...copy[index],
      [field]: value
    };
    onChange(copy);
  };

  // Detect duplicate combinations and SKUs
  const comboCounts = new Map<string, number>();
  const skuCounts = new Map<string, number>();

  variants.forEach((v) => {
    if (v.sizeId && v.colorId) {
      const key = `${v.sizeId}::${v.colorId}`;
      comboCounts.set(key, (comboCounts.get(key) || 0) + 1);
    }
    if (v.sku && v.sku.trim()) {
      const skuKey = v.sku.trim().toUpperCase();
      skuCounts.set(skuKey, (skuCounts.get(skuKey) || 0) + 1);
    }
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">{labels.title}</h3>
          <p className="text-xs text-muted-foreground">{labels.description}</p>
        </div>
        <button
          type="button"
          onClick={handleAddVariant}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-secondary px-3 text-xs font-semibold text-secondary-foreground shadow-2xs hover:bg-secondary/80 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Plus className="size-3.5" />
          <span>{labels.addVariant}</span>
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/40 p-6 text-center text-xs text-muted-foreground">
          {labels.noVariantsNotice}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {variants.map((v, index) => {
            const isDuplicateCombo = v.sizeId && v.colorId && (comboCounts.get(`${v.sizeId}::${v.colorId}`) || 0) > 1;
            const isDuplicateSku = v.sku && (skuCounts.get(v.sku.trim().toUpperCase()) || 0) > 1;

            return (
              <div
                key={v.id || index}
                className={`relative flex flex-col gap-3 rounded-xl border bg-card p-4 transition-all sm:p-5 ${
                  isDuplicateCombo || isDuplicateSku
                    ? 'border-destructive/60 bg-destructive/5'
                    : 'border-border/80'
                }`}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-6 lg:grid-cols-7 items-end">
                  {/* Size Selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-bold text-muted-foreground">
                      {labels.size}
                    </label>
                    <select
                      value={v.sizeId}
                      onChange={(e) => handleFieldChange(index, 'sizeId', e.target.value)}
                      className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      <option value="">{labels.selectSize}</option>
                      {sizes.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Color Selector */}
                  <div className="flex flex-col gap-1.5 sm:col-span-1 md:col-span-2">
                    <label className="text-[0.7rem] font-bold text-muted-foreground">
                      {labels.color}
                    </label>
                    <select
                      value={v.colorId}
                      onChange={(e) => handleFieldChange(index, 'colorId', e.target.value)}
                      className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      <option value="">{labels.selectColor}</option>
                      {colors.map((c) => (
                        <option key={c.id} value={c.id}>
                          {isArabic ? c.nameAr : c.nameEn} ({c.hexCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SKU */}
                  <div className="flex flex-col gap-1.5 sm:col-span-1 md:col-span-2">
                    <label className="text-[0.7rem] font-bold text-muted-foreground">
                      {labels.sku}
                    </label>
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => handleFieldChange(index, 'sku', e.target.value)}
                      placeholder="e.g. HOOD-BLK-M"
                      className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-mono text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Price (EGP) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-bold text-muted-foreground">
                      {labels.price}
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      value={v.priceEGP || ''}
                      onChange={(e) => handleFieldChange(index, 'priceEGP', parseFloat(e.target.value) || 0)}
                      className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Compare-at Price (EGP) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-bold text-muted-foreground">
                      {labels.compareAtPrice}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Optional"
                      value={v.compareAtPriceEGP ?? ''}
                      onChange={(e) =>
                        handleFieldChange(
                          index,
                          'compareAtPriceEGP',
                          e.target.value ? parseFloat(e.target.value) || 0 : null
                        )
                      }
                      className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Stock Quantity */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.7rem] font-bold text-muted-foreground">
                      {labels.stock}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={v.stockQuantity ?? ''}
                      onChange={(e) =>
                        handleFieldChange(index, 'stockQuantity', parseInt(e.target.value, 10) || 0)
                      }
                      className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Active Toggle & Delete Action */}
                  <div className="flex items-center justify-between gap-3 pt-2 sm:pt-0">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={v.isActive}
                        onChange={(e) => handleFieldChange(index, 'isActive', e.target.checked)}
                        className="size-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-xs text-muted-foreground font-medium">
                        {v.isActive ? labels.active : labels.inactive}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(index)}
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
                      title={labels.removeVariant}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Validation Warnings */}
                {isDuplicateCombo && (
                  <p className="text-[0.7rem] font-semibold text-destructive">
                    {labels.duplicateComboWarning}
                  </p>
                )}
                {isDuplicateSku && (
                  <p className="text-[0.7rem] font-semibold text-destructive">
                    {labels.duplicateSkuWarning}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
