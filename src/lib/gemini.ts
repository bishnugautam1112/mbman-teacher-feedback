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
 * Robust Google AI Caller with Retries
 */
export async function callGoogleAIWithRetry(prompt: string, initialModel: string = "gemini-2.0-flash"): Promise<string> {
  let lastError: any;
  
  // The absolute no-fail fallback list using valid Gemini API model names
  const fallbackModels = [
    initialModel,
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro"
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
            maxOutputTokens: 350,
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
    You are AIRA, an intelligent, natural AI feedback moderator for a college teacher feedback system in Nepal (MBMAN).
    A student has submitted the following feedback anonymously:
    "${rawText}"

    CRITICAL RULES FOR MODERATION:
    1. LANGUAGE & SCRIPT PRESERVATION:
       - Maintain the EXACT same language and script/romanization style as the input!
       - If the student wrote in Romanized Nepali (e.g. "thank you sir model question paper dinu vako maa"), output MUST be in Romanized Nepali!
       - If written in Nepali script (Devanagari), output MUST be in Nepali script.
       - If written in English, output MUST be in English.
       - NEVER force-translate Romanized Nepali into formal corporate English!

    2. SENSITIVITY & MAGICAL EDITING:
       - If the review is GOOD, POSITIVE, or NORMAL CONSTRUCTIVE FEEDBACK, keep the student's authentic review and expression intact! Do NOT rewrite it into dry corporate summaries.
       - If the feedback contains PROFANITY, VULGARITY, SLANG, or TOXIC ATTACKS:
         - Magically filter out or edit ONLY the bad/vulgar/abusive words.
         - Transform toxic rants into polite, constructive, natural feedback in the SAME language/romanization.
         - Make sure the output reads naturally, authentically, and believably as a real student feedback on the dashboard.

    You MUST return ONLY a valid JSON object with the following schema:
    {
      "thirdPersonSummary": "The natural, moderated student review in the original language/romanization.",
      "firstPersonSanitized": "A 1st-person version in the original language/romanization with all bad words magically cleaned."
    }
  `;

  try {
    const response = await callGoogleAIWithRetry(prompt, "gemini-2.0-flash");
    // Clean up potential markdown blocks from AI
    const jsonStr = response.replace(/^```json/m, "").replace(/```$/m, "").trim();
    const result = JSON.parse(jsonStr);
    return {
      thirdPersonSummary: result.thirdPersonSummary || rawText,
      firstPersonSanitized: result.firstPersonSanitized || rawText
    };
  } catch (error) {
    console.error("Moderation AI Failed completely:", error);
    // Silent fallback to rawText so student feedback always looks authentic on dashboard
    return {
      thirdPersonSummary: rawText,
      firstPersonSanitized: rawText
    };
  }
}
