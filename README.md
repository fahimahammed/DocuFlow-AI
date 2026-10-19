# ⚡ DocuFlow AI — Autonomous Codebase Documentation & Architecture Engine

> **Week 2 Theme: Side Hustle** — Build something with open-source AI at its core that someone would actually pay for.

[![Open Source AI](https://img.shields.io/badge/Open_Source_AI-Core_Engine-brightgreen)](https://github.com)
[![Gemini Ready](https://img.shields.io/badge/Google_Gemini-API_Enabled-blue)](https://ai.google.dev)
[![Air Gapped](https://img.shields.io/badge/Air--Gapped-100%25_Private-purple)](https://ollama.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**DocuFlow AI** is a commercial-grade technical documentation and architecture auditing platform for freelancers, agencies, and engineering teams. It parses codebases locally using open-source AST extractors, synthesizes interactive **Mermaid.js** architecture diagrams and API references, and generates a ready-to-bill **Client Handoff Audit Packet** using either **Google Gemini** or **Local Open-Weight Models (Ollama / Qwen / Llama)**.

---

## 🌟 Key Features

- **🛡️ 100% Air-Gapped Code Privacy**:
  Proprietary source code, database credentials, and internal schemas never leave your machine when using the Local Open-Weights or AST Offline engines.
- **⚡ Google Gemini Integration**:
  Multi-million token context window support (`gemini-2.5-flash`, `gemini-1.5-pro`) for high-speed documentation of large monorepos. Key can be stored safely in browser `localStorage` or `.env`.
- **📊 Interactive Mermaid Architecture Diagrams**:
  Automatically outputs live-rendered Component Flowcharts and Sequence Diagrams.
- **🔌 Automatic AST Route & Symbol Extractor**:
  Parses endpoints (Express, FastAPI, Next.js), exported functions, classes, and dependency graphs with 0 network latency.
- **💼 Side Hustle Deliverable (Client Handoff Packet)**:
  Formats a comprehensive technical audit report with executive summary, tech debt assessment, and API docs, ready to hand off to clients.
- **💻 Dual Interface (Web Dashboard + Terminal CLI)**:
  Full-featured dark-mode web application and a standalone command-line tool.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Start the Web Dashboard
```bash
pnpm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 3. Using the Terminal CLI
Generate documentation directly into your terminal or markdown file:
```bash
# Analyze a sample repository with zero keys (Deterministic AST mode)
pnpm cli server/samples/ecommerce-api --provider heuristic

# Analyze with Google Gemini
pnpm cli /path/to/my-repo --key YOUR_GEMINI_API_KEY --output ARCHITECTURE.md

# Analyze with local Ollama
pnpm cli /path/to/my-repo --provider local --model qwen2.5-coder:7b
```

---

## 📁 Repository Structure

```
week-2/
├── bin/
│   └── repodoc.js            # Standalone terminal CLI runner
├── server/
│   ├── agent/
│   │   ├── parser.js         # AST symbol & dependency graph extractor
│   │   ├── pipeline.js       # Multi-stage documentation agent orchestrator
│   │   ├── prompts.js        # High-density prompts for architecture & APIs
│   │   ├── gemini.js         # Native Google Gemini API client
│   │   ├── local_llm.js      # Ollama & OpenAI-compatible local model client
│   │   └── heuristics.js     # Deterministic fallback engine (0ms / 0 tokens)
│   ├── samples/              # Preloaded sample codebases for 1-click testing
│   │   ├── ecommerce-api/    # Node.js & Express REST microservice
│   │   └── fastapi-ai-service/# Python FastAPI inference service
│   └── index.js              # Express backend & zip upload handler
├── public/
│   ├── index.html            # Dark-mode dashboard with Tailwind & Lucide
│   ├── app.js                # Frontend reactive state & Mermaid renderer
│   └── style.css             # Glassmorphic UI styling & Markdown theme
├── HACKATHON_POST.md         # Official Hackathon Submission post
└── package.json
```

---

## 🔒 Open Innovation Guarantee
DocuFlow AI provides vendor independence. You can run 100% open-weight models locally with Ollama or swap to Google Gemini depending on your project's privacy compliance, internet availability, or budget requirements.

# DocuFlow-AI
