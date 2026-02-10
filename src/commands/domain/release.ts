import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success } from "../../output.js";

export function domainReleaseCmd(parent: Command) {
  parent
    .command("release")
    .description("Release a managed subdomain")
    .requiredOption("--domain <fqdn>", "fully qualified domain to release")
    .action(async function (this: Command) {
      const opts = this.opts();
      const client = clientFromProgram(this);
      await client.post("/v1/domains/release", { fqdn: opts.domain });
      success({ fqdn: opts.domain, status: "deleted" });
    });
}
