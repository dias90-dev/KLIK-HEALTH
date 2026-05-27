import { Patient, ActiveAlert, Doctor, VirtualConsultation } from "../types";

export const initialPatients: Patient[] = [
  {
    id: "PAT-001",
    name: "Marcos de Souza Silveira",
    age: 67,
    gender: "Masculino",
    cpf: "123.456.789-00",
    admissionDate: "2026-05-27T07:30:00Z",
    admissionReason: "Dor precordial opressiva de início há 2 horas, com irradiação para membro superior esquerdo, acompanhada de sudorese fria e náuseas.",
    currentVitals: {
      temperature: 36.4,
      bpSystolic: 155,
      bpDiastolic: 95,
      heartRate: 104,
      respRate: 22,
      spo2: 94
    },
    triageCategory: "MUITO_URGENTE",
    triageColor: "orange",
    status: "observacao",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    medicalRecordNotes: "Paciente hipertenso e diabético de longa data, tabagista ativo (30 maços/ano). Nega IAM prévio. ECG inicial demonstra supradesnivelamento de segmento ST limítrofe em parede inferior, solicitada dosagem seriada de Troponina Ultrassensível.",
    pastHistory: ["Hipertensão Arterial Sistêmica", "Diabetes Mellitus Tipo 2", "Dislipidemia", "Tabagismo Extremo"],
    allergies: ["Contraste Iodado (Suspeito)", "Ácido Acetilsalicílico (relata intolerância gástrica severa)"],
    currentMedications: ["Losartana 50mg/dia", "Metformina 850mg 2x/dia", "Sinvastatina 40mg/noite"],
    pastVisits: [
      {
        id: "VIS-101",
        date: "2026-02-15",
        reason: "Check-up ambulatorial cardiológico.",
        diagnosis: "Hipertensão compensada e dislipidemia persistente",
        doctor: "Dr. Henrique Azevedo (Cardiologista)",
        treatment: "Ajuste na dose de Sinvastatina de 20mg para 40mg. Reforço em orientações dietéticas.",
        notes: "Paciente com baixa adesão a atividades físicas. Relata manter tabagismo moderado.",
        labResults: [
          { exam: "Colesterol Total", result: "245", unit: "mg/dL", flag: "high" },
          { exam: "LDL-C", result: "162", unit: "mg/dL", flag: "high" },
          { exam: "Creatinina", result: "1.1", unit: "mg/dL", flag: "normal" },
          { exam: "HbA1c", result: "7.2", unit: "%", flag: "high" }
        ]
      },
      {
        id: "VIS-102",
        date: "2025-11-10",
        reason: "Crise tensional associada a pico de estresse ocupacional.",
        diagnosis: "Efeito Rebote Hipertensivo por Suspensão Medicamentosa",
        doctor: "Dra. Juliana Costa",
        treatment: "Captopril 25mg VO em dose única com melhora. Reinício supervisionado da terapia padrão.",
        notes: "Pressão no acolhimento estava 190/110 mmHg. Sem sinais de lesão aguda de órgão-alvo ao exame neurológico e fundoscópico."
      }
    ]
  },
  {
    id: "PAT-002",
    name: "Roberta Leitão Fontes",
    age: 28,
    gender: "Feminino",
    cpf: "987.654.321-11",
    admissionDate: "2026-05-27T08:15:00Z",
    admissionReason: "Cefaleia de forte intensidade (9/10), holocraniana latejante, com náuseas severas e vômitos persistentes. Fotofobia e fonofobia marcantes.",
    currentVitals: {
      temperature: 36.8,
      bpSystolic: 125,
      bpDiastolic: 80,
      heartRate: 78,
      respRate: 16,
      spo2: 99
    },
    triageCategory: "URGENTE",
    triageColor: "yellow",
    status: "observacao",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    medicalRecordNotes: "Histórico de enxaqueca crônica refratária com aura visual. Refere piora importante após privação de sono acentuada. Tomou analgésicos em casa (paracetamol + ibuprofeno) sem alívio.",
    pastHistory: ["Enxaqueca refratária com aura", "Síndrome do Intestino Irritável (SII)"],
    allergies: ["Dipirona (Erupção cutânea maculopapular)"],
    currentMedications: ["Amitriptilina 25mg ao deitar", "Topiramato 50mg 2x/dia"],
    pastVisits: [
      {
        id: "VIS-201",
        date: "2026-03-20",
        reason: "Crise migranosa excruciante e refratária a medicações orais.",
        diagnosis: "Migrânea Crônica Agudizada com Vômitos Intratáveis",
        doctor: "Dr. Eduardo Rocha (Neurologista)",
        treatment: "Protocolo de resgate com Cetoprofeno 100mg IV + Metoclopramida 10mg IV + Haloperidol 2.5mg IV de resgate.",
        notes: "Melhora completa do quadro analgésico após 2 horas de hidratação e infusão medicamentosa rápida. Reorientado controle estressivo.",
        labResults: [
          { exam: "Hemograma", result: "Normal", unit: "-", flag: "normal" },
          { exam: "Potássio Sérico", result: "4.1", unit: "mEq/L", flag: "normal" }
        ]
      }
    ]
  },
  {
    id: "PAT-003",
    name: "Marta Albuquerque Mendes",
    age: 45,
    gender: "Feminino",
    cpf: "111.222.333-44",
    admissionDate: "2026-05-27T09:00:00Z",
    admissionReason: "Hálito cetônico, náuseas severas, dor abdominal difusa acompanhada de desidratação mucocutânea e taquipneia profunda e rápida.",
    currentVitals: {
      temperature: 37.2,
      bpSystolic: 105,
      bpDiastolic: 65,
      heartRate: 118,
      respRate: 26,
      spo2: 96
    },
    triageCategory: "MUITO_URGENTE",
    triageColor: "orange",
    status: "espera",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    medicalRecordNotes: "Paciente diagnosticada com Diabetes Mellitus Tipo 1 desde a infância. Refere suspensão inapropriada da aplicação de insulina nos últimos 3 dias por quadro depressivo em casa.",
    pastHistory: ["Diabetes Mellitus Tipo 1 (DM1)", "Hipotireoidismo de Hashimoto", "Transtorno Depressivo Maior"],
    allergies: ["Sem Alergias Conhecidas (SAD)"],
    currentMedications: ["Insulina Glargina 24 UI SC à noite", "Insulina Asparte móvel conforme glicemia capilar", "Levotiroxina Sódica 75mcg/dia", "Sertralina 100mg/dia"],
    pastVisits: [
      {
        id: "VIS-301",
        date: "2025-12-05",
        reason: "Consulta de rotina endocrinológica",
        diagnosis: "Diabetes Tipo 1 Descompensado com episódios de hipoglicemia noturna espontânea",
        doctor: "Dra. Juliana Costa",
        treatment: "Redução da dose de Glargina de 28 UI para 24 UI e monitoramento intensivo com sensor livre de glicose (Libre).",
        notes: "Excelente adesão prévia, descompensação recente de cunho psicossocial. Encaminhamento para psicologia focado.",
        labResults: [
          { exam: "Hemoglobina Glicada (HbA1c)", result: "8.9", unit: "%", flag: "high" },
          { exam: "Glicemia de Jejum", result: "189", unit: "mg/dL", flag: "high" },
          { exam: "TSH", result: "3.4", unit: "mIU/L", flag: "normal" }
        ]
      }
    ]
  },
  {
    id: "PAT-004",
    name: "Enzo Fernandes Lima",
    age: 6,
    gender: "Masculino",
    cpf: "444.555.666-77",
    admissionDate: "2026-05-27T09:10:00Z",
    admissionReason: "Dispneia aguda acompanhada de sibilância expiratória audível sem estetoscópio, tosse seca e retrações intercostais leves. Iniciou pós-gripe leve.",
    currentVitals: {
      temperature: 37.0,
      bpSystolic: 100,
      bpDiastolic: 60,
      heartRate: 122,
      respRate: 34,
      spo2: 91
    },
    triageCategory: "URGENTE",
    triageColor: "yellow",
    status: "observacao",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
    medicalRecordNotes: "Paciente pediátrico, asmático grave. Uso regular de budesonida suspensa pelos pais há 1 mês alegando melhora. Mãe relata que realizou 3 puffs de Salbutamol em casa com melhora parcial e temporária.",
    pastHistory: ["Asma Brônquica Moderada-Grave", "Rinite Alérgica Grave"],
    allergies: ["Poeira", "Penicilinas (Anafilaxia documentada)"],
    currentMedications: ["Budesonida + Formoterol 200/6mcg 1 puff 12/12h (suspenso)", "Montelucaste de Sódio 4mg sachê à noite"],
    pastVisits: [
      {
        id: "VIS-401",
        date: "2026-01-12",
        reason: "Crise asmática desencadeada por infecção viral alta de vias superiores.",
        diagnosis: "Asma Brônquica Grave Agudizada - Resolução Adequada",
        doctor: "Dra. Juliana Costa",
        treatment: "Inalação com Aerolin 5 gotas de 20 em 20 min + Prednisolona 1mg/kg VO dose única. Prescrito retorno e repouso.",
        notes: "Mãe foi orientada rigorosamente a não suspender a budesonida inalatória de controle fixo preventivo diario."
      }
    ]
  },
  {
    id: "PAT-005",
    name: "Júlia Martins Ramos",
    age: 34,
    gender: "Feminino",
    cpf: "333.444.555-88",
    admissionDate: "2026-05-27T09:20:00Z",
    admissionReason: "Dor abdominal em cólica persistente e progressiva em fossa ilíaca direita, iniciada na região periumbilical há 14 horas. Acompanhada de anorexia extrema e febre baixa.",
    currentVitals: {
      temperature: 37.8,
      bpSystolic: 115,
      bpDiastolic: 75,
      heartRate: 92,
      respRate: 18,
      spo2: 98
    },
    triageCategory: "URGENTE",
    triageColor: "yellow",
    status: "espera",
    avatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&h=150&fit=crop&crop=face",
    medicalRecordNotes: "Gesta 1, Para 1. Menstruação regular, última menstruação há 14 dias. Apresenta sinal de Blumberg francamente positivo no ponto de McBurney. Suspeita clínica majoritária de Apendicite Aguda.",
    pastHistory: ["Colecistectomia por Videolaparoscopia (2023)"],
    allergies: ["Sem Alergias Conhecidas (SAD)"],
    currentMedications: ["Anticoncepcional Oral Combinado regular"],
    pastVisits: []
  }
];

