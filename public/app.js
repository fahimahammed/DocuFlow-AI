// State
const state = {
  activeTab: 'sample', // 'sample' | 'path' | 'upload'
  selectedSampleId: 'ecommerce-api',
  customPath: '',
  uploadedPath: '',
  currentSection: 'overview',
  provider: 'gemini',
  geminiApiKey: localStorage.getItem('repodoc_gemini_key') || '',
  geminiModel: 'gemini-2.5-flash',
  localUrl: localStorage.getItem('repodoc_local_url') || 'http://localhost:11434',
  localModel: 'qwen2.5-coder:7b',
  clientName: 'Client Engineering & Product Team',
  samples: [],
  currentResult: null,
  isGenerating: false
};

// DOM Elements
const elements = {
  statusIndicator: document.getElementById('statusIndicator'),
  statusDot: document.getElementById('statusDot'),
  statusText: document.getElementById('statusText'),
  openSettingsBtn: document.getElementById('openSettingsBtn'),
  settingsModal: document.getElementById('settingsModal'),
  closeSettingsBtn: document.getElementById('closeSettingsBtn'),
  saveSettingsBtn: document.getElementById('saveSettingsBtn'),
  modalGeminiKey: document.getElementById('modalGeminiKey'),
  modalLocalUrl: document.getElementById('modalLocalUrl'),
  geminiApiKeyInput: document.getElementById('geminiApiKeyInput'),
  geminiModelSelect: document.getElementById('geminiModelSelect'),
  toggleKeyVisibility: document.getElementById('toggleKeyVisibility'),
  localUrlInput: document.getElementById('localUrlInput'),
  localModelInput: document.getElementById('localModelInput'),
  ollamaBadge: document.getElementById('ollamaBadge'),
  clientNameInput: document.getElementById('clientNameInput'),
  geminiConfigBox: document.getElementById('geminiConfigBox'),
  localConfigBox: document.getElementById('localConfigBox'),

  // Source selection tabs
  tabSample: document.getElementById('tabSample'),
  tabPath: document.getElementById('tabPath'),
  tabUpload: document.getElementById('tabUpload'),
  panelSample: document.getElementById('panelSample'),
  panelPath: document.getElementById('panelPath'),
  panelUpload: document.getElementById('panelUpload'),
  samplesList: document.getElementById('samplesList'),
  localPathInput: document.getElementById('localPathInput'),
  scanPathBtn: document.getElementById('scanPathBtn'),
  dropZone: document.getElementById('dropZone'),
  zipFileInput: document.getElementById('zipFileInput'),
  uploadStatus: document.getElementById('uploadStatus'),

  // Action buttons
  generateDocsBtn: document.getElementById('generateDocsBtn'),
  quickAstBtn: document.getElementById('quickAstBtn'),
  quickStartBtn: document.getElementById('quickStartBtn'),
  copyMdBtn: document.getElementById('copyMdBtn'),
  downloadBundleBtn: document.getElementById('downloadBundleBtn'),
  printBtn: document.getElementById('printBtn'),

  // Stats
  targetBadge: document.getElementById('targetBadge'),
  targetSummary: document.getElementById('targetSummary'),
  statFiles: document.getElementById('statFiles'),
  statLines: document.getElementById('statLines'),
  statSymbols: document.getElementById('statSymbols'),
  statEngine: document.getElementById('statEngine'),

  // Progress
  progressContainer: document.getElementById('progressContainer'),
  progressMessage: document.getElementById('progressMessage'),
  progressBar: document.getElementById('progressBar'),
  progressPercent: document.getElementById('progressPercent'),

  // Viewer
  docContent: document.getElementById('docContent'),
  astExplorerView: document.getElementById('astExplorerView'),
  fileTreeContainer: document.getElementById('fileTreeContainer'),
  symbolsContainer: document.getElementById('symbolsContainer')
};

// Initialize App
async function init() {
  lucide.createIcons();
  
  if (state.geminiApiKey) {
    elements.geminiApiKeyInput.value = state.geminiApiKey;
    elements.modalGeminiKey.value = state.geminiApiKey;
  }
  elements.localUrlInput.value = state.localUrl;
  elements.modalLocalUrl.value = state.localUrl;

  bindEvents();
  await checkServerStatus();
  await loadSamples();
}

