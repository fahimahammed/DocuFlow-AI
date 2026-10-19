/**
 * Google Gemini API integration using native fetch
 */
export async function callGemini(prompt, apiKey, model = 'gemini-2.5-flash') {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Gemini API key is required. Please provide it in settings or .env');
  }

  const candidateModels = [
    model,
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ];

  // Deduplicate candidate models
  const modelsToTry = [...new Set(candidateModels)];
  let lastError = null;

  for (const currentModel of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey.trim()}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8192
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errMsg = `Gemini API error (${response.status}): ${errorText}`;
        try {
          const jsonErr = JSON.parse(errorText);
          if (jsonErr.error && jsonErr.error.message) {
            errMsg = jsonErr.error.message;
          }
        } catch (e) {}

        // If it's a 404 (model not found), try next model
        if (response.status === 404 && modelsToTry.indexOf(currentModel) < modelsToTry.length - 1) {
          lastError = new Error(errMsg);
          continue;
        }

        throw new Error(errMsg);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('No content returned from Gemini model candidate');
      }

      return {
        text,
        model: currentModel,
        provider: 'Google Gemini'
      };
    } catch (err) {
      lastError = err;
      // If network or critical error, if we have another model and it was 404, loop, else rethrow
      if (!err.message.includes('404') && !err.message.includes('not found')) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Failed to query Gemini API');
}

