import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode, table } from "../../output.js";

export function cpuConfigsCmd(parent: Command) {
  const cmd = parent
    .command("configs")
    .description("CPU configuration discovery");

  cmd
    .command("list")
    .description("List available CPU configurations")
    .action(async function (this: Command) {
      const client = clientFromProgram(this);
      const data = await client.get<string[]>("/v1/cpu/configs");
      if (isJsonMode()) {
        success(data);
      } else {
        if (data.length === 0) {
          process.stdout.write("No configurations available.\n");
          return;
        }
        const rows = data.map((slug) => {
          const m = String(slug).match(/cpu-(\d+)-ram-(\d+)gb-storage-(\d+)gb/i);
          return m
            ? { config: slug, vcpu: m[1], ram: `${m[2]}GB`, storage: `${m[3]}GB` }
            : { config: slug, vcpu: "-", ram: "-", storage: "-" };
        });
        table(rows);
      }
    });
}
