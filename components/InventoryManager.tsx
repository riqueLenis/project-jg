import React, { useState, useMemo } from 'react';
import { Ingredient, InventoryRecord, Unit, StockMovement } from '../types';
import { Search, Archive, ArrowDownUp, Save, X, ClipboardCheck, Plus, History, ArrowUpCircle, ArrowDownCircle, Calendar, FileText, DollarSign, ShoppingBag, TrendingUp, LineChart as LineChartIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface InventoryManagerProps {
  ingredients: Ingredient[];
  inventoryRecords: InventoryRecord[];
  movements: StockMovement[];
  onUpdateStock: (id: string, newStock: number) => void;
  onSaveInventoryRecord: (record: InventoryRecord) => void;
  onAddIngredient: (ingredient: Ingredient) => void;
  onAddMovement: (movement: StockMovement) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({ 
  ingredients, 
  inventoryRecords,
  movements,
  onUpdateStock, 
  onSaveInventoryRecord,
  onAddIngredient,
  onAddMovement
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [searchTerm, setSearchTerm] = useState('');
  
  // States for Modals
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  
  // Price History Modal State
  const [showPriceHistoryModal, setShowPriceHistoryModal] = useState(false);
  const [selectedIngredientHistory, setSelectedIngredientHistory] = useState<Ingredient | null>(null);
  
  // Inventory/Audit Mode State
  const [isTakingInventory, setIsTakingInventory] = useState(false);
  const [inventoryCounts, setInventoryCounts] = useState<Record<string, number>>({});

  // New Item Form State
  const [newItem, setNewItem] = useState<Partial<Ingredient>>({ unit: Unit.KG, currentStock: 0, minStock: 0 });

  // Movement Form State
  const [movementForm, setMovementForm] = useState<{
    ingredientId: string, 
    type: 'IN' | 'OUT', 
    quantity: number, 
    price?: number,
    date: string,
    description: string
  }>({
    ingredientId: '', 
    type: 'IN', 
    quantity: 0,
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const filteredIngredients = ingredients.filter(i => 
    i.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Price History Logic ---
  const getPriceHistoryData = useMemo(() => {
    if (!selectedIngredientHistory) return [];

    // Filter movements for this ingredient, type IN, last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const history = movements
      .filter(m => 
        m.ingredientId === selectedIngredientHistory.id && 
        m.type === 'IN' &&
        new Date(m.date) >= sixMonthsAgo
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(m => ({
        date: new Date(m.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' }),
        fullDate: new Date(m.date).toLocaleDateString(),
        price: m.value / m.quantity
      }));
    
    // Add current price as the latest point if necessary or just to show trend
    if (history.length === 0 || history[history.length - 1].price !== selectedIngredientHistory.costPerUnit) {
       history.push({
         date: 'Atual',
         fullDate: new Date().toLocaleDateString(),
         price: selectedIngredientHistory.costPerUnit
       });
    }

    return history;
  }, [selectedIngredientHistory, movements]);

  const handleOpenPriceHistory = (ingredient: Ingredient) => {
    setSelectedIngredientHistory(ingredient);
    setShowPriceHistoryModal(true);
  };

  // --- Inventory Logic ---

  const startInventory = () => {
    const initialCounts: Record<string, number> = {};
    ingredients.forEach(i => initialCounts[i.id] = i.currentStock);
    setInventoryCounts(initialCounts);
    setIsTakingInventory(true);
  };

  const handleInventoryCountChange = (id: string, value: number) => {
    setInventoryCounts(prev => ({ ...prev, [id]: value }));
  };

  const finalizeInventory = () => {
    if (window.confirm("Confirmar contagem e atualizar estoque? Isso salvará um registro de inventário.")) {
      
      let totalValue = 0;
      let itemsCounted = 0;
      const snapshot: { ingredientId: string; quantity: number; cost: number }[] = [];

      Object.entries(inventoryCounts).forEach(([id, count]) => {
        onUpdateStock(id, count);
        
        const ing = ingredients.find(i => i.id === id);
        if (ing) {
            const quantity = Number(count);
            totalValue += quantity * ing.costPerUnit;
            itemsCounted++;
            snapshot.push({
                ingredientId: id,
                quantity: quantity,
                cost: ing.costPerUnit
            });
        }
      });

      const record: InventoryRecord = {
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toISOString(),
          totalValue,
          itemsCounted,
          snapshot
      };
      
      onSaveInventoryRecord(record);
      setIsTakingInventory(false);
    }
  };

  // --- Handlers ---

  const handleCreateItem = () => {
    if (newItem.name && newItem.supplier && newItem.costPerUnit !== undefined) {
        onAddIngredient({
            ...newItem,
            id: Math.random().toString(36).substr(2, 9),
            lastUpdated: new Date().toISOString()
        } as Ingredient);
        setShowNewItemModal(false);
        setNewItem({ unit: Unit.KG, currentStock: 0, minStock: 0 });
    }
  };

  const handleSaveMovement = () => {
      if (movementForm.ingredientId && movementForm.quantity > 0) {
          const ing = ingredients.find(i => i.id === movementForm.ingredientId);
          if (ing) {
              // Calculate Value
              // If IN (Purchase): Use provided price OR current cost
              // If OUT (Usage): Use current cost
              const unitValue = (movementForm.type === 'IN' && movementForm.price) 
                ? movementForm.price 
                : ing.costPerUnit;

              const totalValue = unitValue * movementForm.quantity;

              // Create movement record
              const movement: StockMovement = {
                  id: Math.random().toString(36).substr(2, 9),
                  ingredientId: movementForm.ingredientId,
                  type: movementForm.type,
                  quantity: movementForm.quantity,
                  value: totalValue,
                  date: new Date(movementForm.date).toISOString(), // Use selected date
                  description: movementForm.description
              };
              onAddMovement(movement);

              // Update stock and cost if it's an entry with different price
              const newStock = movementForm.type === 'IN' 
                ? ing.currentStock + movementForm.quantity 
                : ing.currentStock - movementForm.quantity;
              
              // Note: Weighted average cost logic could be implemented here.
              // For now, if price is provided on input, we might update the reference cost
              // But the main state update logic is in App.tsx which just does simple replacement.
              // In a real app, we would dispatch an action to update costPerUnit as well.
              
              onUpdateStock(ing.id, Math.max(0, newStock));
              
              // Reset Form
              setShowMovementModal(false);
              setMovementForm({ 
                ingredientId: '', 
                type: 'IN', 
                quantity: 0, 
                date: new Date().toISOString().split('T')[0],
                description: ''
              });
          }
      }
  };

  const openMovementModal = (type: 'IN' | 'OUT') => {
    setMovementForm(prev => ({ ...prev, type }));
    setShowMovementModal(true);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
             Gestão de Estoque
             {isTakingInventory && <span className="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded-md border border-orange-200">Modo Auditoria</span>}
           </h1>
           <div className="flex gap-4 mt-2 text-sm font-medium text-gray-500">
              <button onClick={() => setActiveTab('current')} className={`${activeTab === 'current' ? 'text-chef-600 border-b-2 border-chef-600' : 'hover:text-chef-600'}`}>Estoque Atual</button>
              <button onClick={() => setActiveTab('history')} className={`${activeTab === 'history' ? 'text-chef-600 border-b-2 border-chef-600' : 'hover:text-chef-600'}`}>Histórico de Inventários</button>
           </div>
        </div>
        
        <div className="flex gap-2">
          {!isTakingInventory ? (
            <>
               <button 
                onClick={() => openMovementModal('IN')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
              >
                <ArrowDownCircle size={18} />
                Registrar Entrada
              </button>
               <button 
                onClick={() => openMovementModal('OUT')}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowUpCircle size={18} />
                Saída
              </button>
              <button 
                onClick={() => setShowNewItemModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-chef-500 text-white rounded-lg hover:bg-chef-600 transition-colors shadow-sm"
              >
                <Plus size={18} />
                Novo Insumo
              </button>
              <button 
                onClick={startInventory}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors shadow-sm"
              >
                <ClipboardCheck size={18} />
                Inventário
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsTakingInventory(false)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X size={18} /> Cancelar
              </button>
              <button 
                onClick={finalizeInventory}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save size={18} /> Finalizar Contagem
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs Content */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        
        {activeTab === 'current' && (
          <>
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar insumo..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-chef-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase font-medium sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3">Item</th>
                    {!isTakingInventory && <th className="px-6 py-3">Fornecedor</th>}
                    <th className="px-6 py-3 text-center">Estoque Sistema</th>
                    {isTakingInventory ? (
                       <>
                         <th className="px-6 py-3 text-center w-40 bg-orange-50 text-orange-800 border-b border-orange-200">Contagem Física</th>
                         <th className="px-6 py-3 text-center">Dif.</th>
                       </>
                    ) : (
                       <>
                         <th className="px-6 py-3 text-center">Mínimo</th>
                         <th className="px-6 py-3 text-right">Custo Unit.</th>
                         <th className="px-6 py-3 text-right">Valor Total</th>
                       </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredIngredients.map(ing => {
                    const physicalCount = inventoryCounts[ing.id] ?? ing.currentStock;
                    const diff = physicalCount - ing.currentStock;
                    const totalValue = ing.currentStock * ing.costPerUnit;

                    return (
                      <tr key={ing.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{ing.name} <span className="text-gray-400 font-normal">({ing.unit})</span></td>
                        {!isTakingInventory && <td className="px-6 py-4 text-gray-500">{ing.supplier}</td>}
                        
                        <td className="px-6 py-4 text-center font-mono text-gray-700 font-medium">
                          {ing.currentStock}
                        </td>

                        {isTakingInventory ? (
                           <>
                             <td className="px-6 py-3 text-center bg-orange-50/50">
                               <input 
                                  type="number" 
                                  step="0.01"
                                  value={inventoryCounts[ing.id] ?? ''}
                                  onChange={(e) => handleInventoryCountChange(ing.id, parseFloat(e.target.value) || 0)}
                                  className="w-24 text-center border border-orange-200 rounded-md py-1 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                               />
                             </td>
                             <td className="px-6 py-4 text-center">
                                {diff !== 0 ? (
                                    <span className={`font-bold ${diff < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                                    </span>
                                ) : '-'}
                             </td>
                           </>
                        ) : (
                           <>
                            <td className="px-6 py-4 text-center text-gray-500">{ing.minStock}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2 group">
                                <span>R$ {ing.costPerUnit.toFixed(2)}</span>
                                <button 
                                  onClick={() => handleOpenPriceHistory(ing)}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded text-chef-600 transition-all"
                                  title="Ver histórico de preço"
                                >
                                  <TrendingUp size={14} />
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-gray-800">R$ {totalValue.toFixed(2)}</td>
                           </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <div className="flex-1 overflow-auto p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <History size={20} /> Histórico de Contagens
            </h3>
            {inventoryRecords.length === 0 ? (
              <p className="text-gray-500 italic">Nenhum inventário realizado ainda.</p>
            ) : (
              <div className="space-y-4">
                {inventoryRecords.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                  <div key={record.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <p className="font-bold text-gray-800">{new Date(record.date).toLocaleDateString()} às {new Date(record.date).toLocaleTimeString()}</p>
                      <p className="text-sm text-gray-500">{record.itemsCounted} itens contados</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Valor em Estoque</p>
                      <p className="text-xl font-bold text-chef-600">R$ {record.totalValue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL: NEW ITEM --- */}
      {showNewItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[500px] p-6 shadow-xl">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Novo Insumo</h2>
                <button onClick={() => setShowNewItemModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div className="col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Insumo</label>
                 <input 
                   className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-chef-500 focus:border-chef-500 outline-none transition-all" 
                   placeholder="Ex: Farinha de Trigo"
                   value={newItem.name || ''}
                   onChange={e => setNewItem({...newItem, name: e.target.value})}
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Unidade de Medida</label>
                 <select 
                   className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-chef-500 focus:border-chef-500 outline-none"
                   value={newItem.unit}
                   onChange={e => setNewItem({...newItem, unit: e.target.value as Unit})}
                 >
                   {Object.values(Unit).map(u => <option key={u} value={u}>{u}</option>)}
                 </select>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Custo Unitário (R$)</label>
                 <input 
                   type="number" 
                   step="0.01"
                   className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-chef-500 focus:border-chef-500 outline-none" 
                   placeholder="0.00"
                   value={newItem.costPerUnit || ''}
                   onChange={e => setNewItem({...newItem, costPerUnit: parseFloat(e.target.value)})}
                 />
               </div>

               <div className="col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                 <input 
                   className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-chef-500 focus:border-chef-500 outline-none" 
                   placeholder="Nome do fornecedor principal"
                   value={newItem.supplier || ''}
                   onChange={e => setNewItem({...newItem, supplier: e.target.value})}
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Atual</label>
                 <input 
                   type="number" 
                   step="0.001"
                   className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-chef-500 focus:border-chef-500 outline-none" 
                   placeholder="0"
                   value={newItem.currentStock || ''}
                   onChange={e => setNewItem({...newItem, currentStock: parseFloat(e.target.value)})}
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Mínimo</label>
                 <input 
                   type="number" 
                   step="0.001"
                   className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-chef-500 focus:border-chef-500 outline-none" 
                   placeholder="0"
                   value={newItem.minStock || ''}
                   onChange={e => setNewItem({...newItem, minStock: parseFloat(e.target.value)})}
                 />
               </div>
             </div>

             <div className="flex justify-end gap-3 mt-8">
               <button 
                 onClick={() => setShowNewItemModal(false)} 
                 className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
               >
                 Cancelar
               </button>
               <button 
                 onClick={handleCreateItem} 
                 disabled={!newItem.name || !newItem.supplier || newItem.costPerUnit === undefined}
                 className="px-5 py-2.5 bg-chef-600 text-white rounded-lg font-medium hover:bg-chef-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 Cadastrar Insumo
               </button>
             </div>
          </div>
        </div>
      )}

      {/* --- MODAL: MOVEMENT (ENTRADAS/SAIDAS) --- */}
      {showMovementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[450px] p-6 shadow-xl">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {movementForm.type === 'IN' ? 'Registrar Entrada / Compra' : 'Registrar Saída / Perda'}
                </h2>
                <button onClick={() => setShowMovementModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
             </div>

             <div className="space-y-4">
               {/* Type Selector */}
               <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                 <button 
                   onClick={() => setMovementForm({...movementForm, type: 'IN'})}
                   className={`flex-1 py-2 rounded-md text-sm font-medium flex justify-center items-center gap-2 transition-all ${movementForm.type === 'IN' ? 'bg-white shadow text-emerald-700' : 'text-gray-500'}`}
                 >
                   <ArrowDownCircle size={18} /> Entrada
                 </button>
                 <button 
                   onClick={() => setMovementForm({...movementForm, type: 'OUT'})}
                   className={`flex-1 py-2 rounded-md text-sm font-medium flex justify-center items-center gap-2 transition-all ${movementForm.type === 'OUT' ? 'bg-white shadow text-red-700' : 'text-gray-500'}`}
                 >
                   <ArrowUpCircle size={18} /> Saída
                 </button>
               </div>
               
               {/* Date Input */}
               <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Data da Movimentação</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="date"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-chef-500"
                      value={movementForm.date}
                      onChange={e => setMovementForm({...movementForm, date: e.target.value})}
                    />
                  </div>
               </div>

               {/* Ingredient Select */}
               <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Insumo</label>
                  <select 
                      className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-chef-500"
                      value={movementForm.ingredientId}
                      onChange={e => setMovementForm({...movementForm, ingredientId: e.target.value})}
                  >
                    <option value="">Selecione o Insumo...</option>
                    {ingredients.map(i => (
                      <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                    ))}
                  </select>
               </div>

               {/* Quantity */}
               <div>
                 <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Quantidade</label>
                 <input 
                   type="number" 
                   step="0.001"
                   className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-chef-500" 
                   placeholder="Ex: 5"
                   value={movementForm.quantity || ''}
                   onChange={e => setMovementForm({...movementForm, quantity: parseFloat(e.target.value)})}
                 />
               </div>

               {/* Conditional: Price Input (Only for IN) */}
               {movementForm.type === 'IN' && (
                 <div>
                   <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Custo Unitário (R$)</label>
                   <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="number" 
                        step="0.01"
                        className="w-full pl-10 pr-4 py-2 border border-green-200 bg-green-50 rounded-lg outline-none focus:ring-2 focus:ring-green-500 text-green-800 font-medium" 
                        placeholder="Deixe vazio para usar custo atual"
                        onChange={e => setMovementForm({...movementForm, price: parseFloat(e.target.value)})}
                      />
                   </div>
                   <p className="text-xs text-gray-400 mt-1">Atualizará o custo do insumo se preenchido.</p>
                 </div>
               )}

               {/* Description / Invoice */}
               <div>
                 <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Observação / Nota Fiscal</label>
                 <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-chef-500"
                      placeholder="Ex: NF 1234 - Fornecedor X"
                      value={movementForm.description}
                      onChange={e => setMovementForm({...movementForm, description: e.target.value})}
                    />
                 </div>
               </div>

             </div>
             
             <div className="flex justify-end gap-3 mt-8">
               <button 
                 onClick={() => setShowMovementModal(false)} 
                 className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
               >
                 Cancelar
               </button>
               <button 
                 onClick={handleSaveMovement} 
                 className={`px-5 py-2.5 text-white rounded-lg font-medium shadow-sm transition-colors ${movementForm.type === 'IN' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
               >
                 Confirmar {movementForm.type === 'IN' ? 'Entrada' : 'Saída'}
               </button>
             </div>
          </div>
        </div>
      )}

      {/* --- MODAL: PRICE HISTORY --- */}
      {showPriceHistoryModal && selectedIngredientHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[600px] p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <LineChartIcon className="text-chef-500" size={24} />
                  Histórico de Preço
                </h2>
                <p className="text-sm text-gray-500">{selectedIngredientHistory.name} - Últimos 6 meses</p>
              </div>
              <button onClick={() => setShowPriceHistoryModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="h-64 w-full">
              {getPriceHistoryData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getPriceHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#9ca3af', fontSize: 12}} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#9ca3af', fontSize: 12}} 
                      domain={['auto', 'auto']}
                      tickFormatter={(value) => `R$ ${value}`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Custo Unit.']}
                      labelFormatter={(label, payload) => payload[0]?.payload.fullDate || label}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#f97316" 
                      strokeWidth={3} 
                      dot={{fill: '#f97316', strokeWidth: 2, r: 4, stroke: '#fff'}}
                      activeDot={{r: 6}}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                  <TrendingUp size={48} className="mb-2 opacity-50" />
                  <p>Histórico insuficiente para gerar gráfico.</p>
                  <p className="text-xs">Registre mais entradas de compras para visualizar a evolução.</p>
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4 flex justify-between items-center text-sm">
               <span className="text-gray-500">Custo Atual: <strong className="text-gray-800">R$ {selectedIngredientHistory.costPerUnit.toFixed(2)} / {selectedIngredientHistory.unit}</strong></span>
               <button 
                 onClick={() => setShowPriceHistoryModal(false)}
                 className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
               >
                 Fechar
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};