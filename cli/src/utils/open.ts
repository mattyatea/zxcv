import { exec } from "node:child_process";
import { platform } from "node:process";

export async function open(url: string): Promise<void> {
	const command =
		platform === "darwin"
			? `open "${url}"`
			: platform === "win32"
				? `start "${url}"`
				: `xdg-open "${url}"`;

	return new Promise((resolve, reject) => {
		exec(command, (error) => {
			if (error) {
				console.warn("Could not open browser automatically");
				resolve(); // Don't fail if browser can't be opened
			} else {
				resolve();
			}
		});
	});
}

export default open;
