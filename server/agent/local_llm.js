/**
 * Open-Weight Local Inference integration (Ollama / llama.cpp / LM Studio / vLLM)
 * Enables 100% private, air-gapped codebase analysis with zero data egress.
 */

export async function checkLocalLlmStatus(baseUrl = 'http://localhost:11434') {
  try {
    const res = await fetch(`${baseUrl}/api/tags`, { method: 'GET', signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      return {
        online: true,
        type: 'ollama',
        models: data.models ? data.models.map(m => m.name) : []
      };
    }
  } catch (e) {
    // try openai-compatible endpoint (LM Studio / vLLM)
    try {
      const res = await fetch(`${baseUrl}/v1/models`, { method: 'GET', signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        return {
          online: true,
          type: 'openai-compatible',
          models: data.data ? data.data.map(m => m.id) : []
        };
      }
    } catch (e2) {}
  }

  return { online: false, type: 'none', models: [] };
}

export async function callLocalLlm(prompt, options = {}) {
  const baseUrl = options.baseUrl || 'http://localhost:11434';
  const model = options.model || 'qwen2.5-coder:7b';

  // Try Ollama native /api/generate
  try {
    const res = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: 0.2,
          num_ctx: 16384
        }
      })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        text: data.response,
        model,
        provider: 'Local Open-Weights (Ollama)'
      };
    }
  } catch (e) {
    // If ollama fails, try OpenAI-compatible endpoint
  }

  // Fallback to OpenAI-compatible /v1/chat/completions (vLLM, LM Studio, etc.)
  try {
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2
      })
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) {
        return {
          text,
          model,
          provider: 'Local Open-Weights (OpenAI-compatible)'
        };
      }
    }
  } catch (e) {
    throw new Error(`Could not connect to local open-weight model at ${baseUrl}. Is Ollama or LM Studio running? (${e.message})`);
  }

  throw new Error(`Failed to generate documentation using local model at ${baseUrl}`);
}

