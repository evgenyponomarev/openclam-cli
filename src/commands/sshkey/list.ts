import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success } from "../../output.js";
import type { SshKey } from "../../api/types.js";

export function sshKeyListCmd(parent: Command) {
  parent
    .command("list")
    .description("List SSH keys")
    .action(async function (this: Command) {
      const client = clientFromProgram(this);
      const data = await client.get<SshKey[]>("/v1/ssh-keys");
      success(data);
    });
}
