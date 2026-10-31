# Yellow T-shirts — v15 phone test, 31 October 2026

Consenting user roleplay through the backend; no real shop, order, reservation or payment. Request: three yellow T-shirts, size 38, pickup in Bandra, Mumbai by 5 November 2026, maximum INR 5,000 for the whole quantity including mandatory charges.

## Configuration and authorization

The existing primary agent was fetched before testing and exactly matched the saved 29 October v15 configuration. No agents or prompts were modified. Refreshed trial balance before the first call was USD 8.93, within the existing USD 5 testing authorization. Live dialing was temporarily enabled only for each explicit dispatch and then disabled again. Credentials, phone number and full provider responses remain in ignored private files.

## Attempts

| Attempt | Duration | Provider cost | Ending |
| --- | --- | --- | --- |
| Interrupted by an important incoming call | 21 s | USD 0.0241 | User hung up |
| User explicitly requested retry | 124 s | USD 0.1452 | Agent ended call |

The retry used a new persisted request, preserving the interrupted attempt and the one-dispatch-per-request/seller guard. Combined cost: USD 0.1693. No automatic redial occurred. Results were obtained through the explicit provider refresh endpoint; this is not evidence of a fresh successful webhook delivery.

## Observed retry behaviour

- The user selected English. All saved agent transcript turns remained English. The user then confirmed the actual voice stayed in English and the bargaining/pauses were demo-ready. This validates the primary on this scenario; Hindi, Hinglish and the backup were not phone-tested in this run.
- Agent requested three yellow T-shirts, size 38, pickup in Bandra by 5 November.
- An unrelated insurance phrase was redirected back to T-shirts.
- Seller opening: INR 3,000 each. Agent opening: INR 1,460 each, including taxes (INR 4,380 for three).
- Seller counter: INR 1,600 each. Agent counter: INR 1,560 each, repeated when the user did not hear it. Seller accepted INR 1,560.
- Agent recapped INR 4,680 for three, pickup conditions and quote-only status; provider reported `agent_ended_call`.
- INR 4,680 is arithmetically INR 320 below the INR 5,000 quantity cap. This is a roleplay quote, not validated savings or a real merchant offer.

## Remaining evidence issue

The extraction included an assistant-spoken stock question as evidence. Backend assessment correctly retained `review_required=true`, `eligible_for_recommendation=false`, and `budget_status=unknown`, with `missing_or_non_seller_evidence` and tax/variant/semantic review flags. The quote's arithmetic estimate is INR 4,680; `verified_all_in_total_inr` and savings remain null. Do not call it a fully verified inclusive quote.

Private raw state: `private/tshirts-2026-10-31/`. This report is sanitized for the repository.
