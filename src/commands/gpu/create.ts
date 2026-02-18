import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode } from "../../output.js";
import { printInstance } from "../instanceFmt.js";
import type { Instance } from "../../api/types.js";

export function gpuCreateCmd(parent: Command) {
  parent
    .command("create")
    .description("Create a new GPU instance (container, VM, or bare metal)")
    .requiredOption("--name <n>", "instance name")
    .requiredOption("--config <planId>", "GPU plan ID (from `gpu offers list`)")
    .option("--type <type>", "plan type: container, vm, baremetal (default: auto-detect from plan)")
    .option("--image <slug>", "container image or OS image")
    .option("--sshkey <keyId>", "SSH key ID (repeatable)", collect, [])
    .option("--port <spec>", "port spec e.g. 22/tcp (repeatable, containers only)", collect, [])
    .action(async function (this: Command) {
      const opts = this.opts();
      const client = clientFromProgram(this);
      const body: Record<string, unknown> = {
        kind: "gpu",
        name: opts.name,
        config: opts.config,
      };
      if (opts.type) body.gpu_type = opts.type;
      if (opts.image) body.image = opts.image;
      if (opts.sshkey.length) body.ssh_keys = opts.sshkey;
      if (opts.port.length) body.ports = opts.port;
      const data = await client.post<Instance>("/v1/instances", body);
      if (isJsonMode()) {
        success(data);
      } else {
        printInstance(data, "GPU instance created successfully");
      }
    });
}

function collect(value: string, prev: string[]): string[] {
  return prev.concat([value]);
}
