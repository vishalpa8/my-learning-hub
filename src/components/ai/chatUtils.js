/**
 * This file contains shared constants and utility functions for the ChatInterface component.
 */

// ===== CONSTANTS =====
export const CONSTANTS = {
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  STREAM_TIMEOUT: 300000,
  COPY_TIMEOUT: 2000,
  MAX_INPUT_LENGTH: 40000,
  MAX_MESSAGE_LENGTH: 50000,
  MAX_TEXTAREA_HEIGHT: 200,
  TYPING_DELAY: 30, // Delay between characters for typewriter effect
  WORD_CHUNK_SIZE: 3, // Number of words to add at once
  SYSTEM_PROMPT:
    "You are a helpful AI assistant focused on learning and education. Provide clear, accurate, and helpful responses.",
  MESSAGES: {
    TIMEOUT_ERROR:
      "Request timed out. Please check your connection and try again.",
    NETWORK_ERROR:
      "Network error occurred. Please check your internet connection.",
    SERVER_ERROR: "Server is currently unavailable. Please try again later.",
    GENERIC_ERROR: "An unexpected error occurred. Please try again.",
    USER_STOPPED: "You stopped the response.",
  },
  MODELS: {
    OPENROUTER: "deepseek/deepseek-chat-v3-0324:free",
    GEMINI: "gemini-1.5-flash-latest",
  },
};

// ===== UTILITIES =====
export const generateId = () => crypto.randomUUID();

export const formatTime = (date) => {
  return date
    .toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();
};

// ===== ERROR HANDLING =====
export const isUserAbortError = (error) => {
  return (
    error.name === "AbortError" ||
    error.name === "APIUserAbortError" ||
    error.message?.includes("Request was aborted") ||
    error.message?.includes("aborted") ||
    error.code === "ABORT_ERR" ||
    error.code === 20
  );
};

export const shouldAutoRetry = (error) => {
  if (isUserAbortError(error)) return false;

  return (
    error.message?.includes("timeout") ||
    error.name === "TimeoutError" ||
    error.message?.includes("network") ||
    error.code === "NETWORK_ERROR" ||
    error.status >= 500 ||
    error.status === 429
  );
};

export const getErrorMessage = (error) => {
  if (isUserAbortError(error)) return CONSTANTS.MESSAGES.USER_STOPPED;
  if (error.message?.includes("timeout") || error.name === "TimeoutError")
    return CONSTANTS.MESSAGES.TIMEOUT_ERROR;
  if (error.message?.includes("network") || error.message?.includes("fetch"))
    return CONSTANTS.MESSAGES.NETWORK_ERROR;
  if (error.status >= 500) return CONSTANTS.MESSAGES.SERVER_ERROR;
  if (error.status === 429)
    return "Rate limit exceeded. Please wait a moment and try again.";
  if (error.status === 401 || error.status === 403)
    return "Authentication failed. Please check your API key.";
  if (error.message?.includes("API key"))
    return "API key configuration error. Please check your settings.";

  return CONSTANTS.MESSAGES.GENERIC_ERROR;
};

// ===== STREAM PARSING =====
export const parseStreamChunks = (chunk) => {
  if (!chunk || typeof chunk !== "string") return "";

  const lines = chunk.split("\n").filter((line) => line.trim());
  const results = [];

  for (const line of lines) {
    try {
      const cleanLine = line.replace(/^data:\s*/, "");
      if (!cleanLine || cleanLine === "[DONE]" || line.startsWith("event:"))
        continue;

      const json = JSON.parse(cleanLine);
      const content = json.choices?.[0]?.delta?.content || "";
      if (content) results.push(content);
    } catch (e) {
      // This is a safe suppression, as some stream events are not valid JSON.
    }
  }

  return results.join("");
};
