import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode } from "../../output.js";
import type { DepositAddress } from "../../api/types.js";

export function billingAddressCmd(parent: Command) {
  parent
    .command("address")
    .description("Show deposit address for topups")
    .action(async function (this: Command) {
      const client = clientFromProgram(this);
      const data = await client.get<DepositAddress>("/v1/billing/address");
      if (isJsonMode()) {
        success(data);
      } else {
        process.stdout.write(`Deposit address: ${data.address}\n`);
        process.stdout.write(`Chain:           ${data.chain}\n`);
      }
    });
}
