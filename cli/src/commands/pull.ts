import { Command } from "commander";

export function createPullCommand(): Command {
	return new Command("pull")
		.description("(Deprecated) Use 'install' instead")
		.argument("<path>", "Rule path (@owner/rulename)")
		.option("-f, --force", "Force pull even if rule already exists")
		.action(() => {
			console.log("'pull' command is deprecated. Please use 'install' instead.");
			console.log("Example: zxcv install @owner/rulename");
			process.exit(1);
		});
}
