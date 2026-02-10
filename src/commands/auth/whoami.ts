import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { isJsonMode, success } from "../../output.js";

export function registerWhoamiCommand(parent: Command) {
  parent
    .command("whoami")
    .description("Show current account info")
    .action(async function (this: Command) {
      const client = clientFromProgram(this);
      const data = (await client.get("/v1/billing/status")) as {
        available_usdc: number;
        reserved_usdc: number;
        daily_burn_usdc: number;
        active_instance_count: number;
      };

      if (isJsonMode()) {
        success(data);
        return;
      }

      const w = (s: string) => process.stdout.write(s);
      w("\n");
      w(`  Available:  $${Number(data.available_usdc).toFixed(2)} USDC\n`);
      w(`  Reserved:   $${Number(data.reserved_usdc).toFixed(2)} USDC\n`);
      w(`  Daily burn: $${Number(data.daily_burn_usdc).toFixed(2)} USDC\n`);
      w(`  Instances:  ${data.active_instance_count}\n`);
      w("\n");
    });
}
