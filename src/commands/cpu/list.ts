import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode, table } from "../../output.js";
import type { Instance } from "../../api/types.js";

export function cpuListCmd(parent: Command) {
  parent
    .command("list")
    .description("List CPU instances")
    .action(async function (this: Command) {
      const client = clientFromProgram(this);
      const data = await client.get<Instance[]>("/v1/instances", { kind: "cpu" });
      if (isJsonMode()) {
        success(data);
      } else {
        const rows = data.map((i) => ({
          id: i.id,
          name: i.name,
          status: i.status,
          public_ip: i.public_ip ?? "-",
          domain: i.domain?.fqdn ?? "-",
          config: i.config,
          price_day: formatUsdc(i.price_per_day_usdc_micro),
          created: i.created_at,
        }));
        table(rows);
      }
    });
}

function formatUsdc(micro: number): string {
  return `$${(micro / 1_000_000).toFixed(2)}`;
}
