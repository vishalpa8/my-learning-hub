// src/pages/AIAssistantPage.jsx
import React from "react";
import ChatInterface from "../components/ai/ChatInterface.jsx";
import ErrorBoundary from "../components/shared/ErrorBoundary.jsx";
import "../styles/AIAssistantPage.css";

const AIAssistantPage = () => {
  return (
    <main
      className="ai-assistant-container"
      role="main"
      aria-label="AI Learning Assistant"
    >
      <header className="ai-assistant-header">
        <h1>
          <span role="img" aria-label="robot">
            🤖
          </span>{" "}
          AI Learning Assistant
        </h1>
        <p>
          Powered by OpenRouter. Ask anything about DSA, Chess, or other
          learning topics.
        </p>
      </header>
      <section className="ai-chat-section" aria-live="polite">
        <ErrorBoundary>
          <ChatInterface />
        </ErrorBoundary>
      </section>
      <footer className="ai-assistant-footer">
        <p>
          AI responses may be inaccurate. Always verify important information.
        </p>
      </footer>
    </main>
  );
};

export default AIAssistantPage;
