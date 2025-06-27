import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import ProductCard from "../components/ProductCard";

// Test wrapper for components that need router context
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("ProductCard Component", () => {
  const mockProduct = {
    id: 1,
    name: "Laptop Pro",
    category: "Electronics",
    price: 2499,
    description: "High-performance laptop for professionals",
    image: "https://example.com/laptop.jpg",
    badge: "New",
    rating: 4.5,
    reviewCount: 128,
  };

  test("renders product information correctly", () => {
    renderWithRouter(<ProductCard product={mockProduct} />);

    // Check if product details are rendered
    expect(screen.getByText("Laptop Pro")).toBeInTheDocument();
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("$2,499")).toBeInTheDocument();
    expect(
      screen.getByText("High-performance laptop for professionals")
    ).toBeInTheDocument();
  });

  test("renders product image with fallback", () => {
    const productWithoutImage = {
      ...mockProduct,
      image: null,
    };

    renderWithRouter(<ProductCard product={productWithoutImage} />);

    // Check if placeholder image is rendered
    const image = screen.getByAltText("Laptop Pro");
    expect(image).toBeInTheDocument();
    expect(image.src).toContain("via.placeholder.com");
  });

  test("renders rating stars correctly", () => {
    renderWithRouter(<ProductCard product={mockProduct} />);

    // Should render 5 stars (4 filled, 1 empty)
    const stars = screen.getAllByTestId("star");
    expect(stars).toHaveLength(5);
  });

  test("renders discount badge when original price exists", () => {
    const productWithDiscount = {
      ...mockProduct,
      originalPrice: 2999,
    };

    renderWithRouter(<ProductCard product={productWithDiscount} />);

    // Check if discount badge is rendered
    expect(screen.getByText("$2,499")).toBeInTheDocument();
    expect(screen.getByText("$2,999")).toBeInTheDocument();
    expect(screen.getByText("-17%")).toBeInTheDocument();
  });

  test("renders add to cart button", () => {
    renderWithRouter(<ProductCard product={mockProduct} />);

    // Check if add to cart button is rendered
    expect(screen.getByText("Add to Cart")).toBeInTheDocument();
  });

  test("renders without optional fields", () => {
    const minimalProduct = {
      id: 1,
      name: "Basic Product",
      category: "Electronics",
      price: 100,
    };

    renderWithRouter(<ProductCard product={minimalProduct} />);

    // Check if basic product renders without errors
    expect(screen.getByText("Basic Product")).toBeInTheDocument();
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("$100")).toBeInTheDocument();
  });

  test("renders product with badge", () => {
    const productWithBadge = {
      ...mockProduct,
      badge: "New",
    };

    renderWithRouter(<ProductCard product={productWithBadge} />);

    expect(screen.getByText("New")).toBeInTheDocument();
  });

  test("renders review count", () => {
    renderWithRouter(<ProductCard product={mockProduct} />);

    expect(screen.getByText("(128)")).toBeInTheDocument();
  });

  test("handles missing image gracefully", () => {
    const productWithoutImage = {
      ...mockProduct,
      name: "Unknown Product",
    };

    renderWithRouter(<ProductCard product={productWithoutImage} />);

    const image = screen.getByAltText("Unknown Product");
    expect(image).toBeInTheDocument();
  });

  test("renders furniture product correctly", () => {
    const furnitureProduct = {
      id: 4,
      name: "Ergonomic Chair",
      category: "Furniture",
      price: 799,
      description: "Comfortable chair for long work sessions",
    };

    renderWithRouter(<ProductCard product={furnitureProduct} />);

    expect(screen.getByText("Ergonomic Chair")).toBeInTheDocument();
    expect(screen.getByText("Furniture")).toBeInTheDocument();
    expect(screen.getByText("$799")).toBeInTheDocument();
    expect(
      screen.getByText("Comfortable chair for long work sessions")
    ).toBeInTheDocument();
  });

  test("renders electronics product correctly", () => {
    const electronicsProduct = {
      id: 2,
      name: "Noise Cancelling Headphones",
      category: "Electronics",
      price: 399,
      description: "Premium audio experience",
    };

    renderWithRouter(<ProductCard product={electronicsProduct} />);

    expect(screen.getByText("Noise Cancelling Headphones")).toBeInTheDocument();
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("$399")).toBeInTheDocument();
    expect(screen.getByText("Premium audio experience")).toBeInTheDocument();
  });

  test("does not render accessories category", () => {
    // This test ensures we don't have any references to the removed "Accessories" category
    const allProducts = [
      { id: 1, name: "Laptop Pro", category: "Electronics", price: 2499 },
      {
        id: 2,
        name: "Noise Cancelling Headphones",
        category: "Electronics",
        price: 399,
      },
      {
        id: 3,
        name: "Ultra‑Wide Monitor",
        category: "Electronics",
        price: 999,
      },
      { id: 4, name: "Ergonomic Chair", category: "Furniture", price: 799 },
      { id: 5, name: "Standing Desk", category: "Furniture", price: 1199 },
    ];

    allProducts.forEach((product) => {
      renderWithRouter(<ProductCard product={product} />);
      expect(screen.getByText(product.category)).toBeInTheDocument();
      expect(screen.queryByText("Accessories")).not.toBeInTheDocument();
    });
  });
});
