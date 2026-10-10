'use client';

import {useActionState} from 'react';
import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import {loginAction, type LoginState} from '@/features/admin-auth/actions';

const initialState: LoginState = {error: null};

export function AdminLoginForm({locale, next}: {locale: string; next: string}) {
  const t = useTranslations('AdminAuth');
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="next" value={next} />
      <div className="space-y-2">
        <label htmlFor="admin-email" className="block text-sm font-semibold">{t('email')}</label>
        <input id="admin-email" name="email" type="email" autoComplete="username" required maxLength={254}
          className="min-h-12 w-full rounded-lg border border-input bg-background px-4 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      </div>
      <div className="space-y-2">
        <label htmlFor="admin-password" className="block text-sm font-semibold">{t('password')}</label>
        <input id="admin-password" name="password" type="password" autoComplete="current-password" required maxLength={1024}
          className="min-h-12 w-full rounded-lg border border-input bg-background px-4 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      </div>
      {state.error && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground">
          {t(state.error)}
        </p>
      )}
      <Button type="submit" disabled={pending} className="min-h-12 w-full text-sm">
        {pending ? t('signingIn') : t('signIn')}
      </Button>
    </form>
  );
}
