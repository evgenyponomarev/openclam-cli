import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success } from "../../output.js";
import type { CpuConfig } from "../../api/types.js";

export function cpuConfigsCmd(parent: Command) {
  const cmd = parent
    .command("configs")
    .description("CPU configuration discovery");

  cmd
    .command("list")
    .description("List available CPU configurations")
    .action(async function (this: Command) {
      const client = clientFromProgram(this);
      const data = await client.get<CpuConfig[]>("/v1/cpu/configs");
      success(data);
    });
}
