import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navigation from "../components/Navigation";
import Hero from "../components/Hero";
import ProductsSection from "../components/ProductsSection";
import Footer from "../components/Footer";
import Items from "./Items";
import ItemDetail from "./ItemDetail";
import ErrorBoundary from "../components/ErrorBoundary";
import { DataProvider, useData } from "../state/DataContext";

/**
 * HomePage Component
 * Modern home page with Apple Store inspired design
 */
const HomePage = () => {
  const { items, loading, error, fetchItems } = useData();

  // Fetch products on component mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Featured Products Section */}
      <ProductsSection
        products={items}
        loading={loading}
        error={error}
        title="Featured Products"
        subtitle="Handpicked essentials that combine cutting-edge technology with timeless design."
        maxProducts={6}
      />

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore our curated collections designed for every lifestyle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Electronics",
                description: "Cutting-edge technology for the modern world",
                image:
                  "https://via.placeholder.com/400x300/f8f9fa/6c757d?text=Electronics",
                count: items.filter((item) => item.category === "Electronics")
                  .length,
              },
              {
                name: "Furniture",
                description: "Elegant designs for your living space",
                image:
                  "https://via.placeholder.com/400x300/f8f9fa/6c757d?text=Furniture",
                count: items.filter((item) => item.category === "Furniture")
                  .length,
              },
              {
                name: "Accessories",
                description: "Essential add-ons for your devices",
                image:
                  "https://via.placeholder.com/400x300/f8f9fa/6c757d?text=Accessories",
                count: items.filter((item) => item.category === "Accessories")
                  .length,
              },
            ].map((category, index) => (
              <div
                key={category.name}
                className="group cursor-pointer animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="relative overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {category.count} products
                      </span>
                      <button className="btn-primary text-sm px-4 py-2">
                        Explore
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Why Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're committed to providing the best shopping experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Premium Quality",
                description:
                  "Every product is carefully selected and tested for quality assurance",
                icon: "✨",
              },
              {
                title: "Fast Shipping",
                description:
                  "Free shipping on orders over $50 with 2-3 day delivery",
                icon: "🚚",
              },
              {
                title: "24/7 Support",
                description:
                  "Our customer support team is always here to help you",
                icon: "💬",
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/**
 * SettingsPage Component
 * Simple settings page placeholder
 */
const SettingsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Settings</h1>
          <p className="text-gray-600">Settings page coming soon...</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Main App Component
 * Root component with routing and layout structure
 */
const App = () => {
  return (
    <ErrorBoundary>
      <DataProvider>
        <div className="min-h-screen">
          <Navigation />
          <main className="pt-16 lg:pt-20">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/items" element={<Items />} />
              <Route path="/items/:id" element={<ItemDetail />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </DataProvider>
    </ErrorBoundary>
  );
};

export default App;
