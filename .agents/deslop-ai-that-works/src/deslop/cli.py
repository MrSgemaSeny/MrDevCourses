#!/usr/bin/env python3
"""CLI to rewrite a document so it sounds less like AI slop."""

import argparse
import asyncio
import sys
from pathlib import Path

from .core import deslop_document


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="deslop",
        description="Rewrite a document to remove AI-slop patterns",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  deslop path/to/document.md
  cat draft.md | deslop -
  deslop draft.md -o cleaned.md
""",
    )
    parser.add_argument(
        "input_path",
        help="Path to the input document, or '-' to read from stdin",
    )
    parser.add_argument(
        "-o",
        "--output-file",
        type=Path,
        help="Write the rewritten document to this file instead of stdout",
    )
    parser.add_argument(
        "--instructions",
        help=(
            "Custom instructions passed to both detect and rewrite passes "
            "(e.g. 'keep the mermaid diagrams unchanged')"
        ),
    )
    return parser.parse_args()


def read_input(input_path: str) -> str:
    if input_path == "-":
        return sys.stdin.read()
    return Path(input_path).read_text(encoding="utf-8")


def write_output(output: str, output_file: Path | None) -> None:
    if output_file is None:
        sys.stdout.write(output)
        if not output.endswith("\n"):
            sys.stdout.write("\n")
        return

    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text(output, encoding="utf-8")
    print(f"Rewritten document written to {output_file}", file=sys.stderr)


async def async_main() -> None:
    args = parse_args()
    document = read_input(args.input_path)
    rewritten_document = await deslop_document(document, instructions=args.instructions)
    write_output(rewritten_document, args.output_file)


def main() -> None:
    asyncio.run(async_main())


if __name__ == "__main__":
    main()
