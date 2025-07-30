import { chromium, type FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
	console.log("Running global setup...");
	
	const browser = await chromium.launch();
	const page = await browser.newPage();
	
	try {
		await page.goto(config.projects[0].use.baseURL || "http://localhost:3000");
		await page.waitForLoadState("networkidle", { timeout: 30000 });
		console.log("Application is ready");
	} catch (error) {
		console.error("Failed to connect to application:", error);
		throw error;
	} finally {
		await browser.close();
	}
}

export default globalSetup;