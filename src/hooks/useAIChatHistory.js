import { useState, useEffect, useCallback } from "react";
import { AI_CHAT_HISTORY_KEY } from "../constants/localIndexedDbKeys";

import { v4 as uuidv4 } from "uuid";

const initialChat = [
  {
    id: uuidv4(), // Simple ID for initial message
    sender: "ai",
    text: "Hello! How can I help you with your learning today?",
    timestamp: new Date()
      .toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase(),
    isError: false,
    isStreaming: false,
  },
];

/**
 * Custom hook to manage the AI chat history in sessionStorage.
 * History is cleared when the session ends (browser tab is closed).
 * @returns {[Array<Object>, (message: Object) => void, (history: Array<Object>) => void, boolean, Error]}
 *          [chatHistory, appendMessage, setChatHistory, loading, error]
 */
export function useAIChatHistory() {
  const [chatHistory, setChatHistoryState] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const storedHistory = sessionStorage.getItem(AI_CHAT_HISTORY_KEY);
        if (storedHistory) {
          const parsedHistory = JSON.parse(storedHistory);
          if (parsedHistory.length > 0) {
            return parsedHistory;
          }
        }
      } catch (error) {
        console.error(
          "Error parsing chat history from sessionStorage during initialization:",
          error
        );
      }
    }
    return initialChat;
  });

  // Effect to save chat history to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handler = setTimeout(() => {
      try {
        sessionStorage.setItem(
          AI_CHAT_HISTORY_KEY,
          JSON.stringify(chatHistory)
        );
      } catch (error) {
        console.error("Error saving chat history to sessionStorage:", error);
      }
    }, 300); // Debounce for 300ms

    return () => {
      clearTimeout(handler);
    };
  }, [chatHistory]);

  /**
   * Appends a new message to the chat history.
   * @param {Object} message - The message object to append.
   */
  const appendMessage = useCallback((message) => {
    setChatHistoryState((prevHistory) => [...prevHistory, message]);
  }, []);

  /**
   * Sets the entire chat history.
   * @param {Array<Object> | Function} newHistory - The new history array or a function to update it.
   */
  const setChatHistory = useCallback((newHistory) => {
    setChatHistoryState(newHistory);
  }, []);

  // sessionStorage operations are synchronous, so loading is always false and error is null
  /**
   * Clears the entire chat history and resets to the initial state.
   */
  const clearChatHistory = useCallback(() => {
    setChatHistoryState(initialChat);
  }, []);

  return [
    chatHistory,
    appendMessage,
    setChatHistory,
    clearChatHistory,
    false,
    null,
  ];
}
