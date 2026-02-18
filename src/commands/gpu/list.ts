import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode, table } from "../../output.js";
import type { Instance } from "../../api/types.js";

export function gpuListCmd(parent: Command) {
  parent
    .command("list")
    .description("List GPU instances")
    .action(async function (this: Command) {
      const client = clientFromProgram(this);
      const data = await client.get<Instance[]>("/v1/instances", { kind: "gpu" });
      if (isJsonMode()) {
        success(data);
      } else {
        const rows = data.map((i) => ({
          id: i.id,
          name: i.name,
          status: i.status,
          public_ip: i.public_ip ?? "-",
          domain: i.domain?.fqdn ?? "-",
          "$/hr": `$${(Number(i.price_per_day_usdc) / 24).toFixed(2)}`,
          created: i.created_at,
        }));
        table(rows);
      }
    });
}

