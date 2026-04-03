'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { BoxType, Lang } from '@/lib/lite/types';
import { GripVertical, Trash2, Plus } from 'lucide-react';

interface ProductCardProps {
  product: BoxType;
  quantity: number;
  onQuantityChange: (qty: number) => void;
}

function ProductCard({ product, quantity, onQuantityChange }: ProductCardProps) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: `product-${product.id}`,
    data: { ...product, quantity },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      className={`
        p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
        transition-all ${isDragging ? 'opacity-50 shadow-lg' : 'hover:border-emerald-400 dark:hover:border-emerald-500'}
      `}
    >
      <div className="flex items-start gap-2 mb-2">
        <div
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 flex-shrink-0 mt-0.5"
        >
          <GripVertical size={16} />
        </div>
        <div className="flex items-center gap-2 flex-1">
          <div
            className="w-5 h-5 rounded-md flex-shrink-0 shadow-sm ring-1 ring-black/10"
            style={{ backgroundColor: product.color }}
          />
          <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
            {product.label}
          </span>
        </div>
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mb-2 ml-6">
        <div>L×W×H: {product.length}×{product.width}×{product.height} cm</div>
        <div>Ağırlık: {product.weight} kg</div>
        <div>Max İstif: {product.maxStack}</div>
      </div>

      <div className="flex items-center gap-2 ml-6">
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => onQuantityChange(Math.max(1, Number(e.target.value)))}
          className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <span className="text-xs text-gray-500 dark:text-gray-400">adet</span>
      </div>
    </div>
  );
}

interface AddProductFormProps {
  onAdd: (product: Omit<BoxType, 'id' | 'quantity' | 'color'>) => void;
  onCancel: () => void;
}

function AddProductForm({ onAdd, onCancel }: AddProductFormProps) {
  const [form, setForm] = useState({
    label: '',
    length: 40,
    width: 30,
    height: 30,
    weight: 20,
    maxStack: 5,
  });

  const handleSubmit = () => {
    if (!form.label.trim()) return;
    onAdd(form);
    setForm({ label: '', length: 40, width: 30, height: 30, weight: 20, maxStack: 5 });
  };

  return (
    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-3">
      <input
        type="text"
        placeholder="Ürün Adı"
        value={form.label}
        onChange={(e) => setForm({ ...form, label: e.target.value })}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400">Uzunluk (cm)</label>
          <input
            type="number"
            value={form.length}
            onChange={(e) => setForm({ ...form, length: Number(e.target.value) })}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400">Genişlik (cm)</label>
          <input
            type="number"
            value={form.width}
            onChange={(e) => setForm({ ...form, width: Number(e.target.value) })}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400">Yükseklik (cm)</label>
          <input
            type="number"
            value={form.height}
            onChange={(e) => setForm({ ...form, height: Number(e.target.value) })}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400">Ağırlık (kg)</label>
          <input
            type="number"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-600 dark:text-gray-400">Max İstif</label>
        <input
          type="number"
          value={form.maxStack}
          onChange={(e) => setForm({ ...form, maxStack: Number(e.target.value) })}
          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="flex-1 px-3 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
          Ekle
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-3 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
        >
          İptal
        </button>
      </div>
    </div>
  );
}

interface ProductPanelProps {
  products: BoxType[];
  quantities: Record<string, number>;
  onQuantityChange: (id: string, qty: number) => void;
  onAddProduct: (product: Omit<BoxType, 'id' | 'quantity' | 'color'>) => void;
  onDeleteProduct: (id: string) => void;
  lang: Lang;
}

export default function ProductPanel({
  products,
  quantities,
  onQuantityChange,
  onAddProduct,
  onDeleteProduct,
  lang,
}: ProductPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="w-full md:w-80 flex flex-col h-full bg-gray-50 dark:bg-gray-900 md:border-r border-gray-200 dark:border-gray-800 p-4 gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {lang === 'tr' ? 'Ürünlerim' : 'My Products'}
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title={lang === 'tr' ? 'Yeni ürün ekle' : 'Add new product'}
        >
          <Plus size={20} className="text-emerald-600 dark:text-emerald-400" />
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="flex-shrink-0">
          <AddProductForm
            onAdd={(product) => {
              onAddProduct(product);
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Products List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {products.length === 0 ? (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
            {lang === 'tr' ? 'Henüz ürün eklenmedi' : 'No products yet'}
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard
                product={product}
                quantity={quantities[product.id] || 1}
                onQuantityChange={(qty) => onQuantityChange(product.id, qty)}
              />
              <button
                onClick={() => onDeleteProduct(product.id)}
                className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-lg"
                title={lang === 'tr' ? 'Sil' : 'Delete'}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
