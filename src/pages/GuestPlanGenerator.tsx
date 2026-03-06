import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen,
  GraduationCap,
  Lock,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function GuestPlanGenerator() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const guestId = searchParams.get('guest_id');
  const navigate = useNavigate();
  
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchPlan = async () => {
    try {
      const response = await fetch(`/api/guest/plans/${id}?guest_id=${guestId}`);
      if (!response.ok) throw new Error('Plano não encontrado');
      const data = await response.json();
      setPlan(data);
    } catch (err) {
      setError('Erro ao carregar o plano de teste.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && guestId) fetchPlan();
  }, [id, guestId]);

  const generateStep = async () => {
    if (!plan || generating) return;
    setGenerating(true);
    
    const nextStep = plan.plano_atual + 1;
    let prompt = "";
    let field = "";

    if (nextStep === 1) {
      field = "fase_zero";
      prompt = `Como um especialista em educação e BNCC, elabore a FUNDAMENTAÇÃO TEÓRICA para a habilidade ${plan.habilidade_codigo} (${plan.ano_escolar}). 
      Foque em: Objetivos de Aprendizagem, Competências Gerais da BNCC envolvidas, e a importância pedagógica desta habilidade no contexto do ${plan.eixo}. 
      Use Markdown. Seja profundo e acadêmico.`;
    } else if (nextStep === 2) {
      field = "plano_01";
      prompt = `Com base na fundamentação anterior: ${plan.fase_zero}, elabore o PLANO DE AULA 01 para a habilidade ${plan.habilidade_codigo}. 
      O plano deve conter: Tema, Duração, Objetivos Específicos, Recursos, Metodologia (Passo a passo detalhado) e Avaliação. 
      Use Markdown.`;
    }

    try {
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "Você é um consultor pedagógico sênior especialista em BNCC e Computação na Educação Básica."
        }
      });

      const content = result.text;
      
      const response = await fetch('/api/guest/plans/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: plan.id,
          guest_id: guestId,
          field,
          content,
          next_plano: nextStep
        })
      });

      if (response.ok) {
        await fetchPlan();
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar conteúdo com IA.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-black text-zinc-900 mb-4">{error}</h2>
      <Link to="/test-drive" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold">Voltar</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/test-drive')} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-400">
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl text-white">
                <GraduationCap size={20} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-zinc-900 tracking-tight leading-none">Teacher Digital IA</h1>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">BNCC Computação</span>
              </div>
            </div>
          </div>
          <Link to="/register" className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            Criar Conta Completa
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl overflow-hidden">
          <div className="bg-zinc-900 p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Habilidade {plan.habilidade_codigo}</span>
                <span className="bg-white/10 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{plan.ano_escolar}</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight leading-tight">
                Sequência Didática de Teste
              </h2>
            </div>
            <Sparkles size={200} className="absolute -top-20 -right-20 text-white/5" />
          </div>

          <div className="p-8 sm:p-12 space-y-12">
            {/* Fundamentação */}
            {plan.fase_zero && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-center gap-4 border-b border-zinc-100 pb-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">01</div>
                  <h3 className="text-xl font-black text-zinc-900">Fundamentação Teórica</h3>
                </div>
                <div className="prose prose-zinc max-w-none text-zinc-600 font-medium leading-relaxed markdown-body">
                  <Markdown>{plan.fase_zero}</Markdown>
                </div>
              </motion.section>
            )}

            {/* Plano 01 */}
            {plan.plano_01 && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-center gap-4 border-b border-zinc-100 pb-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">02</div>
                  <h3 className="text-xl font-black text-zinc-900">Plano de Aula 01</h3>
                </div>
                <div className="prose prose-zinc max-w-none text-zinc-600 font-medium leading-relaxed markdown-body">
                  <Markdown>{plan.plano_01}</Markdown>
                </div>
              </motion.section>
            )}

            {/* Next Step / CTA */}
            <div className="pt-12 border-t border-zinc-100 flex flex-col items-center text-center space-y-8">
              {plan.plano_atual < 2 ? (
                <>
                  <div className="max-w-md">
                    <h4 className="text-xl font-black text-zinc-900 mb-2">Próxima Etapa</h4>
                    <p className="text-zinc-500 font-medium">
                      {plan.plano_atual === 0 
                        ? "Vamos gerar a fundamentação teórica completa para esta habilidade." 
                        : "Agora vamos detalhar o primeiro plano de aula prático."}
                    </p>
                  </div>
                  <button
                    onClick={generateStep}
                    disabled={generating}
                    className="bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-3 disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="animate-spin" />
                        GERANDO COM IA...
                      </>
                    ) : (
                      <>
                        GERAR PRÓXIMA ETAPA
                        <ArrowRight />
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="bg-indigo-50 p-10 rounded-[2.5rem] border border-indigo-100 w-full">
                  <Sparkles className="text-indigo-600 mx-auto mb-6" size={48} />
                  <h4 className="text-2xl font-black text-zinc-900 mb-4">Teste Concluído!</h4>
                  <p className="text-zinc-600 font-medium mb-8 max-w-lg mx-auto">
                    Você viu como a BNCC IA pode acelerar seu trabalho. 
                    Crie uma conta para gerar sequências de 5 planos, exportar em Word/PDF e salvar todos os seus planejamentos.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/register" className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                      Criar Conta Grátis
                    </Link>
                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                      <Lock size={14} />
                      Exportação Bloqueada no Teste
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
