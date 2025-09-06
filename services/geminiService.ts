
import { GoogleGenAI } from "@google/genai";
import { ApiProvider, type OutlineSection, type ScriptPart, type ApiKey } from '../types';

const API_KEY_STORAGE_KEY = 'llm-api-keys-list';
const COOLDOWN_MS = 2000; // 2 seconds cooldown between requests for the same key

const getApiKeys = (): ApiKey[] => {
    const encodedKeys = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (!encodedKeys) return [];
    try {
        return JSON.parse(atob(encodedKeys));
    } catch (e) {
        console.error("Failed to parse API keys, clearing storage.", e);
        localStorage.removeItem(API_KEY_STORAGE_KEY);
        window.location.reload(); 
        return [];
    }
};

const saveApiKeys = (keys: ApiKey[]) => {
    try {
        const encodedKeys = btoa(JSON.stringify(keys));
        localStorage.setItem(API_KEY_STORAGE_KEY, encodedKeys);
    } catch (e) {
        console.error("Failed to save API keys.", e);
    }
};

async function makeApiRequest(
    prompt: string | { system: string; user: string },
    provider: ApiProvider, 
    generationConfig?: any,
    model?: string
): Promise<string> {
    const allKeys = getApiKeys();
    const providerKeys = allKeys.filter(k => k.provider === provider);

    if (providerKeys.length === 0) {
        throw new Error(`Không có API Key nào được cấu hình cho ${provider}. Vui lòng vào phần cài đặt để thêm key.`);
    }

    // Sort keys by least recently used, prioritizing keys that are not exhausted
    providerKeys.sort((a, b) => {
        const aExhausted = a.exhaustedUntil && a.exhaustedUntil > Date.now();
        const bExhausted = b.exhaustedUntil && b.exhaustedUntil > Date.now();
        if (aExhausted && !bExhausted) return 1;
        if (!aExhausted && bExhausted) return -1;
        return a.lastUsed - b.lastUsed;
    });

    let lastError: Error | null = null;

    for (const apiKey of providerKeys) {
        const now = Date.now();
        if (apiKey.exhaustedUntil && apiKey.exhaustedUntil > now) {
            lastError = new Error(`API key ending in ...${apiKey.key.slice(-4)} is temporarily exhausted.`);
            continue; // Skip this key
        }

        const timeSinceLastUse = now - apiKey.lastUsed;
        if (timeSinceLastUse < COOLDOWN_MS) {
            await new Promise(resolve => setTimeout(resolve, COOLDOWN_MS - timeSinceLastUse));
        }

        apiKey.lastUsed = Date.now();
        saveApiKeys(allKeys); // Save updated lastUsed time

        try {
            let responseText = '';
            
            if (provider === ApiProvider.GEMINI) {
                // Fix: Updated Gemini API call to align with @google/genai SDK guidelines.
                const ai = new GoogleGenAI({ apiKey: apiKey.key });
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: [{ role: "user", parts: [{ text: prompt as string }] }],
                    config: generationConfig,
                });
                responseText = response.text;
            } else {
                const isOpenRouter = provider === ApiProvider.OPENROUTER;
                const url = isOpenRouter ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
                
                const body = {
                    model: model || (isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o'), // Default model
                    messages: typeof prompt === 'string' 
                        ? [{ role: 'user', content: prompt }]
                        : [{ role: 'system', content: prompt.system }, { role: 'user', content: prompt.user }],
                };

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey.key}`,
                        'Content-Type': 'application/json',
                        ...(isOpenRouter && { 'HTTP-Referer': 'https://script-generator.app', 'X-Title': 'Script Generator' }),
                    },
                    body: JSON.stringify(body),
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    if (response.status === 429) { // Quota exhausted
                         apiKey.exhaustedUntil = Date.now() + 24 * 60 * 60 * 1000; // Mark as exhausted for 24 hours
                         saveApiKeys(allKeys);
                         throw new Error(`[${response.status}] Hạn ngạch API Key ...${apiKey.key.slice(-4)} đã hết. Tự động thử key tiếp theo.`);
                    }
                    throw new Error(`[${response.status}] ${errorData.error?.message || response.statusText}`);
                }
                
                const data = await response.json();
                responseText = data.choices[0]?.message?.content || '';
            }

            if (!responseText.trim()) {
                 throw new Error('API đã trả về một phản hồi trống.');
            }
            return responseText.trim();

        } catch (err) {
            console.error(`Error with key ...${apiKey.key.slice(-4)}:`, err);
            lastError = err instanceof Error ? err : new Error('Lỗi không xác định');

            // Specifically handle Gemini quota errors which are caught here.
            if (provider === ApiProvider.GEMINI && err instanceof Error && (err.message.includes('429') || err.message.toLowerCase().includes('quota'))) {
                apiKey.exhaustedUntil = Date.now() + 24 * 60 * 60 * 1000; // Mark as exhausted for 24 hours
                saveApiKeys(allKeys);
                lastError = new Error(`[429] Hạn ngạch API Key Gemini ...${apiKey.key.slice(-4)} đã hết. Tự động thử key tiếp theo.`);
            }
        }
    }

    throw lastError || new Error(`Tất cả API keys cho ${provider} đều không thành công.`);
}


export const generateOutline = async (title: string, provider: ApiProvider, model?: string): Promise<string> => {
    const prompt = `Create a detailed outline in ENGLISH for a documentary about: "${title}".
    The outline must consist of 8 to 12 sections.
    Each section must have a compelling title, an approximate word count target, and a brief description (1-2 sentences) of its content.
    The word count for each section must be between 700 and 1000 words.
    The output format MUST strictly follow this example, using "---" to separate sections:
    
    [Section 1 Title]
    Word Target: ~800 words
    Description: [Brief description for section 1]
    ---
    [Section 2 Title]
    Word Target: ~900 words
    Description: [Brief description for section 2]
    ---
    ...and so on.`;

    return makeApiRequest(prompt, provider, { temperature: 0.7, topP: 0.95, topK: 40 }, model);
};

export const parseOutline = (outlineText: string): OutlineSection[] => {
  return outlineText.split('---')
    .map(part => part.trim())
    .filter(part => part)
    .map(part => {
      const lines = part.split('\n');
      const title = lines[0]?.trim() || 'No Title';
      const wordTargetMatch = lines.find(line => line.toLowerCase().includes('word target:'));
      const wordTarget = wordTargetMatch ? wordTargetMatch.split(':')[1]?.trim() : '~800 words';
      const descriptionMatch = lines.find(line => line.toLowerCase().includes('description:'));
      const description = descriptionMatch ? descriptionMatch.split(':')[1]?.trim() : 'No description provided.';
      return { title, wordTarget, description };
    })
    .filter(section => section.title !== 'No Title' && section.description !== 'No description provided.');
};


export const generateScriptPart = async (
  title: string,
  outline: OutlineSection[],
  scriptParts: ScriptPart[],
  partIndex: number,
  provider: ApiProvider,
  model?: string
): Promise<string> => {
  if (partIndex < 0 || partIndex >= outline.length) {
    throw new Error("Invalid part index provided.");
  }
  const currentSection = outline[partIndex];
  const targetWordCount = parseInt(currentSection.wordTarget.replace(/[^0-9]/g, ''), 10) || 800;
  
  const previousPartsContext = scriptParts
    .slice(Math.max(0, partIndex - 2), partIndex) // Get the last 2 parts for context
    .map(part => part.content) // The content itself contains the header
    .join('\n\n---\n\n');

  let systemPrompt = `You are a professional documentary scriptwriter. Your style is a cinematic investigative style like Fern, but with more depth, tighter pacing, and flawless accuracy. You will be given a topic, an outline, and a specific part to write.

**CRITICAL SCRIPT REQUIREMENTS - FOLLOW THESE EXACTLY:**

1.  **Language:** The entire script must be in **ENGLISH**.

2.  **Paragraph Word Count (ABSOLUTE RULE):** This is the most important rule. Every single paragraph of narration **MUST** be strictly between 22 and 24 words long. There are absolutely **NO exceptions**. If even one paragraph is shorter than 22 words or longer than 24 words, your entire output is considered a failure. Before finalizing your response, you must review every paragraph you have written to ensure it meets this exact word count requirement.

3.  **Paragraph Formatting:** Do **NOT** number the paragraphs. Each paragraph **MUST** be separated by a single blank line (two newlines).

4.  **Header & Footer Format:** The output for each part **MUST** start with a header and end with a footer. Do not add any text before the header or after the footer.
    *   **Part Header Format (First Line):** \`[SECTION TITLE] – Part X (Word count/Paragraph count)\`
    *   **Part Footer Format (Last Line):** \`Word count: [X] | Paragraphs: [Y]\`
    (You will calculate the final Word count and Paragraph count and fill them in).

5.  **Accuracy & Flow:** All claims must be factual and well-sourced. Each part must connect smoothly to the next, forming a cinematic story arc. No repetition.

**EXAMPLE OF A PERFECTLY FORMATTED OUTPUT:**

THE FORGOTTEN VOYAGE – Part 3 (70 words/3 paragraphs)

Its final message was a cryptic transmission, lost to the static of the unforgiving sea, a ghostly whisper from a crew already facing their doom.

They were sailing into a meteorological anomaly, a storm system so violent and bizarre that modern science still struggles to fully comprehend its brutal power.

The ship's log, recovered years later, spoke of compasses spinning wildly and equipment failing, hinting at forces beyond just the wind and the churning waves.

Word count: 70 | Paragraphs: 3
---

Your entire output must follow this structure PERFECTLY.`;

    if (partIndex === 0) {
        systemPrompt += `

**SPECIAL INSTRUCTION FOR PART 1:** This is the beginning of the documentary. You **MUST** create a powerful opening hook. The first few paragraphs must be exceptionally compelling to grab the audience's attention and keep them watching.`;
    }

  const userPrompt = `**TOPIC:** "${title}"

**FULL DOCUMENTARY OUTLINE:**
${outline.map((s, i) => `Part ${i + 1}: ${s.title} (${s.wordTarget}) - ${s.description}`).join('\n')}

**CONTEXT FROM PREVIOUS PARTS:**
${previousPartsContext || 'This is the first part, so there is no previous context.'}

**CURRENT TASK:**
Write the script for **Part ${partIndex + 1}: ${currentSection.title}**.
- Description for this part: "${currentSection.description}".
- Word Target: Approximately ${targetWordCount} words.

Now, generate the script for this part, following all the critical requirements in the system instructions PERFECTLY.`;

  if (provider === ApiProvider.GEMINI) {
      return makeApiRequest(`${systemPrompt}\n\n${userPrompt}`, provider, { temperature: 0.8, topP: 0.95, topK: 50 });
  } else {
      return makeApiRequest({ system: systemPrompt, user: userPrompt }, provider, undefined, model);
  }
};