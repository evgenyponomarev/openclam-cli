import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode, table } from "../../output.js";

interface HardwareResponse {
  cpu: Record<string, unknown>[];
  memory: Record<string, unknown>[];
  storage: Record<string, unknown>[];
}

export function cpuHardwareCmd(parent: Command) {
  const cmd = parent
    .command("hardware")
    .description("CPU hardware discovery");

  cmd
    .command("list")
    .description("List available hardware for CPU instances")
    .action(async function (this: Command) {
      const client = clientFromProgram(this);
      const data = await client.get<HardwareResponse>("/v1/cpu/hardware");
      if (isJsonMode()) {
        success(data);
      } else {
        for (const section of ["cpu", "memory", "storage"] as const) {
          const items = data[section];
          if (items?.length) {
            process.stdout.write(`\n${section.toUpperCase()}:\n`);
            table(items);
          }
        }
      }
    });
}
