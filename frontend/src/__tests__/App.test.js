import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import App from "../pages/App";

// Simple DataContext mock
const mockItems = [
  { id: 1, name: "Laptop Pro", category: "Electronics", price: 2499 },
  {
    id: 2,
    name: "Noise Cancelling Headphones",
    category: "Electronics",
    price: 399,
  },
  { id: 3, name: "Ultra‑Wide Monitor", category: "Electronics", price: 999 },
  { id: 4, name: "Ergonomic Chair", category: "Furniture", price: 799 },
  { id: 5, name: "Standing Desk", category: "Furniture", price: 1199 },
];

jest.mock("../state/DataContext", () => ({
  DataProvider: ({ children }) => children,
  useData: () => ({
    items: mockItems,
    loading: false,
    error: null,
    fetchItems: jest.fn(),
  }),
}));

// Mock page components
jest.mock("../pages/Items", () => () => <div>Items Page</div>);
jest.mock("../pages/ItemDetail", () => () => <div>Item Detail Page</div>);
jest.mock(
  "../components/ErrorBoundary",
  () =>
    ({ children }) =>
      children
);

const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

describe("App Component", () => {
  test("renders main navigation elements", () => {
    renderApp();

    // Check if main navigation elements are present
    expect(screen.getAllByText("Store").length).toBeGreaterThan(0);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getAllByText("Products").length).toBeGreaterThan(0);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  test("renders hero section", () => {
    renderApp();

    // Check if hero section is present
    expect(screen.getByText("The future is here.")).toBeInTheDocument();
    expect(screen.getByText("Experience innovation.")).toBeInTheDocument();
    expect(screen.getByText("Shop Now")).toBeInTheDocument();
  });

  test("renders featured products section", () => {
    renderApp();

    // Check if featured products section is present
    expect(screen.getByText("Featured Products")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Handpicked essentials that combine cutting-edge technology with timeless design."
      )
    ).toBeInTheDocument();
  });

  test("renders all products from data", () => {
    renderApp();

    // Check if all products from real data are being displayed
    expect(screen.getByText("Laptop Pro")).toBeInTheDocument();
    expect(screen.getByText("Noise Cancelling Headphones")).toBeInTheDocument();
    expect(screen.getByText("Ultra‑Wide Monitor")).toBeInTheDocument();
    expect(screen.getByText("Ergonomic Chair")).toBeInTheDocument();
    expect(screen.getByText("Standing Desk")).toBeInTheDocument();
  });

  test("renders categories section with real categories", () => {
    renderApp();

    // Check if categories section is present
    expect(screen.getByText("Shop by Category")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Explore our curated collections designed for every lifestyle"
      )
    ).toBeInTheDocument();

    // Check if real categories are present (using getAllByText for duplicate elements)
    expect(screen.getAllByText("Electronics").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Furniture").length).toBeGreaterThan(0);
  });

  test("renders features section", () => {
    renderApp();

    // Check if features section is present
    expect(screen.getByText("Why Choose Us")).toBeInTheDocument();
    expect(
      screen.getByText(
        "We're committed to providing the best shopping experience"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Premium Quality")).toBeInTheDocument();
    expect(screen.getByText("Fast Shipping")).toBeInTheDocument();
    expect(screen.getByText("24/7 Support")).toBeInTheDocument();
  });

  test("renders footer", () => {
    renderApp();

    // Check if footer is present (using partial text)
    expect(
      screen.getByText(/©.*Store.*All rights reserved/)
    ).toBeInTheDocument();
  });

  test("displays correct product counts", () => {
    renderApp();

    // Check if product counts are correct
    expect(screen.getByText("3 products")).toBeInTheDocument(); // Electronics
    expect(screen.getByText("2 products")).toBeInTheDocument(); // Furniture
  });

  test("renders formatted prices", () => {
    renderApp();

    // Check if prices are being displayed (formatting may vary)
    const pageText = document.body.textContent || "";

    // Check if price values are present (formatted or not)
    expect(pageText).toMatch(/2,499/); // USD formatting
    expect(pageText).toMatch(/399/);
    expect(pageText).toMatch(/999/);
    expect(pageText).toMatch(/799/);
    expect(pageText).toMatch(/1,199/); // USD formatting
  });
});
