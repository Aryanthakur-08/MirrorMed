from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PatientRecord(BaseModel):
    id: str
    age: int
    sex: str
    systolic_bp: float
    diastolic_bp: float
    bmi: float
    blood_glucose: float
    cholesterol: float
    icd10_code: str
    disease_focus: Optional[str] = None
    # New complex metrics
    o2_saturation: Optional[float] = None
    tumor_marker_level: Optional[float] = None
    cognitive_score: Optional[float] = None

class DoctorRecord(BaseModel):
    id: str
    name: str
    specialty: str
    years_experience: int
    board_certified: bool
    hospital_affiliation: str
    consultation_fee: float
    satisfaction_score: float

class CohortRequest(BaseModel):
    cohort_size: int = Field(..., gt=0, le=1000)
    disease_focus: str
    include_notes: bool = False

class DoctorRequest(BaseModel):
    count: int = Field(..., gt=0, le=500)
    specialty: str

class CohortResponse(BaseModel):
    patients: List[PatientRecord]

class DoctorResponse(BaseModel):
    doctors: List[DoctorRecord]

class ChatRequest(BaseModel):
    prompt: str

class ChatResponse(BaseModel):
    reply: str
    action: Optional[str] = None # e.g. "generate_doctors", "generate_patients"
    action_data: Optional[Dict[str, Any]] = None # The parameters for the action

class NoteRequest(BaseModel):
    patient: PatientRecord

class NoteResponse(BaseModel):
    note: str

class FidelityMetricsRequest(BaseModel):
    patients: List[PatientRecord]
    metric_name: str # e.g. "systolic_bp"
    disease_focus: str = "General"

class Coordinate(BaseModel):
    x: float
    real_density: float
    synthetic_density: float

class FidelityMetricsResponse(BaseModel):
    metric_name: str
    coordinates: List[Coordinate]


import os
from google import genai
from google.genai import types

from dotenv import load_dotenv
import json
import re

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

gemini_client = None
if api_key:
    gemini_client = genai.Client(api_key=api_key)

WORKING_MODEL = None

def generate_content_with_fallback(client, contents, config=None):
    """Wrapper to handle rate limits and non-existent models by falling back gracefully."""
    if not client:
        return None
        
    global WORKING_MODEL
    
    models_to_try = [
        "gemini-3.5-flash",
        "gemini-3.5-flash-lite",
        "gemini-3.6-flash",
        "gemini-3.7-flash",
        "gemini-flash-latest",
        "gemini-flash-lite-latest",
        "gemini-3.1-pro-preview",
        "gemini-pro-latest"
    ]
    
    # Try the last known working model first to avoid network timeouts on failed models
    if WORKING_MODEL and WORKING_MODEL in models_to_try:
        models_to_try.remove(WORKING_MODEL)
        models_to_try.insert(0, WORKING_MODEL)
        
    last_error = None
    for model_name in models_to_try:
        try:
            current_config = config
            if "pro" in model_name:
                # Add a low thinking config if possible to speed up pro models
                if current_config is None:
                    current_config = types.GenerateContentConfig(temperature=0.2)
                else:
                    # just lower temperature for faster, less creative/long answers
                    current_config.temperature = 0.2
            
            result = client.models.generate_content(
                model=model_name,
                contents=contents,
                config=current_config
            )
            WORKING_MODEL = model_name # Cache the successful model!
            return result
        except Exception as e:
            print(f"Model {model_name} failed: {e}")
            last_error = e
            
    print(f"All fallback models failed. Last error: {last_error}")
    return None

