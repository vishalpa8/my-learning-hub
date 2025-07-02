import { render, screen, waitFor } from "@testing-library/react";
import App from "../App";

describe("App", () => {
  it("renders the main application and displays the home page", async () => {
    render(<App />);
    // Wait for the HomePage to be loaded
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /My Learning Hub/i })
      ).toBeInTheDocument();
    });
  });
});
