#!/usr/bin/env python3
import argparse
import os
import subprocess
import sys
from pathlib import Path


MOVIEFINDER_PROJECT = Path("/Users/hanzhang/Documents/MovieFinder")
MOVIEFINDER_PACKAGE = "moviefinder_cli"


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Search rrdynb movie resources via the local MovieFinder CLI."
    )
    parser.add_argument("keyword", nargs="?", help="Movie or TV keyword to search.")
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument("--refresh", action="store_true")
    parser.add_argument("--format", choices=("markdown", "json"), default="markdown")
    parser.add_argument("--cache-stats", action="store_true")
    args = parser.parse_args()

    if not MOVIEFINDER_PROJECT.exists():
        print(f"MovieFinder project not found: {MOVIEFINDER_PROJECT}", file=sys.stderr)
        return 2

    command = [sys.executable, "-m", MOVIEFINDER_PACKAGE]
    if args.cache_stats:
        command.extend(["cache-stats", "--format", args.format])
    else:
        if not args.keyword:
            parser.error("keyword is required unless --cache-stats is used")
        command.extend(["search", args.keyword, "--limit", str(args.limit), "--format", args.format])
        if args.refresh:
            command.append("--refresh")

    env = os.environ.copy()
    src_path = str(MOVIEFINDER_PROJECT / "src")
    env["PYTHONPATH"] = (
        src_path if not env.get("PYTHONPATH") else src_path + os.pathsep + env["PYTHONPATH"]
    )
    env.setdefault(
        "MOVIEFINDER_DB_PATH",
        str(MOVIEFINDER_PROJECT / "data" / "moviefinder.sqlite3"),
    )

    completed = subprocess.run(
        command,
        cwd=str(MOVIEFINDER_PROJECT),
        env=env,
        text=True,
    )
    return completed.returncode


if __name__ == "__main__":
    raise SystemExit(main())
