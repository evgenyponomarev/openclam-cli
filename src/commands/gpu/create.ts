import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success } from "../../output.js";
import type { Instance } from "../../api/types.js";

export function gpuCreateCmd(parent: Command) {
  parent
    .command("create")
    .description("Create a new GPU instance")
    .requiredOption("--name <n>", "instance name")
    .option("--gpu-model <model>", "GPU model")
    .option("--gpu-count <n>", "number of GPUs", "1")
    .option("--image <slug>", "OS image slug")
    .option("--sshkey <keyId>", "SSH key ID (repeatable)", collect, [])
    .option("--port <spec>", "port spec e.g. 22/tcp (repeatable)", collect, [])
    .action(async function (this: Command) {
      const opts = this.opts();
      const client = clientFromProgram(this);
      const body: Record<string, unknown> = {
        kind: "gpu",
        name: opts.name,
      };
      if (opts.gpuModel) body.gpu_model = opts.gpuModel;
      if (opts.gpuCount) body.gpu_count = Number(opts.gpuCount);
      if (opts.image) body.image = opts.image;
      if (opts.sshkey.length) body.ssh_keys = opts.sshkey;
      if (opts.port.length) body.ports = opts.port;
      const data = await client.post<Instance>("/v1/instances", body);
      success(data);
    });
}

function collect(value: string, prev: string[]): string[] {
  return prev.concat([value]);
}
