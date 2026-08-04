// AI utility - powered by Gemini API under the hood

class GeminiKeyManager {
  public keys: string[];
  private currentIndex: number;
  private cooldowns: Map<string, number>;

  constructor() {
    const keysString = process.env.GEMINI_API_KEYS || "";
    const rawKeys = keysString.split(",").map((k) => k.trim()).filter((k) => k.length > 0);
    // Deduplicate keys
    this.keys = Array.from(new Set(rawKeys));
    this.currentIndex = 0;
    this.cooldowns = new Map();

    if (this.keys.length === 0) {
      console.warn("⚠️ No Gemini API keys found in GEMINI_API_KEYS environment variable.");
    }
  }

  // Gets a key that is not currently in cooldown
  public getNextKey(): string {
    if (this.keys.length === 0) {
      throw new Error("No Gemini API keys available");
    }

    const now = Date.now();
    for (let i = 0; i < this.keys.length; i++) {
      const idx = (this.currentIndex + i) % this.keys.length;
      const key = this.keys[idx];
      const cooldownUntil = this.cooldowns.get(key) || 0;

      if (now >= cooldownUntil) {
        this.currentIndex = (idx + 1) % this.keys.length;
        return key;
      }
    }

    // Fallback if all keys are temporarily cooling down
    const key = this.keys[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    return key;
  }

  public markKeyCoolDown(key: string, durationMs: number = 60000) {
    this.cooldowns.set(key, Date.now() + durationMs);
  }

  // Expose pool metadata for admin health checks
  public getHealthStats() {
    const now = Date.now();
    let activeKeys = 0;
    for (const key of this.keys) {
      if ((this.cooldowns.get(key) || 0) <= now) activeKeys++;
    }
    return {
      totalKeys: this.keys.length,
      activeKeys,
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
  
  // High-performance fallback list ordered by quota, speed & model stability
  const fallbackModels = [
    initialModel,
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.1-pro",
    "gemini-3.1-flash-lite",
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
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
          
          if (res.status === 429) {
            geminiManager.markKeyCoolDown(key, 60000);
            await new Promise((r) => setTimeout(r, 150));
          }

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
      }
    }
    
    console.warn(`[Gemini] ⚠️ All ${attempts} keys exhausted for model ${modelName}. Falling back to next model...`);
  }

  console.error("[Gemini] 🛑 ABSOLUTE FAILURE: All keys exhausted across all fallback models.");
  throw lastError;
}

/**
 * AI Moderation Function (2-way Sanitization)
 */
export async function moderateReview(rawText: string): Promise<{ thirdPersonSummary: string, firstPersonSanitized: string }> {
  const prompt = `
    You are AI, an intelligent, natural AI feedback moderator for a college teacher feedback system in Nepal (MBMAN).
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
