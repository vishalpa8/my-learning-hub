import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/shared/Navbar";
import ErrorBoundary from "./components/shared/ErrorBoundary"; // Import ErrorBoundary
import Footer from "./components/shared/Footer";
import HomePage from "./pages/HomePage";
import DsaPage from "./pages/DsaPage";
import ChessPage from "./pages/ChessPage";
import { RewardProvider } from "./contexts/RewardContext";
import EngagementPage from "./pages/EngagementPage"; // Import the new EngagementPage
import "./App.css"; // Global styles
import "./index.css"; // Global theme variables and base styles

/**
 * Component to handle scrolling to the top of the page on route changes.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  return (
    <ErrorBoundary>
      {" "}
      {/* Wrap the main content area */}
      {/* Accessibility: Skip to main content link */}
      <a href="#main-content" className="sr-only sr-only-focusable">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dsa" element={<DsaPage />} />
          <Route path="/chess" element={<ChessPage />} />          
          <Route path="/Progress" element={<EngagementPage />} /> {/* Use the imported EngagementPage component */}
          {/* Add route for EngagementPage */}
          {/* Add other routes here */}
        </Routes>
      </main>
      <Footer />
    </ErrorBoundary>
  );
}

/**
 * Main application component.
 * Sets up the router, context providers, and global layout.
 */
function App() {
  return (
    <Router>
      <ScrollToTop />
      <RewardProvider>
        <AppContent />
      </RewardProvider>
    </Router>
  );
}

export default App;
