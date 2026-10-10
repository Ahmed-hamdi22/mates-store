# Admin Products integration

This standalone branch starts from Commit 05, so it deliberately does not import the unmerged admin-auth module. `access.ts` performs a fail-closed request-scoped `auth.getUser()` and `is_admin()` check before product reads and writes. Existing RLS remains enabled.

After `feature/admin-auth` is merged, replace the temporary product guard with `requireAdmin(locale, returnTo)` from `src/features/admin-auth/authorization.ts`. Call that helper in each product page, each product Server Action, and any future privileged route handler; do not rely on the admin layout alone. The auth branch's protected layout then provides redirects and the shared dashboard shell. Resolve the two branches' separate `en.json` and `ar.json` additions by retaining `AdminAuth`, `AdminDashboard`, and `AdminProducts` namespaces.

Images can be added after the product is saved. Upload creates a Storage object and a matching `product_images` row; a failed row insert triggers Storage cleanup. Image removal deletes the row and Storage object with a best-effort row restoration if Storage removal fails. A product with images must have its images removed before product deletion, preventing cascade-created Storage orphans.

Product and variant edits use multiple Supabase requests because the existing schema exposes no transactional product-management RPC. A later failure is reported instead of being presented as success, but an earlier successful write cannot be rolled back atomically without a new database function. Review and reload the product after a reported partial update. No migration or RLS change was made here.
