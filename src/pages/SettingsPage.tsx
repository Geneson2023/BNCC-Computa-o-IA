import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserPlus, 
  ShieldCheck, 
  ArrowLeft, 
  LayoutDashboard, 
  LogOut, 
  Settings as SettingsIcon,
  Mail,
  Lock,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  MapPin,
  Image as ImageIcon,
  PenTool,
  Download,
  FileArchive,
  Save,
  Key,
  ExternalLink
} from 'lucide-react';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function SettingsPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  // User Registration State
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [escola, setEscola] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState('Professor');
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState('');

  // Institutional Settings State
  const [settings, setSettings] = useState({
    secretaria_nome: '',
    municipio_nome: '',
    estado_nome: '',
    logo_prefeitura: '',
    logo_secretaria: '',
    nome_secretario: '',
    assinatura_digital: '',
    config_exportacao: '{"include_fase_zero": true, "include_planos": true, "resumida": false}'
  });
  const [setLoading, setSetLoading] = useState(false);
  const [setSuccess, setSetSuccess] = useState(false);
  const [setError, setSetError] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);
  const [hasCustomKey, setHasCustomKey] = useState(false);

  useEffect(() => {
    fetchSettings();
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setHasCustomKey(hasKey);
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success and update UI
      setHasCustomKey(true);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data) setSettings(data);
    } catch (err) {
      console.error('Erro ao carregar configurações');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetLoading(true);
    setSetSuccess(false);
    setSetError('');

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSetSuccess(true);
      } else {
        setSetError('Erro ao salvar configurações');
      }
    } catch (err) {
      setSetError('Erro de conexão');
    } finally {
      setSetLoading(false);
    }
  };

  const handleBatchExport = async () => {
    setBatchLoading(true);
    try {
      const response = await fetch('/api/admin/batch-export', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Exportacao_Lote_BNCC_IA.zip';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      console.error('Erro na exportação em lote');
    } finally {
      setBatchLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError('');
    setRegSuccess(false);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, perfil, escola }),
      });

      if (response.ok) {
        setRegSuccess(true);
        setNome('');
        setEmail('');
        setSenha('');
      } else {
        const data = await response.json();
        setRegError(data.error || 'Erro ao cadastrar usuário');
      }
    } catch (err) {
      setRegError('Erro de conexão');
    } finally {
      setRegLoading(false);
    }
  };

  if (user?.perfil !== 'Gestor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 font-sans">
        <div className="text-center space-y-4 max-w-sm">
          <div className="bg-red-50 p-6 rounded-2xl inline-block">
            <AlertCircle size={48} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900">Acesso Negado</h1>
          <p className="text-zinc-500 text-sm">Apenas o gestor tem acesso a esta página de configurações institucionais.</p>
          <Link to="/" className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-all">
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <SettingsIcon size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 tracking-tight">Configurações</h1>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => navigate('/')} className="p-2 text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100 rounded-lg transition-colors" title="Dashboard">
              <LayoutDashboard size={20} />
            </button>
            <button onClick={logout} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Sair">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Institutional Settings */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
                  <Building2 size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">Padrão Institucional</h2>
                  <p className="text-zinc-500 text-xs">Configure os dados para o PDF oficial.</p>
                </div>
              </div>
              <button 
                onClick={handleSaveSettings}
                disabled={setLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50 active:scale-95"
              >
                {setLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Salvar
              </button>
            </div>

            <div className="p-8 space-y-8">
              {setSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-2xl flex items-center gap-3">
                  <CheckCircle2 size={20} />
                  <p className="text-sm font-medium">Configurações salvas com sucesso!</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Nome da Secretaria</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                    value={settings.secretaria_nome}
                    onChange={(e) => setSettings({...settings, secretaria_nome: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Município</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                    value={settings.municipio_nome}
                    onChange={(e) => setSettings({...settings, municipio_nome: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Estado</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                    value={settings.estado_nome}
                    onChange={(e) => setSettings({...settings, estado_nome: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Nome do Secretário(a)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                    value={settings.nome_secretario}
                    onChange={(e) => setSettings({...settings, nome_secretario: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Logo Prefeitura</label>
                  <div className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-zinc-200 rounded-2xl hover:border-indigo-300 transition-colors cursor-pointer relative bg-zinc-50/50">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'logo_prefeitura')} />
                    {settings.logo_prefeitura ? (
                      <img src={settings.logo_prefeitura} className="h-16 object-contain" />
                    ) : (
                      <ImageIcon className="text-zinc-300" size={32} />
                    )}
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Enviar Logo</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Logo Secretaria</label>
                  <div className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-zinc-200 rounded-2xl hover:border-indigo-300 transition-colors cursor-pointer relative bg-zinc-50/50">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'logo_secretaria')} />
                    {settings.logo_secretaria ? (
                      <img src={settings.logo_secretaria} className="h-16 object-contain" />
                    ) : (
                      <ImageIcon className="text-zinc-300" size={32} />
                    )}
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Enviar Logo</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Assinatura Digital</label>
                  <div className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-zinc-200 rounded-2xl hover:border-indigo-300 transition-colors cursor-pointer relative bg-zinc-50/50">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'assinatura_digital')} />
                    {settings.assinatura_digital ? (
                      <img src={settings.assinatura_digital} className="h-16 object-contain" />
                    ) : (
                      <PenTool className="text-zinc-300" size={32} />
                    )}
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Enviar Assinatura</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Batch Export */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="bg-amber-50 p-4 rounded-2xl text-amber-600">
                <FileArchive size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Exportação em Lote</h3>
                <p className="text-sm text-zinc-500">Gere um arquivo ZIP com todos os planejamentos da plataforma.</p>
              </div>
            </div>
            <button 
              onClick={handleBatchExport}
              disabled={batchLoading}
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {batchLoading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
              Baixar Tudo (ZIP)
            </button>
          </div>

          {/* API Key Selection */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="p-6 border-b border-zinc-100 bg-zinc-50/30">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
                  <Key size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">Uso Ilimitado (Chave API)</h2>
                  <p className="text-zinc-500 text-xs">Remova os limites de geração usando sua própria chave.</p>
                </div>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100">
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-xl shadow-sm text-indigo-600">
                    <ShieldCheck size={24} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-zinc-900">Como funciona?</h4>
                    <p className="text-sm text-zinc-600 leading-relaxed">
                      Por padrão, o sistema compartilha uma cota global. Ao configurar sua própria chave do Google Gemini, você terá acesso prioritário e sem limites de geração.
                    </p>
                    <a 
                      href="https://ai.google.dev/gemini-api/docs/billing" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline"
                    >
                      Saiba mais sobre faturamento <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${hasCustomKey ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'}`} />
                  <span className="text-sm font-medium text-zinc-700">
                    Status: {hasCustomKey ? 'Chave Pessoal Ativa (Ilimitado)' : 'Usando Cota Compartilhada (Limitado)'}
                  </span>
                </div>
                <button 
                  onClick={handleSelectKey}
                  className="w-full sm:w-auto bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                >
                  <Key size={16} />
                  {hasCustomKey ? 'Alterar Chave API' : 'Configurar Chave Própria'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Registration */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="p-6 border-b border-zinc-100 bg-zinc-50/30">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
                  <UserPlus size={24} />
                </div>
                <h2 className="text-lg font-bold text-zinc-900">Novo Usuário</h2>
              </div>
            </div>

            <form onSubmit={handleRegister} className="p-8 space-y-5">
              {regSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-3 rounded-xl flex items-center gap-2 text-xs font-medium">
                  <CheckCircle2 size={16} />
                  Usuário cadastrado com sucesso!
                </div>
              )}

              {regError && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl flex items-center gap-2 text-xs font-medium">
                  <AlertCircle size={16} />
                  {regError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Nome</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Escola</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                  value={escola}
                  onChange={(e) => setEscola(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Senha</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Perfil</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                  value={perfil}
                  onChange={(e) => setPerfil(e.target.value)}
                >
                  <option value="Professor">Professor</option>
                  <option value="Coordenador">Coordenador</option>
                  <option value="Gestor">Gestor</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50 mt-4"
              >
                {regLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Cadastrar Usuário'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
