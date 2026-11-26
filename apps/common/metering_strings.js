/* ============================================================================
 * apps/common/metering_strings.js — every user-facing string of the free tier
 *
 * Metering phase 3 (OD brief v1.1 of 19 Nov 2026, §2). **Every word here is
 * CD's** (Charter §2.3), placed verbatim from CD's note to D1Dev of 19 Nov 2026
 * (ebono_governance/mailbox/inbox_od/2026-11-19_mailbox_cd_d1dev_metering_strings_v1_0.md,
 * released GE 00:18). Keyed by S-number, as OD's note to CD of 19 Nov numbers
 * them; the dotted keys are CD's own.
 *
 * Marked:
 *   [AD]      sighted by AD before it reaches users (CD's note §3): S1.body,
 *             S7.body, S9.body. Listed in AD_SIGHTING below.
 *   hidden    the top-up offer (S7.topup, S7.topup_button): written now,
 *             shown only when the paid half is live.
 *   UNFILLED  text CD has not written. One such string: the Ebonis form of
 *             the banner, which only the 'ebonis' display setting needs.
 *
 * Placeholders: {pct} {reset_date} {terms_version} {email} {project} {my_pct}
 * {pack_aud} {bought_pct} {expiry_date}. Filled by apps/common/metering.js;
 * what each is read from is recorded in the phase 3 and B3 returns.
 *
 * S17–S20 and the changed S7 (the paid tier, 26 Nov 2026) are CD's, placed
 * verbatim from CD's handoff to OD of 26 Nov
 * (ebono_research/26_18_BIL/handoffs/2026-11-26_handoff_cd_od_paid_tier_answers_v1_0.md §3).
 * {topup_aud} is no longer used. S19 and S7's top-up line show only while
 * /v1/account says top-ups are enabled.
 *
 * These strings reach users only at free-tier go-live (CD's gate, seat file
 * §2); beta shows them to the trial users.
 * ============================================================================ */

