import tempfile
import unittest
from pathlib import Path

import pandas as pd

from audit_inputs import audit_report


class InputAuditTests(unittest.TestCase):
    def run_audit(self, rows):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "report.parquet"
            pd.DataFrame(rows).to_parquet(path)
            return audit_report(path)

    def rows(self):
        return {"filename": ["sample_A_R1"], "modified_sequence": ["PEPTIDE"], "precursor_charge": [2],
                "precursor_qvalue": [0.001], "is_decoy": [False], "ms2_quantity": [100.0]}

    def test_valid(self):
        self.assertEqual(self.run_audit(self.rows())["status"], "input_checks_passed")

    def test_missing_column(self):
        rows = self.rows()
        del rows["precursor_qvalue"]
        self.assertEqual(self.run_audit(rows)["status"], "blocked")

    def test_conflicting_quantity(self):
        rows = {key: value * 2 for key, value in self.rows().items()}
        rows["ms2_quantity"] = [100.0, 200.0]
        self.assertEqual(self.run_audit(rows)["quantity_conflicts"], 1)

    def test_exact_duplicate_allowed(self):
        rows = {key: value * 2 for key, value in self.rows().items()}
        self.assertEqual(self.run_audit(rows)["precursor_runs"], 1)

    def test_decoy_excluded(self):
        rows = self.rows()
        rows["is_decoy"] = [True]
        self.assertEqual(self.run_audit(rows)["filtered_rows"], 0)

    def test_q_boundary_excluded(self):
        rows = self.rows()
        rows["precursor_qvalue"] = [0.01]
        self.assertEqual(self.run_audit(rows)["filtered_rows"], 0)

    def test_null_key_blocked(self):
        rows = self.rows()
        rows["filename"] = [None]
        self.assertEqual(self.run_audit(rows)["status"], "blocked")


if __name__ == "__main__":
    unittest.main()
