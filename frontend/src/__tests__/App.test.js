import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import App from "../pages/App";

// Mock simples do DataContext
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

// Mock dos componentes de página
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

    // Verifica se os elementos principais da navegação estão presentes
    expect(screen.getAllByText("Store").length).toBeGreaterThan(0);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getAllByText("Products").length).toBeGreaterThan(0);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  test("renders hero section", () => {
    renderApp();

    // Verifica se a seção hero está presente
    expect(screen.getByText("The future is here.")).toBeInTheDocument();
    expect(screen.getByText("Experience innovation.")).toBeInTheDocument();
    expect(screen.getByText("Shop Now")).toBeInTheDocument();
  });

  test("renders featured products section", () => {
    renderApp();

    // Verifica se a seção de produtos em destaque está presente
    expect(screen.getByText("Featured Products")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Handpicked essentials that combine cutting-edge technology with timeless design."
      )
    ).toBeInTheDocument();
  });

  test("renders all products from data", () => {
    renderApp();

    // Verifica se todos os produtos dos dados reais estão sendo exibidos
    expect(screen.getByText("Laptop Pro")).toBeInTheDocument();
    expect(screen.getByText("Noise Cancelling Headphones")).toBeInTheDocument();
    expect(screen.getByText("Ultra‑Wide Monitor")).toBeInTheDocument();
    expect(screen.getByText("Ergonomic Chair")).toBeInTheDocument();
    expect(screen.getByText("Standing Desk")).toBeInTheDocument();
  });

  test("renders categories section with real categories", () => {
    renderApp();

    // Verifica se a seção de categorias está presente
    expect(screen.getByText("Shop by Category")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Explore our curated collections designed for every lifestyle"
      )
    ).toBeInTheDocument();

    // Verifica se as categorias reais estão presentes (usando getAllByText para elementos duplicados)
    expect(screen.getAllByText("Electronics").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Furniture").length).toBeGreaterThan(0);
  });

  test("renders features section", () => {
    renderApp();

    // Verifica se a seção de recursos está presente
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

    // Verifica se o footer está presente (usando texto parcial)
    expect(
      screen.getByText(/©.*Store.*All rights reserved/)
    ).toBeInTheDocument();
  });

  test("displays correct product counts", () => {
    renderApp();

    // Verifica se as contagens de produtos estão corretas
    expect(screen.getByText("3 products")).toBeInTheDocument(); // Electronics
    expect(screen.getByText("2 products")).toBeInTheDocument(); // Furniture
  });

  test("renders formatted prices", () => {
    renderApp();

    // Verifica se os preços estão sendo exibidos (formatação pode variar)
    const pageText = document.body.textContent || "";

    // Verifica se os valores dos preços estão presentes (formatados ou não)
    expect(pageText).toMatch(/2,499/); // Formatação USD
    expect(pageText).toMatch(/399/);
    expect(pageText).toMatch(/999/);
    expect(pageText).toMatch(/799/);
    expect(pageText).toMatch(/1,199/); // Formatação USD
  });
});
