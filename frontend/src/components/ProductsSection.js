import React from "react";
import ProductCard from "./ProductCard";
import Skeleton from "./ui/Skeleton";

/**
 * ProductsSection Component
 * Modern products grid section with Apple Store inspired design
 *
 * @param {Object} props - Component props
 * @param {Array} props.products - Array of product objects
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {string} props.title - Section title
 * @param {string} props.subtitle - Section subtitle
 * @param {number} props.maxProducts - Maximum number of products to display
 */
const ProductsSection = ({
  products = [],
  loading = false,
  error = null,
  title = "Featured Products",
  subtitle = "Handpicked essentials that combine cutting-edge technology with timeless design.",
  maxProducts = 6,
}) => {
  // Filter products to maxProducts limit
  const displayedProducts = products.slice(0, maxProducts);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(maxProducts)].map((_, index) => (
              <div key={index} className="product-card">
                <Skeleton className="w-full h-64 rounded-t-2xl" />
                <div className="p-6 space-y-4">
                  <Skeleton className="w-20 h-4" />
                  <Skeleton className="w-full h-6" />
                  <Skeleton className="w-3/4 h-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="w-16 h-8" />
                    <Skeleton className="w-24 h-10 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No products found</div>
            <p className="text-gray-400">Check back later for new arrivals</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        {!loading && !error && displayedProducts.length > 0 && (
          <div className="text-center mt-12 animate-fade-in">
            <button className="btn-secondary text-lg px-8 py-4">
              View All Products
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
