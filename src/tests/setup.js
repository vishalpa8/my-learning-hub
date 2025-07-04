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

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.stubGlobal("ResizeObserver", ResizeObserverMock);

// Mock IntersectionObserver
const IntersectionObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

// Mock Dexie for useIndexedDb hook
vi.mock("dexie", async () => {
  const actualDexie = await vi.importActual("dexie");
  const mockDb = new actualDexie.default("my-learning-hub-db-test");
  mockDb.version(1).stores({
    "keyval-store": "id",
  });

  global.__mockDexieDb = mockDb;

  return {
    ...actualDexie,
    default: function () {
      return mockDb;
    },
  };
});
