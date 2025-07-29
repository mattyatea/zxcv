import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import inquirer from "inquirer";
import ora from "ora";
import { ConfigManager } from "../config";
import { ApiClient } from "../utils/api";

export function createAuthCommand(): Command {
	const auth = new Command("auth").description("Authentication management");

	auth
		.command("login")
		.description("Login to zxcv server")
		.action(async () => {
			const answers = await inquirer.prompt([
				{
					type: "input",
					name: "username",
					message: "Username:",
					validate: (input) => input.length > 0,
				},
				{
					type: "password",
					name: "password",
					message: "Password:",
					validate: (input) => input.length > 0,
				},
			]);

			const spinner = ora("Logging in...").start();
			const config = new ConfigManager();
			const api = new ApiClient(config);

			try {
				const { token } = await api.login(answers.username, answers.password);
				config.setAuthToken(token);
				spinner.succeed(chalk.green("Successfully logged in!"));
			} catch (error) {
				spinner.fail(chalk.red("Login failed"));
				if (axios.isAxiosError(error)) {
					console.error(
						chalk.red(error.response?.data?.message || error.message),
					);
				} else {
					console.error(chalk.red("An unexpected error occurred"));
				}
				process.exit(1);
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
			const answers = await inquirer.prompt([
				{
					type: "input",
					name: "username",
					message: "Username:",
					validate: (input) => input.length >= 3,
				},
				{
					type: "input",
					name: "email",
					message: "Email:",
					validate: (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input),
				},
				{
					type: "password",
					name: "password",
					message: "Password:",
					validate: (input) => input.length >= 8,
				},
				{
					type: "password",
					name: "confirmPassword",
					message: "Confirm Password:",
					validate: (input, answers) =>
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
					console.error(
						chalk.red(error.response?.data?.message || error.message),
					);
				} else {
					console.error(chalk.red("An unexpected error occurred"));
				}
				process.exit(1);
			}
		});

	return auth;
}
