import React from "react";
import { 
  Check, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  CalendarRange, 
  Clock, 
  CreditCard,
  Award,
  Lock,
  Zap,
  CheckCircle2
} from "lucide-react";

interface PlanosPrecoProps {
  currentPlan: "gratis" | "premium";
  onSelectPlan: (plan: "gratis" | "premium") => void;
  aiQueryCount: number;
}

export default function PlanosPreco({ currentPlan, onSelectPlan, aiQueryCount }: PlanosPrecoProps) {
  
  const playUpgradeSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.setValueAtTime(554.37, now + 0.1); // C#5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25); // A5
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {
      console.warn("Failed to play upgrade audio:", e);
    }
  };

  const handlePlanChange = (plan: "gratis" | "premium") => {
    onSelectPlan(plan);
    if (plan === "premium") {
      playUpgradeSound();
    }
  };

  return (
    <div id="pricing-plans-section" className="space-y-6">
      
      {/* Upper header aligned with GestHuman UI guidelines */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-5 gap-3">
        <div className="space-y-1">
          <span className="text-[10px] text-indigo-700 font-extrabold uppercase bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/50">
            Faturamento &amp; Tarifação
          </span>
          <h2 className="text-xl font-black text-slate-800 leading-tight">Planos e Limites de Serviço KlikHealth</h2>
          <p className="text-xs text-slate-400 font-medium">
            Gerencie e escolha as restrições operacionais do seu ambiente clínico e teletriagem em tempo real.
          </p>
        </div>

        {/* Dynamic Indicator Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold">Plano Ativo no Momento:</span>
          {currentPlan === "gratis" ? (
            <span className="px-3 py-1.5 bg-slate-100 text-slate-650 border border-slate-200 rounded-full font-black text-[11px] uppercase flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse"></span>
              Básico Gratuito
            </span>
          ) : (
            <span className="px-3 py-1.5 bg-indigo-50 text-[#1c1a5e] border border-indigo-200 rounded-full font-black text-[11px] uppercase flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
              Médico Premium ★
            </span>
          )}
        </div>
      </div>

      {/* Warning/Info Box about limits */}
      {currentPlan === "gratis" ? (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3.5 text-xs text-amber-900 leading-relaxed shadow-xs">
          <Lock className="text-amber-600 shrink-0 mt-0.5" size={18} />
          <div>
            <strong className="font-extrabold block mb-0.5">Seu sistema de saúde está operando no Modo Limitado (Grátis):</strong>
            No momento, seu CRM possui restrições ativas. Recursos avançados como auditoria clínica de conformidade estão desabilitados e os prontuários ativos e consultas de IA estão sob cotas restritas. Faça o upgrade abaixo para desbloquear o KlikHealth profissional.
          </div>
        </div>
      ) : (
        <div className="bg-teal-50/50 border border-teal-200/60 rounded-2xl p-4 flex items-start gap-3.5 text-xs text-teal-900 leading-relaxed shadow-xs">
          <CheckCircle2 className="text-teal-600 shrink-0 mt-0.5" size={18} />
          <div>
            <strong className="font-extrabold block mb-0.5">Parabéns! Plano Médico Premium Ilimitado Ativo:</strong>
            Todas as barreiras operacionais foram inteiramente eliminadas. Você pode gerenciar todos os pacientes na triagem de Manchester, efetuar chamadas ilimitadas ao suporte de IA do Gemini e auditar conformidade Gethuman livremente.
          </div>
        </div>
      )}

      {/* Pricing Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pt-4">
        
        {/* PLANO GRATUITO */}
        <div className={`bg-white rounded-3xl border p-6 flex flex-col justify-between transition-all relative ${
          currentPlan === "gratis" 
            ? "ring-4 ring-slate-100 border-slate-350 shadow-md" 
            : "border-slate-200 hover:border-slate-300 shadow-xs"
        }`}>
          {currentPlan === "gratis" && (
            <span className="absolute -top-3 right-6 bg-slate-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded-md tracking-wider">
              Ativo
            </span>
          )}
          
          <div className="space-y-5">
            <div>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase font-mono tracking-widest block mb-1">Entrada / Estudantes</span>
              <h3 className="text-lg font-black text-slate-800">Plano Clínico Básico</h3>
              <p className="text-xs text-slate-450 font-semibold mt-1">Acesso inicial limitado para testes experimentais.</p>
            </div>

            <div className="py-2.5">
              <span className="text-3xl font-black text-slate-800">Grátis</span>
              <span className="text-xs text-slate-400 font-bold"> / uso vitalício</span>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-3.5 pt-1">
              <div className="flex items-start gap-2.5 text-xs">
                <span className="p-0.5 bg-slate-100 text-slate-500 rounded mt-0.5 shrink-0">
                  <Check size={12} />
                </span>
                <div>
                  <span className="text-slate-700 font-bold block">Primeiros 2 Prontuários Médicos</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Apenas os pacientes PAT-001 e PAT-002 estarão acessíveis.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs">
                <span className="p-0.5 bg-slate-100 text-slate-500 rounded mt-0.5 shrink-0">
                  <Check size={12} />
                </span>
                <div>
                  <span className="text-slate-700 font-bold block">Suporte Limitado de Decisão IA</span>
                  <span className="text-[10px] text-slate-400 font-semibold mb-1 block">Máximo de 2 perguntas clínicas para diagnóstico辅助 por sessão.</span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded font-mono bg-amber-50 text-amber-700 border border-amber-100 inline-block">
                    Uso nesta sessão: {aiQueryCount} / 2 perguntas
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs">
                <span className="p-0.5 bg-red-50 text-red-500 rounded mt-0.5 shrink-0">
                  <X size={12} />
                </span>
                <div>
                  <span className="text-slate-400 font-bold line-through block">Métricas de Desempenho &amp; Auditoria</span>
                  <span className="text-[10px] text-red-400 font-semibold">Sinalizadores de segurança e protocolos clínicos Gethuman bloqueados.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs">
                <span className="p-0.5 bg-slate-100 text-slate-500 rounded mt-0.5 shrink-0">
                  <Check size={12} />
                </span>
                <div>
                  <span className="text-slate-700 font-bold block">1 Agendamento Clínica Virtual</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Os pacientes podem testar a teletriagem com limites de agendamento por vez.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              disabled={currentPlan === "gratis"}
              onClick={() => handlePlanChange("gratis")}
              className={`w-full py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer outline-none border ${
                currentPlan === "gratis" 
                  ? "bg-slate-100/50 text-slate-400 border-slate-200 cursor-not-allowed" 
                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-250"
              }`}
            >
              {currentPlan === "gratis" ? "Plano Atual Selecionado" : "Rebaixar para Plano Grátis"}
            </button>
          </div>
        </div>

        {/* PLANO MÉDICO PREMIUM */}
        <div className={`bg-white rounded-3xl border p-6 flex flex-col justify-between transition-all relative overflow-hidden ${
          currentPlan === "premium" 
            ? "ring-4 ring-indigo-50 border-indigo-400 shadow-md" 
            : "border-slate-200 hover:border-slate-300 shadow-xs"
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 text-indigo-100 rounded-full filter blur-xl transform translate-x-12 -translate-y-12 shrink-0"></div>
          
          {currentPlan === "premium" && (
            <span className="absolute -top-3 right-6 bg-indigo-700 text-teal-400 text-[9px] font-black uppercase px-2 py-1 rounded-md tracking-wider">
              Pronto Uso
            </span>
          )}
          
          <div className="space-y-5 relative z-10">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] text-indigo-700 font-black uppercase font-mono tracking-widest block">Profissional Clínico</span>
                <span className="px-1.5 py-0.5 bg-[#1c1a5e] text-teal-400 font-extrabold rounded text-[8px] uppercase tracking-wider">Recomendado</span>
              </div>
              <h3 className="text-lg font-black text-slate-800">Plano Médico Premium ★</h3>
              <p className="text-xs text-slate-450 font-semibold mt-1">Liberação completa sem limites para CRM e Teletriagem.</p>
            </div>

            <div className="py-2.5">
              <span className="text-3xl font-black text-[#1c1a5e]">R$ 199</span>
              <span className="text-xs text-slate-400 font-bold"> / mensal</span>
            </div>

            <hr className="border-indigo-100" />

            <div className="space-y-3.5 pt-1">
              <div className="flex items-start gap-2.5 text-xs">
                <span className="p-0.5 bg-emerald-50 text-emerald-600 rounded mt-0.5 shrink-0">
                  <Check size={12} />
                </span>
                <div>
                  <span className="text-[#1c1a5e] font-extrabold block">Todos os Prontuários Hospitalares Ilimitados</span>
                  <span className="text-[10px] text-slate-500 font-semibold">Acesse e avalie todos os pacientes na triagem de Manchester imediatamente.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs">
                <span className="p-0.5 bg-emerald-50 text-emerald-600 rounded mt-0.5 shrink-0">
                  <Check size={12} />
                </span>
                <div>
                  <span className="text-[#1c1a5e] font-extrabold block">Suporte de IA Ilimitado (Gemini Pro)</span>
                  <span className="text-[10px] text-slate-500 font-semibold">Consultas, resumos de alta, laudos e auxílio clínico de IA infinitos.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs">
                <span className="p-0.5 bg-emerald-50 text-emerald-600 rounded mt-0.5 shrink-0">
                  <Check size={12} />
                </span>
                <div>
                  <span className="text-[#1c1a5e] font-extrabold block">Acesso total à Auditoria e Segurança</span>
                  <span className="text-[10px] text-slate-500 font-semibold">Checklists integrados de conduta de conformidade Gethuman, ECG e diretrizes do SUS.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs">
                <span className="p-0.5 bg-emerald-50 text-emerald-600 rounded mt-0.5 shrink-0">
                  <Check size={12} />
                </span>
                <div>
                  <span className="text-[#1c1a5e] font-extrabold block">Teletriagem do Paciente Ilimitada</span>
                  <span className="text-[10px] text-slate-500 font-semibold">Agendamentos dinâmicos sem limites com chamadas de suporte.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              onClick={() => handlePlanChange("premium")}
              className={`w-full py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer outline-none flex items-center justify-center gap-1.5 ${
                currentPlan === "premium" 
                  ? "bg-indigo-50 text-[#1c1a5e] border border-indigo-200" 
                  : "bg-[#1c1a5e] hover:bg-[#201d6d] text-white border border-transparent shadow-md shadow-indigo-650/10 text-glow"
              }`}
            >
              <Zap size={12} className={currentPlan === "premium" ? "text-[#1c1a5e]" : "text-teal-400"} />
              {currentPlan === "premium" ? "Assinatura Ativa Premium" : "Fazer Upgrade para Premium"}
            </button>
          </div>
        </div>

      </div>

      {/* Feature matrix / pricing table notes */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 mt-6 select-none max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-700">
          <Award size={15} className="text-[#1c1a5e]" />
          <span>Fidelidade e Segurança KlikHealth</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
          Nossa infraestrutura armazena seus dados em conformidade direta com a Lei Geral de Proteção de Dados (LGPD). Os custos com API nos planos premium cobrem o processamento via rede neural dedicada para maior acurácia diagnóstica, reduzindo o tempo médio de alta médica em até 38% e salvaguardando erros de medicação.
        </p>
      </div>

    </div>
  );
}
