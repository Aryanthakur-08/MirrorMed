const BASE_URL = 'http://127.0.0.1:8000/api';

export interface PatientRecord {
    id: string;
    age: number;
    sex: string;
    systolic_bp: number;
    diastolic_bp: number;
    bmi: number;
    blood_glucose: number;
    cholesterol: number;
    icd10_code: string;
    o2_saturation?: number;
    tumor_marker_level?: number;
    cognitive_score?: number;
}

export interface DoctorRecord {
    id: string;
    name: string;
    specialty: string;
    years_experience: number;
    board_certified: boolean;
    hospital_affiliation: string;
    consultation_fee: number;
    satisfaction_score: number;
}

export interface ChatIntentResponse {
    reply: string;
    action: string;
    action_data: any;
}

export interface Coordinate {
    x: number;
    real_density: number;
    synthetic_density: number;
}

export async function generateCohort(size: number, focus: string): Promise<PatientRecord[]> {
    const res = await fetch(`${BASE_URL}/generate-cohort`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cohort_size: size, disease_focus: focus })
    });
    
    if (!res.ok) {
        throw new Error('Failed to generate cohort');
    }
    
    const data = await res.json();
    return data.patients;
}

export async function synthesizeNote(patient: PatientRecord): Promise<string> {
    const res = await fetch(`${BASE_URL}/synthesize-note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient })
    });
    
    if (!res.ok) {
        throw new Error('Failed to synthesize note');
    }
    
    const data = await res.json();
    return data.note;
}

export async function getFidelityMetrics(patients: PatientRecord[], metricName: string, diseaseFocus: string): Promise<Coordinate[]> {
    const res = await fetch(`${BASE_URL}/fidelity-metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patients, metric_name: metricName, disease_focus: diseaseFocus })
    });
    
    if (!res.ok) {
        throw new Error(`Failed to calculate fidelity metrics for ${metricName}`);
    }
    
    const data = await res.json();
    return data.coordinates;
}

export async function generateDoctors(count: number, specialty: string): Promise<DoctorRecord[]> {
    const res = await fetch(`${BASE_URL}/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count, specialty })
    });
    
    if (!res.ok) {
        throw new Error('Failed to generate doctors');
    }
    
    const data = await res.json();
    return data.doctors;
}

export async function chatIntent(prompt: string): Promise<ChatIntentResponse> {
    const res = await fetch(`${BASE_URL}/chat-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
    });
    
    if (!res.ok) {
        throw new Error('Failed to parse chat intent');
    }
    
    return await res.json();
}
