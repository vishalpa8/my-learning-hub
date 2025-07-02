import { render, screen } from "@testing-library/react";
import Footer from "../components/shared/Footer";

describe("Footer", () => {
  it("renders the correct copyright information", () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} MyLearningHub. All rights reserved.`)
    ).toBeInTheDocument();
  });
});
