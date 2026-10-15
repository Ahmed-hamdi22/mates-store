import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProductForm } from '@/components/admin/products/product-form';
import { getAdminReferenceData } from '@/features/admin-products/queries';
import {requireAdmin} from '@/features/admin-auth/authorization';

interface NewProductPageProps {
  params: Promise<{ locale: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params
}: NewProductPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'AdminProducts' });
  return {
    title: `${t('newProductTitle')} — Mates Store Admin`,
    description: t('newProductSubtitle')
  };
}

export default async function NewProductPage({ params }: NewProductPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin(locale, `/${locale}/admin/products/new`);

  const [t, referenceData] = await Promise.all([
    getTranslations({ locale, namespace: 'AdminProducts' }),
    getAdminReferenceData()
  ]);

  const formLabels = {
    backToProducts: t('backToProducts'),
    createTitle: t('newProductTitle'),
    editTitle: t('editProductTitle'),
    generalSection: t('generalSection'),
    titleEn: t('titleEn'),
    titleEnPlaceholder: t('titleEnPlaceholder'),
    titleAr: t('titleAr'),
    titleArPlaceholder: t('titleArPlaceholder'),
    slug: t('slug'),
    slugPlaceholder: t('slugPlaceholder'),
    slugAutoGenerate: t('slugAutoGenerate'),
    category: t('category'),
    selectCategory: t('selectCategory'),
    noCategory: t('noCategory'),
    status: t('status'),
    statusDraft: t('statusDraft'),
    statusPublished: t('statusPublished'),
    statusArchived: t('statusArchived'),
    descriptionEn: t('descriptionEn'),
    descriptionEnPlaceholder: t('descriptionEnPlaceholder'),
    descriptionAr: t('descriptionAr'),
    descriptionArPlaceholder: t('descriptionArPlaceholder'),
    save: t('saveChanges'),
    saving: t('saving'),
    create: t('createProductButton'),
    creating: t('creating'),
    cancel: t('cancel'),
    successCreated: t('successCreated'),
    successUpdated: t('successUpdated'),
    saveFailed: t('saveFailed'),
    validationFailed: t('validationFailed'),
    imageManager: {
      title: t('imagesTitle'),
      description: t('imagesDescription'),
      uploadButton: t('uploadImageButton'),
      uploading: t('uploadingImage'),
      cover: t('coverBadge'),
      setAsCover: t('setAsCover'),
      remove: t('removeImage'),
      moveUp: t('moveUp'),
      moveDown: t('moveDown'),
      dragDropHint: t('dragDropHint'),
      maxSizeHint: t('maxSizeHint'),
      saveFirst: t('saveFirst'),
      errorGeneric: t('imageFailed')
    },
    variantEditor: {
      title: t('variantsTitle'),
      description: t('variantsDescription'),
      addVariant: t('addVariantButton'),
      removeVariant: t('removeVariantButton'),
      size: t('variantSize'),
      color: t('variantColor'),
      sku: t('variantSku'),
      price: t('variantPrice'),
      compareAtPrice: t('variantCompareAtPrice'),
      stock: t('variantStock'),
      active: t('variantActive'),
      inactive: t('variantInactive'),
      duplicateComboWarning: t('duplicateComboWarning'),
      duplicateSkuWarning: t('duplicateSkuWarning'),
      selectSize: t('selectSize'),
      selectColor: t('selectColor'),
      noVariantsNotice: t('noVariantsNotice')
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <ProductForm
        categories={referenceData.categories}
        sizes={referenceData.sizes}
        colors={referenceData.colors}
        locale={locale}
        isEdit={false}
        labels={formLabels}
      />
    </div>
  );
}
