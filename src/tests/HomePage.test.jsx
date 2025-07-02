import { render, screen, waitFor, within } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import HomePage from "../pages/HomePage";
import * as db from "../hooks/useIndexedDb";

// Mock the useIndexedDb hook
vi.mock("../hooks/useIndexedDb", async () => {
  const actual = await vi.importActual("../hooks/useIndexedDb");
  return {
    ...actual,
    useIndexedDb: vi.fn().mockReturnValue([{}, vi.fn()]), // Default mock
    clearEntireDatabase: vi.fn(() => Promise.resolve()), // Mock as an async function
  };
});

// Mock the calculateEngagementProgress function
vi.mock("../utils/progressUtils", async () => {
  const actual = await vi.importActual("../utils/progressUtils");
  return {
    ...actual,
    calculateEngagementProgress: vi.fn().mockReturnValue({
      todaysCompleted: 1,
      todaysTotal: 1,
      todaysPercent: 100,
    }),
  };
});

// Mock window.location.reload
Object.defineProperty(window, "location", {
  value: {
    ...window.location,
    reload: vi.fn(),
  },
  writable: true,
});

describe("HomePage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render all main sections without accessibility violations", async () => {
    const { container } = render(
      <Router>
        <HomePage />
      </Router>
    );

    // Check for headings
    expect(
      screen.getByRole("heading", { name: /My Learning Hub/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Your Progress/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Features & Tips/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Advanced Settings/i })
    ).toBeInTheDocument();

    // Accessibility check
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("displays the correct initial progress card data", () => {
    render(
      <Router>
        <HomePage />
      </Router>
    );

    const progressSection = screen.getByRole("heading", {
      name: /Your Progress/i,
    }).parentElement;

    // Using more robust queries
    const dsaCard = within(progressSection)
      .getByText(/DSA & CP/i)
      .closest(".progress-card");
    expect(within(dsaCard).getByText("0 / 455 (0%)")).toBeInTheDocument();

    const chessCard = within(progressSection)
      .getByText(/Chess/i)
      .closest(".progress-card");
    expect(within(chessCard).getByText("0 / 99 (0%)")).toBeInTheDocument();

    const routineCard = within(progressSection)
      .getByText(/Daily Routine/i)
      .closest(".progress-card");
    expect(
      within(routineCard).getByText(/Today: 1 \/ 1/i)
    ).toBeInTheDocument();
  });

  it("renders all quick links with correct hrefs", () => {
    render(
      <Router>
        <HomePage />
      </Router>
    );

    expect(
      screen.getByRole("link", { name: /Go to AI Assistant/i })
    ).toHaveAttribute("href", "/ai-assistant");
    expect(
      screen.getByRole("link", { name: /Go to DSA & CP/i })
    ).toHaveAttribute("href", "/dsa");
    expect(screen.getByRole("link", { name: /Go to Chess/i })).toHaveAttribute(
      "href",
      "/chess"
    );
    expect(screen.getByRole("link", { name: /View Routine/i })).toHaveAttribute(
      "href",
      "/progress"
    );
  });

  describe("Advanced Settings - Reset Progress", () => {
    it("opens and closes the reset confirmation modal", async () => {
      const user = userEvent.setup();
      render(
        <Router>
          <HomePage />
        </Router>
      );

      const resetButton = screen.getByRole("button", {
        name: /Reset All Progress/i,
      });

      await user.click(resetButton);

      // Modal appears
      const modal = await screen.findByRole("dialog", {
        name: /Confirm Reset/i,
      });
      expect(modal).toBeInTheDocument();

      // Close modal with cancel button
      const cancelButton = within(modal).getByRole("button", {
        name: /Cancel/i,
      });
      await user.click(cancelButton);

      // Modal disappears
      await waitFor(() => {
        expect(modal).not.toBeInTheDocument();
      });
    });

    it("calls clearEntireDatabase and reloads when reset is confirmed", async () => {
      const user = userEvent.setup();
      render(
        <Router>
          <HomePage />
        </Router>
      );

      const resetButton = screen.getByRole("button", {
        name: /Reset All Progress/i,
      });

      await user.click(resetButton);

      // Modal appears
      const modal = await screen.findByRole("dialog", {
        name: /Confirm Reset/i,
      });

      // Click confirm button
      const confirmButton = within(modal).getByRole("button", {
        name: /Yes, Reset All/i,
      });
      await user.click(confirmButton);

      // Assert that the database function was called
      expect(db.clearEntireDatabase).toHaveBeenCalledTimes(1);

      // Assert that the page reloads
      await waitFor(() => {
        expect(window.location.reload).toHaveBeenCalledTimes(1);
      });

      // Assert that the modal is closed
      await waitFor(() => {
        expect(modal).not.toBeInTheDocument();
      });
    });
  });
});