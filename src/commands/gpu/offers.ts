import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode, table } from "../../output.js";

export function gpuOffersCmd(parent: Command) {
  const cmd = parent
    .command("offers")
    .description("GPU plan discovery");

  cmd
    .command("list")
    .description("List available GPU plans (containers, VMs, bare metal)")
    .action(async function (this: Command) {
      const client = clientFromProgram(this);
      const data = await client.get<Record<string, unknown>[]>("/v1/gpu/offers");
      if (isJsonMode()) {
        success(data);
        return;
      }
      const rows = data.map((entry) => {
        const plan = (entry.plan ?? entry) as Record<string, unknown>;
        const supply = plan.supply as Record<string, unknown> | undefined;
        const gpu = plan.gpu_model as Record<string, unknown> | undefined;
        const pricing = plan.pricing as Record<string, unknown> | undefined;
        const attrs = entry.attributes as Record<string, unknown> | undefined;
        const vcpu = (supply?.vcpu as Record<string, unknown>)?.count ?? "-";
        const gpuCount = supply?.gpu_count ?? 1;
        const mem = supply?.memory as Record<string, unknown> | undefined;
        const stor = supply?.storage as Record<string, unknown> | undefined;
        const locs = attrs?.location;
        const location = Array.isArray(locs) ? (locs as string[]).join(",") : String(locs ?? "-");
        const type = String(entry._type ?? "container");
        return {
          plan_id: plan.id ?? "-",
          type,
          gpu: `${gpu?.model ?? "?"}  ${gpu?.vram ?? ""}`,
          gpus: gpuCount,
          vcpu,
          ram: mem ? `${mem.count}${mem.units}` : "-",
          disk: stor ? `${stor.count}${stor.units}` : "-",
          "$/hr": pricing?.hour != null ? `$${Number(pricing.hour).toFixed(2)}` : "-",
          location,
        };
      });
      table(rows);
    });
}
