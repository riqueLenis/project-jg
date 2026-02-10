import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { RecipeManager } from './components/RecipeManager';
import { InventoryManager } from './components/InventoryManager';
import { SupplierManager } from './components/SupplierManager';
import { CmvReport } from './components/CmvReport';
import { WasteManager } from './components/WasteManager';
import { ShoppingList } from './components/ShoppingList';
import { LandingPage } from './components/LandingPage';
import { OnboardingTour } from './components/OnboardingTour';

import { PageView, Recipe, Ingredient, Supplier, InventoryRecord, StockMovement, WasteLog } from './types';
import { MOCK_INGREDIENTS, MOCK_RECIPES, MOCK_SUPPLIERS } from './constants';

// Define Tour Steps and Navigation Logic
const TOUR_STEPS: { page: PageView, title: string, content: string }[] = [
  { 
    page: 'dashboard', 
    title: 'Bem-vindo ao Dashboard', 
    content: 'Aqui você tem a visão geral do seu negócio: Faturamento, alertas de estoque crítico e a evolução do seu CMV (Custo de Mercadoria Vendida).' 
  },
  { 
    page: 'recipes', 
    title: 'Fichas Técnicas Inteligentes', 
    content: 'Cadastre suas receitas aqui. O sistema calcula o custo exato baseando-se no estoque e ainda usa IA para sugerir melhorias de lucro.' 
  },
  { 
    page: 'inventory', 
    title: 'Controle de Estoque e Preços', 
    content: 'Gerencie entradas, saídas e audite seu estoque. Agora você pode ver o histórico de variação de preços de cada insumo nos últimos 6 meses.' 
  },
  { 
    page: 'shopping', 
    title: 'Compras com Inteligência Artificial', 
    content: 'Nossa IA analisa seu estoque baixo e gera sugestões de compra otimizadas, dicas de sazonalidade e negociação com fornecedores.' 
  },
  { 
    page: 'cmv', 
    title: 'Relatórios Financeiros', 
    content: 'Acompanhe onde está indo cada centavo. Compare o estoque inicial, compras e estoque final para ter o cálculo preciso do seu lucro real.' 
  }
];

const App: React.FC = () => {
  // Navigation State
  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  const [showLanding, setShowLanding] = useState(true);
  
  // Onboarding State
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);

  // Simulated Application State
  const [ingredients, setIngredients] = useState<Ingredient[]>(MOCK_INGREDIENTS);
  const [recipes, setRecipes] = useState<Recipe[]>(MOCK_RECIPES);
  const [suppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  
  // New State for Features
  const [inventoryRecords, setInventoryRecords] = useState<InventoryRecord[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>([]);

  // Handlers
  const handleUpdateRecipe = (updatedRecipe: Recipe) => {
    setRecipes(prev => prev.map(r => r.id === updatedRecipe.id ? updatedRecipe : r));
  };

  const handleCreateRecipe = (newRecipe: Recipe) => {
    setRecipes(prev => [...prev, newRecipe]);
  };

  const handleUpdateStock = (id: string, newStock: number) => {
    setIngredients(prev => prev.map(i => i.id === id ? { ...i, currentStock: newStock } : i));
  };

  const handleSaveInventoryRecord = (record: InventoryRecord) => {
    setInventoryRecords(prev => [...prev, record]);
  };

  const handleAddIngredient = (ingredient: Ingredient) => {
    setIngredients(prev => [...prev, ingredient]);
  };

  const handleAddMovement = (movement: StockMovement) => {
    setMovements(prev => [...prev, movement]);
  };

  const handleAddWaste = (log: WasteLog) => {
    setWasteLogs(prev => [...prev, log]);
  };

  // Login & Onboarding Logic
  const handleLogin = (startTour: boolean = false) => {
    setShowLanding(false);
    if (startTour) {
      setIsTourActive(true);
      setTourStepIndex(0);
      setCurrentPage(TOUR_STEPS[0].page);
    }
  };

  const handleTourNext = () => {
    const nextStep = tourStepIndex + 1;
    if (nextStep < TOUR_STEPS.length) {
      setTourStepIndex(nextStep);
      setCurrentPage(TOUR_STEPS[nextStep].page);
    } else {
      setIsTourActive(false); // End Tour
    }
  };

  const handleTourPrev = () => {
    const prevStep = tourStepIndex - 1;
    if (prevStep >= 0) {
      setTourStepIndex(prevStep);
      setCurrentPage(TOUR_STEPS[prevStep].page);
    }
  };

  const handleTourSkip = () => {
    setIsTourActive(false);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard ingredients={ingredients} recipes={recipes} />;
      case 'recipes':
        return (
          <RecipeManager 
            recipes={recipes} 
            ingredients={ingredients} 
            onUpdateRecipe={handleUpdateRecipe} 
            onCreateRecipe={handleCreateRecipe}
          />
        );
      case 'inventory':
        return (
          <InventoryManager 
            ingredients={ingredients} 
            inventoryRecords={inventoryRecords}
            movements={movements}
            onUpdateStock={handleUpdateStock}
            onSaveInventoryRecord={handleSaveInventoryRecord}
            onAddIngredient={handleAddIngredient}
            onAddMovement={handleAddMovement}
          />
        );
      case 'cmv':
        return (
          <CmvReport 
            inventoryRecords={inventoryRecords}
            movements={movements}
          />
        );
      case 'waste':
        return (
          <WasteManager 
            ingredients={ingredients}
            wasteLogs={wasteLogs}
            onAddWaste={handleAddWaste}
            onUpdateStock={handleUpdateStock}
          />
        );
      case 'shopping':
        return <ShoppingList ingredients={ingredients} />;
      case 'suppliers':
        return <SupplierManager suppliers={suppliers} ingredients={ingredients} />;
      default:
        return <Dashboard ingredients={ingredients} recipes={recipes} />;
    }
  };

  if (showLanding) {
    return <LandingPage onEnter={handleLogin} />;
  }

  return (
    <>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderContent()}
      </Layout>

      {isTourActive && (
        <OnboardingTour 
          stepIndex={tourStepIndex}
          totalSteps={TOUR_STEPS.length}
          title={TOUR_STEPS[tourStepIndex].title}
          description={TOUR_STEPS[tourStepIndex].content}
          onNext={handleTourNext}
          onPrev={handleTourPrev}
          onSkip={handleTourSkip}
        />
      )}
    </>
  );
};

export default App;