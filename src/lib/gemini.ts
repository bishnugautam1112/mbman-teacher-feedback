// AIRA AI utility - powered by Gemini API under the hood

class GeminiKeyManager {
  private keys: string[];
  private currentIndex: number;

  constructor() {
    const keysString = process.env.GEMINI_API_KEYS || "";
    this.keys = keysString.split(",").map((k) => k.trim()).filter((k) => k.length > 0);
    this.currentIndex = 0;

    if (this.keys.length === 0) {
      console.warn("⚠️ No Gemini API keys found in GEMINI_API_KEYS environment variable.");
    }
  }

  // Gets a key and advances the index
  public getNextKey(): string {
    if (this.keys.length === 0) {
      throw new Error("No Gemini API keys available");
    }
    const key = this.keys[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    return key;
  }

  // Expose pool metadata for admin health checks (never exposes actual keys)
  public getHealthStats() {
    return {
      totalKeys: this.keys.length,
      currentIndex: this.currentIndex,
    };
  }
}

export const geminiManager = new GeminiKeyManager();

/**
 * Robust Google AI Caller with Retries (Translating your Python logic)
 */
export async function callGoogleAIWithRetry(prompt: string, initialModel: string = "gemini-3.1-flash-lite"): Promise<string> {
  let lastError: any;
  
  // The absolute no-fail fallback list (starts with the requested model, cascades down)
  const fallbackModels = [
    initialModel,
    "gemini-3.5-flash",
    "gemini-3-flash",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-1.5-flash"
  ];

  // Remove duplicates just in case initialModel is already in the list
  const uniqueModels = Array.from(new Set(fallbackModels));

  for (const modelName of uniqueModels) {
    const attempts = geminiManager.keys.length;
    
    console.log(`[Gemini] Attempting with model: ${modelName} across ${attempts} keys...`);

    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        const key = geminiManager.getNextKey();
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
        
        const payload = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.15,
            maxOutputTokens: 250,
          }
        };

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.warn(`[Gemini] ${modelName} Attempt ${attempt + 1}/${attempts} failed on key ...${key.slice(-6)}: ${res.status} ${errorText}`);
          lastError = new Error(`HTTP ${res.status}: ${errorText}`);
          continue; // Try next key
        }

        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!rawText) throw new Error("Invalid response structure from Gemini API");
        
        // SUCCESS!
        return rawText.trim();

      } catch (error) {
        console.warn(`[Gemini] ${modelName} Attempt ${attempt + 1}/${attempts} network error:`, error);
        lastError = error;
        // Try next key
      }
    }
    
    // If we reach here, ALL keys failed for this specific model. 
    console.warn(`[Gemini] ⚠️ All ${attempts} keys exhausted for model ${modelName}. Falling back to next model...`);
  }

  // If we reach here, ALL keys failed for ALL models.
  console.error("[Gemini] 🛑 ABSOLUTE FAILURE: All keys exhausted across all fallback models.");
  throw lastError;
}

/**
 * AI Moderation Function (2-way Sanitization)
 */
export async function moderateReview(rawText: string): Promise<{ thirdPersonSummary: string, firstPersonSanitized: string }> {
  const prompt = `
    You are an AI moderator for a college teacher feedback system.
    A student has submitted the following feedback anonymously.
    Your task is to analyze the text and output a JSON object containing two sanitized versions.
    
    Rules for sanitization:
    - If the text is extremely vulgar, offensive, or uses informal "wreck" language (e.g., "f**k sir", "worst teacher ever"), extract the core frustration without the toxicity.
    - If it's already professional, just polish the grammar slightly.
    
    You MUST return ONLY a valid JSON object with the following schema:
    {
      "thirdPersonSummary": "A highly professional, constructive 3rd-person summary (e.g. 'A student expressed difficulty following the lectures.')",
      "firstPersonSanitized": "A polished, non-toxic 1st-person version that sounds like the student wrote it (e.g. 'I felt that it was difficult to follow the lectures.')"
    }
    
    Student Feedback:
    "${rawText}"
  `;

  try {
    const response = await callGoogleAIWithRetry(prompt, "gemini-3.1-flash-lite");
    // Clean up potential markdown blocks from AI
    const jsonStr = response.replace(/^```json/m, "").replace(/```$/m, "").trim();
    const result = JSON.parse(jsonStr);
    return {
      thirdPersonSummary: result.thirdPersonSummary || "Feedback received.",
      firstPersonSanitized: result.firstPersonSanitized || "Feedback received."
    };
  } catch (error) {
    console.error("Moderation AI Failed completely:", error);
    // Silent fallback
    const fallback = "Feedback received. (AIRA AI moderation temporarily unavailable)";
    return {
      thirdPersonSummary: fallback,
      firstPersonSanitized: fallback
    };
  }
}
