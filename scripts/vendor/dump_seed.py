"""Dump the vendored seed.py's data structures as JSON on stdout.

Run from the project root: python scripts/vendor/dump_seed.py
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import importlib.util

spec = importlib.util.spec_from_file_location("seed", Path(__file__).parent / "fh6-tier-list-seed.py")
seed = importlib.util.module_from_spec(spec)
spec.loader.exec_module(seed)

print(json.dumps({
    "meta": seed.META,
    "cars": seed.SEED_CARS,
    "tune_codes": seed.TUNE_CODES,
    "code_sources": seed.CODE_SOURCES,
}))
