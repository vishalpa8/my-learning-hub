import React from "react";

/**
 * Error Boundary component to catch JavaScript errors in its child component tree,
 * log them, and render a fallback UI.
 *
 * @extends React.Component
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  /**
   * Static method to update state when an error is caught.
   * @param {Error} error - The error that was thrown.
   * @returns {{hasError: boolean, errorMessage: string}} An object to update the state.
   */
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    // Store the error message to display it.
    return { hasError: true, errorMessage: error ? error.message : "An unknown error occurred." };
  }

  /**
   * Lifecycle method to catch errors and log them.
   * @param {Error} error - The error that was thrown.
   * @param {React.ErrorInfo} errorInfo - An object with a componentStack key.
   */
  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    // Example: logErrorToMyService(error, errorInfo);
  }

  /**
   * Renders the component's children or a fallback UI if an error occurred.
   * @returns {React.ReactNode} The child components or the fallback UI.
   */
  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div
          className="error-fallback"
          style={{
            padding: "20px",
            textAlign: "center",
            color: "red",
            border: "1px solid red",
            margin: "20px",
            borderRadius: "8px",
          }}
        >
          <h2>Oops! Something went wrong.</h2>
          {this.state.errorMessage && (
            <p style={{ fontStyle: "italic", color: '#c0392b', marginTop: '10px', marginBottom: '10px' }}>
                <strong>Error details:</strong> {this.state.errorMessage}
              </p>
          )}
          <p>
            We&#39;re sorry, but there was an error loading this part of the
            application.
          </p>
          <p>Please try refreshing the page.</p>
          {/* Optional: Add a button to reload */}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "15px",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
