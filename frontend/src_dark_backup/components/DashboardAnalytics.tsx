import { PatientRecord, DoctorRecord } from "@/lib/api";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from "recharts";
import { LayoutDashboard, Users, Activity } from "lucide-react";

interface DashboardAnalyticsProps {
    patients?: PatientRecord[];
    doctors?: DoctorRecord[];
    module: "cohort" | "doctors";
}

/* Cyber-Medical theme constants */
const GLASS_BORDER = "border border-[var(--line)]";
const GLASS_RADIUS = "rounded";
const ACCENT_CARD = "bg-[var(--panel)]";
const CARD_BG = "bg-[var(--panel)]";

export default function DashboardAnalytics({ patients = [], doctors = [], module }: DashboardAnalyticsProps) {
    if (module === "cohort") {
        if (patients.length === 0) {
            return (
                <div className="flex h-full items-center justify-center text-[var(--slate)] font-mono">
                    Generate patients to view analytics.
                </div>
            );
        }

        // 1. Gender Distribution
        const genderCount = patients.reduce((acc, p) => {
            acc[p.sex] = (acc[p.sex] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const genderData = Object.keys(genderCount).map(key => ({
            name: key === 'M' ? 'Male' : key === 'F' ? 'Female' : key,
            value: genderCount[key]
        }));

        // 2. Age Distribution (Bins of 10)
        const ageBins: Record<string, number> = { '18-30': 0, '31-40': 0, '41-50': 0, '51-60': 0, '61-70': 0, '71+': 0 };
        patients.forEach(p => {
            if (p.age <= 30) ageBins['18-30']++;
            else if (p.age <= 40) ageBins['31-40']++;
            else if (p.age <= 50) ageBins['41-50']++;
            else if (p.age <= 60) ageBins['51-60']++;
            else if (p.age <= 70) ageBins['61-70']++;
            else ageBins['71+']++;
        });
        const ageData = Object.keys(ageBins).map(key => ({ range: key, count: ageBins[key] }));

        // 3. BMI vs Blood Glucose
        const scatterData = patients.map(p => ({
            bmi: p.bmi,
            glucose: p.blood_glucose,
            age: p.age
        }));

        return (
            <div className="flex flex-col h-full space-y-6 overflow-y-auto">
                <h2 className="text-2xl font-[Space_Grotesk] font-bold text-[var(--bone)] flex items-center gap-2">
                    <Activity className="w-6 h-6 text-[var(--signal)]" /> Patient Group Analytics
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[350px]">
                    {/* Age Distribution */}
                    <div className="glass-card p-4 flex flex-col h-80">
                        <h3 className="text-sm font-mono text-[var(--slate)] mb-4 text-center uppercase tracking-wider">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-[var(--signal)] rounded-full animate-pulse"></span>
                                Age Distribution
                            </span>
                        </h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ageData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                                <XAxis dataKey="range" stroke="var(--slate)" fontSize={12} fontFamily="var(--font-mono)" />
                                <YAxis stroke="var(--slate)" fontSize={12} fontFamily="var(--font-mono)" />
                                <Tooltip contentStyle={{ backgroundColor: "var(--panel-2)", borderColor: "var(--line)", color: "var(--bone)", borderRadius: "4px", fontFamily: "var(--font-mono)", fontSize: "12px" }} />
                                <Bar dataKey="count" fill="var(--signal)" radius={[2, 2, 0, 0]} name="Patients" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Gender Demographics */}
                    <div className="glass-card p-4 flex flex-col h-80">
                        <h3 className="text-sm font-mono text-[var(--slate)] mb-4 text-center uppercase tracking-wider">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-[var(--signal)] rounded-full animate-pulse"></span>
                                Gender Demographics
                            </span>
                        </h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={genderData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {genderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={["#14b8a6", "#10b981", "#3b82f6", "#8b5cf6"][index % 4]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: "#fff", borderColor: "#e2e8f0", color: "#334155", borderRadius: "8px" }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* BMI vs Blood Glucose Scatter */}
                    <div className={`${ACCENT_CARD} ${GLASS_RADIUS} ${GLASS_BORDER} p-4 flex flex-col h-80 shadow-sm`}>
                        <h3 className="text-sm font-mono text-[var(--slate)] mb-4 text-center uppercase tracking-wider">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-[var(--signal)] rounded-full animate-pulse"></span>
                                BMI vs Blood Glucose
                            </span>
                        </h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                                <XAxis type="number" dataKey="bmi" name="BMI" stroke="var(--slate)" fontSize={12} fontFamily="var(--font-mono)" />
                                <YAxis type="number" dataKey="glucose" name="Blood Glucose" stroke="var(--slate)" fontSize={12} fontFamily="var(--font-mono)" />
                                <ZAxis type="number" dataKey="age" range={[20, 150]} name="Age" />
                                <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ backgroundColor: "var(--panel-2)", borderColor: "var(--line)", color: "var(--bone)", borderRadius: "4px", fontFamily: "var(--font-mono)", fontSize: "12px" }} />
                                <Scatter name="Patients" data={scatterData} fill="var(--signal)" opacity={0.85} />
                                {/* Add a subtle glow effect for emphasis */}
                                <Scatter
                                    name="Highlight"
                                    data={scatterData}
                                    fill="none"
                                    stroke="var(--signal)"
                                    strokeWidth={2}
                                    strokeOpacity={0.6}
                                />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    } else {
        if (doctors.length === 0) {
            return (
                <div className="flex h-full items-center justify-center text-[var(--slate)] font-mono">
                    Generate doctors to view analytics.
                </div>
            );
        }

        // 1. Specialty Distribution
        const specialtyCount = doctors.reduce((acc, d) => {
            acc[d.specialty] = (acc[d.specialty] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const specialtyData = Object.keys(specialtyCount).map(key => ({
            name: key,
            value: specialtyCount[key]
        }));

        // 2. Experience Bins
        const expBins: Record<string, number> = { '1-5 yrs': 0, '6-15 yrs': 0, '16-25 yrs': 0, '25+ yrs': 0 };
        doctors.forEach(d => {
            if (d.years_experience <= 5) expBins['1-5 yrs']++;
            else if (d.years_experience <= 15) expBins['6-15 yrs']++;
            else if (d.years_experience <= 25) expBins['16-25 yrs']++;
            else expBins['25+ yrs']++;
        });
        const expData = Object.keys(expBins).map(key => ({ range: key, count: expBins[key] }));

        // 3. Board Certification
        const boardData = [
            { name: "Certified", value: doctors.filter(d => d.board_certified).length },
            { name: "Not Certified", value: doctors.filter(d => !d.board_certified).length }
        ];

        // 4. Consultation Fee Distribution
        const feeBins: Record<string, number> = { '< ₹1000': 0, '₹1000-₹2000': 0, '₹2000-₹3000': 0, '> ₹3000': 0 };
        doctors.forEach(d => {
            if (d.consultation_fee < 1000) feeBins['< ₹1000']++;
            else if (d.consultation_fee <= 2000) feeBins['₹1000-₹2000']++;
            else if (d.consultation_fee <= 3000) feeBins['₹2000-₹3000']++;
            else feeBins['> ₹3000']++;
        });
        const feeData = Object.keys(feeBins).map(key => ({ range: key, count: feeBins[key] }));

        return (
            <div className="flex flex-col h-full space-y-6 overflow-y-auto">
                <h2 className="text-2xl font-[Space_Grotesk] font-bold text-[var(--bone)] flex items-center gap-2">
                    <LayoutDashboard className="w-6 h-6 text-[var(--signal)]" /> Doctors Directory Analytics
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[350px]">
                    {/* Specialty Distribution */}
                    <div className="glass-card p-4 flex flex-col h-80">
                        <h3 className="text-sm font-mono text-[var(--slate)] mb-4 text-center uppercase tracking-wider">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-[var(--signal)] rounded-full animate-pulse"></span>
                                Specialty Distribution
                            </span>
                        </h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={specialtyData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {specialtyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={["#10b981", "#14b8a6", "#3b82f6", "#8b5cf6"][index % 4]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: "var(--panel-2)", borderColor: "var(--line)", color: "var(--bone)", borderRadius: "4px", fontFamily: "var(--font-mono)", fontSize: "12px" }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Years of Experience */}
                    <div className="glass-card p-4 flex flex-col h-80">
                        <h3 className="text-sm font-mono text-[var(--slate)] mb-4 text-center uppercase tracking-wider">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-[var(--signal)] rounded-full animate-pulse"></span>
                                Years of Experience
                            </span>
                        </h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={expData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                                <XAxis dataKey="range" stroke="var(--slate)" fontSize={12} fontFamily="var(--font-mono)" />
                                <YAxis stroke="var(--slate)" fontSize={12} fontFamily="var(--font-mono)" />
                                <Tooltip contentStyle={{ backgroundColor: "var(--panel-2)", borderColor: "var(--line)", color: "var(--bone)", borderRadius: "4px", fontFamily: "var(--font-mono)", fontSize: "12px" }} />
                                <Bar dataKey="count" fill="var(--signal)" radius={[2, 2, 0, 0]} name="Doctors" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Board Certification */}
                    <div className="glass-card p-4 flex flex-col h-80">
                        <h3 className="text-sm font-mono text-[var(--slate)] mb-4 text-center uppercase tracking-wider">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-[var(--signal)] rounded-full animate-pulse"></span>
                                Board Certification
                            </span>
                        </h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={boardData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    dataKey="value"
                                >
                                    <Cell fill="var(--signal)" />
                                    <Cell fill="var(--alert)" />
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: "var(--panel-2)", borderColor: "var(--line)", color: "var(--bone)", borderRadius: "4px", fontFamily: "var(--font-mono)", fontSize: "12px" }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Consultation Fee Ranges */}
                    <div className="glass-card p-4 flex flex-col h-80">
                        <h3 className="text-sm font-mono text-[var(--slate)] mb-4 text-center uppercase tracking-wider">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-[var(--signal)] rounded-full animate-pulse"></span>
                                Consultation Fee Ranges
                            </span>
                        </h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={feeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                                <XAxis dataKey="range" stroke="var(--slate)" fontSize={12} fontFamily="var(--font-mono)" />
                                <YAxis stroke="var(--slate)" fontSize={12} fontFamily="var(--font-mono)" />
                                <Tooltip contentStyle={{ backgroundColor: "var(--panel-2)", borderColor: "var(--line)", color: "var(--bone)", borderRadius: "4px", fontFamily: "var(--font-mono)", fontSize: "12px" }} />
                                <Bar dataKey="count" fill="var(--amber)" radius={[2, 2, 0, 0]} name="Doctors" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    }
}