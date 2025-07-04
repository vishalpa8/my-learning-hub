import React, {
  useState,
  memo,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useReducer,
} from "react";
import { streamMessage } from "../../hooks/openRouter";
import { streamGeminiMessage } from "../../hooks/gemini";
import { useAIChatHistory } from "../../hooks/useAIChatHistory";
import { useIndexedDb } from "../../hooks/useIndexedDb";

import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import "./ChatInterface.css";
import {
  CONSTANTS,
  generateId,
  formatTime,
  isUserAbortError,
  shouldAutoRetry,
  getErrorMessage,
  parseStreamChunks,
} from "./chatUtils";

/**
 * @typedef {Object} Message
 * @property {string} id - Unique message identifier
 * @property {'user'|'ai'} sender - Message sender type
 * @property {string} text - Message content
 * @property {string} timestamp - Formatted timestamp
 * @property {boolean} [isError] - Whether message is an error
 * @property {boolean} [isEdited] - Whether message was edited
 * @property {boolean} [isStoppedByUser] - Whether response was stopped by user
 * @property {string} [originalPrompt] - Original prompt for retry functionality
 * @property {boolean} [isStreaming] - Whether message is currently streaming
 */

// ===== ENHANCED TYPEWRITER EFFECT =====
const useTypewriterEffect = (
  fullText,
  isStreaming,
  messageId,
  speed = CONSTANTS.TYPING_DELAY
) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Reset when the messageId changes, indicating a new message is being rendered.
    // This is more reliable than trying to guess based on text length.
    setDisplayedText("");
    setCurrentIndex(0);
  }, [messageId]);

  useEffect(() => {
    if (!isStreaming) {
      // When streaming stops, show full text immediately
      setDisplayedText(fullText);
      setCurrentIndex(fullText.length);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (currentIndex < fullText.length) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const newIndex = Math.min(
            prev + CONSTANTS.WORD_CHUNK_SIZE,
            fullText.length
          );
          setDisplayedText(fullText.slice(0, newIndex));

          if (newIndex >= fullText.length) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          return newIndex;
        });
      }, speed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fullText, currentIndex, isStreaming, speed, messageId]);

  return displayedText;
};

// ===== COMPONENTS =====
const LinkRenderer = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" title={href}>
    {children}
  </a>
);
LinkRenderer.propTypes = {
  href: PropTypes.string,
  children: PropTypes.node.isRequired,
};

const ImageRenderer = ({ src, alt }) => (
  <img
    src={src}
    alt={alt}
    style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
    loading="lazy"
  />
);
ImageRenderer.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
};

const TableRenderer = ({ children }) => (
  <div className="table-wrapper" style={{ overflowX: "auto", margin: "1em 0" }}>
    <table>{children}</table>
  </div>
);
TableRenderer.propTypes = {
  children: PropTypes.node.isRequired,
};

const BlockquoteRenderer = ({ children }) => (
  <blockquote className="blockquote-wrapper">{children}</blockquote>
);

BlockquoteRenderer.propTypes = {
  children: PropTypes.node.isRequired,
};

const EnhancedTypingIndicator = ({ isVisible }) => (
  <div
    className={`enhanced-typing-indicator ${isVisible ? "visible" : "hidden"}`}
  >
    <span className="typing-dot"></span>
    <span className="typing-dot"></span>
    <span className="typing-dot"></span>
    <span className="typing-text">AI is thinking...</span>
  </div>
);
EnhancedTypingIndicator.propTypes = {
  isVisible: PropTypes.bool.isRequired,
};

