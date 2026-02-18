import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode } from "../../output.js";
import { insufficientReserve } from "../../errors.js";
import type { CheckResponse } from "../../api/types.js";

export function billingCheckCmd(parent: Command) {
  parent
    .command("check")
    .description("Check billing health (exit non-zero if underfunded)")
    .option("--require-runway <days>", "fail if runway < N days")
    .action(async function (this: Command) {
      const opts = this.opts();
      const client = clientFromProgram(this);
      const body: Record<string, unknown> = {};
      if (opts.requireRunway) body.require_runway = Number(opts.requireRunway);

      const data = await client.post<CheckResponse>("/v1/billing/check", body);

      if (!data.ok) {
        if (isJsonMode()) {
          success(data);
        }
        throw insufficientReserve(
          data.underfunded_instances
            ? `${data.underfunded_instances.length} instance(s) underfunded`
            : "Billing check failed",
          { runway_days: data.runway_days, underfunded: data.underfunded_instances },
        );
      }

      if (isJsonMode()) {
        success(data);
      } else {
        const runway = data.runway_days === "infinite" ? "infinite" : `${data.runway_days} days`;
        process.stdout.write(`Billing OK — runway: ${runway}\n`);
      }
    });
}
