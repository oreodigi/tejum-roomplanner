export type BOQCategory = 
  | 'hardware'
  | 'networking'
  | 'infrastructure'
  | 'installation'
  | 'programming'
  | 'support';

export interface BOQLineItem {
  id: string; // usually deviceKey or infra key
  category: BOQCategory;
  name: string;
  quantity: number;
  unitPriceLow: number;
  unitPriceHigh: number;
  totalLow: number;
  totalHigh: number;
}

export interface BOQEstimate {
  items: BOQLineItem[];
  hardwareTotal: [number, number];
  networkingTotal: [number, number];
  installationTotal: [number, number];
  programmingTotal: [number, number];
  grandTotal: [number, number];
}
