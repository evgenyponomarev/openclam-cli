import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode } from "../../output.js";

interface VerifyResponse {
  fqdn: string;
  status: string;
  verification_token: string;
  txt_record: string;
  txt_name: string;
}

export function domainVerifyCmd(parent: Command) {
  parent
    .command("verify")
    .description("Start custom domain verification (prints TXT instructions)")
    .requiredOption("--domain <domain>", "custom domain (e.g. example.com)")
    .action(async function (this: Command) {
      const opts = this.opts();
      const client = clientFromProgram(this);
      const data = await client.post<VerifyResponse>("/v1/domains/verify", {
        fqdn: opts.domain,
      });

      if (isJsonMode()) {
        success(data);
      } else {
        process.stdout.write(`Domain:  ${data.fqdn}\n`);
        process.stdout.write(`Status:  ${data.status}\n`);
        process.stdout.write(`\nAdd this TXT record to your DNS:\n`);
        process.stdout.write(`  Name:  ${data.txt_name}\n`);
        process.stdout.write(`  Value: ${data.txt_record}\n`);
        process.stdout.write(
          `\nOnce the record propagates, run:\n  openclam domain bind --instance <instanceId> --domain ${data.fqdn}\n`,
        );
      }
    });
}
