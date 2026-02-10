import { Command } from "commander";
import { isJsonMode, success } from "../../output.js";
import { existsSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, basename } from "node:path";

const DEFAULT_BASE_URL = "https://openclam.run";

/** Try to find an existing OPENCLAM_API_KEY from env or shell rc files */
function findExistingKey(): string | null {
  if (process.env.OPENCLAM_API_KEY) return process.env.OPENCLAM_API_KEY;
  const home = homedir();
  for (const rc of [".zshrc", ".bashrc", ".profile"]) {
    const p = join(home, rc);
    if (!existsSync(p)) continue;
    const match = readFileSync(p, "utf-8").match(/export OPENCLAM_API_KEY=(\S+)/);
    if (match) return match[1];
  }
  return null;
}

function saveKeyToRc(apiKey: string): string[] {
  const home = homedir();
  const exportLine = `export OPENCLAM_API_KEY=${apiKey}`;
  const rcFiles = [".bashrc", ".zshrc", ".profile"]
    .map((f) => join(home, f))
    .filter((f) => existsSync(f));

  for (const rc of rcFiles) {
    const content = readFileSync(rc, "utf-8");
    if (content.includes("OPENCLAM_API_KEY=")) {
      writeFileSync(rc, content.replace(/export OPENCLAM_API_KEY=.*/g, exportLine));
    } else {
      appendFileSync(rc, `\n# OpenClam\n${exportLine}\n`);
    }
  }
  return rcFiles;
}

export function registerSignupCommand(parent: Command) {
  parent
    .command("signup")
    .description("Create a new OpenClam account or show existing one")
    .option("--force", "Create a new account even if one already exists")
    .action(async (opts: { force?: boolean }) => {
      const existingKey = opts.force ? null : findExistingKey();

      if (existingKey) {
        // Existing key found — validate it against the API
        const baseUrl = (process.env.OPENCLAM_API_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
        const res = await fetch(`${baseUrl}/v1/billing/status`, {
          headers: { Authorization: `Bearer ${existingKey}` },
        });

        const w = (s: string) => process.stdout.write(s);

        if (res.ok) {
          const status = (await res.json()) as {
            available_usdc: number;
            reserved_usdc: number;
            daily_burn_usdc: number;
            active_instance_count: number;
            deposit_address?: string;
          };

          if (isJsonMode()) {
            success({ api_key: existingKey, ...status });
            return;
          }

          w("\n");
          w("  Account already configured\n");
          w("  ──────────────────────────────\n");
          w(`  API Key:      ${existingKey.slice(0, 12)}...${existingKey.slice(-6)}\n`);
          w(`  Available:    $${Number(status.available_usdc).toFixed(2)} USDC\n`);
          w(`  Reserved:     $${Number(status.reserved_usdc).toFixed(2)} USDC\n`);
          w(`  Instances:    ${status.active_instance_count}\n`);
          w("\n");
          w("  To create a new account instead: openclam auth signup --force\n");
          w("\n");
          return;
        }

        // Key exists but invalid — fall through to create new account
        w("\n");
        w("  Existing API key is invalid, creating new account...\n");
      }

      // Create new account
      const baseUrl = (process.env.OPENCLAM_API_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
      const res = await fetch(`${baseUrl}/v1/accounts`, { method: "POST" });
      if (!res.ok) {
        const body = await res.text();
        process.stderr.write(`ERROR: signup failed (${res.status}): ${body}\n`);
        process.exit(1);
      }

      const data = (await res.json()) as {
        account_id: string;
        api_key: string;
        deposit_address: string;
      };

      if (isJsonMode()) {
        success(data);
        return;
      }

      const rcFiles = saveKeyToRc(data.api_key);
      process.env.OPENCLAM_API_KEY = data.api_key;

      const w = (s: string) => process.stdout.write(s);
      w("\n");
      w("  Account created successfully\n");
      w("  ──────────────────────────────\n");
      w(`  Account ID:       ${data.account_id}\n`);
      w(`  API Key:          ${data.api_key}\n`);
      w(`  Deposit Address:  ${data.deposit_address}\n`);
      w("\n");
      if (rcFiles.length > 0) {
        w(`  API key saved to ${rcFiles.map((f) => "~/" + basename(f)).join(", ")}\n`);
        w("  Run: source ~/.bashrc  (or restart your terminal)\n");
      } else {
        w(`  Run: export OPENCLAM_API_KEY=${data.api_key}\n`);
      }
      w("\n");
    });
}
