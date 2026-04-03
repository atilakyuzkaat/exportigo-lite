'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { BoxType, Lang } from '@/lib/lite/types';
import { GripVertical, Trash2, Plus } from 'lucide-react';

interface ProductCardProps {
  product: BoxType;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  lang: Lang;
}

function ProductCard({ product, quantity, onQuantityChange, lang }: ProductCardProps) {
  const t = (tr: string, en: string) => (lang === 'tr' ? tr : en);
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: `product-${product.id}`,
    data: { ...product, quantity },
  });

  const vol = ((product.length * product.width * product.height) / 1000000).toFixed(3);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      className={`
        p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
        transition-all ${isDragging ? 'opacity-50 shadow-lg scale-[0.98]' : 'hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-sm'}
      `}
    >
      <div className="flex items-start gap-2 mb-2">
        <div
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5 hover:text-gray-400"
        >
          <GripVertical size={14} />
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="w-4 h-4 rounded-md flex-shrink-0 shadow-sm ring-1 ring-black/10"
            style={{ backgroundColor: product.color }}
          />
          <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
            {product.label}
          </span>
        </div>
      </div>

      <div className="text-[11px] text-gray-500 dark:text-gray-400 space-y-0.5 mb-2.5 ml-5">
        <div className="flex justify-between">
          <span>{product.length}×{product.width}×{product.height} cm</span>
          <span>{product.weight} kg</span>
        </div>
        <div className="flex justify-between">
          <span>{vol} m³</span>
          <span>{t('İstif', 'Stack')}: {product.maxStack}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-5">
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="px-2 py-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="text-sm font-bold">−</span>
          </button>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => onQuantityChange(Math.max(1, Number(e.target.value)))}
            className="w-12 px-1 py-1 text-sm text-center border-0 bg-transparent text-gray-900 dark:text-white font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={() => onQuantityChange(quantity + 1)}
            className="px-2 py-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="text-sm font-bold">+</span>
          </button>
        </div>
        <span className="text-[10px] text-gray-400 dark:text-gray-500">{t('adet', 'pcs')}</span>
      </div>
    </div>
  );
}

interface AddProductFormProps {
  onAdd: (product: Omit<BoxType, 'id' | 'quantity' | 'color'>) => void;
  onCancel: () => void;
  lang: Lang;
}

function AddProductForm({ onAdd, onCancel, lang }: AddProductFormProps) {
  const t = (tr: string, en: string) => (lang === 'tr' ? tr : en);
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
    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800/40 space-y-3">
      <input
        type="text"
        placeholder={t('Ürün Adı', 'Product Name')}
        value={form.label}
        onChange={(e) => setForm({ ...form, label: e.target.value })}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 outline-none"
      />
      <div className="grid grid-cols-3 gap-2">
        {[
          { key: 'length', label: t('U', 'L'), unit: 'cm' },
          { key: 'width', label: t('G', 'W'), unit: 'cm' },
          { key: 'height', label: t('Y', 'H'), unit: 'cm' },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{label} (cm)</label>
            <input
              type="number"
              value={form[key as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{t('Ağırlık', 'Weight')} (kg)</label>
          <input
            type="number"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{t('Max İstif', 'Max Stack')}</label>
          <input
            type="number"
            value={form.maxStack}
            onChange={(e) => setForm({ ...form, maxStack: Number(e.target.value) })}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="flex-1 px-3 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
          {t('Ekle', 'Add')}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-3 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          {t('İptal', 'Cancel')}
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
  const t = (tr: string, en: string) => (lang === 'tr' ? tr : en);
  const totalBoxes = products.reduce((sum, p) => sum + (quantities[p.id] || p.quantity), 0);

  return (
    <div className="w-full md:w-80 flex flex-col h-full bg-gray-50/80 dark:bg-gray-900 md:border-r border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            {t('Ürünlerim', 'My Products')}
          </h2>
          {products.length > 0 && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              {products.length} {t('ürün', 'products')} · {totalBoxes} {t('koli', 'boxes')}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
          title={t('Yeni ürün ekle', 'Add new product')}
        >
          <Plus size={18} className="text-emerald-600 dark:text-emerald-400" />
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="flex-shrink-0 p-3">
          <AddProductForm
            onAdd={(product) => {
              onAddProduct(product);
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
            lang={lang}
          />
        </div>
      )}

      {/* Products List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('Henüz ürün eklenmedi', 'No products yet')}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {t('+ butonuna tıklayarak başlayın', 'Click + to get started')}
            </p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard
                product={product}
                quantity={quantities[product.id] || 1}
                onQuantityChange={(qty) => onQuantityChange(product.id, qty)}
                lang={lang}
              />
              <button
                onClick={() => onDeleteProduct(product.id)}
                className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm"
                title={t('Sil', 'Delete')}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
