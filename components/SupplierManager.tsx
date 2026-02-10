import React from 'react';
import { Supplier, Ingredient } from '../types';
import { Phone, Star, Package, MapPin, MoreHorizontal } from 'lucide-react';

interface SupplierManagerProps {
  suppliers: Supplier[];
  ingredients: Ingredient[];
}

export const SupplierManager: React.FC<SupplierManagerProps> = ({ suppliers, ingredients }) => {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Meus Fornecedores</h1>
        <button className="px-4 py-2 bg-chef-500 text-white rounded-lg hover:bg-chef-600 transition-colors">
          + Novo Fornecedor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map(supplier => {
           const suppliedItems = ingredients.filter(i => i.supplier === supplier.name);
           
           return (
             <div key={supplier.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
               <div className="p-6">
                 <div className="flex justify-between items-start mb-4">
                   <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-lg font-bold">
                     {supplier.name.substring(0,2).toUpperCase()}
                   </div>
                   <button className="text-gray-400 hover:text-gray-600">
                     <MoreHorizontal size={20} />
                   </button>
                 </div>
                 
                 <h3 className="text-lg font-bold text-gray-900 mb-1">{supplier.name}</h3>
                 <p className="text-sm text-gray-500 mb-4 bg-gray-50 inline-block px-2 py-1 rounded">{supplier.category}</p>
                 
                 <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Phone size={16} className="text-gray-400" />
                      {supplier.contact}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      {supplier.rating.toFixed(1)} / 5.0
                    </div>
                 </div>

                 <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                       <Package size={14} /> Produtos Fornecidos ({suppliedItems.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                       {suppliedItems.slice(0, 3).map(i => (
                          <span key={i.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md border border-gray-200">
                             {i.name}
                          </span>
                       ))}
                       {suppliedItems.length > 3 && (
                          <span className="text-xs text-gray-400 px-1 py-1">+ {suppliedItems.length - 3}</span>
                       )}
                    </div>
                 </div>
               </div>
               <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-green-600 font-medium">Ativo</span>
                  <button className="text-sm text-chef-600 font-medium hover:underline">Ver Histórico</button>
               </div>
             </div>
           )
        })}
      </div>
    </div>
  );
};
