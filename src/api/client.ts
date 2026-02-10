import {
  CliError,
  authError,
  forbiddenManual,
  notFoundError,
  providerUnavailable,
  providerValidation,
  amlFrozen,
  insufficientFunds,
  insufficientReserve,
  paymentFailed,
} from "../errors.js";
import { EXIT_CONFLICT, EXIT_PRECONDITION } from "../exitCodes.js";

export interface ClientOpts {
  apiKey: string;
  baseUrl: string;
}

export class OpenClamClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(opts: ClientOpts) {
    this.apiKey = opts.apiKey;
    this.baseUrl = opts.baseUrl.replace(/\/+$/, "");
  }

  // ---- HTTP verbs ----

  async get<T = unknown>(path: string, query?: Record<string, string>): Promise<T> {
    const url = this.url(path, query);
    return this.request<T>(url, { method: "GET" });
  }

  async post<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(this.url(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T = unknown>(path: string, body: unknown): Promise<T> {
    return this.request<T>(this.url(path), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  async del<T = unknown>(path: string, query?: Record<string, string>): Promise<T> {
    return this.request<T>(this.url(path, query), { method: "DELETE" });
  }

  /**
   * Raw POST that returns the Response object directly (no error mapping).
   * Used for x402 flows where the caller needs to handle 402 responses.
   */
  async rawPost(
    path: string,
    body?: unknown,
    extraHeaders?: Record<string, string>,
  ): Promise<Response> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...extraHeaders,
    };

    return fetch(this.url(path), {
      method: "POST",
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  // ---- internals ----

  private url(path: string, query?: Record<string, string>): string {
    const u = new URL(path, this.baseUrl);
    if (query) {
      for (const [k, v] of Object.entries(query)) u.searchParams.set(k, v);
    }
    return u.toString();
  }

  private async request<T>(url: string, init: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: "application/json",
      ...(init.headers as Record<string, string> | undefined),
    };

    let res: Response;
    try {
      res = await fetch(url, { ...init, headers });
    } catch (e: unknown) {
      throw providerUnavailable(
        `Network error: ${e instanceof Error ? e.message : String(e)}`,
      );
    }

    if (res.ok) {
      const text = await res.text();
      if (!text) return undefined as T;
      return JSON.parse(text) as T;
    }

    // Try to parse error body
    let body: { code?: string; message?: string; details?: Record<string, unknown> } = {};
    try {
      body = (await res.json()) as typeof body;
    } catch {
      // ignore parse failures
    }

    const code = body.code ?? "UNKNOWN";
    const msg = body.message ?? res.statusText;
    const details = body.details;

    switch (res.status) {
      case 401:
        throw authError(msg);
      case 403:
        if (code === "AML_FROZEN") throw amlFrozen(msg);
        throw forbiddenManual(msg);
      case 404:
        throw notFoundError(msg);
      case 402:
        throw paymentFailed(msg);
      case 409:
        throw new CliError(code, msg, EXIT_CONFLICT, details);
      case 412:
        throw new CliError(code, msg, EXIT_PRECONDITION, details);
      case 422:
        throw providerValidation(msg);
      case 429:
        throw new CliError("RATE_LIMITED", msg, EXIT_PRECONDITION);
      case 502:
      case 503:
      case 504:
        throw providerUnavailable(msg);
      default:
        // Check for specific error codes from body
        if (code === "INSUFFICIENT_MINIMUM_BALANCE")
          throw insufficientReserve(msg, details);
        if (code === "INSUFFICIENT_FUNDS")
          throw insufficientFunds(msg, details);
        throw new CliError(code, msg, 1, details);
    }
  }
}
