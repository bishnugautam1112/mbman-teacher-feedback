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
  
  // High-performance, low-latency models for instant response times
  const fallbackModels = [
    initialModel,
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b"
  ];

  // Remove duplicates
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
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(3500)
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
 * Fallback sanitizer in case AI fails or returns raw text
 */
function fallbackSanitize(text: string): { text: string; isToxic: boolean } {
  const toxicPattern = /\b(go to hell|hell|fuck|fucking|bitch|shit|bullshit|die|muji|radi|torpe|kutta|randi|mc|bc|idiot|stupid|worst|waste of time|gadu|guu|chor|zero star|0 star)\b/gi;
  const isToxic = toxicPattern.test(text);
  const cleaned = text.replace(toxicPattern, "please improve teaching methods");
  return { text: cleaned, isToxic };
}

/**
 * AI Moderation Function (2-way Sanitization + Contradiction & Abuse Audit)
 */
export async function moderateReview(
  rawText: string,
  submittedRating: number = 5
): Promise<{
  thirdPersonSummary: string;
  firstPersonSanitized: string;
  isAbusiveOrAnomalous: boolean;
  auditedRating: number;
}> {
  const prompt = `
    You are AI, a strict, intelligent, and natural AI feedback auditor for a college teacher feedback system in Nepal (MBMAN).
    A student submitted the following feedback anonymously with a selected rating of ${submittedRating}/5 stars:
    "${rawText}"

    STRICT RULES FOR MODERATION & AUDIT:
    1. RATING VS TEXT CONTRADICTION & SARCSAM DETECTION:
       - Check if the text CONTRADICTS the ${submittedRating}-star rating (e.g. Student gave 5 stars, but wrote sarcastic rants like "worst teacher", "go to hell", "master of sleeping", "zero star", "gadu", "muji", "terrible", "waste of time/money", or severe negative criticism).
       - If the student wrote a 0-star/1-star rant or rough insult disguised as a 5-star rating:
         - Calculate the TRUE realistic sentiment rating (e.g. 1 or 2 stars).
         - Set "isAbusiveOrAnomalous": true.

    2. ZERO TOLERANCE FOR PROFANITY, HOSTILITY, INSULTS, & RUDE COMMANDS:
       - Regard ANY phrase containing hostility, rudeness, slang, curse words, creative insults, or rude commands (such as "go to hell", "die", "fuck", "bitch", "useless", "muji", "torpe", "radi", "kutta", "randi", etc.) as PROFANITY / HOSTILITY.
       - NEVER allow hostile phrases like "go to hell" or insults to pass through into the output text, REGARDLESS of how high the submitted rating was!
       - Transform toxic rants, bad words, or hostile commands into polite, constructive, natural feedback in the SAME language/script.
       - Example: "go to hell sir" -> "Please improve teaching guidance and support sir."
       - Example: "muji padhauna aaudaina" -> "Kripaya teaching method ra explanation ma aaru dhaayan dinus."

    3. LANGUAGE & SCRIPT PRESERVATION:
       - Maintain the EXACT same language and script/romanization style as the input!
       - If written in Romanized Nepali (e.g. "go to hell, dinu vako chaina"), output MUST be in Romanized Nepali!
       - If written in Nepali script (Devanagari), output MUST be in Devanagari script.
       - If written in English, output MUST be in English.

    You MUST return ONLY a valid JSON object with the following schema:
    {
      "thirdPersonSummary": "The natural, strictly moderated student review in the original language/romanization without any insults or bad words.",
      "firstPersonSanitized": "A polite 1st-person version in the original language/romanization with all bad words and hostile phrases replaced by polite feedback.",
      "isAbusiveOrAnomalous": true,
      "auditedRating": 1
    }
  `;

  try {
    const response = await callGoogleAIWithRetry(prompt, "gemini-2.0-flash");
    const jsonStr = response.replace(/^```json/m, "").replace(/```$/m, "").trim();
    const result = JSON.parse(jsonStr);
    
    // Check fallback filter on outputs
    const fbThird = fallbackSanitize(result.thirdPersonSummary || rawText);
    const fbFirst = fallbackSanitize(result.firstPersonSanitized || rawText);
    const fbRaw = fallbackSanitize(rawText);

    const isToxic = result.isAbusiveOrAnomalous === true || fbRaw.isToxic || fbThird.isToxic || fbFirst.isToxic;
    const finalAuditedRating = (isToxic && result.auditedRating && result.auditedRating < submittedRating)
      ? Number(result.auditedRating)
      : (isToxic ? Math.min(submittedRating, 2) : (result.auditedRating || submittedRating));

    return {
      thirdPersonSummary: fbThird.text,
      firstPersonSanitized: fbFirst.text,
      isAbusiveOrAnomalous: isToxic,
      auditedRating: finalAuditedRating
    };
  } catch (error) {
    console.error("Moderation AI Failed completely:", error);
    const fb = fallbackSanitize(rawText);
    return {
      thirdPersonSummary: fb.text,
      firstPersonSanitized: fb.text,
      isAbusiveOrAnomalous: fb.isToxic,
      auditedRating: fb.isToxic ? Math.min(submittedRating, 2) : submittedRating
    };
  }
}
