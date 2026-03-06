import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  GraduationCap, 
  ArrowRight, 
  Sparkles, 
  Loader2, 
  Check, 
  Info,
  ChevronLeft,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { bnccSkills, BNCCSkill } from '../data/bnccData';

export default function TestDrive() {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedAxis, setSelectedAxis] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<BNCCSkill | null>(null);
  const [loading, setLoading] = useState(false);
  const [guestId, setGuestId] = useState<string>('');

  useEffect(() => {
    let id = localStorage.getItem('bncc_guest_id');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('bncc_guest_id', id);
    }
    setGuestId(id);
  }, []);

  const years = Array.from(new Set(bnccSkills.map(s => s.ano)));
  const axes = Array.from(new Set(bnccSkills.map(s => s.eixo)));

  const filteredSkills = bnccSkills.filter(s => {
    const yearMatch = !selectedYear || s.ano === selectedYear;
    const axisMatch = !selectedAxis || s.eixo === selectedAxis;
    return yearMatch && axisMatch;
  });

  const handleStartTest = async () => {
    if (!selectedSkill || !guestId) return;
    setLoading(true);

    try {
      const response = await fetch('/api/guest/plans/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          habilidade_codigo: selectedSkill.codigo,
          ano_escolar: selectedSkill.ano,
          eixo: selectedSkill.eixo,
          guest_id: guestId
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        navigate(`/plan-test/${data.id}?guest_id=${guestId}`);
      } else {
        alert(data.error || 'Erro ao iniciar teste');
        if (response.status === 403) {
          navigate('/register');
        }
      }
    } catch (err) {
      console.error('Erro ao iniciar teste');
      alert('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans selection:bg-indigo-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100">
              <GraduationCap size={20} />
            </div>
            <h1 className="text-lg font-bold text-zinc-900 tracking-tight">BNCC IA <span className="text-zinc-400 font-medium ml-2">| Teste</span></h1>
          </Link>
          <Link to="/register" className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all">
            Criar Conta Grátis
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/" className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-400">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Experimente a IA Pedagógica</h2>
            <p className="text-zinc-500 font-medium">Gere um planejamento completo em segundos para testar nossa tecnologia.</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3 mb-8">
          <Info className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-amber-800 font-medium leading-relaxed">
            Você pode gerar até <strong>2 planejamentos de teste</strong> sem login. Para salvar seus trabalhos e exportar em Word/PDF, crie uma conta gratuita.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-xl shadow-zinc-200/40">
            <div className="bg-zinc-50/50 px-6 py-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Habilidades BNCC</span>
              
              <div className="flex gap-2">
                <select 
                  className="bg-white border border-zinc-200 rounded-xl text-[10px] font-black text-zinc-700 px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
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
                  className="bg-white border border-zinc-200 rounded-xl text-[10px] font-black text-zinc-700 px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
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

            <div className="divide-y divide-zinc-100 max-h-[500px] overflow-y-auto custom-scrollbar">
              {filteredSkills.map((skill, idx) => (
                <button
                  key={skill.codigo}
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
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <motion.div 
              layout
              className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-xl shadow-zinc-200/40 sticky top-24"
            >
              <h4 className="text-sm font-black text-zinc-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
                <Sparkles size={18} className="text-indigo-600" />
                Teste Grátis
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
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs font-bold text-zinc-500">
                      <Check size={16} className="text-emerald-500" />
                      Fundamentação Teórica IA
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-zinc-500">
                      <Check size={16} className="text-emerald-500" />
                      Plano de Aula 01
                    </div>
                    <div className="flex items-center gap-3 text-zinc-300 text-xs font-bold">
                      <Lock size={16} />
                      Exportação Word/PDF (Bloqueado)
                    </div>
                  </div>

                  <button
                    onClick={handleStartTest}
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        GERAR TESTE
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
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
      </main>
    </div>
  );
}
