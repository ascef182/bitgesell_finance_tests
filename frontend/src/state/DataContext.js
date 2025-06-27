import React, { createContext, useCallback, useContext, useState } from "react";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    filtered: 0,
    hasMore: false,
  });

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

      // Handle new response format with metadata
      if (json.items && Array.isArray(json.items)) {
        setItems(json.items);
        setPagination({
          total: json.total || json.items.length,
          filtered: json.filtered || json.items.length,
          hasMore: json.hasMore || false,
        });
        return json.items;
      } else {
        // Fallback for old format
        setItems(json);
        setPagination({
          total: json.length,
          filtered: json.length,
          hasMore: false,
        });
        return json;
      }
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
   * Search items with query parameter
   * @param {string} query - Search query
   * @param {AbortSignal} signal - AbortController signal
   * @returns {Promise<Array>} Promise that resolves to filtered items
   */
  const searchItems = useCallback(async (query, signal = null) => {
    try {
      setLoading(true);
      setError(null);

      const fetchOptions = {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        ...(signal && { signal }),
      };

      const url = `http://localhost:3001/api/items?q=${encodeURIComponent(
        query
      )}`;
      const res = await fetch(url, fetchOptions);

      if (signal?.aborted) return;

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();

      if (signal?.aborted) return;

      if (json.items && Array.isArray(json.items)) {
        setItems(json.items);
        setPagination({
          total: json.total || json.items.length,
          filtered: json.filtered || json.items.length,
          hasMore: json.hasMore || false,
        });
        return json.items;
      } else {
        setItems(json);
        setPagination({
          total: json.length,
          filtered: json.length,
          hasMore: false,
        });
        return json;
      }
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Search request was aborted");
        return;
      }

      setError(err.message);
      console.error("Error searching items:", err);
      throw err;
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Create a new item
   * @param {Object} itemData - Item data to create
   * @param {AbortSignal} signal - AbortController signal
   * @returns {Promise<Object>} Promise that resolves to created item
   */
  const createItem = useCallback(async (itemData, signal = null) => {
    try {
      setLoading(true);
      setError(null);

      const fetchOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
        ...(signal && { signal }),
      };

      const res = await fetch("http://localhost:3001/api/items", fetchOptions);

      if (signal?.aborted) return;

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${res.status}`
        );
      }

      const newItem = await res.json();

      if (signal?.aborted) return;

      // Add new item to current list
      setItems((prevItems) => [...prevItems, newItem]);

      return newItem;
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Create request was aborted");
        return;
      }

      setError(err.message);
      console.error("Error creating item:", err);
      throw err;
    } finally {
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
        pagination,
        fetchItems,
        searchItems,
        createItem,
        clearError,
        retryFetch,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
