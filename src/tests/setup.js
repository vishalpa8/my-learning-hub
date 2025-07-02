import "@testing-library/jest-dom";
import "fake-indexeddb/auto";
import { expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

// Mock window.scrollTo
window.scrollTo = () => {};

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = () => {};

// Mock getContext for chart.js
HTMLCanvasElement.prototype.getContext = () => {};