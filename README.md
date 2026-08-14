<div align="center">
  
  # MirrorMed Enterprise Platform
  **Advanced Synthetic Medical Data Generation & Analytics Platform**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](#)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)](#)
  [![Gemini 1.5](https://img.shields.io/badge/Gemini_AI-1.5_Flash-4285F4?style=for-the-badge&logo=google)](#)
  [![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](#)
</div>

<br />

MirrorMed is an enterprise-grade synthetic medical data generation platform designed to accelerate healthcare research, software testing, and medical data analysis. Powered by Google's Gemini AI, MirrorMed instantly synthesizes realistic patient cohorts, generates clinically accurate SOAP notes, and provisions mock doctor directories—all wrapped in a stunning, high-performance dashboard.

## 🚀 Key Features

- **Synthetic Cohort Generation**: Generate massive, realistic patient datasets customized by specialty (e.g., Cardiology, Oncology, General Practice) in seconds.
- **Clinical Notes AI**: Automatically synthesize highly realistic SOAP (Subjective, Objective, Assessment, and Plan) notes for any patient using Google's Gemini models.
- **Doctor Directory Provisioning**: Rapidly generate comprehensive directories of medical professionals based on specialized fields.
- **Dashboard Analytics**: A rich, dynamic UI featuring data fidelity charts, cohort distribution, and patient statistics.
- **Smart Fallback Mechanism**: The AI engine automatically cycles through available Google GenAI models (Flash → Pro) to ensure zero downtime and optimal low-latency generation.
- **SPA Persistence**: Zero data-loss on refresh with seamless session state management.

## 🛠️ Technology Stack

**Frontend:**
- [Next.js](https://nextjs.org/) (App Router)
- React 18
- Tailwind CSS (Custom Design System)
- Lucide Icons
- Recharts (for data visualization)

**Backend:**
- Python 3
- [FastAPI](https://fastapi.tiangolo.com/)
- `google-genai` (Google's latest Generative AI SDK)
- Uvicorn (ASGI server)

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- A Google Gemini API Key

### 1. Clone the repository
```bash
git clone https://github.com/Aryanthakur-08/MirrorMed.git
cd MirrorMed
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows: .\venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

## 🚀 Running the Platform

We have provided a unified script to start both the backend and frontend simultaneously.

On Windows:
```bash
.\run.bat
```
*This will spin up the FastAPI server on `localhost:8000` and the Next.js frontend on `localhost:3000`.*

## 📸 Overview

MirrorMed provides a suite of highly-integrated tools:
1. **Patient Explorer**: A comprehensive tabular view of synthetic patient data with demographic and vital distributions.
2. **Dashboard Analytics**: Top-level visual overviews combining both doctor and patient metrics into actionable insights.
3. **Data Accuracy**: Charts mapping the fidelity and confidence scores of the AI-generated medical histories.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 

## 📄 License

This project is licensed under the MIT License.
