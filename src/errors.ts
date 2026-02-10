import {
  EXIT_UNAUTHENTICATED,
  EXIT_FORBIDDEN_MANUAL,
  EXIT_NOT_FOUND,
  EXIT_CONFLICT,
  EXIT_PROVIDER_UNAVAILABLE,
  EXIT_PRECONDITION,
  EXIT_TIMEOUT,
  EXIT_PROVIDER_VALIDATION,
  EXIT_INSUFFICIENT_RESERVE,
  EXIT_INSUFFICIENT_FUNDS,
  EXIT_AML_FROZEN,
  EXIT_PAYMENT_FAILED,
} from "./exitCodes.js";

export class CliError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly exitCode: number,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "CliError";
  }
}

// ---------- factory helpers ----------

export const authError = (msg = "Missing or invalid API key") =>
  new CliError("UNAUTHENTICATED", msg, EXIT_UNAUTHENTICATED);

export const forbiddenManual = (msg = "Account frozen (manual)") =>
  new CliError("FORBIDDEN", msg, EXIT_FORBIDDEN_MANUAL);

export const notFoundError = (msg = "Resource not found") =>
  new CliError("NOT_FOUND", msg, EXIT_NOT_FOUND);

export const conflictError = (code: string, msg: string, details?: Record<string, unknown>) =>
  new CliError(code, msg, EXIT_CONFLICT, details);

export const providerUnavailable = (msg = "Provider unavailable") =>
  new CliError("PROVIDER_UNAVAILABLE", msg, EXIT_PROVIDER_UNAVAILABLE);

export const preconditionError = (code: string, msg: string) =>
  new CliError(code, msg, EXIT_PRECONDITION);

export const timeoutError = (msg = "Operation timed out") =>
  new CliError("TIMEOUT", msg, EXIT_TIMEOUT);

export const providerValidation = (msg: string) =>
  new CliError("PROVIDER_VALIDATION", msg, EXIT_PROVIDER_VALIDATION);

export const insufficientReserve = (msg: string, details?: Record<string, unknown>) =>
  new CliError("INSUFFICIENT_MINIMUM_BALANCE", msg, EXIT_INSUFFICIENT_RESERVE, details);

export const insufficientFunds = (msg: string, details?: Record<string, unknown>) =>
  new CliError("INSUFFICIENT_FUNDS", msg, EXIT_INSUFFICIENT_FUNDS, details);

export const amlFrozen = (msg = "Account frozen (AML)") =>
  new CliError("AML_FROZEN", msg, EXIT_AML_FROZEN);

export const paymentFailed = (msg: string) =>
  new CliError("PAYMENT_FAILED", msg, EXIT_PAYMENT_FAILED);
