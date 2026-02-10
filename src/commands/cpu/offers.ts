import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success } from "../../output.js";
import type { Offer } from "../../api/types.js";

export function cpuOffersCmd(parent: Command) {
  const cmd = parent
    .command("offers")
    .description("CPU offer discovery");

  cmd
    .command("list")
    .description("List available CPU offers")
    .option("--config <slug>", "filter by configuration slug")
    .option("--country <code>", "filter by country code")
    .option("--max-price <usdc>", "max price per day in USDC")
    .action(async function (this: Command) {
      const opts = this.opts();
      const client = clientFromProgram(this);
      const body: Record<string, unknown> = {};
      if (opts.config) body.config = opts.config;
      if (opts.country) body.country = opts.country;
      if (opts.maxPrice) body.max_price = Number(opts.maxPrice);
      const data = await client.post<Offer[]>("/v1/cpu/offers", body);
      success(data);
    });
}
