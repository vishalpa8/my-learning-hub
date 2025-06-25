const DEFAULT_MODEL = "mistralai/mistral-small-3.2-24b-instruct:free";

/**
 *
 * @param {string} userMessage - The user's message to send.
 * @param {string} [systemPrompt] - An optional system prompt to guide the AI's behavior.
 * @param {object} [options={}] - Optional parameters for the request.
 * @param {AbortSignal} [options.signal] - An optional AbortSignal to cancel the request.
 * @param {string} [options.model] - The AI model to use for the completion.
 * @returns {Promise<ReadableStreamDefaultReader<Uint8Array>>} A promise that resolves to a reader for the streamed response.
 
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
  try {
    const { signal, model = DEFAULT_MODEL } = options;

    // Call our own secure serverless function instead of the AI API directly.
    const response = await fetch("/.netlify/functions/stream-ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userMessage,
        systemPrompt,
        model,
      }),
      signal, // Pass the abort signal to the fetch request
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "An unknown error occurred.",
      }));
      throw new Error(
        `API request failed with status ${response.status}: ${errorData.error}`
      );
    }

    if (!response.body) {
      throw new Error("The response body is empty.");
    }

    return response.body.getReader();
  } catch (error) {
    if (error.name === "AbortError") {
      throw error; // Re-throw the original error to be handled gracefully by the caller
    }
    console.error("Error communicating with the stream-ai function:", error);
    throw error; // Re-throw the improved error message
  }
}
