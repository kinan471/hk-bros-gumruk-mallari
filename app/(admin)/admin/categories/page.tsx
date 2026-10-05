'use client';

import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { compressImage } from '@/lib/utils/compressImage';
import { generateSlug } from '@/lib/utils/slug';
import { Category } from '@/types/database';
import Image from 'next/image';
import {
  Plus, Edit, Trash2, Eye, EyeOff,
  Loader2, Check, X, Folder, FolderOpen, ChevronRight, ChevronDown, ImagePlus
} from 'lucide-react';

interface CategoryTreeNode extends Category {
  level: number;
  children: CategoryTreeNode[];
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState<File | null>(null);
  const [addingSubTo, setAddingSubTo] = useState<string | null>(null);
  const [newSubCategoryName, setNewSubCategoryName] = useState('');
  const [newSubCategoryImage, setNewSubCategoryImage] = useState<File | null>(null);
  const newCategoryImageInputRef = useRef<HTMLInputElement>(null);

  const uploadCategoryImage = async (file: File) => {
    const compressedFile = await compressImage(file);
    const extension = compressedFile.type === 'image/webp'
      ? 'webp'
      : compressedFile.type === 'image/png'
        ? 'png'
        : 'jpg';
    const filePath = `categories/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, compressedFile, { cacheControl: '31536000', upsert: false });
    if (error) throw error;

    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
    return { filePath, imageUrl: data.publicUrl };
  };

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, is_active, parent_id, display_order, image_url')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

  const addCategoryMutation = useMutation({
    mutationFn: async ({ name, image }: { name: string; image: File | null }) => {
      const uploadedImage = image ? await uploadCategoryImage(image) : null;
      const { error } = await supabase
        .from('categories')
        .insert([{
          name,
          slug: generateSlug(name),
          is_active: true,
          display_order: 0,
          image_url: uploadedImage?.imageUrl ?? null,
        }]);
      if (error) {
        if (uploadedImage) {
          const { error: cleanupError } = await supabase.storage
            .from('product-images')
            .remove([uploadedImage.filePath]);
          if (cleanupError) console.error('Category image cleanup failed:', cleanupError);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setNewCategoryName('');
      setNewCategoryImage(null);
      if (newCategoryImageInputRef.current) newCategoryImageInputRef.current.value = '';
    },
  });

  const addSubCategoryMutation = useMutation({
    mutationFn: async ({ name, parentId, image }: { name: string; parentId: string; image: File | null }) => {
      const uploadedImage = image ? await uploadCategoryImage(image) : null;
      const { error } = await supabase
        .from('categories')
        .insert([{
          name,
          slug: generateSlug(name),
          parent_id: parentId,
          is_active: true,
          display_order: 0,
          image_url: uploadedImage?.imageUrl ?? null,
        }]);
      if (error) {
        if (uploadedImage) {
          const { error: cleanupError } = await supabase.storage
            .from('product-images')
            .remove([uploadedImage.filePath]);
          if (cleanupError) console.error('Category image cleanup failed:', cleanupError);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setNewSubCategoryName('');
      setNewSubCategoryImage(null);
      setAddingSubTo(null);
    },
  });

  const updateImageMutation = useMutation({
    mutationFn: async ({ id, image }: { id: string; image: File }) => {
      const uploadedImage = await uploadCategoryImage(image);
      const { error } = await supabase
        .from('categories')
        .update({ image_url: uploadedImage.imageUrl })
        .eq('id', id);
      if (error) {
        const { error: cleanupError } = await supabase.storage
          .from('product-images')
          .remove([uploadedImage.filePath]);
        if (cleanupError) console.error('Category image cleanup failed:', cleanupError);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from('categories')
        .update({ name, slug: generateSlug(name) })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !isActive })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  const toggleExpand = (id: string) => {
    setExpandedCategories(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAddMainCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      addCategoryMutation.mutate({ name: newCategoryName.trim(), image: newCategoryImage });
    }
  };

  const handleAddSubCategory = (parentId: string) => {
    if (newSubCategoryName.trim()) {
      addSubCategoryMutation.mutate({
        name: newSubCategoryName.trim(),
        parentId,
        image: newSubCategoryImage,
      });
    }
  };

  const handleSaveEdit = (id: string, name: string) => {
    if (name.trim()) {
      updateMutation.mutate({ id, name: name.trim() });
    }
  };

  const buildTree = (parentId: string | null = null, level: number = 0): CategoryTreeNode[] => {
    if (!categories) return [];
    return categories
      .filter(c => c.parent_id === parentId)
      .map(c => ({
        ...c,
        level,
        children: buildTree(c.id, level + 1)
      }));
  };

  const renderTree = (nodes: CategoryTreeNode[]) => {
    return nodes.map(node => {
      const hasChildren = node.children.length > 0;
      const isExpanded = expandedCategories.includes(node.id);
      const isEditing = editingId === node.id;
      const isAddingSub = addingSubTo === node.id;

      return (
        <div key={node.id}>
          <div className={`flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${node.level > 0 ? 'bg-gray-50/50' : ''}`}>
            <div className="flex items-center gap-3 flex-1">
              <div style={{ width: `${node.level * 24}px` }} />
              {hasChildren ? (
                <button onClick={() => toggleExpand(node.id)} className="p-1 hover:bg-gray-200 rounded">
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                </button>
              ) : (
                <div className="w-6" />
              )}
              {node.image_url ? (
                <Image
                  src={node.image_url}
                  alt=""
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-md object-cover"
                />
              ) : node.level === 0 ? (
                <FolderOpen className="w-5 h-5 text-[#1E3A5F]" />
              ) : (
                <Folder className="w-4 h-4 text-gray-500" />
              )}
              
              {isEditing ? (
                <input
                  type="text"
                  defaultValue={node.name}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveEdit(node.id, (e.target as HTMLInputElement).value);
                    } else if (e.key === 'Escape') {
                      setEditingId(null);
                    }
                  }}
                  onBlur={(e) => handleSaveEdit(node.id, e.target.value)}
                  className="px-2 py-1 border border-[#1E3A5F] rounded text-sm focus:outline-none"
                />
              ) : (
                <div>
                  <p className="font-semibold text-gray-900">{node.name}</p>
                  <p className="text-xs text-gray-500">/{node.slug}</p>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <label
                htmlFor={`category-image-${node.id}`}
                className="p-2 text-[#1E3A5F] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="Kategori görseli yükle"
              >
                <ImagePlus className="w-4 h-4" />
              </label>
              <input
                id={`category-image-${node.id}`}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => {
                  const image = event.target.files?.[0];
                  if (image) updateImageMutation.mutate({ id: node.id, image });
                  event.target.value = '';
                }}
              />
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${node.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {node.is_active ? 'Aktif' : 'Pasif'}
              </span>
              
              <button
                onClick={() => toggleStatusMutation.mutate({ id: node.id, isActive: node.is_active })}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                title={node.is_active ? 'Pasifleştir' : 'Aktifleştir'}
              >
                {node.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setEditingId(node.id)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Düzenle"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setAddingSubTo(node.id)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Alt Kategori Ekle"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) {
                    deleteMutation.mutate(node.id);
                  }
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Inline Add Subcategory */}
          {isAddingSub && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border-b border-gray-100">
              <div style={{ width: `${(node.level + 1) * 24 + 24}px` }} />
              <input
                type="text"
                value={newSubCategoryName}
                onChange={(e) => setNewSubCategoryName(e.target.value)}
                placeholder="Alt kategori adı..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSubCategory(node.id);
                  } else if (e.key === 'Escape') {
                    setAddingSubTo(null);
                    setNewSubCategoryName('');
                  }
                }}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:border-[#1E3A5F] outline-none"
              />
              <label
                htmlFor={`sub-category-image-${node.id}`}
                title={newSubCategoryImage?.name ?? 'Kategori görseli seç'}
                className="inline-flex max-w-40 items-center gap-1 px-2 py-1.5 text-sm text-[#1E3A5F] bg-white border border-gray-200 rounded cursor-pointer hover:bg-blue-50"
              >
                <ImagePlus className="w-4 h-4 shrink-0" />
                <span className="truncate">{newSubCategoryImage?.name ?? 'Görsel'}</span>
              </label>
              <input
                id={`sub-category-image-${node.id}`}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => {
                  setNewSubCategoryImage(event.target.files?.[0] ?? null);
                  event.target.value = '';
                }}
              />
              <button
                onClick={() => handleAddSubCategory(node.id)}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setAddingSubTo(null);
                  setNewSubCategoryName('');
                  setNewSubCategoryImage(null);
                }}
                className="px-3 py-1.5 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {hasChildren && isExpanded && (
            <div className="border-l-2 border-gray-200 ml-4">
              {renderTree(node.children)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Kategoriler</h1>
        <p className="text-sm text-gray-500 mt-1">Mağaza kategorilerini yönetin</p>
      </div>

      {/* Quick Add Main Category */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <form onSubmit={handleAddMainCategory} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Yeni ana kategori adı..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 outline-none"
            />
            <label
              htmlFor="new-category-image"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-[#1E3A5F]/20 text-[#1E3A5F] rounded-lg font-medium cursor-pointer hover:bg-[#1E3A5F]/5 transition-colors"
            >
              <ImagePlus className="w-4 h-4" />
              {newCategoryImage ? newCategoryImage.name : 'Arka plan görseli'}
            </label>
            <input
              id="new-category-image"
              ref={newCategoryImageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => setNewCategoryImage(event.target.files?.[0] ?? null)}
            />
            <button
              type="submit"
              disabled={!newCategoryName.trim() || addCategoryMutation.isPending}
              className="flex items-center justify-center gap-2 bg-[#1E3A5F] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#1A3354] disabled:opacity-50"
            >
              {addCategoryMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Kategori Ekle
            </button>
          </div>
          {(addCategoryMutation.error || addSubCategoryMutation.error || updateImageMutation.error) && (
            <p role="alert" className="text-sm text-red-600">
              Kategori işlemi tamamlanamadı: {
                (addCategoryMutation.error || addSubCategoryMutation.error || updateImageMutation.error) instanceof Error
                  ? (addCategoryMutation.error || addSubCategoryMutation.error || updateImageMutation.error)?.message
                  : 'Lütfen tekrar deneyin.'
              }
            </p>
          )}
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-[#1E3A5F]" />
          </div>
        ) : categories && categories.length > 0 ? (
          <div>
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600 uppercase">
              <span className="flex-1 ml-9">Kategori Adı</span>
              <div className="flex items-center gap-2">
                <span className="w-20 text-center">Durum</span>
                <span className="w-40 text-right">İşlemler</span>
              </div>
            </div>
            {renderTree(buildTree())}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-2">Henüz kategori yok</p>
            <p>Yukarıdan ilk kategorinizi ekleyin</p>
          </div>
        )}
      </div>
    </div>
  );
}