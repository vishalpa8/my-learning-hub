import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { streamMessage } from "../../hooks/openRouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import "./ChatInterface.css";

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

// ===== CONSTANTS =====
const CONSTANTS = {
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  STREAM_TIMEOUT: 30000,
  COPY_TIMEOUT: 2000,
  MAX_INPUT_LENGTH: 4000,
  MAX_MESSAGE_LENGTH: 50000,
  MAX_TEXTAREA_HEIGHT: 200,
  TYPING_DELAY: 30, // Delay between characters for typewriter effect
  WORD_CHUNK_SIZE: 3, // Number of words to add at once
  SYSTEM_PROMPT: "You are a helpful AI assistant focused on learning and education. Provide clear, accurate, and helpful responses.",
  MESSAGES: {
    TIMEOUT_ERROR: "Request timed out. Please check your connection and try again.",
    NETWORK_ERROR: "Network error occurred. Please check your internet connection.",
    SERVER_ERROR: "Server is currently unavailable. Please try again later.",
    GENERIC_ERROR: "An unexpected error occurred. Please try again.",
    USER_STOPPED: "You stopped the response.",
  },
};

// ===== UTILITIES =====
const generateId = () => crypto.randomUUID();

const formatTime = (date) => {
  return date
    .toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();
};

// ===== ERROR HANDLING =====
const isUserAbortError = (error) => {
  return (
    error.name === "AbortError" || 
    error.name === "APIUserAbortError" ||
    error.message?.includes("Request was aborted") ||
    error.message?.includes("aborted") ||
    error.code === "ABORT_ERR" ||
    error.code === 20
  );
};

const shouldAutoRetry = (error) => {
  if (isUserAbortError(error)) return false;
  
  return (
    error.message?.includes('timeout') || 
    error.name === 'TimeoutError' ||
    error.message?.includes('network') || 
    error.code === 'NETWORK_ERROR' ||
    error.status >= 500 ||
    error.status === 429
  );
};

const getErrorMessage = (error) => {
  if (isUserAbortError(error)) return CONSTANTS.MESSAGES.USER_STOPPED;
  if (error.message?.includes('timeout') || error.name === 'TimeoutError') return CONSTANTS.MESSAGES.TIMEOUT_ERROR;
  if (error.message?.includes('network') || error.message?.includes('fetch')) return CONSTANTS.MESSAGES.NETWORK_ERROR;
  if (error.status >= 500) return CONSTANTS.MESSAGES.SERVER_ERROR;
  if (error.status === 429) return "Rate limit exceeded. Please wait a moment and try again.";
  if (error.status === 401 || error.status === 403) return "Authentication failed. Please check your API key.";
  if (error.message?.includes('API key')) return "API key configuration error. Please check your settings.";
  
  return CONSTANTS.MESSAGES.GENERIC_ERROR;
};

// ===== STREAM PARSING =====
const parseStreamChunks = (chunk) => {
  if (!chunk || typeof chunk !== 'string') return '';

  const lines = chunk.split("\n").filter((line) => line.trim());
  const results = [];

  for (const line of lines) {
    try {
      const cleanLine = line.replace(/^data:\s*/, "");
      if (!cleanLine || cleanLine === "[DONE]" || line.startsWith("event:")) continue;

      const json = JSON.parse(cleanLine);
      const content = json.choices?.[0]?.delta?.content || "";
      if (content) results.push(content);
    } catch (e) {
      // Only warn for actual parsing issues, not expected stream markers
      if (line.trim() && !line.startsWith("data:") && !line.startsWith("event:") && !line.includes(":")) {
        console.warn("Failed to parse stream chunk:", line);
      }
    }
  }

  return results.join("");
};

// ===== ENHANCED TYPEWRITER EFFECT =====
const useTypewriterEffect = (fullText, isStreaming, speed = CONSTANTS.TYPING_DELAY) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

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
        setCurrentIndex(prev => {
          const newIndex = Math.min(prev + CONSTANTS.WORD_CHUNK_SIZE, fullText.length);
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
  }, [fullText, currentIndex, isStreaming, speed]);

  // Reset when fullText changes significantly (new content)
  useEffect(() => {
    if (fullText.length < displayedText.length) {
      setDisplayedText("");
      setCurrentIndex(0);
    }
  }, [fullText.length, displayedText.length]);

  return displayedText;
};

