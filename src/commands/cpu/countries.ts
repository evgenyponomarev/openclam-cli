import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode, table } from "../../output.js";

export function cpuCountriesCmd(parent: Command) {
  const cmd = parent
    .command("countries")
    .description("CPU countries discovery");

  cmd
    .command("list")
    .description("List available countries for CPU instances")
    .action(async function (this: Command) {
      const client = clientFromProgram(this);
      const data = await client.get<string[]>("/v1/cpu/countries");
      if (isJsonMode()) {
        success(data);
      } else {
        if (data.length === 0) {
          process.stdout.write("No countries available.\n");
          return;
        }
        const rows = data.map((code) => ({ country: String(code) }));
        table(rows);
      }
    });
}
