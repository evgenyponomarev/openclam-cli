import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success } from "../../output.js";
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
      success(data);
    });
}
