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
  BookOpen
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
  const [activeTask, setActiveTask] = useState<"triage" | "diagnosis" | "evidence" | "admin_summary">("triage");
  const [loading, setLoading] = useState(false);
  
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
        <div className="grid grid-cols-4 border-b border-slate-800 shrink-0 bg-slate-950/40 rounded-t-2xl overflow-hidden p-1 gap-1">
          <button
            onClick={() => setActiveTask("triage")}
            className={`py-3 px-1 text-xs font-bold rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer outline-none transition-all ${activeTask === "triage" ? "bg-slate-800 text-teal-400 border border-teal-500/20 shadow-md" : "text-slate-450 hover:text-white"}`}
          >
            <Activity size={14} />
            <span className="text-center sm:text-left font-extrabold">1. Triagem Ágil</span>
          </button>
          
          <button
            onClick={() => setActiveTask("diagnosis")}
            className={`py-3 px-1 text-xs font-bold rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer outline-none transition-all ${activeTask === "diagnosis" ? "bg-slate-800 text-teal-400 border border-teal-500/20 shadow-md" : "text-slate-450 hover:text-white"}`}
          >
            <Brain size={14} />
            <span className="text-center sm:text-left font-extrabold">2. Diagnóstico</span>
          </button>
          
          <button
            onClick={() => setActiveTask("evidence")}
            className={`py-3 px-1 text-xs font-bold rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer outline-none transition-all ${activeTask === "evidence" ? "bg-slate-800 text-teal-400 border border-teal-500/20 shadow-md" : "text-slate-450 hover:text-white"}`}
          >
            <BookOpen size={14} />
            <span className="text-center sm:text-left font-extrabold">3. Evidências</span>
          </button>
          
          <button
            onClick={() => setActiveTask("admin_summary")}
            className={`py-3 px-1 text-xs font-bold rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer outline-none transition-all ${activeTask === "admin_summary" ? "bg-slate-800 text-teal-400 border border-teal-500/20 shadow-md" : "text-slate-450 hover:text-white"}`}
          >
            <FileText size={14} />
            <span className="text-center sm:text-left font-extrabold">4. Desburocratizar</span>
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
            </>
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
