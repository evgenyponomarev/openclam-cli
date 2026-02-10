import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode, table } from "../../output.js";
import type { Domain } from "../../api/types.js";

export function domainListCmd(parent: Command) {
  parent
    .command("list")
    .description("List domains")
    .option("--instance <instanceId>", "filter by instance ID")
    .action(async function (this: Command) {
      const opts = this.opts();
      const client = clientFromProgram(this);
      const query: Record<string, string> = {};
      if (opts.instance) query.instance_id = opts.instance;
      const data = await client.get<Domain[]>("/v1/domains", query);
      if (isJsonMode()) {
        success(data);
      } else {
        const rows = data.map((d) => ({
          fqdn: d.fqdn,
          type: d.type,
          status: d.status,
          target_ip: d.target_ip ?? "-",
          instance_id: d.instance_id ?? "-",
        }));
        table(rows);
      }
    });
}
