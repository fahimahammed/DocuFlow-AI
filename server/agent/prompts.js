export function buildOverviewPrompt(repoMetadata, fileList, sampleCodeSnippets) {
  return `You are an elite Staff Software Architect and Technical Writer.
Your task is to analyze this codebase and generate an authoritative, crystal-clear Executive Summary and Architecture Overview.

CODEBASE METRICS:
- Total Files: ${repoMetadata.totalFiles}
- Total Lines: ${repoMetadata.totalLines}
- Languages: ${JSON.stringify(repoMetadata.languageStats)}
- Key Files Scanned:
${fileList}

SAMPLE KEY CODE SNIPPETS & CONFIG:
${sampleCodeSnippets}

Generate a comprehensive Markdown document with the following sections:
# 🚀 Project Overview & Architecture Guide

## 1. Executive Summary
- **Purpose**: What does this application do? Who is it built for?
- **Core Value Proposition**: Key business problems solved.
- **Tech Stack Table**: Breakdown of runtime, framework, database, state management, build tools, and third-party dependencies.

## 2. System Architecture & Patterns
- **Architectural Paradigm**: (e.g. Hexagonal, Clean Architecture, MVC, Modular Monolith, Microservices).
- **Core Design Patterns**: (e.g. Repository pattern, Observer, Dependency Injection, Middleware pipeline).
- **State & Data Lifecycle**: How state flows from ingestion to persistence.

## 3. Directory Structure & Key Components
Explain the role of each primary directory and critical entry point.

Return clean, high-density Markdown with zero fluff.`;
}

export function buildMermaidPrompt(repoMetadata, symbols, dependencies) {
  return `You are a Principal Solutions Architect.
Generate accurate, valid Mermaid.js diagrams visualizing this codebase.

CODEBASE METADATA:
- Total Files: ${repoMetadata.totalFiles}
- Extracted Endpoints/Symbols: ${JSON.stringify(symbols.slice(0, 40))}
- Dependency Connections: ${JSON.stringify(dependencies.slice(0, 30))}

REQUIREMENTS:
1. Generate a **Component Architecture Diagram** using \`\`\`mermaid graph TD ... \`\`\`.
   - Show User/Client -> Entrypoint/Router -> Controllers/Services -> Data Layer/External APIs.
2. Generate a **Sequence / Data Flow Diagram** using \`\`\`mermaid sequenceDiagram ... \`\`\` showing a standard end-to-end request lifecycle.

CRITICAL MERMAID SYNTAX RULES:
- Only use supported syntax (graph TD or sequenceDiagram).
- Use alphanumeric node IDs and double-quote node labels, e.g. client["Client Web App"] --> api["API Gateway"].
- Do NOT use HTML or special characters inside node IDs.

Format your output in clean Markdown with explanation for each diagram.`;
}

export function buildApiPrompt(symbols, sampleFiles) {
  return `You are an API Architect and Technical Writer.
Your task is to generate a comprehensive API & Interface Reference Guide based on the extracted codebase symbols and code.

EXTRACTED SYMBOLS & ROUTES:
${JSON.stringify(symbols, null, 2)}

SAMPLE RELEVANT CODE:
${sampleFiles}

Generate a detailed API reference guide in Markdown:
# 🔌 API & Module Reference

For each endpoint or key exported module:
- **Route / Function Name**
- **HTTP Method & Path** (if applicable) or Function Signature
- **Input Parameters / Request Body**
- **Return Type / Expected Response**
- **Authentication / Permissions**
- **Code Example (cURL or JavaScript/Python)**

If this is a library or client application, document the public exports, hooks, classes, and helper utilities.`;
}

export function buildSetupAndAuditPrompt(repoMetadata, configs) {
  return `You are a Devops & Security Engineer.
Analyze the configuration files and codebase structure to provide:
1. **Setup & Deployment Guide**
2. **Code Health, Tech Debt & Security Audit** (High value for client handoff audits!)

PROJECT CONFIGURATIONS DETECTED:
${configs}

Generate Markdown with:
# 🛠️ Setup, Operations & Security Audit

## 1. Getting Started & Local Development
- Prerequisites (Node, Python, Docker, DBs, etc.)
- Environment Variables (.env specifications with descriptions)
- Installation commands
- Running locally & running tests

## 2. Production Deployment
- Build steps
- Recommended hosting / containerization instructions

## 3. Code Health & Architectural Audit
- **Identified Strengths**: What is well-architected?
- **Technical Debt & Bottlenecks**: Missing validation, performance traps, unhandled edge cases.
- **Security Assessment**: Potential vulnerabilities (CORS, injection risks, hardcoded secrets, authentication gaps).
- **Actionable Recommendations**: Prioritized checklist for the engineering team.`;
}

