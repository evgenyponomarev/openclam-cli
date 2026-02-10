import { Command } from "commander";
import { gpuOffersCmd } from "./offers.js";
import { gpuCreateCmd } from "./create.js";
import { gpuListCmd } from "./list.js";
import { gpuShowCmd } from "./show.js";
import { gpuWaitCmd } from "./wait.js";
import { gpuPortsCmd } from "./ports.js";
import { gpuRenameCmd } from "./rename.js";
import { gpuRmCmd } from "./rm.js";

export function registerGpuCommands(program: Command) {
  const gpu = program.command("gpu").description("Manage GPU instances");

  gpuOffersCmd(gpu);
  gpuCreateCmd(gpu);
  gpuListCmd(gpu);
  gpuShowCmd(gpu);
  gpuWaitCmd(gpu);
  gpuPortsCmd(gpu);
  gpuRenameCmd(gpu);
  gpuRmCmd(gpu);
}
