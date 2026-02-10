import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success } from "../../output.js";

export function sshKeyRmCmd(parent: Command) {
  parent
    .command("rm")
    .description("Remove an SSH key")
    .requiredOption("--key <keyId>", "SSH key ID to remove")
    .option("--force", "force removal even if key is in use by running instances")
    .action(async function (this: Command) {
      const opts = this.opts();
      const client = clientFromProgram(this);
      const query: Record<string, string> = {};
      if (opts.force) query.force = "1";
      await client.del(`/v1/ssh-keys/${opts.key}`, query);
      success({ id: opts.key, status: "deleted" });
    });
}