// Model selector component
const ModelSelector = ({ selectedModel, onModelChange, disabled }) => (
  <div className="model-selector">
    <select
      id="model-select"
      value={selectedModel}
      onChange={(e) => onModelChange(e.target.value)}
      disabled={disabled}
    >
      <option value="openrouter">OpenRouter (Deepseek)</option>
      <option value="gemini">Google Gemini</option>
    </select>
  </div>
);
ModelSelector.propTypes = {
  selectedModel: PropTypes.string.isRequired,
  onModelChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

// Separate component for message bubble to avoid hook issues
const MessageBubble = memo(function MessageBubble({
  message,
  isLastUser,
  isLastAi,
  isLastMessage,
  retryCount,
  isLoading,
  onEditMessage,
  onRetryMessage,
  handleCopyCode,
  copiedBlockId,
}) {
  // To adhere to the Rules of Hooks, call useTypewriterEffect unconditionally.
  const typewriterText = useTypewriterEffect(
    message.text,
    message.isStreaming,
    message.id,
    CONSTANTS.TYPING_DELAY
  );

  // Then, use the result of the hook conditionally.
  const displayText =
    message.sender === "ai" && message.isStreaming
      ? typewriterText
      : message.text;
  const markdownComponents = useMemo(
    () => ({
      a: LinkRenderer,
      img: ImageRenderer,
      table: TableRenderer,
      blockquote: BlockquoteRenderer,
      // Down-level headings for better visual hierarchy within the chat bubble.
      // All styling is now handled by ChatInterface.css.
      h1: "h3",
      h2: "h4",
      h3: "h5",
      h4: "h6",
      code: ({ node, inline, className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || "");
        const language = match ? match[1] : "";
        const extractText = (els) => {
          if (typeof els === "string") {
            return els;
          }
          if (Array.isArray(els)) {
            return els.map(extractText).join("");
          }
          if (els && els.props && els.props.children) {
            return extractText(els.props.children);
          }
          return "";
        };
        const codeContent = extractText(children).replace(/\n$/, "");
        // Create a stable, unique ID for the code block.

        const blockId = `${message.id}-${node.position.start.line}`;

        if (!inline && language) {
          return (
            <div className="ai-code-container">
              <div className="ai-code-header">
                <span className="ai-code-lang">{language}</span>
                <button
                  className="copy-button"
                  onClick={() => handleCopyCode(codeContent, blockId)}
                  title="Copy code"
                  aria-label="Copy code to clipboard"
                >
                  {copiedBlockId === blockId ? (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20,6 9,17 4,12"></polyline>
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        ></rect>
                        <path d="m5,9v-2a2,2 0 0,1 2,-2h13a2,2 0 0,1 2,2v13a2,2 0 0,1 -2,2h-2"></path>
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="ai-code-block">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            </div>
          );
        }

        return (
          <code className="inline-code" {...props}>
            {children}
          </code>
        );
      },
    }),
    [handleCopyCode, copiedBlockId, message.id]
  );

  // Don't render AI bubbles that are empty and streaming (thinking state)
  if (message.sender === "ai" && message.isStreaming && !displayText.trim()) {
    return null;
  }

  return (
    <div
      className={`message-bubble ${message.sender} ${
        message.isError ? "error-message" : ""
      } ${isLastMessage ? "last-message" : ""} ${
        message.isStreaming && displayText ? "streaming" : ""
      }`}
      data-stopped={message.isStoppedByUser}
    >
      <div className="message-text">
        {message.sender === "ai" ? (
          <div
            className={
              message.isStreaming && displayText ? "streaming-markdown" : ""
            }
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={markdownComponents}
            >
              {displayText}
            </ReactMarkdown>
          </div>
        ) : (
          displayText
        )}
      </div>

      <div className="message-footer">
        <div className="message-meta-container">
          {/* Show edited indicator for edited messages */}
          {message.isEdited && <span className="edited-indicator">edited</span>}

          {/* Show retry indicator for retried messages */}
          {retryCount > 0 && message.sender === "ai" && isLastAi && (
            <span className="retry-indicator">retry {retryCount}</span>
          )}
          {/* Always show timestamp for both AI and user */}
          {message.timestamp && (
            <span className="timestamp">{message.timestamp}</span>
          )}
        </div>

        <div className="message-actions-container">
          {/* Edit button only for last user message on hover */}
          {isLastUser && !isLoading && (
            <button
              className="action-button edit-button"
              onClick={onEditMessage}
              title="Edit message"
              aria-label="Edit message"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m18 2 4 4-14 14H4v-4L18 2z" />
                <path d="M14.5 5.5 18.5 9.5" />
              </svg>
            </button>
          )}

          {/* Retry button only for last AI message after generation, on hover */}
          {isLastAi &&
            !isLoading &&
            !message.isStreaming &&
            message.originalPrompt && (
              <button
                className="action-button retry-button"
                onClick={() => onRetryMessage(message.id)}
                title="Retry message"
                aria-label="Retry generating this response"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
              </button>
            )}
        </div>
      </div>
    </div>
  );
});

MessageBubble.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    sender: PropTypes.oneOf(["user", "ai"]).isRequired,
    text: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    isError: PropTypes.bool,
    isEdited: PropTypes.bool,
    isStoppedByUser: PropTypes.bool,
    originalPrompt: PropTypes.string,
    isStreaming: PropTypes.bool,
    modelUsed: PropTypes.string,
  }).isRequired,
  isLastUser: PropTypes.bool.isRequired,
  isLastAi: PropTypes.bool.isRequired,
  isLastMessage: PropTypes.bool.isRequired,
  retryCount: PropTypes.number.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onEditMessage: PropTypes.func.isRequired,
  onRetryMessage: PropTypes.func.isRequired,
  handleCopyCode: PropTypes.func.isRequired,
  copiedBlockId: PropTypes.string,
};

