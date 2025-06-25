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
  if (!userMessage || typeof userMessage !== "string" || !userMessage.trim()) {
    throw new Error("User message must be a non-empty string.");
  }

  if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
    throw new Error(
      "VITE_OPENROUTER_API_KEY is not set in your environment variables."
    );
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
    if (error.name === "AbortError" || error.name === "APIUserAbortError") {
      throw error; // Re-throw the original error to be handled gracefully by the caller
    }
    console.error("Error communicating directly with OpenRouter API:", error);
    throw new Error(
      `Failed to get response from OpenRouter. Original Error: ${error.message}`
    );
  }
}
