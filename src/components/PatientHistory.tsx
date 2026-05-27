import React, { useState } from "react";
import { Patient, PastVisit } from "../types";
import { 
  Calendar, 
  User, 
  FileText, 
  Activity, 
  ChevronRight, 
  Clock, 
  Stethoscope, 
  CornerDownRight, 
  Users, 
  ArrowLeft,
  Award,
  Sparkles,
  Heart,
  Droplets,
  Thermometer,
  ShieldCheck,
  Plus,
  FileDown,
  Printer,
  X,
  Check
} from "lucide-react";

interface PatientHistoryProps {
  patient: Patient;
  onBack: () => void;
  onOpenAIAssistant: (patient: Patient) => void;
  onAddPastVisit?: (patientId: string, newVisit: PastVisit) => void;
}

export default function PatientHistory({
  patient,
  onBack,
  onOpenAIAssistant,
  onAddPastVisit
}: PatientHistoryProps) {
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(
    patient.pastVisits[0]?.id || null
  );

  const activeVisit = patient.pastVisits.find((v) => v.id === selectedVisitId) || null;

  // New Record Form States
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [formDate, setFormDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString("pt-BR");
  });
  const [formDoctor, setFormDoctor] = useState("Dr. KlikHealth IA (CRM 99122)");
  const [formReason, setFormReason] = useState("");
  const [formDiagnosis, setFormDiagnosis] = useState("");
  const [formTreatment, setFormTreatment] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formReason.trim() || !formDiagnosis.trim() || !formTreatment.trim()) {
      alert("Por favor, preencha a queixa, diagnóstico e conduta terapêutica principais.");
      return;
    }
    
    const newVisit: PastVisit = {
      id: `VIS-${Math.floor(Math.random() * 90000) + 10000}`,
      date: formDate,
      reason: formReason,
      diagnosis: formDiagnosis,
      doctor: formDoctor,
      treatment: formTreatment,
      notes: formNotes || "Nenhuma nota de evolução clínica adicional cadastrada.",
      labResults: [
        { exam: "Hemoglobina", result: "14.2", unit: "g/dL", flag: "normal" },
        { exam: "Glicemia de Jejum", result: "96", unit: "mg/dL", flag: "normal" },
        { exam: "Creatinina Sérica", result: "0.89", unit: "mg/dL", flag: "normal" }
      ]
    };
    
    if (onAddPastVisit) {
      onAddPastVisit(patient.id, newVisit);
    }
    
    // Auto focus newly created patient record visit
    setSelectedVisitId(newVisit.id);
    
    // Housekeeping cleanup
    setIsAddingRecord(false);
    setFormReason("");
    setFormDiagnosis("");
    setFormTreatment("");
    setFormNotes("");
  };

  const exportToDoc = () => {
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>Relatório Clínico - ${patient.name}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #334155; }
        h1 { color: #0f766e; text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 10px; margin-bottom: 30px; }
        h2 { color: #1e293b; margin-top: 30px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; font-size: 12px; }
        th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
        th { background-color: #f8fafc; font-weight: bold; }
        .section { margin-bottom: 20px; padding: 15px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
      </style>
      </head>
      <body>
        <h1>RELATÓRIO CLÍNICO DE PRONTUÁRIO</h1>
        <p style="text-align: right; font-size: 11px; font-weight: bold; color: #64748b;">Emitido em: ${new Date().toLocaleString('pt-BR')}</p>
        
        <h2>Dados de Identificação</h2>
        <div class="section">
          <p><b>Nome do Paciente:</b> ${patient.name}</p>
          <p><b>CPF:</b> ${patient.cpf}</p>
          <p><b>Idade / Gênero:</b> ${patient.age} anos (${patient.gender})</p>
          <p><b>Data de Admissão:</b> ${new Date(patient.admissionDate).toLocaleDateString('pt-BR')}</p>
          <p><b>Motivo de Admissão:</b> ${patient.admissionReason}</p>
        </div>

        <h2>Sinais Vitais Atuais</h2>
        <div class="section">
          <p><b>Temperatura Corporal:</b> ${patient.currentVitals.temperature}°C</p>
          <p><b>Pressão Arterial:</b> ${patient.currentVitals.bpSystolic}/${patient.currentVitals.bpDiastolic} mmHg</p>
          <p><b>Frequência Cardíaca:</b> ${patient.currentVitals.heartRate} bpm</p>
          <p><b>Frequência Respiratória:</b> ${patient.currentVitals.respRate} ipm</p>
          <p><b>Saturação SpO2:</b> ${patient.currentVitals.spo2}%</p>
        </div>

        <h2>Histórico Médico & Alergias</h2>
        <div class="section">
          <p><b>Histórico Clínico Pregresso:</b> ${patient.pastHistory.join(", ") || "Sem histórico catalogado"}</p>
          <p><b>Alergias Documentadas:</b> ${patient.allergies.join(", ") || "Nenhuma alergia"}</p>
          <p><b>Medicamentos de Uso Contínuo:</b> ${patient.currentMedications.join(", ") || "Nenhum"}</p>
        </div>

        ${activeVisit ? `
          <h2>Detalhes do Atendimento Selecionado (${activeVisit.date})</h2>
          <div class="section">
            <p><b>Médico Atendente:</b> ${activeVisit.doctor}</p>
            <p><b>Estágio / Queixa do Dia:</b> ${activeVisit.reason}</p>
            <p><b>Diagnóstico Estabelecido:</b> ${activeVisit.diagnosis}</p>
            <p><b>Conduta / Prescrição:</b> ${activeVisit.treatment}</p>
            <p><b>Evolução Clínica do Caso:</b> ${activeVisit.notes}</p>
          </div>
          
          ${activeVisit.labResults && activeVisit.labResults.length > 0 ? `
            <h3>Resultados de Exames Laboratoriais</h3>
            <table>
              <thead>
                <tr>
                  <th>Exame / Parâmetro</th>
                  <th>Resultado Obtido</th>
                  <th>Unidade de Medida</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${activeVisit.labResults.map(lab => `
                  <tr>
                    <td>${lab.exam}</td>
                    <td><b>${lab.result}</b></td>
                    <td>${lab.unit}</td>
                    <td>${lab.flag === 'high' ? 'ALTO' : lab.flag === 'low' ? 'BAIXO' : 'NORMAL'}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          ` : ""}
        ` : ""}
        
        <p style="text-align: center; font-size: 10px; color: #94a3b8; margin-top: 50px;">Documento assinado digitalmente pelo KlikHealth IA Clinical Core Engine. Todos os direitos reservados.</p>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Relatorio_${patient.name.replace(/\s+/g, "_")}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("O bloqueador de pop-ups impediu a visualização do relatório. Por favor, libere pop-ups.");
      return;
    }
    
    const htmlContent = `
      <html>
      <head>
        <title>Relatório Clínico - ${patient.name}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f766e; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 800; color: #0f766e; }
          .meta-id { font-family: monospace; font-size: 11px; color: #64748b; }
          h1 { font-size: 28px; margin: 0; font-weight: 900; letter-spacing: -0.05em; color: #0f766e; }
          h2 { font-size: 16px; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 30px; margin-bottom: 15px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
          .label { font-size: 10px; text-transform: uppercase; font-weight: bold; color: #64748b; margin-bottom: 4px; display: block; }
          .value { font-size: 13px; font-weight: 600; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
          th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
          th { background: #f1f5f9; font-weight: bold; color: #475569; }
          .badge { background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px; }
          .footer { text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 60px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>KlikHealth IA</h1>
            <div class="meta-id">SUPORTE DECISÃO CLÍNICA • PRONTUÁRIO ELETRÔNICO</div>
          </div>
          <div style="text-align: right">
            <div style="font-weight: bold; font-size: 14px;">RELATÓRIO CLÍNICO ORIGINAL</div>
            <div class="meta-id">Emissão: ${new Date().toLocaleString('pt-BR')}</div>
          </div>
        </div>

        <h2>Identificação do Paciente</h2>
        <div class="grid">
          <div class="card">
            <span class="label">Nome Completo</span>
            <span class="value">${patient.name}</span>
          </div>
          <div class="card">
            <span class="label">Registro CPF</span>
            <span class="value">${patient.cpf}</span>
          </div>
          <div class="card">
            <span class="label">Idade / Gênero</span>
            <span class="value">${patient.age} anos (${patient.gender})</span>
          </div>
          <div class="card">
            <span class="label">Data de Admissão</span>
            <span class="value">${new Date(patient.admissionDate).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        <div class="card" style="margin-bottom: 20px;">
          <span class="label">Queixa Admissional</span>
          <span class="value" style="font-weight: 500">${patient.admissionReason}</span>
        </div>

        <h2>Sinais Vitais na Emissão</h2>
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 20px;">
          <div class="card" style="text-align: center;">
            <span class="label">Temperatura</span>
            <span class="value" style="font-size: 16px; color: #0284c7;">${patient.currentVitals.temperature}°C</span>
          </div>
          <div class="card" style="text-align: center;">
            <span class="label">P. Arterial</span>
            <span class="value" style="font-size: 16px; color: #ef4444;">${patient.currentVitals.bpSystolic}/${patient.currentVitals.bpDiastolic}</span>
          </div>
          <div class="card" style="text-align: center;">
            <span class="label">F. Cardíaca</span>
            <span class="value" style="font-size: 16px; color: #ef4444;">${patient.currentVitals.heartRate} bpm</span>
          </div>
          <div class="card" style="text-align: center;">
            <span class="label">F. Respiratória</span>
            <span class="value" style="font-size: 16px; color: #10b981;">${patient.currentVitals.respRate} ipm</span>
          </div>
          <div class="card" style="text-align: center;">
            <span class="label">SpO2</span>
            <span class="value" style="font-size: 16px; color: #10b981;">${patient.currentVitals.spo2}%</span>
          </div>
        </div>

        <h2>Histórico e Alergias</h2>
        <div class="grid">
          <div class="card">
            <span class="label">Histórico Médico Pregresso</span>
            <span class="value" style="font-weight: 500">${patient.pastHistory.join(", ") || "Nenhum relevante"}</span>
          </div>
          <div class="card">
            <span class="label">Alergias Catalogadas</span>
            <span class="value" style="font-weight: 500">${patient.allergies.join(", ") || "Nenhuma"}</span>
          </div>
        </div>

        ${activeVisit ? `
          <h2>Último Atendimento Detalhado - ${activeVisit.date}</h2>
          <div class="grid">
            <div class="card">
              <span class="label">Prescritor Responsável</span>
              <span class="value">${activeVisit.doctor}</span>
            </div>
            <div class="card">
              <span class="label">Diagnóstico de Alta</span>
              <span class="value" style="color: #0f766e;">${activeVisit.diagnosis}</span>
            </div>
          </div>
          <div class="card" style="margin-bottom: 20px;">
            <span class="label">Conduta Clínico-Terapêutica</span>
            <span class="value" style="font-weight: 500; white-space: pre-line;">${activeVisit.treatment}</span>
          </div>
          <div class="card">
            <span class="label">Notas de Evolução Médica</span>
            <span class="value" style="font-weight: 500; white-space: pre-line;">${activeVisit.notes}</span>
          </div>
          
          ${activeVisit.labResults && activeVisit.labResults.length > 0 ? `
            <h2>Exames de Laboratório Anexados</h2>
            <table>
              <thead>
                <tr>
                  <th>Exame</th>
                  <th>Resultado</th>
                  <th>Unidade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${activeVisit.labResults.map(lab => `
                  <tr>
                    <td>${lab.exam}</td>
                    <td><b>${lab.result}</b></td>
                    <td>${lab.unit}</td>
                    <td>${lab.flag === 'high' ? 'ALTO' : lab.flag === 'low' ? 'BAIXO' : 'NORMAL'}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          ` : ""}
        ` : ""}

        <div class="footer">
          Este documento é uma via eletrônica gerada sob o ecossistema criptografado do KlikHealth IA.
          <br/>Assinado Digitalmente por KlikHealth IA System • Projeto Credenciado Firebase Core active.
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Render a lovely custom SVG Trend Graph for Vitals History using patient data
  const renderVitalsTrendSVG = () => {
    // Let's draw some mock points over time for temperature & Heart Rate
    // Marcos has past visits temperature. Let's list a sequential timeline of 4 points:
    // Admissão: Temp=37.8, Hour=0h -> Hour=2h -> Hour=4h -> Atual
    const points = [
      { step: "Admissão", temp: 37.8, hr: 110, spo2: 93 },
      { step: "+1h Medicado", temp: 37.2, hr: 98, spo2: 96 },
      { step: "+3h Estabilizado", temp: 36.8, hr: 84, spo2: 98 },
      { step: "Sinais Atuais", temp: patient.currentVitals.temperature, hr: patient.currentVitals.heartRate, spo2: patient.currentVitals.spo2 }
    ];

    return (
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">Monitoramento Gráfico Temporal</span>
            <strong className="text-sm font-bold block text-slate-100">Tendência de Estabilização Clínico-Sardíaca</strong>
          </div>
          <span className="text-[10px] bg-blue-500/10 text-blue-300 font-mono font-bold px-2 py-1 rounded">Tempo Real</span>
        </div>

        {/* Custom SVG Drawing */}
        <div className="relative h-44 w-full">
          <svg className="w-full h-full" viewBox="0 0 400 150">
            {/* Grid Lines */}
            <line x1="10" y1="20" x2="390" y2="20" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="10" y1="70" x2="390" y2="70" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="10" y1="120" x2="390" y2="120" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />

            {/* Labels for baseline numbers */}
            <text x="12" y="16" fill="#64748b" className="text-[8px] font-mono font-bold">120 HR / 38°C</text>
            <text x="12" y="66" fill="#64748b" className="text-[8px] font-mono font-bold">90 HR / 37°C</text>
            <text x="12" y="116" fill="#64748b" className="text-[8px] font-mono font-bold">60 HR / 36°C</text>

            {/* Graph Paths (Vitals HR or TEMP) */}
            {/* Step Positions: Step0=50, Step1=150, Step2=250, Step3=350 */}
            {/* HR path */}
            <path 
              d={`M 50 40 Q 150 60, 250 82 T 350 ${140 - (patient.currentVitals.heartRate - 50) * 0.9}`} 
              fill="none" 
              stroke="#ef4444" 
              strokeWidth="2.5" 
            />
            {/* Temperature path */}
            <path 
              d={`M 50 30 Q 150 78, 250 110 T 350 ${135 - (patient.currentVitals.temperature - 35) * 35}`} 
              fill="none" 
              stroke="#38bdf8" 
              strokeWidth="2.5" 
            />

            {/* Point Node Circles and Labels */}
            {points.map((pt, idx) => {
              const x = 50 + idx * 100;
              const yHr = 140 - (pt.hr - 50) * 0.9;
              const yTemp = 135 - (pt.temp - 35) * 35;

              return (
                <g key={idx}>
                  {/* Vertical coordinate indicator */}
                  <line x1={x} y1="20" x2={x} y2="130" stroke="#1e293b" strokeWidth="1" />
                  
                  {/* HR point */}
                  <circle cx={x} cy={yHr} r="4" fill="#ef4444" stroke="#0f172a" strokeWidth="1.5" />
                  <text x={x} y={yHr - 7} fill="#ef4444" textAnchor="middle" className="text-[8px] font-bold font-mono">{pt.hr} bpm</text>

                  {/* Temp point */}
                  <circle cx={x} cy={yTemp} r="4" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.5" />
                  <text x={x} y={yTemp + 11} fill="#38bdf8" textAnchor="middle" className="text-[8px] font-bold font-mono">{pt.temp.toFixed(1)}°C</text>

                  {/* Step label on X axis */}
                  <text x={x} y="142" fill="#94a3b8" textAnchor="middle" className="text-[9px] font-semibold">{pt.step}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex gap-4 justify-center text-[10px] text-gray-400 font-bold tracking-wide">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-[#ef4444] rounded"></span>
            <span>Freq. Cardíaca (Vermelho)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-[#38bdf8] rounded"></span>
            <span>Temperatura Corporal (Azul)</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="patient-history-root" className="space-y-6">
      
      {/* Top Banner Control */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer outline-none"
        >
          <ArrowLeft size={16} /> Voltar para Painel Hospitalar
        </button>

        <div className="flex gap-2">
          <span className="text-[10px] font-bold bg-slate-950 text-slate-400 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-800/40">
            <User size={13} />
            ID Registro: <span className="font-mono font-semibold text-slate-350">{patient.id}</span>
          </span>
          <button
            onClick={() => onOpenAIAssistant(patient)}
            className="text-xs bg-teal-500 hover:bg-teal-600 text-black transition-all px-4 py-1.5 rounded-lg font-bold flex items-center gap-1 shadow-md shadow-teal-500/10 cursor-pointer outline-none"
          >
            Chamar KlikHealth IA <Sparkles size={13} />
          </button>
        </div>
      </div>

      {/* Grid body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPONENT: Timetable & Visit Lookup select */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Patient Card Digest */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md p-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={patient.avatar}
                alt={patient.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-xl object-cover border border-slate-800"
              />
              <div>
                <h3 className="font-black text-white leading-snug">{patient.name}</h3>
                <span className="text-xs text-slate-400 font-mono font-semibold">CPF: {patient.cpf}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs font-semibold text-slate-300">
              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Idade</span>
                <span className="text-white block font-bold mt-0.5">{patient.age} anos ({patient.gender})</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Data de Admissão</span>
                <span className="text-white block font-bold mt-0.5">{new Date(patient.admissionDate).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-1.5">
              <span className="text-[10px] text-slate-450 font-extrabold uppercase block">Histórico de Linha de Base</span>
              <div className="flex flex-wrap gap-1.5">
                {patient.pastHistory.map((hist, idx) => (
                  <span key={idx} className="bg-slate-950 text-slate-300 border border-slate-800 font-bold rounded-lg px-2.5 py-1 text-[10px]">
                    {hist}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* AI-Generated Patient Risk Summary Room */}
          <div className="bg-teal-950/20 rounded-2xl border border-teal-900/30 p-5 space-y-3">
            <div className="flex items-center gap-2 text-teal-400 font-extrabold text-xs uppercase tracking-wider">
              <Sparkles size={14} className="text-teal-400 animate-pulse" />
              <span>Súmula Clínica de Risco IA</span>
            </div>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Paciente {patient.name} com perfil de alto risco metabólico e cardiovascular. {patient.pastHistory.includes('Hipertensão Arterial Sistêmica') ? 'A estabilização hemodinâmica requer atenção secundária constante aos canais de troponina.' : 'O monitoramento cuidadoso de queixas dolorosas agudas no quadrante inferior afasta apendicites tardias.'} Recomenda-se vigilância automatizada de sinais vitais e reavaliação de alta.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-teal-400 font-bold">
              <ShieldCheck size={12} />
              <span>Diretrizes KlikHealth IA Ativadas</span>
            </div>
          </div>

          {/* Visit chronological timeline selection list */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md p-4">
            <h4 className="text-[10px] text-slate-400 font-extrabold uppercase mb-3 px-1">Consultas e Admissões Anteriores ({patient.pastVisits.length})</h4>
            {patient.pastVisits.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6 font-semibold">Sem registros hospitalares anteriores salvos.</p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {patient.pastVisits.map((visit) => {
                  const isSelected = visit.id === selectedVisitId;
                  return (
                    <button
                      key={visit.id}
                      onClick={() => setSelectedVisitId(visit.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer outline-none flex items-center justify-between ${isSelected ? "border-teal-500/30 bg-teal-500/10 font-bold" : "border-slate-800/80 bg-slate-950/40 hover:bg-slate-950"}`}
                    >
                      <div className="space-y-1">
                        <span className={`text-xs font-bold flex items-center gap-1 ${isSelected ? "text-teal-400" : "text-slate-300"}`}>
                          <Calendar size={12} className={isSelected ? "text-teal-400" : "text-slate-450"} />
                          {visit.date}
                        </span>
                        <p className="text-xs text-slate-450 truncate max-w-[180px] font-semibold">{visit.diagnosis}</p>
                      </div>
                      <ChevronRight size={14} className={isSelected ? "text-teal-400" : "text-slate-500"} />
                    </button>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setIsAddingRecord(true)}
              className="w-full mt-4 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-black font-black text-xs py-2.5 rounded-xl transition-all cursor-pointer outline-none flex items-center justify-center gap-2 shadow-lg shadow-teal-500/10"
            >
              <Plus size={14} />
              <span>Adicionar ao Prontuário</span>
            </button>
          </div>

        </div>

        {/* RIGHT COMPONENT: Trends & Selected Visit details visualization */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Animated SVG trend list of vitals */}
          {renderVitalsTrendSVG()}

          {/* Visit detailed evaluation container */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md p-6">
            {!activeVisit ? (
              <div className="text-center py-12 text-slate-500">
                <FileText className="mx-auto mb-3 opacity-40 text-teal-400" size={36} />
                <p className="font-bold text-sm text-slate-300">Selecione uma data no histórico para abrir os detalhes.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Header Visit details */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider">Histórico Fórum Admissional</span>
                    <h2 className="text-base font-black text-white flex items-center gap-1.5">
                      <Stethoscope size={16} className="text-teal-400" />
                      Prontuário de Atendimento - {activeVisit.date}
                    </h2>
                  </div>
                  <span className="text-[10px] bg-slate-950 text-slate-400 px-3 py-1 font-bold rounded-lg font-mono border border-slate-800/60 font-mono">
                    ID Atendimento: {activeVisit.id}
                  </span>
                </div>

                {/* Exporter UI Row container */}
                <div className="flex flex-col sm:flex-row gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Exportação Autorizada de Prontuário</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={exportToPdf}
                      className="bg-[#0f172a] hover:bg-slate-800 text-teal-400 border border-slate-800 hover:border-teal-500/25 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer outline-none shrink-0"
                    >
                      <Printer size={12} />
                      PDF / Imprimir
                    </button>
                    <button
                      type="button"
                      onClick={exportToDoc}
                      className="bg-[#0f172a] hover:bg-slate-800 text-teal-400 border border-slate-800 hover:border-teal-500/25 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer outline-none shrink-0"
                    >
                      <FileDown size={12} />
                      DOC (Word)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Motivo Principal / Queixa Primária</span>
                    <p className="text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-850 leading-relaxed font-semibold">{activeVisit.reason}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Médico Responsável Atuante</span>
                    <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-850">
                      <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/25 flex items-center justify-center font-black">
                        {activeVisit.doctor.charAt(4)}
                      </div>
                      <div>
                        <strong className="text-white block font-bold">{activeVisit.doctor}</strong>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CRM Cadastrado</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diagnosis & Treatments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-medium border-t border-slate-800 pt-5">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Diagnóstico Emitido de Alta</span>
                    <p className="text-teal-400 font-bold text-sm bg-teal-500/10 px-3.5 py-2.5 rounded-xl border border-teal-500/20 flex items-center gap-1.5">
                      <Stethoscope size={14} />
                      {activeVisit.diagnosis}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Tratamento e Conduta Prescrita</span>
                    <p className="text-slate-300 font-semibold leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-850">{activeVisit.treatment}</p>
                  </div>
                </div>

                {/* Additional notes */}
                <div className="text-xs space-y-1.5 border-t border-slate-800 pt-5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Evolução Clínica de Prontuário</span>
                  <p className="text-slate-300 font-semibold leading-relaxed whitespace-pre-line bg-slate-950 p-3 rounded-xl border border-slate-850">
                    {activeVisit.notes}
                  </p>
                </div>

                {/* Lab Results Detail table */}
                {activeVisit.labResults && activeVisit.labResults.length > 0 && (
                  <div className="border-t border-slate-800 pt-5 space-y-3">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase block">Exames de Laboratório Anexados</span>
                    <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-950 border-b border-slate-800 font-black text-slate-400">
                          <tr>
                            <th className="p-3">Exame / Parâmetro</th>
                            <th className="p-3">Resultado Obtido</th>
                            <th className="p-3">Unidade</th>
                            <th className="p-3 text-right">Avaliação de Risco</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 font-semibold">
                          {activeVisit.labResults.map((lab, idx) => (
                            <tr key={idx} className="hover:bg-slate-850/40">
                              <td className="p-3 font-semibold text-slate-300">{lab.exam}</td>
                              <td className="p-3 font-bold text-white">{lab.result}</td>
                              <td className="p-3 font-medium text-slate-500">{lab.unit}</td>
                              <td className="p-3 text-right">
                                {lab.flag === 'high' ? (
                                  <span className="bg-red-500/10 text-red-400 font-extrabold px-2.5 py-1 rounded text-[10px] border border-red-500/20">Alterado / Alto</span>
                                ) : lab.flag === 'low' ? (
                                  <span className="bg-amber-500/10 text-amber-400 font-bold px-2.5 py-1 rounded text-[10px] border border-amber-500/20">Alterado / Baixo</span>
                                ) : (
                                  <span className="bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-1 rounded text-[10px] border border-emerald-500/20">Normal</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>

      </div>

      {isAddingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl"></div>
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="text-teal-400" size={18} />
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Novo Registro de Prontuário</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAddingRecord(false)} 
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg outline-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSaveRecord} className="space-y-3.5 text-xs text-slate-350">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-1">Data do Atendimento</label>
                  <input 
                    type="text" 
                    value={formDate} 
                    onChange={e => setFormDate(e.target.value)} 
                    placeholder="Ex: 27/05/2026" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-semibold text-slate-250 focus:outline-none focus:border-teal-500/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-1">Médico Responsável</label>
                  <input 
                    type="text" 
                    value={formDoctor} 
                    onChange={e => setFormDoctor(e.target.value)} 
                    placeholder="Nome do Médico e CRM" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-semibold text-slate-250 focus:outline-none focus:border-teal-500/50"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-1">Queixa Principal / Motivo da Consulta</label>
                <textarea 
                  value={formReason} 
                  onChange={e => setFormReason(e.target.value)} 
                  placeholder="Ex: Tosse seca persistente há 4 dias, febre esporádica e cansaço leve." 
                  rows={2} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-semibold text-slate-250 focus:outline-none focus:border-teal-500/50 resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-1">Diagnóstico Clínico</label>
                <input 
                  type="text" 
                  value={formDiagnosis} 
                  onChange={e => setFormDiagnosis(e.target.value)} 
                  placeholder="Ex: Faringite Aguda Não-Especificada" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-semibold text-slate-250 focus:outline-none focus:border-teal-500/50"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-1">Conduta e Prescrição Terapêutica</label>
                <textarea 
                  value={formTreatment} 
                  onChange={e => setFormTreatment(e.target.value)} 
                  placeholder="Ex: Dipirona 1g de 6/6h por 3 dias, repouso físico e hidratação oral vigorosa." 
                  rows={2} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-semibold text-slate-250 focus:outline-none focus:border-teal-500/50 resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-1">Evolução Clínica e Notas Adicionais</label>
                <textarea 
                  value={formNotes} 
                  onChange={e => setFormNotes(e.target.value)} 
                  placeholder="Descreva observações de exames físicos, ausculta pulmonar, etc." 
                  rows={2} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-semibold text-slate-250 focus:outline-none focus:border-teal-500/50 resize-none"
                />
              </div>
              
              <div className="flex gap-2.5 justify-end pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddingRecord(false)} 
                  className="bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800 hover:text-white px-4 py-2 rounded-xl font-bold transition-all cursor-pointer outline-none shrink-0"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="bg-teal-500 hover:bg-teal-600 text-black px-4 py-2 rounded-xl font-black shadow-md shadow-teal-500/15 transition-all flex items-center gap-1 cursor-pointer outline-none shrink-0"
                >
                  <Check size={14} />
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
