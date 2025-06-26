import React, { createContext, useCallback, useContext, useState } from "react";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch items with support for request cancellation
   * @param {AbortSignal} signal - AbortController signal for cancelling requests
   * @returns {Promise<Array>} Promise that resolves to items array
   */
  const fetchItems = useCallback(async (signal = null) => {
    try {
      setLoading(true);
      setError(null);

      // Create fetch options with abort signal
      const fetchOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        ...(signal && { signal }), // Only add signal if provided
      };

      const res = await fetch(
        "http://localhost:3001/api/items?limit=500",
        fetchOptions
      );

      // Check if request was aborted
      if (signal?.aborted) {
        return; // Exit early if aborted
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();

      // Check again if request was aborted before setting state
      if (signal?.aborted) {
        return; // Exit early if aborted
      }

      setItems(json);
      return json;
    } catch (err) {
      // Don't set error state if request was intentionally aborted
      if (err.name === "AbortError") {
        console.log("Request was aborted");
        return;
      }

      setError(err.message);
      console.error("Error fetching items:", err);
      throw err; // Re-throw for component-level handling
    } finally {
      // Only update loading state if request wasn't aborted
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Retry fetching items
   */
  const retryFetch = useCallback(
    async (signal = null) => {
      return fetchItems(signal);
    },
    [fetchItems]
  );

  return (
    <DataContext.Provider
      value={{
        items,
        loading,
        error,
        fetchItems,
        clearError,
        retryFetch,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
