import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, isJsonMode } from "../../output.js";
import { paymentFailed } from "../../errors.js";
import { createX402Client, signPayment } from "../../x402client.js";
import type { TopupResponse } from "../../api/types.js";

export function billingTopupCmd(parent: Command) {
  parent
    .command("topup")
    .description("Add USDC to your account balance")
    .requiredOption("--usdc <amount>", "amount in USDC to topup")
    .action(async function (this: Command) {
      const opts = this.opts();
      const client = clientFromProgram(this);
      const amount = Number(opts.usdc);
      if (isNaN(amount) || amount <= 0) {
        throw paymentFailed("--usdc must be a positive number");
      }

      const walletKey =
        process.env.OPENCLAM_WALLET_KEY ?? process.env.WALLET_PRIVATE_KEY ?? "";

      if (!walletKey) {
        const w = (s: string) => process.stdout.write(s);
        w("\n");
        w("  Automatic payment requires a wallet private key.\n");
        w("  Set it and re-run:\n");
        w("\n");
        w("    export OPENCLAM_WALLET_KEY=0x<private-key-with-base-usdc>\n");
        w(`    openclam billing topup --usdc ${amount}\n`);
        w("\n");
        w("  The wallet needs USDC on Base (Coinbase L2).\n");
        w("\n");
        process.exit(1);
      }

      await automaticTopup(client, amount, walletKey);
    });
}

async function automaticTopup(
  client: ReturnType<typeof clientFromProgram>,
  amount: number,
  walletKey: string,
) {
  // Step 1: Initial request → 402 with payment requirements
  let firstRes: Response;
  try {
    firstRes = await client.rawPost("/v1/billing/topup", {
      amount_usdc: amount,
    });
  } catch {
    throw paymentFailed("Failed to connect to OpenClam API");
  }

  if (firstRes.ok) {
    const data = await firstRes.json();
    success(data);
    return;
  }

  if (firstRes.status !== 402) {
    const errBody = (await firstRes.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const inner = errBody?.error;
    const msg =
      (inner && typeof inner === "object"
        ? (inner as Record<string, unknown>).message
        : null) ??
      errBody?.message ??
      (typeof inner === "string" ? inner : null) ??
      firstRes.statusText;
    throw paymentFailed(String(msg));
  }

  // Step 2: Sign x402 payment
  const x402 = createX402Client(walletKey);
  if (!x402) throw paymentFailed("Failed to initialize x402 client");

  const responseHeaders: Record<string, string> = {};
  firstRes.headers.forEach((v, k) => {
    responseHeaders[k.toLowerCase()] = v;
  });
  const body402 = await firstRes.json().catch(() => undefined);

  const paymentRequired = x402.getPaymentRequiredResponse(
    (name: string) => responseHeaders[name.toLowerCase()] ?? null,
    body402,
  );

  const paymentHeaders = await signPayment(x402, paymentRequired);

  // Step 3: Retry with payment signature
  const retryRes = await client.rawPost(
    "/v1/billing/topup",
    { amount_usdc: amount },
    paymentHeaders,
  );

  if (!retryRes.ok) {
    const errBody = (await retryRes.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const inner = errBody?.error;
    const msg =
      (inner && typeof inner === "object"
        ? (inner as Record<string, unknown>).message
        : null) ??
      errBody?.message ??
      (typeof inner === "string" ? inner : null) ??
      retryRes.statusText;
    throw paymentFailed(String(msg));
  }

  const data = (await retryRes.json()) as TopupResponse;

  if (isJsonMode()) {
    success(data);
    return;
  }

  const w = (s: string) => process.stdout.write(s);
  w("\n");
  w("  Payment successful\n");
  w("  ──────────────────────────────────────\n");
  w(`  Amount:       ${amount} USDC\n`);
  w(`  TX Hash:      ${data.tx_hash ?? "n/a"}\n`);
  w(`  New Balance:  $${Number(data.new_available_usdc ?? 0).toFixed(2)} USDC\n`);
  w("\n");
}
