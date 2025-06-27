import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Home,
  Package,
  Settings,
  Menu,
  X,
  Search,
  User,
  Heart,
} from "lucide-react";

/**
 * Navigation Component
 * Modern navigation bar with Apple Store inspired design
 */
const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect for navigation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/items", label: "Products", icon: Package },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <span
              className={`text-xl lg:text-2xl font-bold transition-colors duration-300 ${
                isScrolled ? "text-gray-900" : "text-white"
              }`}
            >
              Store
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-black text-white"
                      : isScrolled
                      ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <button
              className={`p-2 rounded-full transition-all duration-200 ${
                isScrolled
                  ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <button
              className={`p-2 rounded-full transition-all duration-200 ${
                isScrolled
                  ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              <Heart className="w-5 h-5" />
            </button>

            {/* User Profile */}
            <button
              className={`p-2 rounded-full transition-all duration-200 ${
                isScrolled
                  ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              <User className="w-5 h-5" />
            </button>

            {/* Mobile menu button */}
            <button
              className={`md:hidden p-2 rounded-full transition-all duration-200 ${
                isScrolled
                  ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-black text-white"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
