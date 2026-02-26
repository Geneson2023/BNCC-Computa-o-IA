import { GoogleGenAI, Type } from "@google/genai";
import { bnccSkills } from "../data/bnccData";

// Prioritize user-selected API key (process.env.API_KEY) over environment key
const getAI = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || "";
  return new GoogleGenAI({ apiKey });
};

async function generateWithRetry(params: any, retries = 3, backoff = 2000) {
  const ai = getAI();
  for (let i = 0; i < retries; i++) {
    try {
      const response = await ai.models.generateContent(params);
      return response;
    } catch (error: any) {
      const errorMsg = error?.message?.toLowerCase() || "";
      const isQuotaError = errorMsg.includes("429") || 
                          errorMsg.includes("quota") ||
                          errorMsg.includes("rate limit");
      
      if (isQuotaError) {
        if (i < retries - 1) {
          console.warn(`Quota exceeded, retrying in ${backoff}ms... (Attempt ${i + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, backoff));
          backoff *= 2;
          continue;
        } else {
          throw new Error("Limite de cota excedido. Para uso ilimitado, configure sua própria chave API nas configurações.");
        }
      }
      throw error;
    }
  }
}

export async function generatePhaseZero(habilidadeCodigo: string) {
  const skill = bnccSkills.find(s => s.codigo === habilidadeCodigo);
  const year = skill?.ano || "Ano não especificado";
  const eixo = skill?.eixo || "Eixo não especificado";
  const descricao = skill?.descricao || "";

  const prompt = `Você é um especialista em Computação na Educação Básica, seguindo rigorosamente o "Complemento à BNCC de Computação".
  Gere a FASE 0 (Fundamentação Teórica) para a habilidade: ${habilidadeCodigo} - ${descricao}, voltada para o ${year}.
  
  EIXO BNCC: ${eixo}

  CONTEXTO OBRIGATÓRIO:
  A Computação na BNCC é estruturada em três eixos:
  1. Pensamento Computacional (processos de resolução de problemas).
  2. Mundo Digital (artefatos, hardware, software e redes).
  3. Cultura Digital (impactos, ética e cidadania).
  
  IMPORTANTE: Este planejamento faz parte de uma SEQUÊNCIA PROGRESSIVA ANUAL. Use uma linguagem e profundidade pedagógica APROPRIADA para o ${year}, garantindo que os conceitos construam uma base sólida para as habilidades subsequentes do mesmo ano.
  
  ESTRUTURA OBRIGATÓRIA DA FASE 0:
  ### Fundamentação Teórica
  * Contexto histórico e relação com a BNCC
  * Fundamentos da computação específicos desta habilidade
  * Aplicações reais e exemplos práticos
  * Relação com cultura digital e sociedade
  * Conexão com o pensamento computacional (algoritmos, decomposição, padrões, abstração)
  
  ### Subsídio ao Professor
  * Fundamentação técnica para o docente
  * Impactos sociais, éticos e legais (Marco Civil, LGPD se aplicável)
  * Estratégias de mediação e metodologias ativas
  * Dificuldades comuns dos alunos e como superá-las
  
  REGRAS:
  - Mínimo de 40 linhas de conteúdo denso e profissional.
  - Use Markdown.
  - Linguagem acadêmica para o professor, mas com exemplos adequados ao nível dos alunos (${year}).`;

  const response = await generateWithRetry({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response?.text || "";
}

export async function generateLessonPlan(habilidadeCodigo: string, planoNumero: number, contextoAnterior?: string) {
  const skill = bnccSkills.find(s => s.codigo === habilidadeCodigo);
  const year = skill?.ano || "Ano não especificado";
  const eixo = skill?.eixo || "Eixo não especificado";
  const descricao = skill?.descricao || "";

  const titulos = [
    "Plano 01 – Introdução",
    "Plano 02 – Desenvolvimento",
    "Plano 03 – Aplicação",
    "Plano 04 – Análise",
    "Plano 05 – Produção Final"
  ];

  const prompt = `Você é um especialista em BNCC de Computação.
  Gere o ${titulos[planoNumero - 1]} para a habilidade: ${habilidadeCodigo} - ${descricao}, voltada para o ${year}.
  EIXO BNCC: ${eixo}
  
  Baseie-se no documento oficial "Complemento à BNCC de Computação".
  ${contextoAnterior ? `Considere o que foi planejado anteriormente nesta sequência: ${contextoAnterior.substring(0, 1000)}` : ""}

  IMPORTANTE: Este é o plano ${planoNumero} de uma sequência de 5 planos progressivos. A linguagem das atividades e a complexidade dos conceitos devem ser RIGOROSAMENTE APROPRIADAS para o ${year}, seguindo uma lógica de complexidade crescente.
  
  ESTRUTURA OBRIGATÓRIA DO PLANO:
  ## Identificação
  * Código da habilidade: ${habilidadeCodigo}
  * Eixo: ${eixo}
  * Ano escolar: ${year}
  * Tempo estimado

  ## Objetivos de aprendizagem

  ## Fundamentação teórica (mínimo 4 parágrafos)

  ## Metodologia (Metodologias Ativas, Computação Desplugada ou Plugada)

  ## Recursos

  ## Cronograma minuto a minuto (tabela Markdown)
  | Tempo | Ação do Professor | Ação do Aluno | Estratégia |

  ## Avaliação
  * Critérios
  * Indicadores
  * Rubrica (quando necessário)

  REGRAS:
  - Use Markdown.
  - Foco total na BNCC de Computação.
  - Visual profissional e pedagógico.`;

  const response = await generateWithRetry({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response?.text || "";
}

export async function generateAdditionalResource(habilidadeCodigo: string, resourceType: string, currentPlans: string) {
  const skill = bnccSkills.find(s => s.codigo === habilidadeCodigo);
  const descricao = skill?.descricao || "";
  
  const prompt = `Com base na habilidade ${habilidadeCodigo} - ${descricao} e nos planos gerados: ${currentPlans.substring(0, 2000)}, 
  gere o seguinte recurso adicional: ${resourceType}.
  
  Mantenha o padrão profissional e institucional.`;

  const response = await generateWithRetry({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response?.text || "";
}
