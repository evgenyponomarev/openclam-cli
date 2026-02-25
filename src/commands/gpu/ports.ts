import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode } from "../../output.js";
import type { Instance } from "../../api/types.js";

function printPorts(data: Instance) {
  const w = (s: string) => process.stdout.write(s);
  const ports = data.ports?.length ? data.ports.join(", ") : "(none)";
  w(`\n  Ports updated — ${data.name} (${data.id})\n`);
  w(`  Open ports:  ${ports}\n\n`);
}

export function gpuPortsCmd(parent: Command) {
  const cmd = parent
    .command("ports")
    .description("Manage GPU instance ports")
    .addHelpText("after", `
Examples:
  openclam gpu ports set <id> --port 8080/tcp
  openclam gpu ports set <id> --port 8080/tcp --port 443/tcp

Note: replaces ALL open ports. Get <id> from: openclam gpu list`);

  cmd
    .command("set <instanceId>")
    .description("Set open ports — replaces all existing ports")
    .addHelpText("after", `
Examples:
  openclam gpu ports set 1c285d64-... --port 8080/tcp
  openclam gpu ports set 1c285d64-... --port 8080/tcp --port 443/tcp`)
    .option("--port <spec>", "port to open, e.g. 8080/tcp — repeat for multiple ports", collect, [])
    .action(async function (this: Command, instanceId: string) {
      const opts = this.opts();
      const client = clientFromProgram(this);
      const data = await client.patch<Instance>(`/v1/instances/${instanceId}`, {
        ports: opts.port,
      });
      if (isJsonMode()) {
        success(data);
      } else {
        printPorts(data);
      }
    });
}

function collect(value: string, prev: string[]): string[] {
  return prev.concat([value]);
}
