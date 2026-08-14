import { PatientRecord, synthesizeNote } from "@/lib/api";
import { Bot, FileText, Loader2, User, Download } from "lucide-react";
import { useState, useEffect } from "react";

interface NotesViewProps {
    patients: PatientRecord[];
}

export default function NotesView({ patients }: NotesViewProps) {
    const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
    const [note, setNote] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (patients.length > 0 && !selectedPatient) {
            setSelectedPatient(patients[0]);
        }
    }, [patients, selectedPatient]);

    const handleGenerateNote = async () => {
        if (!selectedPatient) return;
        setLoading(true);
        setError("");
        try {
            const result = await synthesizeNote(selectedPatient);
            setNote(result);
        } catch (err: any) {
            setError(err.message || "Failed to generate note.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!note || !selectedPatient) return;
        const blob = new Blob([note], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `SOAP_Note_${selectedPatient.id.substring(0, 8)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            <h2 className="text-2xl font-[Space_Grotesk] font-bold text-[var(--bone)] flex items-center gap-2">
                <Bot className="w-6 h-6 text-[var(--signal)]" /> Clinical Notes AI
            </h2>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                {/* Left side: Patient selector and details */}
                <div className="w-full lg:w-1/3 flex flex-col space-y-4">
                    <div className="glass-card p-4">
                        <label className="block text-sm font-mono text-[var(--slate)] mb-2 uppercase tracking-wider">Select Patient</label>
                        <select 
                            className="w-full bg-[var(--ink)] border border-[var(--line)] text-[var(--bone)] font-mono rounded p-2.5 focus:ring-1 focus:ring-[var(--signal)] focus:border-[var(--signal)] outline-none"
                            value={selectedPatient?.id || ""}
                            onChange={(e) => {
                                const p = patients.find(p => p.id === e.target.value);
                                if (p) {
                                    setSelectedPatient(p);
                                    setNote("");
                                }
                            }}
                            disabled={patients.length === 0}
                        >
                            {patients.length === 0 && <option value="">No patients available</option>}
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.id.substring(0, 8)} - {p.age}yo {p.sex} ({p.icd10_code})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedPatient && (
                        <div className="glass-card p-6 flex-1 overflow-y-auto">
                            <h3 className="text-lg font-mono text-[var(--bone)] mb-4 flex items-center gap-2 uppercase tracking-wider">
                                <User className="w-5 h-5 text-[var(--signal)]" /> Patient Vitals
                            </h3>
                            <div className="space-y-3 font-mono text-sm">
                                <div className="flex justify-between border-b border-[var(--line)] pb-2">
                                    <span className="text-[var(--slate)]">Age / Sex</span>
                                    <span className="text-[var(--bone)]">{selectedPatient.age} / {selectedPatient.sex}</span>
                                </div>
                                <div className="flex justify-between border-b border-[var(--line)] pb-2">
                                    <span className="text-[var(--slate)]">Blood Pressure</span>
                                    <span className="text-[var(--bone)]">{selectedPatient.systolic_bp} / {selectedPatient.diastolic_bp} mmHg</span>
                                </div>
                                <div className="flex justify-between border-b border-[var(--line)] pb-2">
                                    <span className="text-[var(--slate)]">BMI</span>
                                    <span className="text-[var(--bone)]">{selectedPatient.bmi}</span>
                                </div>
                                <div className="flex justify-between border-b border-[var(--line)] pb-2">
                                    <span className="text-[var(--slate)]">Glucose</span>
                                    <span className="text-[var(--bone)]">{selectedPatient.blood_glucose} mg/dL</span>
                                </div>
                                <div className="flex justify-between border-b border-[var(--line)] pb-2">
                                    <span className="text-[var(--slate)]">Cholesterol</span>
                                    <span className="text-[var(--bone)]">{selectedPatient.cholesterol} mg/dL</span>
                                </div>
                                <div className="flex justify-between pb-2">
                                    <span className="text-[var(--slate)]">Primary ICD-10</span>
                                    <span className="text-[var(--signal)]">{selectedPatient.icd10_code}</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleGenerateNote}
                                disabled={loading || !selectedPatient}
                                className="w-full mt-6 bg-[var(--signal)]/10 border border-[var(--signal)] hover:bg-[var(--signal)]/20 text-[var(--signal)] font-mono py-2.5 rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest text-sm"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
                                Synthesize SOAP Note
                            </button>
                            {error && <p className="text-[var(--alert)] font-mono text-sm mt-3 text-center">{error}</p>}
                        </div>
                    )}
                </div>

                {/* Right side: AI Note */}
                <div className="w-full lg:w-2/3 glass-card p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4 border-b border-[var(--line)] pb-4">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[var(--signal)]" />
                            <h3 className="text-lg font-mono text-[var(--bone)] uppercase tracking-wider">AI Synthesized Note</h3>
                        </div>
                        {note && (
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[var(--panel-2)] hover:bg-[var(--line)] text-[var(--bone)] font-mono rounded transition-colors border border-[var(--line)]"
                                title="Download Note"
                            >
                                <Download className="w-4 h-4 text-[var(--signal)]" /> Download
                            </button>
                        )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto whitespace-pre-wrap font-mono text-[var(--bone)] leading-relaxed p-4 bg-[var(--ink)] rounded border border-[var(--line)]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-[var(--signal)] animate-pulse">
                                <Bot className="w-12 h-12 mb-4 opacity-50" />
                                <p>Synthesizing clinical documentation...</p>
                            </div>
                        ) : note ? (
                            <div dangerouslySetInnerHTML={{ __html: note.replace(/\n/g, '<br/>') }} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-[var(--slate)]">
                                Select a patient and click synthesize to generate a SOAP note.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
