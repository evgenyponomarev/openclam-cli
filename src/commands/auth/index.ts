import { Command } from "commander";
import { registerSignupCommand } from "./signup.js";
import { registerWhoamiCommand } from "./whoami.js";

export function registerAuthCommands(parent: Command) {
  const auth = parent.command("auth").description("Account management");
  registerSignupCommand(auth);
  registerWhoamiCommand(auth);
}
