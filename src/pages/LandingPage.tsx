import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  BrainCircuit, 
  Zap,
  MessageCircle,
  ShieldCheck,
  Globe,
  Users,
  Lock
} from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <BrainCircuit className="text-indigo-600" size={24} />,
      title: "IA Especializada",
      description: "Algoritmos treinados especificamente na BNCC para gerar conteúdos precisos e pedagógicos."
    },
    {
      icon: <FileText className="text-indigo-600" size={24} />,
      title: "Exportação Completa",
      description: "Gere documentos em PDF e Word (DOCX) prontos para impressão, seguindo normas ABNT."
    },
    {
      icon: <Zap className="text-indigo-600" size={24} />,
      title: "Agilidade Real",
      description: "Reduza em até 90% o tempo gasto com burocracia e planejamento manual."
    },
    {
      icon: <ShieldCheck className="text-indigo-600" size={24} />,
      title: "Alinhamento BNCC",
      description: "Todas as habilidades e competências mapeadas para garantir conformidade total."
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 text-zinc-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <GraduationCap size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter leading-none">Teacher Digital IA</span>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">BNCC Computação</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-zinc-500">
            <a href="#funcionalidades" className="hover:text-indigo-600 transition-colors">Funcionalidades</a>
            <a href="#sobre" className="hover:text-indigo-600 transition-colors">Sobre</a>
            <Link to="/login" className="hover:text-indigo-600 transition-colors">Entrar</Link>
            <Link 
              to="/register" 
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/50 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-purple-100/50 blur-[120px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-indigo-100">
              <Sparkles size={12} />
              A Revolução Pedagógica via IA
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.85] mb-8">
              Planeje <span className="text-indigo-600">Menos.</span> <br />
              Ensine <span className="italic font-serif text-zinc-400">Mais.</span>
            </h1>
            <p className="text-lg md:text-2xl text-zinc-500 max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
              A BNCC IA automatiza a burocracia pedagógica com precisão acadêmica, 
              devolvendo aos professores o tempo que eles merecem para o que realmente importa.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                to="/register" 
                className="w-full sm:w-auto bg-indigo-600 text-white px-12 py-6 rounded-2xl font-black text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3 group active:scale-95"
              >
                Começar Gratuitamente
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/test-drive"
                className="w-full sm:w-auto px-12 py-6 rounded-2xl font-black text-xl border border-zinc-200 hover:bg-zinc-50 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                Testar sem Login
                <Sparkles size={20} className="text-indigo-600" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-24 relative max-w-6xl mx-auto"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white rounded-[2.5rem] border border-zinc-200 shadow-2xl overflow-hidden p-4">
              <img 
                src="https://picsum.photos/seed/dashboard/1600/900" 
                alt="Plataforma BNCC IA" 
                className="rounded-[1.5rem] w-full object-cover shadow-inner"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </div>
      </section>

       {/* Bento Grid Features */}
      <section id="funcionalidades" className="py-32 bg-zinc-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Potência máxima para sua escola.</h2>
              <p className="text-zinc-500 text-lg font-medium">Combinamos o rigor da BNCC com a velocidade da Inteligência Artificial Generativa.</p>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400">
                <Users size={20} />
              </div>
              <div className="w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400">
                <Globe size={20} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large Bento Item */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 bg-white p-10 rounded-[2.5rem] border border-zinc-200 shadow-sm flex flex-col justify-between overflow-hidden relative group"
            >
              <div className="relative z-10">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-indigo-100">
                  <BrainCircuit size={28} />
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tight">IA Pedagógica Nativa</h3>
                <p className="text-zinc-500 text-lg font-medium max-w-md leading-relaxed">
                  Não é apenas um chat. É um motor de inteligência treinado em todas as 10 competências gerais e milhares de habilidades da BNCC.
                </p>
              </div>
              <div className="absolute bottom-[-10%] right-[-5%] w-1/2 opacity-10 group-hover:opacity-20 transition-opacity">
                <BrainCircuit size={300} />
              </div>
            </motion.div>

            {/* Small Bento Item */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-indigo-600 p-10 rounded-[2.5rem] text-white flex flex-col justify-between shadow-xl shadow-indigo-100"
            >
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
                <Zap size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-3 tracking-tight">Velocidade Extrema</h3>
                <p className="text-indigo-100 font-medium leading-relaxed">
                  Gere um plano de aula completo e fundamentado em menos de 15 segundos.
                </p>
              </div>
            </motion.div>

            {/* Small Bento Item */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-zinc-900 p-10 rounded-[2.5rem] text-white flex flex-col justify-between"
            >
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                <FileText size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-3 tracking-tight">Exportação ABNT</h3>
                <p className="text-zinc-400 font-medium leading-relaxed">
                  Documentos prontos em PDF e Word, seguindo rigorosamente as normas acadêmicas.
                </p>
              </div>
            </motion.div>

            {/* Large Bento Item */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 bg-white p-10 rounded-[2.5rem] border border-zinc-200 shadow-sm flex flex-col md:flex-row items-center gap-10"
            >
              <div className="flex-1">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-8">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tight">Segurança Institucional</h3>
                <p className="text-zinc-500 text-lg font-medium leading-relaxed">
                  Gestão completa de usuários para escolas e secretarias. Controle quem acessa e o que é produzido.
                </p>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="aspect-square bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-300">
                  <Users size={40} />
                </div>
                <div className="aspect-square bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-300">
                  <Lock size={40} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="sobre" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Como funciona?</h2>
            <p className="text-zinc-500 text-xl font-medium max-w-2xl mx-auto">
              Três passos simples para transformar seu planejamento pedagógico.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Defina o Tema",
                description: "Informe o assunto, a série e os objetivos que deseja trabalhar em sua aula."
              },
              {
                step: "02",
                title: "IA Gera o Plano",
                description: "Nossa inteligência processa a BNCC e gera um plano completo com fundamentação teórica."
              },
              {
                step: "03",
                title: "Revise e Exporte",
                description: "Faça os ajustes finais e baixe seu documento pronto em PDF ou Word (ABNT)."
              }
            ].map((s, i) => (
              <div key={i} className="relative">
                <div className="text-8xl font-black text-zinc-50 mb-6 select-none">{s.step}</div>
                <div className="relative -mt-16">
                  <h3 className="text-2xl font-black mb-4 tracking-tight">{s.title}</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Planos que cabem no seu bolso.</h2>
            <p className="text-zinc-500 text-xl font-medium max-w-2xl mx-auto">
              Escolha o plano ideal para sua necessidade, seja você um professor autônomo ou uma instituição de ensino.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-200 flex flex-col">
              <h3 className="text-2xl font-black mb-2">Gratuito</h3>
              <div className="text-4xl font-black mb-6">R$ 0<span className="text-lg text-zinc-400 font-bold">/mês</span></div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-zinc-600 font-medium">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                  3 gerações por mês
                </li>
                <li className="flex items-center gap-3 text-zinc-600 font-medium">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                  Acesso à BNCC Completa
                </li>
                <li className="flex items-center gap-3 text-zinc-600 font-medium opacity-40">
                  <CheckCircle2 size={20} />
                  Exportação em Word/PDF
                </li>
              </ul>
              <Link to="/register" className="w-full py-4 rounded-2xl border border-zinc-200 font-black text-center hover:bg-zinc-50 transition-all">
                Começar Grátis
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-indigo-600 p-10 rounded-[2.5rem] text-white flex flex-col relative overflow-hidden shadow-2xl shadow-indigo-200 scale-105 z-10">
              <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Mais Popular
              </div>
              <h3 className="text-2xl font-black mb-2">Pro</h3>
              <div className="text-4xl font-black mb-6">R$ 29,90<span className="text-lg text-indigo-200 font-bold">/mês</span></div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-indigo-50 font-medium">
                  <CheckCircle2 size={20} className="text-white" />
                  Gerações Ilimitadas
                </li>
                <li className="flex items-center gap-3 text-indigo-50 font-medium">
                  <CheckCircle2 size={20} className="text-white" />
                  Exportação Word/PDF
                </li>
                <li className="flex items-center gap-3 text-indigo-50 font-medium">
                  <CheckCircle2 size={20} className="text-white" />
                  Suporte Prioritário
                </li>
                <li className="flex items-center gap-3 text-indigo-50 font-medium">
                  <CheckCircle2 size={20} className="text-white" />
                  Sem anúncios
                </li>
              </ul>
              <Link to="/register" className="w-full py-4 rounded-2xl bg-white text-indigo-600 font-black text-center hover:bg-indigo-50 transition-all shadow-xl">
                Assinar Agora
              </Link>
            </div>

            {/* School Plan */}
            <div className="bg-zinc-900 p-10 rounded-[2.5rem] text-white flex flex-col">
              <h3 className="text-2xl font-black mb-2">Escolas</h3>
              <div className="text-4xl font-black mb-6">Personalizado</div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-zinc-400 font-medium">
                  <CheckCircle2 size={20} className="text-indigo-400" />
                  Gestão de Professores
                </li>
                <li className="flex items-center gap-3 text-zinc-400 font-medium">
                  <CheckCircle2 size={20} className="text-indigo-400" />
                  Relatórios de Uso
                </li>
                <li className="flex items-center gap-3 text-zinc-400 font-medium">
                  <CheckCircle2 size={20} className="text-indigo-400" />
                  Treinamento Exclusivo
                </li>
              </ul>
              <a href="https://wa.me/5582982302447" target="_blank" rel="noopener noreferrer" className="w-full py-4 rounded-2xl bg-white/10 font-black text-center hover:bg-white/20 transition-all">
                Falar com Consultor
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center mb-20 tracking-tight">O que dizem os professores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Maria Silva",
                role: "Professora de História",
                text: "A BNCC IA mudou minha vida. O que eu levava horas para planejar, agora faço em minutos com uma qualidade incrível."
              },
              {
                name: "João Pereira",
                role: "Coordenador Pedagógico",
                text: "Implementamos na escola e a produtividade dos professores aumentou drasticamente. O alinhamento com a BNCC é perfeito."
              },
              {
                name: "Ana Costa",
                role: "Professora de Ciências",
                text: "As atividades geradas são muito criativas e engajam os alunos. Recomendo para todos os meus colegas."
              }
            ].map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => <Sparkles key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="text-zinc-600 font-medium italic mb-6">"{t.text}"</p>
                <div>
                  <div className="font-black text-zinc-900">{t.name}</div>
                  <div className="text-sm text-zinc-400 font-bold uppercase tracking-widest">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-16 tracking-tight">Perguntas Frequentes</h2>
          <div className="space-y-6">
            {[
              {
                q: "A plataforma é realmente alinhada com a BNCC?",
                a: "Sim, todos os nossos algoritmos são treinados especificamente com a base de dados oficial da BNCC, garantindo que cada habilidade e competência seja mapeada corretamente."
              },
              {
                q: "Posso exportar os planos para Word?",
                a: "Com certeza! No plano Pro, você tem exportação ilimitada para formatos .docx (Word) e .pdf, já formatados conforme as normas pedagógicas."
              },
              {
                q: "Como funciona o suporte?",
                a: "Oferecemos suporte via WhatsApp e E-mail para todos os usuários. Assinantes Pro e Institucionais possuem atendimento prioritário."
              }
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-3xl border border-zinc-100 hover:border-indigo-200 transition-colors">
                <h4 className="text-xl font-black mb-4">{item.q}</h4>
                <p className="text-zinc-500 font-medium leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-indigo-600 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <Sparkles size={400} className="absolute -top-20 -right-20" />
            <BrainCircuit size={300} className="absolute -bottom-20 -left-20" />
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8 relative z-10">
            Pronto para transformar sua rotina pedagógica?
          </h2>
          <p className="text-indigo-100 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium relative z-10">
            Junte-se a milhares de professores que já estão usando a BNCC IA para focar no que realmente importa: o ensino.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-3 bg-white text-indigo-600 px-10 py-5 rounded-2xl font-black text-xl hover:bg-indigo-50 transition-all shadow-xl relative z-10 active:scale-95"
          >
            Começar Gratuitamente
            <ArrowRight />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <GraduationCap size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tighter leading-none">Teacher Digital IA</span>
                <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">BNCC Computação</span>
              </div>
            </div>
            <p className="text-zinc-500 text-sm max-w-sm font-medium leading-relaxed">
              A ferramenta definitiva para o professor moderno. Alinhamento total com a BNCC Computação e produtividade máxima.
            </p>
          </div>
          
          <div>
            <h4 className="font-black text-sm uppercase tracking-widest mb-6">Links</h4>
            <ul className="space-y-4 text-sm font-bold text-zinc-500">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Início</a></li>
              <li><a href="#funcionalidades" className="hover:text-indigo-600 transition-colors">Funcionalidades</a></li>
              <li><Link to="/documentacao" className="hover:text-indigo-600 transition-colors">Documentação</Link></li>
              <li><Link to="/login" className="hover:text-indigo-600 transition-colors">Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-sm uppercase tracking-widest mb-6">Legal</h4>
            <ul className="space-y-4 text-sm font-bold text-zinc-500">
              <li><Link to="/privacidade" className="hover:text-indigo-600 transition-colors">Privacidade</Link></li>
              <li><a href="https://wa.me/5582982302447" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">Suporte</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Termos de Uso</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-zinc-100 text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
          © {new Date().getFullYear()} Teacher Digital IA. Todos os direitos reservados.
        </div>
      </footer>

      {/* WhatsApp Support Button */}
      <a 
        href="https://wa.me/5582982302447" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl shadow-green-200 hover:scale-110 transition-all active:scale-90 group"
        title="Suporte via WhatsApp"
      >
        <MessageCircle size={32} fill="currentColor" />
        <span className="absolute right-full mr-4 bg-white text-zinc-900 px-4 py-2 rounded-xl text-sm font-black shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-zinc-100">
          Precisa de ajuda?
        </span>
      </a>
    </div>
  );
}
