'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import {
  Plus, Search, Trash2, Edit, Loader2, Package,
  DollarSign, Calendar, TrendingUp, X, Save
} from 'lucide-react';

interface Purchase {
  id: string;
  product_name: string;
  product_id?: string;
  supplier: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  purchase_date: string;
  notes?: string;
  created_at: string;
}

export default function AdminPurchasesPage() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  
  const [formData, setFormData] = useState({
    product_name: '',
    product_id: '',
    supplier: '',
    quantity: '',
    unit_cost: '',
    purchase_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const { data: purchases, isLoading } = useQuery({
    queryKey: ['admin-purchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .order('purchase_date', { ascending: false });
      if (error) throw error;
      return data as Purchase[];
    },
  });

  const addPurchaseMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const quantity = parseFloat(data.quantity);
      const unitCost = parseFloat(data.unit_cost);
      const { error } = await supabase
        .from('purchases')
        .insert([{
          product_name: data.product_name,
          product_id: data.product_id || null,
          supplier: data.supplier,
          quantity,
          unit_cost: unitCost,
          total_cost: quantity * unitCost,
          purchase_date: data.purchase_date,
          notes: data.notes || null,
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-purchases'] });
      setShowAddModal(false);
      resetForm();
    },
  });

  const updatePurchaseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const quantity = parseFloat(data.quantity);
      const unitCost = parseFloat(data.unit_cost);
      const { error } = await supabase
        .from('purchases')
        .update({
          product_name: data.product_name,
          supplier: data.supplier,
          quantity,
          unit_cost: unitCost,
          total_cost: quantity * unitCost,
          purchase_date: data.purchase_date,
          notes: data.notes || null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-purchases'] });
      setEditingPurchase(null);
      resetForm();
    },
  });

  const deletePurchaseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('purchases').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-purchases'] });
    },
  });

  const resetForm = () => {
    setFormData({
      product_name: '',
      product_id: '',
      supplier: '',
      quantity: '',
      unit_cost: '',
      purchase_date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const filteredPurchases = purchases?.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.product_name.toLowerCase().includes(q) || 
           p.supplier.toLowerCase().includes(q);
  }) || [];

  const totalSpent = purchases?.reduce((sum, p) => sum + (p.total_cost || 0), 0) || 0;
  const thisMonthSpent = purchases?.filter(p => {
    const d = new Date(p.purchase_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((sum, p) => sum + (p.total_cost || 0), 0) || 0;

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Satın Almalar</h1>
          <p className="text-sm text-gray-500 mt-1">Tedarikçi satın alımlarını ve maliyetleri yönetin</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 bg-[#1E3A5F] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#1A3354] transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" />
          Yeni Satın Alma
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Toplam İşlem</p>
              <p className="text-xl font-bold text-gray-900">{purchases?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Bu Ay Harcama</p>
              <p className="text-xl font-bold text-gray-900">₺{thisMonthSpent.toLocaleString('tr-TR')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Toplam Harcama</p>
              <p className="text-xl font-bold text-gray-900">₺{totalSpent.toLocaleString('tr-TR')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Ürün adı veya tedarikçi ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-[#1E3A5F]" />
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Satın Alma Bulunamadı</h3>
          <p className="text-gray-500 mb-4">Henüz satın alma kaydı yok</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-[#1E3A5F] text-white px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            İlk Satın Almayı Ekle
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">Ürün</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">Tedarikçi</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">Tarih</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">Miktar</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">Birim Fiyat</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">Toplam</th>
                  <th className="p-4 text-right text-xs font-semibold text-gray-600 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPurchases.map(purchase => (
                  <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-gray-900 text-sm">{purchase.product_name}</p>
                      {purchase.notes && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{purchase.notes}</p>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-600">{purchase.supplier}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(purchase.purchase_date).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {purchase.quantity} adet
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">₺{purchase.unit_cost}</td>
                    <td className="p-4">
                      <span className="font-bold text-[#1E3A5F]">₺{purchase.total_cost.toLocaleString('tr-TR')}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingPurchase(purchase);
                            setFormData({
                              product_name: purchase.product_name,
                              product_id: purchase.product_id || '',
                              supplier: purchase.supplier,
                              quantity: purchase.quantity.toString(),
                              unit_cost: purchase.unit_cost.toString(),
                              purchase_date: purchase.purchase_date,
                              notes: purchase.notes || '',
                            });
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Bu satın almeyi silmek istediğinize emin misiniz?')) {
                              deletePurchaseMutation.mutate(purchase.id);
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(showAddModal || editingPurchase) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPurchase ? 'Satın Almayı Düzenle' : 'Yeni Satın Alma'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingPurchase(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Adı *</label>
                <input
                  type="text"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#1E3A5F] outline-none"
                  placeholder="Ürün adı"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tedarikçi *</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#1E3A5F] outline-none"
                  placeholder="Tedarikçi adı"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Miktar *</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#1E3A5F] outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Birim Maliyet (₺) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#1E3A5F] outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Toplam Maliyet</label>
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg font-bold text-[#1E3A5F]">
                  ₺{((parseFloat(formData.quantity) || 0) * (parseFloat(formData.unit_cost) || 0)).toFixed(2)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tarih</label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#1E3A5F] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notlar</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#1E3A5F] outline-none resize-none"
                  placeholder="İsteğe bağlı notlar"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    if (editingPurchase) {
                      updatePurchaseMutation.mutate({ id: editingPurchase.id, data: formData });
                    } else {
                      addPurchaseMutation.mutate(formData);
                    }
                  }}
                  disabled={!formData.product_name || !formData.supplier || !formData.quantity || !formData.unit_cost}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1E3A5F] text-white py-3 rounded-xl font-semibold hover:bg-[#1A3354] disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {editingPurchase ? 'Güncelle' : 'Kaydet'}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingPurchase(null);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}