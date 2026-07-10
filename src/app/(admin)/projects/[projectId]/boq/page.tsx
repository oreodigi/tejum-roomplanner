'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePlannerStore } from '@/lib/stores/planner-store';
import type { BOQItem, Product, ProjectDevice } from '@/lib/types';
import { ArrowLeft, Trash2, Calculator, Loader2 } from 'lucide-react';

export default function BOQPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { markSaved, markSaving, markSaveError } = usePlannerStore();

  const [loading, setLoading] = useState(true);
  const [compiling, setCompiling] = useState(false);
  const [boqItems, setBOQItems] = useState<BOQItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient();

      // Fetch BOQ Items
      const { data: boq } = await supabase
        .from('boq_items')
        .select('*')
        .eq('project_id', projectId)
        .order('sort_order');
      setBOQItems(boq || []);

      // Fetch Catalog Products
      const { data: prodList } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);
      setProducts(prodList || []);

      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadData();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadData]);

  // Compile / Generate BOQ from raw devices
  async function handleCompileBOQ() {
    setCompiling(true);
    markSaving();

    const supabase = createClient();

    // 1. Fetch project rooms
    const { data: rooms } = await supabase
      .from('rooms')
      .select('*')
      .eq('project_id', projectId);

    if (!rooms || rooms.length === 0) {
      setCompiling(false);
      return;
    }

    // 2. Fetch all devices in those rooms
    const roomIds = rooms.map((r) => r.id);
    const { data: devices } = await supabase
      .from('project_devices')
      .select('*, device_type:device_type_id(*)')
      .in('room_id', roomIds)
      .eq('smart_automation', true); // only automate smart ones

    if (!devices || devices.length === 0) {
      setCompiling(false);
      return;
    }

    // 3. Clear existing BOQ
    await supabase.from('boq_items').delete().eq('project_id', projectId);

    // 4. Create BOQ items
    const inserts = devices.map((d, idx) => {
      const room = rooms.find((r) => r.id === d.room_id);
      const type = d.device_type;
      
      // Attempt to map to first catalog product of matching name/category
      const mappedProduct = products.find(
        (p) => p.name.toLowerCase().includes((type?.display_name || '').toLowerCase())
      );

      const unitPrice = mappedProduct?.selling_price || 2500;

      return {
        project_id: projectId,
        floor: room?.floor_id ? 'Floor Details' : 'Ground Floor',
        room_name: room?.name || 'Common Area',
        device_name: type?.display_name || 'Smart Device',
        device_type: type?.name || 'smart_plug',
        quantity: d.quantity,
        product_id: mappedProduct?.id || null,
        product_name: mappedProduct?.name || 'Smart device module',
        unit_price: unitPrice,
        total_price: unitPrice * d.quantity,
        sort_order: idx,
      };
    });

    if (inserts.length > 0) {
      await supabase.from('boq_items').insert(inserts);
    }

    markSaved();
    await loadData();
    setCompiling(false);
  }

  // Update item
  async function handleUpdateItem(item: BOQItem, updates: Partial<BOQItem>) {
    const supabase = createClient();
    markSaving();

    // Recalculate total price if qty or unit price changes
    const qty = updates.quantity !== undefined ? updates.quantity : item.quantity;
    const price = (updates.unit_price !== undefined && updates.unit_price !== null) ? updates.unit_price : (item.unit_price || 0);
    const totalPrice = qty * price;

    const dbUpdates = {
      ...updates,
      total_price: totalPrice,
    };

    await supabase.from('boq_items').update(dbUpdates).eq('id', item.id);

    setBOQItems((prev) =>
      prev.map((b) => (b.id === item.id ? { ...b, ...dbUpdates } : b))
    );
    markSaved();
  }

  // Update Mapped Product
  async function handleMapProduct(item: BOQItem, productId: string) {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    await handleUpdateItem(item, {
      product_id: productId,
      product_name: prod.name,
      unit_price: prod.selling_price || 0,
    });
  }

  // Delete line item
  async function handleDeleteItem(id: string) {
    const supabase = createClient();
    markSaving();
    await supabase.from('boq_items').delete().eq('id', id);
    setBOQItems((prev) => prev.filter((b) => b.id !== id));
    markSaved();
  }

  function formatCurrency(val: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  }

  const grandTotal = boqItems.reduce((sum, item) => sum + (item.total_price || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
        <span className="text-text-secondary text-sm">Loading spreadsheet grid...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-glass text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Spreadsheet BOQ Editor</h1>
            <p className="text-text-secondary text-sm mt-0.5">Map devices to inventory products, modify quantities & adjust prices</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCompileBOQ}
            disabled={compiling}
            className="btn-secondary text-xs !py-2 !px-4"
          >
            {compiling ? 'Compiling...' : 'Sync from Room Config'}
          </button>
        </div>
      </div>

      {/* BOQ Grid */}
      <div className="glass-card-static overflow-hidden border border-glass-border">
        {boqItems.length === 0 ? (
          <div className="p-16 text-center">
            <Calculator className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">BOQ not compiled yet</h3>
            <p className="text-sm text-text-secondary mb-6 max-w-sm mx-auto">
              Sync the BOQ spreadsheet list directly from the room devices plan to start mapping.
            </p>
            <button onClick={handleCompileBOQ} className="btn-primary text-sm">
              Compile BOQ Spreadsheet
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-glass-border bg-bg-secondary/40 text-xs font-semibold text-text-secondary uppercase">
                  <th className="p-3">Room Name</th>
                  <th className="p-3">Device Feature</th>
                  <th className="p-3">Inventory Product Mapping</th>
                  <th className="p-3 w-24">Qty</th>
                  <th className="p-3 w-32">Unit Price</th>
                  <th className="p-3 w-32">Total Price</th>
                  <th className="p-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border text-sm">
                {boqItems.map((item) => (
                  <tr key={item.id} className="hover:bg-glass/10 transition-colors">
                    <td className="p-3 font-semibold">{item.room_name}</td>
                    <td className="p-3">{item.device_name}</td>
                    <td className="p-3">
                      <select
                        value={item.product_id || ''}
                        onChange={(e) => handleMapProduct(item, e.target.value)}
                        className="bg-bg-input border border-glass-border text-xs py-1 px-2 rounded max-w-xs truncate w-full text-text-primary"
                      >
                        <option value="">No product mapped</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.brand ? `[${p.brand}] ` : ''}{p.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item, { quantity: parseInt(e.target.value, 10) || 1 })}
                        className="bg-bg-input border border-glass-border text-xs py-1 px-2 rounded w-16 text-center text-text-primary"
                      />
                    </td>
                    <td className="p-3">
                      <div className="relative flex items-center">
                        <span className="absolute left-2 text-text-muted text-xs">₹</span>
                        <input
                          type="number"
                          value={item.unit_price || 0}
                          onChange={(e) => handleUpdateItem(item, { unit_price: parseFloat(e.target.value) || 0 })}
                          className="bg-bg-input border border-glass-border text-xs py-1 pl-5 pr-2 rounded w-28 text-text-primary font-medium"
                        />
                      </div>
                    </td>
                    <td className="p-3 font-bold text-gold">
                      {formatCurrency(item.total_price || 0)}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-text-muted hover:text-error transition-all"
                        title="Delete line"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-glass-border bg-bg-secondary/40 font-bold">
                  <td colSpan={5} className="p-4 text-right uppercase text-xs tracking-wider text-text-secondary">
                    Aggregate Grand Total
                  </td>
                  <td className="p-4 text-lg font-black text-gold">
                    {formatCurrency(grandTotal)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
