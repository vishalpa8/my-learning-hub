import { GoogleGenAI } from "@google/genai";

/**
 * Gemini AI model for text generation.
 * Using a singleton pattern to avoid re-initializing the client on every call.
 * @type {import("@google/genai").GoogleGenAI | null}
 */
let geminiAI = null;

/**
 * Initialize the Gemini AI model with the API key from environment variables.
 */
function initGemini() {
  if (!geminiAI && import.meta.env.VITE_GEMINI_API_KEY) {
    try {
      geminiAI = new GoogleGenAI({
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
      });
    } catch (error) {
      console.error(
        "Failed to initialize GoogleGenAI. Please check your API key.",
        error
      );
    }
  }
}

// Use a valid and recent model. "gemini-2.5-flash" is not a valid model name.
const DEFAULT_MODEL = "gemini-1.5-flash-latest";

/**
 * Stream a response from the Gemini AI model.
 * This function is designed to be a drop-in replacement for the OpenRouter stream,
 * by formatting the output as a Server-Sent Event (SSE) stream that the UI expects.
 *
 * @param {string} userMessage - The user's message to send.
 * @param {string} [systemPrompt=""] - An optional system prompt to guide the AI's behavior.
 * @param {object} [options={}] - Optional parameters for the request.
 * @param {AbortSignal} [options.signal] - An optional AbortSignal to cancel the request.
 * @param {string} [options.model] - The Gemini model to use.
 * @returns {Promise<ReadableStreamDefaultReader>} A promise that resolves to a reader for the streamed response.
 * @throws {Error} If the user message is invalid or the API call fails.
 */
export async function streamGeminiMessage(
  userMessage,
  systemPrompt = "",
  options = {}
) {
  // Lazily initialize the Gemini client on the first call.
  initGemini();

  // Fail fast if the client is not initialized (e.g., missing or invalid API key).
  if (!geminiAI) {
    throw new Error(
      "Gemini client not initialized. Please ensure VITE_GEMINI_API_KEY is set correctly in your .env file."
    );
  }

  if (!userMessage || typeof userMessage !== "string" || !userMessage.trim()) {
    throw new Error("User message must be a non-empty string.");
  }

  if (options && typeof options !== "object") {
    throw new Error("Options must be an object.");
  }

  try {
    const { signal, model = DEFAULT_MODEL } = options;

    // Get the generative model instance. System instructions are passed here.
    const contents = [{ role: "user", parts: [{ text: userMessage }] }];

    const generationConfig = {
      temperature: 0.7,
      topP: 1.0,
      topK: 32,
    };

    const safetySettings = [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_ONLY_HIGH",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_ONLY_HIGH",
      },
    ];

    // Start the stream generation directly using the `models` property.
    // This avoids the `getGenerativeModel is not a function` error by using the
    // primary method shown in the SDK's documentation.
    const streamResult = await geminiAI.models.generateContentStream({
      model,
      contents,
      systemInstruction: systemPrompt,
      generationConfig,
      safetySettings,
    });

    // Adapt the SDK's async generator to a browser-standard ReadableStream.
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const abortHandler = () => {
          // This error will be caught by the try/catch block below
          // and will terminate the stream gracefully.
          controller.error(
            new DOMException("The user aborted a request.", "AbortError")
          );
        };

        // Listen for the abort signal to cancel the stream.
        signal?.addEventListener("abort", abortHandler, { once: true });

        try {
          // The result from the SDK contains a `stream` which is an async generator.
          for await (const chunk of streamResult) {
            const text = chunk.text();
            if (text) {
              // Format the chunk to match the structure expected by the UI.
              const formattedChunk = JSON.stringify({
                choices: [{ delta: { content: text } }],
              });
              controller.enqueue(encoder.encode(`data: ${formattedChunk}\n\n`));
            }
          }
          // Signal the end of the stream to the client.
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          // If an error occurs (including abort), propagate it to the stream consumer.
          controller.error(error);
        } finally {
          // Clean up the event listener to prevent memory leaks.
          signal?.removeEventListener("abort", abortHandler);
        }
      },
    });

    return readableStream.getReader();
  } catch (error) {
    const isAbortError =
      error.name === "AbortError" || error.message?.includes("aborted");

    if (isAbortError) {
      throw error; // Re-throw abort errors as-is for the UI to handle.
    }

    console.error("Error communicating with Gemini API:", error);

    // Create a more informative error object for other failures.
    const enhancedError = new Error(
      error.message || "Unknown Gemini API error"
    );
    Object.assign(enhancedError, {
      name: error.name,
      status: error.status,
      code: error.code,
      originalError: error,
    });
    throw enhancedError;
  }
}
