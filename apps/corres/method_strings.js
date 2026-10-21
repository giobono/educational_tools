/* method_strings.js — every sentence on screen that describes the method.
 *
 * Charter §2.3, and build brief v0.2 §8: "Every sentence that describes the
 * method is sighted by AD before beta shows it. Write those strings so they
 * are easy to find."
 *
 * THIS FILE IS WHY. Nothing elsewhere in this app describes what the method
 * does. The pages hold structure and plumbing; the words live here. So AD
 * sights one file, and a reviewer can tell at a glance whether a sentence has
 * been sighted — rather than reading 1,800 lines of HTML hunting for prose.
 *
 * SIGHTING STATUS: NOT YET SIGHTED BY AD.
 * Nothing here has been through AD. The strings are drawn from academic
 * specification v4.0 draft 0.5 and from the numbered CR4 decisions, cited per
 * string so AD can check each against its source rather than take it on
 * trust. Beta must not show this app until AD has sighted it.
 *
 * Rules for whoever edits this next:
 *   1. A new sentence about the method goes HERE, never in index.html.
 *   2. Every entry carries its source: a draft 0.5 section or a CR4 number.
 *   3. Changing a sentence un-sights it. Say so in the status block above.
 */

window.G4_METHOD = {

  /* The sighting gate, machine-readable so the page cannot quietly show
   * unsighted prose. AD flips this to true in the same commit that records
   * the sighting; rule 3 above flips it back whenever a string changes. */
  sighted: false,

  /* ---- the page's own one line, §8 ---------------------------------- */
  intro: 'Nine steps from a document\u2013term matrix to tiered claims. Each step '
       + 'ends in one report and at most one decision, and every decision has a '
       + 'default.',
  introSource: 'build brief v0.2 §8: one report, one decision, a default for each',

  /* ---- the nine steps: "what was done", §8 item 1 ------------------- */
  steps: {
    0: { title: 'Declare the corpus',
         did: 'Read your matrix and recorded what it is: which column is the document id, which are concepts, which are covariates, and what the values mean.',
         source: 'draft 0.5 §6; CR4-16 (1), (2)' },
    1: { title: 'Binarise',
         did: 'Decided, for every cell, whether the concept is present in that document. A value counts as present when it is strictly above half the declared scale maximum.',
         source: 'draft 0.5 §6; CR4-16 (3)' },
    2: { title: 'Admit and scope',
         did: 'Removed documents and concepts that cannot carry an association, repeating until nothing more drops out, and set the support window.',
         source: 'draft 0.5 §7; CR4-16 (4), CR4-19 (2)' },
    3: { title: 'Association',
         did: 'Compared every pair of concepts against how often they would co-occur if each kept its own frequency but chose its partners at random, and measured each departure in units of its expected variation.',
         source: 'draft 0.5 §8' },
    4: { title: 'Stability and granularity',
         did: 'Split the documents in half fifty times, grouped the concepts separately in each half, and kept what held together across the splits. This is where frames are earned rather than asserted.',
         source: 'draft 0.5 §10' },
    5: { title: 'Covariate check',
         did: 'Related each frame to every covariate you declared, to see whether a frame is a configuration of meaning or simply separates different kinds of document.',
         source: 'draft 0.5 §11; CR4-21' },
    6: { title: 'Reading the structure',
         did: 'Classified each concept by how it sits in its frame, read which frames avoid each other more than they avoid frames in general, and compared the frames against the next finer grouping.',
         source: 'draft 0.5 §12; CR4-18, CR4-19 (1)' },
    7: { title: 'Pairwise claims',
         did: 'Estimated the specific contrasts you asked about directly, with an interval from resampling the documents, because a whole-partition test has little power for a claim about two concepts.',
         source: 'draft 0.5 §13' },
    8: { title: 'Sensitivity and claims',
         did: 'Ran the whole analysis again under the other binarisation rule and the other null model, and reported which claims survive both.',
         source: 'draft 0.5 §13, §14' },
  },

  /* ---- what to look at, §8 item 2 ----------------------------------- */
  lookAt: {
    0: 'The column roles. Everything downstream rests on these being right, and only you can confirm them.',
    1: 'How many cells counted as present, and the threshold that decided it.',
    2: 'What was removed and why. Each exclusion names the rule that made it.',
    3: 'The spread of the association values. If they are uniformly small or uniformly large there is nothing to group.',
    4: 'The table by k: how reproducible each number of frames is, and how clean. The recommended k is the cleanest of those that pass.',
    5: 'The frame-by-covariate table. A value at or above 0.3 is flagged.',
    6: 'The concept classes, and the opposition table.',
    7: 'Each contrast with its interval. An interval that spans zero is a statement of what the data cannot settle.',
    8: 'The claims table: every claim, its tier, and the rerun it fails if it fails one.',
  },

  /* ---- the decision at each step, §8 item 4. Default first. ---------- */
  decisions: {
    0: { prompt: 'Are these column roles right?',
         options: [
           { value: 'confirm', label: 'Confirm as proposed', consequence: 'The analysis proceeds on these roles.', isDefault: true },
           { value: 'amend',   label: 'Amend them',          consequence: 'You set the roles yourself; nothing is assumed.' },
         ],
         source: 'CR4-16 (2): step 0 proposes and the researcher confirms' },
    4: { prompt: 'How many frames?',
         options: [
           { value: 'recommended', label: 'Take the recommended k', consequence: 'The cleanest grouping that passes the reproducibility gate.', isDefault: true },
           { value: 'choose',      label: 'Choose a neighbouring k', consequence: 'Reported as your choice, not as the method’s recommendation.' },
         ],
         source: 'draft 0.5 §10. The k is never a constant: it comes from this decision (CR4-11, removing G3’s fixed 3)' },
    3: { prompt: 'Exclude concepts that carry no signal?',
         options: [
           { value: 'keep',    label: 'Keep them in', consequence: 'They stay, and step 6 classifies them as diffuse.', isDefault: true },
           { value: 'exclude', label: 'Exclude them', consequence: 'Applied once, before step 4, and reported as a finding. The frames are certified only if the two halves agree on which concepts carry signal.' },
         ],
         source: 'draft 0.5 §9. The default is to keep them' },
    5: { prompt: 'For each flagged frame: finding or confound?',
         options: [
           { value: 'not_yet_judged', label: 'Not yet judged', consequence: 'Recorded as unjudged and shown as such in the report.', isDefault: true },
           { value: 'finding',        label: 'A finding',       consequence: 'The covariate is part of what the frame is.' },
           { value: 'confound',       label: 'A confound',      consequence: 'Starts a new numbered run from step 2 with the scope narrowed. Both runs are reported.' },
         ],
         source: 'draft 0.5 §11; CR4-21 (4). Deciding which reading holds is interpretive work, not a statistical verdict' },
  },

  /* ---- claim tiers, §8. Shown against every claim. ------------------ */
  tiers: {
    certified:    { label: 'Certified',    gloss: 'Reproducible across half-samples at the chosen number of frames, and holding under both sensitivity reruns.' },
    confirmatory: { label: 'Confirmatory', gloss: 'A contrast you stated before seeing any result.' },
    interpretive: { label: 'Interpretive', gloss: 'Measured, and read by you. Interface concepts, the opposition table, nesting and frame names are interpretive, never certified.' },
    exploratory:  { label: 'Exploratory',  gloss: 'Shown with its measures, not certified: structure below the gate, a contrast chosen after seeing results, or any departure from a default.' },
    limits:       { label: 'Limits',       gloss: 'Held under the default run only. It is reported, not discarded, and names the rerun it fails.' },
  },

  /* ---- flag severities, §8 item 3 ----------------------------------- */
  severities: {
    stop:    { label: 'Stop',    gloss: 'The analysis cannot proceed. Nothing further is computed.' },
    caution: { label: 'Caution', gloss: 'The analysis continues, and this bears on what can be claimed from it.' },
    note:    { label: 'Note',    gloss: 'Reported so you have it. Nothing is proposed.' },
  },

  /* ---- the standing message about provisional values ---------------- */
  provisional: 'Thresholds marked provisional are set on development corpora and may change before v4.0 is issued.',
  provisionalSource: 'wording accepted at CR4-16 §3 (4.4), sighted by AD',

  /* ---- scope, worded as reach and not as a fault in the data -------- */
  unsupportedShape: 'Compositional data is not yet supported in G4; results are exploratory.',
  unsupportedShapeSource: 'CR4-22 (3), quoted exactly',
};
