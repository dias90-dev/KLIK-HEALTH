import React, { useState, useEffect } from "react";
import { Patient, Vitals } from "../types";
import { 
  Sparkles, 
  Activity, 
  Search, 
  Brain, 
  FileText, 
  ChevronRight, 
  Copy, 
  Check, 
  AlertTriangle, 
  RefreshCw, 
  HelpCircle, 
  Lock,
  Bookmark,
  Thermometer,
  Heart,
  Droplets,
  BookOpen,
  History,
  ChevronDown,
  ChevronUp,
  Trash2
} from "lucide-react";

interface AIClinicalAssistantProps {
  patient: Patient;
  onUpdatePatientVitals: (patientId: string, vitals: Vitals) => void;
  hasAiKey: boolean;
  currentPlan: "gratis" | "premium";
  aiQueryCount: number;
  onIncrementAiQuery: () => void;
  onNavigateToPlans: () => void;
}

export default function AIClinicalAssistant({
  patient,
  onUpdatePatientVitals,
  hasAiKey,
  currentPlan,
  aiQueryCount,
  onIncrementAiQuery,
  onNavigateToPlans
}: AIClinicalAssistantProps) {
  const [activeTask, setActiveTask] = useState<"triage" | "diagnosis" | "evidence" | "admin_summary" | "prescription">("triage");
  const [loading, setLoading] = useState(false);

  // Session History state for previously generated suggestions
  const [suggestionsHistory, setSuggestionsHistory] = useState<{
    id: string;
    patientId: string;
    task: "triage" | "diagnosis" | "evidence" | "admin_summary" | "prescription";
    timestamp: string;
    data: any;
    customQuery?: string;
  }[]>([]);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  
  // Real-time vital form states for live decision testing ("dados em tempo real")
  const [temp, setTemp] = useState(patient.currentVitals.temperature);
  const [bpSystolic, setBpSystolic] = useState(patient.currentVitals.bpSystolic);
  const [bpDiastolic, setBpDiastolic] = useState(patient.currentVitals.bpDiastolic);
  const [hr, setHr] = useState(patient.currentVitals.heartRate);
  const [rr, setRr] = useState(patient.currentVitals.respRate);
  const [spo2, setSpo2] = useState(patient.currentVitals.spo2);

  const [customEvidenceQuery, setCustomEvidenceQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Response storage
  const [triageResponse, setTriageResponse] = useState<any>(null);
  const [diagnosisResponse, setDiagnosisResponse] = useState<any>(null);
  const [evidenceResponse, setEvidenceResponse] = useState<any>(null);
  const [adminResponse, setAdminResponse] = useState<any>(null);
  const [prescriptionResponse, setPrescriptionResponse] = useState<any>(null);

  // Re-sync local form states when active patient switches
  useEffect(() => {
    setTemp(patient.currentVitals.temperature);
    setBpSystolic(patient.currentVitals.bpSystolic);
    setBpDiastolic(patient.currentVitals.bpDiastolic);
    setHr(patient.currentVitals.heartRate);
    setRr(patient.currentVitals.respRate);
    setSpo2(patient.currentVitals.spo2);
    
    // Clear responses for new patient to prevent stale data
    setTriageResponse(null);
    setDiagnosisResponse(null);
    setEvidenceResponse(null);
    setAdminResponse(null);
    setPrescriptionResponse(null);
    setErrorStatus(null);
  }, [patient]);

  const handleUpdateVitalsLocal = () => {
    const updatedVitals: Vitals = {
      temperature: Number(temp),
      bpSystolic: Number(bpSystolic),
      bpDiastolic: Number(bpDiastolic),
      heartRate: Number(hr),
      respRate: Number(rr),
      spo2: Number(spo2)
    };
    onUpdatePatientVitals(patient.id, updatedVitals);
  };

  const handleQueryAI = async () => {
    if (currentPlan === "gratis" && aiQueryCount >= 2) {
      setErrorStatus("Limite do Plano Gratuito atingido (máximo 2 consultas de IA por sessão). Por favor, ative o Plano Premium Médico.");
      return;
    }

    setLoading(true);
    setErrorStatus(null);
    setCopied(false);

    // Sync vital signs form to global memory first so the API takes the latest user-input values
    handleUpdateVitalsLocal();

    const currentLocalVitals: Vitals = {
      temperature: Number(temp),
      bpSystolic: Number(bpSystolic),
      bpDiastolic: Number(bpDiastolic),
      heartRate: Number(hr),
      respRate: Number(rr),
      spo2: Number(spo2)
    };

    const patientSnapshot = {
      ...patient,
      currentVitals: currentLocalVitals
    };

    try {
      const response = await fetch("/api/clinical-decision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          task: activeTask,
          patient: patientSnapshot,
          customQuery: customEvidenceQuery
        })
      });

      if (!response.ok) {
        throw new Error("Erro do servidor na requisição clínica.");
      }

      const resData = await response.json();
      onIncrementAiQuery();

      if (resData && resData.data) {
        setSuggestionsHistory((prev) => [
          {
            id: `SUG-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            patientId: patient.id,
            task: activeTask,
            timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            data: resData.data,
            customQuery: activeTask === "evidence" ? customEvidenceQuery : undefined
          },
          ...prev
        ]);
      }
      
      switch (activeTask) {
        case "triage":
          setTriageResponse(resData.data);
          break;
        case "diagnosis":
          setDiagnosisResponse(resData.data);
          break;
        case "evidence":
          setEvidenceResponse(resData.data);
          break;
        case "admin_summary":
          setAdminResponse(resData.data);
          break;
        case "prescription":
          setPrescriptionResponse(resData.data);
          break;
      }
    } catch (e: any) {
      console.error(e);
      setErrorStatus("Não foi possível gerar dados clínicos da IA. Por favor, tente novamente ou verifique as configurações.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTriageColorBg = (color?: string) => {
    switch (color?.toLowerCase()) {
      case "red": return "bg-red-500 text-white";
      case "orange": return "bg-orange-500 text-white";
      case "yellow": return "bg-yellow-400 text-gray-900";
      case "green": return "bg-green-500 text-white";
      case "blue": return "bg-blue-500 text-white";
      default: return "bg-gray-200 text-gray-700";
    }
  };

  const getTaskLabel = (task: string) => {
    switch (task) {
      case "triage": return "Triagem de Gravidade";
      case "diagnosis": return "Hipóteses Diagnósticas";
      case "evidence": return "Evidências e Conduta";
      case "admin_summary": return "Redução Administrativa";
      case "prescription": return "Receita Digital";
      default: return task;
    }
  };

  const handleRestoreSuggestion = (sug: any) => {
    setActiveTask(sug.task);
    switch (sug.task) {
      case "triage":
        setTriageResponse(sug.data);
        break;
      case "diagnosis":
        setDiagnosisResponse(sug.data);
        break;
      case "evidence":
        setEvidenceResponse(sug.data);
        if (sug.customQuery) {
          setCustomEvidenceQuery(sug.customQuery);
        }
        break;
      case "admin_summary":
        setAdminResponse(sug.data);
        break;
      case "prescription":
        setPrescriptionResponse(sug.data);
        break;
    }
  };

  return (
    <div id="ai-assistant-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT COLUMN: Real-Time Patient Information & Live Alterable Vitals Form ("dados em tempo real") */}
      <div className="lg:col-span-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-5 h-fit">
        <div>
          <span className="text-[10px] text-teal-400 font-extrabold uppercase bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded">Prontuário de Referência</span>
          <div className="flex items-center gap-3 mt-3">
            <img
              src={patient.avatar}
              alt={patient.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl object-cover border border-slate-800"
            />
            <div>
              <h3 className="font-bold text-white text-sm">{patient.name}</h3>
              <p className="text-xs text-slate-400 font-medium">{patient.age} anos • {patient.gender}</p>
            </div>
          </div>
        </div>
 
        {/* Live Vitals Editor Widget to support active simulation changes */}
        <div className="border-t border-slate-800 pt-4 space-y-3 bg-slate-950/40 p-3.5 rounded-xl border border-dashed border-slate-800">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <Activity size={12} className="text-teal-400" /> SINAIS VITAIS EM REAL-TIME
            </span>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-bold px-1.5 py-0.5 rounded">Interativo</span>
          </div>
 
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase">Temperatura (°C)</label>
              <input
                type="number"
                step="0.1"
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full border border-slate-800 rounded-lg p-1.5 mt-0.5 focus:outline-none focus:border-teal-500 bg-slate-950 font-semibold text-slate-200"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase">Freq. Cardíaca (bpm)</label>
              <input
                type="number"
                value={hr}
                onChange={(e) => setHr(Number(e.target.value))}
                className="w-full border border-slate-800 rounded-lg p-1.5 mt-0.5 focus:outline-none focus:border-teal-500 bg-slate-950 font-semibold text-slate-200"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase">Pressão Sistólica</label>
              <input
                type="number"
                value={bpSystolic}
                onChange={(e) => setBpSystolic(Number(e.target.value))}
                className="w-full border border-slate-800 rounded-lg p-1.5 mt-0.5 focus:outline-none focus:border-teal-500 bg-slate-950 font-semibold text-slate-200"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase">Pressão Diastólica</label>
              <input
                type="number"
                value={bpDiastolic}
                onChange={(e) => setBpDiastolic(Number(e.target.value))}
                className="w-full border border-slate-800 rounded-lg p-1.5 mt-0.5 focus:outline-none focus:border-teal-500 bg-slate-950 font-semibold text-slate-200"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase">Freq. Resp (irpm)</label>
              <input
                type="number"
                value={rr}
                onChange={(e) => setRr(Number(e.target.value))}
                className="w-full border border-slate-800 rounded-lg p-1.5 mt-0.5 focus:outline-none focus:border-teal-500 bg-slate-950 font-semibold text-slate-200"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase">Saturação SpO2 (%)</label>
              <input
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(Number(e.target.value))}
                className="w-full border border-slate-800 rounded-lg p-1.5 mt-0.5 focus:outline-none focus:border-teal-500 bg-slate-950 font-semibold text-slate-200"
              />
            </div>
          </div>
          <button
            onClick={handleUpdateVitalsLocal}
            className="w-full bg-slate-800 hover:bg-slate-750 transition-colors text-slate-200 text-[10px] font-extrabold py-1.5 rounded-lg uppercase tracking-wider cursor-pointer border border-slate-700"
          >
            Sincronizar Parâmetros Clínicos
          </button>
        </div>
 
        {/* Past Profile Allergies & Meds */}
        <div className="border-t border-slate-800 pt-4 space-y-3 font-semibold text-xs animate-fade-in">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Alergias Documentadas</span>
            <div className="flex flex-wrap gap-1">
              {patient.allergies.length === 0 ? (
                <span className="text-slate-500">Nenhuma alergia relatada</span>
              ) : (
                patient.allergies.map((alg, i) => (
                  <span key={i} className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                    {alg}
                  </span>
                ))
              )}
            </div>
          </div>
 
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Medicamentos de Uso Contínuo</span>
            <ul className="space-y-1 text-[11px] text-slate-300 font-medium animate-fade-in">
              {patient.currentMedications.length === 0 ? (
                <li className="text-slate-550">Nenhum medicamento listado</li>
              ) : (
                patient.currentMedications.map((med, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full shrink-0"></span>
                    <span>{med}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
 
        {/* Admitting complaint */}
        <div className="border-t border-slate-800 pt-4 text-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Motivo de Entrada Hospitalar</span>
          <p className="text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-medium">{patient.admissionReason}</p>
        </div>
 
      </div>
 
      {/* RIGHT COLUMN: AI Tasks & Response Area */}
      <div className="lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-md flex flex-col min-h-[500px]">
        
        {/* Task Selection Header Tabs */}
        <div className="grid grid-cols-5 border-b border-slate-800 shrink-0 bg-slate-950/40 rounded-t-2xl overflow-hidden p-1 gap-1">
          <button
            onClick={() => setActiveTask("triage")}
            className={`py-3 px-1 text-[11px] font-bold rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer outline-none transition-all ${activeTask === "triage" ? "bg-slate-800 text-teal-400 border border-teal-500/20 shadow-md" : "text-slate-450 hover:text-white"}`}
          >
            <Activity size={14} />
            <span className="text-center sm:text-left font-extrabold hidden lg:inline">1. Triagem Ágil</span>
            <span className="text-center sm:text-left font-extrabold lg:hidden">1. Triagem</span>
          </button>
          
          <button
            onClick={() => setActiveTask("diagnosis")}
            className={`py-3 px-1 text-[11px] font-bold rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer outline-none transition-all ${activeTask === "diagnosis" ? "bg-slate-800 text-teal-400 border border-teal-500/20 shadow-md" : "text-slate-450 hover:text-white"}`}
          >
            <Brain size={14} />
            <span className="text-center sm:text-left font-extrabold hidden lg:inline">2. Diagnóstico</span>
            <span className="text-center sm:text-left font-extrabold lg:hidden">2. Diag</span>
          </button>
          
          <button
            onClick={() => setActiveTask("evidence")}
            className={`py-3 px-1 text-[11px] font-bold rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer outline-none transition-all ${activeTask === "evidence" ? "bg-slate-800 text-teal-400 border border-teal-500/20 shadow-md" : "text-slate-450 hover:text-white"}`}
          >
            <BookOpen size={14} />
            <span className="text-center sm:text-left font-extrabold hidden lg:inline">3. Evidências</span>
            <span className="text-center sm:text-left font-extrabold lg:hidden">3. Busca</span>
          </button>
          
          <button
            onClick={() => setActiveTask("admin_summary")}
            className={`py-3 px-1 text-[11px] font-bold rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer outline-none transition-all ${activeTask === "admin_summary" ? "bg-slate-800 text-teal-400 border border-teal-500/20 shadow-md" : "text-slate-450 hover:text-white"}`}
          >
            <FileText size={14} />
            <span className="text-center sm:text-left font-extrabold hidden lg:inline">4. Desburocratizar</span>
            <span className="text-center sm:text-left font-extrabold lg:hidden">4. Doc</span>
          </button>
          
          <button
            onClick={() => setActiveTask("prescription")}
            className={`py-3 px-1 text-[11px] font-bold rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer outline-none transition-all ${activeTask === "prescription" ? "bg-slate-800 text-teal-400 border border-teal-500/20 shadow-md" : "text-slate-450 hover:text-white"}`}
          >
            <Copy size={14} />
            <span className="text-center sm:text-left font-extrabold hidden lg:inline">5. Receita Digital</span>
            <span className="text-center sm:text-left font-extrabold lg:hidden">5. Receita</span>
          </button>
        </div>

        {/* Task Specific Context Inputs */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold">
          
          <div className="flex-1 w-full">
            {activeTask === "triage" && (
              <p className="text-slate-400">
                Análise automática de gravidade baseado em score clínico (Manchester). Processa idade, queixa principal e sinais vitais atualizados.
              </p>
            )}
            {activeTask === "diagnosis" && (
              <p className="text-slate-400">
                Geração de hipóteses diagnósticas diferenciais estruturadas, probabilidades, exames recomendados e plano conduta inicial baseado em diretrizes.
              </p>
            )}
            {activeTask === "evidence" && (
              <div className="space-y-1.5 w-full">
                <label className="text-[10px] text-slate-450 font-bold block uppercase">O que você gostaria de pesquisar sobre o caso (Ex: Interações de medicamentos, diretrizes)?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Triptanos contraindicados com ergotamínicos? Dose máxima e bloqueios?"
                    value={customEvidenceQuery}
                    onChange={(e) => setCustomEvidenceQuery(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-800 rounded-lg outline-none bg-slate-950 text-white placeholder-slate-500 font-medium focus:border-teal-500"
                  />
                </div>
              </div>
            )}
            {activeTask === "admin_summary" && (
              <p className="text-slate-400">
                Redutor de Carga Administrativa: Rascunho inteligente para prontuário eletrônico de evolução ou alta médica rápida. Copie em um clique.
              </p>
            )}
            {activeTask === "prescription" && (
              <p className="text-slate-400">
                Geração de Receituário Clínico Seguro com integração para Assinatura Eletrônica Premium e validação.
              </p>
            )}
          </div>

          {currentPlan === "gratis" && aiQueryCount >= 2 ? (
            <button
              onClick={onNavigateToPlans}
              className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white transition-colors font-extrabold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shrink-0 self-center outline-none shadow-lg shadow-orange-500/20"
            >
              <Lock size={14} className="text-amber-200" />
              <span>Ver Planos / Upgrade Premium</span>
            </button>
          ) : (
            <div className="flex flex-col items-end gap-1 shrink-0 w-full md:w-auto">
              <button
                onClick={handleQueryAI}
                disabled={loading}
                className="w-full md:w-auto bg-teal-500 hover:bg-teal-600 text-black disabled:bg-slate-800 disabled:text-slate-500 transition-colors font-extrabold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shrink-0 self-center outline-none shadow-md shadow-teal-500/10"
              >
                {loading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                {loading ? "Processando..." : "Consultar KlikHealth IA"}
              </button>
              {currentPlan === "gratis" && (
                <span className="text-[10px] text-slate-500 font-mono tracking-tight text-right w-full block mt-1 select-none">
                  Cota: {aiQueryCount}/2 consultas nesta sessão
                </span>
              )}
            </div>
          )}

        </div>

        {/* AI Output Window */}
        <div id="ai-response-viewport" className="flex-1 p-6 overflow-y-auto bg-slate-900/35">
          {errorStatus && (
            <div id="ai-error-banner" className="bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl p-4 text-xs font-semibold flex items-center gap-2.5">
              <AlertTriangle className="text-red-400" size={18} />
              <span>{errorStatus}</span>
            </div>
          )}

          {currentPlan === "gratis" && aiQueryCount >= 2 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 space-y-5 max-w-lg mx-auto animate-fade-in">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500">
                <Lock size={32} className="text-amber-550 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-black text-slate-100">Limite do Plano Básico Atingido</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Seu CRM experimental atingiu o limite de suporte de decisão clínica na modalidade gratuita (máximo 2 consultas por sessão). 
                  Para fazer perguntas diagnósticas, obter triagens rápidas e receber pareceres de IA ilimitados, migre agora para o Plano Premium.
                </p>
              </div>
              <button
                onClick={onNavigateToPlans}
                className="bg-[#1c1a5e] hover:bg-[#201d6d] text-teal-400 border border-teal-500/20 font-black text-xs px-6 py-3 rounded-2xl transition-all cursor-pointer shadow-md select-none animate-pulse"
              >
                Ativar Plano Médico Premium ★
              </button>
            </div>
          ) : loading ? (
            <div id="ai-loading-state" className="flex flex-col items-center justify-center py-16 text-xs text-slate-400 space-y-3 font-semibold">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-slate-850 border-t-teal-500 animate-spin"></div>
                <Sparkles size={18} className="absolute inset-0 m-auto text-teal-400 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-slate-300 font-bold">IA analisando dados clínicos em tempo real...</p>
                <p className="text-[10px] mt-1 text-slate-500">Verificando evidências científicas e cruzando medicamentos...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Task 1: Triage Output Render */}
              {activeTask === "triage" && (
                <div className="space-y-5">
                  {!triageResponse ? (
                    <div className="text-center py-12 text-slate-500">
                      <Activity className="mx-auto mb-3 opacity-40 text-teal-400 animate-pulse" size={40} />
                      <p className="font-semibold text-sm text-slate-300">Pronto para Triagem de Protocolo Manchester</p>
                      <p className="text-xs mt-1 text-slate-500">Clique no botão para classificar o risco de entrada deste paciente.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      
                      {/* Priority Hero Area */}
                      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Classificação de Risco IA</span>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-black text-white tracking-tight">Paciente Triado Como:</h2>
                            <div className={`px-4 py-1.5 rounded-full font-black text-xs uppercase ${getTriageColorBg(triageResponse.cor)}`}>
                              {triageResponse.prioridade}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/25 font-extrabold px-3 py-1.5 rounded">
                          Selo de Segurança KlikHealth
                        </span>
                      </div>

                      {/* Scientific Justification */}
                      <div className="space-y-1.5 text-xs">
                        <h4 className="font-bold text-slate-300 flex items-center gap-1.5"><ChevronRight size={14} className="text-teal-400" /> Justificativa Clínica Baseada em Evidências</h4>
                        <p className="text-slate-300 leading-relaxed bg-teal-950/40 p-3.5 rounded-xl border border-teal-500/15 font-medium">
                          {triageResponse.justificativa}
                        </p>
                      </div>

                      {/* Warnings and Actions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <div className="space-y-2 border border-red-950/40 rounded-xl p-4 bg-red-950/15">
                          <h4 className="text-xs font-bold text-red-400 flex items-center gap-1">
                            <AlertTriangle size={14} className="text-red-450" /> Sinais de Alerta Críticos
                          </h4>
                          <ul className="space-y-1.5 text-xs font-semibold text-slate-350 list-disc pl-4 leading-relaxed">
                            {triageResponse.sinais_alerta?.map((alert: string, i: number) => (
                              <li key={i}>{alert}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2 border border-teal-950/40 rounded-xl p-4 bg-teal-950/15">
                          <h4 className="text-xs font-bold text-teal-400 flex items-center gap-1">
                            <Activity size={14} className="text-teal-450" /> Conduta e Ações Imediatas
                          </h4>
                          <ol className="space-y-1.5 text-xs font-semibold text-slate-350 list-decimal pl-4 leading-relaxed">
                            {triageResponse.acoes_imediatas?.map((act: string, i: number) => (
                              <li key={i}>{act}</li>
                            ))}
                          </ol>
                        </div>

                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* Task 2: Diagnosis Output Render */}
              {activeTask === "diagnosis" && (
                <div className="space-y-5">
                  {!diagnosisResponse ? (
                    <div className="text-center py-12 text-slate-500">
                      <Brain className="mx-auto mb-3 opacity-40 text-teal-400 animate-pulse" size={40} />
                      <p className="font-semibold text-sm text-slate-300">Geração de Hipóteses Diferenciais</p>
                      <p className="text-xs mt-1 text-slate-550">Raciocínio clínico automatizado para cruzar queixas, dados de admissão e vitais em tempo real.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <h4 className="text-xs font-extrabold text-slate-400 tracking-wider block uppercase">Matriz de Hipóteses e Evidências Sugeridas</h4>
                      
                      {diagnosisResponse.diagnosticos?.map((diag: any, i: number) => (
                        <div key={i} className="border border-slate-800 rounded-xl p-4 shadow-sm space-y-3 transition-colors hover:border-slate-750 bg-slate-950/30">
                          
                          {/* Heading & Probability Bar */}
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/25 flex items-center justify-center font-bold text-xs">{i + 1}</span>
                              <h3 className="font-extrabold text-white text-sm">{diag.doenca}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-teal-400">Probabilidade: {diag.probabilidade}</span>
                              <div className="w-24 bg-slate-900 rounded-full h-2">
                                <div 
                                  className="bg-teal-500 h-2 rounded-full" 
                                  style={{ width: diag.probabilidade }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          {/* Detail rationale */}
                          <div className="text-xs space-y-1.5">
                            <strong className="text-slate-450 uppercase text-[9px] font-bold block animate-pulse">Fundamento Clínico Baseado em Evidências Fisiológicas</strong>
                            <p className="text-slate-300 font-medium leading-relaxed">{diag.evidencia}</p>
                          </div>

                          {/* Grid actions */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1.5 border-t border-slate-800">
                            <div>
                              <strong className="text-slate-400 font-bold block mb-1">🔍 Exames Confirmadores:</strong>
                              <ul className="list-disc pl-4 space-y-0.5 text-slate-350 font-medium">
                                {diag.exames?.map((ex: string, k: number) => <li key={k}>{ex}</li>)}
                              </ul>
                            </div>
                            <div>
                              <strong className="text-slate-400 font-bold block mb-1">💊 Conduta e Terapêutica de Entrada:</strong>
                              <p className="text-slate-300 font-semibold bg-slate-950 p-2 rounded border border-slate-800/80 leading-snug">{diag.conduta_inicial}</p>
                            </div>
                          </div>

                        </div>
                      ))}

                    </div>
                  )}
                </div>
              )}

              {/* Task 3: Evidence Output Render */}
              {activeTask === "evidence" && (
                <div className="space-y-5">
                  {!evidenceResponse ? (
                    <div className="text-center py-12 text-slate-500">
                      <BookOpen className="mx-auto mb-3 opacity-40 text-teal-400 animate-pulse" size={40} />
                      <p className="font-semibold text-sm text-slate-300">Biblioteca de Buscas e Compatibilidade de Drogas</p>
                      <p className="text-xs mt-1 text-slate-550 font-medium">Busque acima diretrizes de sociedades médicas, doses ou alertas de segurança do paciente para este caso.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-500 font-bold uppercase block">Pesquisa Efetuada</span>
                          <strong className="text-white text-xs font-bold">"{evidenceResponse.pergunta}"</strong>
                        </div>
                        <BookmarksWidget textToSave={evidenceResponse.evidencia_cientifica} />
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-300">
                        <h4 className="font-bold uppercase text-slate-450 text-[10px] tracking-wider">Metodologia e Parecer Clínico Gerado</h4>
                        <div className="bg-teal-950/20 border border-teal-900/40 p-4 rounded-xl leading-relaxed whitespace-pre-wrap font-medium">
                          {evidenceResponse.evidencia_cientifica}
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <strong className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Garantia Clínico-Científica (Referências Bibliográficas)</strong>
                        <ul className="list-disc pl-5 space-y-1 text-slate-500 font-semibold font-mono text-[10px]">
                           {evidenceResponse.referencias?.map((ref: string, k: number) => (
                            <li key={k}>{ref}</li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* Task 4: Administrative Reduction Output Render */}
              {activeTask === "admin_summary" && (
                <div className="space-y-5">
                  {!adminResponse ? (
                    <div className="text-center py-12 text-slate-500">
                      <FileText className="mx-auto mb-3 opacity-40 text-teal-400 animate-pulse" size={40} />
                      <p className="font-semibold text-sm text-slate-300">Minimizador de Carga Administrativa</p>
                      <p className="text-xs mt-1 text-slate-550 font-medium">Gere relatórios automatizados de alta, receitas e evolução para poupar o tempo de digitação manual.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      
                      <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <strong className="text-xs font-bold text-white">{adminResponse.documento_titulo}</strong>
                        <button
                          onClick={() => handleCopyText(adminResponse.conteudo)}
                          className="text-[11px] font-extrabold bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 border border-teal-500/25 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 outline-none cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check size={12} /> Copiado!
                            </>
                          ) : (
                            <>
                              <Copy size={12} /> Copiar para Prontuário
                            </>
                          )}
                        </button>
                      </div>

                      <div className="relative font-mono text-[11px] bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 whitespace-pre-wrap leading-relaxed shadow-sm">
                        {adminResponse.conteudo}
                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* Task 5: Digital Prescription output */}
              {activeTask === "prescription" && (
                <div className="space-y-5">
                   {!prescriptionResponse ? (
                    <div className="text-center py-12 text-slate-500">
                      <FileText className="mx-auto mb-3 opacity-40 text-teal-400 animate-pulse" size={40} />
                      <p className="font-semibold text-sm text-slate-300">Receituário Digital Inteligente</p>
                      <p className="text-xs mt-1 text-slate-550 font-medium">Gere prescrições virtuais precisas, prontas para emissão, baseadas no quadro clínico.</p>
                    </div>
                  ) : (
                    <div className="bg-slate-100 rounded-xl shadow-lg border-2 border-slate-300 overflow-hidden relative" id="prescription-paper">
                      
                      {/* Watermark for Free plan */}
                      {currentPlan === "gratis" && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] select-none z-0">
                           <div className="rotate-[-25deg] text-5xl md:text-6xl font-black text-rose-700 whitespace-nowrap">RASCUNHO - BLOQUEADO</div>
                        </div>
                      )}

                      <div className="p-8 relative z-10">
                        {/* Header */}
                        <div className="border-b-2 border-slate-300 pb-4 mb-6 relative">
                          <div className="flex justify-between items-start">
                             <div>
                               <h2 className="text-2xl font-black text-slate-800 tracking-tight">{prescriptionResponse.documento_titulo || "RECEITUÁRIO MÉDICO"}</h2>
                               <p className="text-sm text-slate-500 uppercase mt-2 font-bold tracking-wider">PACIENTE: <strong className="text-slate-800">{patient.name}</strong></p>
                             </div>
                          </div>
                        </div>

                        {/* Medications */}
                        <div className="space-y-6 min-h-[150px]">
                          <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase mb-3">Prescrição</h4>
                            <ul className="space-y-4">
                               {prescriptionResponse.medicamentos?.map((med: any, i: number) => (
                                 <li key={i} className="text-sm border-l-2 border-teal-500 pl-4 py-1">
                                   <strong className="block text-slate-900 text-base">{med.nome}</strong>
                                   <span className="text-slate-600 block mt-1"><strong className="text-slate-500 uppercase text-[10px] mr-1">Uso:</strong> {med.posologia}</span>
                                 </li>
                               ))}
                            </ul>
                          </div>
                          {prescriptionResponse.orientacoes && (
                            <div className="pt-4">
                              <h4 className="text-xs font-black text-slate-400 uppercase mb-2">Orientações Gerais</h4>
                              <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{prescriptionResponse.orientacoes}</p>
                            </div>
                          )}
                        </div>

                        {/* Footer & Signature */}
                        <div className="pt-8 mt-8 border-t border-slate-300 text-center relative flex justify-center">
                          {currentPlan === "premium" ? (
                             <div className="inline-block p-5 border-2 border-teal-200/60 bg-teal-50 rounded-xl text-teal-900 min-w-[280px]">
                               {/* Fancy Signature simulation */}
                               <div className="font-extrabold text-3xl opacity-80 mb-2 font-mono tracking-tight text-teal-700 select-none" style={{fontFamily: "'Courier New', Courier, monospace", transform: "rotate(-2deg)"}}>
                                 {prescriptionResponse.medico_nome}
                               </div>
                               <p className="text-sm font-black text-teal-950 uppercase">{prescriptionResponse.medico_nome}</p>
                               <p className="text-xs uppercase font-bold text-teal-700 mt-0.5">{prescriptionResponse.medico_crm}</p>
                               <div className="mt-3 bg-white px-3 py-1.5 border border-teal-200 rounded text-center inline-block">
                                 <p className="text-[9px] font-mono text-teal-600 font-bold uppercase tracking-widest">Assinado Digitalmente</p>
                                 <p className="text-[10px] font-mono text-teal-800 font-bold mt-0.5">{prescriptionResponse.assinatura_digital}</p>
                               </div>
                             </div>
                          ) : (
                             <div className="inline-block p-5 border-2 border-rose-200 bg-rose-50 rounded-xl text-rose-800 min-w-[280px] shadow-sm">
                               <div className="font-extrabold flex items-center justify-center gap-1.5 mb-1.5 text-base text-rose-700"><Lock size={16}/> ASSINATURA BLOQUEADA</div>
                               <p className="text-[11px] font-medium text-rose-700 mt-1 max-w-[200px] mx-auto leading-tight">Faça upgrade ao plano Premium para assinar e emitir oficialmente receitas virtuais válidas.</p>
                               <button 
                                 onClick={onNavigateToPlans} 
                                 className="mt-4 uppercase font-black text-[10px] bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors w-full shadow-md shadow-rose-500/20"
                               >
                                 Ativar Premium Agora
                               </button>
                             </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>

        {/* Retractable Accordion Section for Session Suggestions History */}
        <div className="border-t border-slate-800 bg-slate-950/20">
          <button
            type="button"
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            className="w-full flex items-center justify-between p-4 bg-slate-900/60 hover:bg-slate-850/80 transition-colors text-slate-200 outline-none select-none border-b border-slate-800"
          >
            <div className="flex items-center gap-2">
              <History size={15} className="text-teal-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-100 mr-1">
                Histórico de Sugestões de IA
              </span>
              {/* Session Suggestions Badge */}
              <span className="inline-flex items-center justify-center bg-teal-400 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full min-w-[20px] shadow-sm animate-bounce" style={{ animationDuration: '3s' }} title="Total de sugestões guardadas nesta sessão">
                {suggestionsHistory.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {suggestionsHistory.filter(s => s.patientId === patient.id).length > 0 && (
                <span className="text-[10px] bg-slate-800 border border-slate-700 text-teal-300 font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></span>
                  <span>{patient.name}: {suggestionsHistory.filter(s => s.patientId === patient.id).length}</span>
                </span>
              )}
              {isHistoryExpanded ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
            </div>
          </button>

          {isHistoryExpanded && (
            <div className="p-4 bg-slate-900/45 space-y-3 max-h-[300px] overflow-y-auto">
              {suggestionsHistory.filter(s => s.patientId === patient.id).length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-semibold">
                  Nenhuma sugestão ou prescrição clínica arquivada anteriormente nesta sessão para {patient.name}.
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestionsHistory
                    .filter(s => s.patientId === patient.id)
                    .map((sug) => {
                      const isItemExpanded = expandedHistoryId === sug.id;
                      return (
                        <div key={sug.id} className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
                          {/* List Item Header */}
                          <div
                            onClick={() => setExpandedHistoryId(isItemExpanded ? null : sug.id)}
                            className="flex items-center justify-between p-3.5 bg-slate-950/60 hover:bg-slate-950/90 transition-colors cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-2">
                              {sug.task === "triage" && <Activity size={13} className="text-amber-400" />}
                              {sug.task === "diagnosis" && <Brain size={13} className="text-teal-400" />}
                              {sug.task === "evidence" && <BookOpen size={13} className="text-sky-400" />}
                              {sug.task === "admin_summary" && <FileText size={13} className="text-purple-400" />}
                              {sug.task === "prescription" && <Copy size={13} className="text-emerald-400" />}
                              <span className="text-xs font-bold text-slate-200">
                                {getTaskLabel(sug.task)}
                              </span>
                              {sug.customQuery && (
                                <span className="text-[10px] text-slate-450 italic font-medium max-w-[150px] truncate">
                                  "{sug.customQuery}"
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-slate-500 font-mono font-bold">
                                {sug.timestamp}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRestoreSuggestion(sug);
                                }}
                                className="text-[10.5px] font-black text-teal-400 hover:text-black hover:bg-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-lg transition-all"
                                title="Carregar conteúdo no painel principal"
                              >
                                Carregar
                              </button>
                              {isItemExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                            </div>
                          </div>

                          {/* Item expanded content preview */}
                          {isItemExpanded && (
                            <div className="p-3.5 bg-slate-900 border-t border-slate-800/80 text-xs text-slate-350 space-y-3 leading-relaxed">
                              {sug.task === "triage" && (
                                <div className="space-y-2 bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
                                  <div className="flex items-center gap-2 border-b border-slate-805 pb-1.5 mb-1 text-[11px]">
                                    <strong className="text-slate-450 uppercase text-[9px] font-bold">Prioridade:</strong>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${getTriageColorBg(sug.data.cor)}`}>
                                      {sug.data.prioridade}
                                    </span>
                                  </div>
                                  <div>
                                    <strong className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Fundamentação:</strong>
                                    <p className="font-semibold text-slate-300">{sug.data.justificativa}</p>
                                  </div>
                                </div>
                              )}

                              {sug.task === "diagnosis" && (
                                <div className="space-y-2">
                                  {sug.data.diagnosticos?.map((d: any, idx: number) => (
                                    <div key={idx} className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/60 space-y-1 text-[11px]">
                                      <div className="flex justify-between items-center bg-slate-950 p-1 px-2 rounded">
                                        <strong className="text-white font-extrabold">{idx + 1}. {d.doenca}</strong>
                                        <span className="text-teal-400 font-black">{d.probabilidade}</span>
                                      </div>
                                      <p className="text-slate-300 pt-1 font-semibold">{d.evidencia}</p>
                                      {d.conduta_inicial && (
                                        <p className="text-[10px] text-slate-500 italic mt-1.5 border-t border-slate-850/80 pt-1">
                                          Conduta inicial: <span className="text-slate-400">{d.conduta_inicial}</span>
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {sug.task === "evidence" && (
                                <div className="space-y-1.5 bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
                                  {sug.customQuery && (
                                    <p className="text-[10px] text-slate-500 uppercase font-black">
                                      Pergunta: <span className="text-teal-400 font-bold">"{sug.customQuery}"</span>
                                    </p>
                                  )}
                                  <div className="whitespace-pre-wrap font-semibold text-slate-300">
                                    {sug.data.evidencia_cientifica}
                                  </div>
                                </div>
                              )}

                              {sug.task === "admin_summary" && (
                                <div className="space-y-1 bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
                                  <strong className="text-white block font-black border-b border-slate-850/50 pb-1 mb-1.5">{sug.data.documento_titulo}</strong>
                                  <pre className="whitespace-pre-wrap font-mono text-[10px] text-slate-350 leading-relaxed bg-slate-950 p-2 rounded">
                                    {sug.data.conteudo}
                                  </pre>
                                </div>
                              )}

                              {sug.task === "prescription" && (
                                <div className="space-y-2 bg-slate-950/50 p-3 rounded-lg border border-slate-800/60 text-[11px]">
                                  <strong className="text-white block font-black border-b border-slate-855 pb-1 mb-2">{sug.data.documento_titulo || "RECEITUÁRIO MÉDICO"}</strong>
                                  <ul className="space-y-2.5">
                                    {sug.data.medicamentos?.map((m: any, idx: number) => (
                                      <li key={idx} className="border-l-2 border-teal-500 pl-2.5 py-0.5">
                                        <strong className="text-white block">{m.nome}</strong>
                                        <p className="text-[10px] text-slate-405 font-medium mt-0.5">{m.posologia}</p>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

// Inline helper for bookmarking / saving clinical evidence notes
function BookmarksWidget({ textToSave }: { textToSave: string }) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      onClick={() => setSaved(!saved)}
      className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 outline-none transition-colors border cursor-pointer ${saved ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-805 text-slate-300 hover:bg-slate-750 border-slate-700"}`}
    >
      <Bookmark size={12} className={saved ? "fill-emerald-400" : ""} />
      <span>{saved ? "Marcado no KlikHealth" : "Marcar Conduta"}</span>
    </button>
  );
}
