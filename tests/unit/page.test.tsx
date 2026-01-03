import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/actions/users", () => ({
	getUsers: vi.fn(() => Promise.resolve([])),
}));

vi.mock("@/lib/actions/trips", () => ({
	deleteTrip: vi.fn(),
}));

import Home from "@/app/page";

describe("Home Page", () => {
	it("renders the dashboard heading", async () => {
		const page = await Home();
		render(page);

		const heading = screen.getByRole("heading", { level: 1 });
		expect(heading).toBeInTheDocument();
		expect(heading).toHaveTextContent("Dashboard");
	});

	it("shows empty state when no users", async () => {
		const page = await Home();
		render(page);

		expect(screen.getByText("No users yet")).toBeInTheDocument();
		expect(screen.getByText(/Add a green card holder/)).toBeInTheDocument();
	});
});
