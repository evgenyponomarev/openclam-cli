/**
 * x402 client-side integration for OpenClam CLI.
 *
 * Handles the 402→sign→retry flow using the agent's wallet key.
 * The agent provides OPENCLAM_WALLET_KEY (hex private key) to enable
 * automatic payment signing for topups.
 */

import { x402Client, x402HTTPClient } from "@x402/core/client";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";
import type { PaymentRequired } from "@x402/core/types";

/**
 * Create an x402 HTTP client configured with the agent's wallet.
 * Returns null if no wallet key is configured.
 */
export function createX402Client(
  walletKey: string,
): x402HTTPClient | null {
  if (!walletKey) return null;

  // Ensure 0x prefix
  const key = walletKey.startsWith("0x")
    ? (walletKey as `0x${string}`)
    : (`0x${walletKey}` as `0x${string}`);

  const account = privateKeyToAccount(key);

  const client = new x402Client();
  registerExactEvmScheme(client, { signer: account });

  return new x402HTTPClient(client);
}

/**
 * Sign a payment for a 402 response.
 * Returns the headers to send with the retry request.
 */
export async function signPayment(
  httpClient: x402HTTPClient,
  paymentRequired: PaymentRequired,
): Promise<Record<string, string>> {
  const payload = await httpClient.createPaymentPayload(paymentRequired);
  return httpClient.encodePaymentSignatureHeader(payload);
}

/**
 * Parse a PaymentRequired object from a 402 response.
 */
export function parsePaymentRequired(
  httpClient: x402HTTPClient,
  headers: Record<string, string>,
  body?: unknown,
): PaymentRequired {
  return httpClient.getPaymentRequiredResponse(
    (name: string) => headers[name.toLowerCase()] ?? null,
    body,
  );
}
