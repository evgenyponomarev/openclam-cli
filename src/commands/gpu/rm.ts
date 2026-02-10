import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success } from "../../output.js";
import { CliError } from "../../errors.js";
import { EXIT_USAGE } from "../../exitCodes.js";
import * as readline from "node:readline";

export function gpuRmCmd(parent: Command) {
  parent
    .command("rm <instanceId>")
    .description("Terminate a GPU instance")
    .option("--yes", "skip confirmation prompt")
    .action(async function (this: Command, instanceId: string) {
      const opts = this.opts();
      const client = clientFromProgram(this);

      if (!opts.yes) {
        const confirmed = await confirm(
          `Terminate GPU instance ${instanceId}? This cannot be undone. [y/N] `,
        );
        if (!confirmed) {
          throw new CliError("ABORTED", "Aborted by user", EXIT_USAGE);
        }
      }

      await client.del(`/v1/instances/${instanceId}`);
      success({ id: instanceId, status: "terminating" });
    });
}

function confirm(prompt: string): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stderr,
    });
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}
