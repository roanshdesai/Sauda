import importlib.util
from pathlib import Path
import unittest
from decimal import Decimal

spec = importlib.util.spec_from_file_location("quote_plan", Path(__file__).parents[1] / "tools/quote_plan.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
prepare_plan = module.prepare_plan


class QuotePlanTests(unittest.TestCase):
    def test_watches_delivery_is_additional_not_silently_free(self):
        p = prepare_plan(32, "844", "additional")
        self.assertEqual(p["private_quantity_limit_inr"], "27008.00")
        self.assertIsNone(p["maximum_delivered_total_inr"])
        self.assertIsNone(p["delivery"]["fee_inr"])
        self.assertEqual([x["unit_inr"] for x in p["nonbinding_proposals"]], ["740.00", "790.00", "820.00"])
        self.assertEqual([x["total_inr"] for x in p["nonbinding_proposals"]], ["23680.00", "25280.00", "26240.00"])
        self.assertFalse(p["purchase_authorized"])

    def test_kurtas_strict_all_inclusive_ceiling(self):
        p = prepare_plan(5, "5000", strict=True)
        self.assertEqual(p["comparison"], "strictly_less_than")
        self.assertEqual(p["maximum_delivered_total_inr"], "25000.00")
        self.assertEqual([x["unit_inr"] for x in p["nonbinding_proposals"]], ["4400.00", "4700.00", "4900.00"])

    def test_fractional_small_amounts_are_exact_and_below_cap(self):
        p = prepare_plan(3, "8.44")
        self.assertEqual(p["private_quantity_limit_inr"], "25.32")
        for item in p["nonbinding_proposals"]:
            self.assertLess(Decimal(item["unit_inr"]), Decimal("8.44"))
            self.assertEqual(Decimal(item["total_inr"]), Decimal(item["unit_inr"]) * 3)

    def test_invalid_context_is_rejected(self):
        for quantity in [0, -1, True, 1.5]:
            with self.subTest(quantity=quantity), self.assertRaises(ValueError):
                prepare_plan(quantity, "844")
        for amount in ["", "NaN", "Infinity", "-1", "0", "1.001"]:
            with self.subTest(amount=amount), self.assertRaises(ValueError):
                prepare_plan(32, amount)
        with self.assertRaises(ValueError):
            prepare_plan(32, "844", "unknown")


if __name__ == "__main__":
    unittest.main()
