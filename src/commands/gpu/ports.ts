import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success } from "../../output.js";
import type { Instance } from "../../api/types.js";

export function gpuPortsCmd(parent: Command) {
  const cmd = parent
    .command("ports")
    .description("Manage GPU instance ports");

  cmd
    .command("set <instanceId>")
    .description("Set open ports (replace-all semantics)")
    .option("--port <spec>", "port spec e.g. 22/tcp (repeatable)", collect, [])
    .action(async function (this: Command, instanceId: string) {
      const opts = this.opts();
      const client = clientFromProgram(this);
      const data = await client.patch<Instance>(`/v1/instances/${instanceId}`, {
        ports: opts.port,
      });
      success(data);
    });
}

function collect(value: string, prev: string[]): string[] {
  return prev.concat([value]);
}
