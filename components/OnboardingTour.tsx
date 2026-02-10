import React from 'react';
import { ArrowRight, X, ChevronLeft, Check } from 'lucide-react';

interface OnboardingTourProps {
  stepIndex: number;
  totalSteps: number;
  title: string;
  description: string;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  stepIndex,
  totalSteps,
  title,
  description,
  onNext,
  onPrev,
  onSkip
}) => {
  const isLastStep = stepIndex === totalSteps - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      {/* Backdrop with hole effect (simulated by semi-transparent bg for simplicity) */}
      <div className="absolute inset-0 bg-gray-900/60 pointer-events-auto transition-opacity" />

      {/* Tour Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 m-4 pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-300">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100 rounded-t-2xl overflow-hidden">
           <div 
             className="h-full bg-chef-600 transition-all duration-500 ease-out"
             style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
           />
        </div>

        <button 
          onClick={onSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          title="Pular tour"
        >
          <X size={20} />
        </button>

        <div className="mt-4 mb-6">
          <span className="inline-block px-2 py-1 rounded-md bg-chef-50 text-chef-700 text-xs font-bold uppercase tracking-wider mb-2">
            Passo {stepIndex + 1} de {totalSteps}
          </span>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>

        <div className="flex items-center justify-between mt-8">
          <button 
            onClick={onPrev}
            disabled={stepIndex === 0}
            className={`flex items-center gap-1 text-sm font-medium transition-colors ${stepIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <ChevronLeft size={16} /> Anterior
          </button>

          <button 
            onClick={onNext}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 ${isLastStep ? 'bg-green-600 hover:bg-green-700' : 'bg-chef-600 hover:bg-chef-700'}`}
          >
            {isLastStep ? (
              <>Começar <Check size={18} /></>
            ) : (
              <>Próximo <ArrowRight size={18} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};