def generate_fallback_note(patient: PatientRecord) -> str:
    """Generate a template-based fallback note if AI generation fails."""
    # Use the disease_focus stored on the patient first, then try ICD10 lookup
    specialty = patient.disease_focus or "General"
    if specialty == "General":
        for spec, codes in ICD10_CODES.items():
            if patient.icd10_code in codes:
                specialty = spec
                break
            
    # Dynamic Subjective
    subjective = f"Patient is a {patient.age}-year-old {patient.sex} presenting for routine follow-up. "
    if specialty == "Cardiology":
        subjective += "Patient reports occasional shortness of breath but denies active chest pain."
    elif specialty == "Endocrinology":
        subjective += "Patient states they have been trying to adhere to dietary restrictions. Reports occasional fatigue."
    elif specialty == "Dermatology":
        subjective += "Patient presents with concerns regarding persistent skin irritation and localized lesions."
    elif specialty == "Neurology":
        subjective += "Patient notes some recent mild headaches, but no acute cognitive decline."
    elif specialty == "Oncology":
        subjective += "Patient is here for scheduled oncology follow-up. Reports mild lethargy."
    elif specialty == "Orthopedics":
        subjective += "Patient reports localized joint stiffness, mostly occurring in the mornings."
    elif specialty == "Pulmonology":
        subjective += "Patient reports a mild chronic cough, but denies active wheezing."
    elif specialty == "Gastroenterology":
        subjective += "Patient reports mild intermittent acid reflux, especially after heavy meals."
    elif specialty == "Covid":
        subjective += "Patient is being monitored for lingering respiratory symptoms."
    elif specialty == "Pediatrics":
        if patient.age <= 1:
            subjective = f"Patient is a {patient.age}-year-old {patient.sex} infant brought in by caregiver for routine well-child visit. "
            subjective += "Caregiver reports normal feeding patterns and appropriate developmental milestones."
        else:
            subjective = f"Patient is a {patient.age}-year-old {patient.sex} child brought in by caregiver for routine pediatric evaluation. "
            subjective += "Caregiver reports the child has been generally well with no acute concerns."
    else:
        subjective += "No acute complaints today."

    # Dynamic Objective
    objective = f"Vitals: BP {patient.systolic_bp}/{patient.diastolic_bp} mmHg, BMI {patient.bmi}\n"
    objective += f"Labs: Blood Glucose {patient.blood_glucose} mg/dL, Cholesterol {patient.cholesterol} mg/dL"
    if patient.o2_saturation:
        objective += f"\nO2 Saturation: {patient.o2_saturation}%"
    if patient.tumor_marker_level:
        objective += f"\nTumor Marker Level: {patient.tumor_marker_level} U/mL"
    if patient.cognitive_score:
        objective += f"\nCognitive Score (MoCA): {patient.cognitive_score}/30"

    # Dynamic Assessment
    assessment = f"Primary diagnosis code: {patient.icd10_code} ({specialty}). "
    
    # Check for risks
    risks = []
    if patient.systolic_bp > 140 or patient.diastolic_bp > 90:
        risks.append("hypertension")
    if patient.blood_glucose > 125:
        risks.append("hyperglycemia")
    if patient.cholesterol > 200:
        risks.append("hypercholesterolemia")
    if patient.bmi > 30:
        risks.append("obesity")
        
    if risks:
        assessment += f"Condition is guarded due to {', '.join(risks)}."
    else:
        assessment += "Condition is stable and well-managed."

    # Dynamic Plan
    plan = "- Continue current primary management strategies.\n"
    if "hypertension" in risks:
        plan += "- Monitor blood pressure closely. Consider adjusting anti-hypertensives.\n"
    if "hyperglycemia" in risks:
        plan += "- Strict glycemic control recommended. Advise low-carb diet.\n"
    if "hypercholesterolemia" in risks:
        plan += "- Prescribe/adjust statin therapy to manage lipid profile.\n"
    if "obesity" in risks:
        plan += "- Recommend structured diet and exercise regimen for weight management.\n"
    
    if specialty == "Dermatology":
        plan += "- Prescribed topical corticosteroids. Avoid excessive sun exposure.\n"
    elif specialty == "Orthopedics":
        plan += "- Recommend physical therapy evaluation. Continue NSAIDs as needed.\n"
        
    plan += "- Follow up in 3-6 months or sooner if symptoms worsen."

    return f"SUBJECTIVE:\n{subjective}\n\nOBJECTIVE:\n{objective}\n\nASSESSMENT:\n{assessment}\n\nPLAN:\n{plan}"

def synthesize_clinical_note(patient: PatientRecord) -> str:
    """Uses Gemini API to synthesize a SOAP note, with a fallback."""
    if not gemini_client:
        return generate_fallback_note(patient)
    
    # Use the disease_focus stored on the patient first, then try ICD10 lookup
    specialty = patient.disease_focus or "General"
    if specialty == "General":
        for spec, codes in ICD10_CODES.items():
            if patient.icd10_code in codes:
                specialty = spec
                break
            
    try:
        prompt = f"""
You are an expert physician specializing in {specialty}. Write a professional clinical SOAP note for the following patient data.
The patient is being seen for a condition related to {specialty}.
The note must be formatted clearly into SUBJECTIVE, OBJECTIVE, ASSESSMENT, and PLAN sections.
Ensure the note accurately reflects the provided vitals, lab results, and primary diagnosis code.

Patient Data:
- Age: {patient.age}
- Sex: {patient.sex}
- Systolic BP: {patient.systolic_bp} mmHg
- Diastolic BP: {patient.diastolic_bp} mmHg
- BMI: {patient.bmi} kg/m^2
- Blood Glucose: {patient.blood_glucose} mg/dL
- Cholesterol: {patient.cholesterol} mg/dL
- ICD-10 Code: {patient.icd10_code}

Include realistic, plausible subjective symptoms in the History of Present Illness based on the {specialty} focus and any abnormal vitals or lab results (e.g., if glucose is high, they might report polyuria/polydipsia; if BP is high, maybe headaches or dizziness). Do not just state "no acute symptoms" if their values indicate uncontrolled disease.
Do not include any pleasantries or conversational filler, just the medical note.
"""
        response = generate_content_with_fallback(gemini_client, contents=prompt)
        if response and response.text:
            return response.text.strip()
        else:
            return generate_fallback_note(patient)
    except Exception as e:
        print(f"Error generating note: {e}")
        return generate_fallback_note(patient)

