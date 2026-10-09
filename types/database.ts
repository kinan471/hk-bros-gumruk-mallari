export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  category_id: string | null;
  main_image: string;
  brand: string | null;
  tags: string[];
  regular_price: number | null;
  sale_price: number | null;
  cost_price: number | null;
  tax_rate: number;
  sku: string | null;
  barcode: string | null;
  track_inventory: boolean;
  stock_quantity: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'pre_order';
  video_url: string | null;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  product_type: 'physical' | 'digital' | 'service';
  product_condition: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_featured: boolean;
  is_slider: boolean;
  is_on_sale: boolean;
  status: 'draft' | 'published' | 'pending';
  views_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categories?: { name: string; slug: string } | null;
};

export type ProductCardProduct = Pick<
  Product,
  | 'id'
  | 'name'
  | 'slug'
  | 'main_image'
  | 'regular_price'
  | 'sale_price'
> &
  Partial<
    Pick<
      Product,
      | 'brand'
      | 'track_inventory'
      | 'stock_quantity'
      | 'stock_status'
      | 'product_type'
      | 'is_featured'
    >
  > & {
  product_condition?: string | null;
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  created_at: string;
};