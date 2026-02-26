import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { generatePhaseZero, generateLessonPlan, generateAdditionalResource } from '../services/geminiService';
import { bnccSkills } from '../data/bnccData';
import Markdown from 'react-markdown';
import { 
  ChevronRight, 
  Loader2, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  PlusCircle,
  BookOpen,
  FileText,
  Settings,
  LogOut,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { marked } from 'marked';

interface PlanData {
  id: number;
  habilidade_codigo: string;
  fase_zero: string | null;
  plano_01: string | null;
  plano_02: string | null;
  plano_03: string | null;
  plano_04: string | null;
  plano_05: string | null;
  plano_atual: number;
  concluido: boolean;
}

export default function PlanGenerator() {
  const { id } = useParams();
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0: Fase 0, 1-5: Planos
  const [showSidebar, setShowSidebar] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchPlan = async () => {
    try {
      const response = await fetch(`/api/plans/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPlan(data);
      return data;
    } catch (err) {
      setError('Erro ao carregar planejamento');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const data = await fetchPlan();
      if (data) setActiveTab(data.plano_atual);
      setLoading(false);
    };
    if (id) init();
  }, [id]);

  const updatePlan = async (field: string, content: string, nextPlano: number) => {
    try {
      await fetch('/api/plans/update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, field, content, next_plano: nextPlano })
      });
      return await fetchPlan();
    } catch (err) {
      setError('Erro ao salvar progresso');
    }
  };

  const generateAll = async () => {
    if (!plan) return;

    setGenerating(true);
    setGenerationStatus('Iniciando geração completa...');
    setError('');

    try {
      let currentPlan = plan;

      // 1. Generate Fase 0 if missing
      if (!currentPlan.fase_zero) {
        setGenerationStatus('Fundamentando habilidade (Fase 0)...');
        const faseZero = await generatePhaseZero(currentPlan.habilidade_codigo);
        currentPlan = await updatePlan('fase_zero', faseZero, 0) || currentPlan;
      }

      // 2. Generate all 5 plans in sequence
      for (let i = 1; i <= 5; i++) {
        const key = `plano_0${i}` as keyof PlanData;
        if (!currentPlan[key]) {
          setGenerationStatus(`Gerando Plano de Aula ${i} de 5...`);
          const prevContent = i === 1 ? currentPlan.fase_zero : currentPlan[`plano_0${i-1}` as keyof PlanData] as string;
          const content = await generateLessonPlan(currentPlan.habilidade_codigo, i, prevContent);
          currentPlan = await updatePlan(`plano_0${i}`, content, i) || currentPlan;
          setActiveTab(i);
        }
      }
      setGenerationStatus('Finalizando...');
    } catch (err: any) {
      if (err.message.includes("chave API")) {
        setError(err.message);
      } else {
        setError('Erro na geração completa. Tente novamente.');
      }
    } finally {
      setGenerating(false);
      setGenerationStatus('');
    }
  };

  const generateNext = async () => {
    if (!plan) return;
    setGenerating(true);
    setGenerationStatus('Preparando geração...');
    setError('');

    try {
      if (plan.plano_atual === 0 && !plan.fase_zero) {
        // Generate Fase 0 and Plano 01
        setGenerationStatus('Gerando Fundamentação (Fase 0)...');
        const faseZero = await generatePhaseZero(plan.habilidade_codigo);
        
        setGenerationStatus('Gerando Primeiro Plano de Aula...');
        const plano01 = await generateLessonPlan(plan.habilidade_codigo, 1, faseZero);
        
        // Update both in DB
        await updatePlan('fase_zero', faseZero, 0); // Keep at 0 to show Fase 0 first
        await updatePlan('plano_01', plano01, 1);
        setActiveTab(1);
      } else {
        // Generate next plan
        const nextNum = plan.plano_atual + 1;
        if (nextNum > 5) return;

        setGenerationStatus(`Gerando Plano de Aula ${nextNum}...`);
        const prevContent = plan[`plano_0${plan.plano_atual}` as keyof PlanData] as string;
        const nextContent = await generateLessonPlan(plan.habilidade_codigo, nextNum, prevContent);
        
        await updatePlan(`plano_0${nextNum}`, nextContent, nextNum);
        setActiveTab(nextNum);
      }
    } catch (err: any) {
      if (err.message.includes("chave API")) {
        setError(err.message);
      } else {
        setError('Erro na geração da IA. Tente novamente.');
      }
    } finally {
      setGenerating(false);
      setGenerationStatus('');
    }
  };

  const handlePrint = async () => {
    try {
      const response = await fetch(`/api/plans/${id}/html`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Erro ao buscar HTML');
      }
      const html = await response.text();
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        
        // Wait for images and fonts to load
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
        
        // Fallback if onload doesn't fire
        setTimeout(() => {
          try {
            if (printWindow && printWindow.document.readyState === 'complete') {
              printWindow.print();
            }
          } catch (e) {
            // Window might be closed
          }
        }, 3000);
      }
    } catch (err) {
      setError('Erro ao preparar impressão profissional');
    }
  };

  const [isExporting, setIsExporting] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [resourceLoading, setResourceLoading] = useState<string | null>(null);

  const handleGenerateResource = async (resourceType: string) => {
    if (!plan) return;

    setResourceLoading(resourceType);
    try {
      const currentPlans = [plan.plano_01, plan.plano_02, plan.plano_03, plan.plano_04, plan.plano_05]
        .filter(Boolean)
        .join('\n\n');
      const content = await generateAdditionalResource(plan.habilidade_codigo, resourceType, currentPlans);
      
      const newContent = `${currentContent}\n\n---\n\n### Recurso Adicional: ${resourceType}\n\n${content}`;
      
      if (activeTab === 0) {
        await updatePlan('fase_zero', newContent, plan.plano_atual);
      } else {
        await updatePlan(`plano_0${activeTab}`, newContent, plan.plano_atual);
      }
    } catch (err) {
      setError('Erro ao gerar recurso adicional');
    } finally {
      setResourceLoading(null);
    }
  };

  const handleDownloadWord = async () => {
    if (!plan) return;
    setIsExportingWord(true);
    
    try {
      const response = await fetch(`/api/plans/${id}/docx`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Relatorio_Avanca_Pariconha_Escola_2025.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        setError('Erro ao gerar Word no servidor');
      }
    } catch (err) {
      console.error('Erro ao gerar Word:', err);
      setError('Erro ao gerar Word.');
    } finally {
      setIsExportingWord(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!plan) return;
    setIsExporting(true);
    
    try {
      const response = await fetch(`/api/plans/${id}/pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Planejamento_Profissional_${plan.habilidade_codigo}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        setError('Erro ao gerar PDF profissional no servidor');
      }
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      setError('Erro ao gerar PDF completo.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
    </div>
  );

  if (!plan) return null;

  const currentContent = activeTab === 0 
    ? plan.fase_zero 
    : activeTab === 6
      ? [plan.fase_zero, plan.plano_01, plan.plano_02, plan.plano_03, plan.plano_04, plan.plano_05]
          .filter(Boolean)
          .join('\n\n---\n\n')
      : plan[`plano_0${activeTab}` as keyof PlanData];
  const progressPercent = (plan.plano_atual / 5) * 100;

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500"
            >
              {showSidebar ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 tracking-tight">BNCC IA</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200">
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md" title="Imprimir">
                <Printer size={16} />
                <span>Imprimir</span>
              </button>
              
              <button 
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className={`flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50 ${isExporting ? 'animate-pulse' : ''}`} title="Baixar PDF">
                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                <span>PDF</span>
              </button>

              <button 
                onClick={handleDownloadWord}
                disabled={isExportingWord}
                className={`flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50 ${isExportingWord ? 'animate-pulse' : ''}`} title="Baixar Word">
                {isExportingWord ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                <span>Word</span>
              </button>
            </div>

            <div className="h-6 w-px bg-zinc-200 mx-1"></div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => navigate('/')}
                className="p-2 text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100 rounded-lg transition-colors" title="Dashboard">
                <LayoutDashboard size={20} />
              </button>
              <button 
                onClick={logout}
                className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Sair">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
        {/* Sidebar - Progress & Navigation */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-zinc-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:border-none lg:bg-transparent lg:w-auto lg:z-auto
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
          lg:col-span-1 space-y-6 overflow-y-auto p-6 lg:p-0
        `}>
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Progresso</h3>
              <button onClick={() => setShowSidebar(false)} className="lg:hidden p-1 text-zinc-400 hover:text-zinc-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-600 font-mono">{plan.habilidade_codigo}</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">
                  {bnccSkills.find(s => s.codigo === plan.habilidade_codigo)?.eixo}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-zinc-500">Concluído</span>
                <span className="text-indigo-600">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${progressPercent}%` }} className="h-full bg-indigo-600 transition-all duration-500"></div>
              </div>
            </div>

            <nav className="mt-8 space-y-1">
              <button
                onClick={() => { setActiveTab(0); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all ${activeTab === 0 ? 'bg-indigo-50 text-indigo-700' : 'text-zinc-600 hover:bg-zinc-50'}`}
              >
                <FileText size={18} />
                Fundamentação Teórica
                {plan.fase_zero && <CheckCircle2 size={16} className="ml-auto text-emerald-500" />}
              </button>
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  disabled={plan.plano_atual < num && !plan[`plano_0${num}` as keyof PlanData]}
                  onClick={() => { setActiveTab(num); setShowSidebar(false); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all ${activeTab === num ? 'bg-indigo-50 text-indigo-700' : 'text-zinc-600 hover:bg-zinc-50'} disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  <BookOpen size={18} />
                  Plano 0{num}
                  {plan[`plano_0${num}` as keyof PlanData] && <CheckCircle2 size={16} className="ml-auto text-emerald-500" />}
                </button>
              ))}
              <div className="pt-4 mt-4 border-t border-zinc-100">
                <button
                  disabled={!plan.fase_zero}
                  onClick={() => { setActiveTab(6); setShowSidebar(false); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all ${activeTab === 6 ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-600 hover:bg-indigo-50'} disabled:opacity-30`}
                >
                  <LayoutDashboard size={18} />
                  Visualização Completa
                </button>
              </div>
            </nav>
          </div>

          {/* Additional Resources */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Recursos Extras</h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                "Explicação ampliada", "Questões diagnósticas", "Avaliação formal", 
                "Adaptação (PEI)", "Projeto interdisciplinar", "Atividade prática",
                "Scratch / Robótica", "Relatório pedagógico", "Livro didático", "Micro-habilidades"
              ].map((res) => (
                <button 
                  key={res}
                  disabled={!!resourceLoading || !currentContent}
                  onClick={() => { handleGenerateResource(res); setShowSidebar(false); }}
                  className="text-left text-xs p-2 rounded hover:bg-blue-50 text-gray-600 hover:text-blue-700 transition-colors border border-transparent hover:border-blue-100 disabled:opacity-50 flex items-center justify-between"
                >
                  <span>+ {res}</span>
                  {resourceLoading === res && <Loader2 size={12} className="animate-spin" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Content Area */}
        <section className="lg:col-span-3 space-y-6">
          {generating && (
            <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 animate-pulse flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Loader2 className="animate-spin" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Gerando Planejamento Inteligente</h4>
                  <p className="text-indigo-100 text-sm">{generationStatus}</p>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-60">Status</span>
                  <p className="font-mono text-sm">Processando via Gemini AI</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden min-h-[600px] flex flex-col">
            <div className="border-b border-zinc-100 p-6 bg-zinc-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">
                  {activeTab === 0 ? 'Fundamentação Teórica' : activeTab === 6 ? 'Visualização Completa do Planejamento' : `Plano 0${activeTab}`}
                </h2>
                <p className="text-xs text-zinc-500 font-mono mt-1">Habilidade: {plan.habilidade_codigo}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {plan.plano_atual === 0 && !plan.fase_zero && (
                  <button
                    onClick={generateAll}
                    disabled={generating}
                    className="flex-1 sm:flex-none bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
                  >
                    {generating ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <PlusCircle size={16} />
                    )}
                    {generating ? 'Gerando...' : 'Completo'}
                  </button>
                )}

                {plan.plano_atual < 5 && (
                  <button
                    onClick={generateNext}
                    disabled={generating}
                    className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm shadow-indigo-100 disabled:opacity-50"
                  >
                    {generating ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <PlusCircle size={16} />
                    )}
                    {generating ? 'Gerando...' : (plan.plano_atual === 0 && !plan.fase_zero ? 'Iniciar' : 'Próximo')}
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 md:p-8 flex-1 overflow-auto prose prose-blue max-w-none prose-sm md:prose-base" ref={printRef}>
              {/* Print Header */}
              <div className="hidden print:block mb-8 border-b-2 border-[#112240] pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-xl font-bold text-[#112240] m-0">BNCC IA – Planejamento Inteligente</h1>
                    <p className="text-xs text-gray-500 m-0">Sistema de Inteligência Artificial Educacional</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="m-0"><strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
                    <p className="m-0"><strong>Habilidade:</strong> {plan.habilidade_codigo}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <p className="m-0"><strong>Professor:</strong> {user?.nome}</p>
                  <p className="m-0"><strong>Escola:</strong> ________________________________________________</p>
                </div>
              </div>

              {currentContent ? (
                <div className="markdown-body">
                  <Markdown>{String(currentContent)}</Markdown>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
                  <div className="bg-indigo-50 p-6 rounded-2xl">
                    <BookOpen size={48} className="text-indigo-200" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-400">Aguardando Geração</h3>
                  <p className="text-zinc-400 max-w-xs text-sm">
                    Clique no botão acima para iniciar a fundamentação teórica e o primeiro plano de aula.
                  </p>
                </div>
              )}

              {/* Print Footer */}
              <div className="hidden print:block mt-12 pt-4 border-t border-zinc-200 text-center text-[10px] text-zinc-400 italic">
                Documento gerado automaticamente pela plataforma BNCC IA – Planejamento Inteligente.
                <div className="mt-1">Página 1 de 1</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 25mm 20mm 25mm 20mm;
          }

          body, html {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          body > * {
            display: none !important;
          }
          
          #root, #root > div, main, section, .bg-white, .flex-1 {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: none !important;
            position: static !important;
          }

          header, aside, button, .no-print, nav, .border-b {
            display: none !important;
          }

          .markdown-body {
            color: #000 !important;
            background: transparent !important;
            padding: 0 !important;
          }

          .markdown-body * {
            color: #000 !important;
            border-color: #000 !important;
          }

          h2 {
            page-break-before: always;
            margin-top: 2em !important;
          }
          h2:first-child {
            page-break-before: avoid;
          }
        }
      `}</style>
    </div>
  );
}
