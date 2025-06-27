import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Calendar,
  Tag,
  DollarSign,
  Edit,
  Trash2,
} from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Skeleton from "../components/ui/Skeleton";
import { useData } from "../state/DataContext";

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, loading, error } = useData();
  const [item, setItem] = useState(null);

  useEffect(() => {
    if (items.length > 0) {
      const foundItem = items.find((item) => item.id === parseInt(id));
      setItem(foundItem);
    }
  }, [id, items]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Skeleton variant="rectangular" className="w-32 h-8 mb-4" />
            <Skeleton variant="title" className="w-3/4 mb-2" />
            <Skeleton variant="text" className="w-1/2" />
          </div>
          <Card>
            <Card.Content>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <Skeleton
                    variant="rectangular"
                    className="w-full h-64 mb-4"
                  />
                </div>
                <div className="space-y-4">
                  <Skeleton variant="title" className="w-3/4" />
                  <Skeleton variant="text" className="w-full" />
                  <Skeleton variant="text" className="w-2/3" />
                  <Skeleton variant="rectangular" className="w-24 h-8" />
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Error Loading Item
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => navigate("/items")} variant="primary">
              Back to Items
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Item Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The item you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate("/items")} variant="primary">
              Back to Items
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/items")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Items</span>
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link to="/" className="hover:text-gray-700 transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                to="/items"
                className="hover:text-gray-700 transition-colors"
              >
                Items
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{item.name}</li>
          </ol>
        </nav>

        {/* Item Details */}
        <Card className="overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 p-8 lg:p-12">
              <div className="aspect-square flex items-center justify-center">
                <div className="text-8xl text-gray-400 font-bold">
                  {item.name.charAt(0).toUpperCase()}
                </div>
              </div>
              {item.category && (
                <Badge variant="primary" className="absolute top-4 left-4">
                  {item.category}
                </Badge>
              )}
            </div>

            {/* Details Section */}
            <div className="p-6 lg:p-8">
              <div className="space-y-6">
                {/* Title and Category */}
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    {item.name}
                  </h1>
                  {item.category && (
                    <p className="text-lg text-gray-600 flex items-center space-x-2">
                      <Tag className="w-4 h-4" />
                      <span>{item.category}</span>
                    </p>
                  )}
                </div>

                {/* Price */}
                {item.price && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <span className="text-3xl font-bold text-gray-900">
                      ${item.price}
                    </span>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description ||
                      "No description available for this item."}
                  </p>
                </div>

                {/* Metadata */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Package className="w-4 h-4" />
                    <span>ID: {item.id}</span>
                  </div>
                  {item.createdAt && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Created: {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {item.updatedAt && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Updated: {new Date(item.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    Add to Cart
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Save for Later
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Related Items Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Related Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items
              .filter(
                (relatedItem) =>
                  relatedItem.id !== item.id &&
                  relatedItem.category === item.category
              )
              .slice(0, 3)
              .map((relatedItem) => (
                <Card
                  key={relatedItem.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => navigate(`/items/${relatedItem.id}`)}
                >
                  <div className="relative">
                    <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 rounded-t-lg flex items-center justify-center">
                      <div className="text-4xl text-gray-400">
                        {relatedItem.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    {relatedItem.category && (
                      <Badge
                        variant="primary"
                        className="absolute top-2 left-2"
                      >
                        {relatedItem.category}
                      </Badge>
                    )}
                  </div>

                  <Card.Content>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {relatedItem.name}
                    </h3>
                    {relatedItem.price && (
                      <p className="text-xl font-bold text-gray-900">
                        ${relatedItem.price}
                      </p>
                    )}
                  </Card.Content>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
