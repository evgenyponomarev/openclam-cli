import { Command } from "commander";
import { domainListCmd } from "./list.js";
import { domainAllocateCmd } from "./allocate.js";
import { domainSetCmd } from "./set.js";
import { domainReleaseCmd } from "./release.js";
import { domainVerifyCmd } from "./verify.js";
import { domainBindCmd } from "./bind.js";

export function registerDomainCommands(program: Command) {
  const domain = program.command("domain").description("Manage domains & subdomains");

  domainListCmd(domain);
  domainAllocateCmd(domain);
  domainSetCmd(domain);
  domainReleaseCmd(domain);
  domainVerifyCmd(domain);
  domainBindCmd(domain);
}
