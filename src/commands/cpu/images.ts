import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode, table } from "../../output.js";
import type { Image } from "../../api/types.js";

export function cpuImagesCmd(parent: Command) {
  const cmd = parent
    .command("images")
    .description("CPU image discovery");

  cmd
    .command("list")
    .description("List available OS images for CPU instances")
    .action(async function (this: Command) {
      const client = clientFromProgram(this);
      const data = await client.get<Image[]>("/v1/cpu/images");
      if (isJsonMode()) {
        success(data);
      } else {
        if (data.length === 0) {
          process.stdout.write("No images available.\n");
          return;
        }
        const rows = data.map((i) => ({
          slug: i.slug,
          name: i.name,
        }));
        table(rows);
      }
    });
}
