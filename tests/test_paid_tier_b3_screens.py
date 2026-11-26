"""
The paid tier, B3: the screens (OD's build brief to D2Dev of 26 Nov 2026,
`briefs/d2dev/2026-11-26_brief_od_d2dev_paid_tier_now_and_after_stripe_v1_0.md`,
released GE 12:45, 1.3 and 1.4; the paid-tier spec of 26 Nov, §5, §7 B3;
CD's words from `26_18_BIL/handoffs/2026-11-26_handoff_cd_od_paid_tier_answers_v1_0.md` §3).

S17 a project with nothing this month; S18 which project a run charges;
S19 the purchase screen, reachable only when top-ups are on; S20 the banner
on bought use; the changed S7; R1 uploads withheld while nothing is
available. The real metering.js and metering_strings.js run against a
stand-in page, as in the 25 Nov tests.

Written first and run against the code as it stood, where each failed.
"""

import json
import re

from tests.test_metering_fixes_after_test import METERING, ROOT, STUB, _run

STRINGS = ROOT / "apps/common/metering_strings.js"

READ = """JSON.stringify({
  banner: registry['artie-banner'] ? registry['artie-banner'].innerHTML : null,
  run: registry['artie-run'] ? registry['artie-run'].innerHTML : null,
  account: registry['artie-account'] ? registry['artie-account'].innerHTML : null,
  panel: registry['artie-panel'] ? registry['artie-panel'].innerHTML : null,
  fileDisabled: fileInput.disabled, posted: POSTED, went: window.location.assigned || null
})"""

FETCH = r"""
var POSTED = [];
var STATUS = %(status)s;
fetch = function (url, opts) {
  if (opts && opts.method === 'POST') {
    POSTED.push({ url: url, body: JSON.parse(opts.body) });
    return Promise.resolve({ ok: true, json: function () { return Promise.resolve({ url: 'https://checkout.stripe.test/cs_1', session: 'cs_1' }); } });
  }
  if (/\/topups\//.test(url)) return Promise.resolve({ ok: true, json: function () { return Promise.resolve(STATUS); } });
  return Promise.resolve({ ok: true, json: function () { return Promise.resolve(ACCOUNT); } });
};
window.location.assign = function (u) { window.location.assigned = u; };
"""


def _project(**kw):
    p = {"id": "prj_1", "name": "Standard", "product": "sanzognie", "role": "owner", "allowance": 180,
         "used": 20, "held": 0, "bought_remaining": 0, "lots": [], "remaining": 160, "used_pct": 11.1,
         "resets_on": "2026-12-01", "warning": None, "mine": {"used": 20, "calls": 2, "used_pct": 11.1,
                                                              "pct_of": "allowance"}}
    p.update(kw)
    return p


def _page(tmp_path, project, *, topups=False, then="", search="", status=None):
    acct = {"person": {"email": "r@example.test"}, "projects": [project],
            "topups": {"enabled": True, "packs": [{"name": "a10", "aud": 10, "ebonis": 1000},
                                                  {"name": "a25", "aud": 25, "ebonis": 2500},
                                                  {"name": "a50", "aud": 50, "ebonis": 5000}]}
            if topups else {"enabled": False}}
    prog = (STUB % {"token": json.dumps("t"), "account": json.dumps(acct)}
            + FETCH % {"status": json.dumps(status or {"credited": False})}
            + f"\nwindow.location.search = {json.dumps(search)};\n"
            + STRINGS.read_text(encoding="utf-8") + METERING.read_text(encoding="utf-8")
            + "\nwindow.ArtieMetering.init({ appId: 'sanzognie' }).then(function () {" + then + "});\n")
    return _run(prog, READ, tmp_path)


def _text(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html or "")).strip()


# ---- CD's words, verbatim --------------------------------------------------

def test_the_new_strings_are_cds_verbatim():
    s = STRINGS.read_text(encoding="utf-8")
    for text in [
        "This project has no allowance this month. Contact us to get started.",
        "This run uses {project}\\'s allowance.",
        "Change project",
        "Add use to this project",
        "Choose a pack. It\\'s added to {project} and used after this month\\'s free allowance. Bought use lasts 12 months.",
        "A${pack_aud} (including GST)",
        "Continue to payment",
        "Thank you. A${pack_aud} of use has been added to {project}.",
        "No payment was taken.",
        "This month\\'s free allowance is used. Bought use: {bought_pct}% remaining · lasts until {expiry_date}",
        "Need more now? Add use to this project, from A$10.",
    ]:
        assert text in s, text
    assert "{topup_aud}" not in s.split("window.ARTIE_STRINGS")[1]


# ---- S17, S20, S18 ----------------------------------------------------------

def test_s17_replaces_100_percent_of_0_and_uploads_are_withheld(tmp_path):
    r = _page(tmp_path, _project(allowance=0, used=0, remaining=0, used_pct=100.0))
    assert "This project has no allowance this month." in _text(r["banner"])
    assert "100%" not in _text(r["banner"])
    assert r["fileDisabled"] is True                         # R1