// ===== REDUCER FOR STATE MANAGEMENT =====
const initialState = {
  input: "",
  isLoading: false,
  isEditingLastMessage: false,
  retryCount: 0,
  copiedBlockId: null,
  showTypingIndicator: false,
};

function chatReducer(state, action) {
  switch (action.type) {
    case "SET_INPUT":
      return { ...state, input: action.payload };
    case "START_EDIT":
      return { ...state, input: action.payload, isEditingLastMessage: true };
    case "CANCEL_EDIT":
      return { ...state, isEditingLastMessage: false, input: "" };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_SHOW_TYPING_INDICATOR":
      return { ...state, showTypingIndicator: action.payload };
    case "SET_RETRY_COUNT":
      return { ...state, retryCount: action.payload };
    case "SET_COPIED_ID":
      return { ...state, copiedBlockId: action.payload };
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

// ===== MAIN COMPONENT =====
const ChatInterface = () => {
  // State
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const {
    input,
    isLoading,
    copiedBlockId,
    showTypingIndicator,
    isEditingLastMessage,
    retryCount,
  } = state;

  const [messages, appendMessage, setMessages, clearChatHistory] =
    useAIChatHistory();
  const [selectedModel, setSelectedModel] =
    useIndexedDb("selectedModel", "openrouter");

  // Refs
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const textareaRef = useRef(null);
  const copyTimeoutRef = useRef(null);
  const streamTimeoutRef = useRef(null);

  // Find last messages - Updated to identify actual last messages
  const {
    lastUserMessage,
    lastUserMessageIndex,
    lastAiMessageIndex,
    isLastUserMessage,
    isLastAiMessage,
  } = useMemo(() => {
    let lastUser = null,
      lastAi = null,
      lastUserIndex = -1,
      lastAiIndex = -1;

    for (let i = messages.length - 1; i >= 0; i--) {
      if (!lastAi && messages[i].sender === "ai") {
        lastAi = messages[i];
        lastAiIndex = i;
      }
      if (!lastUser && messages[i].sender === "user") {
        lastUser = messages[i];
        lastUserIndex = i;
      }
      if (lastAi && lastUser) break;
    }

    // Create lookup functions for determining last messages
    const isLastUserMessage = (index) => index === lastUserIndex;
    const isLastAiMessage = (index) => index === lastAiIndex;

    return {
      lastUserMessage: lastUser,
      lastAiMessage: lastAi,
      lastUserMessageIndex: lastUserIndex,
      lastAiMessageIndex: lastAiIndex,
      isLastUserMessage,
      isLastAiMessage,
    };
  }, [messages]);

  // ===== EFFECTS =====
  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showTypingIndicator]);

  // Auto-resize textarea and input validation
  useEffect(() => {
    if (textareaRef.current) {
      if (input.length > CONSTANTS.MAX_INPUT_LENGTH) {
        // Keep validation
        dispatch({
          type: "SET_INPUT",
          payload: input.substring(0, CONSTANTS.MAX_INPUT_LENGTH),
        });
        return;
      }

      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(
        textareaRef.current.scrollHeight,
        CONSTANTS.MAX_TEXTAREA_HEIGHT
      );
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  // Reset edit mode if input is cleared
  useEffect(() => {
    if (input.trim() === "" && isEditingLastMessage) {
      dispatch({ type: "CANCEL_EDIT" });
    }
  }, [input, isEditingLastMessage]);

  // Cleanup
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      [copyTimeoutRef, streamTimeoutRef].forEach((ref) => {
        if (ref.current) clearTimeout(ref.current);
      });
    };
  }, []);

  // ===== ENHANCED STREAMING LOGIC =====
  const executeStream = useCallback(
    async (prompt, placeholderId, modelToUse = selectedModel, attempt = 0) => {
      dispatch({
        type: "SET_LOADING",
        payload: true,
      });
      dispatch({
        type: "SET_SHOW_TYPING_INDICATOR",
        payload: true,
      });
      dispatch({
        type: "SET_RETRY_COUNT",
        payload: attempt,
      });

      // Update the placeholder message with streaming status and model used
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === placeholderId
            ? { ...msg, isStreaming: true, modelUsed: modelToUse }
            : msg
        )
      );

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Set timeout
      if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current);
      streamTimeoutRef.current = setTimeout(() => {
        controller.abort();
      }, CONSTANTS.STREAM_TIMEOUT);

      let hasReceivedAnyContent = false;
      let accumulatedContent = "";

      try {
        // Choose the appropriate streaming function based on the model
        const streamFunction =
          modelToUse === "gemini" ? streamGeminiMessage : streamMessage;
        const modelOption =
          modelToUse === "gemini"
            ? CONSTANTS.MODELS.GEMINI
            : CONSTANTS.MODELS.OPENROUTER;

        const reader = await streamFunction(prompt, CONSTANTS.SYSTEM_PROMPT, {
          signal: controller.signal,
          model: modelOption,
        });

        const decoder = new TextDecoder();

        while (true) { // eslint-disable-line no-constant-condition
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const content = parseStreamChunks(chunk);

          if (content) {
            hasReceivedAnyContent = true;
            accumulatedContent += content;

            let currentText = accumulatedContent;
            if (currentText.length > CONSTANTS.MAX_MESSAGE_LENGTH) {
              currentText =
                currentText.substring(0, CONSTANTS.MAX_MESSAGE_LENGTH) +
                "\n\n... [Message truncated due to length]";
            }

            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.id === placeholderId
                  ? { ...msg, text: currentText, isStreaming: true }
                  : msg
              )
            );

            if (currentText.length >= CONSTANTS.MAX_MESSAGE_LENGTH) {
              break; // Stop reading stream if truncated
            }
          }
        }

        if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current);

        if (hasReceivedAnyContent) {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === placeholderId
                ? {
                    ...msg,
                    timestamp: formatTime(new Date()),
                    originalPrompt: prompt,
                    isStreaming: false,
                  }
                : msg
            )
          );
          dispatch({ type: "SET_LOADING", payload: false });
          dispatch({ type: "SET_SHOW_TYPING_INDICATOR", payload: false });
          dispatch({ type: "SET_RETRY_COUNT", payload: 0 });
          abortControllerRef.current = null;
          return;
        } else {
          throw new Error("No content received from stream");
        }
      } catch (error) {
        // Essential error logging for debugging
        console.error("Stream error:", error.name, error.message);

        if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current);

        // If we received content before error, treat as success
        if (hasReceivedAnyContent) {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === placeholderId
                ? {
                    ...msg,
                    timestamp: formatTime(new Date()),
                    originalPrompt: prompt,
                    isStreaming: false,
                  }
                : msg
            )
          );
          dispatch({ type: "SET_LOADING", payload: false });
          dispatch({ type: "SET_SHOW_TYPING_INDICATOR", payload: false });
          dispatch({ type: "SET_RETRY_COUNT", payload: 0 });
          abortControllerRef.current = null;
          return;
        }

        // Handle user abort
        if (isUserAbortError(error)) {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === placeholderId
                ? {
                    ...msg,
                    text: CONSTANTS.MESSAGES.USER_STOPPED,
                    timestamp: formatTime(new Date()),
                    isError: true,
                    isStoppedByUser: true,
                    originalPrompt: prompt,
                    isStreaming: false,
                  }
                : msg
            )
          );
          dispatch({ type: "SET_LOADING", payload: false });
          dispatch({ type: "SET_SHOW_TYPING_INDICATOR", payload: false });
          dispatch({ type: "SET_RETRY_COUNT", payload: 0 });
          abortControllerRef.current = null;
          return;
        }

        // Handle retryable errors
        if (shouldAutoRetry(error) && attempt < CONSTANTS.RETRY_ATTEMPTS - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, CONSTANTS.RETRY_DELAY * (attempt + 1))
          );

          if (abortControllerRef.current === controller) {
            executeStream(prompt, placeholderId, modelToUse, attempt + 1);
          }
          return;
        }

        // Final error
        const errorMessage = getErrorMessage(error);

        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === placeholderId
              ? {
                  ...msg,
                  text: errorMessage,
                  timestamp: formatTime(new Date()),
                  isError: true,
                  originalPrompt: prompt,
                  isStreaming: false,
                }
              : msg
          )
        );
        dispatch({ type: "SET_LOADING", payload: false });
        dispatch({ type: "SET_SHOW_TYPING_INDICATOR", payload: false });
        dispatch({ type: "SET_RETRY_COUNT", payload: 0 });
        abortControllerRef.current = null;
      }
    },
    [selectedModel, setMessages, dispatch] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ===== HANDLERS =====
  const handleCopyCode = useCallback(async (code, blockId) => {
    try {
      await navigator.clipboard.writeText(code);
      dispatch({ type: "SET_COPIED_ID", payload: blockId });
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(
        () => dispatch({ type: "SET_COPIED_ID", payload: null }),
        CONSTANTS.COPY_TIMEOUT
      );
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  }, []);

  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current);
    dispatch({ type: "SET_LOADING", payload: false });
    dispatch({ type: "SET_SHOW_TYPING_INDICATOR", payload: false });
  }, []);

  const handleEditLastMessage = useCallback(() => {
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((m) => m.sender === "user");
    if (!lastUserMessage || isLoading) return;

    dispatch({ type: "START_EDIT", payload: lastUserMessage.text });
    textareaRef.current?.focus();
  }, [messages, isLoading]);

  const handleRetryMessage = useCallback(
    async (messageId) => {
      if (isLoading) return;

      const messageToRetryIndex = messages.findIndex(
        (msg) => msg.id === messageId
      );
      if (messageToRetryIndex === -1) return;

      const messageToRetry = messages[messageToRetryIndex];
      if (!messageToRetry || !messageToRetry.originalPrompt) return;

      // Create a new placeholder to replace the old message.
      // This ensures a clean state and consistent behavior with new messages.
      const newAiPlaceholder = {
        id: generateId(),
        sender: "ai",
        text: "",
        timestamp: "",
        isError: false,
        isStreaming: false, // Will be set to true by executeStream
        originalPrompt: messageToRetry.originalPrompt,
        modelUsed: selectedModel,
      };

      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        newMessages[messageToRetryIndex] = newAiPlaceholder;
        return newMessages;
      });

      // Execute the stream with the new placeholder's ID
      dispatch({
        type: "SET_LOADING",
        payload: true,
      });
      dispatch({
        type: "SET_SHOW_TYPING_INDICATOR",
        payload: true,
      });
      dispatch({
        type: "SET_RETRY_COUNT",
        payload: 0,
      });
      executeStream(
        messageToRetry.originalPrompt,
        newAiPlaceholder.id,
        selectedModel
      );
    },
    [isLoading, messages, selectedModel, setMessages, dispatch, executeStream]
  );

  const handleModelChange = useCallback(
    (model) => {
      setSelectedModel(model);
    },
    [setSelectedModel]
  );

  const handleNewChat = useCallback(() => {
    clearChatHistory();
    dispatch({ type: "RESET" });
  }, [clearChatHistory, dispatch]);

  const submitInput = useCallback(() => {
    const trimmedInput = input.trim();
    if (
      !trimmedInput ||
      isLoading ||
      trimmedInput.length > CONSTANTS.MAX_INPUT_LENGTH ||
      abortControllerRef.current
    )
      return;

    const currentInput = trimmedInput;
    dispatch({ type: "SET_INPUT", payload: "" });

    // Handle editing last message
    if (isEditingLastMessage && lastUserMessage) {
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        newMessages[lastUserMessageIndex] = {
          ...newMessages[lastUserMessageIndex],
          text: currentInput,
          isEdited: true,
          timestamp: formatTime(new Date()),
        };

        if (lastAiMessageIndex > lastUserMessageIndex) {
          newMessages.splice(lastAiMessageIndex, 1);
        }
        return newMessages;
      });

      dispatch({ type: "CANCEL_EDIT" });

      const aiMessagePlaceholder = {
        id: generateId(),
        sender: "ai",
        text: "",
        timestamp: "",
        isError: false,
        isStreaming: false, // Will be set to true by executeStream
        originalPrompt: currentInput,
        modelUsed: selectedModel,
      };

      appendMessage(aiMessagePlaceholder);
      executeStream(currentInput, aiMessagePlaceholder.id);
      return;
    }

    // Handle new message
    const userMessage = {
      id: generateId(),
      sender: "user",
      text: currentInput,
      timestamp: formatTime(new Date()),
      isError: false,
    };

    const aiMessagePlaceholder = {
      id: generateId(),
      sender: "ai",
      text: "",
      timestamp: "",
      isError: false,
      isStreaming: false,
      originalPrompt: currentInput,
      modelUsed: selectedModel,
    };

    appendMessage(userMessage);
    appendMessage(aiMessagePlaceholder);
    executeStream(currentInput, aiMessagePlaceholder.id);
  }, [
    input,
    isLoading,
    isEditingLastMessage,
    lastUserMessage,
    lastUserMessageIndex,
    lastAiMessageIndex,
    executeStream,
    selectedModel,
    appendMessage,
    setMessages,
    dispatch,
  ]);

  const handleInputKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submitInput();
      }
    },
    [submitInput]
  );

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {messages.map((message, index) => {
          const isLastUser = isLastUserMessage(index);
          const isLastAi = isLastAiMessage(index);
          const isLastMessage = index === messages.length - 1;

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isLastUser={isLastUser}
              isLastAi={isLastAi}
              isLastMessage={isLastMessage}
              retryCount={retryCount}
              isLoading={isLoading}
              onEditMessage={handleEditLastMessage}
              onRetryMessage={handleRetryMessage}
              handleCopyCode={handleCopyCode}
              copiedBlockId={copiedBlockId}
            />
          );
        })}

        {showTypingIndicator && <EnhancedTypingIndicator isVisible={true} />}
        <div ref={messagesEndRef} />
      </div>

      <form
        className="chat-input-form"
        onSubmit={(e) => {
          e.preventDefault();
          submitInput();
        }}
      >
        <div className="chat-input-header">
          <div className="chat-controls-top">
            <div className="model-selection-area">
              <label htmlFor="model-select" className="model-select-label">
                Select Model:
              </label>
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={handleModelChange}
                disabled={isLoading}
              />
            </div>
            <button
              type="button"
              onClick={handleNewChat}
              className="new-chat-button"
              disabled={isLoading}
              title="Start a new chat"
              aria-label="Start a new chat"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New Chat
            </button>
          </div>
        </div>

        <div className="chat-input-controls">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) =>
              dispatch({ type: "SET_INPUT", payload: e.target.value })
            }
            onKeyDown={handleInputKeyDown}
            placeholder={isLoading ? "AI is responding..." : "Type your message here..."}
            className={isEditingLastMessage ? "editing-mode" : ""}
            maxLength={CONSTANTS.MAX_INPUT_LENGTH}
            aria-label="Message input"
          />

          {isLoading ? (
            <button
              type="button"
              onClick={handleStopGeneration}
              className="stop-button"
              title="Stop generation"
              aria-label="Stop generation"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="6" y="6" width="12" height="12"></rect>
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={
                isLoading ||
                !input.trim() ||
                input.length > CONSTANTS.MAX_INPUT_LENGTH
              }
              title={isEditingLastMessage ? "Update message" : "Send message"}
              aria-label={
                isEditingLastMessage ? "Update message" : "Send message"
              }
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
              </svg>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
