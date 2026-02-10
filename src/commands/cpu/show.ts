import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success } from "../../output.js";
import type { Instance } from "../../api/types.js";

export function cpuShowCmd(parent: Command) {
  parent
    .command("show <instanceId>")
    .description("Show details of a CPU instance")
    .action(async function (this: Command, instanceId: string) {
      const client = clientFromProgram(this);
      const data = await client.get<Instance>(`/v1/instances/${instanceId}`);
      success(data);
    });
}
