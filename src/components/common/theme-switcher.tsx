'use client';

import {useSyncExternalStore} from 'react';
import {Check, Laptop, Moon, Sun} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import {useTheme} from 'next-themes';
import {DropdownMenu} from 'radix-ui';
import {Button} from '@/components/ui/button';

const subscribe = () => () => {};

export function ThemeSwitcher() {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const locale = useLocale();
  const t = useTranslations('Theme');
  const {theme, setTheme} = useTheme();

  const options = [
    {value: 'light', label: t('light'), Icon: Sun},
    {value: 'dark', label: t('dark'), Icon: Moon},
    {value: 'system', label: t('system'), Icon: Laptop}
  ];

  return (
    <DropdownMenu.Root dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <DropdownMenu.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-11"
          aria-label={t('label')}
          title={t('label')}
          disabled={!mounted}
        >
          <Sun aria-hidden="true" className="size-4 dark:hidden" />
          <Moon aria-hidden="true" className="hidden size-4 dark:block" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-40 rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg outline-none"
        >
          <DropdownMenu.Label className="px-3 py-2 text-xs font-semibold text-muted-foreground">
            {t('label')}
          </DropdownMenu.Label>
          <DropdownMenu.RadioGroup value={theme ?? 'system'} onValueChange={setTheme}>
            {options.map(({value, label, Icon}) => (
              <DropdownMenu.RadioItem
                key={value}
                value={value}
                className="relative flex min-h-11 cursor-pointer items-center gap-2 rounded-md py-2 ps-3 pe-8 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground data-[state=checked]:font-medium"
              >
                <Icon aria-hidden="true" className="size-4" />
                {label}
                <DropdownMenu.ItemIndicator className="absolute end-2 inline-flex items-center">
                  <Check aria-hidden="true" className="size-4" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
