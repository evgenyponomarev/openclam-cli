import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode, table } from "../../output.js";
import type { BurnResponse } from "../../api/types.js";

export function billingBurnCmd(parent: Command) {
  parent
    .command("burn")
    .description("Show per-instance billing breakdown")
    .action(async function (this: Command) {
      const client = clientFromProgram(this);
      const data = await client.get<BurnResponse>("/v1/billing/burn");
      if (isJsonMode()) {
        success(data);
      } else {
        const fmt = (v: number) => `$${Number(v).toFixed(2)}`;
        if (data.instances.length === 0) {
          process.stdout.write("No billable instances.\n");
          return;
        }
        const rows = data.instances.map((i) => ({
          id: i.instance_id,
          name: i.name,
          kind: i.kind,
          provider: i.provider,
          status: i.status,
          cost_day: fmt(i.price_per_day_usdc),
          reserved: fmt(i.reserved_usdc),
          target: fmt(i.target_reserve_usdc),
        }));
        table(rows);
        process.stdout.write(
          `\nTotals:  burn/day ${fmt(data.totals.daily_burn_usdc)}` +
          `  reserved ${fmt(data.totals.reserved_usdc)}` +
          `  target ${fmt(data.totals.target_reserve_usdc)}\n`,
        );
      }
    });
}
