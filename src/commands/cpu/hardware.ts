import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success } from "../../output.js";
import type { Hardware } from "../../api/types.js";

export function cpuHardwareCmd(parent: Command) {
  const cmd = parent
    .command("hardware")
    .description("CPU hardware discovery");

  cmd
    .command("list")
    .description("List available hardware for CPU instances")
    .action(async function (this: Command) {
      const client = clientFromProgram(this);
      const data = await client.get<Hardware[]>("/v1/cpu/hardware");
      success(data);
    });
}
