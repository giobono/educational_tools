"""
beta asks crawlers to stay out, and marks every response noindex (SD's brief
to D2Dev of 27 Nov 2026,
`briefs/d2dev/2026-11-27_brief_sd_d2dev_crawler_set_four_hosts_v1_0.md`, under
SD's crawler ruling of 23 Oct 2026,
`rulings/2026-10-23_mailbox_sd_od_crawler_policy_ruling_v1_0.md` §2.1:
beta.ebono.au serves `Disallow: /`, plus `noindex`).

One tree serves beta (develop) and edu (main), and the ruling sets a different
line for each, so the rule is keyed to the host name: on any other host it
does nothing, and a promotion carries it to edu without changing what edu
serves. edu's own line is not written here; it waits on a ruling (the return).

Written first and run against the tree as it stood, where each failed. The
served check is in the return: these read the files only.
"""

from tests.test_metering_fixes_after_test import ROOT


def _ht():
    return (ROOT / ".htaccess").read_text(encoding="utf-8")


def test_the_beta_file_disallows_everything_for_every_crawler():
    assert (ROOT / "robots_beta.txt").read_text(encoding="utf-8") == "User-agent: *\nDisallow: /\n"


def test_robots_txt_is_answered_from_it_on_beta_only():
    ht = _ht()
    cond = "RewriteCond %{HTTP_HOST} ^beta\\.ebono\\.au$ [NC]"
    rule = "RewriteRule ^robots\\.txt$ robots_beta.txt [L]"
    assert cond in ht and rule in ht
    assert ht.index(cond) < ht.index(rule) < ht.index("RewriteRule ^apps/corres_trial")
    # No robots.txt in the tree: edu must not start serving one by a promotion.
    assert not (ROOT / "robots.txt").exists()


def test_every_beta_response_is_marked_noindex_and_no_other_host_is():
    ht = _ht()
    assert "SetEnvIfNoCase Host ^beta\\.ebono\\.au$ EDU_BETA_HOST" in ht
    assert 'Header always set X-Robots-Tag "noindex, nofollow" env=EDU_BETA_HOST' in ht
    assert ht.count("X-Robots-Tag") == 1 or all(
        "env=EDU_BETA_HOST" in line for line in ht.splitlines()
        if line.strip().startswith("Header") and "X-Robots-Tag" in line)
