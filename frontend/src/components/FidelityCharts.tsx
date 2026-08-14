import { Coordinate, PatientRecord, getFidelityMetrics } from "@/lib/api";
import { Activity, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface FidelityChartsProps {
    patients: PatientRecord[];
    diseaseFocus: string;
}

const METRICS = [
    { value: "systolic_bp", label: "Systolic Blood Pressure" },
    { value: "diastolic_bp", label: "Diastolic Blood Pressure" },
    { value: "bmi", label: "BMI" },
    { value: "blood_glucose", label: "Blood Glucose" },
    { value: "cholesterol", label: "Cholesterol" },
    { value: "age", label: "Age" }
];

export default function FidelityCharts({ patients, diseaseFocus }: FidelityChartsProps) {
    const [selectedMetric, setSelectedMetric] = useState(METRICS[0].value);
    const [data, setData] = useState<Coordinate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMetrics = async () => {
            if (patients.length === 0) {
                setData([]);
                return;
            }
            
            setLoading(true);
            setError("");
            try {
                const metrics = await getFidelityMetrics(patients, selectedMetric, diseaseFocus);
                setData(metrics);
            } catch (err: any) {
                setError(err.message || "Failed to load metrics");
            } finally {
                setLoading(false);
            }
        };
        
        fetchMetrics();
    }, [patients, selectedMetric, diseaseFocus]);

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-[Space_Grotesk] font-bold text-[var(--bone)] flex items-center gap-2">
                    <Activity className="w-6 h-6 text-[var(--signal)]" /> Data Accuracy Metrics
                </h2>
                
                <div className="flex items-center gap-3">
                    <label className="text-sm font-mono text-[var(--slate)]">Analysis Metric:</label>
                    <select
                        className="bg-[var(--ink)] border border-[var(--line)] text-[var(--bone)] rounded font-mono p-2 text-sm focus:ring-1 focus:ring-[var(--signal)] focus:border-[var(--signal)] outline-none"
                        value={selectedMetric}
                        onChange={(e) => setSelectedMetric(e.target.value)}
                    >
                        {METRICS.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="glass-card p-6 flex-1 flex flex-col relative">
                {patients.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center font-mono text-[var(--slate)]">
                        Generate patients to view data accuracy.
                    </div>
                ) : loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                    </div>
                ) : error ? (
                    <div className="flex-1 flex items-center justify-center font-mono text-[var(--alert)]">
                        {error}
                    </div>
                ) : (
                    <>
                        <div className="mb-4 text-sm font-mono text-[var(--slate)] border-l-2 border-[var(--signal)] pl-3 py-1">
                            Comparing Real-World Patient Data (Cyan) vs Generated Patient Data (Amber) for {METRICS.find(m => m.value === selectedMetric)?.label}
                        </div>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={data}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--signal)" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="var(--signal)" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorSynthetic" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--amber)" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="var(--amber)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" opacity={0.5} />
                                    <XAxis dataKey="x" stroke="var(--slate)" fontFamily="var(--font-mono)" fontSize={12} />
                                    <YAxis stroke="var(--slate)" tickFormatter={(value) => value.toFixed(3)} fontFamily="var(--font-mono)" fontSize={12} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'var(--panel-2)', borderColor: 'var(--line)', color: 'var(--bone)', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                                        itemStyle={{ color: 'var(--signal)' }}
                                    />
                                    <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="real_density" 
                                        name="Real-World PDF" 
                                        stroke="var(--signal)" 
                                        strokeWidth={2}
                                        fillOpacity={1} 
                                        fill="url(#colorReal)" 
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="synthetic_density" 
                                        name="Synthetic KDE" 
                                        stroke="var(--amber)" 
                                        strokeWidth={2}
                                        fillOpacity={1} 
                                        fill="url(#colorSynthetic)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
