import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode } from "../../output.js";
import { printInstance } from "../instanceFmt.js";
import { timeoutError } from "../../errors.js";
import type { Instance } from "../../api/types.js";

export function cpuWaitCmd(parent: Command) {
  parent
    .command("wait <instanceId>")
    .description("Wait for a CPU instance to reach a target status")
    .requiredOption("--for <status>", "target status (e.g. active)")
    .option("--timeout <duration>", "max wait duration (e.g. 10m)", "10m")
    .action(async function (this: Command, instanceId: string) {
      const opts = this.opts();
      const client = clientFromProgram(this);
      const target = opts.for.toLowerCase();
      const timeoutMs = parseDuration(opts.timeout);
      const start = Date.now();
      const pollIntervalMs = 3000;

      while (true) {
        const data = await client.get<Instance>(`/v1/instances/${instanceId}`);
        if (data.status.toLowerCase() === target) {
          if (isJsonMode()) {
            success(data);
          } else {
            printInstance(data);
          }
          return;
        }
        if (Date.now() - start > timeoutMs) {
          throw timeoutError(
            `Instance ${instanceId} did not reach '${target}' within ${opts.timeout}`,
          );
        }
        await sleep(pollIntervalMs);
      }
    });
}

function parseDuration(s: string): number {
  const match = s.match(/^(\d+)(s|m|h)$/);
  if (!match) return 600_000;
  const n = parseInt(match[1], 10);
  switch (match[2]) {
    case "s": return n * 1000;
    case "m": return n * 60_000;
    case "h": return n * 3_600_000;
    default: return 600_000;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
