"""
The handoff from CorRes to pluralitie (proposed by D2Dev on 26 Nov 2026, in
the return on OD's brief of that day, pluralitie on artie; merged under OD's
amendment 1 of 27 Nov 2026,
`briefs/d2dev/2026-11-27_brief_od_d2dev_pluralitie_on_artie_beta_amendment_1_v1_0.md`):
page 7 offers the next step, carrying the analysis by its reference, and only
where pluralitie is switched on.
"""

from tests.test_metering_fixes_after_test import ROOT


def test_page_7_offers_pluralitie_hidden_until_the_page_shows_it():
    page = (ROOT / "apps/corres/index.html").read_text(encoding="utf-8")
    assert 'id="p7-next" hidden' in page and 'id="p7-pluralitie"' in page
    assert "/apps-enabled.php" in page


def test_the_link_carries_the_run_and_shows_only_where_pluralitie_is_on():
    js = (ROOT / "apps/corres/trial.js").read_text(encoding="utf-8")
    assert "window.APPS_ENABLED && window.APPS_ENABLED.pluralitie" in js
    assert "`/apps/pluralitie/?run=${encodeURIComponent(run.run_id)}`" in js
    assert "?run=" in (ROOT / "apps/pluralitie/pluralitie.js").read_text(encoding="utf-8")
