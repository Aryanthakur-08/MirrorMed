"use client";

import { useState, useEffect } from "react";
import { generateCohort, PatientRecord, DoctorRecord, generateDoctors } from "@/lib/api";
import { Database, FileText, Activity, LayoutDashboard, Settings, Loader2, HeartPulse, Users, Bot, ArrowRight, Sparkles, MessageSquare, X, ChevronLeft } from "lucide-react";
import CohortTable from "@/components/CohortTable";
import NotesView from "@/components/NotesView";
import FidelityCharts from "@/components/FidelityCharts";
import DoctorTable from "@/components/DoctorTable";
import ChatbotWidget from "@/components/ChatbotWidget";
import DashboardAnalytics from "@/components/DashboardAnalytics";
import LandingPage from "@/components/LandingPage";

type Tab = "analytics" | "explorer" | "notes" | "fidelity" | "doctors";

const PATIENT_DISEASES = ["General", "Diabetes", "COVID-19", "Heart Failure", "Asthma", "Osteoporosis"];
const DOCTOR_SPECIALTIES = ["General", "Cardiology", "Endocrinology", "Oncology", "Neurology", "Pulmonology"];

export default function Home() {
  const [appState, setAppStateInternal] = useState<"intro" | "selection" | "dashboard">("intro");
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'selection' || hash === 'dashboard') {
      setAppStateInternal(hash as any);
    } else {
      window.history.replaceState(null, '', '#intro');
    }

    const handleHashChange = () => {
      const currentHash = window.location.hash.replace('#', '');
      if (currentHash === 'intro' || currentHash === 'selection' || currentHash === 'dashboard') {
        setAppStateInternal(currentHash as any);
      } else {
        setAppStateInternal('intro');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const setAppState = (newState: "intro" | "selection" | "dashboard") => {
    setIsTransitioning(true);
    setTimeout(() => {
      setAppStateInternal(newState);
      window.location.hash = newState;
      setIsTransitioning(false);
    }, 400);
  };
  const [selectedModule, setSelectedModule] = useState<"cohort" | "doctors" | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("analytics");
  const [showChatbot, setShowChatbot] = useState(false);
  
  const [cohortSize, setCohortSize] = useState(100);
  const [diseaseFocus, setDiseaseFocus] = useState("General");
  
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateCohort = async (size = cohortSize, focus = diseaseFocus) => {
    setLoading(true);
    setError("");
    try {
      const data = await generateCohort(size, focus);
      setPatients(data);
      if (activeTab !== "fidelity" && activeTab !== "notes") {
        setActiveTab("analytics");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate patients");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDoctors = async (size = cohortSize, focus = diseaseFocus) => {
    setLoading(true);
    setError("");
    try {
      const data = await generateDoctors(size, focus);
      setDoctors(data);
      setActiveTab("analytics");
    } catch (err: any) {
      setError(err.message || "Failed to generate doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleChatAction = (action: string, data: any) => {
    if (action === "generate_patients") {
      const newSize = data.size || 100;
      const newFocus = data.disease_focus || "General";
      setCohortSize(newSize);
      setDiseaseFocus(newFocus);
      setSelectedModule("cohort");
      setAppState("dashboard");
      setTimeout(() => {
        handleGenerateCohort(newSize, newFocus);
      }, 500);
    } else if (action === "generate_doctors") {
      const newSize = data.count || 20;
      const newFocus = data.specialty || "General";
      setCohortSize(newSize);
      setDiseaseFocus(newFocus);
      setSelectedModule("doctors");
      setAppState("dashboard");
      setTimeout(() => {
        handleGenerateDoctors(newSize, newFocus);
      }, 500);
    }
  };

  const renderAppContent = () => {
    if (appState === "intro" || appState === "selection") {
      return (
        <div className={`transition-all duration-500 ease-in-out transform ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <LandingPage 
            step={appState as "intro" | "selection"}
            setStep={setAppState}
            onLaunch={(module) => {
              if (module === "cohort") {
                setSelectedModule("cohort"); 
                setActiveTab("analytics"); 
                setAppState("dashboard");
              } else if (module === "doctors") {
                setSelectedModule("doctors"); 
                setActiveTab("analytics"); 
                setAppState("dashboard");
              }
            }} 
          />
        </div>
      );
    }

    return (
      <div className={`flex h-screen w-full bg-[var(--ink)] overflow-hidden text-[var(--bone)] print:bg-white print:text-black transition-all duration-500 ease-out transform ${isTransitioning ? '-translate-x-12 opacity-0' : 'translate-x-0 opacity-100'}`}>
        {/* Sidebar - hidden on print */}
        <aside className="w-80 border-r border-[var(--line)] flex flex-col relative z-10 print:hidden bg-[var(--panel)] h-full overflow-y-auto shadow-sm">
          <div className="p-6 border-b border-[var(--line)] flex items-center gap-3">
            <button 
              onClick={() => setAppState("intro")}
              className="w-10 h-10 rounded-xl bg-[rgba(62,232,196,0.1)] flex items-center justify-center hover:bg-[rgba(62,232,196,0.2)] transition-colors border border-[rgba(62,232,196,0.2)]"
              title="Back to Home"
            >
              <HeartPulse className="w-6 h-6 text-[var(--signal)]" />
            </button>
            <div 
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setAppState("intro")}
            >
              <h1 className="text-xl font-bold text-[var(--bone)] font-[Space_Grotesk]">
                Mirror<span className="text-[var(--signal)]">Med</span>
              </h1>
              <p className="text-[10px] text-[var(--slate-dim)] uppercase tracking-widest font-[IBM_Plex_Mono]">Enterprise Platform</p>
            </div>
          </div>

          <nav className="p-4 space-y-2 flex-1 mt-4">
            <div className="mb-4">
              <button 
                onClick={() => setAppState("intro")}
                className="text-xs text-[var(--slate)] hover:text-[var(--signal)] flex items-center gap-1 transition-colors font-mono"
              >
                <ChevronLeft className="w-3 h-3" /> Back to Home
              </button>
            </div>

            {selectedModule === "cohort" && (
              <>
                <button 
                  onClick={() => setActiveTab("analytics")}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${activeTab === "analytics" ? "bg-[rgba(62,232,196,0.1)] text-[var(--signal)] border border-[rgba(62,232,196,0.3)] shadow-sm" : "text-[var(--slate)] hover:bg-[var(--panel-2)] hover:text-[var(--bone)] border border-transparent"}`}
                >
                  <LayoutDashboard className={`w-5 h-5 ${activeTab === "analytics" ? "text-[var(--signal)]" : ""}`} />
                  <span className="font-medium text-sm">Dashboard Analytics</span>
                </button>
                <button 
                  onClick={() => setActiveTab("explorer")}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${activeTab === "explorer" ? "bg-[rgba(62,232,196,0.1)] text-[var(--signal)] border border-[rgba(62,232,196,0.3)] shadow-sm" : "text-[var(--slate)] hover:bg-[var(--panel-2)] hover:text-[var(--bone)] border border-transparent"}`}
                >
                  <Database className={`w-5 h-5 ${activeTab === "explorer" ? "text-[var(--signal)]" : ""}`} />
                  <span className="font-medium text-sm">Patient Explorer</span>
                </button>
                <button 
                  onClick={() => setActiveTab("notes")}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${activeTab === "notes" ? "bg-[rgba(62,232,196,0.1)] text-[var(--signal)] border border-[rgba(62,232,196,0.3)] shadow-sm" : "text-[var(--slate)] hover:bg-[var(--panel-2)] hover:text-[var(--bone)] border border-transparent"}`}
                >
                  <FileText className={`w-5 h-5 ${activeTab === "notes" ? "text-[var(--signal)]" : ""}`} />
                  <span className="font-medium text-sm">Clinical Notes AI</span>
                </button>
                <button 
                  onClick={() => setActiveTab("fidelity")}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${activeTab === "fidelity" ? "bg-[rgba(62,232,196,0.1)] text-[var(--signal)] border border-[rgba(62,232,196,0.3)] shadow-sm" : "text-[var(--slate)] hover:bg-[var(--panel-2)] hover:text-[var(--bone)] border border-transparent"}`}
                >
                  <Activity className={`w-5 h-5 ${activeTab === "fidelity" ? "text-[var(--signal)]" : ""}`} />
                  <span className="font-medium text-sm">Data Accuracy</span>
                </button>
              </>
            )}

            {selectedModule === "doctors" && (
              <>
                <button 
                  onClick={() => setActiveTab("analytics")}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${activeTab === "analytics" ? "bg-[rgba(62,232,196,0.1)] text-[var(--signal)] border border-[rgba(62,232,196,0.3)] shadow-sm" : "text-[var(--slate)] hover:bg-[var(--panel-2)] hover:text-[var(--bone)] border border-transparent"}`}
                >
                  <LayoutDashboard className={`w-5 h-5 ${activeTab === "analytics" ? "text-[var(--signal)]" : ""}`} />
                  <span className="font-medium text-sm">Dashboard Analytics</span>
                </button>
                <button 
                  onClick={() => setActiveTab("doctors")}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${activeTab === "doctors" ? "bg-[rgba(62,232,196,0.1)] text-[var(--signal)] border border-[rgba(62,232,196,0.3)] shadow-sm" : "text-[var(--slate)] hover:bg-[var(--panel-2)] hover:text-[var(--bone)] border border-transparent"}`}
              >
                <Users className={`w-5 h-5 ${activeTab === "doctors" ? "text-[var(--signal)]" : ""}`} />
                <span className="font-medium text-sm">Doctors Directory</span>
              </button>
              </>
            )}
          </nav>

          <div className="p-5 border-t border-[var(--line)] bg-[var(--panel-2)]">
            <h3 className="text-xs font-semibold text-[var(--slate)] uppercase tracking-wider flex items-center gap-2 mb-4 font-[IBM_Plex_Mono]">
              <Settings className="w-3.5 h-3.5 text-[var(--signal)]" /> Generation Setup
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs text-[var(--slate)] mb-2 font-mono">Dataset Focus / Specialty</label>
                <input 
                  type="text" 
                  value={diseaseFocus}
                  onChange={(e) => setDiseaseFocus(e.target.value)}
                  placeholder="e.g. Dermatology, COVID-19..."
                  className="w-full bg-[var(--ink)] border border-[var(--line-strong)] rounded-lg px-3 py-2 text-sm text-[var(--bone)] focus:outline-none focus:border-[var(--signal)] focus:ring-1 focus:ring-[var(--signal)] shadow-sm mb-2 placeholder:text-[var(--slate-dim)]"
                />
                <div className="text-[10px] text-[var(--slate-dim)] mb-2 uppercase tracking-wide font-mono">Suggested:</div>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedModule === "cohort" ? PATIENT_DISEASES : DOCTOR_SPECIALTIES).map(item => (
                    <button
                      key={item}
                      onClick={() => setDiseaseFocus(item)}
                      className={`text-[10px] py-1 px-2 rounded-md border transition-all duration-300 font-mono ${
                        diseaseFocus === item 
                        ? 'bg-[rgba(62,232,196,0.15)] border-[rgba(62,232,196,0.4)] text-[var(--signal)]' 
                        : 'bg-[var(--ink)] border-[var(--line)] text-[var(--slate)] hover:bg-[var(--panel)] hover:text-[var(--bone)]'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs text-[var(--slate)] font-mono">Size / Count</label>
                  <span className="text-xs font-mono bg-[var(--ink)] border border-[var(--line)] px-2 py-0.5 rounded text-[var(--signal)]">{cohortSize}</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="1000" 
                  step="10"
                  className="w-full accent-[var(--signal)]"
                  value={cohortSize}
                  onChange={(e) => setCohortSize(parseInt(e.target.value))}
                />
              </div>

              <div className="flex gap-2 pt-2">
                {selectedModule === "cohort" && (
                  <button 
                    onClick={() => handleGenerateCohort()}
                    disabled={loading}
                    className="flex-1 bg-[var(--signal)] hover:bg-[var(--signal-dim)] text-[var(--ink)] font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-1 disabled:opacity-50 shadow-sm font-mono uppercase tracking-wide"
                    title="Generate Patients"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                    Generate
                  </button>
                )}
                
                {selectedModule === "doctors" && (
                  <button 
                    onClick={() => handleGenerateDoctors()}
                    disabled={loading}
                    className="flex-1 bg-[var(--signal)] hover:bg-[var(--signal-dim)] text-[var(--ink)] font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-1 disabled:opacity-50 shadow-sm font-mono uppercase tracking-wide"
                    title="Generate Doctors"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                    Generate
                  </button>
                )}
              </div>
              {error && <p className="text-[var(--alert)] text-[10px] text-center mt-1 bg-[rgba(255,107,107,0.1)] p-2 rounded border border-[rgba(255,107,107,0.3)]">{error}</p>}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-[var(--ink)] print:bg-white print:overflow-visible print:h-auto">
          <div className="grain"></div>
          <div className="flex-1 p-6 md:p-8 overflow-hidden z-10 flex flex-col print:p-0 print:overflow-visible relative">
            {activeTab === "analytics" && <DashboardAnalytics patients={patients} doctors={doctors} module={selectedModule as "cohort" | "doctors"} />}
            {activeTab === "explorer" && <CohortTable patients={patients} />}
            {activeTab === "doctors" && <DoctorTable doctors={doctors} />}
            {activeTab === "notes" && <NotesView patients={patients} />}
            {activeTab === "fidelity" && <FidelityCharts patients={patients} diseaseFocus={diseaseFocus} />}
          </div>
        </main>
      </div>
    );
  };

  return (
    <>
      {renderAppContent()}

      <style>{`
        .lana{
          position:fixed; bottom:24px; right:24px; z-index:50;
          background:var(--signal); color:var(--ink); border:none; border-radius:2px;
          padding:14px 22px; font-family:var(--font-mono), monospace; font-weight:700; font-size:13px;
          display:flex; align-items:center; gap:9px; box-shadow:0 12px 28px -8px rgba(62,232,196,0.5);
          cursor:pointer; transition:transform .2s; text-decoration:none;
        }
        .lana:hover{transform:translateY(-2px);}
        .lana svg{width:16px; height:16px;}
        
        .lana-chat-container {
          position: fixed;
          bottom: 80px;
          right: 24px;
          width: 380px;
          height: 500px;
          max-height: calc(100vh - 100px);
          z-index: 50;
          border-radius: 8px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          border: 1px solid var(--line);
          background: var(--ink);
          overflow: hidden;
          animation: slideUp 0.3s ease-out forwards;
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      {showChatbot && (
        <div className="lana-chat-container">
          <div className="absolute top-3 right-3 z-10">
            <button 
              onClick={() => setShowChatbot(false)}
              className="text-[var(--slate)] hover:text-[var(--bone)] transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <ChatbotWidget onAction={handleChatAction} />
        </div>
      )}

      <button onClick={() => setShowChatbot(!showChatbot)} className="lana">
        {showChatbot ? (
          <>
            <X className="w-4 h-4" /> Close Lana
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg> Ask Lana
          </>
        )}
      </button>
    </>
  );
}
