import { GoogleGenAI } from "@google/genai";
import { Recipe, Ingredient } from "../types";

const apiKey = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!apiKey) return null;
  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const analyzeRecipeCost = async (recipe: Recipe, ingredients: Ingredient[]) => {
  if (!apiKey) return "API Key não configurada. Adicione sua chave Gemini.";

  const client = getAiClient();
  if (!client) return "API Key não configurada. Adicione sua chave Gemini.";

  // Enrich recipe with ingredient names for the prompt
  const detailedIngredients = recipe.ingredients.map(ri => {
    const ing = ingredients.find(i => i.id === ri.ingredientId);
    return `${ing?.name || 'Desconhecido'}: ${ri.quantity} ${ing?.unit}`;
  }).join(', ');

  const prompt = `
    Atue como um chef executivo e consultor financeiro de restaurantes de alta performance.
    Analise a seguinte ficha técnica:
    
    Nome do Prato: ${recipe.name}
    Preço de Venda: R$ ${recipe.salePrice.toFixed(2)}
    Ingredientes:
    ${detailedIngredients}
    
    Por favor, forneça uma análise curta e direta (máximo 150 palavras) cobrindo:
    1. Se o preço de venda parece adequado considerando insumos típicos (considere custos médios de mercado se não fornecidos).
    2. Sugestão de 2 possíveis substituições ou técnicas para reduzir o CMV sem perder muita qualidade.
    3. Uma dica de marketing para vender este prato.

    Retorne em texto formatado Markdown.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Não foi possível analisar a receita no momento.";
  }
};

export const generateShoppingInsights = async (lowStockIngredients: Ingredient[]) => {
  if (!apiKey) return "API Key ausente.";

  const client = getAiClient();
  if (!client) return "API Key ausente.";

  const list = lowStockIngredients.map(i => `- ${i.name} (Estoque: ${i.currentStock} ${i.unit}, Mín: ${i.minStock} ${i.unit})`).join('\n');

  const prompt = `
    Analise esta lista de ingredientes com estoque baixo ou crítico de um restaurante:
    ${list}

    Sugira uma estratégia de compra rápida. Agrupe os itens por tipo de fornecedor provável (ex: Açougue, Hortifruti, Secos) e dê uma dica sobre sazonalidade ou negociação para um desses itens.
    Seja breve.
  `;

  try {
     const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao gerar insights de compras.";
  }
}
