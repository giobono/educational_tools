// Generated from AD's plain-language review of 12 Nov 2026 (the reviewed
// inventory and the note's section 2). Do not edit by hand: regenerate.
window.CR3_GLOSSARY = {
 "what-is-a-frame": {
  "term": "frame",
  "on_screen": "frame",
  "hover": "A set of concepts your documents tend to use together, and keep using together when the corpus is split into halves"
 },
 "concepts-and-document-details": {
  "term": "concept · covariate / document detail",
  "on_screen": "concept · document detail",
  "hover": "Concepts are the codes you applied: what the documents say. Document details are facts about each document: who wrote it, when, what kind. Frames are built from concepts alone; details show who voices each frame"
 },
 "the-first-view": {
  "term": "first view",
  "on_screen": "first view",
  "hover": "A picture, not a result: concepts ordered so that ones appearing together more than expected sit side by side. Everything after it tests whether the blocks hold up"
 },
 "what-chance-would-look-like": {
  "term": "residual · resonance / dissonance",
  "on_screen": "together more than expected · less than expected",
  "hover": "How far two concepts share documents beyond what their own frequencies predict",
  "also": [
   {
    "term": "expectation / null (quasi-independence; document-level; both-margins)",
    "on_screen": "baseline: by each concept's own habits · by how common each concept is · allowing for how much each document was coded",
    "hover": "To ask whether two concepts appear together more than chance, we first say what chance would look like. Three baselines are used; the first is the default and the others are tried in the standard reruns"
   }
  ]
 },
 "what-counts-as-present": {
  "term": "presence rule (emphasis; any mention)",
  "on_screen": "what counts as present: coded strongly · any mention",
  "hover": "A concept counts in a document when it is coded above the threshold for your data type. Counting every mention can only make a corpus look more structured"
 },
 "common-enough-to-count": {
  "term": "admission; support window",
  "on_screen": "set aside; too rare or too common to say anything",
  "hover": "A document with one concept, or a concept with no partners, says nothing about what goes with what. A concept in fewer than 10 documents or more than 90% of them is shown but makes no claim"
 },
 "concepts-that-carry-a-pattern": {
  "term": "signal",
  "on_screen": "carries a pattern",
  "hover": "Whether a concept's associations exceed what shuffling that concept alone would give. Concepts that don't are kept, and marked weakly placed",
  "also": [
   {
    "term": "frame test; unplaced",
    "on_screen": "a frame · in no frame",
    "hover": "A group is a frame only if at least two of its concepts carry a pattern. The rest are in no frame"
   }
  ]
 },
 "stability-across-halves": {
  "term": "split-half; consensus; reproducibility; stability diagram",
  "on_screen": "held up when the corpus was split; the stability diagram",
  "hover": "Fifty random splits; a group that reappears in both halves is what the method calls a frame. The diagram is the first view redrawn from what survived"
 },
 "how-many-groups": {
  "term": "$k$; groups",
  "on_screen": "number of groups",
  "hover": "Two to ten are tried; the number kept is the one that reappeared most reliably. Not every group is a frame"
 },
 "the-chance-line": {
  "term": "permutation reference ($s^{*}$, $\\tau_{\\mathrm{rel}}$)",
  "on_screen": "the chance line",
  "hover": "Your own data shuffled 49 times, keeping each concept's frequency and breaking every connection. The line is what that reached; your frames are read against it. It is never a pass mark"
 },
 "how-firm-is-a-frame": {
  "term": "tiers: descriptive, stable, robust, interpretive, limits",
  "on_screen": "the same words",
  "hover": "Descriptive: the pattern is in your data. Stable: it also beats the chance line. Robust: it also survives the other settings that apply. Interpretive: your reading. Limits: what the analysis could not do"
 },
 "distinguishing-bridging-diffuse": {
  "term": "classes: distinguishing · bridging candidate · diffuse · method-contingent · outside support",
  "on_screen": "marks this frame out · shared with another frame · weakly placed ({failed test}) · depends on the grouping method · too rare or too common",
  "hover": "Within a frame, which concepts belong firmly, which are held between frames, and which sit uneasily. The reviewer's report has the measures behind each label"
 },
 "who-voices-each-frame": {
  "term": "populations; $\\eta$",
  "on_screen": "kinds of document; strongly tied to",
  "hover": "How much of each frame each kind of document carries. A frame strongly tied to one kind is either voiced by it or an artefact of pooling; comparing kinds tells which"
 },
 "the-standard-reruns": {
  "term": "sensitivity reruns; binding; not applicable",
  "on_screen": "the standard reruns; decides robust · shown for information; couldn't run on these data",
  "hover": "The whole analysis again under the other settings. Frames that hold under all that apply are robust"
 },
 "the-second-grouping-method": {
  "term": "check procedure; adjusted Rand index",
  "on_screen": "the second grouping method; agreement score",
  "hover": "The same splits grouped a second way; the agreement score runs from 0 (no better than chance) to 1 (identical)"
 },
 "the-agreement-score": {
  "term": "check procedure; adjusted Rand index",
  "on_screen": "the second grouping method; agreement score",
  "hover": "The same splits grouped a second way; the agreement score runs from 0 (no better than chance) to 1 (identical)"
 },
 "reading-a-bridging-concept": {
  "term": "the four readings",
  "on_screen": "shared priority · two framings of the same problem · disagreement · mentioned together, nothing more",
  "hover": "What it means when a concept appears with both frames, read in the documents by you"
 },
 "planned-and-exploratory": {
  "term": "planned / exploratory",
  "on_screen": "the same words",
  "hover": "Planned: declared before any result was seen. Exploratory: chosen afterwards. Both allowed; the label travels with the finding"
 },
 "shares-of-a-whole": {
  "term": "compositional",
  "on_screen": "shares of a whole",
  "hover": "When one share rises others must fall, so some avoidance between concepts is built in. Who voices each frame is unaffected"
 },
 "the-three-records": {
  "term": "the three records",
  "on_screen": "what you decided · what was run · every setting and seed",
  "hover": "Together they let another researcher repeat the analysis and see how it was reached"
 },
 "the-interim-report": {
  "term": "interim report; reporting minimum",
  "on_screen": "interim: not yet enough to report from",
  "hover": "A report taken before the chance check"
 }
};
window.CR3_HOVERS = {
 "p1.lede": {
  "hover": "A frame is a set of concepts your documents tend to use together, and keep using together when the corpus is split into halves. The method's own one-sentence statement is in the report for your reviewer.",
  "link": "what-is-a-frame"
 },
 "p1.start": {
  "hover": "A table with one row per document and one column per concept, as a CSV file. Columns describing each document (author, date, type) can be in the same file.",
  "link": "concepts-and-document-details"
 },
 "p1.example.marpor": {
  "hover": "This corpus is used under terms that do not yet allow results to be published. Nothing from it leaves this computer.",
  "link": ""
 },
 "p2.intro": {
  "hover": "Each cell holds how strongly that concept was coded in that document: a yes/no, a count, a rating, or a percentage. You'll be asked which, if the file doesn't say.",
  "link": "concepts-and-document-details"
 },
 "p3.opening": {
  "hover": "Why it matters: if a column describing the speaker (say, 'is a government agency') is treated as a concept, it can form a 'frame' of its own, and you would be reading a label as if it were an idea.",
  "link": "concepts-and-document-details"
 },
 "p3.summary": {
  "hover": "Concepts build the frames. Document details are kept aside and used later to show who voices each frame.",
  "link": "concepts-and-document-details"
 },
 "p3.q.family": {
  "hover": "Document details are never used to build frames. They are used afterwards to show who voices each frame.",
  "link": "concepts-and-document-details"
 },
 "p3.q.blanks": {
  "hover": "We never silently read an empty cell as zero. If it means 'not coded' rather than 'absent', the values need to be supplied before the analysis.",
  "link": ""
 },
 "p3.q.scale": {
  "hover": "This decides what counts as a concept being 'present' in a document. For a rating, a concept counts when it is coded above the midpoint of the scale; for counts, above half the typical count.",
  "link": "what-counts-as-present"
 },
 "p3.q.group": {
  "hover": "Age bands, author sectors and document types are typical. Every pair inside such a group would look like strong avoidance, which would mislead the analysis.",
  "link": "concepts-and-document-details"
 },
 "p3.q.identical": {
  "hover": "Keep them all if they are different documents that happen to be coded alike, or if the corpus deliberately counts them more than once. Keep the first of each if they are the same document entered twice.",
  "link": ""
 },
 "p3.q.total": {
  "hover": "A total is a function of the concepts, not a concept, and would form a 'frame' with everything.",
  "link": ""
 },
 "p3.fq1": {
  "hover": "Answering yes declares the full checklist in advance, so that later analyses count as planned rather than exploratory. It runs nothing now, and you can still stop anywhere.",
  "link": "planned-and-exploratory"
 },
 "p3.fq2": {
  "hover": "Planned means declared before any result was seen. Exploratory means chosen afterwards. Both are allowed; the label travels with the finding.",
  "link": "planned-and-exploratory"
 },
 "p4.fv.label": {
  "hover": "The first view is a picture, not a result. It orders your concepts so that ones that appear together more than expected sit side by side. Blocks on the diagonal are candidate frames. Everything that follows tests whether they hold up.",
  "link": "the-first-view"
 },
 "p4.fv.caption": {
  "hover": "'Expected' here means how often two concepts would share a document if each turned up at its own rate and nothing connected them.",
  "link": "what-chance-would-look-like"
 },
 "p4.line.binarise": {
  "hover": "A concept counts as present in a document when it is coded above the threshold for your data type.",
  "link": "what-counts-as-present"
 },
 "p4.line.admit": {
  "hover": "A document with only one concept, or a concept that appears with nothing else, can't tell us what goes with what.",
  "link": "common-enough-to-count"
 },
 "p4.line.associate": {
  "hover": "The method's word for this is the residual: observed minus expected, scaled.",
  "link": "what-chance-would-look-like"
 },
 "p4.line.stability": {
  "hover": "Fifty random splits. A group that reappears across both halves is what the method calls a frame.",
  "link": "stability-across-halves"
 },
 "p4.line.covariates": {
  "hover": "",
  "link": "who-voices-each-frame"
 },
 "p4.line.structure": {
  "hover": "",
  "link": "distinguishing-bridging-diffuse"
 },
 "p4.defaults.title": {
  "hover": "Five choices are made from the shape of your data before any result is seen, so that nothing is picked to flatter the outcome. Each can be revisited on the Firm up page.",
  "link": "what-chance-would-look-like"
 },
 "p4.defaults.expectation": {
  "hover": "To see whether two concepts appear together more than chance, we first need to say what chance would look like. We use a baseline that allows for each concept being common or rare, so common concepts don't look connected to everything. Other baselines are tried in the standard reruns.",
  "link": "what-chance-would-look-like"
 },
 "p4.defaults.expectation_wide": {
  "hover": "Some documents carry many codes and others few. A baseline that allows for this document by document is run later as one of the standard reruns; where documents differ widely it can move the frames.",
  "link": "what-chance-would-look-like"
 },
 "p4.defaults.presence_rule": {
  "hover": "Counting every mention can only make a corpus look more structured than its emphasis supports. Counting only strong coding is the stricter choice; the other rule is tried in the standard reruns.",
  "link": "what-counts-as-present"
 },
 "p4.defaults.low_signal": {
  "hover": "Some concepts turn up with nothing in particular. We keep them in view rather than hide them; a frame is never built from them alone.",
  "link": "concepts-that-carry-a-pattern"
 },
 "p4.defaults.granularity": {
  "hover": "We try two to ten groups and keep the number that reappeared most reliably across the halves. The neighbours are shown so you can see how clear-cut the choice was.",
  "link": "how-many-groups"
 },
 "p4.defaults.populations": {
  "hover": "The whole corpus is analysed first. Where a frame turns out to belong mainly to one kind of document, the checklist offers to analyse the kinds apart.",
  "link": "who-voices-each-frame"
 },
 "p5.tier.descriptive": {
  "hover": "Descriptive: the pattern is in your data. Stable: it also beats what shuffled data would give. Robust: it also survives the alternative settings.",
  "link": "how-firm-is-a-frame"
 },
 "p5.tier.other": {
  "hover": "Descriptive: the pattern is in your data. Stable: it also beats what shuffled data would give. Robust: it also survives the alternative settings.",
  "link": "how-firm-is-a-frame"
 },
 "p5.frame.tier": {
  "hover": "Descriptive: in your data. Stable: beats shuffled data. Robust: survives the alternative settings too.",
  "link": "how-firm-is-a-frame"
 },
 "p5.frame.relabelled": {
  "hover": "",
  "link": "who-voices-each-frame"
 },
 "p5.frame.distinguishing": {
  "hover": "Concepts that belong firmly to this frame and are pulled towards no other. The method calls them distinguishing.",
  "link": "distinguishing-bridging-diffuse"
 },
 "p5.frame.bridging": {
  "hover": "Concepts held between this frame and one other, so they may be where two ways of talking meet. The method calls them bridging candidates. What the overlap means is for you to read in the documents (Firm up, last item).",
  "link": "distinguishing-bridging-diffuse"
 },
 "p5.frame.diffuse": {
  "hover": "In this frame, but not firmly: {failed test}. Possibly noise; possibly a concept that sits uneasily here.",
  "link": "distinguishing-bridging-diffuse"
 },
 "p5.frame.contingent": {
  "hover": "These concepts land in a different frame when the grouping is done a second way (Firm up, item 4). Treat their place as uncertain.",
  "link": "the-second-grouping-method"
 },
 "p5.frame.outside": {
  "hover": "A concept in fewer than 10 documents, or in more than 90% of them, is shown but makes no claim: too rare to trust, or so common it tells us nothing about what goes with what.",
  "link": "common-enough-to-count"
 },
 "p5.frame.shares": {
  "hover": "For each kind of document, how much of this frame it carries on average.",
  "link": "who-voices-each-frame"
 },
 "p5.unplaced": {
  "hover": "Concepts that grouped only with other patternless concepts. They belong to no frame and are reported so you can see them.",
  "link": "distinguishing-bridging-diffuse"
 },
 "p5.no_frame": {
  "hover": "A group is a frame only if at least two of its concepts carry a pattern of their own. Here none did. The first view is still worth reading.",
  "link": "concepts-that-carry-a-pattern"
 },
 "p5.sd.caption": {
  "hover": "This is the first view redrawn from what survived splitting the corpus. Where the first view showed what one ordering found, this shows what kept coming back.",
  "link": "stability-across-halves"
 },
 "p5.chosen.k": {
  "hover": "",
  "link": "how-many-groups"
 },
 "p5.chosen.k_other": {
  "hover": "",
  "link": "how-many-groups"
 },
 "p5.chosen.table": {
  "hover": "'How well it held up' is the agreement between the two halves of the corpus, averaged over fifty splits: 1 is identical, 0 is no better than chance.",
  "link": "the-agreement-score"
 },
 "p5.compositional": {
  "hover": "When one share rises, others must fall. That builds a little avoidance between concepts into the data before anyone wrote a word. A rise in one frame and a fall in another are one finding, not two.",
  "link": "shares-of-a-whole"
 },
 "p5.where.before": {
  "hover": "The authors' reporting minimum includes the chance check. Before it, every result is descriptive.",
  "link": "the-interim-report"
 },
 "p5.where.firm.descriptive": {
  "hover": "",
  "link": "how-firm-is-a-frame"
 },
 "p5.where.firm.stable": {
  "hover": "",
  "link": "how-firm-is-a-frame"
 },
 "p5.where.firm.robust": {
  "hover": "",
  "link": "how-firm-is-a-frame"
 },
 "p6.title": {
  "hover": "Each item answers one question about your frames and can raise how firm they are called. Nothing here changes the frames themselves.",
  "link": ""
 },
 "p6.item.chance_check.title": {
  "hover": "We shuffle your own data 49 times, keeping each concept's frequency but breaking every connection, and see what frames that produces. Your frames are then read against that line.",
  "link": "the-chance-line"
 },
 "p6.item.compare_types.title": {
  "hover": "",
  "link": "who-voices-each-frame"
 },
 "p6.item.standard_reruns.title": {
  "hover": "The whole analysis again under the other reasonable settings: counting any mention rather than strong coding, and two other baselines for 'together'. Frames that hold under all of them that apply are called robust.",
  "link": "the-standard-reruns"
 },
 "p6.item.second_grouping.title": {
  "hover": "The same splits, grouped a second way that also lets avoidance between concepts shape the groups. Concepts that land differently are marked as depending on the method.",
  "link": "the-second-grouping-method"
 },
 "p6.item.bridging_readings.title": {
  "hover": "For each concept held between two frames, the documents where it appears with both are shown, and you record what the overlap means: shared priority, two framings of one problem, disagreement, or just mentioned together.",
  "link": "reading-a-bridging-concept"
 },
 "p6.item.label.planned": {
  "hover": "Declared before any result was seen.",
  "link": "planned-and-exploratory"
 },
 "p6.item.label.exploratory": {
  "hover": "Chosen after results were seen. Allowed; the label travels with the finding.",
  "link": "planned-and-exploratory"
 },
 "p6.review.spread.reaches": {
  "hover": "The spread of the 'together' and 'apart' values. Shuffled data reached at most about {ref}; yours is {s}.",
  "link": "the-chance-line"
 },
 "p6.review.spread.below": {
  "hover": "",
  "link": "the-chance-line"
 },
 "p6.review.repro.reaches": {
  "hover": "Agreement between the two halves, averaged over fifty splits, read against what shuffled data reached.",
  "link": "the-chance-line"
 },
 "p6.review.repro.below": {
  "hover": "",
  "link": "the-chance-line"
 },
 "p6.review.rerun.held": {
  "hover": "",
  "link": "the-agreement-score"
 },
 "p6.review.grouping.ari": {
  "hover": "",
  "link": "the-agreement-score"
 },
 "p6.bridging.reading": {
  "hover": "Shared priority: both frames care about it. Two framings: the same problem seen two ways. Disagreement: the documents argue. Mentioned together: nothing more than proximity.",
  "link": "reading-a-bridging-concept"
 },
 "p7.article.text": {
  "hover": "",
  "link": "the-three-records"
 },
 "p7.reviewer.text": {
  "hover": "",
  "link": "the-three-records"
 },
 "p7.limit": {
  "hover": "",
  "link": "the-interim-report"
 },
 "ex.a.records": {
  "hover": "",
  "link": "the-three-records"
 }
};
