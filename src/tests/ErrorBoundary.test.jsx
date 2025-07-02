import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import ErrorBoundary from "../components/shared/ErrorBoundary";

// A component that throws an error
const ProblematicComponent = () => {
  throw new Error("Test error");
};

describe("ErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Child component</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("Child component")).toBeInTheDocument();
  });

  it("renders the fallback UI when an error is thrown", () => {
    // Suppress the expected error from appearing in the console
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Oops! Something went wrong.")).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      const hasText = (node) => node.textContent === "Error details: Test error";
      const elementHasText = hasText(element);
      const childrenDontHaveText = Array.from(element.children).every(
        (child) => !hasText(child)
      );
      return elementHasText && childrenDontHaveText;
    })).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});
