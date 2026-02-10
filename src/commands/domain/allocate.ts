import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode } from "../../output.js";
import { timeoutError } from "../../errors.js";
import type { Domain } from "../../api/types.js";

export function domainAllocateCmd(parent: Command) {
  parent
    .command("allocate")
    .description("Allocate a managed subdomain for an instance")
    .requiredOption("--instance <instanceId>", "instance ID")
    .option("--name <label>", "preferred subdomain label")
    .option("--wait", "wait for DNS record to become active")
    .option("--timeout <duration>", "max wait duration (e.g. 5m)", "5m")
    .action(async function (this: Command) {
      const opts = this.opts();
      const client = clientFromProgram(this);
      const body: Record<string, unknown> = {
        instance_id: opts.instance,
      };
      if (opts.name) body.label = opts.name;

      let data = await client.post<Domain>("/v1/domains/allocate", body);

      if (opts.wait && data.status === "allocating") {
        const timeoutMs = parseDuration(opts.timeout);
        const start = Date.now();
        while (data.status === "allocating") {
          if (Date.now() - start > timeoutMs) {
            throw timeoutError("Domain did not become active within timeout");
          }
          await sleep(3000);
          // Re-fetch via list filtered by instance
          const domains = await client.get<Domain[]>("/v1/domains", {
            instance_id: opts.instance,
          });
          const found = domains.find((d) => d.fqdn === data.fqdn);
          if (found) data = found;
        }
      }

      if (isJsonMode()) {
        success(data);
      } else {
        process.stdout.write(`Domain: ${data.fqdn}\n`);
        process.stdout.write(`Status: ${data.status}\n`);
        process.stdout.write(
          `Target IP: ${data.target_ip ?? "(pending public IP)"}\n`,
        );
        process.stdout.write(
          "\nRemember to open the required ports and start a web server on the instance.\n",
        );
      }
    });
}

function parseDuration(s: string): number {
  const match = s.match(/^(\d+)(s|m|h)$/);
  if (!match) return 300_000;
  const n = parseInt(match[1], 10);
  switch (match[2]) {
    case "s": return n * 1000;
    case "m": return n * 60_000;
    case "h": return n * 3_600_000;
    default: return 300_000;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