def parse_dataset_intent(query: str) -> dict:
    """Parses a natural language query into a structured dataset generation intent."""
    def fallback_parse(q: str):
        q = q.lower()
        size = 100
        match = re.search(r'\b(\d+)\b', q)
        if match:
            size = int(match.group(1))
            
        action = "generate_patients"
        if any(w in q for w in ["doctor", "physician", "oncologist", "cardiologist", "neurologist", "endocrinologist", "pulmonologist", "specialist", "dr", "surgeon"]):
            action = "generate_doctors"
            
        focus = "General"
        
        # Try to find specialty or focus from the query words
        q_clean = re.sub(r'[^a-zA-Z0-9\s]', '', q.lower())
        words = q_clean.split()
        stop_words = {"create", "a", "dataset", "of", "directory", "give", "me", "generate", "patients", "doctors", "the", "some", "for", str(size)}
        meaningful_words = [w for w in words if w not in stop_words and not w.isdigit()]
        
        if meaningful_words:
            if action == "generate_doctors":
                if meaningful_words[-1] in ["surgeons", "physicians", "specialists"]:
                    focus = meaningful_words[-1].capitalize()
                else:
                    focus = meaningful_words[-1].capitalize()
            else:
                focus = meaningful_words[-1].capitalize()
                
        # Keep original hardcoded matching as priority if it matches well
        if any(w in q for w in ["heart", "cardio", "cardiologist"]):
            focus = "Cardiology"
        elif any(w in q for w in ["cancer", "tumor", "oncology", "oncologist"]):
            focus = "Oncology"
        elif any(w in q for w in ["diabetes", "endocrine", "endocrinology", "endocrinologist", "sugar"]):
            focus = "Endocrinology"
        elif any(w in q for w in ["brain", "neuro", "neurology", "neurologist"]):
            focus = "Neurology"
        elif any(w in q for w in ["lung", "pulmo", "pulmonology", "pulmonologist", "asthma", "copd"]):
            focus = "Pulmonology"
        elif any(w in q for w in ["covid", "covd", "corona", "coronavirus"]):
            focus = "Covid"
        elif any(w in q for w in ["skin", "derma", "dermatologist", "dermatology", "acne", "rash", "psoriasis"]):
            focus = "Dermatology"
        elif any(w in q for w in ["bone", "osteo", "ortho", "orthopedics", "fracture", "arthritis"]):
            focus = "Orthopedics"
        elif any(w in q for w in ["stomach", "gastro", "gastroenterology", "digestion", "acid reflux"]):
            focus = "Gastroenterology"
            
        return {
            "action": action,
            "action_data": {
                "size" if action == "generate_patients" else "count": size,
                "disease_focus" if action == "generate_patients" else "specialty": focus
            }
        }

    if not gemini_client:
        return fallback_parse(query)
        
    try:
        prompt = f"""
Parse the following user query: "{query}"

Determine if they want to generate patients (a cohort) or doctors.
Also extract the number they want to generate (default to 100 if not specified, limit to 1000 max), and the disease focus or specialty.
Extract the disease focus or specialty from the request. Your PRIMARY task is to map colloquial or layperson terms to standard medical specialties (e.g., 'sugar' -> 'Endocrinology', 'baby' -> 'Pediatrics', 'heart' -> 'Cardiology', 'covd' -> 'Covid'). If it's a specific disease without a broad specialty, correct spelling and capitalize it properly. Do NOT restrict it to a predefined list.
If the query is completely unrelated to medical data, default to generating 100 General patients.

Respond ONLY with valid JSON in this exact structure:
{{
  "action": "generate_patients" OR "generate_doctors",
  "action_data": {{
    "size": <int for patients, e.g. 50> OR "count": <int for doctors, e.g. 50>,
    "disease_focus": "<string for patients>" OR "specialty": "<string for doctors>"
  }}
}}
"""
        response = generate_content_with_fallback(
            gemini_client, 
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        if not response or not response.text:
            return fallback_parse(query)
        text = response.text.strip()
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            text = match.group(0)
        parsed = json.loads(text)
        
        if "action_data" in parsed:
            if "disease_focus" in parsed["action_data"] and parsed["action_data"]["disease_focus"].lower() == "covd":
                parsed["action_data"]["disease_focus"] = "Covid"
            if "specialty" in parsed["action_data"] and parsed["action_data"]["specialty"].lower() == "covd":
                parsed["action_data"]["specialty"] = "Covid"
                
        return parsed
    except Exception as e:
        print(f"Error parsing intent: {e}. Using fallback.")
        return fallback_parse(query)

def normalize_medical_term(term: str) -> str:
    """Uses Gemini to normalize medical abbreviations or typos into proper medical terms."""
    if not gemini_client:
        return term.capitalize()
    
    try:
        prompt = f"""
You are an expert medical data assistant.
The user entered the term: "{term}"
Your primary task is to map colloquial or layperson terms to standard medical specialties or canonical disease focuses if applicable (e.g., 'sugar' -> 'Endocrinology', 'heart attack' -> 'Cardiology', 'baby' -> 'Pediatrics', 'bone' -> 'Orthopedics', 'covd' -> 'Covid').
If the term is already a medical condition, correct any spelling mistakes and capitalize it properly.
Respond ONLY with the properly spelled, capitalized medical term or specialty. Do not add any extra text or punctuation.
"""
        response = generate_content_with_fallback(gemini_client, contents=prompt)
        if not response or not response.text:
            return term.capitalize()
        corrected = response.text.strip().strip("\"'")
        return corrected if corrected else term.capitalize()
    except Exception as e:
        print(f"Error normalizing term: {e}")
        return term.capitalize()

def generate_dynamic_baseline(focus: str) -> Optional[Dict[str, Any]]:
    """Uses Gemini to dynamically generate statistical baselines and ICD-10 codes for an unknown disease/specialty."""
    if not gemini_client:
        # If no API key, fallback to General baseline
        return None
        
    try:
        prompt = f"""
You are an expert clinical epidemiologist and data scientist.
Generate a realistic synthetic data baseline for the following disease focus or medical specialty: "{focus}".

Provide the mean and standard deviation for the following metrics:
- age
- systolic_bp
- diastolic_bp
- bmi
- blood_glucose
- cholesterol

Also provide a list of 5 valid ICD-10 codes related to this focus.

Respond ONLY with valid JSON in this exact structure:
{{
  "age": [<mean as int>, <std as int>],
  "systolic_bp": [<mean as int>, <std as int>],
  "diastolic_bp": [<mean as int>, <std as int>],
  "bmi": [<mean as int>, <std as int>],
  "blood_glucose": [<mean as int>, <std as int>],
  "cholesterol": [<mean as int>, <std as int>],
  "icd10_codes": ["code1", "code2", "code3", "code4", "code5"]
}}
"""
        response = generate_content_with_fallback(
            gemini_client, 
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        if not response or not response.text:
            return None
        text = response.text.strip()
        # Robustly extract JSON block in case model includes extra text or markdown
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            text = match.group(0)
        return json.loads(text)
    except Exception as e:
        print(f"Error generating dynamic baseline for {focus}: {e}")
        return None


import numpy as np
from scipy import stats
import uuid
import random
from typing import List
import difflib


BASELINES: Dict[str, Dict[str, Any]] = {
    "General": {
        "age": (45, 15), "systolic_bp": (120, 15), "diastolic_bp": (80, 10),
        "bmi": (26, 5), "blood_glucose": (90, 10), "cholesterol": (180, 30)
    },
    "Cardiology": {
        "age": (65, 10), "systolic_bp": (145, 20), "diastolic_bp": (90, 12),
        "bmi": (29, 6), "blood_glucose": (105, 15), "cholesterol": (240, 40)
    },
    "Endocrinology": {
        "age": (55, 12), "systolic_bp": (130, 15), "diastolic_bp": (85, 10),
        "bmi": (32, 7), "blood_glucose": (150, 40), "cholesterol": (210, 35)
    },
    "Oncology": {
        "age": (60, 14), "systolic_bp": (125, 15), "diastolic_bp": (80, 10),
        "bmi": (24, 6), "blood_glucose": (100, 15), "cholesterol": (190, 35),
        "tumor_marker_level": (150, 50)
    },
    "Neurology": {
        "age": (70, 12), "systolic_bp": (135, 18), "diastolic_bp": (82, 11),
        "bmi": (25, 5), "blood_glucose": (95, 12), "cholesterol": (200, 40),
        "cognitive_score": (22, 5) # MoCA score out of 30
    },
    "Pulmonology": {
        "age": (62, 13), "systolic_bp": (130, 16), "diastolic_bp": (84, 12),
        "bmi": (27, 6), "blood_glucose": (100, 14), "cholesterol": (205, 35),
        "o2_saturation": (92, 4)
    },
    "Dermatology": {
        "age": (35, 15), "systolic_bp": (118, 12), "diastolic_bp": (78, 8),
        "bmi": (24, 4), "blood_glucose": (90, 10), "cholesterol": (175, 25)
    },
    "Orthopedics": {
        "age": (55, 18), "systolic_bp": (125, 14), "diastolic_bp": (82, 9),
        "bmi": (28, 5), "blood_glucose": (95, 12), "cholesterol": (195, 30)
    },
    "Gastroenterology": {
        "age": (48, 15), "systolic_bp": (122, 14), "diastolic_bp": (80, 10),
        "bmi": (27, 6), "blood_glucose": (98, 15), "cholesterol": (185, 35)
    },
    "Covid": {
        "age": (45, 20), "systolic_bp": (125, 15), "diastolic_bp": (82, 10),
        "bmi": (26, 5), "blood_glucose": (95, 12), "cholesterol": (180, 30),
        "o2_saturation": (94, 6)
    },
    "Pediatrics": {
        "age": (3, 2), "systolic_bp": (95, 10), "diastolic_bp": (60, 8),
        "bmi": (16, 2), "blood_glucose": (85, 10), "cholesterol": (160, 20)
    }
}

ICD10_CODES = {
    "General": ["Z00.00", "J01.90", "J06.9", "R51", "M54.5"],
    "Cardiology": ["I10", "I25.10", "I50.9", "I48.91", "E78.5"],
    "Endocrinology": ["E11.9", "E03.9", "E66.9", "E11.65", "E78.00"],
    "Oncology": ["C34.90", "C50.919", "C61", "C18.9", "D05.90"],
    "Neurology": ["G30.9", "G20", "G43.909", "G35", "I63.9"],
    "Pulmonology": ["J44.9", "J45.909", "J18.9", "J96.9", "J43.9"],
    "Dermatology": ["L70.0", "L20.9", "L40.9", "C43.9", "L29.9"],
    "Orthopedics": ["M54.5", "M19.90", "M81.0", "S82.009A", "M15.9"],
    "Gastroenterology": ["K21.9", "K58.9", "K29.70", "K76.0", "K92.2"],
    "Covid": ["U07.1", "J12.82", "J80", "R05", "R50.9"],
    "Pediatrics": ["P07.39", "P22.0", "J06.9", "Z00.129", "P59.9"]
}

# Map common disease names, abbreviations, and related terms to existing baseline keys
DISEASE_ALIASES: Dict[str, str] = {
    # Endocrinology / Diabetes
    "diabetes": "Endocrinology", "diabetes mellitus": "Endocrinology",
    "type 2 diabetes": "Endocrinology", "type 1 diabetes": "Endocrinology",
    "t2dm": "Endocrinology", "t1dm": "Endocrinology",
    "diabetic": "Endocrinology", "hyperglycemia": "Endocrinology",
    "thyroid": "Endocrinology", "hypothyroidism": "Endocrinology",
    "obesity": "Endocrinology", "sugar": "Endocrinology",
    "sugar patient": "Endocrinology", "sugar patients": "Endocrinology",
    # Cardiology
    "heart failure": "Cardiology", "heart disease": "Cardiology",
    "cardiac": "Cardiology", "hypertension": "Cardiology",
    "cardiovascular": "Cardiology", "atrial fibrillation": "Cardiology",
    "coronary artery disease": "Cardiology", "cad": "Cardiology",
    "heart attack": "Cardiology", "myocardial infarction": "Cardiology",
    # Oncology
    "cancer": "Oncology", "tumor": "Oncology", "malignancy": "Oncology",
    "breast cancer": "Oncology", "lung cancer": "Oncology",
    "colon cancer": "Oncology", "prostate cancer": "Oncology",
    # Neurology
    "alzheimer": "Neurology", "alzheimers": "Neurology",
    "parkinson": "Neurology", "parkinsons": "Neurology",
    "dementia": "Neurology", "stroke": "Neurology", "epilepsy": "Neurology",
    "migraine": "Neurology", "multiple sclerosis": "Neurology",
    # Pulmonology
    "asthma": "Pulmonology", "copd": "Pulmonology",
    "pneumonia": "Pulmonology", "respiratory": "Pulmonology",
    "lung disease": "Pulmonology", "bronchitis": "Pulmonology",
    # Dermatology
    "acne": "Dermatology", "eczema": "Dermatology", "psoriasis": "Dermatology",
    "rash": "Dermatology", "skin": "Dermatology", "melanoma": "Dermatology",
    # Orthopedics
    "fracture": "Orthopedics", "arthritis": "Orthopedics",
    "osteoporosis": "Orthopedics", "back pain": "Orthopedics",
    "joint pain": "Orthopedics", "bone": "Orthopedics",
    # Gastroenterology
    "acid reflux": "Gastroenterology", "gerd": "Gastroenterology",
    "ibs": "Gastroenterology", "gastritis": "Gastroenterology",
    "liver disease": "Gastroenterology", "crohns": "Gastroenterology",
    "ulcerative colitis": "Gastroenterology",
    # Covid
    "covid": "Covid", "covid-19": "Covid", "covid19": "Covid",
    "coronavirus": "Covid", "sars-cov-2": "Covid",
    # Pediatrics (use General with young ages)
    "pediatric": "Pediatrics", "pediatrics": "Pediatrics",
    "neonatal": "Pediatrics", "neonatology": "Pediatrics",
    "baby": "Pediatrics", "infant": "Pediatrics", "newborn": "Pediatrics",
    "child": "Pediatrics", "children": "Pediatrics", "toddler": "Pediatrics",
}

def resolve_disease_alias(focus: str) -> str:
    """Resolve common disease names/aliases to their baseline specialty key."""
    # Direct match in BASELINES already
    if focus in BASELINES:
        return focus
        
    alias_key = focus.lower().strip()
    
    # Check exact aliases (case-insensitive)
    if alias_key in DISEASE_ALIASES:
        return DISEASE_ALIASES[alias_key]
        
    # Check partial matches
    for alias, baseline_key in DISEASE_ALIASES.items():
        if alias in alias_key or alias_key in alias:
            return baseline_key
            
    # Fuzzy matching for typos (e.g. "alzimer" -> "alzheimer")
    possible_matches = difflib.get_close_matches(alias_key, DISEASE_ALIASES.keys(), n=1, cutoff=0.7)
    if possible_matches:
        return DISEASE_ALIASES[possible_matches[0]]
        
    return focus  # Return as-is, let dynamic baseline handle it


def generate_cohort_data(cohort_size: int, disease_focus: str) -> List[PatientRecord]:
    # Resolve aliases first (e.g., "Diabetes" -> "Endocrinology")
    original_focus = disease_focus
    disease_focus = resolve_disease_alias(disease_focus)
    
    if disease_focus not in BASELINES:
        dynamic_baseline = generate_dynamic_baseline(disease_focus)
        if dynamic_baseline:
            BASELINES[disease_focus] = {
                "age": tuple(dynamic_baseline.get("age", (50, 15))),
                "systolic_bp": tuple(dynamic_baseline.get("systolic_bp", (120, 15))),
                "diastolic_bp": tuple(dynamic_baseline.get("diastolic_bp", (80, 10))),
                "bmi": tuple(dynamic_baseline.get("bmi", (26, 5))),
                "blood_glucose": tuple(dynamic_baseline.get("blood_glucose", (90, 10))),
                "cholesterol": tuple(dynamic_baseline.get("cholesterol", (180, 30)))
            }
            ICD10_CODES[disease_focus] = dynamic_baseline.get("icd10_codes", ["Z00.00"])
        else:
            disease_focus = "General"
    
    baseline = BASELINES[disease_focus]
    icd_codes = ICD10_CODES[disease_focus]
    
    mean_age = baseline["age"][0]
    std_age = baseline["age"][1]
    min_age = max(0, int(mean_age - 2.5 * std_age))
    
    ages = np.random.normal(mean_age, std_age, cohort_size).clip(min_age, 100)
    sexes = np.random.choice(["M", "F"], cohort_size)
    
    is_pediatric = disease_focus == "Pediatrics"
    bmi_min = 12 if is_pediatric else 15
    bp_sys_min = 60 if is_pediatric else 90
    bp_dia_min = 35 if is_pediatric else 60
    
    bmis = np.random.normal(baseline["bmi"][0], baseline["bmi"][1], cohort_size).clip(bmi_min, 50)
    
    # Use proper statistical correlation to maintain marginal variance
    def correlate(mean, std, rho, z_base):
        noise = np.random.normal(0, 1, cohort_size)
        return mean + std * (rho * z_base + np.sqrt(1 - rho**2) * noise)
        
    bmi_z = (bmis - baseline["bmi"][0]) / baseline["bmi"][1]
    
    sys_bps = correlate(baseline["systolic_bp"][0], baseline["systolic_bp"][1], 0.4, bmi_z)
    sys_bps = sys_bps.clip(bp_sys_min, 200)
    
    dia_bps = correlate(baseline["diastolic_bp"][0], baseline["diastolic_bp"][1], 0.3, bmi_z)
    dia_bps = dia_bps.clip(bp_dia_min, 130)
    
    glucoses = correlate(baseline["blood_glucose"][0], baseline["blood_glucose"][1], 0.5, bmi_z)
    glucoses = glucoses.clip(50 if is_pediatric else 70, 350)
    
    cholesterols = correlate(baseline["cholesterol"][0], baseline["cholesterol"][1], 0.4, bmi_z)
    cholesterols = cholesterols.clip(100 if is_pediatric else 120, 400)
    
    # Complex metrics
    o2_sats = np.zeros(cohort_size)
    tumor_markers = np.zeros(cohort_size)
    cog_scores = np.zeros(cohort_size)
    
    if disease_focus == "Pulmonology":
        o2_sats = correlate(baseline["o2_saturation"][0], baseline["o2_saturation"][1], -0.3, bmi_z)
        o2_sats = o2_sats.clip(70, 100)
    elif disease_focus == "Oncology":
        tumor_markers = np.random.normal(baseline["tumor_marker_level"][0], baseline["tumor_marker_level"][1], cohort_size)
        tumor_markers = tumor_markers.clip(0, 500)
    elif disease_focus == "Neurology":
        # Age strongly correlates with cognitive score decline
        age_factor = (ages - 60) * 0.2
        cog_scores = np.random.normal(baseline["cognitive_score"][0], baseline["cognitive_score"][1], cohort_size) - age_factor
        cog_scores = cog_scores.clip(0, 30)
    
    patients = []
    for i in range(cohort_size):
        patients.append(PatientRecord(
            id=str(uuid.uuid4()),
            age=int(ages[i]),
            sex=sexes[i],
            systolic_bp=round(sys_bps[i], 1),
            diastolic_bp=round(dia_bps[i], 1),
            bmi=round(bmis[i], 1),
            blood_glucose=round(glucoses[i], 1),
            cholesterol=round(cholesterols[i], 1),
            icd10_code=np.random.choice(icd_codes),
            disease_focus=disease_focus,
            o2_saturation=round(o2_sats[i], 1) if disease_focus == "Pulmonology" else None,
            tumor_marker_level=round(tumor_markers[i], 1) if disease_focus == "Oncology" else None,
            cognitive_score=round(cog_scores[i], 1) if disease_focus == "Neurology" else None
        ))
        
    return patients

def calculate_kde(data: np.ndarray, x_grid: np.ndarray) -> np.ndarray:
    if len(data) == 0:
        return np.zeros_like(x_grid)
    try:
        kde = stats.gaussian_kde(data)
        return kde.evaluate(x_grid)
    except:
        return np.zeros_like(x_grid)

def calculate_fidelity_metrics(patients: List[PatientRecord], metric_name: str, disease_focus: str = "General") -> List[Coordinate]:
    if not patients:
        return []
    
    baseline = BASELINES.get(disease_focus, BASELINES["General"])
    
    # Handle base metrics or custom metrics
    if metric_name not in baseline:
        # fallback to General baseline if they asked for something without a disease focus
        # or if the metric doesn't exist at all, return empty
        found = False
        for focus, data in BASELINES.items():
            if metric_name in data:
                baseline = BASELINES[focus]
                found = True
                break
        if not found:
            return []
    
    synthetic_data = np.array([getattr(p, metric_name) for p in patients if getattr(p, metric_name) is not None])
    if len(synthetic_data) == 0:
        return []
        
    real_mean, real_std = baseline[metric_name]
    
    min_val = min(synthetic_data.min(), real_mean - 4*real_std)
    max_val = max(synthetic_data.max(), real_mean + 4*real_std)
    if min_val == max_val:
        min_val -= 1
        max_val += 1
    x_grid = np.linspace(min_val, max_val, 100)
    
    real_density = stats.norm.pdf(x_grid, real_mean, real_std)
    synthetic_density = calculate_kde(synthetic_data, x_grid)
    
    coordinates = []
    for i in range(len(x_grid)):
        coordinates.append(Coordinate(
            x=round(x_grid[i], 2),
            real_density=round(real_density[i], 6),
            synthetic_density=round(synthetic_density[i], 6)
        ))
        
    return coordinates

FIRST_NAMES = ["Aarav", "Aditya", "Vihaan", "Arjun", "Sai", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Rohan", "Ananya", "Diya", "Khushi", "Bhavya", "Riya", "Aanya", "Priya", "Sneha", "Kavya", "Neha"]
LAST_NAMES = ["Sharma", "Singh", "Patel", "Kumar", "Gupta", "Das", "Shah", "Reddy", "Rao", "Jain", "Bose", "Verma", "Yadav", "Chopra", "Chauhan"]
HOSPITALS = ["AIIMS New Delhi", "Apollo Hospitals", "Fortis Healthcare", "Medanta The Medicity", "Narayana Health", "Tata Memorial Hospital", "CMC Vellore", "Hinduja Hospital", "Manipal Hospitals"]

def generate_doctors_data(count: int, specialty: str) -> List[DoctorRecord]:
    doctors = []
    for _ in range(count):
        fname = random.choice(FIRST_NAMES)
        lname = random.choice(LAST_NAMES)
        exp = np.random.normal(15, 8)
        exp = int(np.clip(exp, 1, 40))
        
        board = np.random.choice([True, False], p=[0.9, 0.1])
        fee = np.random.normal(2000, 500) if specialty in ["Cardiology", "Oncology", "Neurology"] else np.random.normal(800, 200)
        fee = round(np.clip(fee, 500, 5000), -2) # Round to nearest 100
        
        sat = np.random.normal(4.6, 0.3)
        sat = round(np.clip(sat, 1.0, 5.0), 1)
        
        doctors.append(DoctorRecord(
            id=str(uuid.uuid4()),
            name=f"Dr. {fname} {lname}",
            specialty=specialty,
            years_experience=exp,
            board_certified=board,
            hospital_affiliation=random.choice(HOSPITALS),
            consultation_fee=fee,
            satisfaction_score=sat
        ))
    return doctors


from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware





app = FastAPI(title="MirrorMed API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/generate-cohort", response_model=CohortResponse)
async def generate_cohort(request: CohortRequest):
    try:
        # Priority 1: AI normalization and mapping
        focus = normalize_medical_term(request.disease_focus)
        
        # Priority 2: Fallback to local dictionary aliases (in case AI missed it or returned a raw term we have an alias for)
        focus = resolve_disease_alias(focus)
        
        patients = generate_cohort_data(request.cohort_size, focus)
        return CohortResponse(patients=patients)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/synthesize-note", response_model=NoteResponse)
async def synthesize_note(request: NoteRequest):
    try:
        note = synthesize_clinical_note(request.patient)
        return NoteResponse(note=note)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/fidelity-metrics", response_model=FidelityMetricsResponse)
async def get_fidelity_metrics(request: FidelityMetricsRequest):
    try:
        coordinates = calculate_fidelity_metrics(request.patients, request.metric_name, request.disease_focus)
        return FidelityMetricsResponse(metric_name=request.metric_name, coordinates=coordinates)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/doctors", response_model=DoctorResponse)
async def generate_doctors(request: DoctorRequest):
    try:
        normalized_specialty = normalize_medical_term(request.specialty)
        doctors = generate_doctors_data(request.count, normalized_specialty)
        return DoctorResponse(doctors=doctors)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat-intent", response_model=ChatResponse)
async def chat_intent(request: ChatRequest):
    try:
        intent = parse_dataset_intent(request.prompt)
        
        reply_msg = ""
        if intent["action"] == "generate_patients":
            size = intent["action_data"].get("size", 100)
            focus = intent["action_data"].get("disease_focus", "General")
            reply_msg = f"Got it. Generating a dataset of {size} {focus} patients."
        elif intent["action"] == "generate_doctors":
            count = intent["action_data"].get("count", 20)
            specialty = intent["action_data"].get("specialty", "General")
            reply_msg = f"Understood. Generating a directory of {count} {specialty} specialists."
            
        return ChatResponse(
            reply=reply_msg,
            action=intent["action"],
            action_data=intent["action_data"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
