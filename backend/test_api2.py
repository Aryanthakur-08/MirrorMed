import os
import google.generativeai as genai
from dotenv import load_dotenv
import json
from pydantic import BaseModel

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
print(f"Key loaded: {bool(api_key)}")
if api_key:
    genai.configure(api_key=api_key)

class PatientRecord(BaseModel):
    id: str = "1"
    age: int = 30
    sex: str = "F"
    systolic_bp: float = 120
    diastolic_bp: float = 80
    bmi: float = 26
    blood_glucose: float = 89
    cholesterol: float = 245
    icd10_code: str = "J06.9"

def test_note():
    try:
        model = genai.GenerativeModel("gemini-flash-latest")
        patient = PatientRecord()
        prompt = f"""
You are an expert physician. Write a professional clinical SOAP note for the following patient data.
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

Do not include any pleasantries or conversational filler, just the medical note.
"""
        response = model.generate_content(prompt)
        print("Note generation success:")
        # print(response.text)
    except Exception as e:
        print(f"Error generating note: {e}")

def test_baseline():
    try:
        model = genai.GenerativeModel(
            "gemini-flash-latest",
            generation_config={"response_mime_type": "application/json"}
        )
        prompt = """
You are an expert clinical epidemiologist and data scientist.
Generate a realistic synthetic data baseline for the following disease focus or medical specialty: "Diabetes".

Provide the mean and standard deviation for the following metrics:
- age
- systolic_bp
- diastolic_bp
- bmi
- blood_glucose
- cholesterol

Also provide a list of 5 valid ICD-10 codes related to this focus.

Respond ONLY with valid JSON in this exact structure:
{
  "age": [mean, std_dev],
  "systolic_bp": [mean, std_dev],
  "diastolic_bp": [mean, std_dev],
  "bmi": [mean, std_dev],
  "blood_glucose": [mean, std_dev],
  "cholesterol": [mean, std_dev],
  "icd10_codes": ["CODE1", "CODE2", "CODE3", "CODE4", "CODE5"]
}
"""
        response = model.generate_content(prompt)
        print("Baseline generation success:")
        print(response.text)
    except Exception as e:
        print(f"Error generating baseline: {e}")

test_note()
test_baseline()
