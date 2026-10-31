"""Conservative quote assessment. Model extraction is evidence to review, not truth."""

import json
import re

from pydantic import ValidationError

from backend.models import QuoteEvidence, ShoppingRequest


def extraction_field(data):
    """Support Bolna's named field and category/subjective wrappers, never summaries."""
    matches = []

    def visit(node, depth=0):
        if not isinstance(node, dict) or depth > 6:
            return
        for key, value in node.items():
            if key == "quote_evidence_json":
                matches.append(value)
            else:
                visit(value, depth + 1)

    visit(data)
    if len(matches) != 1:
        raise ValueError("Missing or ambiguous quote_evidence_json")
    value = matches[0]
    if isinstance(value, dict) and "subjective" in value:
        value = value["subjective"]
    if isinstance(value, str):
        value = json.loads(value)
    return QuoteEvidence.model_validate(value)


def assess_quote(request: ShoppingRequest, extracted_data, transcript: str):
    result = {
        "review_required": True,
        "eligible_for_recommendation": False,
        "budget_status": "unknown",
        "quoted_amount_for_quantity_inr": None,
        "quoted_amount_plus_delivery_inr": None,
        "verified_all_in_total_inr": None,
        "savings_inr": None,
        "calculation_assumption": (
            "Extracted price is for the requested quantity/basis; any added delivery is separate. "
            "Confirm inclusions before using these arithmetic estimates."
        ),
        "issues": [],
        "evidence_match_mode": "seller_turn_substring_whitespace_normalized",
    }
    try:
        quote = extraction_field(extracted_data)
    except (ValueError, TypeError, ValidationError):
        result["issues"] = ["invalid_or_missing_extraction"]
        return result
    result["extraction"] = quote.model_dump(mode="json")
    issues = result["issues"]
    # Parse speaker-labelled lines. Unrecognised transcripts remain unverified.
    turns = re.findall(
        r"(?:^|\n)\s*(user|assistant|agent|seller|human)\s*:\s*(.*?)(?=\n\s*"
        r"(?:user|assistant|agent|seller|human)\s*:|\Z)",
        transcript,
        re.IGNORECASE | re.DOTALL,
    )
    seller_turns = [text for role, text in turns if role.lower() in {"user", "seller", "human"}]
    agent_turns = [text for role, text in turns if role.lower() in {"assistant", "agent"}]

    def normalized(text):
        return " ".join(text.split())

    if not quote.evidence_quotes or any(
        not excerpt.strip()
        or not any(normalized(excerpt) in normalized(turn) for turn in seller_turns)
        for excerpt in quote.evidence_quotes
    ):
        issues.append("missing_or_non_seller_evidence")
    if any(not e.strip() or e not in transcript for e in quote.commitment_evidence):
        issues.append("unsupported_commitment_evidence")
    # This flags common English commitments for review, not a multilingual proof of absence.
    if quote.commitment_made is not False or any(
        re.search(
            r"\b(?:book it|reserve (?:it|them)|we will buy|place (?:the|an) order|pack them)\b",
            turn,
            re.IGNORECASE,
        )
        for turn in agent_turns
    ):
        issues.append("possible_purchase_commitment")
    if quote.offered_quantity != request.quantity or quote.requested_quantity != request.quantity:
        issues.append("quantity_mismatch_or_unknown")
    if quote.currency != "INR":
        issues.append("currency_unknown")
    if quote.availability != "available":
        issues.append("availability_not_confirmed")
    if quote.disposition != "quote_obtained":
        issues.append("no_final_quote")
    if quote.unknown_fees:
        issues.append("unresolved_fees")
    # v8 does not encode whether null tax means included or unknown. Never assume free.
    issues.append("tax_fee_inclusions_and_variant_require_review")
    issues.append("seller_evidence_semantics_require_review")
    if quote.final_quote_basis == "unknown" or quote.final_quote_amount is None:
        issues.append("price_basis_or_amount_unknown")
        return result
    if "quantity_mismatch_or_unknown" in issues or "currency_unknown" in issues:
        return result
    amount = quote.final_quote_amount * (
        request.quantity if quote.final_quote_basis == "unit" else 1
    )
    result["quoted_amount_for_quantity_inr"] = f"{amount:.2f}"
    delivery = quote.delivery_amount if request.fulfilment == "delivery" else None
    if delivery is not None:
        # This is explicitly a provisional arithmetic sum, NOT an inclusive validated total.
        result["quoted_amount_plus_delivery_inr"] = f"{amount + delivery:.2f}"
    if request.fulfilment == "delivery" and delivery is None:
        issues.append("delivery_fee_unknown")
    cap = request.budget.amount_inr * (request.quantity if request.budget.basis == "unit" else 1)
    # A raw quoted amount can establish a potential violation, never a verified pass.
    comparison_amount = amount
    if request.budget.delivery == "included" and delivery is not None:
        comparison_amount += delivery
    exceeds = (
        comparison_amount >= cap
        if request.budget.comparison == "under"
        else comparison_amount > cap
    )
    if exceeds:
        result["budget_status"] = "potentially_over_budget"
    if quote.final_all_in_total is not None and quote.final_all_in_total < amount:
        issues.append("inconsistent_all_in_total")
    return result
