#!/usr/bin/env node
import { Command } from "commander";
import { CliError } from "./errors.js";
import { EXIT_USAGE, EXIT_UNAUTHENTICATED } from "./exitCodes.js";
import { setJsonMode, error as outputError } from "./output.js";
import { OpenClamClient } from "./api/client.js";

import { registerCpuCommands } from "./commands/cpu/index.js";
import { registerGpuCommands } from "./commands/gpu/index.js";
import { registerSshKeyCommands } from "./commands/sshkey/index.js";
import { registerBillingCommands } from "./commands/billing/index.js";
import { registerDomainCommands } from "./commands/domain/index.js";
import { registerAuthCommands } from "./commands/auth/index.js";

const DEFAULT_BASE_URL = "https://api.openclam.run";

const program = new Command();

program
  .name("openclam")
  .description("OpenClam — agent-native cloud CLI")
  .version("0.1.0")
  .option("--json", "output JSON instead of human-readable tables", false)
  .option("--api-key <key>", "API key (or set OPENCLAM_API_KEY env)");

// Expose a helper so commands can get a configured client
export function clientFromProgram(cmd: Command): OpenClamClient {
  const opts = program.opts();
  const apiKey = opts.apiKey || process.env.OPENCLAM_API_KEY;
  if (!apiKey) {
    throw new CliError(
      "UNAUTHENTICATED",
      "API key required. Set OPENCLAM_API_KEY or pass --api-key.",
      EXIT_UNAUTHENTICATED,
    );
  }
  const baseUrl = process.env.OPENCLAM_API_URL || DEFAULT_BASE_URL;
  return new OpenClamClient({ apiKey, baseUrl });
}

// Register sub-command groups
registerAuthCommands(program);
registerCpuCommands(program);
registerGpuCommands(program);
registerSshKeyCommands(program);
registerBillingCommands(program);
registerDomainCommands(program);

// Global pre-action: set JSON mode
program.hook("preAction", (_thisCmd, actionCmd) => {
  const opts = program.opts();
  if (opts.json) setJsonMode(true);
});

// Global error handler
async function main() {
  try {
    await program.parseAsync(process.argv);
  } catch (err: unknown) {
    if (err instanceof CliError) {
      outputError(err);
      process.exit(err.exitCode);
    }
    // commander usage errors
    if (err && typeof err === "object" && "exitCode" in err) {
      process.exit(EXIT_USAGE);
    }
    const msg = err instanceof Error ? err.message : String(err);
    outputError(new CliError("INTERNAL", msg, 1));
    process.exit(1);
  }
}

main();