export const initialAlerts: ActiveAlert[] = [
  {
    id: "AL-001",
    patientId: "PAT-001",
    patientName: "Marcos de Souza Silveira",
    type: "danger",
    title: "Alerta de Crise Isquêmica Coronária (IAM)",
    message: "Dosagem inicial de Troponina Ultrassensível alterada. Solicitada reavaliação imediata de eletrocardiograma por possível supra de ST dinâmico.",
    timestamp: "10 min atrás",
    resolved: false
  },
  {
    id: "AL-002",
    patientId: "PAT-003",
    patientName: "Marta Albuquerque Mendes",
    type: "danger",
    title: "Risco Elevado de Cetoacidose Diabética (CAD)",
    message: "Glicemia capilar ultrapassou limites (> 380 mg/dL). Presença de taquipneia evidente com hálito cetônico sugestivo de acidose metabólica grave.",
    timestamp: "23 min atrás",
    resolved: false
  },
  {
    id: "AL-003",
    patientId: "PAT-004",
    patientName: "Enzo Fernandes Lima",
    type: "warning",
    title: "Alerta de Hipoxemia Aguda Pediátrica",
    message: "Saturação de Oxigênio (SpO2) instável variando entre 90%-91% sob ar ambiente. Recomendado posicionamento de cateter nasal de O2 1L/min.",
    timestamp: "35 min atrás",
    resolved: false
  },
  {
    id: "AL-004",
    patientId: "PAT-002",
    patientName: "Roberta Leitão Fontes",
    type: "info",
    title: "Prescrição de Resgate Pendente",
    message: "Paciente aguarda início da infusão do protocolo analgésico de resgate endovenoso contra crise severa de migrânea.",
    timestamp: "45 min atrás",
    resolved: false
  }
];

