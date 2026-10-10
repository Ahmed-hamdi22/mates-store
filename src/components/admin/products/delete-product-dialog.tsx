'use client';

import { useState } from 'react';
import { AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { Dialog } from 'radix-ui';
import { deleteProductAction } from '@/features/admin-products/actions';
import { useRouter } from '@/i18n/navigation';

interface DeleteProductDialogProps {
  productId: string;
  productTitle: string;
  locale: string;
  labels: {
    delete: string;
    title: string;
    description: string;
    confirm: string;
    cancel: string;
    deleting: string;
    errorGeneric: string;
  };
}

export function DeleteProductDialog({
  productId,
  productTitle,
  locale,
  labels
}: DeleteProductDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await deleteProductAction(productId);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to delete product.');
      } else {
        setOpen(false);
        router.refresh();
      }
    } catch {
      setErrorMessage('Failed to delete product. Please retry.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="inline-flex size-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:border-destructive hover:bg-destructive/10 hover:text-destructive focus-visible:outline-2 focus-visible:outline-ring">
        <Trash2 className="size-4" />
        <span className="sr-only">{labels.delete}</span>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-xs" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(90vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-xl outline-none">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-5" />
            </div>
            <div>
              <Dialog.Title className="text-base font-bold text-foreground">
                {labels.title}
              </Dialog.Title>
              <Dialog.Description className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                {labels.description.replace('{title}', productTitle)}
              </Dialog.Description>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
              {locale === 'ar' ? labels.errorGeneric : errorMessage}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <Dialog.Close asChild>
              <button
                type="button"
                disabled={isDeleting}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
              >
                {labels.cancel}
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex h-9 items-center gap-1.5 justify-center rounded-lg bg-destructive px-4 text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isDeleting && <Loader2 className="size-3.5 animate-spin" />}
              <span>{isDeleting ? labels.deleting : labels.confirm}</span>
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
