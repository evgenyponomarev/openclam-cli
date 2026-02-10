import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode } from "../../output.js";

interface EstimateResponse {
  price_per_day_usdc: number;
  deposit_usdc: number;
  deposit_epochs: number | null;
}

export function cpuEstimateCmd(parent: Command) {
  parent
    .command("estimate")
    .description("Estimate cost for CPU instances")
    .requiredOption("--config <slug>", "configuration slug (e.g. cpu-2-ram-4gb-storage-25gb)")
    .option("--country <code>", "country code")
    .option("--max-price <usdc>", "max price per day in USDC")
    .action(async function (this: Command) {
      const opts = this.opts();
      const client = clientFromProgram(this);
      const body: Record<string, unknown> = {
        config: opts.config,
      };
      if (opts.country) body.country = opts.country;
      if (opts.maxPrice) body.max_price = Number(opts.maxPrice);
      const data = await client.post<EstimateResponse>("/v1/cpu/estimate", body);

      if (isJsonMode()) {
        success(data);
      } else {
        process.stdout.write(`Price per day:    $${Number(data.price_per_day_usdc).toFixed(2)} USDC\n`);
        process.stdout.write(`Required deposit: $${Number(data.deposit_usdc).toFixed(2)} USDC`);
        if (data.deposit_epochs) process.stdout.write(` (${data.deposit_epochs} days)`);
        process.stdout.write("\n");
      }
    });
}
