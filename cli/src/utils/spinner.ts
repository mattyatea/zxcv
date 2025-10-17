import chalk from "chalk";

export class Spinner {
	private message: string;
	private interval: Timer | null = null;
	private spinnerChars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
	private currentIndex = 0;

	constructor(message: string) {
		this.message = message;
	}

	start(): Spinner {
		if (this.interval) return this;

		process.stdout.write("\x1B[?25l"); // Hide cursor
		this.interval = setInterval(() => {
			process.stdout.write(
				`\r${chalk.blue(this.spinnerChars[this.currentIndex])} ${this.message}`,
			);
			this.currentIndex = (this.currentIndex + 1) % this.spinnerChars.length;
		}, 80);

		return this;
	}

	stop(): void {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
			process.stdout.write("\r\x1B[K"); // Clear line
			process.stdout.write("\x1B[?25h"); // Show cursor
		}
	}

	succeed(text?: string): void {
		this.stop();
		console.log(chalk.green("✓"), text || this.message);
	}

	fail(text?: string): void {
		this.stop();
		console.log(chalk.red("✗"), text || this.message);
	}

	warn(text?: string): void {
		this.stop();
		console.log(chalk.yellow("⚠"), text || this.message);
	}

	info(text?: string): void {
		this.stop();
		console.log(chalk.blue("ℹ"), text || this.message);
	}

	text(newText: string): void {
		this.message = newText;
	}
}

export function ora(message: string): Spinner {
	return new Spinner(message);
}
