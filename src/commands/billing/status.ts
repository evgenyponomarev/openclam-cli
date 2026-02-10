import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode } from "../../output.js";
import type { BillingStatus } from "../../api/types.js";

export function billingBalanceCmd(parent: Command) {
  parent
    .command("balance")
    .description("Show account balance")
    .action(async function (this: Command) {
      const client = clientFromProgram(this);
      const data = await client.get<BillingStatus>("/v1/billing/status");
      if (isJsonMode()) {
        success(data);
      } else {
        const fmt = (v: number) => `$${Number(v).toFixed(2)}`;
        process.stdout.write(`Available:          ${fmt(data.available_usdc)}\n`);
        process.stdout.write(`Reserved:           ${fmt(data.reserved_usdc)}\n`);
        process.stdout.write(`Total:              ${fmt(data.total_usdc)}\n`);
        process.stdout.write(`Daily burn:         ${fmt(data.daily_burn_usdc)}\n`);
        process.stdout.write(`Min reserved req:   ${fmt(data.min_reserved_required_usdc)}\n`);
        process.stdout.write(`Target reserved:    ${fmt(data.target_reserved_usdc)}\n`);
        process.stdout.write(`Next billing:       ${data.next_billing_time} (epoch ${data.next_epoch_id})\n`);
        process.stdout.write(`Runway:             ${data.runway_days === "infinite" ? "infinite" : `${data.runway_days} days`}\n`);
      }
    });
}
