import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import ChatInterface from "../../components/ai/ChatInterface";
import { RewardProvider } from "../../contexts/RewardContext";
import * as useIndexedDb from "../../hooks/useIndexedDb";
import * as openRouter from "../../hooks/openRouter";
import * as gemini from "../../hooks/gemini";

// Mock child components and hooks
vi.mock("../../hooks/useAIChatHistory", () => ({
  useAIChatHistory: vi.fn(() => [[], vi.fn(), vi.fn(), vi.fn()]),
}));

vi.mock("../../hooks/useIndexedDb");
vi.mock("../../hooks/openRouter");
vi.mock("../../hooks/gemini");

describe("ChatInterface", () => {
  beforeEach(() => {
    useIndexedDb.useIndexedDb.mockReturnValue(["openrouter", vi.fn()]);
    openRouter.streamMessage.mockResolvedValue({
      read: () => Promise.resolve({ done: true }),
    });
    gemini.streamGeminiMessage.mockResolvedValue({
      read: () => Promise.resolve({ done: true }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <Router>
        <RewardProvider>
          <ChatInterface />
        </RewardProvider>
      </Router>
    );
  };

  it("renders the chat interface correctly", () => {
    renderComponent();
    expect(screen.getByPlaceholderText("Type your message here...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /new chat/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /select model/i })).toBeInTheDocument();
  });

  it("allows typing in the textarea", async () => {
    const user = userEvent.setup();
    renderComponent();
    const textarea = screen.getByPlaceholderText("Type your message here...");
    await user.type(textarea, "Hello, world!");
    expect(textarea).toHaveValue("Hello, world!");
  });

  it("submits a message with the OpenRouter model", async () => {
    const user = userEvent.setup();
    renderComponent();
    const textarea = screen.getByPlaceholderText("Type your message here...");
    await user.type(textarea, "Hello, OpenRouter!");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(openRouter.streamMessage).toHaveBeenCalledTimes(1);
    });
  });

  it("submits a message with the Gemini model", async () => {
    useIndexedDb.useIndexedDb.mockReturnValue(["gemini", vi.fn()]);
    const user = userEvent.setup();
    renderComponent();
    const modelSelector = screen.getByRole("combobox", { name: /select model/i });
    await user.selectOptions(modelSelector, "gemini");
    const textarea = screen.getByPlaceholderText("Type your message here...");
    await user.type(textarea, "Hello, Gemini!");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(gemini.streamGeminiMessage).toHaveBeenCalledTimes(1);
    });
  });

  it("should have no accessibility violations on initial render", async () => {
    const { container } = renderComponent();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
