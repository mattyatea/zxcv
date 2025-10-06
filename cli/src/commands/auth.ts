import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import { ConfigManager } from "../config";
import { ApiClient } from "../utils/api";
import open from "../utils/open.js";
import { inquirer } from "../utils/prompt.js";
import { ora } from "../utils/spinner.js";

export function createAuthCommand(): Command {
	const auth = new Command("auth").description("Authentication management");

	auth
		.command("login")
		.description("Login to zxcv server")
		.option("-i, --interactive", "Use interactive login (username/password)")
		.action(async (options) => {
			const config = new ConfigManager();
			const api = new ApiClient(config);

			if (options.interactive) {
				// Traditional username/password login
				const answers = await inquirer.prompt([
					{
						type: "input",
						name: "username",
						message: "Username:",
						validate: (input) =>
							(typeof input === "string" && input.length > 0) || "Username is required",
					},
					{
						type: "password",
						name: "password",
						message: "Password:",
						validate: (input) =>
							(typeof input === "string" && input.length > 0) || "Password is required",
					},
				]);

				const spinner = ora("Logging in...").start();

				try {
					const { token } = await api.login(answers.username as string, answers.password as string);
					config.setAuthToken(token);
					spinner.succeed(chalk.green("Successfully logged in!"));
				} catch (error) {
					spinner.fail(chalk.red("Login failed"));
					if (axios.isAxiosError(error)) {
						console.error(chalk.red(error.response?.data?.message || error.message));
					} else {
						console.error(chalk.red("An unexpected error occurred"));
					}
					process.exit(1);
				}
			} else {
				// Device Authorization Grant flow
				const spinner = ora("Initializing device authentication...").start();

				try {
					// Request device authorization
					const authData = await api.initializeDeviceAuth();
					spinner.stop();

					console.log(`\n${chalk.bold("To authenticate, please visit:")}`);
					console.log(chalk.cyan(`  ${authData.verificationUri}`));
					console.log(`\n${chalk.bold("And enter this code:")}`);
					console.log(chalk.yellow(`  ${authData.userCode}`));
					console.log("");

					// Ask if user wants to open browser
					const { openBrowser } = await inquirer.prompt([
						{
							type: "confirm",
							name: "openBrowser",
							message: "Open browser automatically?",
							default: true,
						},
					]);

					if (openBrowser) {
						await open(authData.verificationUriComplete || authData.verificationUri);
					}

					// Start polling
					const pollSpinner = ora("Waiting for authorization...").start();

					try {
						const token = await api.pollForDeviceToken(
							authData.deviceCode,
							authData.interval,
							authData.expiresIn,
						);

						config.setAuthToken(token);
						pollSpinner.succeed(chalk.green("Successfully authenticated!"));
					} catch (error) {
						pollSpinner.fail(chalk.red("Authentication failed"));
						if (error instanceof Error) {
							console.error(chalk.red(error.message));
						}
						process.exit(1);
					}
				} catch (error) {
					spinner.fail(chalk.red("Failed to initialize authentication"));
					if (axios.isAxiosError(error)) {
						console.error(chalk.red(error.response?.data?.message || error.message));
					} else {
						console.error(chalk.red("An unexpected error occurred"));
					}
					process.exit(1);
				}
			}
		});

	auth
		.command("logout")
		.description("Logout from zxcv server")
		.action(() => {
			const config = new ConfigManager();
			config.setAuthToken("");
			console.log(chalk.green("Successfully logged out!"));
		});

	auth
		.command("register")
		.description("Register a new account")
		.action(async () => {
			const answers = await inquirer.prompt<{
				username: string;
				email: string;
				password: string;
				confirmPassword: string;
			}>([
				{
					type: "input",
					name: "username",
					message: "Username:",
					validate: (input: string) =>
						input.length >= 3 || "Username must be at least 3 characters",
				},
				{
					type: "input",
					name: "email",
					message: "Email:",
					validate: (input: string) =>
						/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) || "Invalid email address",
				},
				{
					type: "password",
					name: "password",
					message: "Password:",
					validate: (input: string) =>
						input.length >= 8 || "Password must be at least 8 characters",
				},
				{
					type: "password",
					name: "confirmPassword",
					message: "Confirm Password:",
					validate: (input: string, answers?: { password: string }) =>
						input === answers?.password || "Passwords don't match",
				},
			]);

			const spinner = ora("Creating account...").start();
			const config = new ConfigManager();
			const api = new ApiClient(config);

			try {
				await api.register(answers.username, answers.email, answers.password);
				spinner.succeed(
					chalk.green(
						"Account created successfully! Please check your email to verify your account.",
					),
				);
			} catch (error) {
				spinner.fail(chalk.red("Registration failed"));
				if (axios.isAxiosError(error)) {
					console.error(chalk.red(error.response?.data?.message || error.message));
				} else {
					console.error(chalk.red("An unexpected error occurred"));
				}
				process.exit(1);
			}
		});

	return auth;
}
