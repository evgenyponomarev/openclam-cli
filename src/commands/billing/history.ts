import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode, table } from "../../output.js";
import type { BillingHistoryEntry } from "../../api/types.js";

export function billingHistoryCmd(parent: Command) {
  parent
    .command("history")
    .description("Show billing history")
    .option("--limit <n>", "max entries to return", "50")
    .action(async function (this: Command) {
      const opts = this.opts();
      const client = clientFromProgram(this);
      const data = await client.get<BillingHistoryEntry[]>("/v1/billing/history", {
        limit: opts.limit,
      });
      if (isJsonMode()) {
        success(data);
      } else {
        if (data.length === 0) {
          process.stdout.write("No billing history yet.\n");
          return;
        }
        const rows = data.map((e) => ({
          date: e.created_at,
          type: e.type,
          amount: `$${Number(e.amount_usdc).toFixed(2)}`,
          epoch: e.epoch_id,
        }));
        table(rows);
      }
    });
}
