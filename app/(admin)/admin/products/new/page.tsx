'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { generateSlug } from '@/lib/utils/slug';
import { compressImage } from '@/lib/utils/compressImage';
import {
  Save, Upload, X, Plus, Loader2,
  Package, Tag, DollarSign, Box, Image as ImageIcon,
  ChevronDown, ChevronRight
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

const buildCategoryTree = (categories: Category[], parentId: string | null = null): CategoryTreeNode[] => {
  return categories
    .filter(c => c.parent_id === parentId)
    .map(c => ({
      ...c,
      children: buildCategoryTree(categories, c.id)
    }));
};

function CategoryTreeNodeComponent({ 
  node, level, selectedId, onSelect, expandedIds, onToggle
}: { 
  node: CategoryTreeNode; level: number; selectedId: string;
  onSelect: (id: string) => void; expandedIds: string[]; onToggle: (id: string) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.includes(node.id);
  const isSelected = selectedId === node.id;

  return (
    <div>
      <div className="flex items-center gap-1" style={{ paddingLeft: `${level * 16}px` }}>
        {hasChildren ? (
          <button type="button" onClick={() => onToggle(node.id)} className="p-1 hover:bg-gray-100 rounded flex-shrink-0">
            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
          </button>
        ) : (
          <div className="w-6 flex-shrink-0" />
        )}
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition-all ${
            isSelected ? 'bg-[#1E3A5F] text-white font-medium shadow-sm' : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          {node.name}
        </button>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children.map(child => (
            <CategoryTreeNodeComponent
              key={child.id} node={child} level={level + 1} selectedId={selectedId}
              onSelect={onSelect} expandedIds={expandedIds} onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', short_description: '', category_id: '',
    brand: '', tags: [] as string[], regular_price: '', sale_price: '', cost_price: '',
    sku: '', barcode: '', stock_quantity: '0', track_inventory: true,
    product_type: 'physical' as 'physical' | 'digital' | 'service',
    weight: '', length: '', width: '', height: '',
    is_featured: false, meta_title: '', meta_description: '',
    product_condition: 'Sıfır - Kapalı Kutu',
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').eq('is_active', true).order('display_order');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, [supabase]);

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
      setImages(prev => [...prev, ...compressedFiles]);
      setImagePreviews(prev => [...prev, ...previews]);
    } catch (error) {
      console.error('Image compression error:', error);
      alert('Resim sıkıştırılırken hata oluştu');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

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
      let mainImageUrl = '';
      const galleryUrls: string[] = [];
      if (images.length > 0) {
        const imageUploadPromises = images.map(async (image, index) => {
          const fileExt = image.name.split('.').pop();
          const fileName = `${Date.now()}_${index}.${fileExt}`;
          const filePath = `products/${fileName}`;
          const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, image, { cacheControl: '3600', upsert: false });
          if (uploadError) throw uploadError;
          const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
          return publicUrl;
        });
        const uploadedUrls = await Promise.all(imageUploadPromises);
        mainImageUrl = uploadedUrls[0];
        galleryUrls.push(...uploadedUrls.slice(1));
      }

      const productData = {
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
        main_image: mainImageUrl || 'https://via.placeholder.com/400',
        is_featured: formData.is_featured,
        is_on_sale: Number(formData.sale_price) > 0,
        is_active: true,
        status: 'published',
        views_count: 0,
        meta_title: formData.meta_title || formData.name,
        meta_description: formData.meta_description || formData.short_description,
        product_condition: formData.product_condition,
      };

      const { data: product, error: productError } = await supabase.from('products').insert([productData]).select().single();
      if (productError) throw productError;

      if (galleryUrls.length > 0 && product) {
        const galleryInserts = galleryUrls.map((url, index) => ({
          product_id: product.id, image_url: url, alt_text: formData.name, display_order: index + 1,
        }));
        const { error: galleryError } = await supabase.from('product_images').insert(galleryInserts);
        if (galleryError) throw galleryError;
      }

      alert('Ürün başarıyla eklendi!');
      router.push('/admin/products');
    } catch (error: unknown) {
      console.error('Error saving product:', error);
      alert('Ürün kaydedilirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yeni Ürün Ekle</h1>
          <p className="text-sm text-gray-500 mt-1">Mağazaya yeni ürün eklemek için detayları doldurun</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">İptal</Link>
          <button onClick={handleSubmit} disabled={isSubmitting || !formData.name || !formData.regular_price} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1E3A5F] rounded-lg hover:bg-[#1A3354] disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSubmitting ? 'Kaydediliyor...' : 'Ürünü Kaydet'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-[#1E3A5F]" /> Temel Bilgiler</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Adı *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value, slug: slugManuallyEdited ? prev.slug : generateSlug(e.target.value) }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1E3A5F] outline-none" placeholder="Ürün adını girin" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slug (Ürün Bağlantısı)</label>
                  <input type="text" value={formData.slug} onChange={(e) => { setSlugManuallyEdited(true); setFormData({ ...formData, slug: e.target.value }); }} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1E3A5F] outline-none" placeholder="urun-url-slug" />
                  <p className="text-xs text-gray-500 mt-1">Ürün bağlantısında kullanılır, addan otomatik oluşturulur</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kısa Açıklama</label>
                  <textarea value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1E3A5F] outline-none resize-none" placeholder="Ürün kartında görünen kısa açıklama" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tam Açıklama</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={6} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1E3A5F] outline-none resize-none" placeholder="Ürünün detaylı açıklaması" />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-[#1E3A5F]" /> Fiyatlandırma</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Normal Fiyat *</label>
                  <input type="number" step="0.01" value={formData.regular_price} onChange={(e) => setFormData({ ...formData, regular_price: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1E3A5F] outline-none" placeholder="0.00" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">İndirimli Fiyat</label>
                  <input type="number" step="0.01" value={formData.sale_price} onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1E3A5F] outline-none" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maliyet Fiyatı</label>
                  <input type="number" step="0.01" value={formData.cost_price} onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1E3A5F] outline-none" placeholder="0.00" />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Box className="w-5 h-5 text-[#1E3A5F]" /> Stok ve Kargo</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stok Miktarı</label>
                    <input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1E3A5F] outline-none" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Tipi</label>
                    <select value={formData.product_type} onChange={(e) => setFormData({ ...formData, product_type: e.target.value as typeof formData.product_type })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1E3A5F] outline-none bg-white">
                      <option value="physical">Fiziksel</option>
                      <option value="digital">Dijital</option>
                      <option value="service">Hizmet</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="track_inventory" checked={formData.track_inventory} onChange={(e) => setFormData({ ...formData, track_inventory: e.target.checked })} className="w-4 h-4 text-[#1E3A5F] border-gray-300 rounded focus:ring-[#1E3A5F]" />
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-[#1E3A5F]" /> Ürün Görselleri</h2>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#1E3A5F] transition-colors">
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Görsel yüklemek için tıklayın veya sürükleyin</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP (otomatik sıkıştırılır)</p>
                  </label>
                </div>
                {uploadingImages && (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" /> Görseller sıkıştırılıyor...
                  </div>
                )}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                        <Image src={preview} alt={`Önizleme ${index + 1}`} fill unoptimized sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
                        {index === 0 && <span className="absolute top-2 left-2 px-2 py-1 bg-[#1E3A5F] text-white text-xs font-semibold rounded">Ana Görsel</span>}
                        <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Tag className="w-4 h-4 text-[#1E3A5F]" /> Kategori</h3>
              {formData.category_id && (
                <button type="button" onClick={() => setFormData({ ...formData, category_id: '' })} className="mb-3 text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
                  <X className="w-3 h-3" /> Seçimi Kaldır
                </button>
              )}
              <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                {categories && categories.length > 0 ? (
                  buildCategoryTree(categories).map(node => (
                    <CategoryTreeNodeComponent
                      key={node.id} node={node} level={0} selectedId={formData.category_id}
                      onSelect={(id) => setFormData({ ...formData, category_id: id })}
                      expandedIds={expandedCategories}
                      onToggle={(id) => setExpandedCategories(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Henüz kategori yok</p>
                )}
              </div>
              {formData.category_id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Seçili Kategori:</p>
                  <p className="text-sm font-semibold text-[#1E3A5F]">{categories?.find(c => c.id === formData.category_id)?.name || 'Seçili değil'}</p>
                </div>
              )}
            </div>

            {/* Brand & SKU & Condition */}
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
                  <input type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#1E3A5F] outline-none" placeholder="Örn: Samsung" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                  <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#1E3A5F] outline-none" placeholder="Ürün kodu" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Barkod</label>
                  <input type="text" value={formData.barcode} onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#1E3A5F] outline-none" placeholder="Ürün barkodu" />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Etiketler</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#1E3A5F] outline-none" placeholder="Etiket ekle..." />
                  <button type="button" onClick={addTag} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"><Plus className="w-4 h-4" /></button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
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
                  <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="w-4 h-4 text-[#1E3A5F] border-gray-300 rounded focus:ring-[#1E3A5F]" />
                  <span className="text-sm text-gray-700">Öne Çıkan Ürün</span>
                </label>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">SEO</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SEO Başlığı</label>
                  <input type="text" value={formData.meta_title} onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#1E3A5F] outline-none" placeholder="Arama motorlarında görünecek başlık" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SEO Açıklaması</label>
                  <textarea value={formData.meta_description} onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#1E3A5F] outline-none resize-none" placeholder="Arama motorlarında görünecek açıklama" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}