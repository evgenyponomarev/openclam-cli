import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success } from "../../output.js";
import { CliError } from "../../errors.js";
import { EXIT_USAGE } from "../../exitCodes.js";
import type { SshKey } from "../../api/types.js";
import * as fs from "node:fs";

export function sshKeyAddCmd(parent: Command) {
  parent
    .command("add")
    .description("Add an SSH key")
    .requiredOption("--name <n>", "key name")
    .requiredOption("--pubkey <pathOrRaw>", "path to public key file or raw public key string")
    .action(async function (this: Command) {
      const opts = this.opts();
      const client = clientFromProgram(this);

      let pubkey: string = opts.pubkey;
      // If it looks like a file path (contains / or ends with .pub), read it
      if (looksLikeFile(pubkey)) {
        try {
          pubkey = fs.readFileSync(pubkey, "utf-8").trim();
        } catch (e: unknown) {
          throw new CliError(
            "INVALID_INPUT",
            `Cannot read public key file: ${opts.pubkey}`,
            EXIT_USAGE,
          );
        }
      }

      const data = await client.post<SshKey>("/v1/ssh-keys", {
        name: opts.name,
        public_key: pubkey,
      });
      success(data);
    });
}

function looksLikeFile(s: string): boolean {
  return s.includes("/") || s.includes("\\") || s.endsWith(".pub");
}
