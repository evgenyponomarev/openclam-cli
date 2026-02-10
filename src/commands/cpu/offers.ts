import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode, table } from "../../output.js";

interface RawOffer {
  configuration?: { slug?: string; price?: string };
  resources?: { type?: string; metadata?: Record<string, unknown>; price?: string }[];
  datacenter?: { countryCode?: string; cityCode?: string; tier?: number; certifications?: string[] };
  servers?: { availableBasicInstances?: number }[];
  [key: string]: unknown;
}

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
      const data = await client.post<RawOffer[]>("/v1/cpu/offers", body);

      if (isJsonMode()) {
        success(data);
        return;
      }

      const rows = data.map((o) => {
        const cfg = o.configuration;
        const dc = o.datacenter;
        const cpu = o.resources?.find((r) => r.type === "VCPU");
        const totalSlots = (o.servers ?? []).reduce(
          (sum, s) => sum + (s.availableBasicInstances ?? 0),
          0,
        );
        return {
          config: cfg?.slug ?? "-",
          "$/day": cfg?.price ? `$${Number(cfg.price).toFixed(2)}` : "-",
          cpu: cpu?.metadata
            ? `${cpu.metadata.manufacturer} ${cpu.metadata.architecture} ${cpu.metadata.generation}`
            : "-",
          location: dc ? `${dc.cityCode}, ${dc.countryCode}` : "-",
          tier: dc?.tier ?? "-",
          available: totalSlots,
        };
      });

      table(rows);
    });
}
