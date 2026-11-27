"""
pluralitie as CR3's side step, the pages (OD's brief to D2Dev of 27 Nov 2026,
`briefs/d2dev/2026-11-27_brief_od_d2dev_pluralitie_side_step_v1_0.md`).

The wording is CD's (CD's handoff to AD and OD of 27 Nov 2026, strings P1 to
P30), as AD sighted it the same day. Two strings came back from AD with a
change and are with CD: P9 and P15. The brief's row 3 has CD's current text
built and marked pending, and that is what is checked here.

Written first and run against the tree as it stood, where each failed.
"""

from tests.test_metering_fixes_after_test import ROOT
from tests.test_pluralitie_on_artie import APP, JS, PAGE, _page, _session, _text

CORRES = ROOT / "apps/corres"


def _html():
    return PAGE.read_text(encoding="utf-8")


def _js():
    return JS.read_text(encoding="utf-8")


# ---- CD §2: the page ---------------------------------------------------------

def test_the_page_carries_cds_wording():
    page = _html()
    for text in [
        # P1
        "CorRes found the frames in your corpus. Here you work out what sets each one apart, and where they "
        "pull against each other. See what the documents show, read a drafted definition, and refine it in "
        "conversation until it says what you found.",
        # P2
        "pluralitie starts from a finished CorRes analysis. Nothing is uploaded again: it reads the analysis "
        "where CorRes left it.",
        # P3
        'placeholder="the run reference CorRes gave you"',
        # P5
        "Counted from your matrix, frame by frame: the concepts that set each frame apart, how many documents "
        "carry it, which concepts travel together, and where the frames meet. No model is used in this step. "
        "A concept appearing in a document is not that document's position on the issue.",
        # P9, CD's current text (pending: AD returned it with a change)
        "The report carries each frame's working definition, the evidence it rests on, the documents to read "
        "first, every earlier definition and the whole conversation. The frames stay provisional until you run "
        "the reviewer's checks in CorRes.",
        # P11
        "A Markdown file. Your work is also kept here: this page's address brings you back to it.",
    ]:
        assert text in page, text
    # P6, P7, P8, P30: unchanged.
    assert "It has not read the documents: you have. Treat every draft as a starting point." in page
    assert "<title>pluralitie — Define and discuss the frames</title>" in page


def test_p9_and_p15_are_marked_pending_where_they_are_built():
    assert "PENDING CD (P9)" in _html()
    assert "PENDING CD (P15)" in _js()


def test_the_old_page_is_retired_and_its_line_is_gone():
    # The brief's §2.2 (promotion condition 5); CD's P4 follows: delete the line.
    assert not (APP / "name_frames.html").exists()
    assert "name_frames" not in _html() and "earlier CorRes" not in _html()


def test_no_eboni_is_shown_anywhere_on_the_page():
    # The brief's row 4 (SD-R21 §3; promotion condition 4). The allowance
    # banner is metering.js's, which shows a share used and a reset date.
    assert "eboni" not in _html().lower() and "eboni" not in _js().lower()
    cfg = (ROOT / "apps/common/config.php").read_text(encoding="utf-8") if (ROOT / "apps/common/config.php").exists() else ""
    assert "allowanceDisplay: 'ebonis'" not in cfg and '"allowanceDisplay": "ebonis"' not in cfg


def test_sign_in_is_the_shared_one_through_the_one_callback():
    page = _html()
    assert "/apps/common/signin.js" in page and "callback.html" not in page
    assert not (APP / "auth").exists()


# ---- CD §3: the script -------------------------------------------------------

def _f1(**kw):
    s = _session()
    s["evidence"]["frames"][0].update(kw)
    return s


def test_the_evidence_uses_cds_labels(tmp_path):
    r = _page(tmp_path, _f1(), search="?session=pls_0123456789abcdef")
    t = _text(r["evidence"])
    assert "sets this frame apart — 1" in t and "drawn towards another frame — 1" in t      # P13
    assert "marks this frame out" not in t and "shared with another frame" not in t
    assert "together in 120 documents · 2.4 times more often than if independent" in t      # P15 (pending)
    assert "× chance" not in t
    assert 'title="drawn towards another frame, towards Frame B · in 300 documents"' in r["evidence"]   # P14


def test_a_frame_with_no_distinguishing_concept_says_what_its_count_means(tmp_path):
    line = "No concept sets this frame apart on its own. The count is of documents carrying its placed concepts."
    r = _page(tmp_path, _f1(no_distinguishing_concept=True), search="?session=pls_0123456789abcdef")
    assert line in _text(r["evidence"])                                                      # P16
    r = _page(tmp_path, _f1(no_distinguishing_concept=False), search="?session=pls_0123456789abcdef")
    assert line not in _text(r["evidence"])


def test_the_recap_says_whether_the_reviewers_checks_have_run(tmp_path):
    s = _session()
    r = _page(tmp_path, s, search="?session=pls_0123456789abcdef")
    assert "Checks already run in CorRes: chance check." in _text(r["recap"])                # P18
    s["evidence"]["checks_done"] = []
    r = _page(tmp_path, s, search="?session=pls_0123456789abcdef")
    assert ("The reviewer's checks have not yet been run in CorRes on this analysis, so these frames are "
            "provisional.") in _text(r["recap"])                                             # P17
    assert ("The frames, their concepts and each concept's place are CorRes's findings. Nothing here changes "
            "them.") in _text(r["recap"]).replace("&#39;", "'")                             # P19


