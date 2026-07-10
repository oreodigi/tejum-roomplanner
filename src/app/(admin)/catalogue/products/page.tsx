'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/lib/types';
import { Search, Plus, Trash2, Edit, X, Loader2, Filter } from 'lucide-react';

interface CategoryLookup {
  id: string;
  display_name: string;
}

export default function CatalogProductsPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryLookup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient();

      // Fetch categories
      const { data: catList } = await supabase
        .from('device_categories')
        .select('id, display_name');
      setCategories((catList as never) || []);

      // Fetch products
      const { data: prodList } = await supabase
        .from('products')
        .select('*')
        .order('name');
      setProducts(prodList || []);

      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadData();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadData]);

  // Add Product
  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const brand = (form.elements.namedItem('brand') as HTMLInputElement).value;
    const sku = (form.elements.namedItem('sku') as HTMLInputElement).value;
    const catId = (form.elements.namedItem('category_id') as HTMLSelectElement).value;
    const mrp = parseFloat((form.elements.namedItem('mrp') as HTMLInputElement).value) || 0;
    const price = parseFloat((form.elements.namedItem('price') as HTMLInputElement).value) || 0;

    if (!name || !catId) return;

    const supabase = createClient();
    const { data: newProd } = await supabase
      .from('products')
      .insert({
        name,
        brand,
        sku,
        category_id: catId,
        mrp,
        selling_price: price,
        unit: 'piece',
      })
      .select()
      .single();

    if (newProd) {
      setProducts((prev) => [...prev, newProd].sort((a, b) => a.name.localeCompare(b.name)));
      setShowAddModal(false);
    }
  }

  // Edit Product
  async function handleEditProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProduct) return;

    const form = e.currentTarget as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const brand = (form.elements.namedItem('brand') as HTMLInputElement).value;
    const sku = (form.elements.namedItem('sku') as HTMLInputElement).value;
    const mrp = parseFloat((form.elements.namedItem('mrp') as HTMLInputElement).value) || 0;
    const price = parseFloat((form.elements.namedItem('price') as HTMLInputElement).value) || 0;

    const supabase = createClient();
    await supabase
      .from('products')
      .update({
        name,
        brand,
        sku,
        mrp,
        selling_price: price,
      })
      .eq('id', editingProduct.id);

    setProducts((prev) =>
      prev.map((p) =>
        p.id === editingProduct.id
          ? { ...p, name, brand, sku, mrp, selling_price: price }
          : p
      )
    );
    setEditingProduct(null);
  }

  // Delete Product
  async function handleDeleteProduct(id: string) {
    if (!confirm('Remove this product from the inventory catalog?')) return;

    const supabase = createClient();
    await supabase.from('products').delete().eq('id', id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function formatCurrency(val: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  }

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory ? p.category_id === selectedCategory : true;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
        <span className="text-text-secondary text-sm">Loading product catalog...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Product Catalogue</h1>
          <p className="text-text-secondary text-sm mt-0.5">Manage smart home device hardware and pricing inventory</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-xs !py-2.5"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-card-static p-4 flex flex-col sm:flex-row gap-4 items-center justify-between border border-glass-border">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 !py-2 text-xs"
            placeholder="Search by name, brand, or SKU..."
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 items-center w-full sm:w-auto shrink-0 justify-end">
          <Filter className="w-4 h-4 text-text-muted shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-bg-input border border-glass-border text-xs py-2 px-3 rounded text-text-secondary font-medium w-full sm:w-48"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.display_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Catalogue Grid */}
      <div className="glass-card-static overflow-hidden border border-glass-border">
        {filteredProducts.length === 0 ? (
          <div className="p-16 text-center text-text-muted text-sm">
            No products match your query. Add a new product to catalogue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-glass-border bg-bg-secondary/40 text-xs font-semibold text-text-secondary uppercase">
                  <th className="p-3">SKU</th>
                  <th className="p-3">Brand</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3 w-28">MRP</th>
                  <th className="p-3 w-28">Selling Price</th>
                  <th className="p-3 w-24">Status</th>
                  <th className="p-3 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border text-sm">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-glass/10 transition-colors">
                    <td className="p-3 font-mono text-xs">{p.sku || '—'}</td>
                    <td className="p-3 font-semibold text-text-secondary">{p.brand || '—'}</td>
                    <td className="p-3 font-semibold">{p.name}</td>
                    <td className="p-3 font-medium text-text-muted">{p.mrp ? formatCurrency(p.mrp) : '—'}</td>
                    <td className="p-3 font-bold text-gold">{p.selling_price ? formatCurrency(p.selling_price) : '—'}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        p.is_active
                          ? 'bg-success-muted text-success border-success/20'
                          : 'bg-glass text-text-muted border-glass-border'
                      }`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="p-1 text-text-secondary hover:text-text-primary"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1 text-text-secondary hover:text-error"
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
        )}
      </div>

      {/* MODAL: ADD PRODUCT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card-static w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
              <div>
                <label className="input-label">Product Name *</label>
                <input name="name" type="text" required className="input-field" placeholder="e.g. 4-Channel Dimmer Module" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Brand</label>
                  <input name="brand" type="text" className="input-field" placeholder="e.g. Fibaro, Tejum" />
                </div>
                <div>
                  <label className="input-label">SKU Code</label>
                  <input name="sku" type="text" className="input-field" placeholder="e.g. TJM-DM-04" />
                </div>
              </div>

              <div>
                <label className="input-label">Category *</label>
                <select name="category_id" required className="input-field">
                  <option value="" disabled>Select category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.display_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">MRP (INR)</label>
                  <input name="mrp" type="number" className="input-field" placeholder="0" />
                </div>
                <div>
                  <label className="input-label">Selling Price (INR)</label>
                  <input name="price" type="number" className="input-field" placeholder="0" />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary text-sm">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-sm">
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PRODUCT */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card-static w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Product</h3>
              <button onClick={() => setEditingProduct(null)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditProduct} className="flex flex-col gap-4">
              <div>
                <label className="input-label">Product Name *</label>
                <input name="name" type="text" defaultValue={editingProduct.name} required className="input-field" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Brand</label>
                  <input name="brand" type="text" defaultValue={editingProduct.brand || ''} className="input-field" />
                </div>
                <div>
                  <label className="input-label">SKU Code</label>
                  <input name="sku" type="text" defaultValue={editingProduct.sku || ''} className="input-field" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">MRP (INR)</label>
                  <input name="mrp" type="number" defaultValue={editingProduct.mrp || 0} className="input-field" />
                </div>
                <div>
                  <label className="input-label">Selling Price (INR)</label>
                  <input name="price" type="number" defaultValue={editingProduct.selling_price || 0} className="input-field" />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button type="button" onClick={() => setEditingProduct(null)} className="btn-secondary text-sm">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
