import React, { useState } from "react";
import { Patient, ActiveAlert } from "../types";
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Search, 
  SlidersHorizontal, 
  ArrowRight, 
  Thermometer, 
  Heart, 
  Droplets,
  HeartCrack,
  Flame,
  UserCheck2,
  Lock
} from "lucide-react";

interface DoctorDashboardProps {
  patients: Patient[];
  alerts: ActiveAlert[];
  onSelectPatient: (patient: Patient) => void;
  onOpenAIAssistant: (patient: Patient) => void;
  onResolveAlert: (alertId: string) => void;
  hasAiKey: boolean;
  currentPlan: "gratis" | "premium";
  onNavigateToPlans: () => void;
}

export default function DoctorDashboard({
  patients,
  alerts,
  onSelectPatient,
  onOpenAIAssistant,
  onResolveAlert,
  hasAiKey,
  currentPlan,
  onNavigateToPlans
}: DoctorDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("TODOS");
  const [filterStatus, setFilterStatus] = useState<string>("TODOS");
  const [alertTypeFilter, setAlertTypeFilter] = useState<string>("TODOS");
  const [filterAge, setFilterAge] = useState<string>("TODOS");

  // Dynamic calculations
  const totalInClinic = patients.filter((p) => p.status !== "alta").length;
  const activeAlertsCount = alerts.filter((a) => !a.resolved).length;
  const avgWaitInMinutes = 14; 
  const safetyStatusScore = 98.4; 

  // Trend Generator for Sparklines
  const getPatientTrendData = (patientId: string, currentVal: number, type: 'heartRate' | 'spo2' | 'temp'): number[] => {
    if (patientId === "PAT-001") {
      if (type === "heartRate") return [92, 98, 105, currentVal];
      if (type === "spo2") return [96, 95, 93, currentVal];
      return [36.2, 36.3, 36.4, currentVal];
    }
    if (patientId === "PAT-002") {
      if (type === "heartRate") return [72, 75, 79, currentVal];
      if (type === "spo2") return [98, 99, 99, currentVal];
      return [36.6, 36.7, 36.8, currentVal];
    }
    if (patientId === "PAT-003") {
      if (type === "heartRate") return [98, 108, 115, currentVal];
      if (type === "spo2") return [97, 96, 95, currentVal];
      return [36.8, 37.0, 37.1, currentVal];
    }
    if (patientId === "PAT-004") {
      if (type === "heartRate") return [110, 115, 125, currentVal];
      if (type === "spo2") return [95, 94, 92, currentVal];
      return [36.9, 37.1, 37.0, currentVal];
    }
    // Generic fallback based on parameter types
    const variance = type === "heartRate" ? 6 : type === "spo2" ? 1 : 0.2;
    return [
      Math.round((currentVal - variance * 2) * 10) / 10,
      Math.round((currentVal - variance) * 10) / 10,
      Math.round((currentVal + variance / 2) * 10) / 10,
      currentVal
    ];
  };

  // Sparkline Builder
  const renderSparkline = (data: number[], strokeColor: string, idSuffix: string) => {
    const width = 85;
    const height = 22;
    const paddingX = 4;
    const paddingY = 4;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;

    const points = data.map((val, index) => {
      const x = paddingX + (index * (width - paddingX * 2)) / (data.length - 1);
      const y = range === 0 
        ? height / 2 
        : height - paddingY - ((val - min) / range) * (height - paddingY * 2);
      return { x, y, val };
    });

    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, "");

    const fillD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    const gradId = `gradient-${strokeColor.replace('#', '')}-${idSuffix}`;

    return (
      <svg width={width} height={height} className="overflow-visible font-mono select-none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.30" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.00" />
          </linearGradient>
        </defs>
        
        <path d={fillD} fill={`url(#${gradId})`} />
        
        <path 
          d={pathD} 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />

        {points.map((p, idx) => (
          <circle 
            key={idx}
            cx={p.x} 
            cy={p.y} 
            r="1.8" 
            fill={strokeColor} 
          />
        ))}
      </svg>
    );
  };

  // Filters
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          patient.cpf.includes(searchTerm) ||
                          patient.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = filterPriority === "TODOS" || patient.triageCategory === filterPriority;
    const matchesStatus = filterStatus === "TODOS" || patient.status === filterStatus;

    let matchesAge = true;
    if (filterAge === "< 18") {
      matchesAge = patient.age < 18;
    } else if (filterAge === "18-60") {
      matchesAge = patient.age >= 18 && patient.age <= 60;
    } else if (filterAge === "60+") {
      matchesAge = patient.age > 60;
    }

    return matchesSearch && matchesPriority && matchesStatus && matchesAge;
  });

  const getTriageBadge = (category: string) => {
    switch (category) {
      case "IMEDIATO":
        return <span className="px-2.5 py-1 text-xs font-black rounded-full bg-red-50 text-red-700 uppercase flex items-center gap-1 animate-pulse border border-red-200/80"><Activity size={12} /> IMEDIATO</span>;
      case "MUITO_URGENTE":
        return <span className="px-2.5 py-1 text-xs font-black rounded-full bg-orange-50 text-orange-700 uppercase flex items-center gap-1 border border-orange-200/80"><AlertTriangle size={12} /> MUITO URGENTE</span>;
      case "URGENTE":
        return <span className="px-2.5 py-1 text-xs font-black rounded-full bg-amber-50 text-amber-700 uppercase flex items-center gap-1 border border-amber-200/80"><Clock size={12} /> URGENTE</span>;
      case "POUCO_URGENTE":
        return <span className="px-2.5 py-1 text-xs font-black rounded-full bg-emerald-50 text-emerald-700 uppercase flex items-center gap-1 border border-emerald-250/80"><CheckCircle2 size={12} /> POUCO URGENTE</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-black rounded-full bg-slate-50 text-slate-700 uppercase flex items-center gap-1 border border-slate-200/80">NÃO URGENTE</span>;
    }
  };

  const getTriageColorClass = (color: string) => {
    switch (color) {
      case "red": return "border-l-4 border-l-red-500";
      case "orange": return "border-l-4 border-l-orange-400";
      case "yellow": return "border-l-4 border-l-yellow-500";
      case "green": return "border-l-4 border-l-teal-500";
      default: return "border-l-4 border-l-blue-400";
    }
  };

  return (
    <div id="doctor-dashboard-wrapper" className="space-y-6">
      
      {/* Dynamic Key Notification to guide users */}
      {!hasAiKey && (
        <div id="ai-key-notif" className="bg-amber-100/60 border border-amber-200 rounded-xl p-4 flex items-center justify-between text-sm text-amber-900">
          <div className="flex items-center gap-2">
            <Lock className="text-amber-600 shrink-0" size={18} />
            <span>
              <strong>Modo Simulação Ativo:</strong> Chave de API do Gemini não detectada em seu ambiente. O aplicativo funcionará normalmente usando respostas clínicas baseadas em regras de simulação guiadas por evidências médicas brasileiras! Registre sua chave na aba "Secrets" para habilitar a inteligência dinâmica.
            </span>
          </div>
        </div>
      )}

      {/* Real-time Indicator Cards Panel */}
      <div id="indicators-grid" className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3 bg-indigo-50 text-indigo-750 rounded-xl">
            <Users size={24} className="text-[#1c1a5e]" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold tracking-wide block uppercase">Pacientes Ativos</span>
            <span className="text-2xl font-black text-slate-900 block leading-none">{totalInClinic}</span>
            <span className="text-[10px] text-teal-600 font-bold block mt-1">● Pronto Atendimento</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3 bg-red-50 text-red-500 rounded-xl ring-4 ring-red-55/30 animate-pulse">
            <AlertTriangle size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold tracking-wide block uppercase">Alertas Críticos</span>
            <span className="text-2xl font-black text-slate-900 block leading-none">{activeAlertsCount}</span>
            <span className="text-[10px] text-red-500 font-bold block mt-1">Ações urgentes</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold tracking-wide block uppercase">Espera em Triagem</span>
            <span className="text-2xl font-black text-slate-900 block leading-none">{avgWaitInMinutes} min</span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">Fila otimizada</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Activity size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold tracking-wide block uppercase">Conformidade IA</span>
            <span className="text-2xl font-black text-indigo-700 block leading-none">{safetyStatusScore}%</span>
            <span className="text-[10px] text-slate-550 font-bold block mt-1">Score de condutas</span>
          </div>
        </div>
      </div>

      {/* Real-time Alerts Ticker (Alertas Automáticos) */}
      {alerts.filter(a => !a.resolved).length > 0 && (
        <div id="alertas-autotoc-wrapper" className="bg-red-50/50 border border-red-100 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-red-100 pb-2.5">
            <div className="flex items-center gap-2 text-red-700 font-extrabold text-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
              </span>
              <span>ALERTAS DE SEGURANÇA EM TEMPO REAL</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-red-700/80 font-black uppercase tracking-wider font-mono">Filtro de Gravidade:</span>
              <select
                value={alertTypeFilter}
                onChange={(e) => setAlertTypeFilter(e.target.value)}
                className="bg-white border border-red-200 text-red-700 font-bold text-xs rounded-xl py-1 px-3 outline-none focus:ring-2 focus:ring-red-200 transition-all cursor-pointer font-sans"
              >
                <option value="TODOS">🚨 Mostrar Todos</option>
                <option value="danger">🔴 Críticos (Danger)</option>
                <option value="warning">🟠 Moderados (Warning)</option>
                <option value="info">🔵 Informativos (Info)</option>
              </select>
            </div>
          </div>
          
          {alerts.filter(a => !a.resolved && (alertTypeFilter === "TODOS" || a.type === alertTypeFilter)).length === 0 ? (
            <div className="text-center py-6 bg-white/60 rounded-xl border border-dashed border-red-250">
              <span className="text-xs text-slate-400 font-bold block">
                Nenhum alerta clínico pendente {alertTypeFilter !== "TODOS" ? `da categoria ${alertTypeFilter.toUpperCase()}` : ""}.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {alerts.filter(a => !a.resolved && (alertTypeFilter === "TODOS" || a.type === alertTypeFilter)).map((alert) => (
                <div key={alert.id} className="bg-white p-4 rounded-xl border border-red-100/80 hover:border-red-200 shadow-xs flex items-start gap-4 text-xs justify-between transition-all hover:shadow-xs">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`w-2 h-2 rounded-full ${alert.type === 'danger' ? 'bg-red-500 animate-pulse' : alert.type === 'warning' ? 'bg-orange-400' : 'bg-teal-500'}`}></span>
                      <strong className="text-slate-800 font-extrabold truncate">{alert.title}</strong>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded font-mono ${alert.type === 'danger' ? 'bg-red-500/10 text-red-600' : alert.type === 'warning' ? 'bg-orange-400/15 text-orange-600' : 'bg-teal-500/10 text-teal-600'}`}>
                        {alert.type}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-semibold">
                      Paciente: <span className="text-[#1c1a5e] font-extrabold">{alert.patientName}</span> &bull; {alert.message}
                    </p>
                    <span className="text-[9px] text-slate-400 font-mono block">{alert.timestamp}</span>
                  </div>
                  <button
                    onClick={() => onResolveAlert(alert.id)}
                    className="bg-red-500 hover:bg-red-600 text-white transition-all font-black px-3 py-1.5 rounded-lg shrink-0 outline-none cursor-pointer text-[11px]"
                  >
                    Resolver
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Panel Content: Filter + Patient List (Clean White Card Wrapper) */}
      <div id="patient-list-section" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Filter bar exactly matching light clinical tone */}
        <div className="p-5 border-b border-slate-100 flex flex-col xl:flex-row gap-4 items-center justify-between bg-slate-50/40">
          <div className="relative w-full xl:max-w-md">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Pesquisar por paciente, CPF ou Prontuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 bg-white text-slate-800 placeholder-slate-400 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#1c1a5e] focus:ring-2 focus:ring-indigo-500/10 transition-all font-semibold"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-400">
              <SlidersHorizontal size={13} />
              <span>FILTRAR:</span>
            </div>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer hover:border-slate-350"
            >
              <option value="TODOS">Todas Prioridades</option>
              <option value="IMEDIATO">Imediato (Manchester)</option>
              <option value="MUITO_URGENTE">Muito Urgente</option>
              <option value="URGENTE">Urgente</option>
              <option value="POUCO_URGENTE">Pouco Urgente</option>
              <option value="NAO_URGENTE">Não Urgente</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer hover:border-slate-350"
            >
              <option value="TODOS">Todos Status</option>
              <option value="espera">Em Fila / Espera</option>
              <option value="observacao">Em Observação</option>
              <option value="internado">Internado</option>
              <option value="alta">Altas médicas</option>
            </select>

            <select
              id="age-range-filter-select"
              value={filterAge}
              onChange={(e) => setFilterAge(e.target.value)}
              className="text-xs border border-slate-250/80 rounded-lg px-3 py-2 bg-white text-[#1c1a5e] font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer hover:border-slate-350"
            >
              <option value="TODOS">Todas Idades</option>
              <option value="&lt; 18">Menores de 18 anos (&lt; 18)</option>
              <option value="18-60">Adultos (18-60 anos)</option>
              <option value="60+">Idosos (60+ anos)</option>
            </select>
          </div>
        </div>

        {/* Patient Grid / Table */}
        <div id="patient-grid-list" className="divide-y divide-slate-150 bg-white">
          {filteredPatients.length === 0 ? (
            <div className="p-16 text-center text-slate-400 bg-white">
              <Users className="mx-auto mb-3 opacity-30 text-indigo-500 animate-bounce" size={36} />
              <p className="font-extrabold text-slate-700 text-sm">Nenhum paciente encontrado com estes filtros.</p>
              <p className="text-xs mt-1 text-slate-400">Busque novamente ou limpe os seletores de triagem.</p>
            </div>
          ) : (
            filteredPatients.map((patient, index) => {
              // Vital signs warnings flags for patient rows
              const isTachycardic = patient.currentVitals.heartRate > 100;
              const isHypoxemic = patient.currentVitals.spo2 < 93;
              const isFebrile = patient.currentVitals.temperature >= 37.8;
              const isHypertensive = patient.currentVitals.bpSystolic >= 140;

              const isLocked = currentPlan === "gratis" && index > 1;

              return (
                <div 
                  key={patient.id} 
                  onClick={() => isLocked ? onNavigateToPlans() : onSelectPatient(patient)}
                  className={`p-5 flex flex-col lg:flex-row items-start lg:items-center gap-4 transition-all ${
                    isLocked 
                      ? "hover:bg-amber-50/20 bg-slate-50/40 opacity-55 cursor-pointer relative" 
                      : "hover:bg-slate-50/50 cursor-pointer " + getTriageColorClass(patient.triageColor)
                  }`}
                >
                  {/* Avatar & Core Detail */}
                  <div className="flex items-center gap-3 shrink-0 w-full lg:w-1/4">
                    <img
                      src={patient.avatar}
                      alt={patient.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200/80"
                    />
                    <div>
                      <h3 className="font-black text-slate-800 leading-snug text-sm tracking-tight">{patient.name}</h3>
                      <div className="flex gap-2 items-center text-xs text-slate-400 mt-1 font-bold">
                        <span>{patient.age} anos</span>
                        <span>•</span>
                        <span>{patient.gender}</span>
                        <span>•</span>
                        <span className="font-mono text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-250/50">{patient.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Complaint */}
                  <div className="flex-1 w-full text-xs text-slate-400 leading-relaxed font-semibold">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold mb-0.5 font-mono">Queixa Principal / Triagem Admissão</span>
                    <p className="line-clamp-2 text-slate-600 font-medium">{patient.admissionReason}</p>
                  </div>

                  {/* Quick Vitals Metrics Dashboard Row - Light Mode Clean Grid */}
                  <div className="grid grid-cols-5 gap-2 shrink-0 py-1 bg-slate-50 rounded-xl px-3 border border-slate-150">
                    <div className="text-center font-bold px-1">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase select-none">Temp</span>
                      <span className={`text-[11px] block font-extrabold mt-0.5 flex items-center justify-center gap-0.5 ${isFebrile ? "text-red-500 font-black animate-pulse" : "text-slate-700"}`}>
                        <Thermometer size={10} className="opacity-70" />
                        {patient.currentVitals.temperature}°C
                      </span>
                    </div>
                    <div className="text-center font-bold px-1">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase select-none">P.A.</span>
                      <span className={`text-[11px] block font-extrabold mt-0.5 ${isHypertensive ? "text-red-500 font-black animate-pulse" : "text-slate-700"}`}>
                        {patient.currentVitals.bpSystolic}/{patient.currentVitals.bpDiastolic}
                      </span>
                    </div>
                    <div className="text-center font-bold px-1">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase select-none">F.C.</span>
                      <span className={`text-[11px] block font-extrabold mt-0.5 flex items-center justify-center gap-0.5 ${isTachycardic ? "text-red-500 font-black animate-pulse" : "text-slate-700"}`}>
                        <Heart size={10} className="text-red-400" />
                        {patient.currentVitals.heartRate}
                      </span>
                    </div>
                    <div className="text-center font-bold px-1">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase select-none">F.R.</span>
                      <span className="text-[11px] block font-extrabold text-slate-700 mt-0.5">
                        {patient.currentVitals.respRate}
                      </span>
                    </div>
                    <div className="text-center font-bold px-1">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase select-none">SpO2</span>
                      <span className={`text-[11px] block font-extrabold mt-0.5 flex items-center justify-center gap-0.5 ${isHypoxemic ? "text-red-500 font-black" : "text-teal-650"}`}>
                        <Droplets size={10} className="text-teal-500" />
                        {patient.currentVitals.spo2}%
                      </span>
                    </div>
                  </div>

                  {/* Micro-Monitor de Tendências Vivas */}
                  <div className="shrink-0 flex items-center gap-4 bg-slate-50/60 hover:bg-slate-50 transition-all p-2 px-3.5 rounded-xl border border-slate-150 w-full lg:w-auto">
                    {/* Heart Rate Sparkline */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] text-slate-400 font-black uppercase font-mono">F.C. (BPM)</span>
                        <span className={`text-[9px] font-bold font-mono ${isTachycardic ? "text-red-500" : "text-emerald-600"}`}>
                          6h Trend
                        </span>
                      </div>
                      {renderSparkline(getPatientTrendData(patient.id, patient.currentVitals.heartRate, "heartRate"), isTachycardic ? "#ef4444" : "#10b981", `${patient.id}-fc`)}
                    </div>

                    <div className="h-6 w-[1px] bg-slate-200 self-center"></div>

                    {/* SpO2 Sparkline */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] text-slate-400 font-black uppercase font-mono">SpO2 (%)</span>
                        <span className={`text-[9px] font-bold font-mono ${isHypoxemic ? "text-red-500" : "text-cyan-600"}`}>
                          6h Trend
                        </span>
                      </div>
                      {renderSparkline(getPatientTrendData(patient.id, patient.currentVitals.spo2, "spo2"), isHypoxemic ? "#ef4444" : "#0284c7", `${patient.id}-spo2`)}
                    </div>
                  </div>

                  {/* Triage Badge Indicator */}
                  <div className="shrink-0 w-full sm:w-auto flex flex-row sm:flex-col items-center gap-2 justify-between lg:justify-center">
                    {getTriageBadge(patient.triageCategory)}
                    <span className="text-[10px] bg-slate-50 border border-slate-150 text-slate-500 font-bold px-2.5 py-0.5 rounded tracking-wide capitalize self-center whitespace-nowrap">
                      {patient.status === 'espera' ? 'Fila de Espera' : patient.status === 'observacao' ? 'Evolução/Observação' : patient.status === 'internado' ? 'Leito Internação' : 'Alta recente'}
                    </span>
                  </div>

                  {/* Operational Action Buttons exactly aligning with GestHuman */}
                  <div className="flex gap-2 shrink-0 w-full lg:w-auto justify-end">
                    {isLocked ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); onNavigateToPlans(); }}
                        className="text-xs bg-amber-50 hover:bg-amber-100 border border-amber-250 text-amber-700 transition-colors px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer outline-none shrink-0 whitespace-nowrap animate-pulse"
                      >
                        <Lock size={12} className="text-amber-550" />
                        <span>Desbloquear com Premium</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); onSelectPatient(patient); }}
                          className="text-xs bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-colors px-3 py-2 rounded-xl font-bold flex items-center gap-1 cursor-pointer outline-none whitespace-nowrap"
                        >
                          Ver Histórico
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onOpenAIAssistant(patient); }}
                          className="text-xs bg-[#1c1a5e] hover:bg-[#201d6d] text-white transition-colors px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer outline-none shrink-0 whitespace-nowrap"
                        >
                          Suporte de Decisão IA <ArrowRight size={13} />
                        </button>
                      </>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* List footer stats precisely matching GestHuman styling */}
        <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-between text-xs text-slate-400 font-bold font-mono">
          <span>Total Filtrado: {filteredPatients.length} pacientes</span>
          <span>Sincronizado &bull; KlikHealth IA Engine</span>
        </div>

      </div>

    </div>
  );
}
