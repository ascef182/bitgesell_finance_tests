import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import ProductsSection from "../components/ProductsSection";

// Mock the ProductCard component
jest.mock("../components/ProductCard", () => {
  return function MockProductCard({ product }) {
    return (
      <div data-testid={`product-card-${product.id}`}>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <span>${product.price}</span>
      </div>
    );
  };
});

// Mock the Skeleton component
jest.mock("../components/ui/Skeleton", () => {
  return function MockSkeleton({ className }) {
    return (
      <div data-testid="skeleton" className={className}>
        Loading...
      </div>
    );
  };
});

// Test wrapper for components that need router context
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("ProductsSection Component", () => {
  const mockProducts = [
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

  test("renders section title and subtitle", () => {
    renderWithRouter(
      <ProductsSection
        products={mockProducts}
        title="Featured Products"
        subtitle="Handpicked essentials that combine cutting-edge technology with timeless design."
      />
    );

    expect(screen.getByText("Featured Products")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Handpicked essentials that combine cutting-edge technology with timeless design."
      )
    ).toBeInTheDocument();
  });

  test("renders all products when no maxProducts limit", () => {
    renderWithRouter(
      <ProductsSection products={mockProducts} title="All Products" />
    );

    // Check for all product names
    expect(screen.getByText("Laptop Pro")).toBeInTheDocument();
    expect(screen.getByText("Noise Cancelling Headphones")).toBeInTheDocument();
    expect(screen.getByText("Ultra‑Wide Monitor")).toBeInTheDocument();
    expect(screen.getByText("Ergonomic Chair")).toBeInTheDocument();
    expect(screen.getByText("Standing Desk")).toBeInTheDocument();
  });

  test("respects maxProducts limit", () => {
    renderWithRouter(
      <ProductsSection
        products={mockProducts}
        title="Limited Products"
        maxProducts={3}
      />
    );

    // Should show only first 3 products
    expect(screen.getByText("Laptop Pro")).toBeInTheDocument();
    expect(screen.getByText("Noise Cancelling Headphones")).toBeInTheDocument();
    expect(screen.getByText("Ultra‑Wide Monitor")).toBeInTheDocument();

    // Should NOT show the last 2 products
    expect(screen.queryByText("Ergonomic Chair")).not.toBeInTheDocument();
    expect(screen.queryByText("Standing Desk")).not.toBeInTheDocument();
  });

  test("shows loading state", () => {
    renderWithRouter(
      <ProductsSection products={[]} loading={true} title="Loading Products" />
    );

    // Should show loading skeletons
    const skeletons = screen.getAllByTestId("product-skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test("shows error state", () => {
    const errorMessage = "Failed to load products";
    renderWithRouter(
      <ProductsSection
        products={[]}
        error={errorMessage}
        title="Error Products"
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test("shows empty state when no products", () => {
    renderWithRouter(
      <ProductsSection
        products={[]}
        loading={false}
        error={null}
        title="Empty Products"
      />
    );

    expect(screen.getByText("No products found")).toBeInTheDocument();
  });

  test("renders product prices correctly", () => {
    renderWithRouter(
      <ProductsSection products={mockProducts} title="Products with Prices" />
    );

    // Check for formatted prices
    expect(screen.getByText("$2,499")).toBeInTheDocument();
    expect(screen.getByText("$399")).toBeInTheDocument();
    expect(screen.getByText("$999")).toBeInTheDocument();
    expect(screen.getByText("$799")).toBeInTheDocument();
    expect(screen.getByText("$1,199")).toBeInTheDocument();
  });

  test("renders product categories correctly", () => {
    renderWithRouter(
      <ProductsSection products={mockProducts} title="Products by Category" />
    );

    // Check for category labels
    const electronicsElements = screen.getAllByText("Electronics");
    const furnitureElements = screen.getAllByText("Furniture");

    // Should have multiple Electronics (3 products)
    expect(electronicsElements.length).toBeGreaterThanOrEqual(3);
    // Should have multiple Furniture (2 products)
    expect(furnitureElements.length).toBeGreaterThanOrEqual(2);

    // Should NOT have Accessories (removed from real data)
    expect(screen.queryByText("Accessories")).not.toBeInTheDocument();
  });
});
