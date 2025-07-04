import { render, screen, waitFor, within } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import HomePage from "../pages/HomePage";
import * as db from "../hooks/useIndexedDb";
import * as dsaDataModule from "../data/dsaData";
import * as chessDataModule from "../data/chessData";
import * as progressUtils from "../utils/progressUtils";

// Store original data for restoration
const originalDsaData = dsaDataModule.dsaData;
const originalPlaylistVideoData = chessDataModule.playlistVideoData;

// Mock the useIndexedDb hook
vi.mock("../hooks/useIndexedDb", async () => {
  const actual = await vi.importActual("../hooks/useIndexedDb");
  let mockIndexedDbValues = {}; // Default empty state
  return {
    ...actual,
    useIndexedDb: vi.fn((key, initialValue) => [
      mockIndexedDbValues[key] !== undefined
        ? mockIndexedDbValues[key]
        : initialValue,
      vi.fn(),
    ]),
    clearEntireDatabase: vi.fn(() => Promise.resolve()),
    __setMockIndexedDbValues: (newValues) => {
      mockIndexedDbValues = { ...mockIndexedDbValues, ...newValues };
    },
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
  beforeEach(() => {
    vi.spyOn(progressUtils, "calculateEngagementProgress").mockReturnValue({
      todaysCompleted: 1,
      todaysTotal: 1,
      todaysPercent: 100,
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
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

  it("renders the hero section with correct content and links", () => {
    render(
      <Router>
        <HomePage />
      </Router>
    );

    const heroSection = screen.getByRole("main");
    expect(heroSection).toBeInTheDocument();

    expect(
      within(heroSection).getByRole("heading", { name: /My Learning Hub/i })
    ).toBeInTheDocument();

    expect(
      within(heroSection).getByText(/Welcome! Track your/i)
    ).toBeInTheDocument();

    expect(
      within(heroSection).getByRole("link", { name: /Ask AI Assistant/i })
    ).toHaveAttribute("href", "/ai-assistant");
    expect(
      within(heroSection).getByRole("link", { name: /Start DSA Journey/i })
    ).toHaveAttribute("href", "/dsa");
    expect(
      within(heroSection).getByRole("link", { name: /Learn Chess/i })
    ).toHaveAttribute("href", "/chess");
    expect(
      within(heroSection).getByRole("link", { name: /Daily Routine/i })
    ).toHaveAttribute("href", "/progress");
  });

  const totalDsaProblems = dsaDataModule.dsaData.length;
  const totalChessVideos = Object.values(
    chessDataModule.playlistVideoData
  ).reduce((acc, playlist) => acc + playlist.videos.length, 0);

  it("displays correct progress card data when data sources are empty", () => {
    // Temporarily mock dsaData and playlistVideoData for this specific test
    vi.spyOn(dsaDataModule, "dsaData", "get").mockReturnValue([]);
    vi.spyOn(chessDataModule, "playlistVideoData", "get").mockReturnValue({});

    db.__setMockIndexedDbValues({
      dsaCompletedProblems: {},
      chessLearningProgress: {},
      engagementTasks: {},
    });
    render(
      <Router>
        <HomePage />
      </Router>
    );

    const progressSection = screen.getByRole("heading", {
      name: /Your Progress/i,
    }).parentElement;

    const dsaCard = within(progressSection)
      .getByRole("heading", { name: "DSA & CP", level: 3 })
      .closest(".progress-card");
    expect(within(dsaCard).getByText("0.0%")).toBeInTheDocument();

    const chessCard = within(progressSection)
      .getByRole("heading", { name: "Chess", level: 3 })
      .closest(".progress-card");
    expect(within(chessCard).getByText("0.0%")).toBeInTheDocument();

    const routineCard = within(progressSection)
      .getByRole("heading", { name: "Daily Routine", level: 3 })
      .closest(".progress-card");
    expect(within(routineCard).getByText(/Today: 1 \/ 1/i)).toBeInTheDocument();
  });

  it("displays correct progress card data when some items are completed", () => {
    db.__setMockIndexedDbValues({
      dsaCompletedProblems: { problem1: true, problem2: true },
      chessLearningProgress: { video1: true, video2: true, video3: true },
      engagementTasks: {
        task1: true,
        task2: true,
        task3: true,
        task4: true,
        task5: true,
      },
    });
    render(
      <Router>
        <HomePage />
      </Router>
    );

    const progressSection = screen.getByRole("heading", {
      name: /Your Progress/i,
    }).parentElement;

    const dsaCard = within(progressSection)
      .getByText(/DSA & CP/i)
      .closest(".progress-card");
    expect(within(dsaCard).getByText("0.4%")).toBeInTheDocument();

    const chessCard = within(progressSection)
      .getByText(/Chess/i)
      .closest(".progress-card");
    expect(within(chessCard).getByText("3.0%")).toBeInTheDocument();

    const routineCard = within(progressSection)
      .getByText(/Daily Routine/i)
      .closest(".progress-card");
    // Mocked calculateEngagementProgress returns 1/1 (100%)
    expect(within(routineCard).getByText(/Today: 1 \/ 1/i)).toBeInTheDocument();
  });

  it("displays correct progress card data when all items are completed", () => {
    // Mock all DSA problems as completed
    const allDsaCompleted = {};
    for (let i = 0; i < totalDsaProblems; i++) {
      allDsaCompleted[`problem${i}`] = true;
    }

    // Mock all Chess videos as completed
    const allChessCompleted = {};
    for (let i = 0; i < totalChessVideos; i++) {
      allChessCompleted[`video${i}`] = true;
    }

    db.__setMockIndexedDbValues({
      dsaCompletedProblems: allDsaCompleted,
      chessLearningProgress: allChessCompleted,
      engagementTasks: {
        task1: true,
        task2: true,
        task3: true,
        task4: true,
        task5: true,
      },
    });
    render(
      <Router>
        <HomePage />
      </Router>
    );

    const progressSection = screen.getByRole("heading", {
      name: /Your Progress/i,
    }).parentElement;

    const dsaCard = within(progressSection)
      .getByText(/DSA & CP/i)
      .closest(".progress-card");
    expect(within(dsaCard).getByText("100.0%")).toBeInTheDocument();

    const chessCard = within(progressSection)
      .getByText(/Chess/i)
      .closest(".progress-card");
    expect(within(chessCard).getByText("100.0%")).toBeInTheDocument();

    const routineCard = within(progressSection)
      .getByText(/Daily Routine/i)
      .closest(".progress-card");
    expect(within(routineCard).getByText(/Today: 1 \/ 1/i)).toBeInTheDocument();
  });

  it("renders progress cards with correct links", () => {
    render(
      <Router>
        <HomePage />
      </Router>
    );

    const progressSection = screen.getByRole("heading", {
      name: /Your Progress/i,
    }).parentElement;

    const dsaCard = within(progressSection)
      .getByText(/DSA & CP/i)
      .closest(".progress-card");
    expect(within(dsaCard).getByRole("link")).toHaveAttribute("href", "/dsa");

    const chessCard = within(progressSection)
      .getByText(/Chess/i)
      .closest(".progress-card");
    expect(within(chessCard).getByRole("link")).toHaveAttribute("href", "/chess");

    const routineCard = within(progressSection)
      .getByText(/Daily Routine/i)
      .closest(".progress-card");
    expect(within(routineCard).getByRole("link")).toHaveAttribute(
      "href",
      "/progress"
    );
  });

  it("displays correct engagement progress for different scenarios", () => {
    const scenarios = [
      { completed: 0, total: 5, percent: 0, label: "Today: 0 / 5" },
      { completed: 2, total: 4, percent: 50, label: "Today: 2 / 4" },
      { completed: 3, total: 3, percent: 100, label: "Today: 3 / 3" },
    ];

    scenarios.forEach(({ completed, total, percent, label }) => {
      progressUtils.calculateEngagementProgress.mockReturnValue({
        todaysCompleted: completed,
        todaysTotal: total,
        todaysPercent: percent,
      });

      const { unmount } = render(
        <Router>
          <HomePage />
        </Router>
      );

      const routineCard = screen
        .getByRole("heading", { name: "Daily Routine", level: 3 })
        .closest(".progress-card");

      expect(within(routineCard).getByText(`${percent.toFixed(1)}%`)).toBeInTheDocument();
      expect(within(routineCard).getByText(label)).toBeInTheDocument();

      // Unmount the component to reset the state for the next iteration
      unmount();
    });
  });

  it("handles clearEntireDatabase failure during reset", async () => {
    const user = userEvent.setup();
    // Mock clearEntireDatabase to throw an error
    db.clearEntireDatabase.mockImplementationOnce(() =>
      Promise.reject(new Error("Failed to clear DB"))
    );
    // Mock window.alert
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(
      <Router>
        <HomePage />
      </Router>
    );

    const resetButton = screen.getByRole("button", {
      name: /Reset All Progress/i,
    });

    await user.click(resetButton);

    const modal = await screen.findByRole("dialog", {
      name: /Confirm Reset/i,
    });

    const confirmButton = within(modal).getByRole("button", {
      name: /Yes, Reset All/i,
    });
    await user.click(confirmButton);

    // Expect clearEntireDatabase to have been called
    expect(db.clearEntireDatabase).toHaveBeenCalledTimes(1);

    // Expect window.alert to have been called with the error message
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        "Could not clear the database. Please check the console for the specific error."
      );
    });

    // Expect the modal to be closed even on error
    await waitFor(() => {
      expect(modal).not.toBeInTheDocument();
    });

    // Restore original alert function
    alertMock.mockRestore();
  });

  it("renders all quick link cards with correct content and hrefs", () => {
    render(
      <Router>
        <HomePage />
      </Router>
    );

    // AI Learning Assistant QuickLinkCard
    const aiAssistantCard = screen
      .getByRole("heading", { name: /AI Learning Assistant/i, level: 4 })
      .closest(".quick-link-card");
    expect(
      within(aiAssistantCard).getByText(
        /Get hints, code explanations, or ask questions about any topic. Powered by OpenRouter./i
      )
    ).toBeInTheDocument();
    expect(
      within(aiAssistantCard).getByRole("link", { name: /Go to AI Assistant/i })
    ).toHaveAttribute("href", "/ai-assistant");
    expect(within(aiAssistantCard).getByText("🤖")).toBeInTheDocument();

    // DSA & CP Pathway QuickLinkCard
    const dsaCpCard = screen
      .getByRole("heading", { name: /DSA & CP Pathway/i, level: 4 })
      .closest(".quick-link-card");
    expect(
      within(dsaCpCard).getByText(
        /Practice curated DSA and CP problems, filter by topic\/difficulty, and earn rewards as you progress./i
      )
    ).toBeInTheDocument();
    expect(
      within(dsaCpCard).getByRole("link", { name: /Go to DSA & CP/i })
    ).toHaveAttribute("href", "/dsa");
    expect(within(dsaCpCard).getByText("🧩")).toBeInTheDocument();

    // Chess Learning Hub QuickLinkCard
    const chessLearningCard = screen
      .getByRole("heading", { name: /Chess Learning Hub/i, level: 4 })
      .closest(".quick-link-card");
    expect(
      within(chessLearningCard).getByText(
        /Watch structured chess playlists, complete daily nuggets, and unlock achievement badges./i
      )
    ).toBeInTheDocument();
    expect(
      within(chessLearningCard).getByRole("link", { name: /Go to Chess/i })
    ).toHaveAttribute("href", "/chess");
    expect(within(chessLearningCard).getByText("♟️")).toBeInTheDocument();

    // Daily Learning Routine QuickLinkCard
    const dailyRoutineCard = screen
      .getByRole("heading", { name: /Daily Learning Routine/i, level: 4 })
      .closest(".quick-link-card");
    expect(
      within(dailyRoutineCard).getByText(
        /Manage daily tasks, track your activity on the calendar, and build consistent learning habits./i
      )
    ).toBeInTheDocument();
    expect(
      within(dailyRoutineCard).getByRole("link", { name: /View Routine/i })
    ).toHaveAttribute("href", "/progress");
    expect(within(dailyRoutineCard).getByText("📅")).toBeInTheDocument();
  });

  it("renders features and tips section with correct content", () => {
    render(
      <Router>
        <HomePage />
      </Router>
    );

    const featuresSection = screen.getByRole("heading", {
      name: /Features & Tips/i,
    }).parentElement;
    expect(
      within(featuresSection).getByText(/Live Progress:/i)
    ).toBeInTheDocument();
    expect(
      within(featuresSection).getByText(/Milestones & Rewards:/i)
    ).toBeInTheDocument();
    expect(
      within(featuresSection).getByText(/Smart Filtering:/i)
    ).toBeInTheDocument();
    expect(
      within(featuresSection).getByText(/Chess Playlists:/i)
    ).toBeInTheDocument();
    expect(
      within(featuresSection).getByText(/Daily Nuggets:/i)
    ).toBeInTheDocument();
    expect(
      within(featuresSection).getByText(/Activity Calendar:/i)
    ).toBeInTheDocument();
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

    it("calls clearEntireDatabase and reloads when reset is confirmed successfully", async () => {
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
