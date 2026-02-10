export enum Unit {
  KG = 'kg',
  G = 'g',
  L = 'L',
  ML = 'ml',
  UN = 'un'
}

export interface Ingredient {
  id: string;
  name: string;
  unit: Unit;
  costPerUnit: number; // e.g., cost per kg
  currentStock: number;
  minStock: number;
  supplier: string;
  lastUpdated: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number; // in base unit of ingredient
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  ingredients: RecipeIngredient[];
  preparationTimeMinutes: number;
  yieldServings: number;
  salePrice: number;
  instructions: string;
  lastRevision: string;
}

export interface StockMovement {
  id: string;
  ingredientId: string;
  type: 'IN' | 'OUT'; // Entrada (Compra) ou Saída (Uso/Venda)
  quantity: number;
  value: number; // Valor total da movimentação
  date: string;
  description?: string;
}

export interface WasteLog {
  id: string;
  ingredientId: string;
  quantity: number;
  cost: number;
  reason: string;
  date: string;
  responsible: string;
}

export interface InventoryRecord {
  id: string;
  date: string;
  totalValue: number;
  itemsCounted: number;
  snapshot: { ingredientId: string; quantity: number; cost: number }[]; // Foto do estoque naquele momento
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  category: string;
  rating: number;
}

export type PageView = 'dashboard' | 'recipes' | 'inventory' | 'shopping' | 'cmv' | 'waste' | 'suppliers';
