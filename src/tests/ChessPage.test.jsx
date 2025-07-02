import { render, screen, waitFor, within } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import ChessPage from "../pages/ChessPage";
import { RewardProvider } from "../contexts/RewardContext";
import * as useChessUserData from "../hooks/useChessUserData";
import * as chessUtils from "../utils/chessUtils";

// Mock the custom hook
vi.mock("../hooks/useChessUserData", () => ({
  useChessUserData: vi.fn(),
}));

// Mock the DailyNugget component
vi.mock("../components/chess/DailyNugget", () => ({
  default: () => <div>Daily Nugget</div>,
}));

// Mock the chessUtils
vi.mock("../utils/chessUtils", async () => {
  const actual = await vi.importActual("../utils/chessUtils");
  return {
    ...actual,
    getStructuredChessData: vi.fn(),
  };
});

const mockChessData = [
  {
    id: "elo0-1000",
    name: "Beginner",
    prefix: "beg",
    playlists: [
      {
        id: "beg_fundamentals",
        name: "Fundamentals of Chess",
        videos: [{ id: "v1", globalId: "beg_fundamentals_v1", title: "Video 1" }],
      },
    ],
  },
  {
    id: "elo1000-1500",
    name: "Intermediate",
    prefix: "int",
    playlists: [],
  },
  {
    id: "elo1500-2000",
    name: "Advanced",
    prefix: "adv",
    playlists: [],
  },
];

describe("ChessPage", () => {
  let handleToggleVideoComplete;

  beforeEach(() => {
    handleToggleVideoComplete = vi.fn();
    useChessUserData.useChessUserData.mockReturnValue({
      completedVideos: {},
      userProfile: {
        elo: 1200,
        points: 100,
        currentStreak: 5,
        earnedBadges: [],
      },
      handleToggleVideoComplete,
    });
    chessUtils.getStructuredChessData.mockReturnValue(mockChessData);

    render(
      <Router>
        <RewardProvider>
          <ChessPage />
        </RewardProvider>
      </Router>
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the main heading and user stats", () => {
    expect(
      screen.getByRole("heading", { name: /Chess Mastery Journey/i })
    ).toBeInTheDocument();
    expect(screen.getByText("ELO")).toBeInTheDocument();
    expect(screen.getByText("1200")).toBeInTheDocument();
    expect(screen.getByText("Points")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("Streak")).toBeInTheDocument();
    expect(screen.getByText("5🔥")).toBeInTheDocument();
  });

  it("renders the ELO stage sections", () => {
    expect(
      screen.getByRole("heading", { name: /Beginner/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Intermediate/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Advanced/i })
    ).toBeInTheDocument();
  });

  it("opens the video list modal when a playlist is clicked", async () => {
    const user = userEvent.setup();
    const viewVideosButtons = screen.getAllByRole("button", {
      name: /View Videos/i,
    });
    await user.click(viewVideosButtons[0]);

    const modal = await screen.findByRole("dialog");
    expect(
      within(modal).getByRole("heading", { name: /Fundamentals of Chess/i })
    ).toBeInTheDocument();
  });

  it("toggles video completion when a video is clicked in the modal", async () => {
    const user = userEvent.setup();
    const viewVideosButtons = screen.getAllByRole("button", {
      name: /View Videos/i,
    });
    await user.click(viewVideosButtons[0]);

    const modal = await screen.findByRole("dialog");
    const videoItems = await within(modal).findAllByRole("button");
    await user.click(videoItems[1]); // Index 0 is the close button
    expect(handleToggleVideoComplete).toHaveBeenCalledTimes(1);
  });

  it("closes the video list modal", async () => {
    const user = userEvent.setup();
    const viewVideosButtons = screen.getAllByRole("button", {
      name: /View Videos/i,
    });
    await user.click(viewVideosButtons[0]);

    const modal = await screen.findByRole("dialog");
    expect(
      within(modal).getByRole("heading", { name: /Fundamentals of Chess/i })
    ).toBeInTheDocument();

    const closeButton = within(modal).getByLabelText(/close/i);
    await user.click(closeButton);

    await waitFor(() => {
      expect(modal).not.toBeInTheDocument();
    });
  });
});




