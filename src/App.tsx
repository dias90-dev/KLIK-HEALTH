import React, { useState, useEffect, useRef } from "react";
import { Patient, ActiveAlert, Vitals, VirtualConsultation, PastVisit } from "./types";
import { 
  initialPatients, 
  initialAlerts, 
  mockVirtualConsultations 
} from "./data/mockPatients";

// Firebase Imports
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  getDocs, 
  updateDoc,
  getDoc
} from "firebase/firestore";

// Sub-component workspaces
import AuthScreen from "./components/AuthScreen";
import DoctorDashboard from "./components/DoctorDashboard";
import AIClinicalAssistant from "./components/AIClinicalAssistant";
import PatientHistory from "./components/PatientHistory";
import VirtualClinic from "./components/VirtualClinic";
import AdminReports from "./components/AdminReports";
import PlanosPreco from "./components/PlanosPreco";

// Icons 
import { 
  Heart, 
  Users, 
  Plus, 
  FileSpreadsheet, 
  Activity, 
  Sparkles, 
  UserSquare2, 
  CalendarRange, 
  Settings, 
  LogOut, 
  CheckSquare, 
  Bell, 
  CircleDot,
  BookmarkCheck,
  Building,
  AlertTriangle,
  X,
  Check,
  Eye,
  ArrowRight,
  Search,
  CreditCard
} from "lucide-react";

