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
  Square,
  Sparkles,
  ArrowRight,
  BookOpenCheck,
  History,
  Info,
  Download
} from 'lucide-react';

interface PlanSummary {
  id: number;
  habilidade_codigo: string;
  ano_escolar: string;
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

  const years = Array.from(new Set(bnccSkills.map(s => s.ano)));
  const axes = Array.from(new Set(bnccSkills.map(s => s.eixo)));

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
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <GraduationCap size={20} />
            </div>
            <h1 className="text-lg font-bold text-zinc-900 tracking-tight">
              BNCC IA
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link 
              to="/settings" 
              className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors"
              title="Configurações"
            >
              <Settings size={20} />
            </Link>
            <div className="h-6 w-px bg-zinc-200 mx-1"></div>
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-10">
        
        {/* Welcome Section */}
        <section className="bg-white rounded-2xl p-8 border border-zinc-200 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">
              Olá, {user?.nome.split(' ')[0]}
            </h2>
            <p className="text-zinc-500 max-w-2xl mb-6">
              Crie planejamentos de aula alinhados à BNCC de Computação de forma rápida e profissional.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
                <BookOpenCheck size={14} />
                {plans.length} planejamentos salvos
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sparkles size={120} className="text-indigo-600" />
          </div>
        </section>

        {/* New Plan Section */}
        <section id="novo-plano" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <Plus className="text-indigo-600" size={24} />
              Novo Planejamento
            </h3>
            
