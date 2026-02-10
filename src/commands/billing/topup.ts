import { Command } from "commander";
import { clientFromProgram } from "../../index.js";
import { success, error as outputError, isJsonMode } from "../../output.js";
import { paymentFailed } from "../../errors.js";
import { createX402Client, signPayment } from "../../x402client.js";
import type { TopupResponse } from "../../api/types.js";

export function billingTopupCmd(parent: Command) {
  parent
    .command("topup")
    .description("Topup account balance (x402 stablecoin payment)")
    .requiredOption("--usdc <amount>", "amount in USDC to topup")
    .action(async function (this: Command) {
      const opts = this.opts();
      const client = clientFromProgram(this);
      const amount = Number(opts.usdc);
      if (isNaN(amount) || amount <= 0) {
        throw paymentFailed("--usdc must be a positive number");
      }

      // Step 1: Initial request → should return 402 with payment requirements
      let firstRes: Response;
      try {
        firstRes = await client.rawPost("/v1/billing/topup", {
          amount_usdc: amount,
        });
      } catch {
        throw paymentFailed("Failed to connect to OpenClam API");
      }

      // If server returned 200 directly (shouldn't happen, but handle gracefully)
      if (firstRes.ok) {
        const data = await firstRes.json();
        success(data);
        return;
      }

      if (firstRes.status !== 402) {
        // Not a payment flow — propagate the error
        const errBody = await firstRes.json().catch(() => ({}));
        const msg =
          (errBody as Record<string, unknown>)?.message ??
          (errBody as Record<string, unknown>)?.error ??
          firstRes.statusText;
        throw paymentFailed(String(msg));
      }

      // Step 2: Got 402 — need to sign and retry
      const walletKey =
        process.env.OPENCLAM_WALLET_KEY ?? process.env.WALLET_PRIVATE_KEY ?? "";

      if (!walletKey) {
        // No wallet key — surface the 402 info so the agent can handle externally
        const payReqHeader = firstRes.headers.get("payment-required");
        if (isJsonMode()) {
          const body = await firstRes.json().catch(() => ({}));
          success({
            status: "payment_required",
            message:
              "Set OPENCLAM_WALLET_KEY to enable automatic payment, or handle x402 externally.",
            payment_required: payReqHeader
              ? JSON.parse(Buffer.from(payReqHeader, "base64").toString())
              : body,
            amount_usdc: amount,
          });
        } else {
          process.stderr.write(
            "Payment required (HTTP 402). Set OPENCLAM_WALLET_KEY to enable automatic x402 payment.\n",
          );
          process.stderr.write(`Amount: ${amount} USDC\n`);
          if (payReqHeader) {
            const decoded = JSON.parse(
              Buffer.from(payReqHeader, "base64").toString(),
            );
            process.stderr.write(
              `Payment details: ${JSON.stringify(decoded, null, 2)}\n`,
            );
          }
        }
        throw paymentFailed(
          "Wallet key not configured for automatic x402 payment",
        );
      }

      // Create x402 client and sign the payment
      const x402 = createX402Client(walletKey);
      if (!x402) {
        throw paymentFailed("Failed to initialize x402 client");
      }

      // Parse the PaymentRequired from 402 response
      const responseHeaders: Record<string, string> = {};
      firstRes.headers.forEach((v, k) => {
        responseHeaders[k.toLowerCase()] = v;
      });
      const body402 = await firstRes.json().catch(() => undefined);

      const paymentRequired = x402.getPaymentRequiredResponse(
        (name: string) => responseHeaders[name.toLowerCase()] ?? null,
        body402,
      );

      // Sign the payment with the agent's wallet
      const paymentHeaders = await signPayment(x402, paymentRequired);

      // Step 3: Retry with payment signature
      const retryRes = await client.rawPost(
        "/v1/billing/topup",
        { amount_usdc: amount },
        paymentHeaders,
      );

      if (!retryRes.ok) {
        const errBody = await retryRes.json().catch(() => ({}));
        const msg =
          (errBody as Record<string, string>)?.message ??
          retryRes.statusText;
        throw paymentFailed(String(msg));
      }

      const data = (await retryRes.json()) as TopupResponse;
      success(data);
    });
}
