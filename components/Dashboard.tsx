import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingDown, TrendingUp, AlertCircle, DollarSign, Package } from 'lucide-react';
import { Ingredient, Recipe } from '../types';

interface DashboardProps {
  ingredients: Ingredient[];
  recipes: Recipe[];
}

const MOCK_CMV_HISTORY = [
  { month: 'Jan', cmv: 32 },
  { month: 'Fev', cmv: 30 },
  { month: 'Mar', cmv: 28 },
  { month: 'Abr', cmv: 29 },
  { month: 'Mai', cmv: 35 },
  { month: 'Jun', cmv: 31 },
];

export const Dashboard: React.FC<DashboardProps> = ({ ingredients, recipes }) => {
  const lowStockCount = ingredients.filter(i => i.currentStock <= i.minStock).length;
  const avgCmv = 31.5; // Calculated from mock history

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Painel de Controle</h1>
        <div className="text-sm text-gray-500">Unidade: Matriz - São Paulo</div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">CMV Atual (Global)</p>
              <h3 className="text-3xl font-bold text-gray-800">{avgCmv}%</h3>
            </div>
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <TrendingDown size={20} />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <TrendingDown size={12} /> 2% abaixo da meta
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Estoque Crítico</p>
              <h3 className="text-3xl font-bold text-gray-800">{lowStockCount}</h3>
            </div>
            <div className={`p-2 rounded-lg ${lowStockCount > 0 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              <AlertCircle size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Itens abaixo do mínimo</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Faturamento (Mês)</p>
              <h3 className="text-3xl font-bold text-gray-800">R$ 145k</h3>
            </div>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">+12% vs mês anterior</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Valor em Estoque</p>
              <h3 className="text-3xl font-bold text-gray-800">R$ 28k</h3>
            </div>
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <Package size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Inventário realizado há 2 dias</p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Evolução do CMV (%)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CMV_HISTORY}>
                <defs>
                  <linearGradient id="colorCmv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => [`${value}%`, 'CMV']}
                />
                <Area type="monotone" dataKey="cmv" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorCmv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts Feed */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Alertas Recentes</h3>
          <div className="space-y-4">
            {ingredients.filter(i => i.currentStock <= i.minStock).slice(0, 4).map(item => (
              <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="w-2 h-2 mt-2 rounded-full bg-red-500 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Estoque Baixo: {item.name}</p>
                  <p className="text-xs text-gray-500">Atual: {item.currentStock}{item.unit} | Mín: {item.minStock}{item.unit}</p>
                </div>
              </div>
            ))}
             <div className="flex items-start gap-3 pb-3 border-b border-gray-50">
                <div className="w-2 h-2 mt-2 rounded-full bg-yellow-500 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Alta de Preço: Filé Mignon</p>
                  <p className="text-xs text-gray-500">+15% na última compra (Fornecedor A)</p>
                </div>
              </div>
          </div>
          <button className="w-full mt-4 py-2 text-sm text-chef-600 bg-chef-50 rounded-lg hover:bg-chef-100 transition-colors">
            Ver todos alertas
          </button>
        </div>
      </div>
    </div>
  );
};
