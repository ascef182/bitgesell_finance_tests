import React, { useState, useEffect } from "react";
import { FixedSizeList as List } from "react-window";
import { Search, Filter, Grid, List as ListIcon } from "lucide-react";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Skeleton from "./ui/Skeleton";

const VirtualizedList = ({
  items = [],
  loading = false,
  onItemClick,
  searchTerm = "",
  onSearchChange,
  viewMode = "grid", // 'grid' or 'list'
}) => {
  const [filteredItems, setFilteredItems] = useState(items);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Filter and sort items
  useEffect(() => {
    let filtered = items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category &&
          item.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Sort items
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredItems(filtered);
  }, [items, searchTerm, sortBy, sortOrder]);

  // Loading state
  if (loading) {
    return <Skeleton.List count={6} />;
  }

  // Grid view
  if (viewMode === "grid") {
    return (
      <div className="space-y-6">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Name</option>
              <option value="category">Category</option>
              <option value="price">Price</option>
              <option value="createdAt">Date Created</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600">
          Showing {filteredItems.length} of {items.length} items
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              onClick={() => onItemClick(item)}
            >
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 rounded-t-lg flex items-center justify-center">
                  <div className="text-4xl text-gray-400">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                {item.category && (
                  <Badge variant="primary" className="absolute top-2 left-2">
                    {item.category}
                  </Badge>
                )}
              </div>

              <Card.Content>
                <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {item.name}
                </h3>

                {item.category && (
                  <p className="text-sm text-gray-500 mb-3">{item.category}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {item.price ? (
                      <span className="text-xl font-bold text-gray-900">
                        ${item.price}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">No price</span>
                    )}
                  </div>

                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No items found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    );
  }

  // List view with virtualization
  const ITEM_HEIGHT = 80;
  const ITEM_COUNT = filteredItems.length;

  const Row = ({ index, style }) => {
    const item = filteredItems[index];

    return (
      <div style={style} className="px-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => onItemClick(item)}
        >
          <div className="flex items-center space-x-4 p-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-semibold text-gray-600">
                {item.name.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {item.name}
              </h3>
              {item.category && (
                <p className="text-sm text-gray-500 truncate">
                  {item.category}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-4 flex-shrink-0">
              {item.price && (
                <span className="font-semibold text-gray-900">
                  ${item.price}
                </span>
              )}
              <Button size="sm" variant="outline">
                View
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Name</option>
            <option value="category">Category</option>
            <option value="price">Price</option>
            <option value="createdAt">Date Created</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredItems.length} of {items.length} items
      </div>

      {/* Virtualized List */}
      {filteredItems.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border">
          <List
            height={600}
            itemCount={ITEM_COUNT}
            itemSize={ITEM_HEIGHT}
            width="100%"
          >
            {Row}
          </List>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No items found
          </h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default VirtualizedList;
