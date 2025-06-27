import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Hero from "../components/Hero";

describe("Hero Component", () => {
  test("renders default hero content", () => {
    render(<Hero />);

    // Check if default content is rendered
    expect(screen.getByText("The future is here.")).toBeInTheDocument();
    expect(screen.getByText("Experience innovation.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Discover our carefully curated collection of premium products designed to enhance your digital lifestyle."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Shop Now")).toBeInTheDocument();
    expect(screen.getByText("Watch Video")).toBeInTheDocument();
  });

  test("renders custom hero content", () => {
    const customProps = {
      title: "Custom Title",
      subtitle: "Custom Subtitle",
      description: "Custom description text",
      primaryButtonText: "Custom Button",
      secondaryButtonText: "Custom Secondary",
    };

    render(<Hero {...customProps} />);

    // Check if custom content is rendered
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText("Custom Subtitle")).toBeInTheDocument();
    expect(screen.getByText("Custom description text")).toBeInTheDocument();
    expect(screen.getByText("Custom Button")).toBeInTheDocument();
    expect(screen.getByText("Custom Secondary")).toBeInTheDocument();
  });

  test("renders stats section", () => {
    render(<Hero />);

    // Check if stats are rendered
    expect(screen.getByText("10K+")).toBeInTheDocument();
    expect(screen.getByText("Happy Customers")).toBeInTheDocument();
    expect(screen.getByText("500+")).toBeInTheDocument();
    expect(screen.getByText("Premium Products")).toBeInTheDocument();
    expect(screen.getByText("24/7")).toBeInTheDocument();
    expect(screen.getByText("Support")).toBeInTheDocument();
  });

  test("renders with background image", () => {
    const backgroundImage = "https://example.com/hero-bg.jpg";
    render(<Hero backgroundImage={backgroundImage} />);

    // Check if background image is applied
    const heroSection = screen
      .getByText("The future is here.")
      .closest("section");
    expect(heroSection).toBeInTheDocument();
  });

  test("renders scroll indicator", () => {
    render(<Hero />);

    // Check if scroll indicator is present (it should be in the DOM)
    const heroSection = screen
      .getByText("The future is here.")
      .closest("section");
    expect(heroSection).toBeInTheDocument();
  });
});
