import { Command } from "commander";
import { sshKeyListCmd } from "./list.js";
import { sshKeyAddCmd } from "./add.js";
import { sshKeyRmCmd } from "./rm.js";

export function registerSshKeyCommands(program: Command) {
  const sshkey = program.command("sshkey").description("Manage SSH keys");

  sshKeyListCmd(sshkey);
  sshKeyAddCmd(sshkey);
  sshKeyRmCmd(sshkey);
}
