import { PatientRecord } from "@/lib/api";
import { Download, Search, Printer } from "lucide-react";
import { useState } from "react";

interface CohortTableProps {
    patients: PatientRecord[];
}

export default function CohortTable({ patients }: CohortTableProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredPatients = patients.filter(p => 
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.icd10_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportCSV = () => {
        if (patients.length === 0) return;
        const headers = Object.keys(patients[0]).join(",");
        const rows = patients.map(p => Object.values(p).join(",")).join("\n");
        const csv = `${headers}\n${rows}`;
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "patients.csv";
        a.click();
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-col h-full space-y-4 printable-area">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-[Space_Grotesk] font-bold text-[var(--bone)] flex items-center gap-2">
                    Patient Explorer
                </h2>
                <div className="flex space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--slate-dim)] w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search ID or ICD-10..." 
                            className="pl-10 pr-4 py-2 bg-[var(--ink)] border border-[var(--line)] rounded font-mono text-sm text-[var(--bone)] focus:outline-none focus:border-[var(--signal)] focus:ring-1 focus:ring-[var(--signal)] transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={exportCSV} className="flex items-center space-x-2 bg-[var(--panel)] hover:bg-[var(--panel-2)] border border-[var(--line)] px-4 py-2 rounded font-mono text-sm text-[var(--bone)] transition-colors print:hidden">
                        <Download className="w-4 h-4 text-[var(--signal)]" />
                        <span>Export CSV</span>
                    </button>
                    <button onClick={handlePrint} className="flex items-center space-x-2 bg-[var(--panel)] hover:bg-[var(--panel-2)] border border-[var(--line)] px-4 py-2 rounded font-mono text-sm text-[var(--bone)] transition-colors print:hidden">
                        <Printer className="w-4 h-4 text-[var(--signal)]" />
                        <span>Print</span>
                    </button>
                </div>
            </div>

            <div className="bg-[var(--panel)] rounded overflow-hidden flex-1 overflow-y-auto border border-[var(--line)]">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[var(--panel-2)] sticky top-0 border-b border-[var(--line)]">
                        <tr>
                            <th className="p-4 font-mono text-[11px] uppercase tracking-wider text-[var(--slate)] border-b border-[var(--line)]">Patient ID</th>
                            <th className="p-4 font-mono text-[11px] uppercase tracking-wider text-[var(--slate)] border-b border-[var(--line)]">Age / Sex</th>
                            <th className="p-4 font-mono text-[11px] uppercase tracking-wider text-[var(--slate)] border-b border-[var(--line)]">BP (Sys/Dia)</th>
                            <th className="p-4 font-mono text-[11px] uppercase tracking-wider text-[var(--slate)] border-b border-[var(--line)]">BMI</th>
                            <th className="p-4 font-mono text-[11px] uppercase tracking-wider text-[var(--slate)] border-b border-[var(--line)]">Glucose</th>
                            <th className="p-4 font-mono text-[11px] uppercase tracking-wider text-[var(--slate)] border-b border-[var(--line)]">Cholesterol</th>
                            <th className="p-4 font-mono text-[11px] uppercase tracking-wider text-[var(--slate)] border-b border-[var(--line)]">Special Metrics</th>
                            <th className="p-4 font-mono text-[11px] uppercase tracking-wider text-[var(--slate)] border-b border-[var(--line)]">ICD-10</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line)] text-[var(--bone)]">
                        {filteredPatients.length > 0 ? filteredPatients.map((p) => (
                            <tr key={p.id} className="hover:bg-[var(--panel-2)] transition-colors">
                                <td className="p-4 text-xs font-mono text-[var(--slate)]">{p.id.substring(0, 8)}...</td>
                                <td className="p-4 font-mono text-[13px]">{p.age} / {p.sex}</td>
                                <td className="p-4 font-mono text-[13px]">{p.systolic_bp} / {p.diastolic_bp}</td>
                                <td className="p-4 font-mono text-[13px]">{p.bmi}</td>
                                <td className="p-4 font-mono text-[13px]">{p.blood_glucose}</td>
                                <td className="p-4 font-mono text-[13px]">{p.cholesterol}</td>
                                <td className="p-4 text-xs font-mono text-[var(--slate)]">
                                    {p.o2_saturation !== null && p.o2_saturation !== undefined && <div>O2: {p.o2_saturation}%</div>}
                                    {p.tumor_marker_level !== null && p.tumor_marker_level !== undefined && <div>Marker: {p.tumor_marker_level}</div>}
                                    {p.cognitive_score !== null && p.cognitive_score !== undefined && <div>MoCA: {p.cognitive_score}/30</div>}
                                </td>
                                <td className="p-4 text-[var(--signal)] font-mono font-semibold text-[13px]">{p.icd10_code}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={8} className="p-8 text-center text-[var(--slate)] font-mono text-sm">
                                    No patients found. Generate patients to begin.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
