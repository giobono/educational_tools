# Correlating Resonance (CorRes)

## A method for identifying frame structure in coded document corpora

**Methodology definition · v1.0 · 8 August 2026 · Ebono Institute**

*This document defines the CorRes methodology for a reader encountering it for the first time. It is a companion to the CorRes Methodology Specification (v2.4), which governs implementations and records the method's decision history; where the two differ, the specification governs. Nothing here presumes familiarity with that document.*

---

## 1. The question the method answers

When researchers code a corpus of documents against a typology of concepts — frames, themes, policy dimensions, discursive categories — the coding itself answers one question: which concepts appear where. CorRes addresses the question that follows: **which concepts travel together, and what role does each concept play in the resulting structure?**

The intuition is that a frame, in the sense used in framing analysis, is not a single concept but a configuration — a set of concepts that co-occur more often than their individual frequencies would predict. Two concepts that each appear in half the corpus will co-occur frequently by arithmetic alone; that tells us nothing. Two concepts that co-occur far more, or far less, than chance predicts are telling us something about the structure of the discourse. CorRes formalises this intuition, tests whether the resulting structure is stable enough to interpret, and assigns each concept a role within it.

The method is deliberately conservative. It is built to *decline to certify* structure it cannot support, and to say why, rather than to return a plausible-looking result from any input. Several of its stages exist only to refuse: they are gates, not analyses, and a corpus that fails a gate produces a finding about the fit between the typology and the corpus, not a frame map.

CorRes operates on the coded matrix, not on raw text. The coding itself — developing the typology, coding the full corpus against it — precedes the method and may be performed by human coders, by a large language model under human-ratified protocols, or by a combination. In the accompanying software suite these prior phases are supported by separate applications; CorRes takes their output as its input and is indifferent to how the coding was produced, though not to its quality, which the gates below test.

## 2. Input and admission

The input is a binary document–concept matrix: one row per document, one column per concept, a cell equal to 1 where the concept is judged **important** in that document. What counts as importance is a matter for the coding researcher, declared before analysis — it may be bare presence, a count threshold, an intensity judgement, or any defensible rule, and coding schemes that record counts or intensities are reduced to binary form under it. The methodology itself is indifferent to the choice; it simply expects the binary matrix and reports the declared rule alongside the results, since the rule determines both prevalence and admission.

In the LLM-supported coding tools used to develop and test the methodology, the default measure of importance is: the concept's occurrence count in the document exceeds half the mean of the non-zero occurrence values for concept occurrence across all concepts and all documents in the corpus. This is a default of the tools, not a commitment of the method; researchers substitute their own measure freely.

Before any computation, both documents and concepts are tested for admission. A document coded with fewer than two admitted concepts is excluded: co-occurrence is a pairwise notion, and a document containing one concept contributes nothing to it. A concept appearing in fewer than two documents is excluded: a single observation is an instance, not a pattern. A concept that co-occurs with nothing is excluded because no configuration involves it. These rules interact — removing a concept can push a document below the two-concept floor, and removing documents can push a concept below the two-document floor — so admission is iterated until stable.

Two properties of admission are methodological commitments. First, the rules are fixed in advance and are never adjusted in response to results. Second, every exclusion is reported, with its reason. Exclusion is a finding about how well the typology fits the corpus, not a silent cleaning step.

## 3. Departure from independence

The central quantity is the standardised residual of co-occurrence. From the admitted matrix, the method computes the observed co-occurrence count for every pair of concepts, the count expected if the concepts were distributed independently, and the standardised departure of observed from expected — positive where two concepts travel together beyond chance, negative where they avoid one another.

The reason for working with residuals rather than raw co-occurrence is fundamental to the method and worth stating plainly. Raw co-occurrence is dominated by prevalence: frequent concepts co-occur with everything, and any clustering performed on raw counts recovers frequency strata rather than configurational structure. This is not a hypothetical hazard; it is a failure mode the method's own development encountered and instrumented against. All clustering in CorRes is therefore performed on measures of departure from independence — the standardised residual, and the phi correlation of concepts across documents — and never on raw or rescaled co-occurrence counts. As a check on the final result, the certified partition is compared against a partition built from prevalence alone; substantial agreement between the two would indicate contamination.

## 4. Can this corpus support the analysis? Two gates

Before any structure is interpreted, two gates ask whether structure is detectably present at all.

The first is an admissibility test on the residual matrix itself. Two degenerate states must be distinguished from an analysable corpus: *blur*, where co-occurrence sits everywhere near chance and no concept travels with any other; and *blob*, where co-occurrence is uniformly high and every concept travels with every other. Both collapse the spread of the residuals, from opposite directions. The gate therefore tests the spread, and reports the mean, which distinguishes the two failures for the researcher. A companion statistic — the effective dimensionality of the residual structure — must be at least as large as the number of blocks sought, since a partition into *k* groups cannot be supported by a structure carrying fewer than *k* effective dimensions.

One limitation is stated with the gate rather than discovered after it: the test's power grows with corpus size, so the same corpus can fail at a quarter of its documents and pass at full size. "Inadmissible" therefore means *no structure detectable at this corpus size*, not *no structure*.

The second gate is a reliability test on the clustering itself, described after the ensemble it evaluates.

## 5. The stability ensemble

A clustering of fifteen or sixty concepts will always return blocks; the question is whether the blocks mean anything. CorRes answers by resampling. The document set is repeatedly split into complementary halves — every document in exactly one half of every split, a design that protects low-prevalence concepts better than independent subsampling — and the analysis is re-run on each half independently, including re-admission and re-computation of the residuals.

