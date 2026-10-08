/**
 * Mates Store — Authoritative Domain and Database Contract
 *
 * This file defines the TypeScript domain types and Database interface
 * corresponding to the versioned SQL migrations in `supabase/migrations/`.
 *
 * Monetary values are strictly represented in integer minor units (cents / piastres)
 * to avoid floating-point rounding errors (e.g. 25000 = 250.00 EGP).
 */

export type ProductStatus = 'draft' | 'published' | 'archived';

export interface AdminUser {
  user_id: string;
  created_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Size {
  id: string;
  label: string;
  sort_order: number;
  created_at: string;
}

export interface Color {
  id: string;
  name_en: string;
  name_ar: string;
  hex_code: string;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  slug: string;
  title_en: string;
  title_ar: string;
  description_en: string | null;
  description_ar: string | null;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size_id: string;
  color_id: string;
  sku: string;
  price_cents: number;
  compare_at_price_cents: number | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  variant_id: string | null;
  storage_path: string;
  sort_order: number;
  is_cover: boolean;
  created_at: string;
}

export interface CouplesBundle {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  description_en: string | null;
  description_ar: string | null;
  first_product_id: string;
  second_product_id: string;
  bundle_price_cents: number;
  cover_image_path: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreSettings {
  id: number;
  whatsapp_number: string;
  currency_code: string;
  delivery_note_en: string | null;
  delivery_note_ar: string | null;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: AdminUser;
        Insert: {
          user_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: Category;
        Insert: {
          id?: string;
          slug: string;
          name_en: string;
          name_ar: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name_en?: string;
          name_ar?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sizes: {
        Row: Size;
        Insert: {
          id?: string;
          label: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          label?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      colors: {
        Row: Color;
        Insert: {
          id?: string;
          name_en: string;
          name_ar: string;
          hex_code: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name_en?: string;
          name_ar?: string;
          hex_code?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: {
          id?: string;
          category_id?: string | null;
          slug: string;
          title_en: string;
          title_ar: string;
          description_en?: string | null;
          description_ar?: string | null;
          status?: ProductStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          slug?: string;
          title_en?: string;
          title_ar?: string;
          description_en?: string | null;
          description_ar?: string | null;
          status?: ProductStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      product_variants: {
        Row: ProductVariant;
        Insert: {
          id?: string;
          product_id: string;
          size_id: string;
          color_id: string;
          sku: string;
          price_cents: number;
          compare_at_price_cents?: number | null;
          stock_quantity?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          size_id?: string;
          color_id?: string;
          sku?: string;
          price_cents?: number;
          compare_at_price_cents?: number | null;
          stock_quantity?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_variants_size_id_fkey";
            columns: ["size_id"];
            isOneToOne: false;
            referencedRelation: "sizes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_variants_color_id_fkey";
            columns: ["color_id"];
            isOneToOne: false;
            referencedRelation: "colors";
            referencedColumns: ["id"];
          }
        ];
      };
      product_images: {
        Row: ProductImage;
        Insert: {
          id?: string;
          product_id: string;
          variant_id?: string | null;
          storage_path: string;
          sort_order?: number;
          is_cover?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          variant_id?: string | null;
          storage_path?: string;
          sort_order?: number;
          is_cover?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_images_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          }
        ];
      };
      couples_bundles: {
        Row: CouplesBundle;
        Insert: {
          id?: string;
          slug: string;
          title_en: string;
          title_ar: string;
          description_en?: string | null;
          description_ar?: string | null;
          first_product_id: string;
          second_product_id: string;
          bundle_price_cents: number;
          cover_image_path?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title_en?: string;
          title_ar?: string;
          description_en?: string | null;
          description_ar?: string | null;
          first_product_id?: string;
          second_product_id?: string;
          bundle_price_cents?: number;
          cover_image_path?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "couples_bundles_first_product_id_fkey";
            columns: ["first_product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "couples_bundles_second_product_id_fkey";
            columns: ["second_product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      store_settings: {
        Row: StoreSettings;
        Insert: {
          id?: number;
          whatsapp_number: string;
          currency_code?: string;
          delivery_note_en?: string | null;
          delivery_note_ar?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          whatsapp_number?: string;
          currency_code?: string;
          delivery_note_en?: string | null;
          delivery_note_ar?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      product_status: ProductStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
