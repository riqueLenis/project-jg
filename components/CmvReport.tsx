import React, { useState } from 'react';
import { InventoryRecord, StockMovement } from '../types';
import { PieChart, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface CmvReportProps {
  inventoryRecords: InventoryRecord[];
  movements: StockMovement[];
}

export const CmvReport: React.FC<CmvReportProps> = ({ inventoryRecords, movements }) => {
  const sortedRecords = [...inventoryRecords].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const [startIndex, setStartIndex] = useState<number>(sortedRecords.length > 1 ? sortedRecords.length - 2 : 0);
  const [endIndex, setEndIndex] = useState<number>(sortedRecords.length > 0 ? sortedRecords.length - 1 : 0);

  // Logic to calculate CMV
  // CMV = Estoque Inicial + Compras - Estoque Final
  const startInventory = sortedRecords[startIndex];
  const endInventory = sortedRecords[endIndex];
  
  const isValidPeriod = startInventory && endInventory && new Date(startInventory.date) < new Date(endInventory.date);

  const purchasesInPeriod = isValidPeriod ? movements
    .filter(m => m.type === 'IN' && new Date(m.date) > new Date(startInventory.date) && new Date(m.date) <= new Date(endInventory.date))
    .reduce((sum, m) => sum + m.value, 0) : 0;

  const initialValue = startInventory ? startInventory.totalValue : 0;
  const finalValue = endInventory ? endInventory.totalValue : 0;
  
  const cmvValue = isValidPeriod ? (initialValue + purchasesInPeriod) - finalValue : 0;

  const chartData = [
    { name: 'Estoque Inicial', valor: initialValue },
    { name: 'Compras (+)', valor: purchasesInPeriod },
    { name: 'Estoque Final (-)', valor: finalValue },
  ];

  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
         <PieChart className="text-chef-600" /> Relatório de CMV (Custo da Mercadoria Vendida)
       </h1>

       {sortedRecords.length < 2 ? (
         <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl text-yellow-800">
           <p className="font-bold mb-2">Dados Insuficientes</p>
           <p>Para calcular o CMV com precisão, você precisa realizar pelo menos dois Inventários (Contagens de Estoque) na aba "Estoque".</p>
         </div>
       ) : (
         <>
           {/* Period Selector */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-6 items-end">
             <div className="flex-1">
               <label className="block text-sm font-medium text-gray-700 mb-1">Inventário Inicial</label>
               <select 
                  className="w-full border rounded-lg p-2"
                  value={startIndex}
                  onChange={(e) => setStartIndex(parseInt(e.target.value))}
               >
                 {sortedRecords.map((rec, idx) => (
                   <option key={rec.id} value={idx}>{new Date(rec.date).toLocaleDateString()} - R$ {rec.totalValue.toFixed(2)}</option>
                 ))}
               </select>
             </div>
             <div className="flex-1">
               <label className="block text-sm font-medium text-gray-700 mb-1">Inventário Final</label>
               <select 
                  className="w-full border rounded-lg p-2"
                  value={endIndex}
                  onChange={(e) => setEndIndex(parseInt(e.target.value))}
               >
                 {sortedRecords.map((rec, idx) => (
                   <option key={rec.id} value={idx}>{new Date(rec.date).toLocaleDateString()} - R$ {rec.totalValue.toFixed(2)}</option>
                 ))}
               </select>
             </div>
           </div>
            
            {/* Report Content */}
           {isValidPeriod ? (
             <>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <p className="text-blue-600 text-sm font-medium mb-1">Estoque Inicial + Compras</p>
                    <p className="text-2xl font-bold text-blue-900">R$ {(initialValue + purchasesInPeriod).toFixed(2)}</p>
                    <div className="text-xs text-blue-400 mt-2">Disponível para venda</div>
                 </div>
                 <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                    <p className="text-orange-600 text-sm font-medium mb-1">CMV do Período</p>
                    <p className="text-4xl font-bold text-orange-900">R$ {cmvValue.toFixed(2)}</p>
                    <div className="text-xs text-orange-700 mt-2">Custo real de consumo</div>
                 </div>
                 <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                    <p className="text-green-600 text-sm font-medium mb-1">Estoque Final (Auditado)</p>
                    <p className="text-2xl font-bold text-green-900">R$ {finalValue.toFixed(2)}</p>
                    <div className="text-xs text-green-500 mt-2">Valor remanescente</div>
                 </div>
               </div>

               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Composição do Cálculo</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                      <Bar dataKey="valor" fill="#ea580c" barSize={30} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
             </>
           ) : (
             <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl">
               Selecione uma data final posterior à data inicial.
             </div>
           )}
         </>
       )}
    </div>
  );
};
