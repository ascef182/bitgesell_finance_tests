import React from "react";

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 *
 * Error boundaries catch errors during:
 * - Rendering
 * - Lifecycle methods
 * - Constructors of the whole tree below them
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Static method to update state when an error occurs
   * @param {Error} error - The error that was thrown
   * @returns {Object} New state object
   */
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  /**
   * Lifecycle method called after an error has been thrown
   * @param {Error} error - The error that was thrown
   * @param {Object} errorInfo - Additional error information
   */
  componentDidCatch(error, errorInfo) {
    // Log the error to console (in production, this would go to a logging service)
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // In a real application, you would also log the error to an error reporting service
    // Example: logErrorToService(error, errorInfo);
  }

  /**
   * Handle retry by resetting the error state
   */
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div
          style={{
            padding: "20px",
            margin: "20px",
            border: "1px solid #ff6b6b",
            borderRadius: "8px",
            backgroundColor: "#fff5f5",
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "#d63031", marginBottom: "10px" }}>
            🚨 Something went wrong
          </h2>

          <p style={{ color: "#636e72", marginBottom: "20px" }}>
            We're sorry, but something unexpected happened. This error has been
            logged and our team has been notified.
          </p>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <details
              style={{
                textAlign: "left",
                marginBottom: "20px",
                padding: "10px",
                backgroundColor: "#f8f9fa",
                borderRadius: "4px",
              }}
            >
              <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                Error Details (Development Only)
              </summary>
              <pre
                style={{
                  fontSize: "12px",
                  color: "#e74c3c",
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                }}
              >
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}

          <button
            onClick={this.handleRetry}
            style={{
              padding: "10px 20px",
              backgroundColor: "#00b894",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#00a085";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#00b894";
            }}
          >
            🔄 Try Again
          </button>

          <p
            style={{
              fontSize: "12px",
              color: "#b2bec3",
              marginTop: "20px",
            }}
          >
            If the problem persists, please contact support.
          </p>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
