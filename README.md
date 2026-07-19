# 🏛️ Civic AI Complaint Agent

### 💡 Civic AI in a Nutshell
Instead of a basic web form that just dumps data into a static database, Civic AI acts as an automated, intelligent city triage system. It takes messy, unstructured public complaints from citizens and runs them through a stateful AI pipeline to automatically filter out malicious inputs, route the issue to the correct city department, dynamically escalate the priority if there is matching severe weather, and draft a formal municipal report.

A production-ready, stateful AI agent built with **LangGraph.js** and **Groq** designed to process, classify, and escalate public civic complaints automatically. This application uses a state graph architecture to validate input security, route complaints to the correct municipal departments, and dynamically escalate priorities based on real-time environmental contexts.

## 🚀 Core Architecture & Features

The backend runs on a robust serverless framework powered by **LangGraph.js** and leverages the `llama-3.3-70b-versatile` model via Groq for ultra-fast, intelligent state mutations.

* **🛡️ Security Guardrail Node:** Scans user submissions instantly to block prompt injection attacks and malicious inputs before they touch downstream tasks.
* **🤖 Automated Classification Node:** Extracts categories and maps the incoming issue to the exact target city department.
* **⛈️ Environmental Priority Enricher:** Automatically scales the issue priority to **"Critical"** if public infrastructure failures or waste hazards overlap with severe weather conditions.
* **📄 Document Generation Node:** Compiles the complete accumulated graph state into a structured, formal professional submission letter ready for municipal review.

## 🛠️ Tech Stack

* **Frontend:** React, Vite, TailwindCSS
* **Orchestration:** LangGraph.js (`@langchain/langgraph`)
* **LLM Provider:** Groq Cloud (`@langchain/groq`) using Llama 3.3 70B
* **Linter:** Oxlint

---

## 💻 Local Setup Instructions

### 1. Clone & Install Dependencies
```bash
git clone [https://github.com/bright-phoenix-dev/Civic-AI.git](https://github.com/bright-phoenix-dev/Civic-AI.git)
cd Civic-AI
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory and add your API key securely (do not use quotes):
```env
GROQ_API_KEY=your_gsk_key_here
```

### 3. Run the Development Server
```bash
npm run dev
```

---

## 📊 Graph Workflow Flowchart

```
[User Input] 
     │
     ▼
┌─────────────────────────┐
│  security_guardrail     │───(Unsafe Input)───► [Security Warning JSON]
└─────────────────────────┘
     │ (Safe Input)
     ▼
┌─────────────────────────┐
│  complaint_classifier   │ ──► (Assigns Department & Category)
└─────────────────────────┘
     │
     ▼
┌─────────────────────────┐
│  environmental_enricher │ ──► (Escalates priority to Critical if weather drops)
└─────────────────────────┘
     │
     ▼
┌─────────────────────────┐
│   document_generator    │ ──► (Compiles Formal PDF/Text Document)
└─────────────────────────┘
     │
     ▼
 [Live Frontend Dashboard]
```
