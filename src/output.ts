import { CliError } from "./errors.js";

let jsonMode = false;

export function setJsonMode(v: boolean) {
  jsonMode = v;
}
export function isJsonMode() {
  return jsonMode;
}

// ---- success ----

export function success(data: unknown) {
  if (jsonMode) {
    process.stdout.write(JSON.stringify({ ok: true, data }, null, 2) + "\n");
  } else if (Array.isArray(data)) {
    table(data);
  } else if (data && typeof data === "object") {
    printObject(data as Record<string, unknown>);
  } else {
    process.stdout.write(String(data) + "\n");
  }
}

// ---- error ----

export function error(err: CliError) {
  if (jsonMode) {
    const payload: Record<string, unknown> = {
      ok: false,
      error: { code: err.code, message: err.message },
    };
    if (err.details) (payload.error as Record<string, unknown>).details = err.details;
    process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
  } else {
    process.stderr.write(`ERROR ${err.code}: ${err.message}\n`);
  }
}

// ---- table (array of flat objects) ----

export function table(rows: unknown[]) {
  if (rows.length === 0) {
    process.stdout.write("(no results)\n");
    return;
  }

  // If items are primitives (strings, numbers), just print one per line
  if (typeof rows[0] !== "object" || rows[0] === null) {
    for (const r of rows) process.stdout.write(String(r) + "\n");
    return;
  }

  const cols = Object.keys(rows[0] as Record<string, unknown>);
  const widths = cols.map((c) => c.length);
  const stringRows = (rows as Record<string, unknown>[]).map((r) =>
    cols.map((c, i) => {
      const s = formatCell(r[c]);
      if (s.length > widths[i]) widths[i] = s.length;
      return s;
    }),
  );

  const header = cols.map((c, i) => c.toUpperCase().padEnd(widths[i])).join("  ");
  const sep = widths.map((w) => "-".repeat(w)).join("  ");
  process.stdout.write(header + "\n" + sep + "\n");
  for (const row of stringRows) {
    process.stdout.write(row.map((v, i) => v.padEnd(widths[i])).join("  ") + "\n");
  }
}

// ---- helpers ----

function printObject(obj: Record<string, unknown>, indent = 0) {
  const pad = " ".repeat(indent);
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      process.stdout.write(`${pad}${k}:\n`);
      printObject(v as Record<string, unknown>, indent + 2);
    } else {
      process.stdout.write(`${pad}${k}: ${formatCell(v)}\n`);
    }
  }
}

function formatCell(v: unknown): string {
  if (v === null || v === undefined) return "-";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
