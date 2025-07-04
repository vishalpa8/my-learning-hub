import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import DsaPage from "../pages/DsaPage";
import { RewardProvider } from "../contexts/RewardContext";
import * as useIndexedDb from "../hooks/useIndexedDb";
import { dateToDDMMYYYY } from "../utils/dateHelpers";
import {
  DSA_COMPLETED_PROBLEMS_KEY,
  DSA_LAST_ACTIVE_VIEW_KEY,
  DSA_LAST_VISITED_VIEW_DATES_KEY,
} from "../constants/localIndexedDbKeys";

vi.mock("react-chartjs-2", () => ({
  Doughnut: () => null,
}));

vi.mock("../hooks/useUserProfile", () => ({
  useUserProfile: vi.fn(() => [{}, vi.fn(), vi.fn()]),
}));

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

// Mock useIndexedDb to control its internal state for testing persistence
vi.mock("../hooks/useIndexedDb", async (importOriginal) => {
  const actual = await importOriginal();
  // Use actual useState from React to manage mock state
  const useState = React.useState;

  let mockActiveView = "dashboard";
  let mockCompletedProblems = {};
  let mockLastVisitedViewDates = {};

  const mockUseIndexedDb = vi.fn((key, initialValue) => {
    if (key === DSA_COMPLETED_PROBLEMS_KEY) {
      const [state, setState] = useState(mockCompletedProblems);
      mockCompletedProblems = state; // Keep external mock variable in sync
      return [
        state,
        vi.fn((update) => {
          setState(update);
          if (typeof update === "function") {
            mockCompletedProblems = update(mockCompletedProblems);
          } else {
            mockCompletedProblems = update;
          }
        }),
      ];
    } else if (key === DSA_LAST_ACTIVE_VIEW_KEY) {
      const [state, setState] = useState(mockActiveView);
      mockActiveView = state; // Keep external mock variable in sync
      return [
        state,
        vi.fn((newValue) => {
          setState(newValue);
          mockActiveView = newValue;
        }),
      ];
    } else if (key === DSA_LAST_VISITED_VIEW_DATES_KEY) {
      const [state, setState] = useState(mockLastVisitedViewDates);
      mockLastVisitedViewDates = state; // Keep external mock variable in sync
      return [
        state,
        vi.fn((update) => {
          setState(update);
          if (typeof update === "function") {
            mockLastVisitedViewDates = update(mockLastVisitedViewDates);
          } else {
            mockLastVisitedViewDates = update;
          }
        }),
      ];
    }
    return [initialValue, vi.fn()];
  });

  return {
    ...actual,
    useIndexedDb: mockUseIndexedDb,
    __setMockActiveView: (newView) => {
      mockActiveView = newView;
    },
    __setMockCompletedProblems: (newCompleted) => {
      mockCompletedProblems = newCompleted;
    },
    __setMockLastVisitedViewDates: (newDates) => {
      mockLastVisitedViewDates = newDates;
    },
    __getMockLastVisitedViewDates: () => mockLastVisitedViewDates,
  };
});

