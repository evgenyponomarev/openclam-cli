import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success } from "../../output.js";
import type { Offer } from "../../api/types.js";

export function gpuOffersCmd(parent: Command) {
  const cmd = parent
    .command("offers")
    .description("GPU offer discovery");

  cmd
    .command("list")
    .description("List available GPU offers")
    .option("--gpu-model <model>", "filter by GPU model")
    .option("--min-vram <gb>", "minimum VRAM in GB")
    .option("--max-price <usdc>", "max price per day in USDC")
    .action(async function (this: Command) {
      const opts = this.opts();
      const client = clientFromProgram(this);
      const body: Record<string, unknown> = {};
      if (opts.gpuModel) body.gpu_model = opts.gpuModel;
      if (opts.minVram) body.min_vram_gb = Number(opts.minVram);
      if (opts.maxPrice) body.max_price = Number(opts.maxPrice);
      const data = await client.post<Offer[]>("/v1/gpu/offers", body);
      success(data);
    });
}
