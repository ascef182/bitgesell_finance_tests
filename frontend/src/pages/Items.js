import React, { useEffect, useRef } from "react";
import { useData } from "../state/DataContext";
import { Link } from "react-router-dom";

/**
 * Items component with memory leak prevention
 *
 * This component demonstrates proper cleanup using AbortController to prevent:
 * - Memory leaks from pending requests
 * - State updates on unmounted components
 * - Unnecessary network requests
 */
function Items() {
  const { items, loading, error, fetchItems, clearError, retryFetch } =
    useData();

  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);

  // Use ref to store the current AbortController
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    /**
     * Fetch items with proper error handling
     * Only updates state if component is still mounted
     */
    const loadItems = async () => {
      try {
        await fetchItems(abortControllerRef.current.signal);
      } catch (err) {
        // Only log errors that aren't abort errors and component is still mounted
        if (err.name !== "AbortError" && isMountedRef.current) {
          console.error("Failed to fetch items:", err);
        }
      }
    };

    // Start fetching items
    loadItems();

    /**
     * Cleanup function - called when component unmounts or dependencies change
     * This prevents memory leaks and state updates on unmounted components
     */
    return () => {
      // Mark component as unmounted
      isMountedRef.current = false;

      // Abort any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [fetchItems]); // Only re-run if fetchItems function changes

  /**
   * Handle retry with new AbortController
   */
  const handleRetry = async () => {
    clearError();

    // Create new AbortController for retry
    abortControllerRef.current = new AbortController();

    try {
      await retryFetch(abortControllerRef.current.signal);
    } catch (err) {
      if (err.name !== "AbortError" && isMountedRef.current) {
        console.error("Retry failed:", err);
      }
    }
  };

  // Show loading state
  if (loading && !items.length) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Loading items...</p>
      </div>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p style={{ color: "red" }}>Error: {error}</p>
        <button
          onClick={handleRetry}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Show empty state
  if (!items.length) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>No items found.</p>
      </div>
    );
  }

  // Render items list
  return (
    <div style={{ padding: "20px" }}>
      <h2>Items List</h2>
      {loading && <p style={{ color: "#666" }}>Refreshing...</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((item) => (
          <li
            key={item.id}
            style={{
              padding: "10px",
              margin: "5px 0",
              border: "1px solid #ddd",
              borderRadius: "4px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <Link
              to={`/items/${item.id}`}
              style={{
                textDecoration: "none",
                color: "#007bff",
                fontWeight: "bold",
              }}
            >
              {item.name}
            </Link>
            <span style={{ color: "#666", marginLeft: "10px" }}>
              ${item.price}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Items;
