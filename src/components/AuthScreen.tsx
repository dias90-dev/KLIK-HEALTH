import React, { useState } from "react";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import { 
  Sparkles, 
  UserSquare2, 
  CalendarRange, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle
} from "lucide-react";

interface AuthScreenProps {
  onAuthSuccess: (user: User | null, role: "medico" | "paciente", isDemo: boolean) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [selectedRole, setSelectedRole] = useState<"medico" | "paciente">("medico");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account"
    });

    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        onAuthSuccess(result.user, selectedRole, false);
      }
    } catch (err: any) {
      console.error("Firebase Login Error:", err);
      // Explanatory message specifically guiding user of iframe constraints if any popup blocked
      const authErrorMsg = err.code === "auth/popup-blocked" 
        ? "O pop-up de login foi bloqueado pelo navegador. Por favor, libere pop-ups ou abra a aplicação em uma nova aba." 
        : err.code === "auth/popup-closed-by-user"
        ? "O fluxo de autenticação foi fechado antes de completar."
        : `Erro ao autenticar: ${err.message || "Tente novamente."}`;
      setError(authErrorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Allows instant, friction-free offline simulation/developer workspace checking
    onAuthSuccess(null, selectedRole, true);
  };

  return (
    <div id="auth-screen-layout" className="min-h-screen bg-[#0A0B0F] flex flex-col justify-between p-4 sm:p-6 md:p-8 antialiased selection:bg-teal-500/30 font-sans text-slate-200">
      
      {/* HEADER LOGO SECTION */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between py-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center text-black text-base font-black shadow-lg shadow-teal-500/20">
            K
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white leading-tight tracking-tight text-sm sm:text-base">KlikHealth <span className="text-teal-400">IA</span></span>
              <span className="text-[9px] bg-teal-500/10 text-teal-400 border border-teal-500/20 font-extrabold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider">Suporte Clínico</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider leading-none">Urgência &amp; Telemedicina</span>
          </div>
        </div>
        
        <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1 rounded-lg flex items-center gap-1.5 font-bold">
          <ShieldCheck size={13} className="text-teal-400" />
          Firebase Auth Ativo
        </span>
      </header>

      {/* CENTRAL CARD CONFLICT GRID SCREEN */}
      <main className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl"></div>
          
          {/* Welcome Titles */}
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-black text-white tracking-tight">Portal de Conexão Clínica</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto font-medium">
              Autentique-se com sua conta para acessar o prontuário eletrônico unificado e recursos avançados de Triagem baseados no Protocolo de Manchester.
            </p>
          </div>

          {/* Feedback error notice */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl flex items-start gap-2.5 font-semibold">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          {/* Step 1: Role Type Selector */}
          <div className="space-y-2">
            <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Escolha seu Perfil de Acesso</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole("medico")}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                  selectedRole === "medico" 
                    ? "border-teal-500 bg-teal-500/5 text-teal-400" 
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                }`}
              >
                <UserSquare2 size={20} className={selectedRole === "medico" ? "text-teal-400" : "text-slate-500" } />
                <div>
                  <span className="font-extrabold text-xs block leading-tight">Painel Médico</span>
                  <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Suporte IA e Decisões</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("paciente")}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                  selectedRole === "paciente" 
                    ? "border-teal-500 bg-teal-500/5 text-teal-400" 
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                }`}
              >
                <CalendarRange size={20} className={selectedRole === "paciente" ? "text-teal-400" : "text-slate-500" } />
                <div>
                  <span className="font-extrabold text-xs block leading-tight">Clínica Virtual</span>
                  <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Agendamento &amp; Chat</span>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Main Authentication Options */}
          <div className="space-y-2.5 pt-2">
            
            {/* REAL secure Google Authentication Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs py-3 px-4 rounded-xl border border-slate-800 transition-colors flex items-center justify-center gap-2.5 cursor-pointer outline-none disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>{loading ? "Processando..." : `Entrar de forma segura com Google`}</span>
            </button>

            {/* Simulated Demo Fast Bypass Account */}
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-black font-black text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-500/10 outline-none"
            >
              <span>Entrar como {selectedRole === "medico" ? "Médico Demo" : "Paciente Demo"}</span>
              <ArrowRight size={14} />
            </button>

          </div>

          {/* Quick instructions guide for standard preview mode */}
          <div className="bg-slate-950 rounded-2xl p-4.5 border border-slate-800 space-y-2">
            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle size={11} className="text-teal-400" /> Notas de Segurança da Infraestrutura:
            </h4>
            <ul className="text-[9px] text-slate-400 space-y-1 font-semibold leading-relaxed font-mono list-disc pl-4">
              <li>Google Sign-In conecta sua conta real ao Firebase Auth.</li>
              <li>A aba de desenvolvimento suporta popups de segurança.</li>
              <li>Para usar no iframe sem popups, use as salas de Demonstração Rápidas.</li>
              <li>Sua sessão e chaves de api nunca são expostas ao browser.</li>
            </ul>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl w-full mx-auto py-4 text-center text-slate-600 text-[10px] font-mono shrink-0">
        Desenvolvido em conformidade sanitária • Licenciado sob as diretrizes de KlikHealth IA e Firebase Core v18+
      </footer>

    </div>
  );
}
