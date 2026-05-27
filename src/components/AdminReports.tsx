import React, { useState } from "react";
import { 
  BarChart4, 
  CheckSquare, 
  Square, 
  Award, 
  Activity, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  FileText, 
  ThumbsUp, 
  RotateCcw,
  CheckCircle2, 
  Search,
  BookOpen
} from "lucide-react";

export default function AdminReports() {
  const [checklistItems, setChecklistItems] = useState([
    { id: "chk-1", category: "IAM / Síndrome Coronariana", text: "Registrar ECG de 12 derivações em menos de 10 minutos da chegada", checked: true },
    { id: "chk-2", category: "IAM / Síndrome Coronariana", text: "Iniciar dupla antiagregação plaquetária (AAS mastigável + Clopidogrel)", checked: true },
    { id: "chk-3", category: "IAM / Síndrome Coronariana", text: "Coletar Marcador Cardíaco (Troponina) e checar com o KlikHealth IA", checked: false },
    { id: "chk-4", category: "Enxaqueca Refratária", text: "Afastar sinais de alarme neurológicos secundários por escala Snout", checked: true },
    { id: "chk-5", category: "Enxaqueca Refratária", text: "Garantir hidratação volêmica primária de 250ml e repouso em sala escura", checked: false },
    { id: "chk-6", category: "Cetoacidose Diabética (CAD)", text: "Dose primária de Insulina Regular de resgate com controle de potássio", checked: true },
    { id: "chk-7", category: "Cetoacidose Diabética (CAD)", text: "Gasometria arterial de controle e dosagem seriada a cada 2 horas", checked: false }
  ]);

  const toggleCheck = (itemId: string) => {
    setChecklistItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, checked: !item.checked };
      }
      return item;
    }));
  };

  // Dynamic calculs
  const completedChecks = checklistItems.filter(c => c.checked).length;
  const protocolAdherence = Math.round((completedChecks / checklistItems.length) * 100);

  return (
    <div id="admin-reports-wrapper" className="space-y-6">
      
      {/* Upper header */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div className="space-y-0.5">
          <span className="text-[10px] text-blue-600 font-extrabold uppercase bg-blue-50 px-2 py-0.5 rounded">Qualidade e Desempenho</span>
          <h2 className="text-lg font-bold text-gray-900 leading-tight">Relatório de Desempenho Integrador Hospitalar</h2>
        </div>
        <span className="text-xs text-gray-400 font-mono font-bold uppercase tracking-wider">Métricas Auditoria 2026</span>
      </div>

      {/* Metric panels grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Adherence metrics wheel display */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col items-center text-center space-y-4">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Adesão a Protocolos e Segurança</span>
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Draw custom SVG Ring progress */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
              <circle 
                cx="50" 
                cy="50" 
                r="42" 
                stroke="#2563eb" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray={`${84 * 3.14159}`} 
                strokeDashoffset={`${84 * 3.14159 * (1 - protocolAdherence / 100)}`} 
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-gray-900">{protocolAdherence}%</span>
              <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Selo Ouro</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            Medido de acordo com a checagem ativa dos checklists de segurança integrados em tempo real na prática médica diária.
          </p>
        </div>

        {/* Audit chart stats */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Impacto da Redução de Carga Administrativa</span>

          <div id="chart-representation" className="space-y-3.5">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-600">Digitação de Alta Médica Manual (Fila)</span>
                <span className="text-red-600">8.5 min</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: "95%" }}></div>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-blue-700">Rascunho Evolutivo KlikHealth IA</span>
                <span className="text-emerald-600 font-bold">1.2 min (-85%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "15%" }}></div>
              </div>
            </div>

            <div className="space-y-1 text-xs sm:pt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-600">Tempo de Espera em Triage Pré-IA</span>
                <span className="text-gray-500">22.4 min</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-gray-400 h-2 rounded-full" style={{ width: "70%" }}></div>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-blue-700">Tempo Pós-Integração Triage IA</span>
                <span className="text-blue-600 font-bold">4.2 min</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "13%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Impact summary Card */}
        <div className="bg-slate-900 rounded-2xl p-5 text-white flex flex-col justify-between h-full">
          <div className="space-y-2">
            <span className="text-[10px] text-blue-400 font-extrabold uppercase bg-blue-500/10 px-2.5 py-1 rounded inline-block">Métricas de Satisfação</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-white">98.2%</span>
              <span className="text-[11px] text-emerald-400 font-extrabold font-mono">★ Excelência</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed font-semibold">
              Taxa de satisfação dos médicos sob a usabilidade do suporte KlikHealth IA para diminuir a exaustão burocrática e garantir diagnósticos rápidos.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[10px] text-gray-400 space-y-1.5 font-bold font-mono">
            <div className="flex justify-between">
              <span>Laudos Gerados IA:</span>
              <span className="text-slate-200">247 copiados</span>
            </div>
            <div className="flex justify-between">
              <span>Evidências Consultadas:</span>
              <span className="text-slate-200">1,245 termos</span>
            </div>
          </div>
        </div>

      </div>

      {/* Dynamic Safety Checklist Workspace ("dados em tempo real") */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-gray-50 pb-3">
          <div className="space-y-0.5">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
              <CheckSquare className="text-blue-500" size={16} /> Checklists de Segurança Ativos na Prática Hospitalar
            </h3>
            <span className="text-xs text-gray-400 block font-semibold leading-normal">Selecione para concluir condutas obrigatórias de segurança do paciente</span>
          </div>
          
          <button
            onClick={() => setChecklistItems(prev => prev.map(c => ({ ...c, checked: false })))}
            className="text-[10px] font-bold text-gray-500 hover:text-gray-700 flex items-center gap-1 shrink-0 outline-none"
          >
            <RotateCcw size={12} /> Resetar Checagens
          </button>
        </div>

        {/* Task lists divided by category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card Category 1 */}
          <div className="bg-slate-50 border border-gray-100 rounded-xl p-4 space-y-2.5">
            <h4 className="text-xs font-black text-red-700 tracking-wide uppercase border-b border-rose-100 pb-1 flex items-center gap-1">
              <Activity size={12} /> Cardiologia / Dor no Peito
            </h4>
            <div className="space-y-2">
              {checklistItems.filter(c => c.category === "IAM / Síndrome Coronariana").map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className="w-full text-left flex items-start gap-2.5 text-xs text-gray-700 font-semibold p-1 hover:bg-white/40 rounded transition-all outline-none"
                >
                  {item.checked ? (
                    <CheckSquare size={16} className="text-rose-500 shrink-0 mt-0.5" />
                  ) : (
                    <Square size={16} className="text-gray-300 shrink-0 mt-0.5" />
                  )}
                  <span className={item.checked ? "line-through text-gray-400" : ""}>{item.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Card Category 2 */}
          <div className="bg-slate-50 border border-gray-100 rounded-xl p-4 space-y-2.5">
            <h4 className="text-xs font-black text-amber-700 tracking-wide uppercase border-b border-amber-100 pb-1 flex items-center gap-1">
              <BookOpen size={12} /> Cefaleias & Crises Agudas
            </h4>
            <div className="space-y-2">
              {checklistItems.filter(c => c.category === "Enxaqueca Refratária" || c.category === "Cetoacidose Diabética (CAD)").map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className="w-full text-left flex items-start gap-2.5 text-xs text-gray-700 font-semibold p-1 hover:bg-white/40 rounded transition-all outline-none"
                >
                  {item.checked ? (
                    <CheckSquare size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <Square size={16} className="text-gray-300 shrink-0 mt-0.5" />
                  )}
                  <span className={item.checked ? "line-through text-gray-400 relative" : ""}>{item.text}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