// Bind UI Events
function bindEvents() {
  // Source tabs
  elements.tabSample.addEventListener('click', () => switchSourceTab('sample'));
  elements.tabPath.addEventListener('click', () => switchSourceTab('path'));
  elements.tabUpload.addEventListener('click', () => switchSourceTab('upload'));

  // Document section tabs
  document.querySelectorAll('.doc-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const section = tab.dataset.section;
      switchDocSection(section, tab);
    });
  });

  // Engine radios
  document.querySelectorAll('input[name="engineProvider"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.provider = e.target.value;
      updateEngineUI();
    });
  });

  // Settings Modal
  elements.openSettingsBtn.addEventListener('click', () => {
    elements.modalGeminiKey.value = state.geminiApiKey;
    elements.modalLocalUrl.value = state.localUrl;
    elements.settingsModal.classList.remove('hidden');
  });

  elements.closeSettingsBtn.addEventListener('click', () => {
    elements.settingsModal.classList.add('hidden');
  });

  elements.saveSettingsBtn.addEventListener('click', () => {
    state.geminiApiKey = elements.modalGeminiKey.value.trim();
    state.localUrl = elements.modalLocalUrl.value.trim();
    localStorage.setItem('repodoc_gemini_key', state.geminiApiKey);
    localStorage.setItem('repodoc_local_url', state.localUrl);
    elements.geminiApiKeyInput.value = state.geminiApiKey;
    elements.localUrlInput.value = state.localUrl;
    elements.settingsModal.classList.add('hidden');
    checkServerStatus();
  });

  // Input bindings
  elements.geminiApiKeyInput.addEventListener('input', (e) => {
    state.geminiApiKey = e.target.value.trim();
    localStorage.setItem('repodoc_gemini_key', state.geminiApiKey);
  });

  elements.toggleKeyVisibility.addEventListener('click', () => {
    const isPass = elements.geminiApiKeyInput.type === 'password';
    elements.geminiApiKeyInput.type = isPass ? 'text' : 'password';
  });

  elements.geminiModelSelect.addEventListener('change', (e) => {
    state.geminiModel = e.target.value;
  });

  elements.clientNameInput.addEventListener('input', (e) => {
    state.clientName = e.target.value;
  });

  // Action buttons
  elements.quickAstBtn.addEventListener('click', () => runAstInspection());
  elements.generateDocsBtn.addEventListener('click', () => runFullGeneration());
  if (elements.quickStartBtn) {
    elements.quickStartBtn.addEventListener('click', () => runFullGeneration());
  }

  elements.scanPathBtn.addEventListener('click', () => {
    state.customPath = elements.localPathInput.value.trim();
    if (!state.customPath) return alert('Please enter a directory path');
    runAstInspection();
  });

  // ZIP upload
  elements.dropZone.addEventListener('click', () => elements.zipFileInput.click());
  elements.zipFileInput.addEventListener('change', handleZipUpload);

  // Export buttons
  elements.copyMdBtn.addEventListener('click', copyMarkdown);
  elements.downloadBundleBtn.addEventListener('click', downloadBundle);
  elements.printBtn.addEventListener('click', () => window.print());
}

function switchSourceTab(tab) {
  state.activeTab = tab;
  [elements.tabSample, elements.tabPath, elements.tabUpload].forEach(b => b.classList.remove('active-tab', 'text-slate-200'));
  [elements.panelSample, elements.panelPath, elements.panelUpload].forEach(p => p.classList.add('hidden'));

  if (tab === 'sample') {
    elements.tabSample.classList.add('active-tab');
    elements.panelSample.classList.remove('hidden');
    elements.targetBadge.textContent = 'Sample';
  } else if (tab === 'path') {
    elements.tabPath.classList.add('active-tab');
    elements.panelPath.classList.remove('hidden');
    elements.targetBadge.textContent = 'Local Path';
  } else if (tab === 'upload') {
    elements.tabUpload.classList.add('active-tab');
    elements.panelUpload.classList.remove('hidden');
    elements.targetBadge.textContent = 'Uploaded ZIP';
  }
}

