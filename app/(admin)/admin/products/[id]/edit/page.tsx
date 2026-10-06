'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { generateSlug } from '@/lib/utils/slug';
import { compressImage } from '@/lib/utils/compressImage';
import {
  Save, Upload, X, Plus, Loader2,
  Package, Tag, DollarSign, Box, Image as ImageIcon,
  ChevronDown, ChevronRight, ArrowLeft, Trash2
} from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

interface ProductImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
}

type ProductType = 'physical' | 'digital' | 'service';

// بناء شجرة الفئات المتداخلة
const buildCategoryTree = (categories: Category[], parentId: string | null = null): CategoryTreeNode[] => {
  return categories
    .filter(c => c.parent_id === parentId)
    .map(c => ({
      ...c,
      children: buildCategoryTree(categories, c.id)
    }));
};

// مكون عرض عقدة الفئة
function CategoryTreeNodeComponent({ 
  node, 
  level, 
  selectedId, 
  onSelect,
  expandedIds,
  onToggle
}: { 
  node: CategoryTreeNode;
  level: number;
  selectedId: string;
  onSelect: (id: string) => void;
  expandedIds: string[];
  onToggle: (id: string) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.includes(node.id);
  const isSelected = selectedId === node.id;

  return (
    <div>
      <div 
        className="flex items-center gap-1"
        style={{ paddingLeft: `${level * 16}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(node.id)}
            className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>
        ) : (
          <div className="w-6 flex-shrink-0" />
        )}
        
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition-all ${
            isSelected
              ? 'bg-[#1E3A5F] text-white font-medium shadow-sm'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          {node.name}
        </button>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map(child => (
            <CategoryTreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const queryClient = useQueryClient();
  const supabase = createClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [deletingImage, setDeletingImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    category_id: '',
    brand: '',
    tags: [] as string[],
    regular_price: '',
    sale_price: '',
    cost_price: '',
    sku: '',
    barcode: '',
    stock_quantity: '0',
    track_inventory: true,
    product_type: 'physical' as ProductType,
    weight: '',
    length: '',
    width: '',
    height: '',
    is_featured: false,
    is_on_sale: false,
    meta_title: '',
    meta_description: '',
    product_condition: 'Sıfır - Kapalı Kutu',
    is_slider: false, // ✅ تمت الإضافة: خيار عرض المنتج في السلايدر
  });

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });

  const { data: galleryImages } = useQuery({
    queryKey: ['product-images', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('display_order');
      if (error) throw error;
      return data as ProductImage[];
    },
    enabled: !!productId,
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data as Category[];
    },
  });

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        short_description: product.short_description || '',
        category_id: product.category_id || '',
        brand: product.brand || '',
        tags: product.tags || [],
        regular_price: product.regular_price?.toString() || '',
        sale_price: product.sale_price?.toString() || '',
        cost_price: product.cost_price?.toString() || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        stock_quantity: product.stock_quantity?.toString() || '0',
        track_inventory: product.track_inventory ?? true,
        product_type: (product.product_type as ProductType) || 'physical',
        weight: product.weight?.toString() || '',
        length: product.length?.toString() || '',
        width: product.width?.toString() || '',
        height: product.height?.toString() || '',
        is_featured: product.is_featured || false,
        is_on_sale: product.is_on_sale || false,
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        product_condition: product.product_condition || 'Sıfır - Kapalı Kutu',
        is_slider: product.is_slider || false, // ✅ تمت الإضافة: تحميل حالة السلايدر
      });
    }
  }, [product]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (formData.name && product && formData.slug === product.slug) {
      setFormData(prev => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [formData.name]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (formData.sale_price && parseFloat(formData.sale_price) > 0) {
      setFormData(prev => ({ ...prev, is_on_sale: true }));
    } else {
      setFormData(prev => ({ ...prev, is_on_sale: false }));
    }
  }, [formData.sale_price]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImages(true);
    const compressedFiles: File[] = [];
    const previews: string[] = [];

    try {
      for (const file of files) {
        const compressed = await compressImage(file);
        compressedFiles.push(compressed);
        previews.push(URL.createObjectURL(compressed));
      }

      setNewImages(prev => [...prev, ...compressedFiles]);
      setNewImagePreviews(prev => [...prev, ...previews]);
    } catch (error) {
      console.error('Image compression error:', error);
      alert('Resim sıkıştırılırken hata oluştu');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const { error } = await supabase.from('product_images').delete().eq('id', imageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-images', productId] });
      setDeletingImage(null);
    },
  });

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newGalleryUrls: string[] = [];
      let newMainImageUrl = '';

      if (newImages.length > 0) {
        const imageUploadPromises = newImages.map(async (image, index) => {
          const fileExt = image.name.split('.').pop();
          const fileName = `${Date.now()}_${index}.${fileExt}`;
          const filePath = `products/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, image, { cacheControl: '3600', upsert: false });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

          return publicUrl;
        });

        const uploadedUrls = await Promise.all(imageUploadPromises);
        newMainImageUrl = uploadedUrls[0];
        newGalleryUrls.push(...uploadedUrls.slice(1));
      }

      const productData: Record<string, unknown> = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description,
        short_description: formData.short_description,
        category_id: formData.category_id || null,
        brand: formData.brand || null,
        tags: formData.tags,
        regular_price: parseFloat(formData.regular_price) || null,
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        sku: formData.sku || null,
        barcode: formData.barcode || null,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        track_inventory: formData.track_inventory,
        stock_status: formData.track_inventory && parseInt(formData.stock_quantity) > 0 ? 'in_stock' : 'out_of_stock',
        product_type: formData.product_type,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        length: formData.length ? parseFloat(formData.length) : null,
        width: formData.width ? parseFloat(formData.width) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        is_featured: formData.is_featured,
        is_on_sale: formData.is_on_sale,
        is_slider: formData.is_slider, // ✅ تمت الإضافة: حفظ حالة السلايدر
        meta_title: formData.meta_title || formData.name,
        meta_description: formData.meta_description || formData.short_description,
        product_condition: formData.product_condition,
        updated_at: new Date().toISOString(),
      };

      if (newMainImageUrl) {
        productData.main_image = newMainImageUrl;
      }

      const { error: productError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId);

      if (productError) throw productError;

      if (newGalleryUrls.length > 0) {
        const galleryInserts = newGalleryUrls.map((url, index) => ({
          product_id: productId,
          image_url: url,
          alt_text: formData.name,
          display_order: index + 1,
        }));

        const { error: galleryError } = await supabase
          .from('product_images')
          .insert(galleryInserts);

        if (galleryError) throw galleryError;
      }

      alert('Ürün başarıyla güncellendi!');
      router.push('/admin/products');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
      console.error('Error updating product:', error);
      alert('Ürün güncellenirken hata oluştu: ' + message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="p-6 sm:p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-[#1E3A5F]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 sm:p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ürün Bulunamadı</h2>
        <Link href="/admin/products" className="inline-flex items-center gap-2 bg-[#1E3A5F] text-white px-4 py-2 rounded-lg hover:bg-[#1A3354]">
          <ArrowLeft className="w-4 h-4" />
          Ürünlere Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ürünü Düzenle</h1>
            <p className="text-sm text-gray-500 mt-1">{product.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">İptal</Link>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name || !formData.regular_price}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1E3A5F] rounded-lg hover:bg-[#1A3354] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#1E3A5F]" />
                Temel Bilgiler
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Adı *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1E3A5F] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1E3A5F] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kısa Açıklama</label>
                  <textarea
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1E3A5F] outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tam Açıklama</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1E3A5F] outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#1E3A5F]" />
                Fiyatlandırma
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Normal Fiyat *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.regular_price}
                    onChange={(e) => setFormData({ ...formData, regular_price: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1E3A5F] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">İndirimli Fiyat</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1E3A5F] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maliyet Fiyatı</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1E3A5F] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Box className="w-5 h-5 text-[#1E3A5F]" />
                Stok ve Kargo
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stok Miktarı</label>
                    <input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1E3A5F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Tipi</label>
                    <select
                      value={formData.product_type}
                      onChange={(e) => setFormData({ ...formData, product_type: e.target.value as ProductType })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1E3A5F] outline-none bg-white"
                    >
                      <option value="physical">Fiziksel</option>
                      <option value="digital">Dijital</option>
                      <option value="service">Hizmet</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="track_inventory"
                    checked={formData.track_inventory}
                    onChange={(e) => setFormData({ ...formData, track_inventory: e.target.checked })}
                    className="w-4 h-4 text-[#1E3A5F] border-gray-300 rounded focus:ring-[#1E3A5F]"
                  />
                  <label htmlFor="track_inventory" className="text-sm text-gray-700">Stok Takibi</label>
                </div>

                {formData.product_type === 'physical' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Boyutlar ve Ağırlık</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <input type="number" step="0.01" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#1E3A5F] outline-none" placeholder="Ağırlık (kg)" />
                      <input type="number" step="0.01" value={formData.length} onChange={(e) => setFormData({ ...formData, length: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#1E3A5F] outline-none" placeholder="Uzunluk (cm)" />
                      <input type="number" step="0.01" value={formData.width} onChange={(e) => setFormData({ ...formData, width: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#1E3A5F] outline-none" placeholder="Genişlik (cm)" />
                      <input type="number" step="0.01" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#1E3A5F] outline-none" placeholder="Yükseklik (cm)" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#1E3A5F]" />
                Ürün Görselleri
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ana Görsel</label>
                <div className="aspect-square max-w-xs bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <img src={product.main_image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Yeni görsel yüklerseniz, ilk yüklenen görsel ana görsel olarak ayarlanır</p>
              </div>

              {galleryImages && galleryImages.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Galeri Görselleri ({galleryImages.length})</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {galleryImages.map((img) => (
                      <div key={img.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                        <img src={img.image_url} alt={img.alt_text || product.name} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Bu görseli silmek istediğinize emin misiniz?')) {
                              setDeletingImage(img.id);
                              deleteImageMutation.mutate(img.id);
                            }
                          }}
                          disabled={deletingImage === img.id}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        >
                          {deletingImage === img.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#1E3A5F] transition-colors">
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Yeni görsel yüklemek için tıklayın</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP</p>
                </label>
              </div>

              {uploadingImages && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Görseller sıkıştırılıyor...
                </div>
              )}

              {newImagePreviews.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Görseller ({newImagePreviews.length})</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {newImagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                        <img src={preview} alt={`Yeni ${index + 1}`} className="w-full h-full object-cover" />
                        {index === 0 && (
                          <span className="absolute top-2 left-2 px-2 py-1 bg-[#1E3A5F] text-white text-xs font-semibold rounded">Yeni Ana Görsel</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category - شجرة متداخلة كاملة */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#1E3A5F]" />
                Kategori
              </h3>
              
              {formData.category_id && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, category_id: '' })}
                  className="mb-3 text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Seçimi Kaldır
                </button>
              )}

              <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                {categories && categories.length > 0 ? (
                  buildCategoryTree(categories).map(node => (
                    <CategoryTreeNodeComponent
                      key={node.id}
                      node={node}
                      level={0}
                      selectedId={formData.category_id}
                      onSelect={(id) => setFormData({ ...formData, category_id: id })}
                      expandedIds={expandedCategories}
                      onToggle={(id) => {
                        setExpandedCategories(prev =>
                          prev.includes(id)
                            ? prev.filter(i => i !== id)
                            : [...prev, id]
                        );
                      }}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Henüz kategori yok</p>
                )}
              </div>

              {formData.category_id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Seçili Kategori:</p>
                  <p className="text-sm font-semibold text-[#1E3A5F]">
                    {categories?.find(c => c.id === formData.category_id)?.name || 'Seçili değil'}
                  </p>
                </div>
              )}
            </div>

            {/* Brand, SKU & Condition */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Detaylar</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Durumu</label>
                  <select
                    value={formData.product_condition}
                    onChange={(e) => setFormData({ ...formData, product_condition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#1E3A5F] outline-none bg-white"
                  >
                    <option value="Sıfır - Kapalı Kutu">🟢 Sıfır - Kapalı Kutu</option>
                    <option value="Kutu Açılmış - Kullanılmamış">🟡 Kutu Açılmış - Kullanılmamış</option>
                    <option value="Teşhir Ürünü">🟠 Teşhir Ürünü</option>
                    <option value="Hafif Kozmetik Hasarlı">🟤 Hafif Kozmetik Hasarlı</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Müşteriye şeffaflık sağlamak için doğru durumu seçin.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Marka</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#1E3A5F] outline-none"
                    placeholder="Örn: Samsung"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#1E3A5F] outline-none"
                    placeholder="Ürün kodu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Barkod</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#1E3A5F] outline-none"
                    placeholder="Ürün barkodu"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Etiketler</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#1E3A5F] outline-none"
                    placeholder="Etiket ekle..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Seçenekler</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 text-[#1E3A5F] border-gray-300 rounded focus:ring-[#1E3A5F]"
                  />
                  <span className="text-sm text-gray-700">Öne Çıkan Ürün</span>
                </label>
                
                {/* ✅ خيار عرض المنتج في السلايدر */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_slider}
                    onChange={(e) => setFormData({ ...formData, is_slider: e.target.checked })}
                    className="w-4 h-4 text-[#1E3A5F] border-gray-300 rounded focus:ring-[#1E3A5F]"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-700 font-medium">Ana Sayfa Slider&apos;da Göster</span>
                    <span className="text-xs text-gray-500">Ürün ana sayfadaki büyük slider&apos;da görünecek</span>
                  </div>
                </label>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">SEO</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SEO Başlığı</label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#1E3A5F] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SEO Açıklaması</label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#1E3A5F] outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}