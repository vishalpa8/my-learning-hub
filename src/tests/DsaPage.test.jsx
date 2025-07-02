import { render, screen, waitFor, within } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import DsaPage from "../pages/DsaPage";
import { RewardProvider } from "../contexts/RewardContext";
import * as useIndexedDb from "../hooks/useIndexedDb";
import {
  DSA_COMPLETED_PROBLEMS_KEY,
  DSA_LAST_ACTIVE_VIEW_KEY,
} from "../constants/localIndexedDbKeys";

vi.mock("react-chartjs-2", () => ({
  Doughnut: () => null,
}));

vi.mock("../hooks/useUserProfile", () => ({
  useUserProfile: vi.fn(() => [{}, vi.fn(), vi.fn()]),
}));

vi.mock("../hooks/useIndexedDb");

describe("DsaPage", () => {
  let completedProblems = {};
  const setCompletedProblems = vi.fn((update) => {
    if (typeof update === "function") {
      completedProblems = update(completedProblems);
    } else {
      completedProblems = update;
    }
  });

  beforeEach(() => {
    completedProblems = {};
    useIndexedDb.useIndexedDb.mockImplementation((key, initialValue) => {
      if (key === DSA_COMPLETED_PROBLEMS_KEY) {
        return [completedProblems, setCompletedProblems];
      }
      if (key === DSA_LAST_ACTIVE_VIEW_KEY) {
        return ["dashboard", vi.fn()];
      }
      return [initialValue, vi.fn()];
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
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
    expect(
      screen.getByTestId("dashboard-view")
    ).toBeInTheDocument();
  });

  it("switches to the 'All Problems' view when the tab is clicked", async () => {
    const user = userEvent.setup();
    renderPage();
    const allProblemsTab = screen.getByRole("button", {
      name: /All Problems/i,
    });

    await user.click(allProblemsTab);

    await waitFor(() => {
      expect(
        screen.queryByTestId("dashboard-view")
      ).not.toBeInTheDocument();
    });
    expect(await screen.findByTestId("problem-list-view")).toBeInTheDocument();
  });

  it("filters problems by difficulty and clears the filter", async () => {
    const user = userEvent.setup();
    renderPage();
    const allProblemsTab = screen.getByRole("button", {
      name: /All Problems/i,
    });
    await user.click(allProblemsTab);

    const difficultyFilter = await screen.findByLabelText("Difficulty:");
    await user.selectOptions(difficultyFilter, "easy");

    await waitFor(() => {
      const problems = screen.getAllByRole("article");
      expect(problems.length).toBeGreaterThan(0);
      problems.forEach((problem) => {
        expect(
          within(problem).getByText("Easy")
        ).toBeInTheDocument();
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
    const allProblemsTab = screen.getByRole("button", {
      name: /All Problems/i,
    });
    await user.click(allProblemsTab);

    const firstProblemCheckbox = (
      await screen.findAllByRole("checkbox")
    )[0];
    expect(firstProblemCheckbox).not.toBeChecked();

    await user.click(firstProblemCheckbox);
    expect(firstProblemCheckbox).toBeChecked();
    expect(setCompletedProblems).toHaveBeenCalledTimes(1);

    await user.click(firstProblemCheckbox);
    expect(firstProblemCheckbox).not.toBeChecked();
    expect(setCompletedProblems).toHaveBeenCalledTimes(2);
  });

  it("should have no accessibility violations", async () => {
    const { container } = renderPage();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});