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
 * SIGHTING STATUS: AD-AUTHORED REVISION OF 21 OCTOBER 2026, SIGHTED BY AD
 * ON CONDITION (AD brief of 21 Oct, sighting of method_strings.js, §2):
 *   (a) this file is committed byte-identical to the version that brief names;
 *   (b) index.html carries no sentence describing the method outside this file
 *       (the callout, the upload hint and the step-card titles now read from
 *       `page` and `steps` below);
 *   (c) the decisions R2-R6 for steps 0-2 read their wording from
 *       `declarations` and `decisions` below.
 * D2Dev sets `sighted: true` in the commit that meets all three, and says so
 * in its return. Until then it stays false. It goes to CD for a copy pass
 * before stage 4 deploys (SD ruling 21 Oct §3).
 *
 * Rules for whoever edits this next:
 *   1. A new sentence about the method goes HERE, never in index.html.
 *   2. Every entry carries its source: a draft 0.5 section or a CR4 number.
 *   3. Changing a sentence un-sights it. Say so in the status block above.
 */

window.G4_METHOD = {

  /* The sighting gate, machine-readable so the page cannot quietly show
   * unsighted prose. Set true only under the three conditions above; rule 3
   * flips it back whenever a string changes. */
  sighted: false,

  /* ---- the page's own one line, §8 ---------------------------------- */
  intro: 'Nine steps from a document–term matrix to tiered claims. Each step '
       + 'ends in one report, most ask you for one decision, and every decision '
       + 'has a default.',
  introSource: 'build brief v0.2 §8; decision register v1.0 (step 0 asks four things)',

  /* ---- static page text, formerly G3 prose in index.html (CR4-16, CR4-24) */
  page: {
    needTitle: 'What you need — one CSV',
    need: 'One row per document and one column per concept, with a value in every '
        + 'cell. Columns for things such as source, year or author type can come '
        + 'too; you mark them as covariates, and they are never used to form frames.',
    valuesMean: 'corres cannot know what your numbers mean, so you tell it: counts, '
        + 'ratings on a fixed scale, presence (0 or 1), or percentages. That '
        + 'declaration sets the rule for when a concept counts as present. For '
        + 'ratings it is above half the scale maximum; for counts and percentages, '
        + 'above half the average non-zero value. The rule is fixed by the method '
        + 'and shown to you; you do not set it.',
    normaliseChoice: 'Your one choice at that point is whether to normalise: '
        + 'dividing each value by the largest in its own document. That helps when '
        + 'documents differ in length or in how heavily they were coded, and hurts '
        + 'when your values already mean the same thing in every document.',
    scaleExampleLead: 'The scale below is one common way of coding ratings, not a requirement:',
    minimum: 'At least 50 documents and 6 concepts must remain after admission '
        + '(provisional), or the analysis stops and tells you why.',
    uploadHint: 'One row per document, one column per concept, a value in every cell',
    source: 'draft 0.5 §5, §6, §7; CR4-16 (2), (3); CR4-19 (2); CR4-24 (a); decision register R1, R2, R4',
  },

  /* ---- the nine steps: "what was done", §8 item 1 ------------------- */
  steps: {
    0: { title: 'Declare the corpus',
         did: 'Read your matrix and recorded what it is: which column is the document id, which are concepts, which are covariates, and what the values mean.',
         source: 'draft 0.5 §6; CR4-16 (1), (2)' },
    1: { title: 'Binarise',
         did: 'Decided, for every cell, whether the concept is present in that document, by the rule your declared data type sets: for ratings, strictly above half the declared scale maximum; for counts and percentages, strictly above half the average non-zero value.',
         source: 'draft 0.5 §6; CR4-16 (3)' },
    2: { title: 'Admit and scope',
         did: 'Removed documents and concepts that cannot carry an association, repeating until nothing more drops out, applied the scope you chose, and set the support window.',
         source: 'draft 0.5 §7; CR4-16 (4), CR4-19 (2), CR4-22 (3)' },
    3: { title: 'Association and signal',
         did: 'Compared every pair of concepts against how often they would co-occur if each kept its own frequency but chose its partners at random, measured each departure in units of its expected variation, and tested which concepts carry any association at all.',
         source: 'draft 0.5 §8, §9' },
    4: { title: 'Stability and granularity',
         did: 'Split the documents in half repeatedly (50 times, provisional), grouped the concepts separately in each half, and kept what held together across the splits. This is where frames are earned rather than asserted.',
         source: 'draft 0.5 §10' },
    5: { title: 'Covariate check',
         did: 'Related each frame to every covariate you declared, to see whether a frame is a configuration of meaning or simply separates different kinds of document.',
         source: 'draft 0.5 §11; CR4-21' },
    6: { title: 'Frames, classes and opposition',
         did: 'Classified each concept by how it sits in its frame, read which frames avoid each other more than they avoid frames in general, and compared the frames against the next finer grouping.',
         source: 'draft 0.5 §12; CR4-18, CR4-19 (1); CR4-24 (d): classes, not roles' },
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
    5: 'The frame-by-covariate table. A value at or above 0.3 (provisional) is flagged.',
    6: 'The concept classes, the frame table and the opposition table.',
    7: 'Each contrast with its interval. An interval that spans zero is a statement of what the data cannot settle.',
    8: 'The claims table: every claim, its tier, and the rerun it fails if it fails one.',
  },

  /* ---- step 0's declarations beyond column roles (R2, R3, R5) ------- */
  declarations: {
    valueType: { prompt: 'What do the values mean?',
         options: [
           { value: 'count',      label: 'Counts — how many times a concept appears' },
           { value: 'rating',     label: 'Ratings — a score on a fixed scale (give its maximum)' },
           { value: 'presence',   label: 'Presence — already 0 or 1' },
           { value: 'percentage', label: 'Percentages' },
         ],
         consequence: 'Sets the rule for when a concept counts as present.',
         source: 'decision register R2; CR4-16 (3)' },
    compositional: { prompt: 'Is each document’s set of values a share of a fixed whole?',
         options: [
           { value: 'detected', label: 'As detected', consequence: 'The detection test’s reading is used.', isDefault: true },
           { value: 'yes',      label: 'Yes, compositional', consequence: 'Compositional data is not yet supported in G4; results are exploratory.' },
           { value: 'no',       label: 'No', consequence: 'Analysed as declared; your reason is recorded.' },
         ],
         source: 'decision register R2; CR4-18; CR4-22 (a); CR4-25 (f)' },
    covariateType: { prompt: 'For each covariate: numeric or categorical?',
         consequence: 'Sets how step 5 relates frames to it: a correlation for numeric, the correlation ratio for categorical. A covariate with two numeric values counts as numeric.',
         source: 'decision register R3; CR4-21 (2); CR4-22 (2)' },
    hypotheses: { prompt: 'Any hypotheses? (optional)',
         consequence: 'Only relationships you state here, before any result, can be reported as confirmatory.',
         source: 'decision register R5; draft 0.5 §6' },
  },

  /* ---- the decision at each step, §8 item 4. Default first. ---------- */
  decisions: {
    0: { prompt: 'Are these column roles right?',
         options: [
           { value: 'confirm', label: 'Confirm as proposed', consequence: 'The analysis proceeds on these roles.', isDefault: true },
           { value: 'amend',   label: 'Amend them',          consequence: 'You set the roles yourself; nothing is assumed. A concept you remove on substantive grounds is excluded here, with your reason.' },
         ],
         source: 'CR4-16 (2): step 0 proposes and the researcher confirms; decision register R1' },
    1: { prompt: 'Normalise each document’s values?',
         options: [
           { value: 'no',  label: 'No', consequence: 'Values are read as given.', isDefault: true },
           { value: 'yes', label: 'Yes', consequence: 'Each value is divided by the largest in its document before the threshold is applied (0.5, provisional).' },
         ],
         source: 'decision register R4; draft 0.5 §6; CR4-16 (3): the any-mention rule is never offered here' },
    2: { prompt: 'Analyse the whole corpus, or one group?',
         options: [
           { value: 'whole', label: 'The whole corpus', consequence: 'All admitted documents are analysed.', isDefault: true },
           { value: 'group', label: 'One group of one categorical covariate', consequence: 'Fewer documents, and a size-matched control is run at step 5. To analyse each group separately, start a separate run for each.' },
         ],
         source: 'decision register R6; CR4-22 (3)' },
    3: { prompt: 'Exclude concepts that carry no signal?',
         options: [
           { value: 'keep',    label: 'Keep them in', consequence: 'They stay, and step 6 classifies them as diffuse.', isDefault: true },
           { value: 'exclude', label: 'Exclude them', consequence: 'Applied once, before step 4, and reported as a finding. The frames are certified only if the two halves agree on which concepts carry signal.' },
         ],
         source: 'draft 0.5 §9; decision register R7. The default is to keep them' },
    4: { prompt: 'How many frames?',
         options: [
           { value: 'recommended', label: 'Take the recommended k', consequence: 'The cleanest grouping that passes the reproducibility gate.', isDefault: true },
           { value: 'choose',      label: 'Choose a neighbouring k', consequence: 'Shown with which frame splits or merges, and reported as your choice, not the method’s recommendation.' },
         ],
         source: 'draft 0.5 §10; decision register R8. The k is never a constant: it comes from this decision (CR4-11, removing G3’s fixed 3)' },
    5: { prompt: 'For each flagged frame: finding or confound?',
         options: [
           { value: 'not_yet_judged', label: 'Not yet judged', consequence: 'Recorded as unjudged and shown as such in the report.', isDefault: true },
           { value: 'finding',        label: 'A finding',       consequence: 'The covariate is part of what the frame is.' },
           { value: 'confound',       label: 'A confound',      consequence: 'Starts a new numbered run from step 2 with the scope narrowed. Both runs are reported.' },
         ],
         source: 'draft 0.5 §11; CR4-21 (4); decision register R9. Deciding which reading holds is interpretive work, not a statistical verdict' },
    6: { prompt: 'Name each frame, and record your reading of each interface concept you intend to discuss.',
         consequence: 'Names default to Frame A, B, C. Both are shown as your interpretation. An interface concept discussed without a recorded reading is flagged.',
         source: 'draft 0.5 §12; decision register R10' },
    7: { prompt: 'Which pairs to test?',
         options: [
           { value: 'hypotheses', label: 'Your step 0 hypotheses', consequence: 'Reported as confirmatory.', isDefault: true },
           { value: 'more',       label: 'Add further pairs',      consequence: 'Added pairs are exploratory, and the report states how many intervals would exclude zero by chance.' },
         ],
         source: 'draft 0.5 §13; decision register R11; CR4-28 (5)' },
  },

  /* ---- claim tiers, §8. Shown against every claim. ------------------ */
  tiers: {
    certified:    { label: 'Certified',    gloss: 'Frames reproducible across half-samples at the chosen number of frames, shown with their covariate status and their agreement under both sensitivity reruns.' },
    confirmatory: { label: 'Confirmatory', gloss: 'A contrast you stated at step 0, before any result, tested with its interval.' },
    interpretive: { label: 'Interpretive', gloss: 'Measured, and read by you. Interface concepts, the opposition table, nesting and frame names are interpretive, never certified.' },
    exploratory:  { label: 'Exploratory',  gloss: 'Shown with its measures, not certified: structure below the gate, a contrast chosen after seeing results, any departure from a default, or a run whose claims are capped.' },
    limits:       { label: 'Limits',       gloss: 'What the analysis could not support, each with its reason: refusals, exclusions, concepts outside the support window, and claims that hold under the default run but fail a sensitivity rerun.' },
  },

  /* ---- flag severities, §8 item 3 ----------------------------------- */
  severities: {
    stop:    { label: 'Stop',    gloss: 'The analysis cannot proceed. Nothing further is computed.' },
    caution: { label: 'Caution', gloss: 'The analysis continues, and this bears on what can be claimed from it.' },
    note:    { label: 'Note',    gloss: 'Reported so you have it. Nothing is proposed.' },
  },

  /* ---- the standing message about provisional values ---------------- */
  provisional: 'Values marked provisional were set on development corpora. They are under review and may change in a later version of the specification.',
  provisionalSource: 'wording of CR4-16 §3 (4.4), revised for CR4-24 (v4.0 now, v4.1 after review)',

  /* ---- the cap while parameters are provisional (CR4-29) ------------ */
  provisionalCap: 'This run passes the reproducibility gate under parameter values that are still provisional. Certification awaits their review; until then its frames are reported as exploratory.',
  provisionalCapSource: 'CR4-29; AD method brief of 21 Oct §1.4, quoted exactly',

  /* ---- scope, worded as reach and not as a fault in the data -------- */
  unsupportedShape: 'Compositional data is not yet supported in G4; results are exploratory.',
  unsupportedShapeSource: 'CR4-22 (3), quoted exactly',
};
