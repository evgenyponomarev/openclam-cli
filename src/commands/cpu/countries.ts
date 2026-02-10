import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success } from "../../output.js";
import type { Country } from "../../api/types.js";

export function cpuCountriesCmd(parent: Command) {
  const cmd = parent
    .command("countries")
    .description("CPU countries discovery");

  cmd
    .command("list")
    .description("List available countries for CPU instances")
    .action(async function (this: Command) {
      const client = clientFromProgram(this);
      const data = await client.get<Country[]>("/v1/cpu/countries");
      success(data);
    });
}
