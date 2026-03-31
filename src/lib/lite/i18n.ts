import { Lang } from './types';

const translations: Record<string, Record<Lang, string>> = {
  // Header
  'app.title': { tr: 'Exportigo Lite', en: 'Exportigo Lite' },
  'app.subtitle': { tr: 'Palet & Konteyner Yükleme Optimizasyonu', en: 'Pallet & Container Loading Optimization' },

  // Steps
  'step.input': { tr: 'Koli Girişi', en: 'Box Input' },
  'step.pallet': { tr: 'Palet Sonuçları', en: 'Pallet Results' },
  'step.container': { tr: 'Konteyner Yükleme', en: 'Container Loading' },

  // Box Form
  'box.title': { tr: 'Koli Bilgileri', en: 'Box Information' },
  'box.label': { tr: 'Koli Adı', en: 'Box Name' },
  'box.length': { tr: 'Uzunluk (cm)', en: 'Length (cm)' },
  'box.width': { tr: 'Genişlik (cm)', en: 'Width (cm)' },
  'box.height': { tr: 'Yükseklik (cm)', en: 'Height (cm)' },
  'box.weight': { tr: 'Ağırlık (kg)', en: 'Weight (kg)' },
  'box.maxStack': { tr: 'Üstüne Max Koli', en: 'Max Stack On Top' },
  'box.quantity': { tr: 'Adet', en: 'Quantity' },
  'box.add': { tr: '+ Yeni Koli Tipi Ekle', en: '+ Add New Box Type' },
  'box.import': { tr: 'Excel/CSV İçe Aktar', en: 'Import Excel/CSV' },
  'box.remove': { tr: 'Sil', en: 'Remove' },

  // Pallet
  'pallet.select': { tr: 'Palet Tipi Seçimi', en: 'Select Pallet Type' },
  'pallet.generate': { tr: 'Palet Oluştur', en: 'Generate Pallets' },
  'pallet.result': { tr: 'Palet Sonucu', en: 'Pallet Result' },
  'pallet.layers': { tr: 'Kat Sayısı', en: 'Layers' },
  'pallet.boxes': { tr: 'Koli Sayısı', en: 'Box Count' },
  'pallet.weight': { tr: 'Toplam Ağırlık', en: 'Total Weight' },
  'pallet.fillVolume': { tr: 'Hacim Doluluk', en: 'Volume Fill' },
  'pallet.fillWeight': { tr: 'Ağırlık Doluluk', en: 'Weight Fill' },
  'pallet.remaining': { tr: 'Kalan Kapasite', en: 'Remaining Capacity' },
  'pallet.remainWeight': { tr: 'Kalan Ağırlık', en: 'Remaining Weight' },
  'pallet.remainVolume': { tr: 'Kalan Hacim', en: 'Remaining Volume' },
  'pallet.moreBoxes': { tr: 'adet daha aynı koli sığar', en: 'more same boxes can fit' },
  'pallet.duplicate': { tr: 'Çoğalt', en: 'Duplicate' },
  'pallet.remove': { tr: 'Kaldır', en: 'Remove' },
  'pallet.list': { tr: 'Palet Listesi', en: 'Pallet List' },
  'pallet.total': { tr: 'Toplam Palet', en: 'Total Pallets' },
  'pallet.customSize': { tr: 'Özel boyut girin', en: 'Enter custom size' },
  'pallet.maxWeight': { tr: 'Max Ağırlık (kg)', en: 'Max Weight (kg)' },
  'pallet.maxHeight': { tr: 'Max Yükseklik (cm)', en: 'Max Height (cm)' },

  // Container
  'container.select': { tr: 'Konteyner Tipi Seçimi', en: 'Select Container Type' },
  'container.load': { tr: 'Konteynere Yükle', en: 'Load Container' },
  'container.result': { tr: 'Konteyner Sonucu', en: 'Container Result' },
  'container.palletCount': { tr: 'Yüklenen Palet', en: 'Loaded Pallets' },
  'container.fillVolume': { tr: 'Hacim Doluluk', en: 'Volume Fill' },
  'container.fillWeight': { tr: 'Ağırlık Doluluk', en: 'Weight Fill' },
  'container.remainWeight': { tr: 'Kalan Ağırlık', en: 'Remaining Weight' },
  'container.remainVolume': { tr: 'Kalan Hacim', en: 'Remaining Volume' },
  'container.morePallets': { tr: 'adet daha palet sığar', en: 'more pallets can fit' },

  // View
  'view.3d': { tr: '3D Görünüm', en: '3D View' },
  'view.2d': { tr: '2D Görünüm', en: '2D View' },
  'view.layer': { tr: 'Kat', en: 'Layer' },

  // Actions
  'action.next': { tr: 'İleri', en: 'Next' },
  'action.back': { tr: 'Geri', en: 'Back' },
  'action.downloadPdf': { tr: 'PDF İndir', en: 'Download PDF' },
  'action.reset': { tr: 'Baştan Başla', en: 'Start Over' },
};

export function t(key: string, lang: Lang): string {
  return translations[key]?.[lang] || key;
}
