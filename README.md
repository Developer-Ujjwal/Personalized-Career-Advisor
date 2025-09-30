# Personalized Career Advisor (Project Synapse)

[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/) 
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/) 
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/) 
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/) 
[![Vertex AI](https://img.shields.io/badge/Vertex%20AI-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)](https://cloud.google.com/vertex-ai) 
[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)](https://cloud.google.com/)

An AI-powered **career and skills advisory platform** designed for Indian students and professionals.  
This project combines **science-backed psychometrics**, **real-time labor market insights**, and **AI-driven mentorship** to provide **personalized career guidance** and **end-to-end skill roadmaps**.  

---

## 🚀 Problem Statement  
Choosing the right career path is often confusing, stressful, and based on incomplete or generic assessments.  
Most existing solutions rely on weakly validated models (e.g., MBTI) or static reports, leaving students without actionable next steps.  

This project addresses the problem with a **transparent, explainable, and holistic career guidance platform**.  

---

## 💡 Solution Overview  
**Project Synapse** is an AI-powered career advisor that:  
- Uses a **hybrid psychometric model** (HEXACO + RIASEC) → culturally validated and evidence-based.  
- Integrates **real-time labor market data** + skills & academic records for **accurate matches**.  
- Provides a **dynamic, interactive dashboard** instead of static career reports.  
- Acts as a **developmental coach** by focusing on growth mindset, skill-building, and anxiety support.  

---

## 🎯 Key Features  

- **Gamified Assessments** → HEXACO & RIASEC tests designed for engagement and accuracy.  
- **Dynamic Dashboard** → Visualizes personality spikes, interest areas, and best-fit careers.  
- **AI Mentor (Gemini API)** → Provides explainable recommendations, empathetic guidance, and Q&A.  
- **Career Demand Insights** → Identifies high-growth, high-demand careers in India.  
- **Personalized Roadmap** → End-to-end guided path with skills to master, pro-tips, checkpoints, and timelines.  
- **Skill-Building Modules** → Micro-learning modules for soft and technical skills.  
- **Psychological Support** → CBT-inspired exercises to handle career anxiety and indecision.  
- **Human-in-the-Loop** → Option to connect with certified counselors.  

---

## 🔑 Unique Value Proposition (USP)  
1. **Scientific Credibility** → Evidence-based psychometrics (HEXACO + RIASEC).  
2. **Granularity** → Goes beyond generic labels; provides **detailed skill roadmaps**.  
3. **Ethical & Transparent** → DPDP-compliant, bias-audited, and explainable AI.  
4. **Holistic Guidance** → Covers **career + skills + mindset** in one place.  

---

## 🛠️ Tech Stack  

- **Frontend**: [Next.js](https://nextjs.org/) → Interactive UI/UX.  
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) → Backend logic & agent orchestration.  
- **AI/LLM**: [Vertex AI](https://cloud.google.com/vertex-ai) → Career Agent & Roadmap Agent.  
- **Database**: [PostgreSQL](https://www.postgresql.org/) → Data persistence.  
- **Data Services**: Custom scraper → Career demand & labor market data.  
- **Deployment**: Docker + Docker Compose + GCP Cloud.  

---

---

## ⚡ Getting Started  

### 1️⃣ Clone the Repository  
```bash
git clone https://github.com/Developer-Ujjwal/Personalized-Career-Advisor.git
cd Personalized-Career-Advisor
Docker compose up -d
