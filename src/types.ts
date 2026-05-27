export interface Vitals {
  temperature: number; // °C
  bpSystolic: number; // mmHg
  bpDiastolic: number; // mmHg
  heartRate: number; // bpm
  respRate: number; // breaths/min
  spo2: number; // %
}

export interface PastVisit {
  id: string;
  date: string;
  reason: string;
  diagnosis: string;
  doctor: string;
  treatment: string;
  notes: string;
  labResults?: { exam: string; result: string; unit: string; flag?: "normal" | "high" | "low" }[];
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Masculino" | "Feminino" | "Outro";
  cpf: string;
  admissionDate: string;
  admissionReason: string;
  currentVitals: Vitals;
  triageCategory: "IMEDIATO" | "MUITO_URGENTE" | "URGENTE" | "POUCO_URGENTE" | "NAO_URGENTE";
  triageColor: "red" | "orange" | "yellow" | "green" | "blue";
  status: "internado" | "observacao" | "alta" | "espera";
  avatar: string;
  medicalRecordNotes: string;
  pastHistory: string[];
  allergies: string[];
  currentMedications: string[];
  pastVisits: PastVisit[];
}

export interface ActiveAlert {
  id: string;
  patientId: string;
  patientName: string;
  type: "danger" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  crm: string;
  rating: number;
  availableToday: boolean;
  avatar: string;
  workingHours: string;
  slots: { time: string; booked: boolean }[];
  phone?: string;
  email?: string;
  onlineStatus?: "online" | "offline" | "busy";
}

export interface ChatMessage {
  id: string;
  sender: "patient" | "doctor" | "assistant" | "system";
  text: string;
  timestamp: string;
}

export interface VirtualConsultation {
  id: string;
  patientName: string;
  patientAge: number;
  selectedDoctorId: string;
  selectedDoctorName: string;
  specialty: string;
  timeSlot: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "active";
  queueNumber: number;
  symptoms: string;
  chatHistory: ChatMessage[];
}
