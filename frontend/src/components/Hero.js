import React from "react";
import { ArrowRight, Play } from "lucide-react";

/**
 * Hero Component
 * Modern hero section with Apple Store inspired design
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Hero title
 * @param {string} props.subtitle - Hero subtitle
 * @param {string} props.description - Hero description
 * @param {string} props.primaryButtonText - Primary button text
 * @param {string} props.secondaryButtonText - Secondary button text
 * @param {string} props.backgroundImage - Background image URL
 */
const Hero = ({
  title = "The future is here.",
  subtitle = "Experience innovation.",
  description = "Discover our carefully curated collection of premium products designed to enhance your digital lifestyle.",
  primaryButtonText = "Shop Now",
  secondaryButtonText = "Watch Video",
  backgroundImage = null,
}) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        {backgroundImage && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-6 leading-tight">
            {title}
            <br />
            <span className="gradient-text">{subtitle}</span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button className="btn-primary text-lg px-8 py-4 flex items-center space-x-2 group">
              <span>{primaryButtonText}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>

            <button className="btn-secondary text-lg px-8 py-4 flex items-center space-x-2 group">
              <Play className="w-5 h-5" />
              <span>{secondaryButtonText}</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                10K+
              </div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                500+
              </div>
              <div className="text-gray-600">Premium Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                24/7
              </div>
              <div className="text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
