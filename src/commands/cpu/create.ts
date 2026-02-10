import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode } from "../../output.js";
import { printInstance } from "../instanceFmt.js";
import type { Instance } from "../../api/types.js";

export function cpuCreateCmd(parent: Command) {
  parent
    .command("create")
    .description("Create a new CPU instance")
    .requiredOption("--name <n>", "instance name")
    .requiredOption("--config <slug>", "configuration slug")
    .option("--instances <n>", "number of instances to create", "1")
    .option("--country <code>", "country code")
    .option("--max-price <usdc>", "max price per day in USDC")
    .option("--image <slug>", "OS image slug")
    .option("--sshkey <keyId>", "SSH key ID (repeatable)", collect, [])
    .option("--port <spec>", "port spec e.g. 22/tcp (repeatable)", collect, [])
    .action(async function (this: Command) {
      const opts = this.opts();
      const client = clientFromProgram(this);
      const body: Record<string, unknown> = {
        kind: "cpu",
        name: opts.name,
        config: opts.config,
        instances: Number(opts.instances),
      };
      if (opts.country) body.country = opts.country;
      if (opts.maxPrice) body.max_price = Number(opts.maxPrice);
      if (opts.image) body.image = opts.image;
      if (opts.sshkey.length) body.ssh_keys = opts.sshkey;
      if (opts.port.length) body.ports = opts.port;
      const data = await client.post<Instance>("/v1/instances", body);

      if (isJsonMode()) {
        success(data);
      } else {
        printInstance(data, "Instance created successfully");
      }
    });
}

function collect(value: string, prev: string[]): string[] {
  return prev.concat([value]);
}
