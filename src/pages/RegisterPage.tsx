import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [escola, setEscola] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState('Professor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, perfil, escola }),
      });

      const data = await response.json();
      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.error || 'Erro ao cadastrar');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-sans selection:bg-indigo-100">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl shadow-zinc-200 border border-zinc-200 overflow-hidden"
      >
        <div className="p-10 text-center border-b border-zinc-100 relative overflow-hidden">
          <Link to="/login" className="absolute left-6 top-10 text-zinc-400 hover:text-indigo-600 transition-all active:scale-95 z-20">
            <ArrowLeft size={24} />
          </Link>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-6 text-white shadow-xl shadow-indigo-200 relative z-10"
          >
            <UserPlus size={32} />
          </motion.div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tighter relative z-10">Criar Conta</h1>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-2 relative z-10">Junte-se ao Planejamento Inteligente</p>
          
          <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
            <Sparkles size={160} className="text-indigo-600" />
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-5">
          {error && (
            <motion.div 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              {error}
            </motion.div>
          )}
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Nome Completo</label>
            <input
              type="text"
              required
              className="w-full px-5 py-3.5 rounded-2xl border border-zinc-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-medium bg-zinc-50/50 focus:bg-white"
              placeholder="Seu Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Email Institucional</label>
            <input
              type="email"
              required
              className="w-full px-5 py-3.5 rounded-2xl border border-zinc-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-medium bg-zinc-50/50 focus:bg-white"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Nome da Escola</label>
            <input
              type="text"
              required
              className="w-full px-5 py-3.5 rounded-2xl border border-zinc-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-medium bg-zinc-50/50 focus:bg-white"
              placeholder="Nome da sua Escola"
              value={escola}
              onChange={(e) => setEscola(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Perfil Profissional</label>
            <select
              className="w-full px-5 py-3.5 rounded-2xl border border-zinc-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold bg-zinc-50/50 focus:bg-white appearance-none"
              value={perfil}
              onChange={(e) => setPerfil(e.target.value)}
            >
              <option value="Professor">Professor</option>
              <option value="Coordenador">Coordenador</option>
              <option value="Gestor">Gestor</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Senha</label>
            <input
              type="password"
              required
              className="w-full px-5 py-3.5 rounded-2xl border border-zinc-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-medium bg-zinc-50/50 focus:bg-white"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 active:scale-[0.98] disabled:opacity-50 text-sm tracking-wide mt-4"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <UserPlus size={20} />
                FINALIZAR CADASTRO
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
