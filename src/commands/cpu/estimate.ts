import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success } from "../../output.js";
import type { Estimate } from "../../api/types.js";

export function cpuEstimateCmd(parent: Command) {
  parent
    .command("estimate")
    .description("Estimate cost for CPU instances")
    .requiredOption("--instances <n>", "number of instances", "1")
    .option("--config <slug>", "configuration slug")
    .option("--country <code>", "country code")
    .option("--max-price <usdc>", "max price per day in USDC")
    .action(async function (this: Command) {
      const opts = this.opts();
      const client = clientFromProgram(this);
      const body: Record<string, unknown> = {
        instances: Number(opts.instances),
      };
      if (opts.config) body.config = opts.config;
      if (opts.country) body.country = opts.country;
      if (opts.maxPrice) body.max_price = Number(opts.maxPrice);
      const data = await client.post<Estimate>("/v1/cpu/estimate", body);
      success(data);
    });
}