function updateEngineUI() {
  if (state.provider === 'gemini') {
    elements.geminiConfigBox.classList.remove('hidden');
    elements.localConfigBox.classList.add('hidden');
    elements.statEngine.textContent = 'Gemini';
  } else if (state.provider === 'local') {
    elements.geminiConfigBox.classList.add('hidden');
    elements.localConfigBox.classList.remove('hidden');
    elements.statEngine.textContent = 'Local LLM';
  } else {
    elements.geminiConfigBox.classList.add('hidden');
    elements.localConfigBox.classList.add('hidden');
    elements.statEngine.textContent = 'AST (Offline)';
  }
}

async function checkServerStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    
    if (data.hasEnvGeminiKey && !state.geminiApiKey) {
      elements.statusDot.className = 'w-2 h-2 rounded-full bg-emerald-400';
      elements.statusText.textContent = 'Gemini Ready (from .env)';
    } else if (state.geminiApiKey) {
      elements.statusDot.className = 'w-2 h-2 rounded-full bg-emerald-400';
      elements.statusText.textContent = 'Gemini Ready';
    } else if (data.localLlm?.online) {
      elements.statusDot.className = 'w-2 h-2 rounded-full bg-indigo-400';
      elements.statusText.textContent = `Ollama (${data.localLlm.models.length} models)`;
      elements.ollamaBadge.textContent = 'Online';
      elements.ollamaBadge.className = 'text-[10px] text-emerald-400 font-medium';
    } else {
      elements.statusDot.className = 'w-2 h-2 rounded-full bg-amber-400';
      elements.statusText.textContent = 'AST Ready (Enter API Key)';
    }
  } catch (e) {
    elements.statusDot.className = 'w-2 h-2 rounded-full bg-rose-500';
    elements.statusText.textContent = 'Backend Offline';
  }
}

async function loadSamples() {
  try {
    const res = await fetch('/api/samples');
    const data = await res.json();
    state.samples = data.samples;

    elements.samplesList.innerHTML = '';
    state.samples.forEach((sample, idx) => {
      const isSelected = sample.id === state.selectedSampleId;
      const card = document.createElement('div');
      card.className = `p-3 rounded-xl border text-xs cursor-pointer transition ${
        isSelected
          ? 'border-brand-500/80 bg-brand-500/10 text-white shadow-sm ring-1 ring-brand-500/30'
          : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 text-slate-300'
      }`;
      card.innerHTML = `
        <div class="flex items-center justify-between font-semibold">
          <span>${sample.name}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">${sample.language}</span>
        </div>
        <p class="text-[11px] text-slate-400 mt-1 line-clamp-2">${sample.description}</p>
      `;

      card.addEventListener('click', () => {
        state.selectedSampleId = sample.id;
        elements.targetSummary.textContent = sample.name;
        loadSamples(); // refresh UI selection
      });

      elements.samplesList.appendChild(card);
    });

    const activeSample = state.samples.find(s => s.id === state.selectedSampleId);
    if (activeSample) {
      elements.targetSummary.textContent = activeSample.name;
    }
  } catch (e) {
    console.error('Failed to load samples', e);
  }
}

async function handleZipUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('repoZip', file);

  elements.uploadStatus.classList.remove('hidden');
  elements.uploadStatus.textContent = 'Uploading and extracting zip...';

  try {
    const res = await fetch('/api/upload-zip', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
      state.uploadedPath = data.extractedPath;
      elements.uploadStatus.textContent = `Extracted! Ready to analyze (${file.name})`;
      elements.targetSummary.textContent = file.name;
      runAstInspection();
    } else {
      elements.uploadStatus.textContent = `Upload failed: ${data.error}`;
    }
  } catch (err) {
    elements.uploadStatus.textContent = `Error: ${err.message}`;
  }
}

