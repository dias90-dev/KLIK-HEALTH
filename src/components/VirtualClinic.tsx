import React, { useState } from "react";
import { Doctor, ChatMessage, VirtualConsultation } from "../types";
import { mockDoctors } from "../data/mockPatients";
import { 
  Video, 
  Send, 
  User, 
  Clock, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Compass, 
  MessageSquare, 
  PhoneCall, 
  X,
  UserCheck2,
  CalendarCheck2,
  ShieldAlert,
  Mic,
  MicOff,
  Mail,
  Phone
} from "lucide-react";

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

interface VirtualClinicProps {
  onAddConsultation: (consultation: VirtualConsultation) => void;
  activeConsultation: VirtualConsultation | null;
  onUpdateConsultationStatus: (id: string, status: "completed" | "active") => void;
  hasAiKey: boolean;
}

export default function VirtualClinic({
  onAddConsultation,
  activeConsultation,
  onUpdateConsultationStatus,
  hasAiKey
}: VirtualClinicProps) {
  // Booking Setup state
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor>(mockDoctors[1]); // default Dra. Juliana
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [complaintText, setComplaintText] = useState("");
  
  // Interactive Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "assistant",
      text: "Olá! Seja bem-vindo(a) à nossa recepção clínica inteligente KlikHealth. Sou a sua enfermeira assistente de triagem virtual. Para iniciarmos o seu atendimento e agendarmos sua consulta médica com nossos plantonistas, me conte: Qual o seu nome completo, idade e quais sintomas principais você está vivenciando no momento?",
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  // Workflow states
  const [activeStep, setActiveStep] = useState<"onboarding_chat" | "doctor_select" | "booked_active" | "telemedicine">("onboarding_chat");

  const [isRecording, setIsRecording] = useState(false);

  const startSpeechRecognition = () => {
    const customWindow = window as unknown as WindowWithSpeechRecognition;
    const SpeechRecognitionClass = customWindow.SpeechRecognition || customWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      alert("A API de Reconhecimento de Voz não é suportada neste navegador ou ambiente iFrame. Por favor, tente no Google Chrome.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = "pt-BR";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onerror = (event: any) => {
        console.error("Erro no reconhecimento de voz:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(prev => {
          const space = prev ? " " : "";
          return prev + space + transcript;
        });
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "patient",
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setInputMessage("");
    setLoadingChat(true);

    // Try parsing name and age from user messages to populate booking forms lazily
    detectProfileDetails(inputMessage);

    try {
      const response = await fetch("/api/virtual-consultation-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ sender: m.sender, text: m.text })),
          userProfile: { name: patientName, age: patientAge, complaint: complaintText }
        })
      });

      if (!response.ok) throw new Error("Falha no chat reception.");

      const resData = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        text: resData.reply,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      // Fallback
      setChatMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        sender: "assistant",
        text: "Compreendo perfeitamente seus sintomas. Atualmente temos disponibilidade para consulta imediata de clínico geral hoje. Gostaria de seguir para as consultas disponíveis em nosso painel de médicos de plantão?",
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoadingChat(false);
    }
  };

  const detectProfileDetails = (text: string) => {
    // Basic regex extraction to pre-populate onboarding inputs for patient convenience
    if (!patientName) {
      const nameMatch = text.match(/(?:sou o|sou a|meu nome é|me chamo)\s+([A-ZÀ-Ý][a-zà-ÿ]+\s+[A-ZÀ-Ý][a-zà-ÿ]+)/i);
      if (nameMatch) setPatientName(nameMatch[1]);
    }
    if (!patientAge) {
      const ageMatch = text.match(/(\d+)\s*(?:anos|ano)/i);
      if (ageMatch) setPatientAge(ageMatch[1]);
    }
    if (!complaintText) {
      setComplaintText(text);
    }
  };

  const handleBookConsultation = () => {
    if (!patientName || !patientAge || !selectedTimeSlot) {
      alert("Por favor, preencha seu nome, idade e escolha um horário de consulta disponível.");
      return;
    }

    const newConsultation: VirtualConsultation = {
      id: `CONS-${Math.floor(Math.random() * 900) + 100}`,
      patientName: patientName,
      patientAge: Number(patientAge),
      selectedDoctorId: selectedDoctor.id,
      selectedDoctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      timeSlot: selectedTimeSlot,
      status: "confirmed",
      queueNumber: Math.floor(Math.random() * 4) + 1, // Random low queue spot
      symptoms: complaintText || "Avaliação de triagem de sintomas respiratórios ou dores agudas.",
      chatHistory: chatMessages
    };

    onAddConsultation(newConsultation);
    
    // Auto-advance
    setActiveStep("booked_active");
  };

  // Skip onboarding chat and go direct to schedule lookup
  const goToScheduleDirect = () => {
    if (!patientName) setPatientName("Paciente Convidado");
    if (!patientAge) setPatientAge("30");
    setActiveStep("doctor_select");
  };

  const startTelemedicineCall = () => {
    if (activeConsultation) {
      onUpdateConsultationStatus(activeConsultation.id, "active");
      setActiveStep("telemedicine");
    }
  };

  const completeTelemedicineCall = () => {
    if (activeConsultation) {
      onUpdateConsultationStatus(activeConsultation.id, "completed");
      setActiveStep("onboarding_chat");
      
      // Reset Chat list and book configurations
      setChatMessages([
        {
          id: "welcome-reset",
          sender: "assistant",
          text: "Parabéns! Sua consulta virtual anterior foi finalizada com sucesso. Caso necessite relatar novos sintomas de urgência ou queira reagendar um horário de rotina, me envie uma mensagem!",
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setPatientName("");
      setPatientAge("");
      setSelectedTimeSlot("");
      setComplaintText("");
    }
  };

  return (
    <div id="virtual-clinic-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
      
      {/* LEFT COMPONENT COLUMN: Chat & Virtual Screen */}
      <div className="lg:col-span-8 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[600px]">
        
        {/* Onboarding Pre-triage Chat View */}
        {activeStep === "onboarding_chat" && (
          <div className="flex flex-col h-full">
            <div className="bg-slate-950 text-white p-4 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight text-white block">Triagem Virtual & Horários Livres</h3>
                  <span className="text-[10px] text-gray-400 block font-semibold leading-normal">KlikHealth Medicina Familiar</span>
                </div>
              </div>

              <button
                onClick={goToScheduleDirect}
                className="bg-blue-600 hover:bg-blue-700 transition-colors py-1.5 px-3 rounded-lg text-xs font-bold shrink-0 outline-none"
              >
                Ver Grade de Médicos Diretamente
              </button>
            </div>

            {/* Bubble Message Display area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
              {chatMessages.map((msg) => {
                const isAssistant = msg.sender === "assistant";
                return (
                  <div key={msg.id} className={`flex gap-2 w-full max-w-[85%] ${isAssistant ? "" : "ml-auto flex-row-reverse"}`}>
                    
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isAssistant ? "bg-blue-500 text-white" : "bg-emerald-500 text-white"}`}>
                      {isAssistant ? "Hospital" : <User size={13} />}
                    </div>

                    <div className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-xs ${isAssistant ? "bg-white text-gray-800 border border-gray-100" : "bg-blue-600 text-white"}`}>
                      <p>{msg.text}</p>
                      <span className={`text-[9px] block text-right mt-1.5 font-mono ${isAssistant ? "text-gray-400" : "text-blue-100"}`}>{msg.timestamp}</span>
                    </div>

                  </div>
                );
              })}

              {loadingChat && (
                <div className="flex gap-2 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs">AI</div>
                  <div className="bg-white text-gray-500 p-3 rounded-2xl text-xs border border-gray-100 shadow-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Form messaging input bar */}
            <div className="p-3 border-t border-gray-100 shrink-0 bg-white flex flex-col gap-1.5">
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={startSpeechRecognition}
                  className={`p-2.5 rounded-xl transition-all flex items-center justify-center outline-none shrink-0 cursor-pointer ${isRecording ? "bg-red-500 text-white animate-pulse shadow-md shadow-red-500/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  title={isRecording ? "Gravando áudio..." : "Dicte seus sintomas"}
                >
                  {isRecording ? <MicOff size={15} /> : <Mic size={15} />}
                </button>
                <input
                  type="text"
                  placeholder={isRecording ? "Escutando..." : "Descreva sintomas, seu nome e idade para realizar a triagem..."}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                  className="flex-1 px-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 font-semibold text-slate-800 bg-white placeholder-slate-400"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white transition-colors p-2.5 rounded-xl flex items-center justify-center outline-none shrink-0 cursor-pointer"
                >
                  <Send size={15} />
                </button>
              </div>
              {isRecording && (
                <div className="text-[10px] text-red-500 font-black px-1 flex items-center gap-1.5 animate-pulse select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>Ouvindo seus sintomas por canal de áudio em tempo real...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Doctor Select Grade Setup */}
        {activeStep === "doctor_select" && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-base text-gray-900 leading-tight">Agendamento de Consultório Virtual</h3>
              <button
                onClick={() => setActiveStep("onboarding_chat")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Micro login detail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-gray-100 text-xs">
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Seu Nome Completo</label>
                <input
                  type="text"
                  placeholder="Insira para prontuário"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 font-semibold text-gray-700 bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Sua Idade</label>
                <input
                  type="number"
                  placeholder="Idade em anos"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 font-semibold text-gray-700 bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Doctors list cards */}
            <div className="space-y-3">
              <strong className="text-xs font-bold text-slate-800 block">Médicos de Plantão Disponíveis Hoje:</strong>
              {mockDoctors.map((doc) => {
                const isSelected = selectedDoctor.id === doc.id;
                
                // Color mapping for online status dot
                const statusColor = 
                  doc.onlineStatus === "online" ? "bg-emerald-500 border-white" :
                  doc.onlineStatus === "busy" ? "bg-amber-500 border-white" :
                  "bg-slate-400 border-white";
                
                const statusLabel = 
                  doc.onlineStatus === "online" ? "Online Agora" :
                  doc.onlineStatus === "busy" ? "Em Atendimento" :
                  "Inativo / Fora";

                return (
                  <div
                    key={doc.id}
                    onClick={() => { setSelectedDoctor(doc); setSelectedTimeSlot(""); }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${isSelected ? "border-blue-400 bg-blue-50/25 ring-1 ring-blue-400/20" : "border-gray-100 hover:border-gray-200 bg-white"}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar with live status indicator bubble */}
                      <div className="relative shrink-0">
                        <img
                          src={doc.avatar}
                          alt={doc.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-xs"
                        />
                        <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${statusColor} shadow-md flex items-center justify-center`} title={statusLabel}>
                          <span className={`w-1.5 h-1.5 rounded-full ${doc.onlineStatus === "online" ? "bg-emerald-200 animate-ping" : doc.onlineStatus === "busy" ? "bg-amber-200" : "bg-slate-100"}`}></span>
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-gray-900 text-sm leading-tight">{doc.name}</h4>
                          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded font-mono ${
                            doc.onlineStatus === 'online' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {statusLabel}
                          </span>
                        </div>
                        <span className="text-blue-600 block font-bold text-xs">{doc.specialty}</span>
                        
                        <div className="flex flex-wrap gap-x-2.5 gap-y-1 items-center text-[10px] text-gray-400 font-semibold mt-1">
                          <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{doc.crm}</span>
                          <span className="text-amber-500 font-bold flex items-center gap-0.5">★ {doc.rating.toFixed(1)}</span>
                          <span>•</span>
                          <span className="text-indigo-600 font-bold flex items-center gap-1">
                            <Clock size={11} /> Plantão: {doc.workingHours}
                          </span>
                        </div>

                        {/* Unique Contact numbers and email */}
                        <div className="flex flex-col sm:flex-row gap-x-3 gap-y-1 text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-50 mt-1">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Phone size={11} className="text-slate-400" />
                            <strong>Fone:</strong> {doc.phone || "(11) 98000-0000"}
                          </span>
                          <span className="hidden sm:inline text-slate-300">|</span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <Mail size={11} className="text-slate-400" />
                            <strong>E-mail:</strong> {doc.email || "contato@hospitalia.com.br"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Time slots buttons for selected doctor */}
                    <div className="flex flex-col gap-2 shrink-0 justify-end items-start md:items-end w-full md:w-auto">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block md:text-right font-mono">
                        Horários de Consulta:
                      </span>
                      <div className="flex flex-wrap gap-1.5 text-[10px] md:max-w-[220px] font-semibold justify-start md:justify-end">
                        {doc.slots.map((slot, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            disabled={slot.booked}
                            onClick={(e) => { e.stopPropagation(); setSelectedDoctor(doc); setSelectedTimeSlot(slot.time); }}
                            className={`px-2.5 py-1.5 rounded-lg font-bold border transition-all ${
                              slot.booked 
                                ? "border-transparent bg-slate-100 text-slate-400 cursor-not-allowed line-through" 
                                : selectedTimeSlot === slot.time && isSelected 
                                  ? "bg-blue-600 text-white border-transparent shadow-xs" 
                                  : "border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 bg-white cursor-pointer"
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={handleBookConsultation}
                disabled={!patientName || !patientAge || !selectedTimeSlot}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-extrabold text-sm py-3 rounded-xl shadow-md cursor-pointer outline-none transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                <CalendarCheck2 size={16} /> Confirmar Pré-Agendamento de Telemedicina
              </button>
            </div>

          </div>
        )}

        {/* Live Active Queue and Booked panel */}
        {activeStep === "booked_active" && activeConsultation && (
          <div className="p-8 overflow-y-auto flex flex-col items-center justify-center text-center space-y-6 flex-1 bg-gradient-to-b from-blue-50/10 to-transparent">
            
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center animate-bounce">
              <Video size={28} />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-emerald-600 font-extrabold uppercase bg-emerald-100 px-3 py-1 rounded-full">Consulta Confirmada</span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Sala de Espera Virtual Ativa</h2>
              <p className="text-xs text-gray-500 max-w-md font-semibold font-sans">
                Você agendou com o <span className="text-gray-800 font-bold">{activeConsultation.selectedDoctorName}</span> ({activeConsultation.specialty}) no horário de <span className="text-gray-800 font-bold">{activeConsultation.timeSlot}</span>.
              </p>
            </div>

            {/* Queue indicator widget */}
            <div className="border border-slate-100 shadow-sm bg-white p-5 rounded-2xl w-full max-w-sm grid grid-cols-2 divide-x divide-gray-100">
              <div className="text-center font-bold">
                <span className="text-[9px] text-gray-400 block uppercase">Sua Posição</span>
                <span className="text-3xl font-black text-rose-500 block mt-1">{activeConsultation.queueNumber}° lugar</span>
                <span className="text-[9px] text-slate-400 block mt-1">na fila de espera</span>
              </div>
              <div className="text-center font-bold">
                <span className="text-[9px] text-gray-400 block uppercase">Tempo de Espera</span>
                <span className="text-3xl font-black text-gray-800 block mt-1">{activeConsultation.queueNumber * 5} min</span>
                <span className="text-[9px] text-slate-400 block mt-1">estimativa média</span>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full max-w-sm space-y-3">
              <button
                onClick={startTelemedicineCall}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl tracking-wider uppercase flex items-center justify-center gap-2 outline-none cursor-pointer"
              >
                <Video size={14} /> Entrar na Sala de Vídeo do Plantonista
              </button>
              
              <button
                onClick={() => setActiveStep("doctor_select")}
                className="w-full text-xs font-semibold text-gray-500 hover:text-gray-700 shrink-0 outline-none"
              >
                Alterar Agendamento / Médico
              </button>
            </div>

            <div className="text-[10px] text-gray-400 max-w-xs leading-relaxed font-semibold">
              Mantenha o navegador aberto. Nós enviaremos um alerta automático de áudio assim que a médica acionar a sua chamada por câmera.
            </div>

          </div>
        )}

        {/* Live Active Telemedicine Telehealth Screen */}
        {activeStep === "telemedicine" && activeConsultation && (
          <div className="flex flex-col h-full bg-slate-950 text-white relative">
            
            {/* Stream View Container */}
            <div className="flex-1 bg-slate-900 relative flex items-center justify-center overflow-hidden">
              <img
                src={mockDoctors.find(d => d.name === activeConsultation.selectedDoctorName)?.avatar}
                alt="Doctor Video"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-75 animate-pulse"
              />

              {/* Status and indicators on video */}
              <div className="absolute top-4 left-4 bg-slate-950/80 px-3 py-1 bg-opacity-70 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-800 text-white uppercase tracking-wider">
                <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping items-center shrink-0"></span> TRANSMITINDO AO VIVO
              </div>

              <div className="absolute bottom-4 left-4 bg-slate-950/80 px-3 py-1.5 rounded-lg text-[10px] font-mono border border-slate-800 text-gray-300">
                Médico: {activeConsultation.selectedDoctorName} • CRM Ativo
              </div>

              {/* Patient thumbnail overlay */}
              <div className="absolute bottom-4 right-4 w-24 h-32 bg-slate-950 rounded-xl overflow-hidden border-2 border-slate-800/80 shadow-lg">
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-xs font-sans text-gray-300 font-bold">
                  Sua Câmera
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="p-4 bg-slate-950 border-t border-slate-900 shrink-0 flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs">{activeConsultation.patientName} ({activeConsultation.patientAge}A)</h4>
                <p className="text-[10px] text-slate-400">Consulta de Triage e Prontuário Inteligente</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={completeTelemedicineCall}
                  className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl uppercase shrink-0 outline-none cursor-pointer"
                >
                  Desconectar / Encerrar Chamada
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* RIGHT COMPONENT COLUMN: Information Side card */}
      <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-5 h-fit">
        <div>
          <span className="text-[10px] text-blue-600 font-extrabold uppercase bg-blue-50 px-2 py-0.5 rounded">Como Funciona a Clínica</span>
          <h3 className="font-bold text-gray-800 mt-2 text-sm">Consultório de Plantão 24/7</h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed font-semibold">
            Nosso portal de telemedicina do KlikHealth integra triagem de inteligência artificial de sintomas com agendamentos automatizados.
          </p>
        </div>

        {/* Available specialties details list */}
        <div className="border-t border-gray-100 pt-4 space-y-3.5 text-xs">
          <strong className="text-gray-800 font-bold uppercase tracking-wider text-[10px] block">Nossas Clínicas de Suporte</strong>
          
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 shrink-0 flex items-center justify-center font-bold">
              +
            </div>
            <div>
              <strong className="text-gray-800 block text-xs font-bold leading-normal">Residência Clínica Geral</strong>
              <p className="text-gray-500 text-[11px] leading-relaxed font-semibold mt-0.5">Atendimento prioritário para cefaleias, tosses, dores abdominais gerais ou prescrições rotineiras.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 shrink-0 flex items-center justify-center font-bold">
              N
            </div>
            <div>
              <strong className="text-gray-800 block text-xs font-bold leading-normal">Setor Neurologia de Trato Crônico</strong>
              <p className="text-gray-500 text-[11px] leading-relaxed font-semibold mt-0.5">Especialidade voltada para controle de crises migranosas severas com aura, e tonturas refratárias.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 shrink-0 flex items-center justify-center font-bold">
              C
            </div>
            <div>
              <strong className="text-gray-800 block text-xs font-bold leading-normal">Cardiologia em Urgência Relativa</strong>
              <p className="text-gray-500 text-[11px] leading-relaxed font-semibold mt-0.5">Investigações de dores precordiais, arritmias, crises hipertensivas e acompanhamento pós-operatório.</p>
            </div>
          </div>
        </div>

        {/* Safety checklist notice */}
        <div className="bg-red-50 border border-red-100/50 p-4 rounded-xl flex items-start gap-2 text-xs font-semibold text-red-700 leading-relaxed shrink-0">
          <ShieldAlert className="text-red-500 mt-0.5 shrink-0" size={16} />
          <div>
            <strong className="block font-bold">Aviso de Emergência Médica</strong>
            Se você estiver apresentando dor sufocante no peito que irradia para o braço, cansaço extremo ou perda repentina de movimentos/fala, não aguarde o plantão virtual: ligue imediatamente para o Samu (192) ou procure a urgência física mais próxima.
          </div>
        </div>

      </div>

    </div>
  );
}
