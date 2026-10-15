# Admin Products integration

The product management routes are integrated with the shared admin authentication module. Each product page calls `requireAdmin(locale, returnTo)` directly. Every product query and Server Action calls `getProductAdminClient()` before its data or mutation logic; that helper invokes the same `requireAdmin` check and then creates a request-scoped Supabase client. Authorization redirects and errors happen outside broad product error handlers. Existing RLS remains enabled.

Future privileged product routes and actions must call `requireAdmin` independently; the protected admin layout alone is insufficient. The auth branch's layout provides redirects and the shared dashboard shell. The English and Arabic messages retain `AdminAuth`, `AdminDashboard`, and `AdminProducts` namespaces.

Images can be added after the product is saved. Upload creates a Storage object and a matching `product_images` row; a failed row insert triggers Storage cleanup. Image removal deletes the row and Storage object with a best-effort row restoration if Storage removal fails. A product with images must have its images removed before product deletion, preventing cascade-created Storage orphans.

Product and variant edits use multiple Supabase requests because the existing schema exposes no transactional product-management RPC. A later failure is reported instead of being presented as success, but an earlier successful write cannot be rolled back atomically without a new database function. Review and reload the product after a reported partial update. No migration or RLS change was made here.
