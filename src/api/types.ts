// ---- CPU discovery ----

export interface CpuConfig {
  id: string;
  vcpu: number;
  memory_mb: number;
  storage_gb: number;
  [key: string]: unknown;
}

export interface Country {
  code: string;
  name: string;
  [key: string]: unknown;
}

export interface Hardware {
  [key: string]: unknown;
}

export interface Offer {
  [key: string]: unknown;
}

export interface EstimateResponse {
  price_per_day_usdc: number;
  deposit_usdc: number;
  deposit_epochs?: number;
  [key: string]: unknown;
}

export interface Image {
  slug: string;
  name: string;
  [key: string]: unknown;
}

// ---- SSH keys ----

export interface SshKey {
  id: string;
  name: string;
  fingerprint?: string;
  created_at: string;
  [key: string]: unknown;
}

// ---- Instances ----

export interface DomainInfo {
  fqdn: string;
  status: string;
  target_ip: string | null;
}

export interface Instance {
  id: string;
  name: string;
  kind: "cpu" | "gpu";
  provider: string;
  status: string;
  public_ip: string | null;
  config: string;
  price_per_day_usdc: number;
  reserved_usdc: number;
  target_reserve_usdc: number;
  billing_state: string;
  domain: DomainInfo | null;
  ports: string[];
  created_at: string;
  deleted_at: string | null;
  [key: string]: unknown;
}

// ---- Billing ----

export interface BillingStatus {
  available_usdc: number;
  reserved_usdc: number;
  total_usdc: number;
  daily_burn_usdc: number;
  min_reserved_required_usdc: number;
  target_reserved_usdc: number;
  actual_reserved_usdc: number;
  next_billing_time: string;
  next_epoch_id: string;
  runway_days: number | "infinite";
}

export interface BurnEntry {
  instance_id: string;
  name: string;
  kind: string;
  provider: string;
  status: string;
  price_per_day_usdc: number;
  reserved_usdc: number;
  target_reserve_usdc: number;
}

export interface BurnResponse {
  instances: BurnEntry[];
  totals: {
    daily_burn_usdc: number;
    reserved_usdc: number;
    target_reserve_usdc: number;
  };
}

export interface BillingHistoryEntry {
  epoch_id: string;
  type: string;
  amount_usdc: number;
  created_at: string;
  [key: string]: unknown;
}

export interface DepositAddress {
  address: string;
  chain: string;
}

export interface TopupResponse {
  ok?: boolean;
  status: string;
  amount_usdc?: number;
  tx_hash?: string;
  new_available_usdc?: number;
  [key: string]: unknown;
}

export interface CheckResponse {
  ok: boolean;
  runway_days: number | "infinite";
  underfunded_instances?: { instance_id: string; name: string; deficit_usdc: number }[];
}

// ---- Domains ----

export interface Domain {
  id: string;
  fqdn: string;
  type: "managed_subdomain" | "custom_domain";
  status: string;
  target_ip: string | null;
  instance_id: string | null;
  kind: string | null;
  dns_record_id: string | null;
  created_at: string;
  [key: string]: unknown;
}
