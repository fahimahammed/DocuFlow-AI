import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import AdmZip from 'adm-zip';

import { scanCodebase } from './agent/parser.js';
import { runDocumentationPipeline } from './agent/pipeline.js';
import { checkLocalLlmStatus } from './agent/local_llm.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(rootDir, 'public')));

// Configure Multer for zip uploads
const uploadDir = path.join(os.tmpdir(), 'repodoc-uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ dest: uploadDir });

const SAMPLES = [
  {
    id: 'ecommerce-api',
    name: 'Nexus E-Commerce Gateway',
    description: 'Node.js & Express REST microservice with auth, product catalog, orders, and payment flow.',
    path: path.join(__dirname, 'samples', 'ecommerce-api'),
    language: 'JavaScript / Node.js'
  },
  {
    id: 'fastapi-ai-service',
    name: 'OmniSense AI Inference Microservice',
    description: 'Python FastAPI vector search service with Pydantic validation and embeddings.',
    path: path.join(__dirname, 'samples', 'fastapi-ai-service'),
    language: 'Python / FastAPI'
  },
  {
    id: 'self-repodoc',
    name: 'DocuFlow AI (This Repository)',
    description: 'The complete codebase of this documentation engine itself, demonstrating self-analysis.',
    path: rootDir,
    language: 'JavaScript / Fullstack'
  }
];

// 1. System Status & Local Model Discovery
app.get('/api/status', async (req, res) => {
  const localLlm = await checkLocalLlmStatus(process.env.LOCAL_LLM_URL || 'http://localhost:11434');
  res.json({
    hasEnvGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0),
    localLlm,
    nodeVersion: process.version,
    os: `${os.type()} ${os.arch()}`
  });
});

// 2. Pre-packaged Samples
app.get('/api/samples', (req, res) => {
  res.json({ samples: SAMPLES });
});

// 3. Quick AST Scan (Instant preview without LLM)
app.post('/api/scan', (req, res) => {
  try {
    let { targetPath, sampleId } = req.body;

    if (sampleId) {
      const found = SAMPLES.find(s => s.id === sampleId);
      if (!found) return res.status(404).json({ error: 'Sample not found' });
      targetPath = found.path;
    }

    if (!targetPath || !fs.existsSync(targetPath)) {
      return res.status(400).json({ error: 'Valid repository path is required.' });
    }

    const metadata = scanCodebase(targetPath);
    res.json({ success: true, metadata });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Run Full Agent Documentation Pipeline
app.post('/api/generate', async (req, res) => {
  try {
    let {
      targetPath,
      sampleId,
      provider = 'gemini',
      geminiApiKey = process.env.GEMINI_API_KEY,
      geminiModel = 'gemini-2.5-flash',
      localModel = 'qwen2.5-coder:7b',
      localBaseUrl = 'http://localhost:11434',
      clientName = 'Client Engineering Team'
    } = req.body;

    if (sampleId) {
      const found = SAMPLES.find(s => s.id === sampleId);
      if (found) targetPath = found.path;
    }

    if (!targetPath || !fs.existsSync(targetPath)) {
      return res.status(400).json({ error: 'Repository path not found on server.' });
    }

    console.log(`[Repodoc] Generating docs for: ${targetPath} using ${provider}`);

    const result = await runDocumentationPipeline({
      repoPath: targetPath,
      provider,
      geminiApiKey,
      geminiModel,
      localModel,
      localBaseUrl,
      clientName
    });

    res.json({ success: true, result });
  } catch (err) {
    console.error('[Repodoc] Generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Upload Codebase ZIP
app.post('/api/upload-zip', upload.single('repoZip'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No zip file provided.' });
    }

    const targetExtractDir = path.join(uploadDir, `extracted-${Date.now()}`);
    fs.mkdirSync(targetExtractDir, { recursive: true });

    const zip = new AdmZip(req.file.path);
    zip.extractAllTo(targetExtractDir, true);

    // Remove uploaded temporary zip
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      extractedPath: targetExtractDir,
      message: 'Codebase uploaded and extracted successfully.'
    });
  } catch (err) {
    res.status(500).json({ error: `Failed to extract zip: ${err.message}` });
  }
});

// Catch-all route to serve SPA
app.use((req, res) => {
  res.sendFile(path.join(rootDir, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`  DocuFlow AI Server listening on http://localhost:${PORT}`);
  console.log(`  Open source AI Core & Gemini Codebase Architect`);
  console.log(`=================================================\n`);
});
