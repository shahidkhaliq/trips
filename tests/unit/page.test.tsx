import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("Home Page", () => {
	it("renders the main heading", () => {
		render(<Home />);

		const heading = screen.getByRole("heading", { level: 1 });
		expect(heading).toBeInTheDocument();
		expect(heading).toHaveTextContent(/to get started/i);
	});

	it("renders the Next.js logo", () => {
		render(<Home />);

		const logo = screen.getByAltText("Next.js logo");
		expect(logo).toBeInTheDocument();
	});

	it("renders the deploy button", () => {
		render(<Home />);

		const deployButton = screen.getByRole("link", { name: /deploy now/i });
		expect(deployButton).toBeInTheDocument();
		expect(deployButton).toHaveAttribute("href", expect.stringContaining("vercel.com"));
	});

	it("renders the documentation link", () => {
		render(<Home />);

		const docsLink = screen.getByRole("link", { name: /documentation/i });
		expect(docsLink).toBeInTheDocument();
		expect(docsLink).toHaveAttribute("href", expect.stringContaining("nextjs.org/docs"));
	});
});
