import { PalletType } from './types';

export const PALLET_TYPES: PalletType[] = [
  {
    id: 'euro',
    name: 'Euro Palet',
    length: 1200,
    width: 800,
    maxWeight: 1000,
    maxHeight: 180,
  },
  {
    id: 'us',
    name: 'US Palet',
    length: 1219,
    width: 1016,
    maxWeight: 1200,
    maxHeight: 180,
  },
  {
    id: 'asia',
    name: 'Asya Palet',
    length: 1100,
    width: 1100,
    maxWeight: 1000,
    maxHeight: 180,
  },
  {
    id: 'custom',
    name: 'Özel Boyut',
    length: 1200,
    width: 800,
    maxWeight: 1000,
    maxHeight: 180,
  },
];
