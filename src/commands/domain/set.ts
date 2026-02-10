import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode } from "../../output.js";
import { timeoutError } from "../../errors.js";
import type { Domain } from "../../api/types.js";

export function domainSetCmd(parent: Command) {
  parent
    .command("set")
    .description("Change subdomain label for an instance")
    .requiredOption("--instance <instanceId>", "instance ID")
    .requiredOption("--name <label>", "new subdomain label")
    .option("--wait", "wait for DNS record to become active")
    .option("--timeout <duration>", "max wait duration (e.g. 5m)", "5m")
    .action(async function (this: Command) {
      const opts = this.opts();
      const client = clientFromProgram(this);
      let data = await client.post<Domain>("/v1/domains/set", {
        instance_id: opts.instance,
        label: opts.name,
      });

      if (opts.wait && data.status === "allocating") {
        const timeoutMs = parseDuration(opts.timeout);
        const start = Date.now();
        while (data.status === "allocating") {
          if (Date.now() - start > timeoutMs) {
            throw timeoutError("Domain did not become active within timeout");
          }
          await sleep(3000);
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
