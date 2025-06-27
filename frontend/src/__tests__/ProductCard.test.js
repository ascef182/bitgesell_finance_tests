import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import ProductCard from "../components/ProductCard";

const renderProductCard = (product) => {
  return render(
    <BrowserRouter>
      <ProductCard product={product} />
    </BrowserRouter>
  );
};

describe("ProductCard Component", () => {
  const mockProduct = {
    id: 1,
    name: "Laptop Pro",
    category: "Electronics",
    price: 2499,
    description: "High-performance laptop for professionals",
  };

  test("renders basic product information", () => {
    renderProductCard(mockProduct);

    // Check if basic product information is present
    expect(screen.getByText("Laptop Pro")).toBeInTheDocument();
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(
      screen.getByText("High-performance laptop for professionals")
    ).toBeInTheDocument();
  });

  test("renders product image", () => {
    renderProductCard(mockProduct);

    // Check if product image is present
    const image = screen.getByAltText("Laptop Pro");
    expect(image).toBeInTheDocument();
    expect(image.src).toContain("/photos/Laptop.jpeg");
  });

  test("renders add to cart button", () => {
    renderProductCard(mockProduct);

    // Check if add to cart button is present
    expect(screen.getByText("Add to Cart")).toBeInTheDocument();
  });

  test("renders furniture product correctly", () => {
    const furnitureProduct = {
      id: 4,
      name: "Ergonomic Chair",
      category: "Furniture",
      price: 799,
      description: "Comfortable chair for long work sessions",
    };

    renderProductCard(furnitureProduct);

    // Check if furniture product is rendered correctly
    expect(screen.getByText("Ergonomic Chair")).toBeInTheDocument();
    expect(screen.getByText("Furniture")).toBeInTheDocument();
    expect(
      screen.getByText("Comfortable chair for long work sessions")
    ).toBeInTheDocument();

    // Check if correct image is used
    const image = screen.getByAltText("Ergonomic Chair");
    expect(image.src).toContain("/photos/chair.jpeg");
  });

  test("renders electronics product correctly", () => {
    const electronicsProduct = {
      id: 2,
      name: "Noise Cancelling Headphones",
      category: "Electronics",
      price: 399,
      description: "Premium audio experience",
    };

    renderProductCard(electronicsProduct);

    // Check if electronics product is rendered correctly
    expect(screen.getByText("Noise Cancelling Headphones")).toBeInTheDocument();
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("Premium audio experience")).toBeInTheDocument();

    // Check if correct image is used
    const image = screen.getByAltText("Noise Cancelling Headphones");
    expect(image.src).toContain("/photos/headphones.jpeg");
  });

  test("renders product with badge", () => {
    const productWithBadge = {
      ...mockProduct,
      badge: "New",
    };

    renderProductCard(productWithBadge);

    // Check if badge is present
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  test("renders product with discount", () => {
    const productWithDiscount = {
      ...mockProduct,
      originalPrice: 2999,
    };

    renderProductCard(productWithDiscount);

    // Check if original crossed price is present
    expect(screen.getByText("$2,999")).toBeInTheDocument();
    expect(screen.getByText("-17%")).toBeInTheDocument();
  });

  test("renders product with rating", () => {
    const productWithRating = {
      ...mockProduct,
      rating: 4.5,
      reviewCount: 128,
    };

    renderProductCard(productWithRating);

    // Check if rating is present
    expect(screen.getByText("(128)")).toBeInTheDocument();
  });

  test("handles missing optional fields gracefully", () => {
    const minimalProduct = {
      id: 1,
      name: "Basic Product",
      category: "Electronics",
      price: 100,
    };

    renderProductCard(minimalProduct);

    // Check if basic product renders without errors
    expect(screen.getByText("Basic Product")).toBeInTheDocument();
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("$100")).toBeInTheDocument();
  });

  test("uses correct images for all products", () => {
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

    // Test each product individually
    allProducts.forEach((product) => {
      const { unmount } = renderProductCard(product);

      const image = screen.getByAltText(product.name);
      expect(image).toBeInTheDocument();

      // Check if category is present
      expect(screen.getByText(product.category)).toBeInTheDocument();

      unmount();
    });
  });
});
