import React, { useState } from 'react';
import { Ingredient } from '../types';
import { ShoppingCart, Plus, Trash2, CheckSquare, Square, Download, Share2, Sparkles, X, Loader2, LayoutList, Truck, CheckCircle2 } from 'lucide-react';
import { generateShoppingInsights } from '../services/geminiService';

interface ShoppingListProps {
  ingredients: Ingredient[];
}

interface ShoppingItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  checked: boolean;
  supplier?: string;
}

type ViewMode = 'list' | 'status' | 'supplier';

export const ShoppingList: React.FC<ShoppingListProps> = ({ ingredients }) => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  
  // AI State
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Auto-populate based on low stock
  const populateFromLowStock = () => {
    const lowStock = ingredients.filter(i => i.currentStock <= i.minStock);
    const newItems = lowStock.map(i => ({
      id: Math.random().toString(36).substr(2, 9),
      name: i.name,
      qty: Math.max(1, i.minStock * 2 - i.currentStock), // Simple logic to buy up to safe stock
      unit: i.unit,
      checked: false,
      supplier: i.supplier
    }));
    // Merge avoiding duplicates by name
    const merged = [...items];
    newItems.forEach(ni => {
        if (!merged.find(m => m.name === ni.name)) {
            merged.push(ni);
        }
    });
    setItems(merged);
  };

  const handleGenerateInsights = async () => {
    const lowStock = ingredients.filter(i => i.currentStock <= i.minStock);
    if (lowStock.length === 0) {
      setAiInsights("Seu estoque está saudável! Não há itens críticos para análise no momento.");
      return;
    }

    setLoadingAi(true);
    setAiInsights('');
    
    const insights = await generateShoppingInsights(lowStock);
    setAiInsights(insights || "Não foi possível gerar insights no momento.");
    setLoadingAi(false);
  };

  const handleAddItem = () => {
    const ing = ingredients.find(i => i.id === selectedIngredientId);
    if (ing) {
        setItems([...items, {
            id: Math.random().toString(36).substr(2, 9),
            name: ing.name,
            qty: quantity,
            unit: ing.unit,
            checked: false,
            supplier: ing.supplier
        }]);
        setSelectedIngredientId('');
        setQuantity(1);
    }
  };

  const toggleCheck = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  // Helper to render a list of items
  const renderItemsList = (itemList: ShoppingItem[]) => (
    <div className="divide-y divide-gray-100">
        {itemList.map(item => (
            <div key={item.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${item.checked ? 'bg-gray-50/50' : ''}`}>
                <div className="flex items-center gap-4">
                <button onClick={() => toggleCheck(item.id)} className="text-gray-400 hover:text-chef-600 transition-colors">
                    {item.checked ? <CheckSquare className="text-green-500" size={24} /> : <Square size={24} />}
                </button>
                <div>
                    <p className={`font-medium text-lg ${item.checked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{item.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Truck size={12} /> {item.supplier || 'Fornecedor não informado'}
                    </p>
                </div>
                </div>
                <div className="flex items-center gap-6">
                <span className={`font-bold ${item.checked ? 'text-gray-400' : 'text-chef-600'}`}>{item.qty} {item.unit}</span>
                <button onClick={() => deleteItem(item.id)} className="text-gray-300 hover:text-red-500">
                    <Trash2 size={18} />
                </button>
                </div>
            </div>
        ))}
        {itemList.length === 0 && (
            <div className="p-4 text-center text-gray-400 text-sm italic">Nenhum item nesta seção.</div>
        )}
    </div>
  );

  // Render logic based on view mode
  const renderContent = () => {
    if (items.length === 0) {
        return (
            <div className="p-12 text-center text-gray-400 flex flex-col items-center">
               <ShoppingCart size={48} className="text-gray-200 mb-4" />
               <p>Sua lista está vazia.</p>
               <p className="text-sm mt-2">Adicione itens manualmente, importe do estoque baixo ou use a IA para sugerir compras.</p>
            </div>
        );
    }

    if (viewMode === 'supplier') {
        // Get unique suppliers
        const suppliers = Array.from(new Set(items.map(i => i.supplier || 'Outros'))).sort();
        return (
            <div className="space-y-6 p-4">
                {suppliers.map(supplier => {
                    const supplierItems = items.filter(i => (i.supplier || 'Outros') === supplier);
                    return (
                        <div key={supplier} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-100 px-4 py-2 font-bold text-gray-700 flex items-center gap-2">
                                <Truck size={16} /> {supplier}
                                <span className="text-xs font-normal text-gray-500 bg-white px-2 py-0.5 rounded-full border ml-auto">
                                    {supplierItems.length} itens
                                </span>
                            </div>
                            <div className="bg-white">
                                {renderItemsList(supplierItems)}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    if (viewMode === 'status') {
        const toBuy = items.filter(i => !i.checked);
        const bought = items.filter(i => i.checked);
        return (
            <div className="space-y-6 p-4">
                <div className="border border-orange-100 rounded-lg overflow-hidden">
                    <div className="bg-orange-50 px-4 py-2 font-bold text-orange-800 flex items-center gap-2">
                        <ShoppingCart size={16} /> A Comprar
                        <span className="text-xs font-normal bg-white text-orange-600 px-2 py-0.5 rounded-full border border-orange-200 ml-auto">
                           {toBuy.length} itens
                        </span>
                    </div>
                    <div className="bg-white">
                        {renderItemsList(toBuy)}
                    </div>
                </div>

                <div className="border border-green-100 rounded-lg overflow-hidden opacity-75">
                    <div className="bg-green-50 px-4 py-2 font-bold text-green-800 flex items-center gap-2">
                        <CheckSquare size={16} /> Comprado / No Carrinho
                        <span className="text-xs font-normal bg-white text-green-600 px-2 py-0.5 rounded-full border border-green-200 ml-auto">
                           {bought.length} itens
                        </span>
                    </div>
                    <div className="bg-white">
                        {renderItemsList(bought)}
                    </div>
                </div>
            </div>
        );
    }

    // Default List View
    return renderItemsList(items);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="text-chef-600" /> Lista de Compras
        </h1>
        <div className="flex flex-wrap gap-2">
           <button 
             onClick={handleGenerateInsights}
             className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
             disabled={loadingAi}
           >
             <Sparkles size={16} /> {loadingAi ? 'Analisando...' : 'Dicas de Compra IA'}
           </button>
           <button 
             onClick={populateFromLowStock}
             className="text-chef-600 bg-chef-50 hover:bg-chef-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
           >
             Importar Estoque Baixo
           </button>
           <button className="text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
             <Download size={16} /> Exportar
           </button>
           <button className="bg-chef-500 text-white px-4 py-2 rounded-lg hover:bg-chef-600 flex items-center gap-2 shadow-sm">
             <Share2 size={16} /> Whatsapp
           </button>
        </div>
      </div>

      {/* AI Insights Section */}
      {(aiInsights || loadingAi) && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 relative animate-in fade-in slide-in-from-top-4 duration-300">
          <button 
            onClick={() => setAiInsights('')}
            className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600"
          >
            <X size={20} />
          </button>
          
          <h3 className="text-indigo-900 font-bold flex items-center gap-2 mb-3">
            {loadingAi ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {loadingAi ? 'Analisando Estoque e Mercado...' : 'Sugestões Inteligentes de Compra'}
          </h3>
          
          <div className="prose prose-sm prose-indigo text-indigo-800 max-w-none">
            {loadingAi ? (
              <p className="text-indigo-600 animate-pulse">Consultando base de conhecimento para otimizar suas compras...</p>
            ) : (
              <div className="whitespace-pre-wrap">{aiInsights}</div>
            )}
          </div>
        </div>
      )}

      {/* Manual Entry */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-end">
         <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Adicionar item do estoque</label>
            <select 
               className="w-full border border-gray-300 rounded-lg p-2"
               value={selectedIngredientId}
               onChange={e => setSelectedIngredientId(e.target.value)}
            >
                <option value="">Selecione...</option>
                {ingredients.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
         </div>
         <div className="w-32">
            <label className="text-xs text-gray-500 mb-1 block">Quantidade</label>
            <input 
               type="number" 
               className="w-full border border-gray-300 rounded-lg p-2"
               value={quantity}
               onChange={e => setQuantity(parseFloat(e.target.value))}
            />
         </div>
         <button 
            onClick={handleAddItem}
            disabled={!selectedIngredientId}
            className="bg-gray-800 text-white p-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
         >
            <Plus size={24} />
         </button>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
        >
            <LayoutList size={16} /> Lista Geral
        </button>
        <button 
            onClick={() => setViewMode('status')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'status' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
        >
            <CheckCircle2 size={16} /> Por Status
        </button>
        <button 
            onClick={() => setViewMode('supplier')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'supplier' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
        >
            <Truck size={16} /> Por Fornecedor
        </button>
      </div>

      {/* List Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 overflow-y-auto">
         {renderContent()}
      </div>
    </div>
  );
};