import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  Download, 
  Printer, 
  FileText, 
  Sparkles,
  Zap,
  Search,
  LayoutDashboard,
  MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Documentation() {
  const handlePrint = () => {
    window.print();
  };

  const steps = [
    {
      title: "1. Escolha a Habilidade",
      description: "No dashboard, utilize os filtros de Ano e Eixo para encontrar a habilidade da BNCC que deseja trabalhar. Clique na habilidade para selecioná-la.",
      icon: <Search className="text-indigo-600" size={24} />
    },
    {
      title: "2. Inicie o Planejamento",
      description: "Com a habilidade selecionada, clique em 'INICIAR AGORA'. A IA começará a fundamentar a habilidade (Fase 0) e criará a sequência de 5 planos de aula.",
      icon: <Zap className="text-indigo-600" size={24} />
    },
    {
      title: "3. Personalize seu Plano",
      description: "Você pode editar qualquer parte do texto gerado, adicionar recursos extras como 'Atividade Prática' ou 'Avaliação', e integrar outras disciplinas.",
      icon: <FileText className="text-indigo-600" size={24} />
    },
    {
      title: "4. Exporte e Imprima",
      description: "Utilize os botões de exportação para baixar seu planejamento completo em PDF ou Word (DOCX). O documento já vem formatado para uso imediato.",
      icon: <Printer className="text-indigo-600" size={24} />
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-indigo-100 text-zinc-900 pb-20 print:bg-white print:pb-0">
      {/* Navigation - Hidden on Print */}
      <nav className="bg-white border-b border-zinc-100 print:hidden">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <GraduationCap size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter leading-none">Teacher Digital IA</span>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">BNCC Computação</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
            >
              <Printer size={18} />
              Imprimir Guia
            </button>
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-indigo-600 transition-colors"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-12 print:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl overflow-hidden print:shadow-none print:border-none print:rounded-none"
        >
          {/* Header Section */}
          <div className="bg-indigo-600 p-12 md:p-16 text-white relative overflow-hidden print:bg-white print:text-zinc-900 print:p-0 print:mb-8 print:border-b print:border-zinc-200 print:pb-8">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 print:bg-zinc-100 print:text-zinc-500">
                Guia de Utilização
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">Como usar o Teacher Digital IA</h1>
              <p className="text-indigo-100 text-lg md:text-xl max-w-2xl font-medium print:text-zinc-500">
                Aprenda a extrair o máximo potencial da nossa Inteligência Artificial para transformar seu planejamento pedagógico.
              </p>
            </div>
            <Sparkles size={300} className="absolute -top-20 -right-20 text-white/10 print:hidden" />
          </div>

          <div className="p-12 md:p-16 space-y-16 print:p-0">
            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {steps.map((step, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center print:bg-zinc-100">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">{step.title}</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Features Section */}
            <div className="bg-zinc-50 rounded-[2rem] p-10 border border-zinc-100 print:bg-white print:border-zinc-200">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                <CheckCircle2 className="text-emerald-500" />
                Recursos Principais
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { t: "Fundamentação Teórica", d: "Baseada em autores renomados e na BNCC." },
                  { t: "Sequência Didática", d: "5 planos de aula que se conectam logicamente." },
                  { t: "Recursos Extras", d: "Gere avaliações, atividades e projetos com um clique." },
                  { t: "Interdisciplinaridade", d: "Integre com Matemática, Ciências, Artes e mais." },
                  { t: "Exportação ABNT", d: "Documentos prontos para o Word e PDF." },
                  { t: "Suporte Pro", d: "Atendimento prioritário via WhatsApp." }
                ].map((f, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900">{f.t}</h4>
                      <p className="text-xs text-zinc-500 font-medium">{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Print Footer */}
            <div className="pt-12 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-8 print:mt-12">
              <div className="text-center md:text-left">
                <p className="text-sm font-black text-zinc-900 mb-1">Teacher Digital IA</p>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Alinhado à BNCC Computação</p>
              </div>
              
              <div className="flex items-center gap-6 print:hidden">
                <a 
                  href="https://wa.me/5582982302447" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-600 font-black text-sm hover:underline"
                >
                  <MessageCircle size={18} />
                  Suporte WhatsApp
                </a>
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-2 text-zinc-900 font-black text-sm hover:underline"
                >
                  <Printer size={18} />
                  Imprimir este Guia
                </button>
              </div>
              
              <div className="hidden print:block text-xs text-zinc-400 font-medium italic">
                Documentação oficial gerada em {new Date().toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
