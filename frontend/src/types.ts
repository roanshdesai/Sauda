export type Call = {
  id: string;
  seller_index: number;
  status: string;
  updated_at: string;
  result: null | {
    transcript?: string;
    termination_reason?: string;
    provider_cost_cents?: number;
    duration_seconds?: number;
    quote?: Quote;
  };
};
export type Quote = {
  call_id?: string;
  seller?: string;
  budget_status: string;
  review_required: boolean;
  quoted_amount_for_quantity_inr: string | null;
  quoted_amount_plus_delivery_inr: string | null;
  verified_all_in_total_inr: string | null;
  issues: string[];
  extraction?: {
    final_quote_amount: string | null;
    final_quote_basis: string;
    delivery_amount: string | null;
    tax_amount: string | null;
    evidence_quotes: string[];
    fulfilment: string | null;
    offered_item_variant: string | null;
    availability: string;
    commitment_made: boolean | null;
  };
};
export type RequestInput = {
  item: string;
  variant: string;
  quantity: number;
  currency: "INR";
  budget: {
    amount_inr: string;
    basis: "unit" | "total";
    delivery: "included" | "additional";
    comparison: "at_most" | "under";
  };
  fulfilment: "pickup" | "delivery";
  area: string;
  required_by: string;
  sellers: { name: string; phone: string }[];
  mode: "consented_roleplay";
};
export type ShoppingRecord = {
  id: string;
  created_at: string;
  request: RequestInput;
  calls: Call[];
  quotes: Quote[];
  plan: {
    private_quantity_limit_inr: string;
    nonbinding_proposals: { unit_inr: string; total_inr: string }[];
    offer_basis: "unit" | "total";
  };
  progress: {
    attempted: number;
    finished: number;
    total_sellers: number;
    needs_reconciliation: number;
  };
};
export type Config = {
  live_calls_enabled: boolean;
  provider_configured: boolean;
  allowed_recipient_count: number;
};
