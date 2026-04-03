'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

const TOAST_COLORS: Record<ToastType, string> = {
  success: 'bg-emerald-500 text-white',
  warning: 'bg-amber-500 text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-blue-500 text-white',
};

const TOAST_ICONS: Record<ToastType, string> = {
  success: '✓',
  warning: '⚠',
  error: '✕',
  info: 'ℹ',
};

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 4000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium animate-slide-in ${TOAST_COLORS[toast.type]}`}>
      <span className="text-base">{TOAST_ICONS[toast.type]}</span>
      <span>{toast.message}</span>
      <button onClick={onRemove} className="ml-2 opacity-70 hover:opacity-100 text-lg leading-none">&times;</button>
    </div>
  );
}

// Toast container - singleton pattern via global state
let toastListeners: ((toasts: ToastMessage[]) => void)[] = [];
let currentToasts: ToastMessage[] = [];

export function addToast(type: ToastType, message: string) {
  const id = Date.now().toString() + Math.random().toString(36).slice(2);
  currentToasts = [...currentToasts, { id, type, message }];
  toastListeners.forEach(fn => fn(currentToasts));
}

function removeToast(id: string) {
  currentToasts = currentToasts.filter(t => t.id !== id);
  toastListeners.forEach(fn => fn(currentToasts));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter(fn => fn !== setToasts);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}
