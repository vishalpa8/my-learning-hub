import React, { useEffect, Suspense, lazy } from "react"; // Import Suspense and lazy
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/shared/Navbar";
import ErrorBoundary from "./components/shared/ErrorBoundary"; // Import ErrorBoundary
import Footer from "./components/shared/Footer";

// Lazy load page components
const HomePage = lazy(() => import("./pages/HomePage"));
const DsaPage = lazy(() => import("./pages/DsaPage"));
const ChessPage = lazy(() => import("./pages/ChessPage"));
import { RewardProvider } from "./contexts/RewardContext";
import EngagementPage from "./pages/EngagementPage";
import AIAssistantPage from "./pages/AIAssistantPage";

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
      <a href="#main-content" className="sr-only sr-only-focusable">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="main-content" tabIndex={-1}>
        <Suspense fallback={<div>Loading...</div>}>
          {" "}
          {/* Add Suspense boundary */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/ai-assistant" element={<AIAssistantPage />} />
            <Route path="/dsa" element={<DsaPage />} />
            <Route path="/chess" element={<ChessPage />} />
            <Route path="/progress" element={<EngagementPage />} />
          </Routes>
        </Suspense>
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
    <React.StrictMode>
      {" "}
      {/* Optional: Add StrictMode for development */}
      <Router>
        <ScrollToTop />
        <RewardProvider>
          <AppContent />
        </RewardProvider>
      </Router>
    </React.StrictMode>
  );
}

export default App;
