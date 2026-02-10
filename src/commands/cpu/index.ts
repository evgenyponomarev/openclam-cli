import { Command } from "commander";
import { cpuConfigsCmd } from "./configs.js";
import { cpuCountriesCmd } from "./countries.js";
import { cpuHardwareCmd } from "./hardware.js";
import { cpuOffersCmd } from "./offers.js";
import { cpuEstimateCmd } from "./estimate.js";
import { cpuImagesCmd } from "./images.js";
import { cpuCreateCmd } from "./create.js";
import { cpuListCmd } from "./list.js";
import { cpuShowCmd } from "./show.js";
import { cpuWaitCmd } from "./wait.js";
import { cpuPortsCmd } from "./ports.js";
import { cpuRenameCmd } from "./rename.js";
import { cpuRmCmd } from "./rm.js";

export function registerCpuCommands(program: Command) {
  const cpu = program.command("cpu").description("Manage CPU instances");

  // Discovery
  cpuConfigsCmd(cpu);
  cpuCountriesCmd(cpu);
  cpuHardwareCmd(cpu);
  cpuOffersCmd(cpu);
  cpuEstimateCmd(cpu);
  cpuImagesCmd(cpu);

  // Instance lifecycle
  cpuCreateCmd(cpu);
  cpuListCmd(cpu);
  cpuShowCmd(cpu);
  cpuWaitCmd(cpu);
  cpuPortsCmd(cpu);
  cpuRenameCmd(cpu);
  cpuRmCmd(cpu);
}
