import type { Instance } from "../api/types.js";

export function printInstance(data: Instance, title?: string) {
  const w = (s: string) => process.stdout.write(s);
  w("\n");
  if (title) {
    w(`  ${title}\n`);
    w(`  ${"─".repeat(title.length)}\n`);
  }
  w(`  ID:        ${data.id}\n`);
  w(`  Name:      ${data.name}\n`);
  w(`  Kind:      ${data.kind}\n`);
  if (data.config) {
    w(`  Config:    ${data.config}\n`);
  }
  w(`  Status:    ${data.status}\n`);
  w(`  Provider:  ${data.provider}\n`);
  w(`  IP:        ${data.public_ip ?? "pending..."}\n`);
  if (data.domain) {
    w(`  Domain:    ${data.domain.fqdn} (${data.domain.status})\n`);
  }
  if (data.public_ip) {
    w(`  SSH:       ssh root@${data.public_ip}\n`);
  }
  if (data.kind === "gpu") {
    w(`  Cost:      $${(Number(data.price_per_day_usdc) / 24).toFixed(2)}/hr\n`);
  } else {
    w(`  Cost:      $${Number(data.price_per_day_usdc).toFixed(2)}/day\n`);
  }
  w(`  Reserved:  $${Number(data.reserved_usdc).toFixed(2)}\n`);
  w(`  Billing:   ${data.billing_state}\n`);
  if (data.ports?.length) {
    w(`  Ports:     ${data.ports.join(", ")}\n`);
  }
  w(`  Created:   ${data.created_at}\n`);
  w("\n");
}
