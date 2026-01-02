import { expect, test } from "@playwright/test";

test.describe("Home Page", () => {
	test("should display the main heading", async ({ page }) => {
		await page.goto("/");

		const heading = page.getByRole("heading", { level: 1 });
		await expect(heading).toBeVisible();
		await expect(heading).toContainText("To get started");
	});

	test("should display the Next.js logo", async ({ page }) => {
		await page.goto("/");

		const logo = page.getByAltText("Next.js logo");
		await expect(logo).toBeVisible();
	});

	test("should have working navigation links", async ({ page }) => {
		await page.goto("/");

		// Check deploy link
		const deployLink = page.getByRole("link", { name: /deploy now/i });
		await expect(deployLink).toBeVisible();
		await expect(deployLink).toHaveAttribute("href", /vercel\.com/);

		// Check documentation link
		const docsLink = page.getByRole("link", { name: /documentation/i });
		await expect(docsLink).toBeVisible();
		await expect(docsLink).toHaveAttribute("href", /nextjs\.org\/docs/);
	});

	test("should load without JavaScript errors", async ({ page }) => {
		const errors: string[] = [];
		page.on("pageerror", (error) => {
			errors.push(error.message);
		});

		await page.goto("/");
		await page.waitForLoadState("networkidle");

		expect(errors).toHaveLength(0);
	});
});
