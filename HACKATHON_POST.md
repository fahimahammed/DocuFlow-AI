# Side Hustle Hackathon Submission: DocuFlow AI
**The Autonomous Codebase Documentation & Architecture Engine with Open-Source AI at its Core**

---

## 💡 What We Built: The "Codebase Audit as a Service" Side Hustle
Every software engineer, freelance consultant, and agency knows this nightmare: you sign a new client or join a new project, and they hand you a massive, tangled, 50,000-line legacy repository with zero documentation, no architecture diagrams, and no onboarding guide.

Engineering teams spend **20% to 35% of their working hours** deciphering undocumented code, reverse-engineering API endpoints, and drawing box-and-arrow diagrams on whiteboards.

**DocuFlow AI** turns this painful bottleneck into a lucrative, high-margin side hustle: **Autonomous Technical Auditing & Living Documentation as a Service**.

With DocuFlow AI, a freelancer or agency can ingest any repository (via local path, drag-and-drop ZIP, or CI/CD), parse the complete AST symbol and dependency graph, and synthesize a commercial-grade **Client Handoff Packet**:
1. **Executive Architecture Overview**: High-level system breakdown, design patterns, and tech stack analysis.
2. **Interactive Mermaid.js Architecture & Sequence Diagrams**: Rendered live in-browser or exported as SVG.
3. **API & Interface Specifications**: Every route, controller, parameter, and return signature mapped and cataloged.
4. **Operations & Security Audit**: Identified security vulnerabilities, missing validations, technical debt score, and deployment guides.
5. **Branded Client Handoff Deliverable**: Formatted specifically for freelancers to bill clients \$200–\$500 per audit or sell as a monthly retainer.

---

## 🔓 Why Open Innovation Matters for What We Built

### 1. Air-Gapped Code Privacy: Proprietary IP Never Leaves the Machine
The #1 reason enterprises, defense contractors, and fintech startups refuse to use generic cloud-based AI tools for code documentation is **confidentiality**. Under SOC2, HIPAA, and standard client Non-Disclosure Agreements (NDAs), developers are legally prohibited from copying proprietary source code, internal schemas, and trade secrets into external commercial endpoints.

**DocuFlow AI features a 100% open-source core:**
- **Zero-Network AST Parsing**: Our tokenizer and dependency tree parser runs entirely in-process using open-source regex/AST analyzers.
- **Local Open-Weights Inference**: Connects out-of-the-box to open-weight models (such as `Qwen2.5-Coder:7b/32b`, `DeepSeek-Coder-V2`, and `Llama 3.2`) running locally via Ollama, vLLM, or llama.cpp.
- **Air-Gapped Operation**: On a laptop with Wi-Fi disabled on an airplane or in a high-security lab, DocuFlow AI generates architecture diagrams, file tree maps, and symbol tables with 0 milliseconds of network latency and 0 data leakage.

### 2. Zero Marginal Cost: The Economics of the Side Hustle
Closed-source APIs charge per token. A typical mid-sized monorepo can easily run 500,000 tokens of raw code and context. If you run multiple passes (architecture, API spec, security review, test plans) through proprietary closed models, your inference bill can cost \$5 to \$15 per repository audit!

By basing DocuFlow AI on open-weight models and open agent harnesses:
- **Marginal Cost per Audit**: **\$0.00**.
- **Gross Profit Margin**: **100%**.
- A solo developer charging a flat \$150 fee to audit legacy codebases keeps every single dollar of revenue.

### 3. Dual-Engine Flexibility: The Best of Both Worlds
Open innovation isn't about being locked into a single ideology; it's about **agency and freedom of choice**.
DocuFlow AI provides an open provider architecture:
- **Open-Weight Local Core**: Used when privacy, air-gapped security, or zero-cost batch processing is mandatory.
- **Google Gemini Integration**: Equipped with native Google Gemini (`gemini-2.5-flash` / `gemini-1.5-pro`) for developers who want to harness multi-million token context windows to ingest gargantuan monorepos in a single high-speed pass.
- **Model Agnostic**: Users can swap between Ollama, local OpenAI-compatible endpoints, or Gemini with a single click in the UI.

---

## 🛠️ How It Works: The Multi-Stage Agent Pipeline

```
[ Codebase Source ] (Local Folder / ZIP / Samples)
        │
        ▼
[ Stage 1: Open-Source AST & Graph Parser ]
  ├── File tree walker & language detector
  ├── Function, class, and route tokenizers
  └── Module dependency graph (edges & nodes)
        │
        ▼
[ Stage 2: Dual-Engine Agent Orchestration ]
  ├── Executive Summary & Stack Breakdown
  ├── Mermaid Component & Sequence Synthesizer
  ├── API Reference & Symbol Cataloger
  └── Operations, Environment & Security Auditor
        │
        ▼
[ Stage 3: Interactive Portal & Export Suite ]
  ├── Live Web Dashboard with Dark Mode & Mermaid SVG
  ├── One-click Markdown Bundle (.md)
  ├── AST File Hierarchy & Symbol Registry
  └── 💼 Branded Client Handoff Audit Packet
```

---

## 🚀 Running DocuFlow AI Locally

### Requirements
- Node.js v18+ (tested on Node v24)
- (Optional) Google Gemini API Key for high-speed cloud generation
- (Optional) Ollama running `qwen2.5-coder:7b` for 100% offline local inference

### Quick Start
```bash
# 1. Clone repository & install dependencies
pnpm install

# 2. Start the interactive web dashboard
pnpm start
# Opens on http://localhost:3000

# 3. Or run via the CLI directly on any project
pnpm cli /path/to/target-repo --key YOUR_GEMINI_KEY
# Or offline mode with 0 keys:
pnpm cli /path/to/target-repo --provider heuristic
```

---

## 💰 Monetization Roadmap (The Side Hustle Playbook)

1. **"One-Click Codebase Audit" ($49/report or $199/month)**:
   Self-serve web tier for freelancers and dev agencies taking on new client handoffs.
2. **On-Premise CLI for Enterprises ($499/seat/year)**:
   Air-gapped binary distributed to financial institutions and health-tech teams with strict code governance policies.
3. **GitHub Action / CI/CD Bot**:
   Automatically updates living documentation and architecture diagrams on every merge to `main`.

