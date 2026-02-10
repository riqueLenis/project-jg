import { Ingredient, Recipe, Supplier, Unit } from './types';

export const MOCK_INGREDIENTS: Ingredient[] = [
  { id: '1', name: 'Arroz Agulhinha', unit: Unit.KG, costPerUnit: 5.50, currentStock: 50, minStock: 20, supplier: 'Cerealista Bom Grão', lastUpdated: '2023-10-25' },
  { id: '2', name: 'Feijão Carioca', unit: Unit.KG, costPerUnit: 8.90, currentStock: 30, minStock: 15, supplier: 'Cerealista Bom Grão', lastUpdated: '2023-10-25' },
  { id: '3', name: 'Filé Mignon', unit: Unit.KG, costPerUnit: 69.90, currentStock: 12, minStock: 10, supplier: 'Casa de Carnes Premium', lastUpdated: '2023-10-26' },
  { id: '4', name: 'Cebola', unit: Unit.KG, costPerUnit: 4.50, currentStock: 15, minStock: 5, supplier: 'Hortifruti Fresco', lastUpdated: '2023-10-27' },
  { id: '5', name: 'Alho', unit: Unit.KG, costPerUnit: 25.00, currentStock: 2, minStock: 1, supplier: 'Hortifruti Fresco', lastUpdated: '2023-10-27' },
  { id: '6', name: 'Azeite de Oliva', unit: Unit.L, costPerUnit: 45.00, currentStock: 5, minStock: 3, supplier: 'Importadora Sul', lastUpdated: '2023-10-20' },
  { id: '7', name: 'Batata Inglesa', unit: Unit.KG, costPerUnit: 3.90, currentStock: 40, minStock: 20, supplier: 'Hortifruti Fresco', lastUpdated: '2023-10-27' },
  { id: '8', name: 'Sal Refinado', unit: Unit.KG, costPerUnit: 2.00, currentStock: 10, minStock: 2, supplier: 'Atacadão Geral', lastUpdated: '2023-10-15' },
];

export const MOCK_RECIPES: Recipe[] = [
  {
    id: '1',
    name: 'Picadinho de Mignon',
    category: 'Prato Principal',
    preparationTimeMinutes: 45,
    yieldServings: 1,
    salePrice: 59.90,
    lastRevision: '2023-10-01',
    instructions: 'Cortar a carne em cubos. Refogar cebola e alho...',
    ingredients: [
      { ingredientId: '3', quantity: 0.200 }, // 200g Mignon
      { ingredientId: '4', quantity: 0.050 }, // 50g Cebola
      { ingredientId: '5', quantity: 0.010 }, // 10g Alho
      { ingredientId: '6', quantity: 0.015 }, // 15ml Azeite
      { ingredientId: '8', quantity: 0.005 }, // 5g Sal
    ]
  },
  {
    id: '2',
    name: 'Arroz Branco (Porção)',
    category: 'Guarnição',
    preparationTimeMinutes: 20,
    yieldServings: 4,
    salePrice: 12.00,
    lastRevision: '2023-09-15',
    instructions: 'Refogar alho no azeite, adicionar arroz...',
    ingredients: [
      { ingredientId: '1', quantity: 0.250 }, // 250g Arroz (cru)
      { ingredientId: '5', quantity: 0.010 }, // 10g Alho
      { ingredientId: '6', quantity: 0.010 }, // 10ml Azeite
      { ingredientId: '8', quantity: 0.005 }, // 5g Sal
    ]
  }
];

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Cerealista Bom Grão', contact: '(11) 9999-9999', category: 'Grãos', rating: 4.5 },
  { id: '2', name: 'Casa de Carnes Premium', contact: '(11) 8888-8888', category: 'Carnes', rating: 5.0 },
  { id: '3', name: 'Hortifruti Fresco', contact: '(11) 7777-7777', category: 'Hortifruti', rating: 4.0 },
];
