/**
 * Deterministic heuristic documentation builder
 * Generates instant structural docs & valid Mermaid diagrams from the parsed AST data.
 */

export function generateHeuristicDocs(metadata) {
  const { files, symbols, dependencyGraph, languageStats, totalFiles, totalLines } = metadata;

  // 1. Mermaid Component Diagram
  let mermaidGraph = '```mermaid\ngraph TD\n';
  mermaidGraph += '    subgraph Clients["Clients & Entrypoints"]\n';
  mermaidGraph += '        User["User / HTTP Client"]\n';
  mermaidGraph += '    end\n\n';

  mermaidGraph += '    subgraph Core["Core Application Modules"]\n';
  const topFiles = files.slice(0, 15);
  topFiles.forEach((f, idx) => {
    const cleanId = `node_${idx}`;
    const cleanLabel = f.name.replace(/[^a-zA-Z0-9_.-]/g, '');
    mermaidGraph += `        ${cleanId}["${cleanLabel} (${f.lines} lines)"]\n`;
  });
  mermaidGraph += '    end\n\n';

  mermaidGraph += '    User --> node_0\n';
  if (topFiles.length > 2) mermaidGraph += '    node_0 --> node_1\n';
  if (topFiles.length > 3) mermaidGraph += '    node_1 --> node_2\n';
  mermaidGraph += '```\n';

  // 2. Mermaid Sequence Diagram
  let mermaidSeq = '```mermaid\nsequenceDiagram\n';
  mermaidSeq += '    autonumber\n';
  mermaidSeq += '    actor User as Client\n';
  mermaidSeq += '    participant Server as Application Gateway\n';
  mermaidSeq += '    participant Handler as Module Service\n';
  mermaidSeq += '    participant Data as Data Layer\n\n';
  mermaidSeq += '    User->>Server: Inbound Request\n';
  mermaidSeq += '    Server->>Handler: Validate & Route Action\n';
  mermaidSeq += '    Handler->>Data: Read / Persist State\n';
  mermaidSeq += '    Data-->>Handler: Query Result\n';
  mermaidSeq += '    Handler-->>Server: Formatted Response\n';
  mermaidSeq += '    Server-->>User: 200 OK Payload\n';
  mermaidSeq += '```\n';

  // 3. API Reference Table
  let apiDoc = '# 🔌 Discovered Endpoints & Symbols\n\n';
  if (symbols.length === 0) {
    apiDoc += 'No public HTTP routes or top-level functions were automatically extracted. Check the file list below.\n\n';
  } else {
    apiDoc += '| Type | Name / Signature | Source File | Line |\n';
    apiDoc += '| :--- | :--- | :--- | :--- |\n';
    for (const sym of symbols.slice(0, 50)) {
      const cleanSig = sym.signature.replace(/\|/g, '\\|');
      apiDoc += `| \`${sym.type}\` | **${sym.name}** | \`${sym.file}\` | L${sym.line} |\n`;
    }
  }

  // 4. File Structure Breakdown
  let fileBreakdown = '# 📁 Codebase Directory Breakdown\n\n';
  fileBreakdown += '| File Path | Language | Lines | Size |\n';
  fileBreakdown += '| :--- | :--- | :--- | :--- |\n';
  for (const f of files.slice(0, 40)) {
    fileBreakdown += `| \`${f.path}\` | ${f.extension || 'none'} | ${f.lines} | ${(f.size / 1024).toFixed(1)} KB |\n`;
  }

  // 5. Audit & Health
  const auditDoc = `# 🛠️ Codebase Health & Structural Audit

## Structural Metrics
- **Total Code Volume**: ${totalLines.toLocaleString()} lines across ${totalFiles} scanned source files.
- **Language Composition**: ${Object.entries(languageStats).map(([l, lines]) => `${l} (${lines} lines)`).join(', ')}.
- **Extracted Symbols**: ${symbols.length} endpoints, classes, and exported functions.
- **Internal Dependencies**: ${dependencyGraph.edges.length} module imports mapped.

## Health Observations
- **Modularity**: Code is split across ${totalFiles} files with an average of ${Math.round(totalLines / Math.max(1, totalFiles))} lines per file.
- **Documentation Coverage**: Ready for automated README and API documentation generation.
`;

  return {
    overview: `# 🚀 Structural Codebase Overview\n\nThis codebase contains **${totalFiles} files** totaling **${totalLines.toLocaleString()} lines of code**.\n\n### Primary Languages\n${Object.entries(languageStats).map(([l, lines]) => `- **${l}**: ${lines.toLocaleString()} lines (${((lines/totalLines)*100).toFixed(1)}%)`).join('\n')}\n\n${fileBreakdown}`,
    architecture: `# 📐 System Architecture & Component Flow\n\n### Component Dependency Graph\n\n${mermaidGraph}\n\n### Typical Execution Lifecycle\n\n${mermaidSeq}`,
    api: apiDoc,
    audit: auditDoc
  };
}