def test_s20_on_bought_use_and_uploads_open(tmp_path):
    p = _project(used=180, used_pct=100.0, bought_remaining=500, remaining=500, lots=[
        {"id": "lot_1", "pack": "a10", "ebonis": 1000, "remaining": 500, "status": "active",
         "purchased_at": "2026-11-26T02:00:00+00:00", "expires_at": "2027-11-26T02:00:00+00:00"}])
    r = _page(tmp_path, p)
    assert ("This month's free allowance is used. Bought use: 50% remaining · lasts until 26 November 2027"
            in _text(r["banner"]).replace("&#39;", "'"))
    assert r["fileDisabled"] is False


def test_r1_uploads_withheld_once_the_free_allowance_is_spent_with_nothing_bought(tmp_path):
    r = _page(tmp_path, _project(used=180, used_pct=100.0, remaining=0, warning=95))
    assert r["fileDisabled"] is True
    r = _page(tmp_path, _project())
    assert r["fileDisabled"] is False


def test_s18_names_the_project_a_run_charges(tmp_path):
    r = _page(tmp_path, _project())
    assert "This run uses Standard's allowance." in _text(r["run"]).replace("&#39;", "'")
    assert "Change project" in _text(r["run"])


# ---- 1.3: with top-ups off, no purchase path -------------------------------

def test_with_top_ups_off_there_is_no_purchase_path(tmp_path):
    then = ("window.ArtieMetering.handled({ code: 'allowance_exhausted', scope: 'project' });"
            "window.ArtieMetering.openBuy();")
    r = _page(tmp_path, _project(), then=then)
    assert "Add use" not in _text(r["panel"]) and "Need more now" not in _text(r["panel"])
    assert "Continue to payment" not in _text(r["panel"])
    r = _page(tmp_path, _project(), then="document.getElementById('artie-account-btn').onclick();")
    assert "Add use" not in _text(r["account"])
    assert r["posted"] == []


# ---- S7 and S19 with top-ups on --------------------------------------------

def test_with_top_ups_on_s7_offers_add_use_and_s19_lists_the_packs(tmp_path):
    r = _page(tmp_path, _project(), topups=True,
              then="window.ArtieMetering.handled({ code: 'allowance_exhausted', scope: 'project' });")
    assert "Need more now? Add use to this project, from A$10." in _text(r["panel"])
    assert 'id="artie-topup-btn"' in r["panel"] and "hidden" not in r["panel"].split("artie-topup")[1][:20]
    r = _page(tmp_path, _project(), topups=True, then="window.ArtieMetering.openBuy();")
    t = _text(r["panel"]).replace("&#39;", "'")
    assert "Add use to this project" in t
    assert "It's added to Standard and used after this month's free allowance." in t
    for aud in (10, 25, 50):
        assert f"A${aud} (including GST)" in t
    assert "Continue to payment" in t
    r = _page(tmp_path, _project(), topups=True, then="document.getElementById('artie-account-btn').onclick();")
    assert "Add use" in _text(r["account"])


def test_continue_sends_only_the_pack_and_goes_to_stripe(tmp_path):
    then = ("window.ArtieMetering.openBuy();"
            "return window.ArtieMetering.buy('a25');")
    r = _page(tmp_path, _project(), topups=True, then=then)
    (post,) = r["posted"]
    assert post["url"] == "/v1/projects/prj_1/topups"
    assert set(post["body"]) == {"pack", "return_url"} and post["body"]["pack"] == "a25"
    assert r["went"] == "https://checkout.stripe.test/cs_1"


def test_the_return_shows_done_only_once_the_lot_exists(tmp_path):
    search = "?topup=done&session_id=cs_1"
    r = _page(tmp_path, _project(), topups=True, search=search, status={"credited": True})
    assert "Thank you." in _text(r["panel"]) and "has been added to Standard." in _text(r["panel"])
    r = _page(tmp_path, _project(), topups=True, search=search, status={"credited": False})
    assert "Thank you." not in _text(r["panel"] or "")
    r = _page(tmp_path, _project(), topups=True, search="?topup=cancelled")
    assert "No payment was taken." in _text(r["panel"])


# ---- the restart sweep (OD's brief of 25 Nov 2026, §3.4) ------------------

def test_a_task_interrupted_by_a_restart_shows_its_own_line_and_the_items_kept(tmp_path):
    then = ("window.ArtieMetering.handled({ code: 'interrupted_by_restart', "
            "task: { task_id: 't1', progress: { done: ['d1'] } } });")
    r = _page(tmp_path, _project(), then=then)
    t = _text(r["panel"])
    assert "This task was interrupted when the server restarted." in t
    assert "Download a record of the task so far" in t
    s = STRINGS.read_text(encoding="utf-8")
    assert "S21_interrupted" in s.split("UNFILLED: {")[1]     # CD writes the words; marked until then
