import { DoctorRecord } from "@/lib/api";
import { Download, Search, Printer } from "lucide-react";
import { useState } from "react";

interface DoctorTableProps {
    doctors: DoctorRecord[];
}

export default function DoctorTable({ doctors }: DoctorTableProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredDoctors = doctors.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportCSV = () => {
        if (doctors.length === 0) return;
        const headers = Object.keys(doctors[0]).join(",");
        const rows = doctors.map(d => Object.values(d).join(",")).join("\n");
        const csv = `${headers}\n${rows}`;
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "doctors.csv";
        a.click();
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-col h-full space-y-4 printable-area">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-[Space_Grotesk] font-bold text-[var(--bone)] flex items-center gap-2">
                    Doctors Directory
                </h2>
                <div className="flex space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--slate-dim)] w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search name or specialty..." 
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
                            <th className="p-4 font-mono text-[11px] uppercase tracking-wider text-[var(--slate)] border-b border-[var(--line)]">Name</th>
                            <th className="p-4 font-mono text-[11px] uppercase tracking-wider text-[var(--slate)] border-b border-[var(--line)]">Specialty</th>
                            <th className="p-4 font-mono text-[11px] uppercase tracking-wider text-[var(--slate)] border-b border-[var(--line)]">Hospital</th>
                            <th className="p-4 font-mono text-[11px] uppercase tracking-wider text-[var(--slate)] border-b border-[var(--line)]">Experience</th>
                            <th className="p-4 font-mono text-[11px] uppercase tracking-wider text-[var(--slate)] border-b border-[var(--line)]">Board Certified</th>
                            <th className="p-4 font-mono text-[11px] uppercase tracking-wider text-[var(--slate)] border-b border-[var(--line)]">Fee</th>
                            <th className="p-4 font-mono text-[11px] uppercase tracking-wider text-[var(--slate)] border-b border-[var(--line)]">Rating</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line)] text-[var(--bone)]">
                        {filteredDoctors.length > 0 ? filteredDoctors.map((d) => (
                            <tr key={d.id} className="hover:bg-[var(--panel-2)] transition-colors">
                                <td className="p-4 font-mono text-[13px] text-[var(--bone)]">{d.name}</td>
                                <td className="p-4 font-mono text-[13px] text-[var(--signal)]">{d.specialty}</td>
                                <td className="p-4 font-mono text-[13px]">{d.hospital_affiliation}</td>
                                <td className="p-4 font-mono text-[13px]">{d.years_experience} yrs</td>
                                <td className="p-4 font-mono text-[13px]">{d.board_certified ? 'Yes' : 'No'}</td>
                                <td className="p-4 font-mono text-[13px]">₹{d.consultation_fee}</td>
                                <td className="p-4 text-[var(--signal)] font-mono font-semibold text-[13px]">{d.satisfaction_score} / 5.0</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-[var(--slate)] font-mono text-sm">
                                    No doctors found. Generate a directory to begin.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
