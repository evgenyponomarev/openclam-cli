import { Command } from "commander";
import { billingBalanceCmd } from "./status.js";
import { billingBurnCmd } from "./burn.js";
import { billingHistoryCmd } from "./history.js";
import { billingAddressCmd } from "./address.js";
import { billingTopupCmd } from "./topup.js";
import { billingCheckCmd } from "./check.js";

export function registerBillingCommands(program: Command) {
  const billing = program.command("billing").description("Account billing & payments");

  billingBalanceCmd(billing);
  billingBurnCmd(billing);
  billingHistoryCmd(billing);
  billingAddressCmd(billing);
  billingTopupCmd(billing);
  billingCheckCmd(billing);
}
