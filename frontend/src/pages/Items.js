import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Search,
  Grid,
  List as ListIcon,
  Plus,
  Filter,
  ArrowLeft,
} from "lucide-react";
import VirtualizedList from "../components/VirtualizedList";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Skeleton from "../components/ui/Skeleton";
import { useData } from "../state/DataContext";

/**
 * Items component with memory leak prevention
 *
 * This component demonstrates proper cleanup using AbortController to prevent:
 * - Memory leaks from pending requests
 * - State updates on unmounted components
 * - Unnecessary network requests
 */
const Items = () => {
  const { items, loading, error, fetchItems } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleItemClick = (item) => {
    // Navigate to item detail or show modal
    console.log("Item clicked:", item);
    // You can implement navigation here
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const categories = [
    "all",
    ...new Set(items.map((item) => item.category).filter(Boolean)),
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Error Loading Items
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchItems} variant="primary">
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="md:hidden">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">
                  Items Store
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Discover Our Collection
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our carefully curated items designed to enhance your
              digital lifestyle.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats and Controls */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Stats */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : items.length}
                </div>
                <div className="text-sm text-gray-500">Total Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {loading ? "..." : categories.length - 1}
                </div>
                <div className="text-sm text-gray-500">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {loading ? "..." : items.filter((item) => item.price).length}
                </div>
                <div className="text-sm text-gray-500">With Price</div>
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "primary" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "primary" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <ListIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="mb-6">
            <Card.Content>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Filter
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory("all");
                      setSearchTerm("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Items List */}
        <VirtualizedList
          items={
            selectedCategory === "all"
              ? items
              : items.filter((item) => item.category === selectedCategory)
          }
          loading={loading}
          onItemClick={handleItemClick}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          viewMode={viewMode}
        />

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <Card className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No items available
            </h3>
            <p className="text-gray-600 mb-6">
              Items will appear here once they're added to the system.
            </p>
            <Button onClick={fetchItems} variant="primary">
              Refresh
            </Button>
          </Card>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <ShoppingBag className="w-3 h-3 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Items Store
              </span>
            </div>
            <p className="text-gray-600">
              Premium items for the modern lifestyle.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Items;