window.ARTIE_STRINGS = {
  // S1 — signed out: an LLM-using app is opened without sign-in
  S1: {
    heading:     'Sign in to continue',
    body:        'This tool uses an AI model, so it needs an account. We\'ll email you a code to sign in. There\'s no password to remember.', // [AD]
    email_label: 'Email address',
    button:      'Email me a code',
  },
  // S2 — the Terms, at first sign-in (terms_required)
  S2: {
    heading:      'Before you start',
    body:         'Please read and accept our Terms of Service and Privacy Policy. They explain how your allowance works, what happens to the files you upload, and how to cite the tool in your work.',
    checkbox:     'I have read and accept the Terms of Service and the Privacy Policy (version {terms_version}).',
    link_terms:   'Terms of Service',
    link_privacy: 'Privacy Policy',
    button:       'Accept and continue',
  },
  // S3 — new Terms (terms_version_mismatch); checkbox, links and button as S2
  S3: {
    heading: 'Our terms have changed',
    body:    'We\'ve updated our Terms of Service and Privacy Policy to version {terms_version}. Please read and accept them to keep using the tools.',
  },
  // S4–S6 — the banner: normal, at 80%, at 95%
  S4: { text: '{pct}% of this month\'s allowance used · resets {reset_date}' },
  S5: { text: '{pct}% of this month\'s allowance used · resets {reset_date}. You\'re getting close to the limit.' },
  S6: { text: '{pct}% of this month\'s allowance used · resets {reset_date}. New requests pause when it reaches 100%.' },
  // S7 — the stop: the project's allowance is used (402 allowance_exhausted, scope project)
  S7: {
    heading:      'This month\'s allowance is used',
    body:         'Your project has used its full allowance for this month. New requests are paused until {reset_date}. Everything you\'ve already finished is safe.', // [AD] — retention sentence struck, OD notice of 19 Nov (CD decided, AD sighted)
    partial_link: 'Download a record of the task so far',                     // OD notice of 19 Nov: the download is the task record, not the coded documents
    topup:        'Need more now? Add use to this project, from A$10.',      // CD, 26 Nov; shown only while top-ups are enabled
    topup_button: 'Add use',                                                  // opens S19
    team:         'Working with a team or an institution? Contact us.',
  },
  // S8 — the stop: the member's share is used (402 allowance_exhausted, scope member)
  S8: {
    heading: 'You\'ve reached your share of this project',
    body:    'This project still has allowance this month, but the share set for you has been used. Ask the project\'s owner to raise your share, or continue after {reset_date}.',
  },
  // S9 — the capacity message (503 service_at_capacity)
  S9: {
    heading: 'The service is at capacity',
    body:    'This isn\'t your allowance. It\'s shared service capacity, and it is full for the moment. Your allowance is untouched. Please try again later. If you need access sooner, contact us.', // [AD]
  },
  // S10–S15 — one sentence each
  S10: { text: 'Your account is suspended. If you think this is a mistake, contact us.' },
  S11: { text: 'Your email address isn\'t confirmed yet. Sign in again and enter the code we send to {email}.' },
  S12: { text: 'You don\'t have a project yet. Contact us and we\'ll set one up.' },
  S13: { text: 'You\'re not a member of this project. Ask its owner to add you, or switch to one of your own projects.' },
  S14: { text: 'We can\'t reach our sign-in service right now. Your account is fine. Please try again in a few minutes.' },
  S15: { text: 'This service isn\'t quite ready. Please try again later, or contact us.' },
  // S16 — the account panel
  S16: {
    title:        'Your account',
    projects:     'Your projects',
    project_line: '{project}: {pct}% of this month\'s allowance used · resets {reset_date}',
    my_use:       'Your use this month: {my_pct}% of {project}\'s allowance',
    signout:      'Sign out',
  },
  // S17 — a project with no allowance this month and no bought use
  // (replaces "100% of 0 used")
  S17: { text: 'This project has no allowance this month. Contact us to get started.' },
  // S18 — which project a run charges, shown before the run
  S18: {
    text:           'This run uses {project}\'s allowance.',
    change_project: 'Change project',
  },
  // S19 — the purchase screen, from S7's Add use and the account panel
  S19: {
    heading:   'Add use to this project',
    body:      'Choose a pack. It\'s added to {project} and used after this month\'s free allowance. Bought use lasts 12 months.',
    pack:      'A${pack_aud} (including GST)',
    button:    'Continue to payment',
    done:      'Thank you. A${pack_aud} of use has been added to {project}.',
    cancelled: 'No payment was taken.',
    // CD, given by Geoff in chat as CD's human half, 26 Nov 2026
    failed:    'Your transaction has not been processed. Please try again later.',
  },
  // S20 — the banner once the free allowance is used and bought use remains
  S20: { text: 'This month\'s free allowance is used. Bought use: {bought_pct}% remaining · lasts until {expiry_date}' },
  // S21 — a task ended by a server restart (code interrupted_by_restart; OD's
  // restart-sweep brief of 25 Nov 2026, §3.4). CD, given by Geoff in chat as
  // CD's human half, 26 Nov 2026.
  S21: { text: 'Changes to background processes require you to retry. We apologise for the inconvenience.' },

  // Text CD has not written. Marked so a reader sees it is not copy.
  UNFILLED: {
    // The banner when allowanceDisplay is 'ebonis' (phase 3 brief §2). CD's
    // option A needs no such string; this exists so the setting can be
    // switched and seen (§5), and is listed in the return for CD.
    S4_ebonis: '[S4, Ebonis form — CD] {remaining} of {allowance} Ebonis left · resets {reset_date}',
  },
};

// The strings AD sights before they reach users (CD's note §3).
window.ARTIE_STRINGS_AD_SIGHTING = ['S1.body', 'S7.body', 'S9.body'];
