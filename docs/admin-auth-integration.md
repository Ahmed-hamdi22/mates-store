# Admin authentication integration

This branch owns `/[locale]/admin/login`, the protected `/[locale]/admin` layout, and the dashboard shell. Product management is owned by `feature/admin-products`.

## Protection contract for product routes and mutations

- Place product routes under `src/app/[locale]/(admin)/admin/products/` so the admin shell wraps them.
- At the start of **every** product Server Component, Route Handler, and Server Action, call `requireAdmin(locale, returnTo)` from `src/features/admin-auth/authorization.ts`. The layout is a UI boundary and must not be the sole authorization check for mutations or data reads.
- `requireAdmin` verifies the current Supabase user with `auth.getUser()` and calls the existing `public.is_admin()` SQL function. It returns a trusted `{id, email}` or redirects/rejects. Do not accept an admin ID or authorization flag from the browser.
- Keep all product queries and writes on the request-scoped Supabase client from `src/lib/supabase/server.ts`; existing RLS remains the database boundary. Never use a service-role client in the app.
- For login return navigation, only same-locale `/admin` paths are accepted by `safeAdminReturnTo`.
- Add product-specific copy only in `AdminProducts` translations. This branch adds `AdminAuth` and `AdminDashboard` without changing existing namespaces.

## Local setup and admin provisioning

The dedicated worktree needs an ignored `.env.local` containing `NEXT_PUBLIC_SUPABASE_URL` and either `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Do not put service-role credentials in the app.

An authorized owner must create or identify a Supabase Auth user using the Supabase dashboard, then insert that user's verified UUID into `public.admin_users` through a trusted administrative SQL session. The table has no client INSERT policy. No admin account is created by this branch. Authentication alone never grants admin access.
