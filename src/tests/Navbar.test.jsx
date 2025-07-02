import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import Navbar from "../components/shared/Navbar";
import App from "../App";

describe("Navbar", () => {
  it("renders all navigation links", () => {
    render(
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navbar />
      </Router>
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("AI Assistant")).toBeInTheDocument();
    expect(screen.getByText("DSA")).toBeInTheDocument();
    expect(screen.getByText("Chess")).toBeInTheDocument();
    expect(screen.getByText("Progress")).toBeInTheDocument();
  });

  it("navigates to the correct page when a link is clicked", async () => {
    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByText("AI Assistant"));
    expect(
      await screen.findByRole("heading", { name: /AI Learning Assistant/i })
    ).toBeInTheDocument();

    await user.click(screen.getByText("DSA"));
    expect(
      await screen.findByRole("heading", { name: /DSA & CP Pathway/i })
    ).toBeInTheDocument();

    await user.click(screen.getByText("Chess"));
    expect(
      await screen.findByRole("heading", { name: /Chess Mastery Journey/i })
    ).toBeInTheDocument();

    await user.click(screen.getByText("Progress"));
    expect(
      await screen.findByRole("heading", { name: /My Progress Dashboard/i })
    ).toBeInTheDocument();

    await user.click(screen.getByText("Home"));
    expect(
      await screen.findByRole("heading", { name: /My Learning Hub/i })
    ).toBeInTheDocument();
  });
});
