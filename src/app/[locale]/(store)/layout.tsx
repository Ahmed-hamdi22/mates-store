import {StoreFooter} from '@/components/layout/store-footer';
import {StoreHeader} from '@/components/layout/store-header';

export default function StoreLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader />
      <main className="flex-1">{children}</main>
      <StoreFooter />
    </div>
  );
}