export default function App() {
  // Authentication States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Portal Navigation State
  const [currentUserRole, setCurrentUserRole] = useState<"medico" | "paciente">("medico");

  // Accessibility Font Size state ("aumenta o tamanho de letras")
  const [fontSize, setFontSize] = useState<"small" | "normal" | "large" | "xlarge">(() => {
    return (localStorage.getItem("klikhealth_font_size") as "small" | "normal" | "large" | "xlarge") || "normal";
  });

  useEffect(() => {
    // We target higher percentage scales to fulfill "aumenta o tamanho de letras" nicely!
    const sizeMap = {
      small: "110%",   // Slightly scaled
      normal: "125%",  // Visibly larger by default
      large: "140%",   // Big text
      xlarge: "155%",  // High accessibility scale
    };
    document.documentElement.style.fontSize = sizeMap[fontSize];
    localStorage.setItem("klikhealth_font_size", fontSize);
  }, [fontSize]);

  // Hook to robustly update role and sync to UserProfile document in Firestore
  const handleSetCurrentUserRole = async (role: "medico" | "paciente") => {
    setCurrentUserRole(role);
    if (currentUser) {
      try {
        await setDoc(doc(db, "users", currentUser.uid), {
          userId: currentUser.uid,
          email: currentUser.email || "",
          displayName: currentUser.displayName || currentUser.email?.split("@")[0] || "Usuário",
          role: role,
          createdAt: new Date().toISOString()
        }, { merge: true });
        console.log("Successfully updated UserProfile role in Firestore:", role);
      } catch (err) {
        console.warn("Could not save UserProfile record under users/ collection in Firestore:", err);
      }
    }
  };
  
  // Medical Portal Sub-tab structure
  const [activeMedicalTab, setActiveMedicalTab] = useState<"painel_triagem" | "suporte_ia" | "auditoria_qualidade" | "planos_preco">("painel_triagem");

  // Subscription Plan State: "gratis" is Free, "premium" is Unlimited Paid
  const [currentPlan, setCurrentPlan] = useState<"gratis" | "premium">("gratis");
  // Per session AI Query Count limit tracker for gratis plan
  const [aiQueryCount, setAiQueryCount] = useState<number>(0);

  // Global State Memory
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [alerts, setAlerts] = useState<ActiveAlert[]>(initialAlerts);
  const [consultations, setConsultations] = useState<VirtualConsultation[]>(mockVirtualConsultations);
  
  // Selected Context Details for physicians
  const [selectedPatientId, setSelectedPatientId] = useState<string>("PAT-001"); // Default focus
  const [isViewingHistoryView, setIsViewingHistoryView] = useState(false);

  // Toast notifications state for doctor real-time alerts
  interface ToastItem extends ActiveAlert {
    visible: boolean;
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const notifiedAlertIds = useRef<Set<string>>(new Set(initialAlerts.map(a => a.id)));

  const playClinicalChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = window.AudioContext ? new window.AudioContext() : new (window as any).webkitAudioContext();
      const now = ctx.currentTime;
      
      // Tone 1: high frequency alert
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      
      // Tone 2: layered harmony chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.25); // C6
      gain2.gain.setValueAtTime(0.0, now);
      gain2.gain.setValueAtTime(0.12, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      
      osc1.start(now);
      osc1.stop(now + 0.52);
      
      osc2.start(now + 0.1);
      osc2.stop(now + 0.6);
    } catch (e) {
      console.warn("Audio Context not allowed or failed to play alert notification:", e);
    }
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: false } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 400);
  };

  useEffect(() => {
    // Filter out alerts that have already been handled/notified
    const newAlerts = alerts.filter((a) => !notifiedAlertIds.current.has(a.id));
    
    if (newAlerts.length > 0) {
      // Add new alerts to the live toast queue
      setToasts((prev) => [
        ...newAlerts.map((a) => ({ ...a, visible: true })),
        ...prev,
      ]);
      
      // Play high-fidelity medical chime
      playClinicalChime();

      // Register the alert IDs so they won't trigger toaster again
      newAlerts.forEach((a) => {
        notifiedAlertIds.current.add(a.id);
        // Automatic high-contrast toast self-dismissal after 12 seconds
        setTimeout(() => {
          dismissToast(a.id);
        }, 12000);
      });
    }
  }, [alerts]);

  // IA connection health metrics
  const [hasAiKey, setHasAiKey] = useState(false);
  const [aiServerMessage, setAiServerMessage] = useState("");

  // Retrieve selected Patient object
  const activeFocusPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Auth observer on mount configuration
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsDemoUser(false);
        // Load role from Firestore if available to sync with the user interface
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data && data.role) {
              setCurrentUserRole(data.role);
              console.log("UserProfile found with role:", data.role);
            }
          } else {
            // Write initial profile to register in users/ collection
            await setDoc(doc(db, "users", user.uid), {
              userId: user.uid,
              email: user.email || "",
              displayName: user.displayName || user.email?.split("@")[0] || "Usuário",
              role: "medico", // default role on first login
              createdAt: new Date().toISOString()
            }, { merge: true });
            console.log("UserProfile initialized with role: medico");
          }
        } catch (err) {
          console.warn("Could not sync user profile role on login:", err);
        }
      }
      setAuthInitialized(true);
    });
    return () => unsubscribe();
  }, []);

  // Active Firestore database synchronization when a user profile is session-authenticated
  useEffect(() => {
    if (!currentUser) return;

    let unsubscribePatients = () => {};
    let unsubscribeConsultations = () => {};

    const setupSync = async () => {
      try {
        // Enforce safe collections seed check
        const patientsCollRef = collection(db, "patient_history");
        const patientsSnap = await getDocs(patientsCollRef);
        
        if (patientsSnap.empty) {
          console.log("Pre-seeding patient_history collection with mock records to prevent blank dashboard...");
          for (const item of initialPatients) {
            await setDoc(doc(db, "patient_history", item.id), item);
          }
        }

        const consultsCollRef = collection(db, "consultations");
        const consultsSnap = await getDocs(consultsCollRef);

        if (consultsSnap.empty) {
          console.log("Pre-seeding consultations collection with initial clinic virtual queues...");
          for (const item of mockVirtualConsultations) {
            await setDoc(doc(db, "consultations", item.id), item);
          }
        }

        // Real-time listener: patient_history
        unsubscribePatients = onSnapshot(collection(db, "patient_history"), (snap) => {
          const loadedPatients: Patient[] = [];
          snap.forEach((docSnap) => {
            loadedPatients.push(docSnap.data() as Patient);
          });
          if (loadedPatients.length > 0) {
            setPatients(loadedPatients.sort((a, b) => a.id.localeCompare(b.id)));
          }
        }, (err) => {
          handleFirestoreError(err, OperationType.LIST, "patient_history");
        });

        // Real-time listener: consultations
        unsubscribeConsultations = onSnapshot(collection(db, "consultations"), (snap) => {
          const loadedConsults: VirtualConsultation[] = [];
          snap.forEach((docSnap) => {
            loadedConsults.push(docSnap.data() as VirtualConsultation);
          });
          if (loadedConsults.length > 0) {
            setConsultations(loadedConsults.sort((a, b) => b.id.localeCompare(a.id)));
          }
        }, (err) => {
          handleFirestoreError(err, OperationType.LIST, "consultations");
        });

      } catch (error) {
        console.error("Critical: Could not establish active Firestore sync database connection:", error);
      }
    };

    setupSync();

    return () => {
      unsubscribePatients();
      unsubscribeConsultations();
    };
  }, [currentUser]);

  // Check backend server config on mount to detect Gemini API key availability automatically
  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.hasAiKey) {
          setHasAiKey(true);
        }
        setAiServerMessage(data.message);
      })
      .catch((err) => {
        console.warn("Could not fetch server config status, using fallback offline mode.", err);
        setAiServerMessage("Modo simulação local activo.");
      });
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Erro ao desautenticar sessão:", err);
    }
    setCurrentUser(null);
    setIsDemoUser(false);
  };

  // Action methods
  const handleUpdatePatientVitals = async (patientId: string, updatedVitals: Vitals) => {
    // Detect deterioration risks on-the-fly to trigger automated clinical security alerts!
    const isTachycardic = updatedVitals.heartRate > 125;
    const isHypoxemic = updatedVitals.spo2 < 91;
    const isCriticalFever = updatedVitals.temperature >= 39.0;

    if (isTachycardic || isHypoxemic || isCriticalFever) {
      const patientObj = patients.find(p => p.id === patientId);
      const newAlert: ActiveAlert = {
        id: `AL-${Math.floor(Math.random() * 900) + 100}`,
        patientId: patientId,
        patientName: patientObj ? patientObj.name : "Paciente",
        type: "danger",
        title: "Deterioração de Parâmetro Hemodinâmico",
        message: `Vitals alterados detectados [FC: ${updatedVitals.heartRate} bpm / SpO2: ${updatedVitals.spo2}% / Temp: ${updatedVitals.temperature}°C]`,
        timestamp: "Agora mesmo",
        resolved: false
      };
      setAlerts((prevAlerts) => [newAlert, ...prevAlerts]);
    }

    if (currentUser) {
      const path = `patient_history/${patientId}`;
      try {
        await updateDoc(doc(db, "patient_history", patientId), { currentVitals: updatedVitals });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } else {
      setPatients((prevPatients) =>
        prevPatients.map((p) => {
          if (p.id === patientId) {
            return { ...p, currentVitals: updatedVitals };
          }
          return p;
        })
      );
    }
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
    );
  };

  const handleCreateVirtualConsultation = async (newConsult: VirtualConsultation) => {
    if (currentUser) {
      const path = `consultations/${newConsult.id}`;
      try {
        await setDoc(doc(db, "consultations", newConsult.id), newConsult);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    } else {
      setConsultations((prevConst) => [newConsult, ...prevConst]);
    }
  };

  const handleUpdateConsultationStatus = async (id: string, status: "completed" | "active") => {
    if (currentUser) {
      const path = `consultations/${id}`;
      try {
        await updateDoc(doc(db, "consultations", id), { status });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } else {
      setConsultations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
    }
  };

  const handleAddPastVisit = async (patientId: string, newVisit: PastVisit) => {
    if (currentUser) {
      const path = `patient_history/${patientId}`;
      try {
        const p = patients.find((pat) => pat.id === patientId);
        if (p) {
          const updatedVisits = [newVisit, ...p.pastVisits];
          await updateDoc(doc(db, "patient_history", patientId), { pastVisits: updatedVisits });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } else {
      setPatients((prevPatients) =>
        prevPatients.map((p) => {
          if (p.id === patientId) {
            return {
              ...p,
              pastVisits: [newVisit, ...p.pastVisits]
            };
          }
          return p;
        })
      );
    }
  };

  const activeBooking = consultations.find(c => c.status === "confirmed" || c.status === "active") || null;

  if (!authInitialized) {
    return (
      <div id="auth-loading-state" className="min-h-screen bg-[#0A0B0F] flex flex-col items-center justify-center font-sans text-slate-200 antialiased selection:bg-teal-500/30">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Verificando Credenciais...</p>
        </div>
      </div>
    );
  }

  if (!currentUser && !isDemoUser) {
    return (
      <AuthScreen 
        onAuthSuccess={(user, role, isDemo) => {
          if (user) {
            setCurrentUser(user);
            setIsDemoUser(false);
          } else {
            setCurrentUser(null);
            setIsDemoUser(isDemo);
          }
          handleSetCurrentUserRole(role);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 antialiased selection:bg-indigo-500/10">
      
      {/* STYLISH LEFT CLINIC SIDEBAR */}
      <aside className="w-72 bg-[#1c1a5e] text-white flex flex-col shrink-0 min-h-screen sticky top-0 border-r border-[#24227a] hidden md:flex shadow-xl z-50">
        
        {/* Sidebar Header Logo */}
        <div className="p-6 border-b border-[#24227a] flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-400 rounded-xl flex items-center justify-center text-slate-900 text-lg font-black shadow-lg shadow-teal-400/20">
            K
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white leading-tight tracking-tight text-base">KlikHealth <span className="text-teal-400">IA</span></span>
            </div>
            <span className="text-[10px] text-slate-300 font-semibold block uppercase tracking-wider leading-none mt-0.5">Gestão em Saúde</span>
          </div>
        </div>

        {/* Sidebar Nav Items Container */}
        <div className="flex-1 py-6 overflow-y-auto space-y-7">
           {/* PRINCIPAL CATEGORY */}
          <div>
            <span className="text-[10px] text-indigo-300/60 font-extrabold tracking-widest px-6 block uppercase mb-2.5">
              Principal
            </span>
            <div className="space-y-1.5 px-3">
              <button
                onClick={() => {
                  handleSetCurrentUserRole("medico");
                  setActiveMedicalTab("painel_triagem");
                  setIsViewingHistoryView(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer outline-none ${
                  currentUserRole === "medico" && activeMedicalTab === "painel_triagem" && !isViewingHistoryView
                    ? "bg-[#2f2b8f] text-white font-extrabold shadow-sm border-l-4 border-teal-400"
                    : "text-indigo-200/80 hover:text-white hover:bg-indigo-950/20"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users size={16} className={currentUserRole === "medico" && activeMedicalTab === "painel_triagem" && !isViewingHistoryView ? "text-teal-400" : "text-indigo-300"} />
                  <span>Painel Hospitalar</span>
                </div>
                <span className="text-[9px] bg-teal-400/10 text-teal-400 font-extrabold px-1.5 py-0.5 rounded font-mono">Real-time</span>
              </button>

              <button
                onClick={() => {
                  handleSetCurrentUserRole("medico");
                  setActiveMedicalTab("suporte_ia");
                  setIsViewingHistoryView(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer outline-none ${
                  currentUserRole === "medico" && activeMedicalTab === "suporte_ia" && !isViewingHistoryView
                    ? "bg-[#2f2b8f] text-white font-extrabold shadow-sm border-l-4 border-teal-400"
                    : "text-indigo-200/80 hover:text-white hover:bg-indigo-950/20"
                }`}
              >
                <Sparkles size={16} className={currentUserRole === "medico" && activeMedicalTab === "suporte_ia" && !isViewingHistoryView ? "text-teal-400" : "text-indigo-300"} />
                <span>Suporte de Decisão IA</span>
              </button>

              <button
                onClick={() => {
                  handleSetCurrentUserRole("medico");
                  setActiveMedicalTab("auditoria_qualidade");
                  setIsViewingHistoryView(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer outline-none ${
                  currentUserRole === "medico" && activeMedicalTab === "auditoria_qualidade" && !isViewingHistoryView
                    ? "bg-[#2f2b8f] text-white font-extrabold shadow-sm border-l-4 border-teal-400"
                    : "text-indigo-205/80 hover:text-white hover:bg-indigo-950/20"
                }`}
              >
                <FileSpreadsheet size={16} className={currentUserRole === "medico" && activeMedicalTab === "auditoria_qualidade" && !isViewingHistoryView ? "text-teal-400" : "text-indigo-300"} />
                <span>Desempenho &amp; Segurança</span>
              </button>

              <button
                onClick={() => {
                  handleSetCurrentUserRole("medico");
                  setActiveMedicalTab("planos_preco");
                  setIsViewingHistoryView(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer outline-none ${
                  currentUserRole === "medico" && activeMedicalTab === "planos_preco" && !isViewingHistoryView
                    ? "bg-[#2f2b8f] text-white font-extrabold shadow-sm border-l-4 border-amber-400"
                    : "text-indigo-200/80 hover:text-white hover:bg-indigo-950/20"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard size={16} className={currentUserRole === "medico" && activeMedicalTab === "planos_preco" && !isViewingHistoryView ? "text-amber-400" : "text-indigo-300"} />
                  <span>Planos &amp; Assinaturas</span>
                </div>
                {currentPlan === "gratis" ? (
                  <span className="text-[9px] bg-amber-400/10 text-amber-400 font-extrabold px-1.5 py-0.5 rounded font-mono">Básico</span>
                ) : (
                  <span className="text-[9px] bg-teal-400/10 text-teal-500 font-extrabold px-1.5 py-0.5 rounded font-mono select-none">★ Premium</span>
                )}
              </button>
            </div>
          </div>

          {/* SAÚDE E PACIENTE CATEGORY */}
          <div>
            <span className="text-[10px] text-indigo-300/60 font-extrabold tracking-widest px-6 block uppercase mb-2.5">
              Atendimento Saúde
            </span>
            <div className="space-y-1.5 px-3">
              <button
                onClick={() => {
                  handleSetCurrentUserRole("paciente");
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer outline-none ${
                  currentUserRole === "paciente"
                    ? "bg-[#2f2b8f] text-white font-extrabold shadow-sm border-l-4 border-teal-400"
                    : "text-indigo-200/80 hover:text-white hover:bg-indigo-950/20"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CalendarRange size={16} className={currentUserRole === "paciente" ? "text-teal-400" : "text-indigo-300"} />
                  <span>Clínica Virtual Paciente</span>
                </div>
                <span className="text-[9px] bg-indigo-500/30 text-indigo-100 font-extrabold px-1.5 py-0.5 rounded font-mono">Público</span>
              </button>

              {isViewingHistoryView && (
                <button
                  onClick={() => setIsViewingHistoryView(true)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs font-bold bg-[#2f2b8f] text-white shadow-sm border-l-4 border-amber-400 transition-all flex items-center gap-2.5 cursor-pointer outline-none"
                >
                  <Activity size={16} className="text-amber-400" />
                  <span className="truncate">Histórico: {activeFocusPatient.name}</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Support Help Center Card banner inside the bottom sidebar */}
        <div className="p-4 m-4 bg-[#141249] rounded-2xl border border-[#24227a] space-y-2 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <span className="w-5 h-5 rounded-full bg-indigo-650 flex items-center justify-center text-[10px] sm text-indigo-300">?</span>
            <span>Precisa de ajuda?</span>
          </div>
          <p className="text-[10px] text-indigo-200/60 leading-relaxed font-semibold">
            Consulte a Central de Suporte KlikHealth IA 24/7.
          </p>
          <a hred="#" className="text-[10px] text-teal-400 font-extrabold hover:underline flex items-center gap-1.5 pt-1 cursor-pointer">
            Acessar canais <ArrowRight size={10} />
          </a>
        </div>

      </aside>

      {/* RIGHT SIDE WORKSPACE ELEMENT */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* PREMIUM WHITE TOP GLASS HEADER BAR */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs px-6 py-3 shrink-0">
          <div className="w-full flex items-center justify-between">
            
            {/* Left side: Header Mobile toggle + Title Details combo */}
            <div className="flex items-center gap-4">
              <div className="md:hidden w-8 h-8 bg-[#1c1a5e] rounded-lg flex items-center justify-center text-white font-black text-sm">
                K
              </div>
              <div>
                <h1 className="font-extrabold text-[#1c1a5e] leading-tight tracking-tight text-sm sm:text-base flex items-center gap-1.5">
                  KlikHealth
                  <span className="text-[9px] bg-slate-100 text-[#1h1b5e] border border-slate-250/60 font-black px-1.5 py-0.5 rounded uppercase font-mono tracking-wider ml-1">IA Clinical</span>
                </h1>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Sistema de Apoio Médico e Teletriagem</span>
              </div>
            </div>

            {/* Central Searchbar Mockup input exactly mirroring GestHuman design */}
            <div className="hidden lg:flex items-center relative w-96">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                <Search size={14} />
              </span>
              <input 
                type="text" 
                placeholder="Buscar colaboradores, prontuários, registros..." 
                className="w-full text-xs bg-slate-100 border-0 outline-none text-slate-800 focus:bg-slate-50 focus:ring-2 focus:ring-indigo-500/25 rounded-full py-2 pl-9 pr-4 transition-all placeholder:text-slate-400 font-semibold"
              />
            </div>

            {/* Right side: Alert bells + active doctor user profile card widget */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              
              {/* Alert Indicator dropdown icon */}
              <div className="flex items-center gap-2">
                {/* Seletor de Tamanho de Fonte para Acessibilidade */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0 select-none" title="Acessibilidade: Tamanho do texto">
                  <button
                    type="button"
                    onClick={() => setFontSize("small")}
                    className={`px-1.5 py-0.5 text-[9px] font-black rounded transition-all cursor-pointer outline-none ${fontSize === 'small' ? 'bg-[#1c1a5e] text-white shadow-xs' : 'text-slate-500 hover:text-[#1c1a5e]'}`}
                  >
                    A-
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize("normal")}
                    className={`px-1.5 py-0.5 text-[9px] font-black rounded transition-all cursor-pointer outline-none ${fontSize === 'normal' ? 'bg-[#1c1a5e] text-white shadow-xs' : 'text-slate-500 hover:text-[#1c1a5e]'}`}
                  >
                    A
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize("large")}
                    className={`px-1.5 py-0.5 text-[9px] font-black rounded transition-all cursor-pointer outline-none ${fontSize === 'large' ? 'bg-[#1c1a5e] text-white shadow-xs' : 'text-slate-500 hover:text-[#1c1a5e]'}`}
                  >
                    A+
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize("xlarge")}
                    className={`px-1.5 py-0.5 text-[9px] font-black rounded transition-all cursor-pointer outline-none ${fontSize === 'xlarge' ? 'bg-[#1c1a5e] text-white shadow-xs' : 'text-slate-500 hover:text-[#1c1a5e]'}`}
                  >
                    A++
                  </button>
                </div>

                <span className="relative cursor-pointer p-2 hover:bg-slate-50 rounded-full transition-all block">
                  <Bell size={18} className="text-slate-500 hover:text-slate-800 transition-colors" />
                  {alerts.filter(a => !a.resolved).length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white font-mono font-bold text-[9px] flex items-center justify-center border-2 border-white shadow-sm">
                      {alerts.filter(a => !a.resolved).length}
                    </span>
                  )}
                </span>
                
                {/* Mobile roles selector to swap roles */}
                <div className="md:hidden flex bg-slate-100 p-0.5 rounded-lg border border-slate-250/20 shrink-0">
                  <button 
                    onClick={() => { handleSetCurrentUserRole("medico"); setIsViewingHistoryView(false); }}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded ${currentUserRole === 'medico' ? 'bg-[#1c1a5e] text-white shadow-xs' : 'text-slate-500'}`}
                  >
                    Médico
                  </button>
                  <button 
                    onClick={() => handleSetCurrentUserRole("paciente")}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded ${currentUserRole === 'paciente' ? 'bg-[#1c1a5e] text-white shadow-xs' : 'text-slate-500'}`}
                  >
                    Paciente
                  </button>
                </div>
              </div>

              {/* Secure Active physician Profile chip card */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 p-1.5 px-3 rounded-2xl max-w-[220px] transition-all hover:bg-slate-100/60 shadow-xs">
                {currentUser?.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt="Current user avatar" 
                    className="w-7 h-7 rounded-full object-cover border border-[#1c1a5e]/20 shrink-0" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-black shrink-0">
                    {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : "D"}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <span className="block text-xs font-black text-slate-800 leading-tight truncate max-w-[110px]">
                    {currentUser?.email ? currentUser.email.split('@')[0] : (isDemoUser ? "Plantonista Demo" : "Médico Visitante")}
                  </span>
                  <span className="block text-[9px] font-extrabold text-indigo-600/90 font-mono leading-none uppercase mt-0.5">
                    {currentUserRole === 'medico' ? 'Administrador' : 'Paciente'}
                  </span>
                </div>
              </div>

              {/* Secure Log out button link layout details */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-full border border-slate-200 hover:text-red-500 hover:bg-red-50 hover:border-red-150 transition-all cursor-pointer flex items-center justify-center outline-none"
                title="Sair do Portal"
              >
                <LogOut size={14} className="text-slate-500 hover:text-red-500 transition-colors" />
              </button>

            </div>

          </div>
        </header>

        {/* WORKSPACE CONTENT PANELS GRID CONTAINER */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* Internal Tabs controller fallback for Mobile mode of Dokter portal */}
          {currentUserRole === "medico" && !isViewingHistoryView && (
            <div id="doctor-portal-tabs-mobile" className="md:hidden flex gap-1.5 bg-white p-1 rounded-xl border border-slate-150 overflow-x-auto shrink-0 shadow-xs">
              <button
                onClick={() => setActiveMedicalTab("painel_triagem")}
                className={`px-3.5 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer outline-none shrink-0 ${activeMedicalTab === "painel_triagem" ? "bg-[#1c1a5e] text-white" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <Users size={12} /> Painel
              </button>

              <button
                onClick={() => setActiveMedicalTab("suporte_ia")}
                className={`px-3.5 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer outline-none shrink-0 ${activeMedicalTab === "suporte_ia" ? "bg-[#1c1a5e] text-white" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <Sparkles size={12} /> Decisão IA
              </button>

              <button
                onClick={() => setActiveMedicalTab("auditoria_qualidade")}
                className={`px-3.5 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer outline-none shrink-0 ${activeMedicalTab === "auditoria_qualidade" ? "bg-[#1c1a5e] text-white" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <FileSpreadsheet size={12} /> Checklist
              </button>
            </div>
          )}

          {/* ACTIVE PORTAL SELECTION ROUTING */}
          <div id="portal-workspace-rendered-view" className="space-y-6">
            
            {currentUserRole === "medico" ? (
              // DOCTOR WORKSPACE DIRECT RENDERING
              isViewingHistoryView ? (
                <PatientHistory
                  patient={activeFocusPatient}
                  onBack={() => setIsViewingHistoryView(false)}
                  onOpenAIAssistant={() => { setIsViewingHistoryView(false); setActiveMedicalTab("suporte_ia"); }}
                  onAddPastVisit={handleAddPastVisit}
                />
              ) : (
                <>
                  {activeMedicalTab === "painel_triagem" && (
                    <DoctorDashboard
                      patients={patients}
                      alerts={alerts}
                      onSelectPatient={(p) => { setSelectedPatientId(p.id); setIsViewingHistoryView(true); }}
                      onOpenAIAssistant={(p) => { setSelectedPatientId(p.id); setActiveMedicalTab("suporte_ia"); }}
                      onResolveAlert={handleResolveAlert}
                      hasAiKey={hasAiKey}
                      currentPlan={currentPlan}
                      onNavigateToPlans={() => setActiveMedicalTab("planos_preco")}
                    />
                  )}

                  {activeMedicalTab === "suporte_ia" && (
                    <AIClinicalAssistant
                      patient={activeFocusPatient}
                      onUpdatePatientVitals={handleUpdatePatientVitals}
                      hasAiKey={hasAiKey}
                      currentPlan={currentPlan}
                      aiQueryCount={aiQueryCount}
                      onIncrementAiQuery={() => setAiQueryCount(prev => prev + 1)}
                      onNavigateToPlans={() => setActiveMedicalTab("planos_preco")}
                    />
                  )}

                  {activeMedicalTab === "auditoria_qualidade" && (
                    currentPlan === "gratis" ? (
                      <div className="bg-white rounded-3xl border border-slate-150 p-12 text-center max-w-2xl mx-auto space-y-6 shadow-sm my-8">
                        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto border border-amber-200/55">
                          <Lock size={28} className="animate-pulse text-amber-600" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-black text-[#1c1a5e]">Métricas de Desempenho Bloqueadas</h3>
                          <p className="text-xs text-slate-500 leading-relaxed font-semibold max-w-md mx-auto">
                            O acesso aos relatórios gerenciais e de auditoria avançados de conformidade é exclusivo de médicos com o <strong>Plano Premium Médico</strong>.
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveMedicalTab("planos_preco")}
                          className="bg-[#1c1a5e] hover:bg-[#201d6d] text-white font-extrabold text-xs px-6 py-3 rounded-2xl transition-all cursor-pointer shadow-md"
                        >
                          Conhecer Plano Premium / Upgrade
                        </button>
                      </div>
                    ) : (
                      <AdminReports />
                    )
                  )}

                  {activeMedicalTab === "planos_preco" && (
                    <PlanosPreco
                      currentPlan={currentPlan}
                      onSelectPlan={(plan) => setCurrentPlan(plan)}
                      aiQueryCount={aiQueryCount}
                    />
                  )}
                </>
              )
            ) : (
              // PATIENT WORKSPACE DIRECT RENDERING
              <VirtualClinic
                onAddConsultation={handleCreateVirtualConsultation}
                activeConsultation={activeBooking}
                onUpdateConsultationStatus={handleUpdateConsultationStatus}
                hasAiKey={hasAiKey}
              />
            )}

          </div>

        </main>

        {/* WORKSPACE ACCESSIBLE BOTTOM FOOTER BAR */}
        <footer className="bg-white border-t border-slate-100 py-5 px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-400 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <Building size={14} className="text-[#1c1a5e]/50" />
            <span>© 2026 KlikHealth IA • Residência de Medicina e Tecnologia Integrada. Todos os direitos reservados.</span>
          </div>
          <div className="flex gap-4 font-mono text-[10px]">
            <span className="hover:text-indigo-600 transition-colors cursor-pointer">Protocolos de Segurança</span>
            <span className="hover:text-indigo-600 transition-colors cursor-pointer text-indigo-400/90 font-bold">● {hasAiKey ? 'Gemini Pro Ativo' : 'Simulador Offline'}</span>
          </div>
        </footer>

      </div>

      {/* REAL-TIME CLINICAL ALERT TOAST NOTIFICATION CONTAINER (GLOBAL OVERLAY) */}
      <div id="clinical-toasts-container" className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const isDanger = toast.type === "danger";
          const isWarning = toast.type === "warning";
          
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto w-full bg-[#1c1a5e] text-white rounded-2xl p-4 shadow-[0_12px_45px_rgba(28,26,94,0.25)] hover:border-[#2f2b8f] border border-[#24227a] transition-all duration-300 transform ${
                toast.visible 
                  ? "translate-y-0 opacity-100 scale-100" 
                  : "translate-y-2 opacity-0 scale-95"
              } relative overflow-hidden flex flex-col gap-3`}
            >
              {/* Subtle ambient light flash background */}
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 ${
                isDanger ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-teal-400'
              }`}></div>

              <div className="flex gap-3">
                <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
                  isDanger ? 'bg-red-500/15 text-red-300' : isWarning ? 'bg-orange-400/15 text-orange-300' : 'bg-teal-400/15 text-teal-300'
                }`}>
                  <AlertTriangle size={15} className={`${isDanger ? 'animate-pulse' : ''}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] text-[#a5b4fc] uppercase font-black tracking-wider font-mono">
                      Notoriedade Clínica
                    </span>
                    <button
                      onClick={() => dismissToast(toast.id)}
                      className="text-indigo-200 hover:text-white p-0.5 rounded transition-colors cursor-pointer outline-none"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <h4 className="text-xs font-black text-white leading-tight mt-1">
                    {toast.patientName} &bull; <span className={isDanger ? 'text-red-300' : isWarning ? 'text-orange-300' : 'text-teal-300'}>{toast.title}</span>
                  </h4>
                  <p className="text-[10px] text-indigo-100/80 mt-1 leading-relaxed">
                    {toast.message}
                  </p>
                </div>
              </div>

              {/* Action items inside the notification toast */}
              <div className="grid grid-cols-2 gap-2 text-[9px] font-black uppercase tracking-wider border-t border-[#24227a]/60 pt-2.5">
                <button
                  type="button"
                  onClick={() => {
                    handleSetCurrentUserRole("medico");
                    setSelectedPatientId(toast.patientId);
                    setIsViewingHistoryView(true);
                    setActiveMedicalTab("painel_triagem");
                    dismissToast(toast.id);
                  }}
                  className="bg-[#141249] hover:bg-[#201d6d] text-teal-350 border border-[#24227a] py-1.5 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 cursor-pointer outline-none font-mono"
                >
                  <Eye size={11} />
                  <span>Ver Prontuário</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleResolveAlert(toast.id);
                    dismissToast(toast.id);
                  }}
                  className="bg-teal-400 hover:bg-teal-500 text-slate-900 py-1.5 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 cursor-pointer outline-none font-mono font-black"
                >
                  <Check size={11} />
                  <span>Resolvido</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
