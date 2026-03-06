import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bnccSkills, BNCCSkill } from '../data/bnccData';
import { 
  Plus, 
  Search, 
  Clock, 
  FileText, 
  ChevronRight, 
  LogOut, 
  BookOpen,
  Settings,
  User,
  LayoutDashboard,
  GraduationCap,
  Filter,
  Check,
  Trash2,
  CheckSquare,
  CheckCircle2,
  Square,
  Sparkles,
  ArrowRight,
  BookOpenCheck,
  History,
  Info,
  Download,
  Menu,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlanSummary {
  id: number;
  habilidade_codigo: string;
  ano_escolar: string;
  eixo: string;
  plano_atual: number;
  concluido: boolean;
}

export default function Dashboard() {
  const { token, user, logout } = useAuth();
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Filter States
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedAxis, setSelectedAxis] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<BNCCSkill | null>(null);
  const [selectedPlanIds, setSelectedPlanIds] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const years = Array.from(new Set(bnccSkills.map(s => s.ano)));
  const axes = Array.from(new Set(bnccSkills.map(s => s.eixo)));

  const existingPlansForSkill = selectedSkill 
    ? plans.filter(p => p.habilidade_codigo === selectedSkill.codigo)
    : [];

  const filteredSkills = bnccSkills.filter(s => {
    const yearMatch = !selectedYear || s.ano === selectedYear;
    const axisMatch = !selectedAxis || s.eixo === selectedAxis;
    return yearMatch && axisMatch;
  });

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPlans(data);
    } catch (err) {
      console.error('Erro ao buscar planos');
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleStartNew = async () => {
    if (!selectedSkill) return;
    setLoading(true);

    try {
      const response = await fetch('/api/plans/start', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          habilidade_codigo: selectedSkill.codigo,
          ano_escolar: selectedSkill.ano,
          eixo: selectedSkill.eixo
        })
      });
      const data = await response.json();
      navigate(`/plan/${data.id}`);
    } catch (err) {
      console.error('Erro ao iniciar plano');
    } finally {
      setLoading(false);
    }
  };

  // Group plans by year
  const groupedPlans = plans.reduce((acc, plan) => {
    const year = plan.ano_escolar || 'Outros';
    if (!acc[year]) acc[year] = [];
    acc[year].push(plan);
    return acc;
  }, {} as Record<string, any[]>);

  // Sort years (1º Ano, 2º Ano...)
  const sortedYears = Object.keys(groupedPlans).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 999;
    const numB = parseInt(b.replace(/\D/g, '')) || 999;
    return numA - numB;
  });

  // Sort plans within each year by skill code
  sortedYears.forEach(year => {
    groupedPlans[year].sort((a, b) => a.habilidade_codigo.localeCompare(b.habilidade_codigo));
  });

  const handleDeletePlans = async (all: boolean = false) => {
    if (!all && selectedPlanIds.length === 0) return;
    
    const confirmMsg = all 
      ? "Tem certeza que deseja excluir TODOS os seus planejamentos?" 
      : `Tem certeza que deseja excluir os ${selectedPlanIds.length} planejamentos selecionados?`;
      
    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await fetch('/api/plans/delete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          ids: all ? [] : selectedPlanIds,
          all: all
        })
      });

      if (response.ok) {
        await fetchPlans();
        setSelectedPlanIds([]);
        setIsSelectionMode(false);
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao excluir planos');
      }
    } catch (err) {
      console.error('Erro ao excluir planos', err);
      alert('Erro de conexão ao excluir planos');
    }
  };

  const handleDeleteSingle = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este planejamento?")) return;

    try {
      const response = await fetch('/api/plans/delete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          ids: [id],
          all: false
        })
      });

      if (response.ok) {
        await fetchPlans();
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao excluir plano');
      }
    } catch (err) {
      console.error('Erro ao excluir plano', err);
      alert('Erro de conexão ao excluir plano');
    }
  };

  const togglePlanSelection = (id: number) => {
    setSelectedPlanIds(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200"
            >
              <GraduationCap size={20} />
            </motion.div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-zinc-900 tracking-tight leading-none">
                Teacher Digital IA
              </h1>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">BNCC Computação</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowPaymentModal(true)}
              className="hidden sm:flex items-center gap-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl text-sm font-black transition-all active:scale-95 border border-indigo-100 shadow-sm"
            >
              <Sparkles size={18} />
              Assinatura Pro
            </button>
            <div className="h-6 w-px bg-zinc-200 mx-1 hidden sm:block"></div>
            {user?.perfil === 'Gestor' && (
              <Link 
                to="/settings" 
                className="p-2.5 rounded-xl text-zinc-500 hover:bg-zinc-100 transition-all active:scale-95"
                title="Configurações"
              >
                <Settings size={22} />
              </Link>
            )}
            <div className="h-6 w-px bg-zinc-200 mx-1"></div>
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-zinc-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Welcome Section */}
        <motion.section 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-3xl p-6 sm:p-10 border border-zinc-200 shadow-xl shadow-zinc-200/50 relative overflow-hidden"
        >
          <div className="relative z-10">
            <motion.h2 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-4xl font-black text-zinc-900 mb-3 tracking-tight"
            >
              Olá, {user?.nome.split(' ')[0]}!
            </motion.h2>
            <p className="text-zinc-500 max-w-2xl mb-8 text-base sm:text-lg leading-relaxed">
              Pronto para transformar a educação? Crie planejamentos de aula <span className="text-indigo-600 font-bold">inteligentes</span> alinhados à BNCC.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-2xl text-xs font-bold border border-indigo-100 shadow-sm">
                <BookOpenCheck size={16} />
                {plans.length} planejamentos salvos
              </div>
              <a 
                href="#novo-plano"
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-2xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 active:scale-95"
              >
                <Plus size={16} />
                Novo Plano
              </a>
            </div>
          </div>
          <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
            <Sparkles size={240} className="text-indigo-600" />
          </div>
        </motion.section>

        {/* New Plan Section */}
        <section id="novo-plano" className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                <Plus size={20} />
              </div>
              Novo Planejamento
            </h3>
            
            <div className="flex flex-wrap gap-2">
              <select 
                className="bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setSelectedSkill(null);
                }}
              >
                <option value="">Todos os Anos</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              <select 
                className="bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                value={selectedAxis}
                onChange={(e) => {
                  setSelectedAxis(e.target.value);
                  setSelectedSkill(null);
                }}
              >
                <option value="">Todos os Eixos</option>
                {axes.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-xl shadow-zinc-200/40">
              <div className="bg-zinc-50/50 px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Habilidades BNCC</span>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">{filteredSkills.length} disponíveis</span>
              </div>
              <div className="divide-y divide-zinc-100 max-h-[450px] overflow-y-auto custom-scrollbar">
                <AnimatePresence>
                  {filteredSkills.map((skill, idx) => (
                    <motion.button
                      key={skill.codigo}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                      onClick={() => setSelectedSkill(skill)}
                      className={`w-full text-left p-5 transition-all flex items-start gap-4 hover:bg-zinc-50 group ${
                        selectedSkill?.codigo === skill.codigo ? 'bg-indigo-50/50' : ''
                      }`}
                    >
                      <div className={`mt-1 w-6 h-6 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        selectedSkill?.codigo === skill.codigo 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                          : 'border-zinc-200 text-transparent group-hover:border-indigo-300'
                      }`}>
                        <Check size={14} strokeWidth={4} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-black text-indigo-600 font-mono tracking-tighter">{skill.codigo}</span>
                          <span className="text-[9px] font-black text-zinc-400 uppercase bg-zinc-100 px-2 py-0.5 rounded-lg border border-zinc-200/50">{skill.eixo}</span>
                        </div>
                        <p className="text-sm text-zinc-600 leading-relaxed font-medium">{skill.descricao}</p>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="lg:col-span-1">
              <motion.div 
                layout
                className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-xl shadow-zinc-200/40 sticky top-24"
              >
                <h4 className="text-sm font-black text-zinc-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
                  <Info size={18} className="text-indigo-600" />
                  Seleção
                </h4>
                
                {selectedSkill ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Habilidade Selecionada</p>
                      <p className="text-sm font-bold text-zinc-800 leading-relaxed">{selectedSkill.codigo}: {selectedSkill.descricao}</p>
                    </div>
                    
                    {existingPlansForSkill.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Planos Existentes ({existingPlansForSkill.length})</p>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                          {existingPlansForSkill.map(p => (
                            <button
                              key={p.id}
                              onClick={() => navigate(`/plan/${p.id}`)}
                              className="w-full text-left p-3 rounded-xl border border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50 transition-all group flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${p.concluido ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                <span className="text-xs font-bold text-zinc-700">Plano #{p.id}</span>
                              </div>
                              <ChevronRight size={14} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <button
                        onClick={handleStartNew}
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 active:scale-[0.98] disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            {existingPlansForSkill.length > 0 ? 'INICIAR NOVO PLANO' : 'INICIAR AGORA'}
                            <ArrowRight size={20} />
                          </>
                        )}
                      </button>
                      
                      {existingPlansForSkill.length > 0 && (
                        <p className="text-[10px] text-center font-bold text-zinc-400">
                          Ou selecione um plano acima para continuar.
                        </p>
                      )}
                    </div>

                    <ul className="space-y-3 pt-4 border-t border-zinc-100">
                      {[
                        'Análise pedagógica completa',
                        '5 planos de aula sequenciais',
                        'Recursos e avaliações personalizados'
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-xs font-bold text-zinc-500">
                          <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-zinc-50 text-zinc-200 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-100">
                      <Search size={28} />
                    </div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Selecione uma habilidade</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* History Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <History className="text-indigo-600" size={24} />
              Meus Planejamentos
            </h3>
            
            {plans.length > 0 && (
              <div className="flex items-center gap-2">
                {!isSelectionMode ? (
                  <button 
                    onClick={() => setIsSelectionMode(true)}
                    className="text-xs font-bold text-zinc-600 hover:bg-zinc-100 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <CheckSquare size={16} />
                    Gerenciar
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-zinc-200 shadow-sm">
                    <button 
                      onClick={() => {
                        if (selectedPlanIds.length === plans.length) {
                          setSelectedPlanIds([]);
                        } else {
                          setSelectedPlanIds(plans.map(p => p.id));
                        }
                      }}
                      className="text-[10px] font-bold text-zinc-500 hover:bg-zinc-50 px-2 py-1.5 rounded transition-colors"
                    >
                      {selectedPlanIds.length === plans.length ? 'Desmarcar' : 'Todos'}
                    </button>
                    <button 
                      onClick={() => {
                        setIsSelectionMode(false);
                        setSelectedPlanIds([]);
                      }}
                      className="text-[10px] font-bold text-zinc-400 hover:bg-zinc-50 px-2 py-1.5 rounded transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => handleDeletePlans(false)}
                      disabled={selectedPlanIds.length === 0}
                      className="text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1.5 rounded transition-colors disabled:opacity-50"
                    >
                      Excluir ({selectedPlanIds.length})
                    </button>
                  </div>
                )}
                <button 
                  onClick={() => handleDeletePlans(true)}
                  className="text-xs font-bold text-zinc-400 hover:text-red-500 px-3 py-2 rounded-lg transition-colors"
                >
                  Limpar Tudo
                </button>
              </div>
            )}
          </div>

          <div className="space-y-12">
            {plans.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-zinc-200 border-dashed">
                <div className="w-16 h-16 bg-zinc-50 text-zinc-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={32} />
                </div>
                <h4 className="text-lg font-bold text-zinc-400">Nenhum planejamento</h4>
                <p className="text-zinc-400 text-sm mt-1">Seus trabalhos aparecerão aqui.</p>
              </div>
            ) : (
              sortedYears.map((year) => (
                <div key={year} className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-4 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                        <span className="text-lg font-black">{year.match(/\d+/)?.[0] || '?' }</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-zinc-900 tracking-tight">{year}</h3>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Sequência Progressiva</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={async (e) => {
                          const btn = e.currentTarget;
                          const originalContent = btn.innerHTML;
                          try {
                            btn.disabled = true;
                            btn.innerHTML = '<div class="w-3 h-3 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div> AGUARDE...';
                            
                            const trimmedYear = year.trim();
                            const plansForThisYear = groupedPlans[year] || [];
                            console.log(`Requesting batch PDF for year: "${trimmedYear}" (${plansForThisYear.length} plans in frontend)`);
                            
                            const response = await fetch(`/api/plans/batch-pdf?year=${encodeURIComponent(trimmedYear)}`, {
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            
                            console.log(`Response status: ${response.status} ${response.statusText}`);
                            const headersObj: Record<string, string> = {};
                            response.headers.forEach((value, key) => { headersObj[key] = value; });
                            console.log('Response headers:', headersObj);
                            
                            if (response.ok) {
                              const contentType = response.headers.get('content-type');
                              if (!contentType || !contentType.includes('application/pdf')) {
                                console.warn('Unexpected content type for successful response:', contentType);
                                if (contentType?.includes('application/json')) {
                                  try {
                                    const errorData = await response.json();
                                    throw new Error(errorData.error || 'O servidor retornou um erro inesperado.');
                                  } catch (e: any) {
                                    if (e.message && e.message.includes('Unexpected end of JSON input')) {
                                      throw new Error('O servidor encerrou a conexão inesperadamente. O documento pode ser muito grande para ser gerado de uma só vez.');
                                    }
                                    throw e;
                                  }
                                }
                              }

                              let blob;
                              try {
                                // For large files, we might want to track progress or handle stream errors
                                blob = await response.blob();
                              } catch (blobErr: any) {
                                console.error('Failed to parse blob:', blobErr);
                                if (blobErr.message && (blobErr.message.includes('terminated') || blobErr.message.includes('aborted'))) {
                                  throw new Error('A conexão foi interrompida durante o download. O arquivo pode ser muito grande para sua conexão atual.');
                                }
                                throw new Error('Falha ao processar os dados do PDF recebidos do servidor.');
                              }
                              
                              console.log(`Downloaded blob size: ${blob.size} bytes, type: ${blob.type}`);
                              
                              if (blob.size === 0) {
                                console.error('Empty blob received from server');
                                throw new Error('O arquivo baixado está vazio. O servidor gerou um documento sem conteúdo.');
                              }

                              // Check for PDF signature if possible
                              const text = await blob.slice(0, 5).text();
                              if (text !== '%PDF-') {
                                console.error('Invalid PDF signature:', text);
                                // If it's not a PDF, it might be an error message in JSON
                                try {
                                  const errorText = await blob.text();
                                  const errorJson = JSON.parse(errorText);
                                  throw new Error(errorJson.error || 'O servidor não retornou um PDF válido.');
                                } catch (e) {
                                  throw new Error('O servidor retornou um arquivo corrompido ou inválido (não é um PDF).');
                                }
                              }

                              const pdfBlob = new Blob([blob], { type: 'application/pdf' });
                              const url = window.URL.createObjectURL(pdfBlob);
                              console.log(`Created blob URL: ${url}`);
                              
                              const a = document.createElement('a');
                              a.href = url;
                              
                              const safeYear = year.replace(/[^a-z0-9]/gi, '_');
                              a.download = `Curriculo_Anual_${safeYear}.pdf`;
                              
                              document.body.appendChild(a);
                              console.log(`Triggering download for: ${a.download}`);
                              a.click();
                              
                              // Small delay before cleanup
                              setTimeout(() => {
                                a.remove();
                                window.URL.revokeObjectURL(url);
                              }, 500);
                            } else {
                              let errorMessage = 'Erro ao gerar o currículo anual.';
                              try {
                                const contentType = response.headers.get('content-type');
                                if (contentType && contentType.includes('application/json')) {
                                  const errorData = await response.json();
                                  errorMessage = errorData.error || errorMessage;
                                } else {
                                  const textError = await response.text();
                                  if (textError && textError.length < 300) errorMessage = textError;
                                }
                              } catch (e: any) {
                                console.error('Error parsing error response:', e);
                                if (e.message && e.message.includes('Unexpected end of JSON input')) {
                                  errorMessage = 'O servidor retornou uma resposta vazia ou malformada (Timeout?).';
                                }
                              }
                              alert(errorMessage);
                            }
                          } catch (err) {
                            console.error('Batch download error:', err);
                            alert('Erro de conexão ao tentar baixar o currículo anual.');
                          } finally {
                            btn.disabled = false;
                            btn.innerHTML = originalContent;
                          }
                        }}
                        className="flex items-center gap-2 text-[10px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl border border-indigo-100 transition-all disabled:opacity-50 shadow-sm active:scale-95"
                      >
                        <Download size={14} />
                        BAIXAR ANO COMPLETO
                      </button>
                      <span className="text-[10px] font-black text-zinc-500 bg-zinc-100 px-3 py-2 rounded-xl border border-zinc-200">
                        {groupedPlans[year].length} {groupedPlans[year].length === 1 ? 'PLANO' : 'PLANOS'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {groupedPlans[year].map((plan, pIdx) => (
                      <motion.div 
                        key={plan.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: pIdx * 0.05 }}
                        className="relative group"
                      >
                        {isSelectionMode && (
                          <button 
                            onClick={() => togglePlanSelection(plan.id)}
                            className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white border border-zinc-200 shadow-lg transition-all active:scale-90"
                          >
                            {selectedPlanIds.includes(plan.id) ? (
                              <CheckSquare size={20} className="text-indigo-600" />
                            ) : (
                              <Square size={20} className="text-zinc-300" />
                            )}
                          </button>
                        )}
                        <div
                          onClick={() => {
                            if (isSelectionMode) {
                              togglePlanSelection(plan.id);
                            } else {
                              navigate(`/plan/${plan.id}`);
                            }
                          }}
                          className={`w-full bg-white p-8 rounded-[2rem] border transition-all text-left cursor-pointer relative overflow-hidden ${
                            selectedPlanIds.includes(plan.id) 
                              ? 'border-indigo-600 bg-indigo-50/20 ring-4 ring-indigo-500/10' 
                              : 'border-zinc-200 hover:border-indigo-400 hover:shadow-2xl hover:shadow-zinc-200 hover:-translate-y-1'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex flex-col gap-2">
                              <span className="text-xs font-black text-indigo-600 font-mono bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100 w-fit tracking-tighter">
                                {plan.habilidade_codigo}
                              </span>
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                {bnccSkills.find(s => s.codigo === plan.habilidade_codigo)?.eixo}
                              </span>
                            </div>
                            <div className="bg-zinc-50 px-2.5 py-1.5 rounded-lg border border-zinc-100">
                              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">
                                Etapa {plan.plano_atual}/5
                              </span>
                            </div>
                          </div>
                          
                          <h4 className="text-lg font-black text-zinc-900 mb-6 leading-tight">Planejamento Pedagógico</h4>
                          
                          <div className="space-y-3">
                            <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(plan.plano_atual / 5) * 100}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="bg-indigo-600 h-full shadow-[0_0_10px_rgba(79,70,229,0.4)]" 
                              ></motion.div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-black">
                              <span className="text-zinc-400 uppercase tracking-widest">Progresso do Currículo</span>
                              <span className="text-indigo-600">{Math.round((plan.plano_atual / 5) * 100)}%</span>
                            </div>
                          </div>

                          <div className="mt-8 pt-6 border-t border-zinc-50 flex items-center justify-between">
                            <div className="flex items-center text-indigo-600 text-xs font-black tracking-wide uppercase">
                              {isSelectionMode ? 'Selecionar' : 'Continuar'} 
                              <ArrowRight size={16} className="ml-2" />
                            </div>
                            <div className="flex items-center gap-1">
                              {!isSelectionMode && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const btn = e.currentTarget;
                                      const originalContent = btn.innerHTML;
                                      const handleDownloadWord = async () => {
                                        try {
                                          btn.disabled = true;
                                          btn.innerHTML = '<div class="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>';
                                          
                                          const response = await fetch(`/api/plans/${plan.id}/docx`, {
                                            headers: { 'Authorization': `Bearer ${token}` }
                                          });
                                          
                                          if (response.ok) {
                                            const blob = await response.blob();
                                            const url = window.URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            
                                            const safeAno = (plan.ano_escolar || 'Ano').replace(/[^a-z0-9]/gi, '_');
                                            const safeEixo = (plan.eixo || 'Eixo').replace(/[^a-z0-9]/gi, '_');
                                            a.download = `Planejamento_${safeAno}_${safeEixo}_${plan.habilidade_codigo}.docx`;
                                            
                                            document.body.appendChild(a);
                                            a.click();
                                            a.remove();
                                            window.URL.revokeObjectURL(url);
                                          } else {
                                            const errorData = await response.json();
                                            alert(errorData.error || 'Erro ao gerar Word.');
                                          }
                                        } catch (err) {
                                          console.error('Download error:', err);
                                          alert('Erro de conexão ao tentar baixar o Word.');
                                        } finally {
                                          btn.disabled = false;
                                          btn.innerHTML = originalContent;
                                        }
                                      };
                                      handleDownloadWord();
                                    }}
                                    className="p-2.5 rounded-xl text-zinc-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-90 disabled:opacity-50"
                                    title="Baixar Word"
                                  >
                                    <FileText size={20} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteSingle(plan.id);
                                    }}
                                    className="p-2.5 rounded-xl text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-all active:scale-90"
                                    title="Excluir Planejamento"
                                  >
                                    <Trash2 size={20} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const btn = e.currentTarget;
                                      const originalContent = btn.innerHTML;
                                      const handleDownload = async () => {
                                        try {
                                          btn.disabled = true;
                                          btn.innerHTML = '<div class="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>';
                                          
                                          const response = await fetch(`/api/plans/${plan.id}/pdf`, {
                                            headers: { 'Authorization': `Bearer ${token}` }
                                          });
                                          
                                          if (response.ok) {
                                            const blob = await response.blob();
                                            const url = window.URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            
                                            const safeAno = (plan.ano_escolar || 'Ano').replace(/[^a-z0-9]/gi, '_');
                                            const safeEixo = (plan.eixo || 'Eixo').replace(/[^a-z0-9]/gi, '_');
                                            a.download = `Planejamento_${safeAno}_${safeEixo}_${plan.habilidade_codigo}.pdf`;
                                            
                                            document.body.appendChild(a);
                                            a.click();
                                            a.remove();
                                            window.URL.revokeObjectURL(url);
                                          } else {
                                            const errorData = await response.json();
                                            alert(errorData.error || 'Erro ao gerar PDF.');
                                          }
                                        } catch (err) {
                                          console.error('Download error:', err);
                                          alert('Erro de conexão ao tentar baixar o PDF.');
                                        } finally {
                                          btn.disabled = false;
                                          btn.innerHTML = originalContent;
                                        }
                                      };
                                      handleDownload();
                                    }}
                                    className="p-2.5 rounded-xl text-zinc-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-90 disabled:opacity-50"
                                    title="Baixar PDF"
                                  >
                                    <Download size={20} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl font-black mb-2">Liberação de Cadastro</h3>
                  <p className="text-indigo-100 font-medium">Ative sua conta Pro e tenha acesso ilimitado.</p>
                </div>
                <Sparkles size={160} className="absolute -top-10 -right-10 text-white/10" />
              </div>
              
              <div className="p-8 space-y-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100 w-full">
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">Pagamento via PIX</p>
                    <div className="bg-white p-4 rounded-2xl border border-zinc-200 inline-block mb-4 shadow-inner">
                      <div className="w-48 h-48 bg-zinc-100 rounded-xl flex items-center justify-center border-2 border-dashed border-zinc-200">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020126360014br.gov.bcb.pix0114829823024475204000053039865802BR5910BNCC_IA_APP6009Maceio62070503***6304`} 
                          alt="QR Code PIX" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-zinc-700">Chave PIX (Celular):</p>
                      <div className="bg-white px-4 py-3 rounded-xl border border-zinc-200 font-mono font-black text-indigo-600 text-lg flex items-center justify-center gap-2">
                        82982302447
                      </div>
                    </div>
                  </div>

                  <div className="text-left w-full space-y-3">
                    <p className="text-xs font-bold text-zinc-500 flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      Liberação imediata após envio do comprovante
                    </p>
                    <p className="text-xs font-bold text-zinc-500 flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      Acesso ilimitado a todas as habilidades BNCC
                    </p>
                    <p className="text-xs font-bold text-zinc-500 flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      Exportação ilimitada em Word e PDF
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <a 
                    href="https://wa.me/5582982302447?text=Olá! Acabei de realizar o pagamento do plano Pro. Segue o comprovante." 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-100"
                  >
                    ENVIAR COMPROVANTE WHATSAPP
                  </a>
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    className="w-full py-4 rounded-2xl font-black text-sm text-zinc-400 hover:bg-zinc-50 transition-all"
                  >
                    FECHAR
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="bg-white border-t border-zinc-200 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-zinc-400">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <GraduationCap size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter leading-none text-zinc-900">Teacher Digital IA</span>
              <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">BNCC Computação</span>
            </div>
          </div>
          <p className="text-zinc-400 text-xs font-medium">© {new Date().getFullYear()} – Teacher Digital IA. Alinhado à BNCC Computação.</p>
          <div className="flex gap-4">
            <a href="https://wa.me/5582982302447" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-indigo-600 transition-colors text-xs font-bold">Suporte</a>
            <Link to="/privacidade" className="text-zinc-400 hover:text-indigo-600 transition-colors text-xs font-bold">Privacidade</Link>
            <Link to="/documentacao" className="text-zinc-400 hover:text-indigo-600 transition-colors text-xs font-bold">Documentação</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
