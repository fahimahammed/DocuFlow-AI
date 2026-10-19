import { scanCodebase } from './parser.js';
import { callGemini } from './gemini.js';
import { callLocalLlm } from './local_llm.js';
import { generateHeuristicDocs } from './heuristics.js';
import {
  buildOverviewPrompt,
  buildMermaidPrompt,
  buildApiPrompt,
  buildSetupAndAuditPrompt
} from './prompts.js';

/**
 * Executes the multi-stage documentation agent pipeline
 */
export async function runDocumentationPipeline(options, onProgress = () => {}) {
  const {
    repoPath,
    provider = 'gemini', // 'gemini' | 'local' | 'heuristic'
    geminiApiKey,
    geminiModel = 'gemini-2.5-flash',
    localModel = 'qwen2.5-coder:7b',
    localBaseUrl = 'http://localhost:11434',
    clientName = 'Client Engineering Team'
  } = options;

  // STAGE 1: Codebase Scanning & AST Parsing
  onProgress({ stage: 'scan', message: 'Scanning directory tree and parsing code symbols...' });
  const repoMetadata = scanCodebase(repoPath);

  if (repoMetadata.files.length === 0) {
    throw new Error('No valid source code files found in the specified path.');
  }

  onProgress({
    stage: 'parsed',
    message: `Extracted ${repoMetadata.files.length} files, ${repoMetadata.symbols.length} symbols, ${repoMetadata.totalLines} lines.`,
    metadata: repoMetadata
  });

  const heuristics = generateHeuristicDocs(repoMetadata);

  // If user requested heuristic mode or no keys are configured
  if (provider === 'heuristic' || (!geminiApiKey && provider === 'gemini')) {
    onProgress({ stage: 'complete', message: 'Generated structural documentation using local AST parser.' });
    return packageResults(repoMetadata, heuristics, 'AST Structural Engine (Local)');
  }

  // Model call helper
  async function callModel(prompt, stageName) {
    onProgress({ stage: stageName, message: `Synthesizing ${stageName} with ${provider.toUpperCase()}...` });
    try {
      if (provider === 'gemini') {
        const res = await callGemini(prompt, geminiApiKey, geminiModel);
        return res.text;
      } else if (provider === 'local') {
        const res = await callLocalLlm(prompt, { model: localModel, baseUrl: localBaseUrl });
        return res.text;
      }
    } catch (err) {
      console.warn(`[Pipeline] Stage ${stageName} failed with ${provider}: ${err.message}. Using heuristic fallback.`);
      return null;
    }
    return null;
  }

  // Prepare context
  const fileSummary = repoMetadata.files.slice(0, 30).map(f => `- ${f.path} (${f.lines} lines, ${f.extension})`).join('\n');
  const codeSnippets = repoMetadata.files.slice(0, 8).map(f => `--- FILE: ${f.path} ---\n${f.content.slice(0, 2500)}`).join('\n\n');
  const configFiles = repoMetadata.files
    .filter(f => ['package.json', 'requirements.txt', 'Dockerfile', 'docker-compose.yml', 'tsconfig.json', '.env.example'].includes(f.name))
    .map(f => `--- ${f.name} ---\n${f.content}`)
    .join('\n\n') || 'Standard repository configuration';

  // STAGE 2: Executive Overview & Architecture
  const overviewPrompt = buildOverviewPrompt(repoMetadata, fileSummary, codeSnippets);
  const overviewRes = await callModel(overviewPrompt, 'architecture');
  const finalOverview = overviewRes || heuristics.overview;

  // STAGE 3: Mermaid Visual Architecture Diagrams
  const mermaidPrompt = buildMermaidPrompt(repoMetadata, repoMetadata.symbols, repoMetadata.dependencyGraph.edges);
  const mermaidRes = await callModel(mermaidPrompt, 'diagrams');
  const finalArchitecture = mermaidRes || heuristics.architecture;

  // STAGE 4: API & Function Reference
  const apiPrompt = buildApiPrompt(repoMetadata.symbols, codeSnippets);
  const apiRes = await callModel(apiPrompt, 'api-reference');
  const finalApi = apiRes || heuristics.api;

  // STAGE 5: Operations, Setup & Client Audit
  const auditPrompt = buildSetupAndAuditPrompt(repoMetadata, configFiles);
  const auditRes = await callModel(auditPrompt, 'security-audit');
  const finalAudit = auditRes || heuristics.audit;

  const usedProvider = provider === 'gemini' ? `Google Gemini (${geminiModel})` : `Local Open-Weights (${localModel})`;
  onProgress({ stage: 'done', message: 'Documentation generation complete!' });

  return packageResults(repoMetadata, {
    overview: finalOverview,
    architecture: finalArchitecture,
    api: finalApi,
    audit: finalAudit
  }, usedProvider, clientName);
}

function packageResults(metadata, sections, engineUsed, clientName = 'Client Handoff') {
  // Build a Client Handoff Packet
  const dateStr = new Date().toISOString().split('T')[0];
  const clientAuditPacket = `# 📋 TECHNICAL AUDIT & ARCHITECTURE HANDOFF PACKET
**Prepared for:** ${clientName}  
**Date Generated:** ${dateStr}  
**Auditing Engine:** ${engineUsed}  
**Repository Scope:** ${metadata.totalFiles} files | ${metadata.totalLines.toLocaleString()} LOC | ${metadata.symbols.length} Extracted Symbols

---

## Executive Summary
This comprehensive architectural audit was synthesized using an autonomous codebase analysis engine. It provides a full structural evaluation, component dependency graphs, API specifications, and identified technical debt for immediate onboarding.

${sections.overview}

---

${sections.architecture}

---

${sections.api}

---

${sections.audit}
`;

  const fullMarkdown = `${sections.overview}\n\n---\n\n${sections.architecture}\n\n---\n\n${sections.api}\n\n---\n\n${sections.audit}`;

  return {
    metadata: {
      totalFiles: metadata.totalFiles,
      totalLines: metadata.totalLines,
      languageStats: metadata.languageStats,
      dirStructure: metadata.dirStructure,
      symbolsCount: metadata.symbols.length,
      engineUsed
    },
    sections: {
      overview: sections.overview,
      architecture: sections.architecture,
      api: sections.api,
      audit: sections.audit,
      clientAuditPacket
    },
    fullMarkdown,
    symbols: metadata.symbols,
    dependencyGraph: metadata.dependencyGraph
  };
}

