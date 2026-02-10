import React, { useState } from 'react';
import { Ingredient, WasteLog } from '../types';
import { Trash2, Plus, Calendar } from 'lucide-react';

interface WasteManagerProps {
  ingredients: Ingredient[];
  wasteLogs: WasteLog[];
  onAddWaste: (log: WasteLog) => void;
  onUpdateStock: (id: string, qty: number) => void;
}

export const WasteManager: React.FC<WasteManagerProps> = ({ ingredients, wasteLogs, onAddWaste, onUpdateStock }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ingredientId: '', quantity: 0, reason: '', responsible: '' });

  const handleSave = () => {
    const ing = ingredients.find(i => i.id === form.ingredientId);
    if (ing && form.quantity > 0) {
      const log: WasteLog = {
        id: Math.random().toString(36).substr(2, 9),
        ingredientId: ing.id,
        quantity: form.quantity,
        cost: form.quantity * ing.costPerUnit,
        reason: form.reason,
        responsible: form.responsible,
        date: new Date().toISOString()
      };
      onAddWaste(log);
      onUpdateStock(ing.id, Math.max(0, ing.currentStock - form.quantity));
      setShowModal(false);
      setForm({ ingredientId: '', quantity: 0, reason: '', responsible: '' });
    }
  };

  const totalWasteValue = wasteLogs.reduce((acc, log) => acc + log.cost, 0);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Controle de Desperdícios</h1>
          <p className="text-gray-500 text-sm">Registro de quebras, validade e erros de produção.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> Registrar Perda
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <p className="text-gray-500 text-sm">Total Perdas (Mês)</p>
           <h3 className="text-3xl font-bold text-gray-800">R$ {totalWasteValue.toFixed(2)}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <p className="text-gray-500 text-sm">Ocorrências</p>
           <h3 className="text-3xl font-bold text-gray-800">{wasteLogs.length}</h3>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
              <tr>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Insumo</th>
                <th className="px-6 py-3">Motivo</th>
                <th className="px-6 py-3">Responsável</th>
                <th className="px-6 py-3 text-right">Quantidade</th>
                <th className="px-6 py-3 text-right">Custo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {wasteLogs.map(log => {
                const ing = ingredients.find(i => i.id === log.ingredientId);
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500 flex items-center gap-2">
                      <Calendar size={14} /> {new Date(log.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{ing?.name || 'Desconhecido'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-red-50 text-red-700 rounded-md text-xs border border-red-100">{log.reason}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{log.responsible}</td>
                    <td className="px-6 py-4 text-right">{log.quantity} {ing?.unit}</td>
                    <td className="px-6 py-4 text-right font-medium text-red-600">R$ {log.cost.toFixed(2)}</td>
                  </tr>
                );
              })}
              {wasteLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    Nenhum registro de desperdício encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-96 p-6 shadow-xl">
             <h2 className="text-xl font-bold mb-4 text-red-700 flex items-center gap-2"><Trash2 size={20}/> Registrar Perda</h2>
             <div className="space-y-3">
               <select 
                  className="w-full border rounded p-2"
                  value={form.ingredientId}
                  onChange={e => setForm({...form, ingredientId: e.target.value})}
               >
                 <option value="">Selecione o Insumo...</option>
                 {ingredients.map(i => (
                   <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                 ))}
               </select>

               <input 
                 type="number" 
                 className="w-full border rounded p-2" 
                 placeholder="Quantidade Perdida"
                 onChange={e => setForm({...form, quantity: parseFloat(e.target.value)})}
               />
               
               <select 
                  className="w-full border rounded p-2"
                  value={form.reason}
                  onChange={e => setForm({...form, reason: e.target.value})}
               >
                 <option value="">Motivo...</option>
                 <option value="Vencimento">Vencimento</option>
                 <option value="Armazenamento Incorreto">Armazenamento Incorreto</option>
                 <option value="Erro Produção">Erro de Produção</option>
                 <option value="Queda">Queda/Quebra</option>
               </select>

               <input 
                 className="w-full border rounded p-2" 
                 placeholder="Responsável"
                 value={form.responsible}
                 onChange={e => setForm({...form, responsible: e.target.value})}
               />
             </div>
             <div className="flex justify-end gap-2 mt-6">
               <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
               <button onClick={handleSave} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Confirmar</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
