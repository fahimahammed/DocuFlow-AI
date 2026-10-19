#!/usr/bin/env node

import path from 'node:path';
import fs from 'node:fs';
import { runDocumentationPipeline } from '../server/agent/pipeline.js';

async function main() {
  const args = process.argv.slice(2);
  const targetDir = args[0] || process.cwd();

  let provider = 'heuristic';
  let geminiKey = process.env.GEMINI_API_KEY;
  let model = 'gemini-2.5-flash';
  let outputFile = 'CODEBASE_DOCUMENTATION.md';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--provider') provider = args[++i];
    if (args[i] === '--key') {
      geminiKey = args[++i];
      provider = 'gemini';
    }
    if (args[i] === '--model') model = args[++i];
    if (args[i] === '--output' || args[i] === '-o') outputFile = args[++i];
  }

  if (geminiKey && provider === 'heuristic') {
    provider = 'gemini';
  }

  const resolvedPath = path.resolve(targetDir);
  console.log(`\n======================================================`);
  console.log(`  DocuFlow AI: Autonomous Codebase Documentation CLI`);
  console.log(`======================================================`);
  console.log(`Scanning target: ${resolvedPath}`);
  console.log(`Provider:        ${provider.toUpperCase()}`);

  try {
    const result = await runDocumentationPipeline({
      repoPath: resolvedPath,
      provider,
      geminiApiKey: geminiKey,
      geminiModel: model
    }, (progress) => {
      console.log(`[Stage: ${progress.stage}] ${progress.message}`);
    });

    const outputPath = path.resolve(process.cwd(), outputFile);
    fs.writeFileSync(outputPath, result.fullMarkdown, 'utf8');

    console.log(`\nSuccessfully generated documentation!`);
    console.log(`Saved output to: ${outputPath}`);
    console.log(`Analyzed: ${result.metadata.totalFiles} files, ${result.metadata.totalLines} lines of code.`);
    console.log(`Symbols extracted: ${result.metadata.symbolsCount}`);
  } catch (err) {
    console.error('\nDocumentation generation failed:', err.message);
    process.exit(1);
  }
}

main();

