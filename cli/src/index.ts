#!/usr/bin/env node

import { Command } from "commander";
import { createAddCommand } from "./commands/add";
import { createAuthCommand } from "./commands/auth";
import { createConfigInstallCommand } from "./commands/config-install";
import { createInitCommand } from "./commands/init";
import { createInstallCommand } from "./commands/install";
import { createListCommand } from "./commands/list";
import { createPublishCommand } from "./commands/publish";
import { createPushCommand } from "./commands/push";
import { createRemoveCommand } from "./commands/remove";
import { createSearchCommand } from "./commands/search";
import { createShareConfigCommand } from "./commands/share-config";
import { createUpdateCommand } from "./commands/update";
import { debugLogger } from "./utils/debug";

// Version is injected at build time
const VERSION = "1.2.3";

const program = new Command();

program
	.name("zxcv")
	.description("AI coding rules management CLI tool")
	.version(VERSION)
	.option("-d, --debug", "Enable debug mode to show API requests and responses")
	.hook("preAction", (thisCommand) => {
		const opts = thisCommand.opts();
		if (opts.debug) {
			debugLogger.setEnabled(true);
			debugLogger.log("Debug mode enabled");
		}
	});

// Add commands
program.addCommand(createInitCommand());
program.addCommand(createAddCommand());
program.addCommand(createRemoveCommand());
program.addCommand(createInstallCommand());
program.addCommand(createUpdateCommand());
program.addCommand(createListCommand());
program.addCommand(createSearchCommand());
program.addCommand(createPublishCommand());
program.addCommand(createPushCommand());
program.addCommand(createAuthCommand());
program.addCommand(createShareConfigCommand());
program.addCommand(createConfigInstallCommand());

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
	program.outputHelp();
	process.exit(0);
}
