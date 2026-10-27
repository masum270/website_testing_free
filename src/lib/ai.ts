// AI Integration Service supporting Gemini, Groq, and DeepSeek with automatic fallback

const TIMEOUT_MS = 15000;

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = TIMEOUT_MS): Promise<Response> {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      reject(new Error('অনুরোধটির সময়সীমা (15s) উত্তীর্ণ হয়েছে।'));
    }, timeoutMs);

    fetch(url, { ...options, signal: controller.signal })
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function parseAPIError(status: number, text: string, providerName: string): string {
  if (status === 401 || status === 403) {
    return `${providerName} API Key সঠিক নয়, অনুগ্রহ করে Settings এ কি চেক করুন। (Status: ${status})`;
  }
  if (status === 404) {
    return `${providerName} এর নির্ধারিত মডেল আপডেট বা পরিবর্তন করা হয়েছে (404 Not Found)।`;
  }
  if (text.toLowerCase().includes('decommissioned') || text.toLowerCase().includes('deprecated')) {
    return `${providerName} এর বর্তমান মডেলটি ডি-কমিশন করা হয়েছে, অন্য মডেল নির্বাচন করুন।`;
  }
  return `${providerName} ত্রুটি (${status}): ${text.substring(0, 150)}`;
}

// 1. Primary: Gemini (Google AI)
export async function callGemini(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof window !== 'undefined' && localStorage.getItem('gemini_key')) || '';
  if (!apiKey) throw new Error('Gemini API Key প্রদান করা হয়নি! Settings এ কি সেট করুন।');

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
  const response = await fetchWithTimeout(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.6
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(parseAPIError(response.status, errText, 'Gemini'));
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini হতে কোনো গ্রহণযোগ্য উত্তর পাওয়া যায়নি।');
  return text;
}

// 2. Fast Fallback: Groq (Llama Model)
export async function callGroq(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || (typeof window !== 'undefined' && localStorage.getItem('groq_key')) || '';
  if (!apiKey) throw new Error('Groq API Key প্রদান করা হয়নি! Settings এ কি সেট করুন।');

  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  const candidateModels = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'];

  let lastErr: Error | null = null;

  for (const modelName of candidateModels) {
    try {
      const response = await fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: 'আপনি Tension Free Science এর সহায়ক শিক্ষক। বিজ্ঞানের প্রশ্নগুলোর উত্তর সহজ বাংলায় দিন।' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.6
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 404 || errText.includes('decommissioned')) {
          console.warn(`Groq model ${modelName} deprecated/404, trying next candidate...`);
          continue;
        }
        throw new Error(parseAPIError(response.status, errText, `Groq (${modelName})`));
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      if (!text) throw new Error(`Groq (${modelName}) হতে ফাঁকা উত্তর এসেছে।`);
      return text;
    } catch (err: any) {
      lastErr = err;
    }
  }

  throw lastErr || new Error('Groq এর সমস্ত ক্যান্ডিডেট মডেল ব্যর্থ হয়েছে।');
}

// 3. Backup Reasoning: DeepSeek
export async function callDeepSeek(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || (typeof window !== 'undefined' && localStorage.getItem('deepseek_key')) || '';
  if (!apiKey) throw new Error('DeepSeek API Key প্রদান করা হয়নি! Settings এ কি সেট করুন।');

  const endpoint = 'https://api.deepseek.com/chat/completions';
  const response = await fetchWithTimeout(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'আপনি Tension Free Science এর বিশেষজ্ঞ শিক্ষক। বিজ্ঞানের উত্তর নির্ভুল বাংলায় ব্যাখ্যা করুন।' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(parseAPIError(response.status, errText, 'DeepSeek'));
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('DeepSeek হতে কোনো উত্তর পাওয়া যায়নি।');
  return text;
}

/**
 * Main AI Query Handler with automatic multi-tier fallback (Gemini -> Groq -> DeepSeek)
 */
export async function askAI(question: string): Promise<string> {
  if (!question || !question.trim()) {
    return 'অনুগ্রহ করে একটি প্রশ্ন লিখুন।';
  }

  const trimmed = question.trim();

  // 1. Try Primary: Gemini
  try {
    const reply = await callGemini(trimmed);
    if (reply) return reply;
  } catch (err: any) {
    console.warn('Gemini failed, switching to Groq...', err?.message);
  }

  // 2. Try Fast Fallback: Groq
  try {
    const reply = await callGroq(trimmed);
    if (reply) return reply;
  } catch (err: any) {
    console.warn('Groq failed, switching to DeepSeek...', err?.message);
  }

  // 3. Try Backup Reasoning: DeepSeek
  try {
    const reply = await callDeepSeek(trimmed);
    if (reply) return reply;
  } catch (err: any) {
    console.warn('DeepSeek failed...', err?.message);
  }

  return 'দুঃখিত, AI সার্ভিস বর্তমানে ব্যস্ত আছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।';
}