            <div className="flex flex-wrap gap-2">
              <select 
                className="bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
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
                className="bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
              <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Habilidades BNCC</span>
                <span className="text-xs font-medium text-zinc-400">{filteredSkills.length} disponíveis</span>
              </div>
              <div className="divide-y divide-zinc-100 max-h-[400px] overflow-y-auto custom-scrollbar">
                {filteredSkills.map(skill => (
                  <button
                    key={skill.codigo}
                    onClick={() => setSelectedSkill(skill)}
                    className={`w-full text-left p-4 transition-colors flex items-start gap-4 hover:bg-zinc-50 ${
                      selectedSkill?.codigo === skill.codigo ? 'bg-indigo-50/50' : ''
                    }`}
                  >
                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedSkill?.codigo === skill.codigo 
                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                        : 'border-zinc-200 text-transparent'
                    }`}>
                      <Check size={12} strokeWidth={4} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-indigo-600 font-mono">{skill.codigo}</span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase bg-zinc-100 px-1.5 py-0.5 rounded">{skill.eixo}</span>
                      </div>
                      <p className="text-sm text-zinc-600 leading-snug">{skill.descricao}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm sticky top-24">
                <h4 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                  <Info size={16} className="text-indigo-600" />
                  Detalhes da Seleção
                </h4>
                
                {selectedSkill ? (
                  <div className="space-y-5">
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Habilidade</p>
                      <p className="text-sm font-medium text-zinc-800 leading-relaxed">{selectedSkill.codigo}: {selectedSkill.descricao}</p>
                    </div>
                    
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-xs text-zinc-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                        Análise pedagógica completa
                      </li>
                      <li className="flex items-center gap-2 text-xs text-zinc-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                        5 planos de aula sequenciais
                      </li>
                      <li className="flex items-center gap-2 text-xs text-zinc-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                        Recursos e avaliações
                      </li>
                    </ul>

                    <button
                      onClick={handleStartNew}
                      disabled={loading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          Gerar Planejamento
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 bg-zinc-50 text-zinc-300 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search size={24} />
                    </div>
                    <p className="text-xs font-medium text-zinc-400">Selecione uma habilidade para começar.</p>
                  </div>
                )}
              </div>
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
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                        <span className="text-sm font-bold">{year.match(/\d+/)?.[0] || '?' }</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-zinc-900">{year}</h3>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sequência Progressiva</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/plans/batch-pdf?year=${encodeURIComponent(year)}`, {
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (response.ok) {
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `Curriculo_Anual_${year.replace(/\s/g, '_')}.pdf`;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                            }
                          } catch (err) {
                            console.error('Batch download error:', err);
                          }
                        }}
                        className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-100 transition-all"
                      >
                        <Download size={14} />
                        BAIXAR ANO COMPLETO
                      </button>
                      <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded-full border border-zinc-200">
                        {groupedPlans[year].length} {groupedPlans[year].length === 1 ? 'PLANEJAMENTO' : 'PLANEJAMENTOS'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedPlans[year].map((plan) => (
                      <div key={plan.id} className="relative group">
                        {isSelectionMode && (
                          <button 
                            onClick={() => togglePlanSelection(plan.id)}
                            className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-white border border-zinc-200 shadow-sm transition-all"
                          >
                            {selectedPlanIds.includes(plan.id) ? (
                              <CheckSquare size={18} className="text-indigo-600" />
                            ) : (
                              <Square size={18} className="text-zinc-300" />
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
                          className={`w-full bg-white p-6 rounded-2xl border transition-all text-left cursor-pointer ${
                            selectedPlanIds.includes(plan.id) 
                              ? 'border-indigo-600 bg-indigo-50/20' 
                              : 'border-zinc-200 hover:border-indigo-400 hover:shadow-md'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-bold text-indigo-600 font-mono bg-indigo-50 px-2 py-1 rounded border border-indigo-100 w-fit">
                                {plan.habilidade_codigo}
                              </span>
                              <span className="text-[10px] font-bold text-zinc-400 uppercase">
                                {bnccSkills.find(s => s.codigo === plan.habilidade_codigo)?.eixo}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">
                              Etapa {plan.plano_atual}/5
                            </span>
                          </div>
                          
                          <h4 className="text-base font-bold text-zinc-900 mb-4">Planejamento Pedagógico</h4>
                          
                          <div className="space-y-2">
                            <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-indigo-600 h-full transition-all duration-500" 
                                style={{ width: `${(plan.plano_atual / 5) * 100}%` }}
                              ></div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="text-zinc-400 uppercase tracking-wider">Progresso</span>
                              <span className="text-indigo-600">{Math.round((plan.plano_atual / 5) * 100)}%</span>
                            </div>
                          </div>

                          <div className="mt-6 pt-4 border-t border-zinc-50 flex items-center justify-between">
                            <div className="flex items-center text-indigo-600 text-xs font-bold">
                              {isSelectionMode ? 'Selecionar' : 'Continuar'} 
                              <ChevronRight size={14} className="ml-1" />
                            </div>
                            {!isSelectionMode && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSingle(plan.id);
                                  }}
                                  className="p-2 rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                  title="Excluir Planejamento"
                                >
                                  <Trash2 size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const handleDownload = async () => {
                                    try {
                                      const response = await fetch(`/api/plans/${plan.id}/pdf`, {
                                        headers: { 'Authorization': `Bearer ${token}` }
                                      });
                                      if (response.ok) {
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `Planejamento_${plan.habilidade_codigo}.pdf`;
                                        document.body.appendChild(a);
                                        a.click();
                                        a.remove();
                                      }
                                    } catch (err) {
                                      console.error('Download error:', err);
                                    }
                                  };
                                  handleDownload();
                                }}
                                className="p-2 rounded-lg text-zinc-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                title="Baixar PDF"
                              >
                                <Download size={16} />
                              </button>
                            </div>
                          )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-zinc-200 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-zinc-400">
            <GraduationCap size={24} />
            <span className="font-bold text-lg tracking-tight">BNCC IA</span>
          </div>
          <p className="text-zinc-400 text-xs font-medium">© {new Date().getFullYear()} – Sistema Inteligente de Planejamento.</p>
          <div className="flex gap-4">
            <a href="#" className="text-zinc-400 hover:text-indigo-600 transition-colors text-xs font-bold">Suporte</a>
            <a href="#" className="text-zinc-400 hover:text-indigo-600 transition-colors text-xs font-bold">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
