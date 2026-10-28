"""Prepare INR quote proposals; does not authorize purchases or place calls."""
import argparse
import json
from decimal import Decimal, InvalidOperation, ROUND_DOWN


def prepare_plan(quantity, max_unit, delivery="included", strict=False):
    if isinstance(quantity, bool) or not isinstance(quantity, int) or quantity < 1:
        raise ValueError("quantity must be a positive integer")
    try:
        cap = Decimal(str(max_unit))
    except InvalidOperation as exc:
        raise ValueError("max_unit must be a positive INR amount") from exc
    if not cap.is_finite() or cap <= 0 or cap.as_tuple().exponent < -2:
        raise ValueError("max_unit must be positive with at most two decimals")
    if delivery not in {"included", "additional"}:
        raise ValueError("delivery must be included or additional")
    step = Decimal("10") if cap >= 10 else Decimal("0.01")
    ladder = []
    for ratio in ("0.88", "0.94", "0.98"):
        amount = (cap * Decimal(ratio) / step).to_integral_value(rounding=ROUND_DOWN) * step
        if amount <= 0:
            continue
        if not ladder or amount != Decimal(ladder[-1]["unit_inr"]):
            ladder.append({"unit_inr": f"{amount:.2f}", "total_inr": f"{amount * quantity:.2f}"})
    if not ladder:
        raise ValueError("budget too small to prepare a positive counteroffer")
    return {
        "currency": "INR", "quantity": quantity,
        "private_unit_limit_inr": f"{cap:.2f}",
        "private_quantity_limit_inr": f"{cap * quantity:.2f}",
        "comparison": "strictly_less_than" if strict else "less_than_or_equal",
        "budget_scope": "merchandise_only" if delivery == "additional" else "all_inclusive",
        "delivery": {"policy": delivery, "request_waiver": delivery == "additional", "fee_inr": None},
        "maximum_delivered_total_inr": None if delivery == "additional" else f"{cap * quantity:.2f}",
        "nonbinding_proposals": ladder,
        "purchase_authorized": False,
        "note": "Unknown delivery fees are not zero. Validate seller evidence independently; this plan is not a quote or a calling backend.",
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--quantity", type=int, required=True)
    parser.add_argument("--max-unit", required=True)
    parser.add_argument("--delivery", choices=["included", "additional"], default="included")
    parser.add_argument("--strict", action="store_true")
    args = parser.parse_args()
    try:
        result = prepare_plan(args.quantity, args.max_unit, args.delivery, args.strict)
    except ValueError as error:
        parser.error(str(error))
    print(json.dumps(result, indent=2))
