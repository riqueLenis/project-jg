import React from 'react';
import { ChefHat, TrendingUp, Package, Sparkles, Check, ArrowRight, ShieldCheck, Clock, DollarSign } from 'lucide-react';

interface LandingPageProps {
  onEnter: (startTour?: boolean) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* Navbar Simples */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-chef-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
             <span className="text-xl font-bold text-gray-800 tracking-tight">LucroChef</span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => onEnter(false)} 
              className="text-gray-600 font-medium hover:text-chef-600 transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => onEnter(true)}
              className="bg-chef-600 text-white px-5 py-2 rounded-full font-medium hover:bg-chef-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Começar Agora
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto pt-16 pb-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold mb-6 animate-fade-in-up">
            <Sparkles size={14} /> Nova Tecnologia com IA Gemini
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
            Domine o Custo do seu <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-chef-500 to-red-600">Restaurante com IA</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mb-10">
            Deixe de perder dinheiro com fichas técnicas erradas e desperdícios. 
            O LucroChef automatiza seu CMV e usa Inteligência Artificial para otimizar suas compras.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => onEnter(true)}
              className="flex items-center justify-center gap-2 bg-chef-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-chef-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Testar Grátis Agora <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => onEnter(true)}
              className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 transition-all"
            >
              Ver Demonstração
            </button>
          </div>
          
          {/* Dashboard Preview Image Placeholder */}
          <div className="mt-16 relative mx-auto max-w-5xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden bg-gray-100 h-64 md:h-96 flex items-center justify-center group">
             <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent"></div>
             <div className="text-center">
               <Package size={64} className="mx-auto text-gray-300 mb-4 group-hover:scale-110 transition-transform duration-500" />
               <p className="text-gray-400 font-medium">Dashboard Interativo do Sistema</p>
             </div>
          </div>
        </div>
      </header>

      {/* Funcionalidades */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tudo que você precisa para lucrar mais</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Uma suíte completa de ferramentas desenhadas especificamente para a realidade de cozinhas profissionais e gestores exigentes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6">
                <ChefHat size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fichas Técnicas Dinâmicas</h3>
              <p className="text-gray-500 leading-relaxed">
                Crie receitas detalhadas e atualize custos automaticamente quando o preço dos insumos mudar. Nunca mais erre na precificação.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-6">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Controle de CMV em Tempo Real</h3>
              <p className="text-gray-500 leading-relaxed">
                Acompanhe o Custo da Mercadoria Vendida diariamente. Identifique gargalos e aumente sua margem de lucro instantaneamente.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow ring-1 ring-chef-100">
              <div className="w-12 h-12 bg-gradient-to-br from-chef-400 to-red-500 rounded-lg flex items-center justify-center text-white mb-6">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Consultoria com IA</h3>
              <p className="text-gray-500 leading-relaxed">
                Nossa IA analisa seu estoque e sugere listas de compras otimizadas, substituições de ingredientes e estratégias de venda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Por que escolher */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row items-center gap-12">
             <div className="flex-1 space-y-8">
               <h2 className="text-3xl font-bold text-gray-900">Por que escolher o LucroChef?</h2>
               
               <div className="flex gap-4">
                 <div className="mt-1"><ShieldCheck className="text-chef-600" size={24} /></div>
                 <div>
                   <h4 className="text-lg font-bold text-gray-800">Decisões baseadas em dados</h4>
                   <p className="text-gray-500">Chega de "achismo". Saiba exatamente quanto custa cada prato e quanto você lucra.</p>
                 </div>
               </div>

               <div className="flex gap-4">
                 <div className="mt-1"><Clock className="text-chef-600" size={24} /></div>
                 <div>
                   <h4 className="text-lg font-bold text-gray-800">Economia de Tempo</h4>
                   <p className="text-gray-500">Automatize cálculos de compras e inventários que levariam horas em planilhas.</p>
                 </div>
               </div>

               <div className="flex gap-4">
                 <div className="mt-1"><DollarSign className="text-chef-600" size={24} /></div>
                 <div>
                   <h4 className="text-lg font-bold text-gray-800">Redução de Desperdício</h4>
                   <p className="text-gray-500">Controle rigoroso de validade e perdas, transformando desperdício em lucro.</p>
                 </div>
               </div>
             </div>
             
             <div className="flex-1 bg-gray-50 rounded-2xl p-8 border border-gray-100">
                <div className="space-y-4">
                   <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
                     <div className="bg-green-100 p-2 rounded-full text-green-600"><Check size={20}/></div>
                     <span className="font-medium text-gray-700">Aumento médio de 15% no lucro líquido</span>
                   </div>
                   <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
                     <div className="bg-green-100 p-2 rounded-full text-green-600"><Check size={20}/></div>
                     <span className="font-medium text-gray-700">Redução de 30% no desperdício</span>
                   </div>
                   <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
                     <div className="bg-green-100 p-2 rounded-full text-green-600"><Check size={20}/></div>
                     <span className="font-medium text-gray-700">Economia de 10h semanais em gestão</span>
                   </div>
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* Planos */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Planos que cabem no seu bolso</h2>
            <p className="text-gray-400">Escolha a melhor opção para o tamanho do seu negócio.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center">
            
            {/* EASY */}
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-gray-600 transition-colors">
              <h3 className="text-xl font-bold text-white mb-2">Plano Easy</h3>
              <p className="text-gray-400 text-sm mb-6">Para quem está começando e precisa organizar a casa.</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">R$ 49</span>
                <span className="text-gray-400">/mês</span>
              </div>
              <ul className="space-y-4 mb-8 text-sm text-gray-300">
                <li className="flex gap-2"><Check size={16} className="text-green-400"/> Fichas Técnicas (até 20)</li>
                <li className="flex gap-2"><Check size={16} className="text-green-400"/> Controle de Estoque Básico</li>
                <li className="flex gap-2"><Check size={16} className="text-green-400"/> Gestão de Fornecedores</li>
                <li className="flex gap-2 opacity-50"><Check size={16}/> Sem Inteligência Artificial</li>
              </ul>
              <button onClick={() => onEnter(true)} className="w-full py-3 bg-gray-700 rounded-lg font-medium hover:bg-gray-600 transition-colors">Escolher Easy</button>
            </div>

            {/* PRO (Featured) */}
            <div className="bg-chef-600 p-8 rounded-2xl shadow-2xl transform md:scale-110 relative z-10 border border-chef-500">
              <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">MAIS POPULAR</div>
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                 Plano Pro <Sparkles size={20} className="text-yellow-300"/>
              </h3>
              <p className="text-orange-100 text-sm mb-6">Poder total com Inteligência Artificial para maximizar lucros.</p>
              <div className="mb-6">
                <span className="text-5xl font-bold">R$ 199</span>
                <span className="text-orange-100">/mês</span>
              </div>
              <ul className="space-y-4 mb-8 text-sm text-white font-medium">
                <li className="flex gap-2"><Check size={16} className="text-white"/> Fichas Técnicas Ilimitadas</li>
                <li className="flex gap-2"><Check size={16} className="text-white"/> Controle de Estoque Avançado</li>
                <li className="flex gap-2"><Check size={16} className="text-white"/> Relatórios de CMV em Tempo Real</li>
                <li className="flex gap-2"><Check size={16} className="text-white"/> <strong>IA Gemini Integrada</strong> (Análise de Custos e Compras)</li>
                <li className="flex gap-2"><Check size={16} className="text-white"/> Suporte Prioritário</li>
              </ul>
              <button onClick={() => onEnter(true)} className="w-full py-3 bg-white text-chef-700 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg">Começar com Pro</button>
            </div>

            {/* STARTER */}
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-gray-600 transition-colors">
              <h3 className="text-xl font-bold text-white mb-2">Plano Starter</h3>
              <p className="text-gray-400 text-sm mb-6">Para restaurantes em crescimento que precisam de mais controle.</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">R$ 99</span>
                <span className="text-gray-400">/mês</span>
              </div>
              <ul className="space-y-4 mb-8 text-sm text-gray-300">
                <li className="flex gap-2"><Check size={16} className="text-green-400"/> Fichas Técnicas (até 100)</li>
                <li className="flex gap-2"><Check size={16} className="text-green-400"/> Controle de Estoque Completo</li>
                <li className="flex gap-2"><Check size={16} className="text-green-400"/> Lista de Compras Automática</li>
                <li className="flex gap-2"><Check size={16} className="text-green-400"/> Relatórios Básicos</li>
                <li className="flex gap-2 opacity-50"><Check size={16}/> Sem Inteligência Artificial</li>
              </ul>
              <button onClick={() => onEnter(true)} className="w-full py-3 bg-gray-700 rounded-lg font-medium hover:bg-gray-600 transition-colors">Escolher Starter</button>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p className="mb-4 font-bold text-gray-800 text-lg">LucroChef</p>
          <p>© 2024 LucroChef SaaS. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};