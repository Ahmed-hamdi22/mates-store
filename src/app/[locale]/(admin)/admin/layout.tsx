import {AdminShell} from '@/components/admin/admin-shell';
import {requireAdmin} from '@/features/admin-auth/authorization';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({children, params}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const admin = await requireAdmin(locale);
  return <AdminShell email={admin.email}>{children}</AdminShell>;
}
