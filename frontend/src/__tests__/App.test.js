import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import App from "../pages/App";
import { DataProvider } from "../state/DataContext";

// Mock the DataContext to provide test data
const mockDataContext = {
  items: [
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
  ],
  loading: false,
  error: null,
  fetchItems: jest.fn(),
};

// Mock the DataContext
jest.mock("../state/DataContext", () => ({
  DataProvider: ({ children }) => children,
  useData: () => mockDataContext,
}));

// Mock the ErrorBoundary component
jest.mock("../components/ErrorBoundary", () => {
  return function MockErrorBoundary({ children }) {
    return children;
  };
});

// Mock the Items and ItemDetail components
jest.mock("../pages/Items", () => {
  return function MockItems() {
    return <div data-testid="items-page">Items Page</div>;
  };
});

jest.mock("../pages/ItemDetail", () => {
  return function MockItemDetail() {
    return <div data-testid="item-detail-page">Item Detail Page</div>;
  };
});

// Test wrapper for components that need router context
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("App Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders navigation with logo and menu items", () => {
    renderWithRouter(<App />);

    // Check if logo is rendered (updated to match new design)
    expect(screen.getAllByText("Store")[0]).toBeInTheDocument();

    // Check if navigation items are rendered (updated labels)
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getAllByText("Products")[0]).toBeInTheDocument(); // Use first occurrence
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  test("renders home page with hero section", () => {
    renderWithRouter(<App />);

    // Check if hero section content is rendered
    expect(screen.getByText("The future is here.")).toBeInTheDocument();
    expect(screen.getByText("Experience innovation.")).toBeInTheDocument();
    expect(screen.getByText("Shop Now")).toBeInTheDocument();
    expect(screen.getByText("Watch Video")).toBeInTheDocument();
  });

  test("renders featured products section", () => {
    renderWithRouter(<App />);

    // Check if products section is rendered
    expect(screen.getByText("Featured Products")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Handpicked essentials that combine cutting-edge technology with timeless design."
      )
    ).toBeInTheDocument();

    // Check if products are rendered
    expect(screen.getByText("Laptop Pro")).toBeInTheDocument();
    expect(screen.getByText("Noise Cancelling Headphones")).toBeInTheDocument();
  });

  test("renders categories section", () => {
    renderWithRouter(<App />);

    // Check if categories section is rendered
    expect(screen.getByText("Shop by Category")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Explore our curated collections designed for every lifestyle"
      )
    ).toBeInTheDocument();

    // Check for Electronics and Furniture categories (only real categories)
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("Furniture")).toBeInTheDocument();

    // Verify Accessories is NOT present (removed from real data)
    expect(screen.queryByText("Accessories")).not.toBeInTheDocument();
  });

  test("renders features section", () => {
    renderWithRouter(<App />);

    // Check if features section is rendered
    expect(screen.getByText("Why Choose Us")).toBeInTheDocument();
    expect(
      screen.getByText(
        "We're committed to providing the best shopping experience"
      )
    ).toBeInTheDocument();

    // Check individual features
    expect(screen.getByText("Premium Quality")).toBeInTheDocument();
    expect(screen.getByText("Fast Shipping")).toBeInTheDocument();
    expect(screen.getByText("24/7 Support")).toBeInTheDocument();
  });

  test("renders footer", () => {
    renderWithRouter(<App />);

    // Check if footer content is rendered (using getAllByText for duplicate elements)
    const storeElements = screen.getAllByText("Store");
    expect(storeElements.length).toBeGreaterThan(0);

    // Check for footer sections using getAllByText for potentially duplicate elements
    const productsElements = screen.getAllByText("Products");
    expect(productsElements.length).toBeGreaterThan(0);

    const supportElements = screen.getAllByText("Support");
    expect(supportElements.length).toBeGreaterThan(0);

    expect(screen.getByText("Company")).toBeInTheDocument();
    expect(screen.getByText("Stay Updated")).toBeInTheDocument();
  });

  test("app renders without crashing", () => {
    renderWithRouter(<App />);

    // App should render the main structure
    const storeElements = screen.getAllByText("Store");
    expect(storeElements.length).toBeGreaterThan(0);
    expect(screen.getByText("The future is here.")).toBeInTheDocument();
  });

  test("displays correct product count for each category", async () => {
    renderWithRouter(<App />);

    await waitFor(() => {
      // Electronics should have 3 products
      expect(screen.getByText("3 products")).toBeInTheDocument();
      // Furniture should have 2 products
      expect(screen.getByText("2 products")).toBeInTheDocument();
    });
  });

  test("renders product cards with correct data", async () => {
    renderWithRouter(<App />);

    await waitFor(() => {
      // Check for product names
      expect(screen.getByText("Laptop Pro")).toBeInTheDocument();
      expect(
        screen.getByText("Noise Cancelling Headphones")
      ).toBeInTheDocument();
      expect(screen.getByText("Ultra‑Wide Monitor")).toBeInTheDocument();
      expect(screen.getByText("Ergonomic Chair")).toBeInTheDocument();
      expect(screen.getByText("Standing Desk")).toBeInTheDocument();

      // Check for prices
      expect(screen.getByText("$2,499")).toBeInTheDocument();
      expect(screen.getByText("$399")).toBeInTheDocument();
      expect(screen.getByText("$999")).toBeInTheDocument();
      expect(screen.getByText("$799")).toBeInTheDocument();
      expect(screen.getByText("$1,199")).toBeInTheDocument();
    });
  });
});
