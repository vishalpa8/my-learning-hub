import { OpenAI } from "openai";

const DEFAULT_MODEL = "deepseek/deepseek-chat-v3-0324:free";

const openai = new OpenAI({
  // IMPORTANT: This is the insecure part. The API key is exposed in the browser.
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true, // This flag acknowledges the security risk.
  defaultHeaders: {
    "HTTP-Referer": import.meta.env.VITE_SITE_URL || "",
    "X-Title": import.meta.env.VITE_SITE_NAME || "",
  },
});

/**
 *
 * @param {string} userMessage - The user's message to send.
 * @param {string} [systemPrompt] - An optional system prompt to guide the AI's behavior.
 * @param {object} [options={}] - Optional parameters for the request.
 * @param {AbortSignal} [options.signal] - An optional AbortSignal to cancel the request.
 * @param {string} [options.model] - The AI model to use for the completion.
 * @returns {Promise<ReadableStreamDefaultReader>} A promise that resolves to a reader for the streamed response.
 * @throws {Error} If the user message is invalid or the API call fails.
 */
export async function streamMessage(
  userMessage,
  systemPrompt = "",
  options = {}
) {
  // Fail fast on missing API key
  if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
    throw new Error(
      "VITE_OPENROUTER_API_KEY environment variable is required. Please check your .env file."
    );
  }

  if (!userMessage || typeof userMessage !== "string" || !userMessage.trim()) {
    throw new Error("User message must be a non-empty string.");
  }

  if (options && typeof options !== 'object') {
    throw new Error("Options must be an object.");
  }

  try {
    const { signal, model = DEFAULT_MODEL } = options;

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: userMessage });

    const stream = await openai.chat.completions.create(
      {
        model,
        messages,
        stream: true,
        temperature: 0.7,
        top_p: 1,
      },
      { signal: signal }
    );

    return stream.toReadableStream().getReader();
  } catch (error) {
    // Handle user-initiated aborts silently (no error logging)
    if (error.name === "AbortError" || error.name === "APIUserAbortError") {
      // Just re-throw the original error as-is to preserve error type
      throw error;
    }
    
    // Log only actual system/network errors
    console.error("Error communicating directly with OpenRouter API:", error);
    
    // Re-throw the original error with enhanced properties, preserving the original error type
    const enhancedError = new Error(error.message);
    enhancedError.name = error.name;
    enhancedError.status = error.status;
    enhancedError.code = error.code;
    enhancedError.originalError = error; // Keep reference to original
    throw enhancedError;
  }
}