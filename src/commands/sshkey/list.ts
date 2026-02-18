import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode, table } from "../../output.js";
import type { SshKey } from "../../api/types.js";

export function sshKeyListCmd(parent: Command) {
  parent
    .command("list")
    .description("List SSH keys")
    .action(async function (this: Command) {
      const client = clientFromProgram(this);
      const data = await client.get<SshKey[]>("/v1/ssh-keys");
      if (isJsonMode()) {
        success(data);
      } else {
        if (data.length === 0) {
          process.stdout.write("No SSH keys registered.\n");
          return;
        }
        const rows = data.map((k) => ({
          id: k.id,
          name: k.name,
          fingerprint: k.fingerprint ?? "-",
          created: k.created_at,
        }));
        table(rows);
      }
    });
}