def test_a_concept_too_rare_to_place_is_listed_with_its_reason(tmp_path):
    s = _session()
    s["evidence"]["unplaced"] = [{"concept": "Other", "reason": None},
                                 {"concept": "Rare", "reason": "too rare to place"}]
    t = _text(_page(tmp_path, s, search="?session=pls_0123456789abcdef")["evidence"])
    assert "In no frame: Other." in t and "Too rare to place: Rare." in t


def _drafted(draft, **frame):
    s = _session(drafts={"F1": draft}, model="model-x")
    s["frames"]["F1"].update(definition={"name": "Drafted", "definition": "D.", "by": "model draft"}, **frame)
    return s


def test_the_frame_card_uses_cds_headings_and_shows_the_tension_field(tmp_path):
    d = {"discussion": "DISC", "sets_apart": "APART", "pulls_against": "PULLS", "meets": "MEETS",
         "questions": ["Q?"], "cautions": ["C"]}
    t = _text(_page(tmp_path, _drafted(d), search="?session=pls_0123456789abcdef")["frames"])
    for heading, body in (("The evidence, discussed (first draft)", "DISC"), ("What sets it apart", "APART"),
                          ("Where it pulls against them", "PULLS"), ("Where it meets the other frames", "MEETS"),
                          ("Questions to take to your documents", "Q?"),
                          ("What the evidence cannot support", "C")):
        assert f"{heading} {body}" in t, heading                                              # P20
    assert "Distinct from the other frames" not in t
    assert "drafted by the model" in t                                                       # P21
    assert ("Nothing said yet. Tell pluralitie what you found when you read the documents, or ask why it "
            "defined the frame this way.") in t                                              # P23
    # A session drafted before this build holds the field under its old name.
    old = _text(_page(tmp_path, _drafted({"distinct_from": "OLD"}), search="?session=pls_0123456789abcdef")["frames"])
    assert "What sets it apart OLD" in old


def test_the_small_strings_are_cds():
    js = _js()
    for text in ["a stored CorRes result, computed",                                         # P12
                 "'model draft': 'drafted by the model'", "'accepted proposal': 'proposal you accepted'",
                 "researcher: 'written by you'",                                             # P21
                 "or keep talking to leave it as it is",                                     # P24
                 "Drafting a reply…",                                                        # P26
                 "Draft all the definitions again",                                          # P27
                 "That didn't finish: ${err.message}",                                       # P28
                 "We can't reach the service right now. Please try again in a few minutes."]:   # P29
        assert text in js, text
    for gone in ("Thinking…", "That did not complete", "There is a connection issue",
                 "Draft them again from the evidence", "or carry on the conversation to leave it"):
        assert gone not in js, gone


# ---- AD item 1.2: the route back, and the hand-off after Your frames -----------

def test_the_way_back_to_corres_is_offered_and_carries_the_researchers_own_run(tmp_path):
    line = "Next: back to CorRes for the reviewer's checks, which confirm, correct or withdraw each frame."
    assert line in _html()                                                                    # P10
    own = _drafted({})
    own["source"] = {"kind": "corres_run", "run_id": "upload_1"}
    r = _page(tmp_path, own, search="?session=pls_0123456789abcdef",
              then="window.BACK = el('pl-back-link').href;")
    assert "'/apps/corres/?run=' + encodeURIComponent" in _js() or "/apps/corres/?run=${encodeURIComponent" in _js()
    assert "&page=p6" in _js()
    # A stored sample's own run is never opened in CorRes, where it could be
    # written to: the way back goes to CorRes's front, where the sample opens
    # as the researcher's copy.
    assert "src.kind === 'corres_run'" in _js()
    assert r["error"] == ""


def test_the_hand_off_sits_after_your_frames_and_no_longer_on_export():
    page = (CORRES / "index.html").read_text(encoding="utf-8")
    p5 = page.split('id="p5"')[1].split('id="p6"')[0]
    p7 = page.split('id="p7"')[1]
    assert 'id="p5-next" hidden' in p5 and 'id="p5-pluralitie"' in p5
    assert p5.index('id="p5-where"') < p5.index('id="p5-next"')
    assert "pluralitie" not in p7
    js = (CORRES / "trial.js").read_text(encoding="utf-8")
    assert "$('#p5-pluralitie').href = `/apps/pluralitie/?run=${encodeURIComponent(run.run_id)}`" in js
    assert "window.APPS_ENABLED && window.APPS_ENABLED.pluralitie" in js
    assert "p7-next" not in js and "p7-pluralitie" not in js


def test_corres_opens_a_run_named_in_its_address_at_the_page_asked_for():
    js = (CORRES / "trial.js").read_text(encoding="utf-8")
    boot = js.split("// --- boot")[1]
    assert "new URLSearchParams(window.location.search)" in boot
    assert "call('GET', `/runs/${encodeURIComponent(" in boot
    assert "show(PAGES.includes(page) ? page : 'p5')" in boot
    # Page 6 is skipped at launch (AD's brief of 24 Nov 2026 §1): a jump to it
    # still lands on page 5. That ruling is not reversed here.
    assert "const SKIPPED = new Set(['p6']);" in js
