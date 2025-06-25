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

// Constants
const SYSTEM_PROMPT = "Please answer in English.";
const MAX_TEXTAREA_HEIGHT = 150;
const COPY_TIMEOUT = 2000;
const TYPING_INDICATOR_DELAY = 500;

// Utility functions
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

const parseStreamChunks = (chunk) => {
  const chunks = chunk.split("\n").filter((line) => line.trim());
  const results = [];

  for (const chunkLine of chunks) {
    try {
      const json = JSON.parse(chunkLine);
      const content = json.choices?.[0]?.delta?.content || "";
      if (content) {
        results.push(content);
      }
    } catch (e) {
      console.warn("Failed to parse chunk:", chunkLine, e);
    }
  }

  return results.join("");
};

const ChatInterface = () => {
  // State
  const [messages, setMessages] = useState([
    {
      id: generateId(),
      sender: "ai",
      text: "Hello! How can I help you with your learning today?",
      timestamp: formatTime(new Date()),
      isError: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedBlockId, setCopiedBlockId] = useState(null);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const textareaRef = useRef(null);
  const copyTimeoutRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Memoized calculations
  const { lastAiMessageIndex, lastUserMessageIndex } = useMemo(() => {
    let lastAi = -1;
    let lastUser = -1;

    for (let i = messages.length - 1; i >= 0; i--) {
      if (lastAi === -1 && messages[i].sender === "ai") {
        lastAi = i;
      }
      if (lastUser === -1 && messages[i].sender === "user") {
        lastUser = i;
      }
      if (lastAi !== -1 && lastUser !== -1) {
        break;
      }
    }

    return { lastAiMessageIndex: lastAi, lastUserMessageIndex: lastUser };
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea with max height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(
        textareaRef.current.scrollHeight,
        MAX_TEXTAREA_HEIGHT
      );
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      [copyTimeoutRef, typingTimeoutRef].forEach((ref) => {
        if (ref.current) clearTimeout(ref.current);
      });
    };
  }, []);

  // Optimized message update function
  const updateMessage = useCallback((messageId, updates) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
    );
  }, []);

  // Copy code block handler
  const handleCopyCode = useCallback((code, blockId) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopiedBlockId(blockId);
        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }
        copyTimeoutRef.current = setTimeout(
          () => setCopiedBlockId(null),
          COPY_TIMEOUT
        );
      })
      .catch((err) => {
        console.error("Failed to copy code:", err);
      });
  }, []);

  // Stop generation handler
  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Rewrite user message handler
  const handleRewriteUserMessage = useCallback((text) => {
    setInput(text);
    textareaRef.current?.focus();
  }, []);

  // Core streaming logic
  const executeStream = useCallback(
    async (prompt, placeholderId) => {
      setIsLoading(true);
      setShowTypingIndicator(false);

      // Show typing indicator after delay
      typingTimeoutRef.current = setTimeout(() => {
        setShowTypingIndicator(true);
      }, TYPING_INDICATOR_DELAY);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const reader = await streamMessage(prompt, SYSTEM_PROMPT, {
          signal: controller.signal,
        });

        const decoder = new TextDecoder();
        let hasContent = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const content = parseStreamChunks(chunk);

          if (content) {
            hasContent = true;
            setShowTypingIndicator(false);
            updateMessage(placeholderId, {
              text: (prev) => (prev.text || "") + content,
            });
          }
        }

        // Finalize message on successful completion
        if (hasContent) {
          updateMessage(placeholderId, {
            timestamp: formatTime(new Date()),
            isError: false,
          });
        }
      } catch (error) {
        let errorText;
        if (error.name === "AbortError") {
          console.log("Stream cancelled by user.");
          errorText = "Response generation stopped.";
        } else {
          errorText = `Sorry, I encountered an error: ${error.message}`;
          console.error("Error streaming message:", error);
        }

        updateMessage(placeholderId, {
          text: errorText,
          timestamp: formatTime(new Date()),
          isError: true,
        });
      } finally {
        setIsLoading(false);
        setShowTypingIndicator(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Clean up empty placeholder messages
        setMessages((prev) => {
          const targetMsg = prev.find((m) => m.id === placeholderId);
          if (
            targetMsg &&
            !targetMsg.text?.trim() &&
            !targetMsg.timestamp &&
            !targetMsg.isError
          ) {
            return prev.filter((m) => m.id !== placeholderId);
          }
          return prev;
        });

        abortControllerRef.current = null;
      }
    },
    [updateMessage]
  );

  // Submit input handler
  const submitInput = useCallback(() => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const currentInput = trimmedInput;
    setInput("");

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
    };

    setMessages((prev) => [...prev, userMessage, aiMessagePlaceholder]);
    executeStream(currentInput, aiMessagePlaceholder.id);
  }, [input, isLoading, executeStream]);

  // Handle key presses
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submitInput();
      }
    },
    [submitInput]
  );

  // Regenerate response handler
  const handleRegenerateResponse = useCallback(() => {
    if (isLoading || lastUserMessageIndex === -1) return;

    const lastUserMessage = messages[lastUserMessageIndex];
    const newPlaceholder = {
      id: generateId(),
      sender: "ai",
      text: "",
      timestamp: "",
      isError: false,
    };

    setMessages((prev) => [...prev.slice(0, -1), newPlaceholder]);
    executeStream(lastUserMessage.text, newPlaceholder.id);
  }, [isLoading, lastUserMessageIndex, messages, executeStream]);

  // Render code block component
  const renderCodeBlock = useCallback(
    ({ node, inline, className, children, ...props }) => {
      if (inline) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }

      const match = /language-(\w+)/.exec(className || "");
      const lang = match ? match[1] : "code";
      const codeContent = Array.isArray(children)
        ? children.join("")
        : children;
      const blockId = `code-${generateId()}`;

      return (
        <div className="ai-code-container">
          <div className="ai-code-header">
            <span className="ai-code-lang">{lang}</span>
            <button
              type="button"
              className="copy-button"
              aria-label={`Copy ${lang} code`}
              onClick={() => handleCopyCode(codeContent, blockId)}
            >
              {copiedBlockId === blockId ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="ai-code-block">
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        </div>
      );
    },
    [handleCopyCode, copiedBlockId]
  );

  return (
    <section className="chat-interface" aria-label="AI Chat Interface">
      <main className="chat-messages" aria-live="polite">
        {messages.map((msg, index) => {
          const isStreaming =
            msg.sender === "ai" && !msg.timestamp && isLoading;
          const isLastAiMessage =
            msg.sender === "ai" && index === lastAiMessageIndex;
          const isLastUserMessage =
            msg.sender === "user" && index === lastUserMessageIndex;

          return (
            <article key={msg.id} className={`message-bubble ${msg.sender}`}>
              <div className="message-content">
                {msg.sender === "user" ? (
                  <div className="message-text">{msg.text}</div>
                ) : isStreaming && !msg.text && showTypingIndicator ? (
                  <span className="typing-indicator" aria-label="AI is typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                ) : (
                  <div className={isStreaming ? "streaming-markdown" : ""}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{ code: renderCodeBlock }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              <div className="message-footer">
                <div className="message-actions-container">
                  {isLastUserMessage && !isLoading && (
                    <button
                      className="action-button"
                      onClick={() => handleRewriteUserMessage(msg.text)}
                      aria-label="Edit message"
                      title="Edit this message"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                    </button>
                  )}
                  {isLastAiMessage && msg.timestamp && !isLoading && (
                    <button
                      className="action-button"
                      onClick={handleRegenerateResponse}
                      aria-label={
                        msg.isError ? "Retry response" : "Regenerate response"
                      }
                      title={
                        msg.isError
                          ? "Retry generating response"
                          : "Generate new response"
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
                        <path d="M21 3v5h-5"></path>
                      </svg>
                    </button>
                  )}
                </div>
                {msg.timestamp && (
                  <span
                    className="timestamp"
                    title={new Date().toLocaleString()}
                  >
                    {msg.timestamp}
                  </span>
                )}
              </div>
            </article>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      <form
        className="chat-input-form"
        onSubmit={(e) => {
          e.preventDefault();
          submitInput();
        }}
        autoComplete="off"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a data structure, chess opening, etc..."
          aria-label="Your message"
          disabled={isLoading}
          rows={1}
          onKeyDown={handleKeyDown}
          style={{ resize: "none" }}
        />
        {isLoading ? (
          <button
            type="button"
            className="stop-button"
            onClick={handleStopGeneration}
            aria-label="Stop generation"
            title="Stop generating response"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="6" y="6" width="12" height="12" rx="2"></rect>
            </svg>
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Send message"
            title="Send message (Enter)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
            </svg>
          </button>
        )}
      </form>
    </section>
  );
};

export default ChatInterface;