// Quick AST Inspection (0 Tokens)
async function runAstInspection() {
  const payload = getPayload();
  setGenerating(true, 'Extracting codebase AST and building symbol graph...');

  try {
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    const metadata = data.metadata;
    updateStats(metadata);

    // Generate heuristics for display
    const resDocs = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, provider: 'heuristic' })
    });
    const docData = await resDocs.json();
    if (docData.success) {
      state.currentResult = docData.result;
      renderCurrentSection();
      renderAstExplorer(metadata);
    }
  } catch (err) {
    alert(`AST scan failed: ${err.message}`);
  } finally {
    setGenerating(false);
  }
}

// Full Generation with Gemini or Local LLM
async function runFullGeneration() {
  const payload = getPayload();

  if (state.provider === 'gemini' && !state.geminiApiKey) {
    // Prompt user to enter their API key
    elements.settingsModal.classList.remove('hidden');
    elements.modalGeminiKey.focus();
    alert('Please enter your Google Gemini API key to run AI synthesis.');
    return;
  }

  setGenerating(true, 'Starting autonomous multi-stage documentation agent...');
  animateProgressBar();

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        provider: state.provider,
        geminiApiKey: state.geminiApiKey,
        geminiModel: state.geminiModel,
        localModel: elements.localModelInput.value.trim(),
        localBaseUrl: elements.localUrlInput.value.trim(),
        clientName: state.clientName
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    state.currentResult = data.result;
    updateStats(data.result.metadata);
    renderCurrentSection();
    renderAstExplorer(data.result);
  } catch (err) {
    alert(`Generation failed: ${err.message}`);
  } finally {
    setGenerating(false);
  }
}

function getPayload() {
  if (state.activeTab === 'sample') {
    return { sampleId: state.selectedSampleId };
  } else if (state.activeTab === 'path') {
    return { targetPath: elements.localPathInput.value.trim() };
  } else if (state.activeTab === 'upload') {
    return { targetPath: state.uploadedPath };
  }
  return { sampleId: 'ecommerce-api' };
}

function updateStats(metadata) {
  elements.statFiles.textContent = metadata.totalFiles;
  elements.statLines.textContent = metadata.totalLines.toLocaleString();
  elements.statSymbols.textContent = metadata.symbolsCount || (metadata.symbols ? metadata.symbols.length : 0);
  elements.statEngine.textContent = metadata.engineUsed || state.provider.toUpperCase();
}

function switchDocSection(section, tabEl) {
  state.currentSection = section;
  document.querySelectorAll('.doc-tab').forEach(t => t.classList.remove('active-doc-tab', 'text-amber-400', 'text-slate-200'));
  if (tabEl) tabEl.classList.add('active-doc-tab');

  if (section === 'explorer') {
    elements.docContent.classList.add('hidden');
    elements.astExplorerView.classList.remove('hidden');
  } else {
    elements.docContent.classList.remove('hidden');
    elements.astExplorerView.classList.add('hidden');
    renderCurrentSection();
  }
}

// Render markdown and Mermaid diagrams
async function renderCurrentSection() {
  if (!state.currentResult) return;

  const sectionMarkdown = state.currentResult.sections[state.currentSection] || state.currentResult.fullMarkdown;
  
  // Render markdown to HTML
  const rawHtml = marked.parse(sectionMarkdown);
  elements.docContent.innerHTML = rawHtml;

  // Find all mermaid code blocks and render them
  await renderMermaidDiagrams();

  // Highlight code snippets
  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block);
  });
}

async function renderMermaidDiagrams() {
  const codeBlocks = elements.docContent.querySelectorAll('code.language-mermaid, pre code');
  let diagramCount = 0;

  for (const block of codeBlocks) {
    const isMermaid = block.classList.contains('language-mermaid') || block.textContent.trim().startsWith('graph ') || block.textContent.trim().startsWith('sequenceDiagram');
    if (!isMermaid) continue;

    const code = block.textContent;
    const parentPre = block.closest('pre') || block;
    const container = document.createElement('div');
    container.className = 'mermaid-wrapper';
    
    const uniqueId = `mermaid-svg-${Date.now()}-${diagramCount++}`;

    try {
      const { svg } = await mermaid.render(uniqueId, code);
      container.innerHTML = svg;
      parentPre.replaceWith(container);
    } catch (err) {
      console.warn('Mermaid render error:', err);
      // fallback to clean code block
      parentPre.innerHTML = `<div class="text-xs text-amber-400 p-2 font-mono border border-amber-500/30 rounded bg-slate-900">[Architecture Diagram: Code graph rendered in AST Explorer]</div>`;
    }
  }
}

