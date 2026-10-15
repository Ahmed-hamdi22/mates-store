# Mates Store

A full-stack e-commerce platform for individual clothing and matching couples outfits, built with Next.js 16, TypeScript, Tailwind CSS 4, and Supabase.

## Tech Stack

- Next.js 16 (App Router) & React 19
- TypeScript
- Tailwind CSS 4 & shadcn/ui
- Supabase PostgreSQL, Auth & Storage
- next-intl (English / Arabic, RTL / LTR)
- Light / Dark / System themes
- Yarn

## Features

### Storefront

- Responsive homepage with Hero Slider
- Product catalog with search, filters, and sorting
- Product cards with real Supabase data
- Product details preview
- Arabic and English localization
- Responsive navigation and footer

### Admin Dashboard

- Secure admin login and logout
- Server-side authentication and authorization
- Protected admin routes
- Product creation and editing
- Size and color variant management
- Product prices and inventory
- Product image management
- Draft, Published, and Archived statuses

### Planned

- Couples bundle management
- Shopping cart
- WhatsApp checkout
- Store settings

## Getting Started

Install dependencies:

```bash
yarn install
```

Create `.env.local` using `.env.example` and configure your Supabase credentials.

Start the development server:

```bash
yarn dev
```

## Routes

| Route                | Description        |
| -------------------- | ------------------ |
| `/en`                | English storefront |
| `/ar`                | Arabic storefront  |
| `/en/products`       | Product catalog    |
| `/en/admin/login`    | Admin login        |
| `/en/admin`          | Admin Dashboard    |
| `/en/admin/products` | Product management |

Arabic equivalents are also available for admin and product routes.

## Quality Checks

```bash
yarn lint
yarn tsc --noEmit
yarn build
```

## Admin Access

Admin authentication uses Supabase Auth. Users must also be authorized in the `admin_users` table.

No default admin credentials are provided.

## Project Status

The storefront, catalog, admin authentication, and product management features are implemented.

End-to-end testing of product creation, editing, and image uploads is still required before production release.
