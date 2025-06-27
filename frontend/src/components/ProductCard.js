import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Star } from "lucide-react";

/**
 * ProductCard Component
 * Modern, Apple Store inspired product card with hover effects and animations
 *
 * @param {Object} product - Product data object
 * @param {string} product.id - Product ID
 * @param {string} product.name - Product name
 * @param {string} product.category - Product category
 * @param {number} product.price - Product price
 * @param {number} product.originalPrice - Original price (for discounts)
 * @param {string} product.description - Product description
 * @param {string} product.image - Product image URL
 * @param {string} product.badge - Badge text (New, Sale, etc.)
 * @param {number} product.rating - Product rating (1-5)
 * @param {number} product.reviewCount - Number of reviews
 */
const ProductCard = ({ product }) => {
  // Handle missing image with placeholder
  const imageUrl =
    product.image ||
    `https://via.placeholder.com/400x400/f8f9fa/6c757d?text=${encodeURIComponent(
      product.name?.charAt(0) || "P"
    )}`;

  // Calculate discount percentage if original price exists
  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : null;

  return (
    <div className="product-card animate-scale-in">
      {/* Product Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/400x400/f8f9fa/6c757d?text=${encodeURIComponent(
              product.name?.charAt(0) || "P"
            )}`;
          }}
        />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-4 left-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                product.badge === "New"
                  ? "bg-blue-500 text-white"
                  : product.badge === "Sale"
                  ? "bg-red-500 text-white"
                  : "bg-gray-900 text-white"
              }`}
            >
              {product.badge}
            </span>
          </div>
        )}

        {/* Discount Badge */}
        {discountPercentage && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
              -{discountPercentage}%
            </span>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 flex space-x-2">
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110">
              <Heart className="w-5 h-5 text-gray-600" />
            </button>
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110">
              <ShoppingCart className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        {/* Category */}
        <div className="mb-2">
          <span className="text-sm text-gray-500 uppercase tracking-wide font-medium">
            {product.category}
          </span>
        </div>

        {/* Product Name */}
        <Link to={`/items/${product.id}`} className="block">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        {product.description && (
          <p className="text-gray-600 mb-4 text-sm line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            {product.reviewCount && (
              <span className="text-sm text-gray-500 ml-2">
                ({product.reviewCount})
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">
              ${product.price?.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-lg text-gray-500 line-through">
                ${product.originalPrice?.toLocaleString()}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button className="btn-primary text-sm px-4 py-2">Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