function renderAstExplorer(metadata) {
  // 1. File Tree
  if (metadata.dirStructure) {
    elements.fileTreeContainer.innerHTML = '';
    renderTreeNode(metadata.dirStructure, elements.fileTreeContainer, 0);
  }

  // 2. Extracted Symbols
  if (metadata.symbols) {
    elements.symbolsContainer.innerHTML = '';
    if (metadata.symbols.length === 0) {
      elements.symbolsContainer.innerHTML = '<div class="text-slate-500 text-xs">No exported symbols found.</div>';
    } else {
      metadata.symbols.slice(0, 30).forEach(sym => {
        const item = document.createElement('div');
        item.className = 'p-2 rounded bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs';
        item.innerHTML = `
          <div>
            <span class="text-cyan-400 font-semibold">${sym.name}</span>
            <span class="text-slate-500 text-[10px] ml-1">(${sym.file})</span>
          </div>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">${sym.type}</span>
        `;
        elements.symbolsContainer.appendChild(item);
      });
    }
  }
}

function renderTreeNode(node, container, depth) {
  const row = document.createElement('div');
  row.className = 'flex items-center gap-1.5 py-0.5';
  row.style.paddingLeft = `${depth * 14}px`;

  if (node.type === 'dir') {
    row.innerHTML = `<span class="text-amber-400">📁</span> <span class="font-semibold text-slate-200">${node.name}</span>`;
    container.appendChild(row);
    if (node.children) {
      node.children.forEach(child => renderTreeNode(child, container, depth + 1));
    }
  } else {
    row.innerHTML = `<span class="text-slate-400">📄</span> <span class="text-slate-300">${node.name}</span> <span class="text-slate-500 text-[10px]">${node.lines || 0} lines</span>`;
    container.appendChild(row);
  }
}

function setGenerating(isGen, message = '') {
  state.isGenerating = isGen;
  if (isGen) {
    elements.progressContainer.classList.remove('hidden');
    elements.progressMessage.textContent = message;
    elements.generateDocsBtn.disabled = true;
    elements.generateDocsBtn.classList.add('opacity-50', 'cursor-not-allowed');
  } else {
    elements.progressContainer.classList.add('hidden');
    elements.generateDocsBtn.disabled = false;
    elements.generateDocsBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  }
}

function animateProgressBar() {
  const stages = [
    'Stage 1: Scanning directory & parsing AST symbols...',
    'Stage 2: Analyzing architecture patterns & data flows...',
    'Stage 3: Synthesizing Mermaid component diagrams...',
    'Stage 4: Extracting API endpoints & module reference...',
    'Stage 5: Packaging Client Handoff & Technical Audit...'
  ];
  let current = 0;
  elements.progressBar.style.width = '20%';

  const interval = setInterval(() => {
    if (!state.isGenerating) {
      clearInterval(interval);
      return;
    }
    current = (current + 1) % stages.length;
    elements.progressMessage.textContent = stages[current];
    elements.progressBar.style.width = `${((current + 1) / stages.length) * 100}%`;
    elements.progressPercent.textContent = `Stage ${current + 1} of 5`;
  }, 2200);
}

function copyMarkdown() {
  if (!state.currentResult) return alert('No documentation generated yet.');
  const text = state.currentResult.sections[state.currentSection] || state.currentResult.fullMarkdown;
  navigator.clipboard.writeText(text);
  alert('Documentation markdown copied to clipboard!');
}

function downloadBundle() {
  if (!state.currentResult) return alert('No documentation generated yet.');
  const text = state.currentSection === 'clientAuditPacket'
    ? state.currentResult.sections.clientAuditPacket
    : state.currentResult.fullMarkdown;
    
  const filename = state.currentSection === 'clientAuditPacket'
    ? 'CLIENT_AUDIT_HANDOFF.md'
    : 'CODEBASE_DOCUMENTATION.md';

  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Start
document.addEventListener('DOMContentLoaded', init);

