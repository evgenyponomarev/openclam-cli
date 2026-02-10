import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success } from "../../output.js";
import type { Instance } from "../../api/types.js";

export function cpuRenameCmd(parent: Command) {
  parent
    .command("rename <instanceId>")
    .description("Rename a CPU instance")
    .requiredOption("--name <n>", "new instance name")
    .action(async function (this: Command, instanceId: string) {
      const opts = this.opts();
      const client = clientFromProgram(this);
      const data = await client.patch<Instance>(`/v1/instances/${instanceId}`, {
        name: opts.name,
      });
      success(data);
    });
}
