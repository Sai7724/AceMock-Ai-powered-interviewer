# 🚀 AceMock - AI-Powered Interview Coach

AceMock is a high-performance, AI-driven interview preparation platform designed to help tech candidates master the entire recruitment lifecycle. From logic-based aptitude tests to high-stakes coding challenges and behavioral HR rounds, the platform provides real-time, actionable feedback using cutting-edge AI. Built with a premium "Liquid Glass" aesthetic and integrated with Google’s Gemini AI, AceMock simulates the pressure of a real technical interview by implementing focused, "locked-in" sessions. It is the complete tool for anyone looking to bridge the gap between technical knowledge and professional interview performance.

---

## ⚙️ Installation & Setup Guide

To run AceMock locally on your machine, follow these step-by-step instructions.

### 1. Prerequisites
- **Node.js**: Ensure you have version 18.0.0 or higher.
- **Git**: For cloning the repository.
- **API Keys**: You will need a **Google Gemini API Key** and a **Supabase Project** (URL and Anon Key).

### 2. Implementation Steps

#### **A. Clone the Repository**
```bash
git clone https://github.com/Sai7724/AceMock-Ai-powered-interviewer.git
cd AceMock-Ai-powered-interviewer
```

#### **B. Install Dependencies**
Use NPM to install all necessary premium packages and design system components.
```bash
npm install
```

#### **C. Environment Configuration**
Create a `.env.local` file in the root directory and add the following keys. This is required for the AI and database features to work.
```env
# AI Intelligence (Get yours at aistudio.google.com)
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Data & Persistence (Get yours at supabase.com)
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Optional: Code Challenge Execution (OneCompiler)
VITE_ONECOMPILER_API_KEY=YOUR_ONECOMPILER_API_KEY
```

#### **D. Run the Application**
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 💎 Detailed Project Overview

### 🎨 Premium Design System
AceMock is built using a custom **Liquid Glass Design System** which prioritizes a high-end, futuristic look.
- **Color Palette**: Uses deep navy backgrounds and metallic gold accents (#E8C361) for a luxurious, state-of-the-art feel.
- **Visual Effects**: Leverages `backdrop-blur`, glass surfaces, and micro-animations to create a responsive and immersive user experience.
- **Performance**: Optimized for speed, replacing heavy assets with native Tailwind CSS glass layouts.

### 🤖 Intelligent Interview Modules
The platform is divided into five specialized "Stages" that track a typical tech hiring process:
1. **Aptitude & Logic (Stage 1)**: Evaluates mathematical and logical speed with instant scoring.
2. **AI Self-Introduction (Stage 2)**: Features **Speech-to-Text** integration. Gemini AI analyzes your pitch for confidence, communication clarity, and content strength.
3. **Technical Deep-Dive (Stage 3)**: Tailors evaluation to specific stacks (Java, React, Python, etc.), providing conceptual drill-downs.
4. **Coding Round (Stage 4)**: Includes a full-featured code editor with syntax highlighting and a runtime environment for real-world logic verification.
5. **HR Behavioral Round (Stage 5)**: Uses the **S.T.A.R. methodology** (Situation, Task, Action, Result) to evaluate cultural fit and professional leadership.

### 🔒 Professional Lock-in Features
To simulate a real interview's intensity, AceMock enters a "Lock-in" mode:
- **Automatic Fullscreen**: enters focused mode upon interview confirmation.
- **Navigation Guard**: Completely disables and hides the header navigation and logo links once an interview starts.
- **Leave Interview Modal**: A premium confirmation layer that ensures users only exit their high-stakes sessions deliberately.

### 📊 Technical Architecture
- **Frontend**: Vite + React 18 + TypeScript.
- **Database**: Supabase for persistent session tracking and reports.
- **Intelligence**: Google Gemini AI (2.0 Flash) for real-time analysis and feedback generation.

---

## 📄 License & Credits
© 2026 **AceMock Engineering**. Built to empower the next generation of tech talent.