// ===== COMPONENTS =====
const LinkRenderer = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" title={href}>
    {children}
  </a>
);

const EnhancedTypingIndicator = ({ isVisible }) => (
  <div className={`enhanced-typing-indicator ${isVisible ? 'visible' : 'hidden'}`}>
    <span className="typing-dot"></span>
    <span className="typing-dot"></span>
    <span className="typing-dot"></span>
    <span className="typing-text">AI is thinking...</span>
  </div>
);

// Separate component for message bubble to avoid hook issues
const MessageBubble = ({ message, index, isLastUser, isLastAi, isLastMessage, markdownComponents, retryCount, isLoading, onEditMessage, onRetryMessage }) => {
  // Use typewriter effect only for streaming AI messages
  const displayText = message.sender === "ai" && message.isStreaming 
    ? useTypewriterEffect(message.text, message.isStreaming) 
    : message.text;

  // Don't render AI bubbles that are empty and streaming (thinking state)
  if (message.sender === "ai" && message.isStreaming && !displayText.trim()) {
    return null;
  }

  return (
    <div
      className={`message-bubble ${message.sender} ${message.isError ? 'error-message' : ''} ${isLastMessage ? 'last-message' : ''}`}
      data-stopped={message.isStoppedByUser}
    >
      <div className="message-text">
        {message.sender === "ai" ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={markdownComponents}
          >
            {displayText}
          </ReactMarkdown>
        ) : (
          displayText
        )}
      </div>

      <div className="message-footer">
        <div className="message-meta-container">
          
          {/* Show edited indicator for edited messages */}
          {message.isEdited && (
            <span className="edited-indicator">edited</span>
          )}
          
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
                <path d="m18 2 4 4-14 14H4v-4L18 2z"/>
                <path d="M14.5 5.5 18.5 9.5"/>
              </svg>
            </button>
          )}

          {/* Retry button only for last AI message after generation, on hover */}
          {isLastAi && !isLoading && !message.isStreaming && message.originalPrompt && (
            <button
              className="action-button retry-button"
              onClick={() => onRetryMessage(message.id)}
              title="Retry message"
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
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M3 21v-5h5"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== MAIN COMPONENT =====
const ChatInterface = () => {
  // State
  const [messages, setMessages] = useState([
    {
      id: generateId(),
      sender: "ai",
      text: "Hello! How can I help you with your learning today?",
      timestamp: formatTime(new Date()),
      isError: false,
      isStreaming: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedBlockId, setCopiedBlockId] = useState(null);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [isEditingLastMessage, setIsEditingLastMessage] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Refs
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const textareaRef = useRef(null);
  const copyTimeoutRef = useRef(null);
  const streamTimeoutRef = useRef(null);

  // Find last messages - Updated to identify actual last messages
  const { lastUserMessage, lastAiMessage, lastUserMessageIndex, lastAiMessageIndex, isLastUserMessage, isLastAiMessage } = useMemo(() => {
    let lastUser = null, lastAi = null, lastUserIndex = -1, lastAiIndex = -1;

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
      isLastAiMessage
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
        setInput(input.substring(0, CONSTANTS.MAX_INPUT_LENGTH));
        return;
      }

      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, CONSTANTS.MAX_TEXTAREA_HEIGHT);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  // Reset edit mode if input is cleared
  useEffect(() => {
    if (input.trim() === "" && isEditingLastMessage) {
      setIsEditingLastMessage(false);
    }
  }, [input, isEditingLastMessage]);

  // Cleanup
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      [copyTimeoutRef, streamTimeoutRef].forEach(ref => {
        if (ref.current) clearTimeout(ref.current);
      });
    };
  }, []);

  // ===== HANDLERS =====
  const updateMessage = useCallback((messageId, updates) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg)));
  }, []);

  const handleCopyCode = useCallback(async (code, blockId) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedBlockId(blockId);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopiedBlockId(null), CONSTANTS.COPY_TIMEOUT);
    } catch (err) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedBlockId(blockId);
        copyTimeoutRef.current = setTimeout(() => setCopiedBlockId(null), CONSTANTS.COPY_TIMEOUT);
      } catch (fallbackErr) {
        console.error("Failed to copy code:", fallbackErr);
      }
    }
  }, []);

  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current);

    // Stop streaming on current message
    setMessages(prev => prev.map(msg => 
      msg.isStreaming ? { ...msg, isStreaming: false } : msg
    ));

    setIsLoading(false);
    setShowTypingIndicator(false);
    setRetryCount(0);
  }, []);

  const handleEditLastMessage = useCallback(() => {
    if (isLoading || !lastUserMessage) return;

    setInput(lastUserMessage.text);
    setIsEditingLastMessage(true);
    textareaRef.current?.focus();
  }, [isLoading, lastUserMessage]);

  const handleRetryMessage = useCallback(async (messageId) => {
    if (isLoading) return;

    const messageToRetry = messages.find(msg => msg.id === messageId);
    if (!messageToRetry || !messageToRetry.originalPrompt) return;

    updateMessage(messageId, {
      text: "",
      timestamp: "",
      isError: false,
      isStoppedByUser: false,
      isStreaming: true,
      originalPrompt: messageToRetry.originalPrompt
    });

    executeStream(messageToRetry.originalPrompt, messageId);
  }, [isLoading, messages, updateMessage]);

  // ===== ENHANCED STREAMING LOGIC =====
  const executeStream = useCallback(async (prompt, placeholderId, attempt = 0) => {
    setIsLoading(true);
    setShowTypingIndicator(true);
    setRetryCount(attempt);

    // Mark message as streaming
    updateMessage(placeholderId, { isStreaming: true });

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
      const reader = await streamMessage(prompt, CONSTANTS.SYSTEM_PROMPT, { signal: controller.signal });
      const decoder = new TextDecoder();
      let messageLength = 0;

      // Hide typing indicator once we start receiving content
      let hasHiddenTyping = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const content = parseStreamChunks(chunk);

        if (content) {
          hasReceivedAnyContent = true;
          accumulatedContent += content;
          
          // Hide typing indicator on first content
          if (!hasHiddenTyping) {
            setShowTypingIndicator(false);
            hasHiddenTyping = true;
          }

          setMessages((prevMessages) =>
            prevMessages.map((msg) => {
              if (msg.id === placeholderId) {
                const currentText = accumulatedContent;
                messageLength = currentText.length;

                if (messageLength > CONSTANTS.MAX_MESSAGE_LENGTH) {
                  const truncatedText = currentText.substring(0, CONSTANTS.MAX_MESSAGE_LENGTH) + 
                    "\n\n... [Message truncated due to length]";
                  return { ...msg, text: truncatedText, isStreaming: true };
                }

                return { ...msg, text: currentText, isStreaming: true };
              }
              return msg;
            })
          );
        }
      }

      if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current);

      if (hasReceivedAnyContent) {
        updateMessage(placeholderId, {
          timestamp: formatTime(new Date()),
          isError: false,
          isStreaming: false,
          originalPrompt: prompt
        });
        
        // Reset states
        setIsLoading(false);
        setShowTypingIndicator(false);
        setRetryCount(0);
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
        updateMessage(placeholderId, {
          timestamp: formatTime(new Date()),
          isError: false,
          isStreaming: false,
          originalPrompt: prompt
        });
        
        setIsLoading(false);
        setShowTypingIndicator(false);
        setRetryCount(0);
        abortControllerRef.current = null;
        return;
      }

      // Handle user abort
      if (isUserAbortError(error)) {
        updateMessage(placeholderId, {
          text: CONSTANTS.MESSAGES.USER_STOPPED,
          timestamp: formatTime(new Date()),
          isError: true,
          isStoppedByUser: true,
          isStreaming: false,
          originalPrompt: prompt
        });
        
        setIsLoading(false);
        setShowTypingIndicator(false);
        setRetryCount(0);
        abortControllerRef.current = null;
        return;
      } 
      
      // Handle retryable errors
      if (shouldAutoRetry(error) && attempt < CONSTANTS.RETRY_ATTEMPTS - 1) {
        await new Promise(resolve => setTimeout(resolve, CONSTANTS.RETRY_DELAY * (attempt + 1)));
        
        if (abortControllerRef.current === controller) {
          executeStream(prompt, placeholderId, attempt + 1);
        }
        return;
      }
      
      // Final error
      const errorMessage = getErrorMessage(error);
      
      updateMessage(placeholderId, {
        text: errorMessage,
        timestamp: formatTime(new Date()),
        isError: true,
        isStoppedByUser: false,
        isStreaming: false,
        originalPrompt: prompt
      });
      
      setIsLoading(false);
      setShowTypingIndicator(false);
      setRetryCount(0);
      abortControllerRef.current = null;
    }
  }, [updateMessage]);

  const submitInput = useCallback(() => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading || trimmedInput.length > CONSTANTS.MAX_INPUT_LENGTH || abortControllerRef.current) return;

    const currentInput = trimmedInput;
    setInput("");

    // Handle editing last message
    if (isEditingLastMessage && lastUserMessage) {
      const updatedUserMessage = {
        ...lastUserMessage,
        text: currentInput,
        isEdited: true,
        timestamp: formatTime(new Date())
      };

      const newMessages = [...messages];
      newMessages[lastUserMessageIndex] = updatedUserMessage;
      
      if (lastAiMessageIndex > lastUserMessageIndex) {
        newMessages.splice(lastAiMessageIndex, 1);
      }

      const aiMessagePlaceholder = {
        id: generateId(),
        sender: "ai",
        text: "",
        timestamp: "",
        isError: false,
        isStreaming: false,
        originalPrompt: currentInput
      };

      setMessages([...newMessages, aiMessagePlaceholder]);
      setIsEditingLastMessage(false);
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
      originalPrompt: currentInput
    };

    setMessages(prev => [...prev, userMessage, aiMessagePlaceholder]);
    executeStream(currentInput, aiMessagePlaceholder.id);
  }, [input, isLoading, isEditingLastMessage, lastUserMessage, lastUserMessageIndex, lastAiMessageIndex, messages, executeStream]);

  const handleInputKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitInput();
    }
  }, [submitInput]);

  // Markdown components
  const markdownComponents = useMemo(() => ({
    a: LinkRenderer,
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      const language = match ? match[1] : "";
      const codeContent = String(children).replace(/\n$/, "");
      const blockId = generateId();

      if (!inline && language) {
        return (
          <div className="ai-code-container">
            <div className="ai-code-header">
              <span className="ai-code-lang">{language}</span>
              <button
                className="copy-button"
                onClick={() => handleCopyCode(codeContent, blockId)}
                title="Copy code"
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
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
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
    }
  }), [handleCopyCode, copiedBlockId]);

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {messages.map((message, index) => {
          // Fixed: Use the actual last message functions
          const isLastUser = isLastUserMessage(index);
          const isLastAi = isLastAiMessage(index);
          const isLastMessage = isLastUser || isLastAi;

          return (
            <MessageBubble
              key={message.id}
              message={message}
              index={index}
              isLastUser={isLastUser}
              isLastAi={isLastAi}
              isLastMessage={isLastMessage}
              markdownComponents={markdownComponents}
              retryCount={retryCount}
              isLoading={isLoading}
              onEditMessage={handleEditLastMessage}
              onRetryMessage={handleRetryMessage}
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
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={
            isEditingLastMessage
              ? "Edit your message..."
              : isLoading
              ? "AI is responding..."
              : "Type your message here..."
          }
          disabled={isLoading && !isEditingLastMessage}
          className={isEditingLastMessage ? "editing-mode" : ""}
          maxLength={CONSTANTS.MAX_INPUT_LENGTH}
        />

        {isLoading ? (
          <button
            type="button"
            onClick={handleStopGeneration}
            title="Stop generation"
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
            disabled={!input.trim() || input.length > CONSTANTS.MAX_INPUT_LENGTH}
            title={isEditingLastMessage ? "Update message" : "Send message"}
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
      </form>
    </div>
  );
};

export default ChatInterface;