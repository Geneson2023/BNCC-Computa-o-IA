import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, ShieldCheck, Lock, Eye, FileText, BrainCircuit } from 'lucide-react';
import { motion } from 'motion/react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-indigo-100 text-zinc-900 pb-20">
      {/* Navigation */}
      <nav className="bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <GraduationCap size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter">BNCC IA</span>
          </Link>
          
          <Link 
            to="/" 
            className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar para o Início
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl overflow-hidden"
        >
          <div className="p-12 md:p-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <ShieldCheck size={28} />
              </div>
              <h1 className="text-4xl font-black tracking-tight">Política de Privacidade</h1>
            </div>

            <p className="text-zinc-500 font-medium mb-12 leading-relaxed">
              Última atualização: 05 de Março de 2026. <br />
              Sua privacidade é fundamental para nós. Esta política explica como coletamos, usamos e protegemos suas informações na plataforma BNCC IA.
            </p>

            <div className="space-y-12">
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="text-indigo-600" size={20} />
                  <h2 className="text-xl font-black tracking-tight">1. Coleta de Informações</h2>
                </div>
                <p className="text-zinc-600 leading-relaxed font-medium">
                  Coletamos informações básicas de cadastro, como nome, e-mail institucional e cargo pedagógico, para personalizar sua experiência e garantir a segurança da sua conta. Além disso, armazenamos os planejamentos gerados por você para que possam ser acessados e editados posteriormente.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="text-indigo-600" size={20} />
                  <h2 className="text-xl font-black tracking-tight">2. Segurança dos Dados</h2>
                </div>
                <p className="text-zinc-600 leading-relaxed font-medium">
                  Utilizamos criptografia de ponta a ponta e protocolos de segurança rigorosos para proteger seus dados contra acessos não autorizados. Seus planejamentos são privados e acessíveis apenas por você e, opcionalmente, por gestores da sua instituição caso configurado.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <BrainCircuit className="text-indigo-600" size={20} />
                  <h2 className="text-xl font-black tracking-tight">3. Uso de Inteligência Artificial</h2>
                </div>
                <p className="text-zinc-600 leading-relaxed font-medium">
                  A BNCC IA utiliza modelos de linguagem avançados para auxiliar na criação de conteúdos. Os dados inseridos para geração de planos (como temas e habilidades) são processados de forma anônima para melhorar a precisão dos nossos algoritmos, nunca sendo compartilhados com terceiros para fins publicitários.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="text-indigo-600" size={20} />
                  <h2 className="text-xl font-black tracking-tight">4. Seus Direitos</h2>
                </div>
                <p className="text-zinc-600 leading-relaxed font-medium">
                  Você tem o direito de acessar, corrigir ou excluir seus dados a qualquer momento através das configurações da plataforma. Caso deseje encerrar sua conta, todos os seus dados pessoais serão removidos permanentemente de nossos servidores ativos.
                </p>
              </section>
            </div>

            <div className="mt-20 pt-12 border-t border-zinc-100 text-center">
              <p className="text-zinc-400 text-sm font-bold mb-6">Dúvidas sobre nossa política?</p>
              <a 
                href="https://wa.me/5582982302447" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-zinc-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-zinc-800 transition-all shadow-xl active:scale-95"
              >
                Falar com o Suporte
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
