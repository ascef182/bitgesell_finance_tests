import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import App from "../pages/App";

// Mock the DataProvider to avoid API calls in tests
jest.mock("../state/DataContext", () => ({
  DataProvider: ({ children }) => children,
  useData: () => ({
    items: [],
    loading: false,
    error: null,
    fetchItems: jest.fn(),
  }),
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
  test("renders navigation with logo and menu items", () => {
    renderWithRouter(<App />);

    // Check if logo is rendered
    expect(screen.getByText("Items Store")).toBeInTheDocument();

    // Check if navigation items are rendered
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Items")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  test("renders home page by default", () => {
    renderWithRouter(<App />);

    // Check if home page content is rendered
    expect(screen.getByText("Welcome to")).toBeInTheDocument();
    expect(screen.getByText("Browse Items")).toBeInTheDocument();
    expect(screen.getByText("Learn More")).toBeInTheDocument();
  });

  test("app renders without crashing", () => {
    renderWithRouter(<App />);

    // App should render the main structure
    expect(screen.getByText("Items Store")).toBeInTheDocument();
  });
});
