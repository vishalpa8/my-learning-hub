import { OpenAI } from "openai";

// This function runs on the server, so your API key is safe.
// It reads the key from Netlify's secure environment variables.
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY, // Note: No "VITE_" prefix
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "",
    "X-Title": process.env.SITE_NAME || "",
  },
});

const DEFAULT_MODEL = "deepseek/deepseek-chat-v3-0324:free";

export const handler = async (event) => {
  // Only allow POST requests for this endpoint
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const {
      userMessage,
      systemPrompt,
      model = DEFAULT_MODEL,
    } = JSON.parse(event.body);

    if (
      !userMessage ||
      typeof userMessage !== "string" ||
      !userMessage.trim()
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "User message must be a non-empty string.",
        }),
      };
    }

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: userMessage });

    const stream = await openai.chat.completions.create({
      model,
      messages,
      stream: true,
      temperature: 0.7,
      top_p: 1,
    });

    // Netlify Functions support streaming responses.
    // We forward the stream from the AI API directly to our client.
    return {
      statusCode: 200,
      body: stream.toReadableStream(),
    };
  } catch (error) {
    console.error("Error in stream-ai function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: `Failed to get response from AI. ${error.message}`,
      }),
    };
  }
};
