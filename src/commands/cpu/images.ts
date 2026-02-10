import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success } from "../../output.js";
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
      success(data);
    });
}