describe("DsaPage", () => {
  beforeEach(() => {
    useIndexedDb.__setMockCompletedProblems({}); // Reset mock completed problems
    useIndexedDb.__setMockActiveView("dashboard"); // Reset mock active view
    useIndexedDb.__setMockLastVisitedViewDates({}); // Reset mock last visited view dates
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderPage = () => {
    return render(
      <Router>
        <RewardProvider>
          <DsaPage />
        </RewardProvider>
      </Router>
    );
  };

  it("renders the main heading and dashboard view by default", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /DSA & CP Pathway/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-view")).toBeInTheDocument();
  });

  it("switches to the 'All Problems' view when the tab is clicked", async () => {
    const user = userEvent.setup();
    renderPage();
    const allProblemsTab = screen.getByRole("button", {
      name: /All Problems/i,
    });

    await user.click(allProblemsTab);

    await waitFor(() => {
      expect(screen.queryByTestId("dashboard-view")).not.toBeInTheDocument();
    });
    expect(await screen.findByTestId("problem-list-view")).toBeInTheDocument();
  });

  it("filters problems by difficulty and clears the filter", async () => {
    const user = userEvent.setup();
    renderPage();
    const allProblemsTab = screen.getByRole("button", { name: /All Problems/i });
    await user.click(allProblemsTab);
    await waitFor(() => {
      expect(screen.getByTestId("problem-list-view")).toBeInTheDocument();
    });

    const difficultyFilter = await screen.findByLabelText("Difficulty:");
    await user.selectOptions(difficultyFilter, "easy");

    await waitFor(() => {
      const problems = screen.getAllByRole("article");
      expect(problems.length).toBeGreaterThan(0);
      problems.forEach((problem) => {
        expect(within(problem).getByText("Easy")).toBeInTheDocument();
      });
    });

    await user.selectOptions(difficultyFilter, "all");
    await waitFor(() => {
      const problems = screen.getAllByRole("article");
      expect(problems.length).toBe(10); // Assuming 10 problems per page
    });
  });

  it("toggles problem completion status and updates data", async () => {
    const user = userEvent.setup();
    renderPage();
    const allProblemsTab = screen.getByRole("button", { name: /All Problems/i });
    await user.click(allProblemsTab);
    await waitFor(() => {
      expect(screen.getByTestId("problem-list-view")).toBeInTheDocument();
    });

    const firstProblemCheckbox = (await screen.findAllByRole("checkbox"))[0];
    expect(firstProblemCheckbox).not.toBeChecked();

    await user.click(firstProblemCheckbox);
    expect(firstProblemCheckbox).toBeChecked();
    // expect(useIndexedDb.__setMockCompletedProblems).toHaveBeenCalledTimes(1);

    await user.click(firstProblemCheckbox);
    expect(firstProblemCheckbox).not.toBeChecked();
    // expect(useIndexedDb.__setMockCompletedProblems).toHaveBeenCalledTimes(2);
  });

  it("should persist completed problems across renders", async () => {
    const user = userEvent.setup();
    const { unmount } = renderPage();

    const allProblemsTab = screen.getByRole("button", { name: /All Problems/i });
    await user.click(allProblemsTab);

    const firstProblemCheckbox = (await screen.findAllByRole("checkbox"))[0];
    await user.click(firstProblemCheckbox);
    expect(firstProblemCheckbox).toBeChecked();

    // Unmount and re-render to simulate persistence
    unmount();
    renderPage();

    const reRenderedAllProblemsTab = screen.getByRole("button", { name: /All Problems/i });
    await user.click(reRenderedAllProblemsTab);

    const reRenderedFirstProblemCheckbox = (await screen.findAllByRole("checkbox"))[0];
    expect(reRenderedFirstProblemCheckbox).toBeChecked();
  });

  it("should persist the active view across renders", async () => {
    const user = userEvent.setup();
    const { unmount } = renderPage();

    const neetCodeTab = screen.getByRole("button", { name: /NeetCode 150/i });
    await user.click(neetCodeTab);

    await waitFor(() => {
      expect(screen.queryByTestId("dashboard-view")).not.toBeInTheDocument();
      expect(screen.getByTestId("problem-list-view")).toBeInTheDocument();
    });

    // Unmount and re-render to simulate persistence
    unmount();
    renderPage();

    // Expect the NeetCode 150 tab to be active and problem list view to be rendered
    expect(screen.getByRole("button", { name: /NeetCode 150/i })).toHaveClass("active");
    expect(screen.getByTestId("problem-list-view")).toBeInTheDocument();
  });

  it("should persist last visited view dates across renders", async () => {
    const user = userEvent.setup();
    const { unmount } = renderPage();

    const striverSdeTab = screen.getByRole("button", { name: /Striver SDE/i });
    await user.click(striverSdeTab);

    const today = dateToDDMMYYYY(new Date());

    // Unmount and re-render to simulate persistence
    unmount();
    renderPage();

    // The mock should have captured the updated date
    expect(useIndexedDb.__getMockLastVisitedViewDates()).toEqual({
      striverSdeSheet: today,
    });

    // Verify the date is displayed on the re-rendered component
    const striverSdeTabAfterRender = screen.getByRole("button", { name: /Striver SDE/i });
    await user.click(striverSdeTabAfterRender); // Click again to ensure the view is active and date is displayed
    expect(screen.getByText(`Last Visited: ${today}`)).toBeInTheDocument();
  });

  it("should have no accessibility violations", async () => {
    const { container } = renderPage();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});