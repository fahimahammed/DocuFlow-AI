import fs from 'node:fs';
import path from 'node:path';

// Ignore non-source or bulky directories
const IGNORED_DIRS = new Set([
  'node_modules', '.git', '.github', 'dist', 'build', '.next', '.nuxt',
  'vendor', 'coverage', '.cache', '__pycache__', '.venv', 'venv', 'env',
  '.idea', '.vscode', 'tmp', 'temp'
]);

const SUPPORTED_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.py', '.go', '.rs', '.java', '.rb', '.php',
  '.json', '.yaml', '.yml', '.md', '.sql', '.prisma'
]);

/**
 * Recursively scans directory and extracts file tree and source code
 */
export function scanCodebase(dirPath, maxFiles = 100, maxFileSizeBytes = 100000) {
  const files = [];
  const dirStructure = { name: path.basename(dirPath), type: 'dir', children: [] };

  function walk(currentDir, relativePath, currentTree) {
    if (files.length >= maxFiles) return;

    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch (e) {
      return;
    }

    // Sort: directories first, then files
    entries.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

    for (const entry of entries) {
      if (entry.name.startsWith('.') && entry.name !== '.env.example') continue;
      if (IGNORED_DIRS.has(entry.name)) continue;

      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.join(relativePath, entry.name);

      if (entry.isDirectory()) {
        const dirNode = { name: entry.name, path: relPath, type: 'dir', children: [] };
        currentTree.children.push(dirNode);
        walk(fullPath, relPath, dirNode);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (!SUPPORTED_EXTENSIONS.has(ext) && !['dockerfile', 'makefile'].includes(entry.name.toLowerCase())) {
          continue;
        }

        try {
          const stats = fs.statSync(fullPath);
          if (stats.size > maxFileSizeBytes) continue;

          const content = fs.readFileSync(fullPath, 'utf8');
          const fileInfo = {
            name: entry.name,
            path: relPath,
            extension: ext,
            size: stats.size,
            lines: content.split('\n').length,
            content
          };

          files.push(fileInfo);
          currentTree.children.push({
            name: entry.name,
            path: relPath,
            type: 'file',
            size: stats.size,
            lines: fileInfo.lines
          });

          if (files.length >= maxFiles) break;
        } catch (e) {
          // ignore unreadable file
        }
      }
    }
  }

  walk(dirPath, '', dirStructure);

  // Extract metadata and structural metrics
  const languageStats = {};
  let totalLines = 0;

  for (const f of files) {
    totalLines += f.lines;
    const lang = detectLanguage(f.extension, f.name);
    languageStats[lang] = (languageStats[lang] || 0) + f.lines;
  }

  // Parse structural signatures (functions, exports, routes, classes)
  const symbols = [];
  const dependencyGraph = { nodes: [], edges: [] };

  for (const f of files) {
    const extracted = extractCodeSymbols(f);
    symbols.push(...extracted.symbols);
    dependencyGraph.nodes.push({ id: f.path, name: f.name, lines: f.lines, ext: f.extension });
    for (const dep of extracted.dependencies) {
      dependencyGraph.edges.push({ from: f.path, to: dep });
    }
  }

  return {
    rootPath: dirPath,
    totalFiles: files.length,
    totalLines,
    languageStats,
    dirStructure,
    files,
    symbols,
    dependencyGraph
  };
}

function detectLanguage(ext, filename) {
  const map = {
    '.js': 'JavaScript', '.jsx': 'JavaScript (React)',
    '.ts': 'TypeScript', '.tsx': 'TypeScript (React)',
    '.py': 'Python', '.go': 'Go', '.rs': 'Rust',
    '.java': 'Java', '.rb': 'Ruby', '.php': 'PHP',
    '.sql': 'SQL', '.prisma': 'Prisma Schema',
    '.yaml': 'YAML', '.yml': 'YAML', '.json': 'JSON', '.md': 'Markdown'
  };
  if (filename.toLowerCase() === 'dockerfile') return 'Docker';
  if (filename.toLowerCase() === 'makefile') return 'Makefile';
  return map[ext] || 'Text';
}

/**
 * Extracts symbols (routes, functions, classes, exports) and imported dependencies
 */
export function extractCodeSymbols(file) {
  const symbols = [];
  const dependencies = [];
  const lines = file.content.split('\n');

  // Regex patterns for different languages
  const patterns = {
    // JS/TS imports & exports
    jsImport: /(?:import\s+(?:[\w*\s{},]+)\s+from\s+['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\))/g,
    jsExportFn: /(?:export\s+(?:async\s+)?function\s+([a-zA-Z0-9_$]+)|(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)/,
    jsClass: /(?:export\s+)?class\s+([a-zA-Z0-9_$]+)(?:\s+extends\s+([a-zA-Z0-9_$]+))?/,
    jsRoute: /(?:app|router)\.(get|post|put|patch|delete)\(['"]([^'"]+)['"]/i,

    // Python imports & symbols
    pyImport: /(?:from\s+([\w.]+)\s+import|import\s+([\w.]+))/,
    pyDef: /def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\):/,
    pyClass: /class\s+([a-zA-Z0-9_]+)(?:\(([^)]*)\))?:/,
    pyRoute: /@(app|router)\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/i
  };

  // Find imports
  let match;
  while ((match = patterns.jsImport.exec(file.content)) !== null) {
    const dep = match[1] || match[2];
    if (dep && !dependencies.includes(dep)) dependencies.push(dep);
  }

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // Check JS/TS routes
    const routeMatch = trimmed.match(patterns.jsRoute);
    if (routeMatch) {
      symbols.push({
        type: 'endpoint',
        name: `${routeMatch[1].toUpperCase()} ${routeMatch[2]}`,
        file: file.path,
        line: lineNum,
        signature: trimmed
      });
      return;
    }

    // Check Python routes
    const pyRouteMatch = trimmed.match(patterns.pyRoute);
    if (pyRouteMatch) {
      symbols.push({
        type: 'endpoint',
        name: `${pyRouteMatch[2].toUpperCase()} ${pyRouteMatch[3]}`,
        file: file.path,
        line: lineNum,
        signature: trimmed
      });
      return;
    }

    // Check JS/TS Classes
    const classMatch = trimmed.match(patterns.jsClass);
    if (classMatch) {
      symbols.push({
        type: 'class',
        name: classMatch[1],
        file: file.path,
        line: lineNum,
        signature: trimmed
      });
      return;
    }

    // Check Python Classes
    const pyClassMatch = trimmed.match(patterns.pyClass);
    if (pyClassMatch) {
      symbols.push({
        type: 'class',
        name: pyClassMatch[1],
        file: file.path,
        line: lineNum,
        signature: trimmed
      });
      return;
    }

    // Check Functions
    const fnMatch = trimmed.match(patterns.jsExportFn);
    if (fnMatch) {
      symbols.push({
        type: 'function',
        name: fnMatch[1] || fnMatch[2],
        file: file.path,
        line: lineNum,
        signature: trimmed.slice(0, 100)
      });
      return;
    }

    const pyDefMatch = trimmed.match(patterns.pyDef);
    if (pyDefMatch) {
      symbols.push({
        type: 'function',
        name: pyDefMatch[1],
        file: file.path,
        line: lineNum,
        signature: trimmed
      });
      return;
    }

    // Check Python imports per line
    const pyImp = trimmed.match(patterns.pyImport);
    if (pyImp) {
      const dep = pyImp[1] || pyImp[2];
      if (dep && !dependencies.includes(dep)) dependencies.push(dep);
    }
  });

  return { symbols, dependencies };
}

