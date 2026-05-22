"""Regression tests for: background covers all content of website below menu bar.

The implementation is a CSS rule embedded in the <style> block of index.html.
These tests parse index.html and assert the rules that make the background
cover the full document (not just the viewport) are present. If a future edit
strips any of these rules, the gradient stops covering the page and the test
fails.
"""
from __future__ import annotations

import re
from pathlib import Path

import pytest


def _find_index_html() -> Path:
    """Locate index.html in the repo. Tests run from the repo root in CI."""
    here = Path(__file__).resolve()
    for parent in [here.parent, *here.parents]:
        candidate = parent / "index.html"
        if candidate.is_file():
            return candidate
    raise FileNotFoundError("index.html not found above tests/ directory")


@pytest.fixture(scope="module")
def html_source() -> str:
    return _find_index_html().read_text(encoding="utf-8")


@pytest.fixture(scope="module")
def style_block(html_source: str) -> str:
    """Return the concatenation of all inline <style>...</style> blocks."""
    blocks = re.findall(r"<style[^>]*>(.*?)</style>", html_source, re.DOTALL | re.IGNORECASE)
    assert blocks, "index.html has no inline <style> block — background CSS would be missing"
    return "\n".join(blocks)


def _body_rule(style: str) -> str:
    """Extract the first `body { ... }` rule body. Returns '' if not found."""
    match = re.search(r"(^|[^a-zA-Z0-9_-])body\s*\{([^}]*)\}", style)
    return match.group(2) if match else ""


def test_html_and_body_have_min_height_so_background_reaches_bottom(style_block: str) -> None:
    """`html, body { min-height: 100% }` is required so the background can stretch
    past a short viewport and cover content all the way down."""
    pattern = re.compile(
        r"html\s*,\s*body\s*\{[^}]*min-height\s*:\s*100%",
        re.IGNORECASE,
    )
    assert pattern.search(style_block), (
        "Expected `html, body { min-height: 100% }` rule — without it the background "
        "will not cover content when the page is shorter than the viewport."
    )


def test_body_background_is_a_linear_gradient(style_block: str) -> None:
    body_css = _body_rule(style_block)
    assert "linear-gradient" in body_css, (
        "body background must be a linear-gradient — implementation requires the "
        "brand gradient to span the entire document."
    )


def test_body_background_is_fixed_to_document(style_block: str) -> None:
    """background-attachment: fixed makes the gradient anchor to the document
    so all sections (hero through contact) sit on the same continuous backdrop."""
    body_css = _body_rule(style_block)
    assert re.search(r"background-attachment\s*:\s*fixed", body_css), (
        "body must declare `background-attachment: fixed` so the background "
        "covers all content rather than scrolling out of view."
    )


def test_body_background_uses_cover_sizing(style_block: str) -> None:
    body_css = _body_rule(style_block)
    assert re.search(r"background-size\s*:\s*cover", body_css), (
        "body must declare `background-size: cover` so the gradient scales "
        "to fill the full document area."
    )


def test_background_gradient_uses_brand_tokens(style_block: str) -> None:
    """Guard against someone replacing the gradient with a hardcoded color and
    breaking the brand-token contract (which is what makes light + dark mode
    both look right)."""
    body_css = _body_rule(style_block)
    assert "var(--brand-bg" in body_css, (
        "body gradient must reference CSS brand tokens (var(--brand-bg-*)) so it "
        "adapts to light and dark themes consistently."
    )


def test_dark_mode_also_declares_full_coverage_background(style_block: str) -> None:
    """The prefers-color-scheme: dark media query must also set a fixed,
    cover-sized gradient — otherwise dark-mode users see the background stop
    short of the page bottom."""
    dark_block = re.search(
        r"@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)\s*\{(.*?)\}\s*\}",
        style_block,
        re.DOTALL | re.IGNORECASE,
    )
    assert dark_block, "Expected a @media (prefers-color-scheme: dark) block in index.html"
    dark_css = dark_block.group(1)
    assert "linear-gradient" in dark_css, "Dark-mode body must also use a linear-gradient background"
    assert re.search(r"background-attachment\s*:\s*fixed", dark_css), (
        "Dark-mode body must also declare `background-attachment: fixed`"
    )
    assert re.search(r"background-size\s*:\s*cover", dark_css), (
        "Dark-mode body must also declare `background-size: cover`"
    )


def test_body_background_is_no_repeat(style_block: str) -> None:
    """Edge case: without `no-repeat`, a tall page would tile the gradient and
    produce visible seams instead of one continuous backdrop."""
    body_css = _body_rule(style_block)
    assert "no-repeat" in body_css, (
        "body background must include `no-repeat` so the gradient tiles seamlessly "
        "across the full document height."
    )
