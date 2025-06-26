import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Items from "./Items";
import ItemDetail from "./ItemDetail";
import { DataProvider } from "../state/DataContext";
import ErrorBoundary from "../components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <DataProvider>
        <nav
          style={{
            padding: 16,
            borderBottom: "1px solid #ddd",
            backgroundColor: "#f8f9fa",
          }}
        >
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "#007bff",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            📦 Items Manager
          </Link>
        </nav>

        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Items />} />
            <Route path="/items/:id" element={<ItemDetail />} />
          </Routes>
        </ErrorBoundary>
      </DataProvider>
    </ErrorBoundary>
  );
}

export default App;