On each half, two clustering procedures of distinct mathematical character are run: one operating on the residual matrix, one on the phi correlation matrix. Both are measures of departure from independence; using two, rather than tuning one, guards against structure that is an artefact of a single algorithm's assumptions. The reference design of twenty-five splits, two halves and two methods yields one hundred runs per corpus.

The runs are then summarised as a consensus: for every pair of concepts, the proportion of runs in which the two were placed in the same block, computed over the runs in which both were admitted. Concepts that genuinely belong together end up together almost regardless of which half of the corpus is examined or which method examines it; concepts whose placement is an accident of the sample do not.

The final partition is obtained by hierarchical clustering of the consensus, cut at *k* blocks, where *k* is selected by a stability scan across candidate values and confirmed by the researcher — never hardcoded. Because a partition's agreement statistics must be judged against what chance would produce for its particular block sizes, the method computes an exact chance baseline for co-classification, and all stability thresholds are positioned relative to it rather than set absolutely.

## 6. The reliability gate

The stability scan that selects *k* is read a second time, as a gate. For each candidate *k* and each method, it records how well the clusterings of the two halves of each split agree with one another (as an adjusted Rand index). If no candidate *k* shows meaningful split-half agreement for any method, the corpus fails the gate: whatever blocks a single run would return, they are not reproducible, and a classification built on them would be an artefact presented as a finding.

This gate is where the method most visibly declines. On the benchmark corpus described below, the best split-half agreement is 0.92; a practitioner corpus tested during development returned 0.13–0.25 at every candidate *k* and was refused. The refusal is reported as such — a result about the corpus, prominently displayed — and is treated within the research programme as one of the method's principal validity arguments: a procedure that cannot fail cannot certify.

## 7. Roles: what each concept does within the structure

With a certified partition in hand, each concept receives two families of measures: its **stability** (how consistently it co-classifies with the other members of its block across the ensemble) and its **affinities** (its mean residual with its own block, and with each other block). From these, every concept is assigned exactly one of five roles.

A **distinguishing** concept is stable, positively attached to its own block, and actively opposed by at least one other block — it marks what separates one frame from another. A **bridging** concept is stable and attached to its own block, but reaches into another block with a strength that is a substantial fraction of its own attachment — it is the connective tissue between frames. An **anchoring** concept holds its own block firmly, reaches into no other, and is opposed by none — the settled ground of a worldview rather than its contested edge. A **weak** concept is unstable and small in every direction. An **orthogonal** concept either opposes its own block or is unstable without being small — it sits outside the frame structure rather than within it.

The thresholds separating these roles are, wherever possible, scale-free ratios of a concept's cross-block reach to its own attachment, so that they travel between corpora without recalibration; the stability threshold is positioned relative to the corpus's own chance baseline. The classification is exhaustive: every admitted concept receives a role, and an implementation that fails to classify a concept has a defect, not a fifth finding.

One caution attaches to the newest role. On the benchmark, the concepts classified as anchoring are also significantly associated with high prevalence, and the independence of the anchoring role from concept frequency is not yet established — the partition itself is demonstrably clean of frequency, so the question is confined to the role layer. Until it is resolved, the method makes no claim about what anchoring *means* beyond its definition.

## 8. Rendering

The principal display is a heatmap of the residual matrix — informally, the *stingray* — with rows and columns sorted by block, and by descending stability within each block. This ordering is a rendering of the certified partition, not additional evidence for it. A seriation of the matrix by bond-energy methods is computed separately, as corroboration, with its block-adjacency statistic reported against a permutation null; it does not determine the display.

## 9. What the researcher controls

Every parameter the computation uses is either fixed by the specification, derived from the corpus, or declared by the researcher with the information needed to decide: the binarisation rule (shown with its effect on prevalence and admission), the number of blocks (shown with the stability scan), and the stability threshold (proposed from the chance baseline, shown against the corpus's actual stability distribution, overridable). Nothing is chosen silently on the researcher's behalf, and any parameter imported from another corpus rather than calibrated on the one under analysis is flagged as a scale error, not accepted as a conservative default.

## 10. Benchmark illustration

The method's reference corpus is the same-sex marriage subcorpus of the Media Frames Corpus: 3,416 news articles coded against 15 framing concepts, of which 3,325 contribute after admission (91 articles carry a single concept) and all 15 concepts are admitted. The corpus passes admissibility comfortably (residual spread 2.94 against a floor of 1.0; effective dimensionality 8.4 against the 3 required) and passes the reliability gate at 0.92. The certified partition has three blocks of 4, 4 and 7 concepts against a chance co-classification baseline of 0.31, and the role classification yields 4 distinguishing, 4 bridging, 3 anchoring, 1 weak and 3 orthogonal concepts.

Two corpora tested alongside it were refused — one at admissibility, one at reliability — and the refusals, with their reasons, form part of the method's validation narrative rather than being discarded.

## 11. Status and open programme

The method is under active development, and its authors maintain a ratified programme of open questions scheduled for resolution — among them the aggregation used for cross-block affinity at larger block sizes, normalisation across corpora of differing size, the reliability threshold's value (currently a declared provisional default), and candidate additions to the clustering panel. The specification distinguishes throughout between what is fixed, what is derived, what is provisional, and what is open; presentations of results carry the same distinctions. A reader requiring the full apparatus — formulas, fixtures, thresholds, and the decision record — is referred to the CorRes Methodology Specification v2.4.

---

*Definition ends. v1.0, 8 August 2026, Academic Director's seat, Ebono Institute. Licence per the ArtIE platform's documentation licensing (Creative Commons); the specification's licence is stated in its own header.*
