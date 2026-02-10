import React, { useState, useMemo, useEffect } from 'react';
import { Recipe, Ingredient, RecipeIngredient } from '../types';
import { Trash2, Plus, Calculator, ChefHat, Sparkles, AlertTriangle, Save, X, Edit2, Filter } from 'lucide-react';
import { analyzeRecipeCost } from '../services/geminiService';

interface RecipeManagerProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  onUpdateRecipe: (recipe: Recipe) => void;
  onCreateRecipe: (recipe: Recipe) => void;
}

export const RecipeManager: React.FC<RecipeManagerProps> = ({ recipes, ingredients, onUpdateRecipe, onCreateRecipe }) => {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState<Recipe | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [newIngredientId, setNewIngredientId] = useState<string>('');
  
  // Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const activeRecipe = useMemo(() => 
    recipes.find(r => r.id === selectedRecipeId) || null
  , [recipes, selectedRecipeId]);

  // Derive unique categories
  const categories = useMemo(() => {
    const uniqueCats = new Set(recipes.map(r => r.category).filter(Boolean));
    return ['Todos', ...Array.from(uniqueCats)];
  }, [recipes]);

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    if (selectedCategory === 'Todos') return recipes;
    return recipes.filter(r => r.category === selectedCategory);
  }, [recipes, selectedCategory]);

  // Reset state when selecting a new recipe
  useEffect(() => {
    if (activeRecipe) {
      setEditedRecipe(JSON.parse(JSON.stringify(activeRecipe)));
      setIsEditing(false);
      setAiAnalysis('');
    }
  }, [activeRecipe]);

  const handleCreateNew = () => {
    const newRecipe: Recipe = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Nova Receita',
      category: 'Geral',
      ingredients: [],
      preparationTimeMinutes: 0,
      yieldServings: 1,
      salePrice: 0,
      instructions: '',
      lastRevision: new Date().toISOString()
    };
    onCreateRecipe(newRecipe);
    setSelectedRecipeId(newRecipe.id);
    setEditedRecipe(newRecipe);
    setIsEditing(true);
    // Reset filter to ensure the new recipe is visible if it doesn't match current filter
    setSelectedCategory('Todos');
  };

  const calculateCost = (recipe: Recipe) => {
    return recipe.ingredients.reduce((total, item) => {
      const ing = ingredients.find(i => i.id === item.ingredientId);
      if (!ing) return total;
      return total + (ing.costPerUnit * item.quantity);
    }, 0);
  };

  const handleSave = () => {
    if (editedRecipe) {
      onUpdateRecipe({
        ...editedRecipe,
        lastRevision: new Date().toISOString()
      });
      setIsEditing(false);
    }
  };

  const handleAddIngredient = () => {
    if (newIngredientId && editedRecipe) {
      const exists = editedRecipe.ingredients.find(i => i.ingredientId === newIngredientId);
      if (!exists) {
        setEditedRecipe({
          ...editedRecipe,
          ingredients: [...editedRecipe.ingredients, { ingredientId: newIngredientId, quantity: 0 }]
        });
      }
      setNewIngredientId('');
    }
  };

  const handleRemoveIngredient = (ingId: string) => {
    if (editedRecipe) {
      setEditedRecipe({
        ...editedRecipe,
        ingredients: editedRecipe.ingredients.filter(i => i.ingredientId !== ingId)
      });
    }
  };

  const handleUpdateIngredientQty = (ingId: string, qty: number) => {
    if (editedRecipe) {
      setEditedRecipe({
        ...editedRecipe,
        ingredients: editedRecipe.ingredients.map(i => 
          i.ingredientId === ingId ? { ...i, quantity: qty } : i
        )
      });
    }
  };

  const handleAiAnalyze = async () => {
    if (!activeRecipe) return;
    setLoadingAi(true);
    setAiAnalysis('');
    const result = await analyzeRecipeCost(activeRecipe, ingredients);
    setAiAnalysis(result || '');
    setLoadingAi(false);
  };

  // Render Logic Variables
  const currentRecipe = isEditing ? editedRecipe : activeRecipe;
  const totalCost = currentRecipe ? calculateCost(currentRecipe) : 0;
  const cmvPercentage = currentRecipe && currentRecipe.salePrice > 0 
    ? (totalCost / currentRecipe.salePrice) * 100 
    : 0;

  const cmvColor = cmvPercentage > 35 ? 'text-red-600' : cmvPercentage > 28 ? 'text-yellow-600' : 'text-green-600';
  const cmvBarColor = cmvPercentage > 35 ? 'bg-red-500' : cmvPercentage > 28 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="flex h-full gap-6">
      {/* Sidebar List */}
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">Fichas Técnicas</h2>
            <button 
              onClick={handleCreateNew}
              className="p-2 bg-chef-500 text-white rounded-lg hover:bg-chef-600 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
          
          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-chef-500 bg-white appearance-none cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {filteredRecipes.length === 0 ? (
            <div className="text-center p-4 text-gray-400 text-sm italic">
              Nenhuma receita nesta categoria.
            </div>
          ) : (
            filteredRecipes.map(recipe => {
              const cost = calculateCost(recipe);
              const cmv = recipe.salePrice > 0 ? (cost / recipe.salePrice) * 100 : 0;
              return (
                <div 
                  key={recipe.id}
                  onClick={() => setSelectedRecipeId(recipe.id)}
                  className={`p-3 rounded-lg cursor-pointer border transition-all ${selectedRecipeId === recipe.id ? 'border-chef-500 bg-chef-50' : 'border-transparent hover:bg-gray-50'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">{recipe.name}</h3>
                      <p className="text-xs text-gray-500">{recipe.category}</p>
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded-full ${cmv > 35 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      CMV {cmv.toFixed(0)}%
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail View */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        {currentRecipe ? (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div className="flex-1 mr-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      value={currentRecipe.name}
                      onChange={(e) => setEditedRecipe({...currentRecipe, name: e.target.value})}
                      className="text-2xl font-bold text-gray-800 w-full border-b border-gray-300 focus:outline-none focus:border-chef-500"
                      placeholder="Nome do Prato"
                    />
                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        value={currentRecipe.category}
                        onChange={(e) => setEditedRecipe({...currentRecipe, category: e.target.value})}
                        className="text-sm text-gray-600 w-1/3 border border-gray-200 rounded p-1"
                        placeholder="Categoria (ex: Principal)"
                      />
                      <input 
                        type="text" 
                        value={currentRecipe.instructions}
                        onChange={(e) => setEditedRecipe({...currentRecipe, instructions: e.target.value})}
                        className="text-sm text-gray-500 flex-1 border border-gray-200 rounded p-1"
                        placeholder="Instruções breves..."
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      {currentRecipe.name}
                      <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                        Rev: {new Date(currentRecipe.lastRevision).toLocaleDateString()}
                      </span>
                    </h1>
                    <p className="text-sm text-chef-600 font-medium mt-1 mb-1">{currentRecipe.category}</p>
                    <p className="text-gray-500 text-sm">{currentRecipe.instructions || 'Sem instruções definidas.'}</p>
                  </>
                )}
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                   <p className="text-sm text-gray-500">Preço Venda</p>
                   {isEditing ? (
                     <div className="flex items-center justify-end gap-1">
                       <span className="text-gray-400">R$</span>
                       <input 
                        type="number"
                        step="0.10"
                        value={currentRecipe.salePrice}
                        onChange={(e) => setEditedRecipe({...currentRecipe, salePrice: parseFloat(e.target.value) || 0})}
                        className="text-xl font-bold text-gray-900 w-24 text-right border border-gray-200 rounded p-1"
                       />
                     </div>
                   ) : (
                     <p className="text-xl font-bold text-gray-900">R$ {currentRecipe.salePrice.toFixed(2)}</p>
                   )}
                </div>

                <div className="flex gap-2 mt-2">
                  {isEditing ? (
                    <>
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-lg"
                      >
                        <X size={18} />
                      </button>
                      <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm"
                      >
                        <Save size={18} /> Salvar
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => {
                        setEditedRecipe(JSON.parse(JSON.stringify(activeRecipe)));
                        setIsEditing(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      <Edit2 size={16} /> Editar
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* KPIs */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-2"><Calculator size={14}/> Custo Total (Insumos)</p>
                  <p className="text-2xl font-bold text-gray-800">R$ {totalCost.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative overflow-hidden">
                  <p className="text-sm text-gray-500 mb-1">Margem de Contribuição</p>
                  <p className="text-2xl font-bold text-gray-800">R$ {(currentRecipe.salePrice - totalCost).toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">CMV Teórico</p>
                  <div className="flex items-end gap-2">
                    <p className={`text-2xl font-bold ${cmvColor}`}>{cmvPercentage.toFixed(1)}%</p>
                    {cmvPercentage > 30 && <AlertTriangle size={20} className="text-yellow-500 mb-1" />}
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 mt-2 rounded-full overflow-hidden">
                    <div className={`h-full ${cmvBarColor}`} style={{ width: `${Math.min(cmvPercentage, 100)}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Ingredients Table */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-700">Composição de Custo</h3>
                </div>
                
                <div className="overflow-x-auto border border-gray-100 rounded-lg">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
                      <tr>
                        <th className="px-4 py-3">Ingrediente</th>
                        <th className="px-4 py-3">Qtd. Líquida</th>
                        <th className="px-4 py-3">Custo Unit.</th>
                        <th className="px-4 py-3 text-right">Subtotal</th>
                        {isEditing && <th className="px-4 py-3 w-10"></th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {currentRecipe.ingredients.map((item, idx) => {
                        const ing = ingredients.find(i => i.id === item.ingredientId);
                        const subtotal = ing ? ing.costPerUnit * item.quantity : 0;
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-800">
                              {ing?.name || 'Item Removido'}
                            </td>
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number" 
                                    step="0.001"
                                    value={item.quantity}
                                    onChange={(e) => handleUpdateIngredientQty(item.ingredientId, parseFloat(e.target.value) || 0)}
                                    className="w-20 border border-gray-300 rounded px-2 py-1"
                                  />
                                  <span className="text-gray-500">{ing?.unit}</span>
                                </div>
                              ) : (
                                <span>{item.quantity} {ing?.unit}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                              R$ {ing?.costPerUnit.toFixed(2)} / {ing?.unit}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-gray-800">
                              R$ {subtotal.toFixed(2)}
                            </td>
                            {isEditing && (
                              <td className="px-4 py-3 text-center">
                                <button 
                                  onClick={() => handleRemoveIngredient(item.ingredientId)}
                                  className="text-red-400 hover:text-red-600"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                      {isEditing && (
                        <tr className="bg-gray-50">
                           <td colSpan={5} className="px-4 py-3">
                              <div className="flex gap-2">
                                <select 
                                  value={newIngredientId}
                                  onChange={(e) => setNewIngredientId(e.target.value)}
                                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                                >
                                  <option value="">Adicionar Ingrediente...</option>
                                  {ingredients
                                    .filter(i => !currentRecipe.ingredients.find(ri => ri.ingredientId === i.id))
                                    .map(i => (
                                      <option key={i.id} value={i.id}>{i.name} ({i.unit}) - R$ {i.costPerUnit.toFixed(2)}</option>
                                  ))}
                                </select>
                                <button 
                                  onClick={handleAddIngredient}
                                  disabled={!newIngredientId}
                                  className="bg-chef-500 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                >
                                  Adicionar
                                </button>
                              </div>
                           </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AI Analysis Section (Only view mode) */}
              {!isEditing && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                      <Sparkles size={18} className="text-indigo-500" />
                      Consultoria do Chef IA
                    </h3>
                    <button 
                      onClick={handleAiAnalyze}
                      disabled={loadingAi}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                      {loadingAi ? 'Analisando...' : 'Analisar Ficha Técnica'}
                    </button>
                  </div>
                  
                  {aiAnalysis && (
                    <div className="prose prose-sm prose-indigo text-indigo-800 bg-white/50 p-4 rounded-lg">
                      <div className="whitespace-pre-wrap">{aiAnalysis}</div>
                    </div>
                  )}
                  {!aiAnalysis && !loadingAi && (
                    <p className="text-indigo-400 text-sm">Clique em analisar para receber dicas de redução de custo e marketing.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <ChefHat size={48} className="mb-4 text-gray-300" />
            <p>Selecione uma ficha técnica para ver detalhes</p>
          </div>
        )}
      </div>
    </div>
  );
};