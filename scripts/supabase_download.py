#!/usr/bin/env python3
"""Supabase Storage에서 precursors.parquet + meta.yaml을 내려받는다.

GitHub Actions(.github/workflows/benchmark-from-parquet.yml)에서만 쓴다.
SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY를 환경변수로 받는다 (repo secrets).

Supabase 쪽 업로드 규칙: bucket "benchmark-runs" 안에
  <run 폴더>/precursors.parquet
  <run 폴더>/meta.yaml
두 파일을 올린다. <run 폴더>가 이 스크립트의 첫 번째 인자(run_dir)다.

사용법:
    python3 scripts/supabase_download.py <run 폴더 경로> <출력 디렉터리>
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    sys.exit("requests가 필요합니다.  pip install requests")

BUCKET = "benchmark-runs"


def download(base_url: str, service_key: str, object_path: str, dest: Path) -> None:
    resp = requests.get(
        f"{base_url}/storage/v1/object/{BUCKET}/{object_path}",
        headers={"Authorization": f"Bearer {service_key}"},
        timeout=60,
    )
    resp.raise_for_status()
    dest.write_bytes(resp.content)


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit("사용법: supabase_download.py <run 폴더 경로> <출력 디렉터리>")
    run_dir, out_dir = sys.argv[1].strip("/"), Path(sys.argv[2])

    base_url = os.environ.get("SUPABASE_URL")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not base_url or not service_key:
        sys.exit("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다.")

    out_dir.mkdir(parents=True, exist_ok=True)
    download(base_url.rstrip("/"), service_key, f"{run_dir}/precursors.parquet", out_dir / "precursors.parquet")
    download(base_url.rstrip("/"), service_key, f"{run_dir}/meta.yaml", out_dir / "meta.yaml")
    print(f"다운로드 완료: {out_dir}/precursors.parquet, {out_dir}/meta.yaml")


if __name__ == "__main__":
    main()