export const mockDoctors: Doctor[] = [
  {
    id: "DOC-001",
    name: "Dr. Eduardo Rocha",
    specialty: "Neurologista de Plantão",
    crm: "CRM-SP 12345",
    rating: 4.9,
    availableToday: true,
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face",
    workingHours: "08:00 - 18:00",
    phone: "(11) 98765-4321",
    email: "eduardo.rocha@hospitalia.com.br",
    onlineStatus: "online",
    slots: [
      { time: "10:00", booked: true },
      { time: "11:00", booked: true },
      { time: "14:30", booked: false },
      { time: "16:00", booked: false }
    ]
  },
  {
    id: "DOC-002",
    name: "Dra. Juliana Costa",
    specialty: "Clínica Geral & Triagem",
    crm: "CRM-SP 54321",
    rating: 4.8,
    availableToday: true,
    avatar: "https://images.unsplash.com/photo-1594824813573-246434e33963?w=150&h=150&fit=crop&crop=face",
    workingHours: "07:00 - 16:00",
    phone: "(11) 97654-3210",
    email: "juliana.costa@hospitalia.com.br",
    onlineStatus: "online",
    slots: [
      { time: "11:15", booked: false },
      { time: "13:00", booked: true },
      { time: "14:45", booked: true },
      { time: "15:30", booked: false }
    ]
  },
  {
    id: "DOC-003",
    name: "Dr. Henrique Azevedo",
    specialty: "Cardiologista Emergencista",
    crm: "CRM-SP 98765",
    rating: 5.0,
    availableToday: true,
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&h=150&fit=crop&crop=face",
    workingHours: "09:00 - 19:00",
    phone: "(11) 96543-2109",
    email: "henrique.azevedo@hospitalia.com.br",
    onlineStatus: "busy",
    slots: [
      { time: "09:30", booked: true },
      { time: "10:30", booked: true },
      { time: "14:00", booked: false },
      { time: "15:00", booked: false },
      { time: "17:30", booked: false }
    ]
  }
];

export const mockVirtualConsultations: VirtualConsultation[] = [
  {
    id: "CONS-001",
    patientName: "Carlos Alberto Nunes",
    patientAge: 42,
    selectedDoctorId: "DOC-002",
    selectedDoctorName: "Dra. Juliana Costa",
    specialty: "Clínica Geral & Triagem",
    timeSlot: "13:00",
    status: "completed",
    queueNumber: 0,
    symptoms: "Tosse produtiva intensa, febre de 38.2C há 3 dias e cansaço ao subir escadas.",
    chatHistory: [
      { id: "msg-1", sender: "patient", text: "Boa tarde, estou com muita febre.", timestamp: "12:55" },
      { id: "msg-2", sender: "doctor", text: "Boa tarde, Carlos. Analisando seus sintomas clínicos, temos um quadro respiratório agudo. Prescrevi exames e repouso de 5 dias.", timestamp: "13:10" }
    ]
  }
];
