import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode } from "../../output.js";
import type { Domain } from "../../api/types.js";

export function domainBindCmd(parent: Command) {
  parent
    .command("bind")
    .description("Bind a verified custom domain to an instance")
    .requiredOption("--instance <instanceId>", "instance ID")
    .requiredOption("--domain <domain>", "custom domain (e.g. example.com)")
    .action(async function (this: Command) {
      const opts = this.opts();
      const client = clientFromProgram(this);
      const data = await client.post<Domain>("/v1/domains/bind", {
        instance_id: opts.instance,
        fqdn: opts.domain,
      });

      if (isJsonMode()) {
        success(data);
      } else {
        process.stdout.write(`Domain:    ${data.fqdn}\n`);
        process.stdout.write(`Status:    ${data.status}\n`);
        process.stdout.write(`Instance:  ${data.instance_id}\n`);
        process.stdout.write(
          `Target IP: ${data.target_ip ?? "(pending)"}\n`,
        );
      }
    });
}
