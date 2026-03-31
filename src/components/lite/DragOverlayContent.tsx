'use client';

interface DragOverlayContentProps {
  product: {
    label: string;
    length: number;
    width: number;
    height: number;
    weight: number;
    color: string;
  };
}

export default function DragOverlayContent({ product }: DragOverlayContentProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-2xl border border-gray-200 dark:border-gray-700 transform rotate-3 max-w-xs pointer-events-none">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600"
          style={{ backgroundColor: product.color }}
        />
        <span className="font-semibold text-sm text-gray-900 dark:text-white">
          {product.label}
        </span>
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
        <div>
          L×W×H: {product.length}×{product.width}×{product.height} cm
        </div>
        <div>Ağırlık: {product.weight} kg</div>
      </div>
    </div>
  );
}
