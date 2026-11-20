---
title: "Correlating Resonance (CorRes): Methodology Specification v3.0"
subtitle: "A method for seeing the frames in a coded corpus, and the populations that voice them"
---

*Geoff Ebbs and Louis Sanzogni · Ebono Institute · Version 3.0, 20 November 2026*

*© 2026 Geoff Ebbs and Louis Sanzogni. Published by the Ebono Institute under the Creative Commons Attribution 4.0 International licence (CC BY 4.0). The software that implements this method is proprietary and is not covered by this licence.*

*How to cite:* Ebbs, G. and Sanzogni, L. (2026). *CorRes methodology v3.0*. Ebono Institute. https://edu.ebono.au/methods/corres/v3.0/

# CorRes at a glance

## Frames, and frame analysis

A **frame** is a way of organising what a text is about: which considerations it brings together, which it sets aside, and which it treats as belonging with which. The usage follows Entman (1993), for whom to frame is to select some aspects of a perceived reality and make them more salient, and Goffman's earlier sense of frames as the schemata through which experience is organised. Frame analysis asks which frames are present in a body of texts, what each is made of, how they relate, and who deploys them.

In a coded corpus a frame has a concrete form. When documents have been coded against a typology of concepts, a frame appears as **a set of concepts that occur together in documents more often than their individual frequencies predict, and that keep occurring together when the corpus is resampled.** Some of those concepts distinguish the frame; some sit between it and another frame; some populations of text carry it and others do not. Sorted by its structure, the matrix of associations between concepts shows blocks on its diagonal and wings between them, the pattern the method's first users called the stingray, and the blocks are the frames.

## What CorRes does

Correlating Resonance takes a coded corpus and returns its frames, with a stated warrant for each. It does five things:

1. decides which documents and concepts carry information about co-occurrence;
2. measures, for every pair of concepts, how far their co-occurrence departs from what their frequencies alone would produce: **resonance** where they appear together more than expected, **dissonance** where less;
3. separates concepts that carry association from those that do not;
4. groups the concepts by how reproducibly they fall together when the corpus is split into independent halves, and calls a group a frame only when it reproduces;
5. reads each frame for the concepts that distinguish it, the concepts that bridge it to another, and the populations of text that voice it.

Every result is reported in the tier its evidence supports, against references computed by rearranging the corpus itself. **The method shows; it certifies nothing.** What a frame means is the researcher's reading, recorded as such.

## Where it sits in a mixed-methods study

CorRes is an analysis of **integration** in the sense of Fetters, Curry and Creswell (2013). It takes qualitative work, turns part of it into numbers, finds structure in those numbers, and hands that structure back to qualitative interpretation. Each crossing is visible and recorded. In the terms of Creswell and Plano Clark (2018), it is the quantitative analysis inside a design whose other strands are qualitative.

| Phase | Strand | What happens | Who decides |
|---|---|---|---|
| Typology development | Qualitative | Concepts are identified and defined | Researcher |
| Coding | Qualitative | Each document is coded against the typology, by people, by machine under human protocols, or both | Researcher; coding protocol |
| The matrix (§1) | Conversion | Codes become a document–concept matrix and a binary presence matrix: *quantitizing* (Sandelowski, Voils and Knafl, 2009) | Researcher declares what the data are |
| The method (§2) | Quantitative | A first view, then seven refinements: stability, expectation, support, signal, references, classes, populations | The method |
| Reading and reporting (§3, Part B) | Integration | Frames are named and read; populations compared; specific hypotheses tested; every claim carries its tier | Researcher interprets; the method reports warrant |

Two outputs are built as joint displays in the sense of Guetterman, Fetters and Creswell (2015), placing quantitative structure and qualitative meaning in one view: the **consensus matrix** ordered by frame (R1), which shows which concepts hold together and where they are pulled, and the **frame table**, which sets each frame's distinguishing and bridging concepts beside the name the researcher gives it and the populations that voice it. Keeping the two kinds of warrant apart, resampling evidence and interpretation, is intended to support the quality of meta-inferences (Tashakkori and Teddlie, 2008).

**What CorRes is not.** It does not code text, and it is not topic modelling. It does not replace the qualitative reading that produced the typology. It works on the coded matrix, and its results are as good as that coding, which is reported alongside them.

## Two principles

**Association is departure from a stated expectation.** Common concepts co-occur with everything because they are common, so the method never works with raw co-occurrence. For every pair of concepts it states how often the two would appear together if concepts paired at random while keeping their frequencies, and analyses the departure from that expectation, the standardised residual (§2.1, R2). The expectation is the one place a model enters the method. Three are specified, differing in which frequencies they hold fixed. A model defines the departure; it makes no claim about whether the departure is more than chance.

**Warrant comes from resampling the corpus itself.** Every question of the form *could chance have produced this, and does it hold?* is answered by recomputing the statistic on rearranged or resampled versions of the same corpus, not by appeal to a sampling distribution.

| Resampling | What it rearranges | Question it answers | Where |
|---|---|---|---|
| **Permutation** | A concept's presences, shuffled across documents, keeping its frequency; or every concept's, keeping every frequency | *Could no association at all have produced this value?* | Signal, concept by concept (R4); the references for the spread and for reproducibility (R5) |
| **Split-half** | The documents, divided at random into two independent halves, each analysed in full | *Does the grouping reproduce?* | The definition of a frame (R1), and the stable tier (R5; §3) |
| **Bootstrap** | The documents, resampled with replacement | *How uncertain is this estimate?* | Pairwise contrasts; the opposition table (B.2, B.4) |

These are one idea at three scales. A concept carries signal if its residuals exceed what its own shuffles produce. A corpus's spread and reproducibility are read against what shuffling the whole corpus produces. A frame is what holds together across independent halves. Each reference is a quantile of a statistic under rearrangement of the researcher's own data, so a reader can say exactly what it means: *a corpus with these frequencies and no association reaches this value less than 5% of the time.*

Three things follow. *Stability is within the corpus*: split-half reproducibility shows that a grouping is a property of how this corpus is written, not of one partition of it; it is not evidence that the frames generalise, and replication across corpora is the researcher's design. *The sensitivity reruns are a fourth question* (B.1): repeating the whole analysis under a different presence rule or expectation asks whether a result depends on a choice the method made, and a result that holds across those choices is **robust**. *The researcher reads; the method reports warrant.*

## What the method claims, and what it does not

> *CorRes v3.0 shows which concepts occur together more than their frequencies predict, how stably they group when the corpus is split, which concepts distinguish a group or sit between groups, and which populations of text voice each group. It certifies nothing, and every reading is the researcher's, recorded as such.*

Every part of that sentence is true by construction. The residuals are departures from a stated expectation. Reproducibility is measured by resampling and reported with its interval beside its reference. The classes are computed from the consensus. Populations are read from declared covariates. What any of it means is the researcher's.

Clustering algorithms always return clusters, whether or not any structure is present, and patterns seen by eye in a co-occurrence table are equally easy to find and equally hard to trust. The method is built around one question: **is the grouping real, or would any rearrangement of these data have looked like this?** It does not answer with a verdict. It shows the evidence for each grouping beside what rearrangement produces, and states the warrant each result has earned (§3).

**Co-occurrence is not agreement.** Two concepts that occur together in many documents may share a priority, frame the same problem differently, disagree explicitly, or merely be mentioned side by side. The method measures the first fact and none of the four readings; which holds is settled by reading the documents (B.3).

**The method does not claim:** that a frame is a latent cause, rather than a stable statistical configuration; that every concept belongs to a frame; that a frame belongs to the corpus rather than to a population within it; that the frames are the only structure, since finer, crossing or axial structure may exist; that a grouping below a reference has no structure, or that one above it is a frame of meaning; certification of any result; or statistical novelty, since the method combines established techniques, residual analysis of contingency tables, spectral decomposition, consensus clustering and bootstrap inference, and its contribution is the combination and its safeguards.

## Why a version that certifies nothing

A certifying version of this method, one that could say *this is a frame* with a known error rate, is in development, and the evidence needed to calibrate it is not yet in hand. The question is what researchers should use meanwhile. This specification's answer is a method whose every claim is true by construction and whose warrant is stated with each result. It gives a researcher the safeguards the fourth generation developed, the residual that removes frequency, the split-half test of stability, the separation of signal from noise, the reading of populations, without asserting more than those safeguards support. Analyses reported under it can later be raised to a certifying standard without being redone, because the records they carry (§3) are the records certification will need; and the corpora they accumulate are the evidence that calibrating a certifying version requires.

# Part A — The method

# 1. The input: the document–concept matrix

## 1.1 Definition

The method's input is a **document–concept matrix** $X$: one row per document, one column per concept from a typology, each cell $x_{dc}$ recording how strongly concept $c$ is present in document $d$ under the coding protocol. $N_0$ documents and $m_0$ concepts enter; $N$ and $m$ are the numbers admitted (§2.1). The cells may be presence (0/1), counts, ratings on a bounded scale $0 \ldots x_{\max}$, or percentages, and the **data type and its scale are part of the matrix's definition**, because the rule that turns a cell into a presence depends on them.

Beside $X$ sits a **covariate matrix** $Z$: one row per document, one column per attribute of the document or its author (source, sector, year, type, outlet). **Covariates are never columns of $X$.** A label for the speaker is not a concept the speaker uses, and a covariate coded among the concepts enters the frames as if it were one; in development, three author-type columns left among 85 concepts entered the leading axis of the structure directly. Which populations voice which frame is a result of the method (R7), and it needs $Z$ kept apart from $X$ to be one.

The researcher may state **hypotheses** with the matrix: named concepts or groups whose relationship they expect. Only hypotheses stated with the matrix can later be reported as confirmatory (B.2); the same holds for optional analyses declared with it (Part B).

## 1.2 Presence

The method analyses a **binary matrix** $B$, $b_{dc} \in \{0,1\}$, derived from $X$ by a presence rule. Two rules are defined, named for what they ask: whether a concept is **emphasised** in a document, or **mentioned at all**. Optionally each document's values are first scaled by that document's largest value, $\tilde{x}_{dc} = x_{dc} / \max_{c'} x_{dc'}$ (zero where every value is zero), so that the rule applies to the document's own emphasis. With $v_{dc}$ the value in use, $b_{dc} = \mathbf{1}[\, v_{dc} > \theta \,]$, the comparison strict, and $\theta$ set by the data type:

| Data type | *Emphasis* | *Any mention* |
|---|---|---|
| Presence (0/1) | present when coded 1 | the same; there is no second rule |
| Rating on $0 \ldots x_{\max}$ | above $x_{\max}/2$: on 0–3, present when ≥ 2; on 0–4, when ≥ 3; on 0–1, every 1. When normalised, above 0.5 *(provisional)* | any non-zero value |
| Count or percentage | above half the mean of the non-zero values across the matrix *(provisional)*; when normalised, above 0.5 | any non-zero value |

$x_{\max}$ is the **declared** maximum of the scale, not the largest value observed. **Emphasis is the authors' default and any mention is the first sensitivity rerun** (B.1), for one reason: lowering the threshold to a single mention can only make a corpus look more structured than its emphasis supports, so the rerun can show that a claim does not hold under the other rule but cannot raise a claim's standing. On a correctly declared corpus the rule matters: the Food Security Inquiry matrix exceeded the strength reference under emphasis with every expectation and fell below it under any mention with two of the three (§20, V3). Which rule better recovers planted structure is not settled (§20, V15); Appendix A gives the authors' rule for reading the two.

Only $B$ is analysed. The ordinal information in $X$, how strongly a concept is present beyond the threshold, is kept for the record and used by no step; binarisation is a property of this version's count-based expectations, not a principle of the method, and the rerun under any mention is the method's only check on it (§17).

From $B$: $n_i = \sum_d b_{di}$ is the number of admitted documents containing concept $i$, and $\ell_d = \sum_c b_{dc}$ the number of concepts present in document $d$.

## 1.3 Properties of a matrix, and their consequences

A matrix may have properties that change what the method can do with it. Each is a fact about the data, declared with it.

- **Undefined cells.** A blank, short or non-numeric cell has no value, and a matrix with one is not yet an input. No cell is read as zero by default; the researcher states that blank means absent, or supplies the value.
- **Identical documents.** Two rows identical under different identifiers may be duplicates, or a weighting of the corpus; they are a fact about the data the researcher resolves before analysis.
- **Single-select groups.** A set of columns that are the answers to one question, so that no document carries more than one of them (age bands, author sector, document type). Every pair inside such a group has zero co-occurrence by construction, which every expectation in R2 reads as strong dissonance; on synthetic corpora built from such groups with no structure at all, every one of the twenty most negative residuals fell inside a group and every corpus exceeded the strength reference (§20, V16). **The expectations of this version cannot analyse them.** Such columns are covariates, or are removed. A group is recognisable by its values: three or more columns in which no document has more than one non-zero value, together covering most documents *(provisional: 90%)*.
- **Compositional data.** Where values are shares of each document, so that rows of $X$ sum to a near-constant, a rise in one category forces falls in others, and negative association between categories is partly built into the data (Aitchison, 1986). The method analyses such a matrix, and every co-occurrence result from it carries a **compositional caution**; a frame's share across a population (R7) is a function of each document's own row and carries none, with one limit stated in Appendix A, §A.3. Declaring values as percentages does not by itself make a matrix compositional; near-constant row sums do.
- **Totals and summary columns** are functions of the concepts and are not concepts.

How a matrix is produced is the researcher's qualitative strand, and is outside this specification except for what a report states about it (§14).

## 1.4 Notation

| Symbol | Meaning |
|---|---|
| $N$, $m$ | number of admitted documents; number of admitted concepts |
| $x_{dc}$, $\tilde{x}_{dc}$, $v_{dc}$ | coded value of concept $c$ in document $d$; its row-normalised value; the value in use |
| $x_{\max}$, $\theta$ | top of a rating scale; presence threshold |
| $b_{dc}$ | 1 if concept $c$ is present in document $d$, else 0 |
| $z_d$ | a document covariate; never used to form frames |
| $n_i$, $\ell_d$ | number of admitted documents containing concept $i$; number of concepts present in document $d$ |
| $O_{ij}$ | number of documents in which concepts $i$ and $j$ both occur ($i \neq j$) |
| $r_i$, $T$ | concept $i$'s total co-occurrence with all other concepts; the grand total |
| $\bar{\ell}_i$ | mean number of concepts present in the documents containing $i$ |
| $a_i$ | quasi-independence weight of concept $i$ |
| $E_{ij}$, $R_{ij}$ | expected co-occurrence under the expectation in use; standardised residual |
| $E^{\mathrm{doc}}_{ij}$, $E^{\mathrm{bm}}_{ij}$ | expected co-occurrence under document-level independence; under the both-margins model |
| $x_d$, $y_c$, $p_{dc}$ | both-margins weights of document $d$ and concept $c$; the probability they give that $c$ is present in $d$ |
| $\lambda_l$, $u_l$, $p_l$ | eigenvalues and eigenvectors of $R$; share of the positive eigenvalue mass |
| $d_{+}$, $d_{\mathrm{eff}}$ | number of positive eigenvalues; effective number of attracting dimensions |
| $\mathrm{spread}$, $s^{*}$ | standard deviation of the off-diagonal residuals; its permutation reference |
| $S_i$, $U$, $\nu$ | signal score of concept $i$; number of shuffles; shuffle index |
| $P$ | number of permutations used for a reference |
| $k$, $\hat{k}$, $K_F$ | number of groups; recommended number; number of frames among them |
| $J$, $J_k$, $t$ | number of random splits; splits usable at $k$; split index |
| $h$, $L^{(h)}$ | a half-analysis (one half of one split); the grouping it produces |
| $\Theta_{ij}$ | at a given $k$, the usable half-analyses in which both $i$ and $j$ were admitted |
| $C_{ij}$ | consensus: share of those half-analyses placing $i$ and $j$ in the same group |
| $y_i$ | concept $i$'s coordinates in the attracting space |
| $\overline{A}_k$, $\tau_{\mathrm{rel}}$ | reproducibility at $k$; its permutation reference |
| $\mathrm{PAC}_k$ | proportion of ambiguous clustering at $k$ |
| $F$, $G$, $F(i)$ | frames; the frame containing concept $i$ |
| $\mathrm{own}_i$, $\mathrm{pull}_i(G)$, $g_i$ | consensus with own frame; with frame $G$; the frame that pulls hardest |
| $\kappa_i$, $\beta_i$, $\overline{R}_i$ | concentration of pull; balance; mean residual towards $g_i$ |
| $\varphi_F(d)$, $\eta$ | frame $F$'s share in document $d$; correlation ratio |
| $D_F$, $\mathcal{C}(d)$ | frame $F$'s profile; document $d$'s configuration (B.9) |
| $D_{FG}$, $\delta_{FG}$, $\Delta_{FG}$ | co-occurrence shortfall between frames $F$ and $G$; its relative size; its difference from $F$'s mean over other frames (B.4) |
| $\mathcal{P}$, $\mathcal{Q}$, $\Delta$ | sets of concept pairs; contrast between them (B.2) |
| $B$, $\Delta^{(b)}$, $q_{\alpha}$ | number of bootstrap resamples; a replicate; its $\alpha$ quantile |

# 2. The method

The method is stated as a first view a researcher can produce by hand, followed by seven refinements, each introduced by the way the view before it can mislead. The first view is a picture. The refinements are what make the picture trustworthy, and from the first of them the method is a procedure a machine runs. The mathematics of each refinement is given where the refinement is introduced; the steps are run in order on the whole corpus, and admission, the expectation and the grouping are run again inside every half-sample, permutation and resample, so that no derived quantity is carried into a sample from the full corpus.

## 2.1 The first view

Three steps, from the binary matrix $B$ (§1.2).

**Admit.** A document carrying a single concept says nothing about which concepts go together, and a concept that never co-occurs with anything has no association to measure. Such items are excluded, and excluding them can leave others in the same position, so admission repeats until nothing changes.

| Rule | Applies to | Excluded when | Ground |
|---|---|---|---|
| D1 | document | it carries no admitted concept | contributes nothing |
| D2 | document | it carries one admitted concept | touches only the diagonal, which is excluded |
| X1 | concept | it is present in no document | expected values undefined |
| X2 | concept | it co-occurs with no other concept | no configuration involves it |
| X3 | concept | it is present in one document only | one observation is an instance, not a pattern |

The rules apply in the order D1, D2, X1, X2, X3, repeated to a fixed point. Every pass short of the fixed point removes at least one item, so the procedure ends within $N_0 + m_0 + 1$ passes. The rules are fixed in advance and never adjusted to results. Every exclusion is a finding about how well the typology fits the corpus, reported with its rule and pass.

**Minimum corpus.** Below 50 admitted documents or 6 admitted concepts *(provisional)* the quantities of R1 are not defined with any useful precision, and the method does not proceed.

**Associate.** A concept's co-occurrence with itself is not an association, so the diagonal is left out:

$$O_{ij} = \sum_{d=1}^{N} b_{di}\, b_{dj} \quad (i \neq j), \qquad r_i = \sum_{j \neq i} O_{ij}, \qquad T = \sum_i r_i$$

The expectation in its simplest form is **document-level independence**: concepts appear independently across documents, so

$$E^{\mathrm{doc}}_{ij} = \frac{n_i n_j}{N}$$

and the departure is the **standardised residual**

$$R_{ij} = \frac{O_{ij} - E_{ij}}{\sqrt{E_{ij}}}, \qquad R_{ii} = 0$$

A positive $R_{ij}$ means the two concepts **resonate**: they appear together more than the expectation predicts. A negative value means **dissonance**: they avoid each other. A raw residual counts excess documents and grows with how common the concepts are; the standardised residual measures the strength of a departure relative to its expected variation, which is the property frames are built from.

**Look.** Order the concepts so that concepts with positive residuals to each other sit together: by a seriation of $R$, by a clustering of it, or by eye. The matrix then shows blocks on its diagonal and fainter bands between them. The blocks are **candidate frames**; the bands are **candidate bridges**; a concept with little colour anywhere is a candidate for noise. This is the stingray, and it is the picture every later step refines.

**What the first view is.** A description of this corpus under the simplest expectation, reproducible from the matrix in an afternoon. It is reported as **descriptive** (§3). **It is not yet a frame.** Any matrix, ordered well, shows blocks; the first view cannot say whether these blocks would appear again in another sample of the same discourse, whether they are made of common concepts rather than associated ones, or whether a block is noise that happened to sit together. The refinements answer those questions in turn.

## 2.2 The refinements

### R1 — Stability: the frames that reappear

**The first view misleads because** any ordering of any matrix shows blocks, and a clustering algorithm always returns clusters. A grouping that reflects how the corpus is written should reappear when the analysis is repeated on independent halves of the documents; one produced by noise, or by the arbitrary behaviour of an algorithm, should not. **A frame is defined as what holds together across repeated half-samples**, and the stability diagram, the consensus matrix ordered by frame, is the first view rebuilt from what survives.

**Procedure.** For each candidate number of groups $k$, from 2 to $\min(10, \lfloor m/3 \rfloor)$ *(provisional)* and within the structural limit of R2, and for each of $J$ random splits *(provisional: $J$ = 50)*: split the documents at random into two complementary halves; in each half separately, repeat admission (§2.1) and recompute $R$ under the expectation in use (R2); in each half, group the concepts into $k$ groups as below; record, for every pair of concepts, whether they were placed in the same group. Every random step (splits, shuffles, k-means starts, bootstrap resamples) draws from its own stream, derived deterministically from a declared seed, so that changing one step does not change the draws of another.

**Why only positive eigenvalues.** $R$ is symmetric, so it decomposes into independent patterns of association, $R = \sum_l \lambda_l\, u_l u_l^{\top}$. Because the diagonal of $R$ is zero, the eigenvalues sum to zero, and **the total negative mass always equals the total positive mass**: on the Media Frames benchmark, 44.24 each way. Negative eigenvalues are therefore partly an artefact of excluding the diagonal, not a pure measure of opposition, though they also carry real structure (the strongest negative direction on the benchmark had $\lambda$ = −12.39). The grouping sets that structure aside; the check procedure admits it (B.6), and the opposition table reports opposition between frames (B.4). Some opposition enters the grouping directly, since the positive eigenvectors are bipolar (40–67% of their loadings were negative on the benchmark) and concepts at opposite ends of an attracting direction push into different groups.

**Grouping within a half.** Each concept is placed in the space of the $k - 1$ strongest attracting patterns, and concepts close together in that space are grouped by k-means, with 10 seeded starts and the solution of lowest within-group sum of squares kept *(provisional)*:

$$y_i = \left( \sqrt{\lambda_1}\, u_{1i}, \ \dots, \ \sqrt{\lambda_{k-1}}\, u_{k-1,i} \right), \qquad \lambda_1 \ge \dots \ge \lambda_{k-1} > 0$$

If either half of a split has fewer than $k - 1$ positive eigenvalues, or its expectation cannot be fitted, that split is not used at that $k$. The usable splits number $J_k$; if $J_k < J/2$, that $k$ is **not evaluated** *(provisional)*.

**Consensus.** For each $k$, the consensus between two concepts is the share of half-analyses that put them in the same group, counted only over the half-analyses of usable splits in which both were admitted:

$$C_{ij} = \frac{1}{|\Theta_{ij}|} \sum_{h \in \Theta_{ij}} \mathbf{1}\left[ L_i^{(h)} = L_j^{(h)} \right]$$

$|\Theta_{ij}|$ accompanies each value, so a pair measured over fewer analyses is visibly less precise. A pair never admitted together has no consensus value; it is excluded from PAC and treated as never together in the linkage step *(provisional)*. The groups at $k$ are read off the consensus matrix by average-linkage clustering on $1 - C_{ij}$, cut at $k$ groups (Monti et al., 2003).

**Reproducibility.** For each split, the two halves give two groupings, compared over the concepts admitted in both by the adjusted Rand index (Hubert and Arabie, 1985), which scores 1 for identical groupings and 0 for agreement no better than chance:

$$\overline{A}_k = \frac{1}{J_k} \sum_{t \,\in\, \text{usable splits}} \mathrm{ARI}\left( L^{(t,1)}, L^{(t,2)} \right)$$

reported with a 95% interval from resampling the $J_k$ split values with replacement *(provisional)*. **The interval describes variation across random splits of this corpus, not sampling uncertainty about a wider population of documents.**

**The stability diagram.** The consensus matrix ordered by its groups is the first view's picture again, with a different meaning: a dark block is a set of concepts that fell together in most half-analyses, a faint band a pair that sometimes did, and white a pair that did not. Where the first view showed what one ordering found, the diagram shows what reappeared. In the method's development this was the point at which the blocks matched a careful reading of the corpus by eye, which is the agreement §3 records as a stable result and an interpretive reading each standing on its own warrant.

**What R1 changes.** Candidate frames become groups with a measured reproducibility. Which groups count as frames waits on R4; whether the reproducibility is more than chance produces waits on R5.

### R2 — The expectation: removing frequency and density

**The first view misleads because** its expectation is biased and incomplete. The contingency-table expectation $E_{ij} = r_i r_j / T$ is biased when the diagonal has been removed: it assigns expected mass to a diagonal that was never observed, so each concept's residuals sum to a positive amount that grows with its frequency, $\sum_{j \neq i} (O_{ij} - r_i r_j / T) = r_i^{2}/T > 0$. The third generation used it, and on the Media Frames benchmark each concept's mean residual tracked its prevalence (Spearman $\rho$ = 0.925), reintroducing the frequency effect the residual exists to remove.

Document-level independence does not carry that bias, but it ignores coding density: a concept found mostly in richly coded documents gains associations with everything.

**Three expectations** are therefore specified. Quasi-independence replaces document-level independence as the authors' default; document-level independence and the both-margins model run as sensitivity reruns (B.1). Appendix A gives the rule for choosing among them.

**1. Quasi-independence (the default).** The standard model for a square table with a structurally empty diagonal is quasi-independence (Goodman, 1968; Bishop, Fienberg and Holland, 1975, ch. 5). Each concept receives a weight $a_i$, fitted so that the expected off-diagonal totals equal the observed ones:

$$E_{ij} = a_i a_j \ (i \neq j), \qquad \text{with } \sum_{j \neq i} a_i a_j = r_i \ \text{ for every } i$$

A solution exists when every $r_i < T/2$; otherwise the expectation is undefined for this matrix, and the concept responsible is named. (Inside a half-sample or resample, that half or resample is dropped and counted.) The weights are found by a damped fixed-point iteration from $a_i = r_i/\sqrt{T}$, updating all weights together, until the largest change is below $10^{-10}$ of the largest weight, or 10,000 iterations, whichever comes first *(provisional)*. If it has not converged by then the fit is reported as failed:

$$a_i \leftarrow \sqrt{\, a_i \cdot \frac{r_i}{\sum_{j \neq i} a_j} \,}$$

The undamped update $a_i \leftarrow r_i / \sum_{j \neq i} a_j$ satisfies the same equations at the solution but does not converge: it inverts the overall scale on every step. Under quasi-independence each concept's observed-minus-expected counts sum to zero by construction, and on the benchmark the correlation with prevalence fell to $\rho$ = −0.254. **In plain terms:** quasi-independence asks how often two concepts would meet if each concept's overall sociability were kept but its partners were chosen at random, without ever counting a concept as its own partner.

**2. Document-level independence (rerun, binding on the robust tier).** Concepts appear independently across documents, so

$$E^{\mathrm{doc}}_{ij} = \frac{n_i n_j}{N}$$

In its full form, with the diagonal included ($O_{ii} = n_i$), the matrix $O - E^{\mathrm{doc}}$ equals the cross-product of the centred binary matrix, so analysing it is principal component analysis of the binary data (Louis V2 §4.13). The method itself always excludes the diagonal. Each concept's row of $O$ sums to $r_i = n_i (\bar{\ell}_i - 1)$. Quasi-independence corrects for that coding richness; the document-level expectation does not, so concepts found mostly in richly coded documents gain associations with everything. Quasi-independence, in turn, gives residual structure to a concept present in every document, which carries no co-occurrence information; the support window (R3) excludes such concepts from claims.

**3. The both-margins model (rerun, reported, not binding on the robust tier).** The bipartite configuration model (Saracco et al., 2015; Louis Sanzogni's Model D) keeps **both** each document's number of concepts $\ell_d$ and each concept's number of documents $n_c$, and lets presence otherwise fall at random. Each document has a weight $x_d$ and each concept a weight $y_c$, and

$$p_{dc} = \frac{x_d\, y_c}{1 + x_d\, y_c}, \qquad \sum_c p_{dc} = \ell_d, \quad \sum_d p_{dc} = n_c, \qquad E^{\mathrm{bm}}_{ij} = \sum_{d} p_{di}\, p_{dj} \quad (i \ne j)$$

The weights are the maximum-likelihood estimates of the Rasch model for a binary matrix (Haberman, 1977), which is the same model under another name. It is the only one of the three nulls that controls coding density document by document, which is the difference between kinds of document that a pooled corpus can show (§20, V7).

**What kind of null it is.** The model holds the margins **in expectation**. An exact fixed-margin null holds them **exactly**, by placing equal probability on every binary matrix with the observed margins. In the language of network null models these are the canonical and microcanonical ensembles of the same constraints, and they are not in general equivalent: they agree on large, homogeneous matrices and can differ markedly on small, sparse or strongly uneven ones (Squartini, de Mol, den Hollander and Garlaschelli, 2015). The both-margins model is therefore a tractable approximation to the exact null, not a substitute for it, and the conditions under which the two agree are an empirical question answered by benchmark, not by assertion. Where this specification reports results under the both-margins model, it says so by that name; in the joint programme's code and records the same model is called the *both-margins model*, to keep the contrast with the exact reference in view.

**Cells the margins determine.** Some cells are fixed by the margins alone, and the model must treat them exactly rather than approach them numerically, since a probability of 1 or 0 corresponds to an infinite weight.

1. *Trivial margins.* A document holding every concept ($\ell_d = m$) has $p_{dc} = 1$ for every $c$; one holding none has $p_{dc} = 0$. A concept in every document ($n_c = N$), or in none, likewise. These cells are fixed and removed, and the margins of the remaining **free** documents and concepts are reduced by the cells fixed at 1. Removal can determine further cells, so the step is repeated until a pass changes nothing. **A value determined for a document or concept applies to its free cells only**; a cell already fixed is never revisited.
2. *Forced blocks.* After that reduction, the free margins may still lie on the boundary of the set of margins any binary matrix can realise: a Gale–Ryser inequality holds with equality. When it does, some block of free cells is forced to be all 1 (and the complementary cells all 0) in every matrix with those margins. Such a block is fixed in the same way and the reduction continues. The procedure ends when the free margins lie strictly inside the realisable set, or when no free cell remains.

**Existence and uniqueness.** On free margins strictly inside the realisable set, a finite solution $(x, y)$ exists and is unique (Rinaldo, Petrović and Fienberg, 2013, for the β-model; the bipartite case is the Rasch model). The fixed-point iteration of Saracco et al. (2015), from any positive start, converges to it. **Consequently, once the reduction above is complete, a failure to meet the margins is a fault in an implementation, not a property of the data.** An implementation reports the number of documents and concepts fixed at each step, and the margin error of the fit on the free part.

**When nothing is free.** If the reduction fixes every cell, the margins admit exactly one matrix: the observed one. The exact null and the both-margins model then coincide, $E^{\mathrm{bm}} = O$, every residual under this null is zero, and the report says so: *under the both-margins null, these margins leave no room for departure.* That is a finding about the corpus, not a failure.

**Expected co-occurrence and standardisation.** $E^{\mathrm{bm}}_{ij}$ sums over all documents, fixed cells included, with the diagonal excluded. The residual is standardised by $\sqrt{E}$ as under the other two nulls, so that a comparison between nulls isolates the expectation; the reason, and its cost, are stated under *The standardised residual* below. The model's own variance of a co-occurrence count, $\sum_d p_{di}p_{dj}(1 - p_{di}p_{dj})$, is reported as a diagnostic.

**Inside resampling.** In each half-sample and each bootstrap resample the reduction and the fit are repeated on that sample's margins. A sample on which the free part is wholly determined contributes zero residuals under this null; the count of such samples is reported.

**Standing in v3.0.** The both-margins model is a sensitivity rerun, reported and not binding on the robust tier (§3). It is included because it is the only null that answers the coding-density objection document by document, and it is not binding because its agreement with the exact null has not yet been established across the conditions real corpora present. That benchmark, against an exact fixed-margin reference computed by Monte Carlo and, on small matrices, by enumeration, is work in progress with Louis Sanzogni and is reported in §20 when complete.


**Why $\sqrt{E}$ under every expectation.** The variance of a co-occurrence count is $E_{ij}$ only under a Poisson approximation, and it is exact under none of the three expectations: under the both-margins model it is $\sum_d p_{di}p_{dj}(1 - p_{di}p_{dj})$, which is smaller than $E$ wherever any $p_{di}p_{dj} > 0$; under document-level independence it is hypergeometric in form; Louis V2 uses $E(1 - n_i/N)(1 - n_j/N)$. The authors standardise by $\sqrt{E}$ under all three for one reason: **so that a comparison between expectations isolates the expectation.** If each null carried its own variance, a difference between two runs would mix a change in what was expected with a change in how departures were scaled, and the sensitivity reruns (B.1) could not be read. The price is that residuals under the both-margins model are uniformly smaller in magnitude than its own variance would give; the model's variance accompanies the residuals as a diagnostic (§3) so a reader can rescale. Which variance a certifying method should use is open, and is a question for the exact-margin benchmark (§17).

**Every resampled step refits the expectation in use** — each half-sample (R1), each permutation, each bootstrap resample — so that no step silently substitutes another expectation (§20, V6).


**What R2 changes.** Bands of common concepts disappear from the diagram; blocks that owe their coherence to coding density are tested by the both-margins rerun.

### R3 — Support: the concepts that can carry a claim

**The first view misleads because** rare concepts have inflated residuals and universal concepts carry no information about co-occurrence, yet both take a place in the picture. A concept present in very few documents gives unstable residuals that standardisation inflates; one present in almost every document carries no information about co-occurrence. **No claim is made for a concept outside the window**

$$10 \ \le \ n_i \ \le \ 0.9\,N \qquad \textit{(provisional)}$$

with $n_i$ and $N$ taken from the admitted full corpus under the presence rule in use, recomputed for each sensitivity rerun and not re-decided within samples. Such concepts stay in the matrix, so admission and the margins are unchanged; they are grouped with the rest and listed separately, in their frame or among the unplaced, and they enter no class, no opposition and no contrast. Both failure modes appeared in development: a concept in 7 of 188 documents ranked among the strongest connecting concepts on standardised residuals, and a concept present in all 188 still received residual structure under quasi-independence.

**Unevenness.** The number of concepts each document carries, overall and by population, and any concept found almost entirely (90% or more, *provisional*) in one population, are reported with admission. They bear on R7 and B.8.


**What R3 changes.** Some concepts keep their place in the diagram but lose any claim to a class, an opposition or a contrast.

### R4 — Signal: separating frames from noise

**The first view misleads because** most clustering procedures give every concept a place, so concepts with no real associations are placed in some group, where they blur a frame or are mistaken for one. This step measures each concept's signal before grouping, so that noise can be reported as noise. It is the permutation principle applied one concept at a time: a concept's signal is the size of its residuals, compared with what the same concept shows when its pattern of presence is shuffled across documents, keeping its frequency and destroying its associations. The shuffle is **of that concept alone**; every other column is left as it is, so the test asks what this concept would show in this corpus if it carried no association of its own. For each shuffle, $O$, the fit and $R$ are recomputed under the expectation in use:

$$S_i = \frac{1}{m-1} \sum_{j \neq i} R_{ij}^{2}, \qquad \text{signal if } S_i > \max_{\nu = 1 \ldots U} S_i^{(\nu)}, \quad U = 19$$

With 19 shuffles, beating every one corresponds to a one-sided test at $p \le 0.05$. The score and the verdict are computed for every concept, and so is the share of half-samples (R1) in which each concept counts as signal, since each half is a different dataset.

**Signal is a flag, not a filter.** Every concept stays in the grouping, so that nothing is hidden; a group is a frame only if it holds signal concepts (R1), and a concept in a frame that is not signal is classed *diffuse* (R6). Noise concepts left in lower the reproducibility read against the reference: on a synthetic corpus with 18 planted and 12 noise concepts, none of the uniform-noise concepts passed this test, and reproducibility at the planted $k$ was 0.35–0.37 with them in and 0.81–0.90 over the planted concepts alone (§20, V12). Grouping without them is analysis B.7.

**A known limit.** This is a significance test. On large corpora nearly every concept beats a shuffle: on the Manifesto Project data, with about 2,600 documents per half, it flagged nothing. Its power also depends on the expectation: on one synthetic corpus, 17 of 18 planted concepts passed under document-level independence and 8 of 18 under the both-margins model (§20). An effect-size form that keeps its meaning at large $N$ is not yet designed (§17).


**Which groups are frames.** Every concept is grouped, because that is how reproducibility is measured; not every group is a frame. **A group is a frame only if it holds at least two concepts that count as signal (R4) and lie inside the support window (R3)** *(provisional)*. The concepts of any other group are **unplaced**: they belong to no frame and enter no frame-level claim. The test rests on signal, decided before grouping, not on the classes of R6, computed from the frames. The number of frames $K_F$ is reported beside the number of groups $k$. On synthetic corpora with three planted frames and twelve noise concepts, the recommended number of groups ranged from 4 to 10 while the three frames were recovered exactly every time; what varied was how finely the noise was cut (§20, V14). If the chosen $k$ yields no frame, no frame was found, and every result is descriptive.


**What R4 changes.** Noise groups become **unplaced**; a block is a frame only if it holds signal.

### R5 — The references: how far from chance

**The first view misleads because** it gives no way to tell how far the picture stands from what no association at all would produce. Two quantities are read against references computed by permuting the corpus itself (§3): the spread of the residuals, and the reproducibility of the grouping.

**The strength reference.** If the residuals are uniformly small (*blur*) or uniformly large (*blob*), there is little to group. Both collapse the spread of the residuals:

$$\mathrm{spread} = \operatorname{sd}\{R_{ij}\}_{i<j}$$

**The spread is reported beside a reference computed from the corpus itself.** Each concept's presences are shuffled independently across documents, which keeps every concept's frequency and destroys every association; the expectation in use is refitted on the shuffled matrix and the spread recomputed. Over $P$ such permutations *(provisional: $P$ = 49)* the reference $s^{*}$ is the 95th percentile of the shuffled spreads, reported with an interval from the permutation sample. **A spread at or above $s^{*}$ is one that a corpus with these frequencies and no association reaches less than 5% of the time** (§3). The same shuffle serves every expectation in this version; a shuffle that also holds document totals fixed is the better match for the both-margins model and is v4.0 work (§17).

**A spread below $s^{*}$ is a finding, not a stop.** Every grouping result that follows stays at the descriptive tier (§3). The authors do not treat it as a gate because, applied as one in the synthetic test, a threshold of this kind discarded nearly all planted structure (§20, V17): a researcher should see that, not be shielded from the grouping it would have hidden. Which case a low spread is, blur or blob, is read from the **pair density**, the mean share of documents in which a pair of concepts co-occurs: a blob sits near 1 and blur well below it; the cut is 0.5 *(provisional)*. The mean residual cannot make this distinction under quasi-independence, because each concept's residuals sum to zero by construction.

**Validation of the reference.** On 400 synthetic corpora of 180 documents and 30 concepts with no planted structure, the 95th percentile of the spread under each expectation and presence rule was 0.71–0.92, nearly invariant to size between 100 and 300 documents and 15 and 90 concepts (§20, V10). Those values validate the permutation procedure; they are not the reference for any particular corpus.

**Strongest pairs.** The share of concept pairs with a positive standardised residual of at least 2, and the strongest pair with its value *(provisional: 2)*, accompany the spread as diagnostics.

Because the diagonal is zero, the eigenvalues of $R$ sum to zero, so half the spectrum's mass is negative by construction (R1). The effective number of **attracting** dimensions is therefore computed from the positive eigenvalues only, as a participation ratio:

$$d_{\mathrm{eff}} = \frac{1}{\sum_{l : \lambda_l > 0} p_l^{2}}, \qquad p_l = \frac{\lambda_l}{\sum_{l' : \lambda_{l'} > 0} \lambda_{l'}}$$

$d_{\mathrm{eff}}$ is a diagnostic. With $K$ well-separated frames it comes out just below $K - 1$ (1.98 for three frames, 4.91 for six, in simulation), so any test of $k$ against it excludes the true $k$ precisely when the structure is cleanest. The only limit on $k$ from the spectrum is structural: grouping into $k$ frames needs $k - 1$ attracting directions, so a partition is evaluated only if $k \le d_{+} + 1$, where $d_{+}$ is the number of positive eigenvalues, counting an eigenvalue as positive only when it exceeds $10^{-9}$ of the largest *(provisional)*. If $R$ has no positive eigenvalue there is nothing to group. Which $k$ the data support is decided by reproducibility (R1), not by the spectrum.


**The reproducibility reference.** On each of the $P$ permuted matrices of the strength reference above, the grouping of R1 is run, and $\tau_{\mathrm{rel}}$ is the 95th percentile of the best reproducibility over $k$ that a corpus with these frequencies and no association produces, with its interval. A reproducibility at or above $\tau_{\mathrm{rel}}$, with a spread at or above $s^{*}$, is one that only a small fraction of such corpora reach. The values are low because chance agreement is low, not because the reference is lenient: the adjusted Rand index is corrected for chance, and on synthetic no-structure corpora the best reproducibility over $k$ never exceeded 0.19 in 2,400 runs, with 95th percentiles of 0.05–0.07 (§20, V11); a cleanly planted three-frame structure reached 0.35–0.37 at its planted $k$ (§20, V12).

**The number of groups.** The recommended $k$ is the most reproducible among the evaluated $k$, ties to the smaller:

$$\hat{k} = \arg\max_{k \text{ evaluated}} \overline{A}_k$$

Every evaluated $k$ is shown beside the reference. The proportion of ambiguous clustering (PAC; Şenbabaoğlu, Michailidis and Li, 2014), the share of pairs with a consensus value between 0.1 and 0.9 *(provisional)*, is computed for every $k$ as a diagnostic; it does not choose, because it falls as $k$ rises almost by construction and on no-structure corpora picked the top of the range in 83–99.5% of runs (§20, V13). On corpora carrying noise concepts a recommended $k$ above the planted number can be correct, since the extra groups hold the noise. A researcher may take a neighbouring $k$, reported as their choice beside the recommended one; Appendix A gives the rule the authors use.

**Below the reference.** If no evaluated $k$ reaches $\tau_{\mathrm{rel}}$, no grouping of this corpus reproduced better than corpora with these frequencies and no association do 5% of the time. That is the run's first finding; the analysis continues at the recommended $k$, every grouping result is descriptive (§3), and the finding is not evidence that the corpus has no structure.

**Conditions reported at the chosen $k$** *(provisional values)*: two frames only; the reproducibility interval containing the reference; frames tracking concept prevalence ($\eta^2$ of prevalence across frames at or above 0.5); and, where B.6 has been run, disagreement between the two grouping procedures.


**What R5 changes.** Each value is read against what rearrangement produces. A frame at the chosen $k$ whose spread and reproducibility both reach their references is **stable** (§3); one that does not is descriptive. Neither is certified.

### R6 — Classes: the inside of a frame

**The first view misleads because** a block is read as a list of equals. The consensus matrix carries more than the frames. Ordered by frame, it shows solid blocks on the diagonal and fainter bands across it: a tartan. A concept with no colour outside its own block belongs only to its frame; one with a band towards another block is repeatedly drawn towards that frame. For a concept $i$ in frame $F(i)$, with other frames $G$:

$$\mathrm{own}_i = \operatorname*{mean}_{j \in F(i),\, j \neq i} C_{ij}, \qquad \mathrm{pull}_i(G) = \operatorname*{mean}_{j \in G} C_{ij}, \qquad g_i = \arg\max_{G \neq F(i)} \mathrm{pull}_i(G)$$

$$\kappa_i = \frac{\mathrm{pull}_i(g_i)}{\sum_{G \neq F(i)} \mathrm{pull}_i(G)}, \qquad \beta_i = \frac{\min\left(\mathrm{own}_i, \mathrm{pull}_i(g_i)\right)}{\max\left(\mathrm{own}_i, \mathrm{pull}_i(g_i)\right)}, \qquad \overline{R}_i = \operatorname*{mean}_{j \in g_i} R_{ij}$$

$\kappa_i$ says whether the pull is aimed at one other frame; $\beta_i$, adapted from Louis V2's balance measure, says how evenly the concept is held between its own frame and that one. Pull and target are computed against frames only; means over pairs with no consensus value skip those pairs.

**The measures are the result; the classes are labels.** Every value above is computed for every concept. Each concept then takes one class, by the rules below in order, at cut-offs the authors use *(provisional)*; a reader may apply other cut-offs to the reported values, and a **class-sensitivity count** accompanies the classes: how many concepts change class when each cut-off moves by 0.05.

| Order | Class | Rule | Reading |
|---|---|---|---|
| 0 | **Outside support** | outside the support window (R3) | Listed with its frame or among the unplaced; no class claimed |
| 1 | **Unplaced** | in a group that is not a frame (R1) | Belongs to no frame; reported with its signal score |
| 2 | **Diffuse** | in a frame, but not signal (R4) | Weakly placed; possibly noise |
| 3 | **Distinguishing** | $\mathrm{own}_i \ge 0.5$, and pull to every other frame below 0.10 | Distinguishes its frame |
| 4 | **Bridging candidate** | pull ≥ 0.10, concentrated on one frame ($\kappa_i$ ≥ 0.6), with positive residual to it ($\overline{R}_i > 0$) | Held between two frames; likely to move at finer granularity |
| 5 | **Diffuse** | any other concept | Weakly placed; possibly noise |

Where the check procedure (B.6) has been run, a further class, **method-contingent**, is assigned before order 3 to concepts the two procedures place differently. With two frames, each has only one other, $\kappa_i$ = 1 and the concentration test does no work; a bridging candidate then rests on pull and residual sign, and the signal test at order 2 keeps noise concepts out of the class. $\beta_i$ is undefined when both its terms are zero. In development on the Manifesto Project data from 2000 onward, bridging candidates at $k$ = 4 changed frame at $k$ = 5 about ten times as often as distinguishing concepts (23% against 2%); that corpus is compositional, so the figure is development history.

*Distinguishing* and *bridging candidate* are the third generation's words (v2.5) applied to the fourth generation's measures; the third generation's own measures do not return (§18). **A bridging candidate is a placement read from the consensus, not a structural bridge.** A bridge in the sense of Louis V2 and V3, a concept positively associated with both poles of an opposition axis, is v4.0 work (§17). Louis V2's harmonic bridging score, which is computed from the same residuals, does not accompany bridging candidates in v3.0: it belongs to the structural sense of a bridge, which is v4.0 work. What a bridging candidate's co-occurrence means is settled only by reading the documents (B.3).


**What R6 changes.** Each frame gains an inside: the concepts that distinguish it, the candidates to bridge it to another, and those weakly held.

### R7 — Populations: who voices what

**The first view misleads because** it pools every population of text in the corpus, so that a difference between populations can appear as a frame, and a frame's distribution across them is invisible. A coded corpus is rarely one population. It holds submissions from different stakeholders, manifestos from different parties and decades, articles from different outlets, documents of different kinds. Which of them carries which frame is one of the findings the method exists to produce, and it is where the quantitative structure is handed back to the qualitative reading: the method identifies resonance and dissonance *within and between* populations of text. A population is defined by a covariate in $Z$ (§1.1).

For frame $F$ and document $d$, the frame's share in the document is

$$\varphi_F(d) = \frac{1}{|F|} \sum_{c \in F} b_{dc}$$

Averaged within each value or band of a covariate, it shows how a frame's presence changes across the corpus's populations: by sector, by year, by party family. For a numeric or binary covariate the Pearson correlation between $\varphi_F$ and the covariate, and for a categorical one the correlation ratio $\eta$, measure how strongly a frame's presence tracks a population. **A large value is a finding about who voices the frame.**

**Two readings of a strong association.** A frame whose share tracks a population closely is either a frame that population voices, which is the ordinary case, or a frame that exists because the population is in the corpus: the grouping has separated kinds of document rather than configurations of meaning, because consensus clustering averages over every document. The pooled analysis cannot tell these apart. The analyses that can are the comparison of populations analysed apart (B.8) and the configuration table by population (B.9).

**One caution.** When populations are coded at different depths, as a corpus pooling literature, interviews and survey responses was (§20, V7), a grouping can separate them by coding density rather than by what they say. That is not a reason to exclude anything; it is the case for the expectation that controls density document by document, the both-margins model (R2), whose rerun is read with particular care on such a corpus, and for reporting each population's mean number of concepts per document beside its frame shares.

On compositional data the frame shares carry no compositional caution, because they are functions of each document's own row rather than associations between concepts, with the one limit stated in Appendix A, §A.3. Unplaced concepts belong to no frame and have no share.

**Naming.** Frames are named by the researcher; the default is Frame A, B, C. The name is interpretation, recorded beside the frame's distinguishing concepts and bridging candidates, its shares across the populations, and any external measure the researcher supplies.


**What R7 changes.** Who voices which frame appears beside the frames, and the question whether a frame belongs to the corpus or to a population in it is put to B.8.

## 2.3 What the refinements add, in one table

| | The view before it can mislead because… | Refinement | What changes in the picture |
|---|---|---|---|
| R1 | any ordering of any matrix shows blocks | split-half consensus; reproducibility | candidate blocks become groups with a measured reproducibility |
| R2 | the simplest expectation is biased towards common concepts and ignores coding density | quasi-independence as the default; the both-margins model as a rerun | frequency bands disappear; density-driven blocks are tested |
| R3 | rare concepts are inflated and universal ones carry nothing | the support window | some concepts lose their claim to a class |
| R4 | noise concepts take a place in some block | the signal test; the frame test | noise groups become unplaced; a group is a frame only if it holds signal |
| R5 | there is no way to tell how far the picture stands from chance | permutation references for spread and reproducibility | each value is read against what no association produces; stable is defined |
| R6 | a block is read as a list of equals | the classes | the block gains an inside |
| R7 | the picture pools every population | frame shares by population; populations compared | who voices what appears |

The first view can be produced with a spreadsheet. From R1 the method needs computation, and the refinements are what the computation adds.

# 3. Reporting a result

**References.** Two quantities are read against references computed by permutation of the corpus itself: the spread of the residuals (R2) and the reproducibility of the grouping (R1). A reference is the 95th percentile of the statistic over $P$ rearrangements that keep every concept's frequency and destroy every association, and it is reported with its own interval. A value at or above its reference is one that a corpus with these frequencies and no association reaches less than 5% of the time. **A reference is never applied as a gate.** A value below it is a finding about the corpus, and the analysis continues with its results at the descriptive tier.

**Tiers.** Every result is reported in the tier its warrant supports. No result is certified.

| Tier | What it contains | Warrant |
|---|---|---|
| **Descriptive** | Everything the method computes: residuals, the groupings at every evaluated $k$, frames, classes, frame shares across populations, configurations, contrast estimates | True of this corpus, under the stated matrix, presence rule and expectation |
| **Stable** | Frames at the chosen $k$, and their classes, when both the spread and the reproducibility at that $k$ reach their references; for B.7, additionally a stable signal set; pairwise contrasts whose bootstrap interval excludes zero (B.2) | Reproducibility across random halves of this corpus, with its interval, beside the permutation reference; for contrasts, the bootstrap interval |
| **Robust** | Stable results that hold under both binding sensitivity reruns (B.1) | Agreement under each rerun; agreement under the non-binding both-margins rerun reported beside it |
| **Interpretive** | Frame names; the reading of each bridging candidate (B.3); the opposition table (B.4); nesting (B.5); the reading of a population's frames (R7, B.8); novel configurations (B.9); any reading made by eye from the residual or consensus matrix | The researcher's, recorded, beside the measures that bear on it |
| **Limits** | Exclusions; concepts outside the support window; unplaced concepts; results below a reference; results that change under a rerun; reruns *not tested*; projections that fail the fit check (B.9); the compositional caution | Reason stated |

**Confirmatory or exploratory**, beside the tier. A contrast stated with the matrix (§1.1), and a Part B analysis declared with it, is **confirmatory**. A contrast or analysis chosen after results were seen, and any result that depends on a departure from a default made after results, is **exploratory**. The label says when the question was asked; the tier says what supports the answer. A stable, robust, exploratory contrast is a strong lead, not a test.

**What the tiers do not say.** *Stable* means a grouping reproduced better than no association does at this size. *Robust* means it did so again when the presence rule or the expectation was changed. Neither means the grouping is a frame of meaning; that is the researcher's reading, at the interpretive tier.

**Three records accompany every analysis the authors publish** (§14): the **decision log**, each judgement the researcher made and the evidence shown before it; the **run history**, every analysis run, numbered, including every Part B analysis and every return to an earlier step; and the **parameter record**, every provisional value in force, every permutation, shuffle, split and bootstrap count, every seed and its derivation, and the versions of the specification and of whatever ran it. Together they make a result reproducible and its path auditable, and they are what would let a result reported under this version be raised to a certifying standard without being redone.

# Part B — Optional analyses

Each analysis in this part answers one named question about the frames Part A produced, states what it can change, and says when the authors declare it. None is required to see the frames. **An analysis declared before results are seen keeps the standing of a planned test; one chosen afterwards is reported as exploratory** (§2, §3). The authors run B.1 on every corpus they publish from, B.3 for every bridging candidate they discuss, and the rest as the question arises; Appendix A gives their rules.

## B.1 — Sensitivity reruns

**Question:** does a result depend on the presence rule, or on the expectation?

**What it does.** The whole of Part A is repeated three times, each rerun named for the one thing it varies:

| Rerun | Varies | Binds the robust tier |
|---|---|---|
| Any mention | the presence rule (§1) | yes |
| Document-level independence | the expectation (R2) | yes |
| The both-margins model | the expectation (R2) | **no**: reported only, until its agreement with an exact fixed-margin null is established (§17) |

Each rerun keeps the researcher's judgements from the default run: scope, the chosen $k$, and the pairs tested; it also reports the $k$ it would itself recommend. **Each rerun is read against references computed for its own expectation and rule**, and **refits its own expectation in every half-sample, permutation and resample**: until that was enforced, every rerun under another expectation silently refitted quasi-independence inside its resamples and repeated the default analysis exactly (§20, V6). Frames are matched between runs by greatest overlap (the assignment maximising total Jaccard similarity). Unplaced concepts are not matched; the report lists concepts unplaced in one run and in a frame in the other. For each rerun the result includes the adjusted Rand index between the two sets of frames, the concepts that change frame or class, the changes to the opposition table if B.4 was run, and the pairwise intervals if B.2 was run.

**Reruns below the reference, or stopped.** A rerun whose reproducibility falls below its reference continues, as the default does, with its own recommended $k$; that is placed under *Limits*, and claims are compared against it as usual. A rerun that **stops** has tested nothing: its claims are recorded as **not tested** by it, never as failing it. Presence data has no second presence rule, and this is stated the same way.

**What "holds" means.** A frame holds if its matched frame shares at least half its members. A bridging candidate holds if it is a bridging candidate again, towards the matched target frame. An opposition holds if the matched pair passes the opposition rule again; **each opposed pair is a claim**, carried in the claims table with its tier and the rerun it fails, if any. A pairwise contrast holds if its interval again excludes zero on the same side.


**What it can change.** A stable result that holds under both binding reruns is **robust** (§3). A result that holds under one approach only is not wrong; it depends on an assumption, and the report names it (Appendix A, §A.4).

**When the authors declare it.** Always, on any corpus they publish from. The reruns run regardless of the primary choices, which is what lets a reader see both.

## B.2 — Pairwise contrasts

**Question:** is a specific relationship reliable, even where the frames as a whole are uncertain?

Some findings concern two concepts or two small groups, not the whole partition: for example, that environmental concepts sit closer to economic concepts than to social-justice ones. A partition-level test has little power for such claims. This stage estimates the specific association directly and states its uncertainty, by resampling documents with replacement (the bootstrap; Efron and Tibshirani, 1993). In each of $B$ resamples *(provisional: $B$ = 2,000)*, admission, the fit under the expectation in use and $R$ are recomputed, giving replicates $\Delta^{(b)}$ of the contrast between pair sets $\mathcal{P}$ and $\mathcal{Q}$; $q_{0.025}$ and $q_{0.975}$ are their 2.5th and 97.5th percentiles:

$$\Delta = \operatorname*{mean}_{(i,j) \in \mathcal{P}} R_{ij} \; - \operatorname*{mean}_{(i,j) \in \mathcal{Q}} R_{ij}, \qquad \mathrm{CI}_{95} = \left[\, q_{0.025}\big(\Delta^{(b)}\big), \ q_{0.975}\big(\Delta^{(b)}\big) \,\right]$$

The result includes the estimate, its interval, and the number of documents carrying the concepts involved. Concepts outside the R3 support window cannot enter a pair.

**Which pairs.** The hypotheses stated with the matrix (§1.1) are reported as **confirmatory**. Any pair chosen after seeing results is **exploratory**. With many pairs, some intervals exclude zero by chance, and the report states how many would be expected. In development on the Food Sustainability Practice corpus, a hypothesised contrast rested on 4–6 documents and its interval spanned about ±0.8: a statement of what the data cannot settle, not a refutation.

**What it can change.** A contrast whose interval excludes zero is *stable* (§3), and *robust* if it does so again under both binding reruns; its label, confirmatory or exploratory, says when the question was asked.

**When the authors declare it.** At §1, as hypotheses, for every contrast they intend to report as a test.

## B.3 — Reading a bridging candidate

**Question:** what does this co-occurrence mean?

Co-occurrence is not agreement (§3). For each bridging candidate, the authors read the documents in which it co-occurs with members of both frames, and **record** which of four readings holds (Louis V3 §5.24): *shared priority*, *distinct framings of the same problem*, *explicit disagreement*, or *co-mention only*. The claims table shows the recorded reading, or *not yet read*. Every bridging candidate the researcher intends to discuss in a publication is read in this way.

**What it can change.** Nothing computed; it puts an **interpretive** reading on the record beside the measures (§3), which is what lets a reader see how a bridging candidate was understood.

**When the authors declare it.** For every bridging candidate they discuss in a publication, before the discussion is written.

## B.4 — Opposition between frames

**Question:** which frames avoid each other more than they avoid the rest?

 Under quasi-independence each concept's raw residuals sum to zero, and frames are built from positive residuals within them. So the co-occurrence *between* frames is necessarily below expectation in aggregate. A negative between-frame residual is partly forced, and on its own it is not evidence of opposition. The informative question is **where** each frame's shortfall falls: which other frame does it avoid more than expected? For each ordered pair of frames, over concepts inside the support window:

$$D_{FG} = \sum_{i \in F,\ j \in G} \left( O_{ij} - E_{ij} \right), \qquad \delta_{FG} = \frac{D_{FG}}{\sum_{i \in F,\ j \in G} E_{ij}}, \qquad \Delta_{FG} = \delta_{FG} - \operatorname*{mean}_{G' \neq F,\, G} \delta_{FG'}$$

$\delta_{FG}$ is the shortfall as a share of the co-occurrence expected between $F$ and $G$: −0.2 means 20% fewer co-occurrences than expected. **$F$ and $G$ are reported as opposed when the 95% bootstrap interval of the difference $\Delta_{FG}$ lies wholly below zero**, with frames held fixed and $O$, $E$ recomputed under the run's null in each of $B$ resamples (interval settings provisional). In words: $F$ avoids $G$ more than it avoids the other frames. Bootstrapping the difference directly accounts for the uncertainty in the comparison mean as well as in $\delta_{FG}$. Each verdict is reported with its margin, because on the development corpora several fell within 0.003 of the boundary. A pair can be opposed from $F$ and not from $G$, since each verdict is relative to its own frame's mean; the report shows each unordered pair once, with both directional verdicts. With $K_F(K_F-1)$ ordered pairs, some will pass by chance, and the report states how many would be expected. **With fewer than three frames there is no comparison to make, so no opposition is reported.** The table is interpretive (§3). Frames and the opposition table are two readings of the same association matrix and are never presented as confirming each other. A single opposition axis running across frames, and concepts bridging its poles, are v4.0 work (§17, F5).

**What it can change.** An interpretive table; each opposed pair is a claim that B.1 can show to hold or not.

**When the authors declare it.** When three or more frames are found and the researcher intends to discuss the relations between them.

## B.5 — Nesting across $k$

**Question:** which frames divide as granularity increases?

Comparing the frames at $k$ with those at $k + 1$ shows which frame divides as granularity increases. Where $k$ is the largest evaluated, the comparison is with $k - 1$, and this is stated. A frame that holds across the comparison is robust to granularity; one that divides marks where finer structure lies.

**What it can change.** An interpretive reading of where finer structure lies; it is the authors' first check when the recommended $k$ does not stand clear of its neighbours (Appendix A).

**When the authors declare it.** Whenever a neighbouring $k$ is chosen, and otherwise as the question arises.

## B.6 — The check procedure

**Question:** does a concept's placement depend on whether opposition is allowed to shape the grouping?

The whole R1 ensemble is run again with a second grouping procedure: principal component analysis of the rows of $R$ (columns centred), keeping $k - 1$ components, then k-means *(provisional)*. It is G3's first panel procedure (B1), kept as a check. It is not the same analysis done another way. PCA on the rows effectively ranks directions by $|\lambda|$, so it admits repulsion directions where the main procedure admits only attraction: on the benchmark its second axis matched the eigenvector with $\lambda$ = −12.39. Concepts placed differently by the two procedures are therefore concepts whose placement depends on whether opposition is allowed to shape the grouping. They are classed **method-contingent** at R6, and a condition is recorded at the chosen $k$ when the two procedures' partitions agree below an adjusted Rand index of 0.5 *(provisional)*. The check procedure never decides the frames.


**What it can change.** The method-contingent class, and one caution. Nothing else.

**When the authors declare it.** On every corpus they publish from; it is cheap and it names the concepts whose placement is an artefact of one procedure.

## B.7 — Grouping without low-signal concepts

**Question:** what do the frames look like with the noise removed before grouping?

In Part A every concept stays in the grouping and R6 classes the low-signal ones as diffuse. In this analysis exclusion is applied once, on the full corpus, before R1, and the excluded concepts are not re-admitted within half-samples. Exclusion applies the rule above, as a rule and never by picking concepts by hand, and excluded concepts are reported as a finding. In development on the Food Security Inquiry corpus, removing low-signal concepts raised reproducibility by 0.15–0.20, while removing the same number of concepts at random lowered it.

**The signal set must itself be stable.** Frames from this analysis reach the stable tier only if the signal sets of the two halves agree, with mean Jaccard similarity across splits of at least 0.8 *(provisional)*; otherwise the exclusion itself is unstable and the result is placed under *Limits*.

**What it can change.** A second grouping, reported beside the first, with the excluded set as a finding about the typology's fit. It does not replace the Part A grouping.

**When the authors declare it.** Before results, where the typology is known to carry many concepts coded in passing; after results, as exploratory, when a third or more of concepts fail the signal test (Appendix A).

## B.8 — Populations compared

**Question:** do different populations of text carry different frames, and is a frame that tracks a population (R7) voiced by it or made by it?

**What it does.** For a categorical covariate whose populations each meet the minimum corpus (§2.1), the whole of Part A is run on each population alone, and the frame sets are compared with each other and with the pooled run, by greatest-overlap matching and the adjusted Rand index (B.1 gives the matching rule). The result includes, for each pair of populations and for each population against the pooled run:

- **shared frames**: frames found in both, with at least half their members in common;
- **frames distinct to one population**;
- **oppositions in the pooled run that resolve into two populations**: a pair of frames the pooled run reports as opposed (B.4) whose members are, in the stratified runs, voiced by different populations. The pooled analysis averaged over the populations and reported their difference as dissonance between concepts;
- each population's reproducibility against its own reference, which answers whether a population is large and coherent enough to show frames of its own;
- each population's coding density, so that a difference in depth of coding is visible beside a difference in frames.

**What it can change.** It settles the question R7 leaves open. A frame found inside a population analysed alone is a frame that population voices. A frame that appears only in the pooled run, and whose members divide between populations in the stratified runs, is a frame that exists because the populations were pooled; it is reported as a *between-population* structure, which is itself a finding, and not as a frame of meaning within any of them. Nothing is excluded and no scope is narrowed: the pooled and stratified runs are reported together.

**When the authors declare it.** Before results, for any covariate they intend to discuss; and after an R7 association reaches $\eta \ge 0.5$ *(provisional)*, in which case the claims that depend on it are exploratory.

**Where populations are too small to analyse alone**, the configuration table by population (B.9) is the available view, and this is stated.

## B.9 — Placing documents against frames

**Question:** given the frames of an analysed corpus, which frames does a document carry, which does it most resemble, and is its configuration one the corpus has seen before? The document may belong to the analysed corpus or be new material coded against the same typology.

**What this is.** Part A finds the frames. This analysis uses them. Once a corpus has been analysed, each frame has a **profile**: the concepts that distinguish it. A document coded against the same typology can be read against those profiles directly, without any further analysis of the corpus it came from. Read this way, the sorted residual matrix is a truth table: the blocks on its diagonal are the frames, each block's distinguishing concepts are the columns of the table, and a document's row of presences answers, for each frame, whether the document carries it. This was the method's original use (§18); its mathematics is elementary, and its limits are the point of this section.

**The profile.** For each frame $F$ at the chosen $k$, the profile is its set of **distinguishing** concepts inside the support window, $D_F$ (R6). Bridging candidates are not in any profile; they lie between frames by definition, and are reported separately. A profile is stated with the analysis it came from: the typology, the declaration and binarisation rule, the chosen $k$, and the run's identifier, because a profile read against a different declaration is a different test.

**Presence of a frame in a document.** For document $d$ with binarised row $b_d$, under the same declaration and rule as the analysis:

$$\varphi_F(d) = \frac{1}{|D_F|} \sum_{c \in D_F} b_{dc}$$

the share of the frame's distinguishing concepts the document carries. **A frame is present in a document when at least half of its distinguishing concepts are present**, $\varphi_F(d) \ge \tfrac{1}{2}$ *(provisional)*. A weighted form, $\sum_{c \in F} \mathrm{own}_c\, b_{dc} / \sum_{c \in F} \mathrm{own}_c$ over all the frame's concepts inside the window, is reported beside it; the two will usually agree, and where they do not the document sits near the frame's edge.

**A document's configuration.** The set of frames present in a document is its **configuration**, $\mathcal{C}(d) = \{F : \varphi_F(d) \ge \tfrac{1}{2}\}$. **Documents are not sorted into one frame each.** Most documents in a corpus carry more than one frame, and the recurring combinations are the dominant positions of the discourse: in the original study, most texts carried frames 1 and 2, or 1, 3 and 4, and few carried 2 with 5. The analysis therefore reports:

1. for every document, $\varphi_F(d)$ for every frame, and its configuration;
2. the **configuration table**: every configuration that occurs, with the number of documents carrying it, in descending order. This is the corpus's truth table;
3. for a document whose highest $\varphi$ clears the second-highest by at least 0.25 *(provisional)*, the frame it **most resembles**; otherwise it is reported as **held between** its leading frames. Resemblance is a reading aid; the configuration is the result;
4. **novel documents**: a document with an empty configuration, or one whose configuration occurs in fewer than three documents of the analysed corpus *(provisional)*, is reported as novel, with its Hamming distance to the nearest frame profile and to the nearest configuration the corpus has seen. A novel document is an outlier, or the first member of a configuration the frames do not yet describe. The analysis does not decide which.

**Two uses, two warrants.**

*Within the analysed corpus*, placement is **descriptive**. It sorts the documents that produced the frames, and its warrant is the frames' own: the tier each frame reached (§3) travels with every placement that uses it. A profile is as stable as its distinguishing concepts; the class-sensitivity line (R6) says how many would change class if the cut-offs moved, and a profile built on brittle classes is reported as such.

*On material the analysis never saw*, placement is a **projection**. The frames are held fixed and new documents are read against them. This is the rapid sorting the method was first built for: an existing analysis applied to new material without re-analysis, at the cost of one Hamming calculation per document. It is also where the method's principle of warrant (§3) bites hardest. Split-half stability was measured in the corpus that produced the frames; **nothing in a projection tests whether the frames hold in the new material.** So:

- every projected result is labelled **projected onto the frames of** the source analysis, by its identifier;
- the new material must be coded under the same typology *and the same coding protocol*; a change in how coders apply the typology changes what presence means, and the projection with it. The report states the coding protocol of each;
- a **fit check** runs on the projected material and is reported before any placement is read: the share of documents with an empty configuration; the share held between frames; any frame present in fewer than 5% of documents *(provisional)*; and the share of documents in configurations the source corpus never produced. High values on any of these say the frames, or the typology, do not fit this material. This is stated, and placement is then placed under *Limits*;
- claims about what a novel configuration in projected material *means* are **interpretive**. Where the projected material is large enough to analyse in its own right, it is analysed, and the two frame sets are compared: that is replication (§3), and the only route to a claim that a frame generalises.

**By population.** R7 gives each frame's share across a covariate. Placement adds the configuration view: how the dominant configurations differ between populations, and which configurations are distinct to one. Where populations are too small to analyse alone (B.8), this is the available comparison. On compositional data it carries the limit stated at R7: a rise in one frame and a fall in another are one finding.

**What this analysis does not claim.** That the frames are exhaustive: a document can carry none. That they are exclusive: most carry several. That a frame absent from projected material is absent from that discourse: the typology may not reach it. That placement is a classifier with a known error rate: it is a reading of a document against profiles whose warrant is the source analysis's, and the fit check is its only safeguard in new material.

**A profile is a reusable artefact.** The set of profiles from an analysis, with the typology, the declaration, the chosen $k$ and the source identifier, is sufficient for anyone to place documents against those frames. It can be published with the analysis, and it is what makes the analysis usable on later material. 

**Lineage.** The truth-table reading predates the fourth generation's mathematics; it was the method's first form and shaped the revision that produced v2.5. What the fourth generation adds is the warrant: the frames a profile is built from now carry a measured reproducibility and a stated tier, and the profile inherits them.

**What it can change.** Within the analysed corpus, a descriptive sorting of documents and the configuration table. On new material, a projection, labelled as such, with its fit check. Neither changes a frame's tier.

**When the authors declare it.** Within the corpus, as part of reading the frames. On new material, before the material is read, with the coding protocol stated.

# Part C — Diagnostics, records, evidence and limits

# 13. Diagnostics

Diagnostics are computed on every run and reported in full, for the reviewer and the method record rather than for the first reading. None gates, and none enters a tier. Each is named with the stage it belongs to and the question it answers.

| Diagnostic | Stage | What it tells a reader |
|---|---|---|
| Counts of blank, short and non-numeric cells, per column and in total | 1 | What was in the data before any cell was read as a value |
| Proposed roles, single-select groups by name and by value, and the researcher's confirmations | 1 | How the matrix was declared |
| Row-sum constancy (coefficient of variation of document totals); the share of the strongest negative residuals that fall between the largest categories | 1, 3 | The signature of compositional closure (Appendix A, §A.3) |
| Exclusions by rule and pass; concepts outside the support window; unevenness by covariate group | 2 | How well the typology fits the corpus |
| Spread beside its permutation reference, with the reference's interval; pair density when below | 3 | Whether there is more to group than noise produces, and if not, which failure it is |
| The share of pairs with $R \ge 2$, and the strongest pair | 3 | The strength of the strongest attractions, reported never gated |
| $d_{\mathrm{eff}}$, the effective number of attracting dimensions, from positive eigenvalues; $d_{+}$ | 3 | A structural limit on $k$; with $K$ clean frames it sits just below $K - 1$ |
| The both-margins model's own variance; counts of documents and concepts fixed by the reduction; margin error on the free part | 3 | What that expectation did, and how far its residuals would move under its own variance |
| Signal score and verdict per concept; share of half-samples in which each is signal | 4 | Which concepts carry association, and how stably |
| Reproducibility by $k$ with intervals, beside the reference; $J_k$ usable splits; PAC by $k$ | 5 | The reproducibility profile, and where the recommended $k$ sits in it |
| The cautions at the chosen $k$ | 5 | What to read before accepting the frames |
| Pearson $r$ and $\eta$ between each frame's share and each covariate; coding density by population | 6 | How strongly each frame tracks each population, and whether depth of coding differs |
| own, pull, target, $\kappa$, $\beta$, $\overline{R}$ for every concept; the class-sensitivity line | 7 | The measures behind every class, and how brittle the labels are |
| Agreement under each rerun; concepts and frames that moved | B.1 | What depends on a choice the method made |
| Permutation count $P$, bootstrap count $B$, shuffle count $U$, splits $J$; every seed and its derivation | all | What a reader needs to reproduce the run exactly |

# 14. Records, and reporting an analysis

**Three records travel with every analysis the authors publish.** They are what make a result reproducible and its path auditable, and they are the method's answer to the garden of forking paths (Simmons, Nelson and Simonsohn, 2011).

- **The decision log:** each judgement the researcher made (§2), and the evidence shown before it was made.
- **The run history:** every analysis run, numbered, including returns to earlier stages and every Part B analysis, so that a reader can see how many paths were tried and in what order.
- **The parameter record:** every provisional value in force, every permutation and bootstrap count, every random seed and its derivation, the specification version, and the identifier of the software or script that ran the analysis.

**What a report of a CorRes v3.0 analysis contains.** The authors report, at minimum:

1. **The qualitative strand.** How the typology was developed; how the corpus was coded, by whom or what, under what protocol; and the coding's reliability checks.
2. **The declaration.** Column roles, including covariates and any single-select groups and how they were resolved; blank cells and how they were read; the declared data type and scale; the presence rule; normalisation if used; whether the data were confirmed as compositional.
3. **Admission and support.** Every excluded document and concept, with its rule; the concepts outside the support window.
4. **The references.** The spread beside its reference; reproducibility by $k$ with intervals beside its reference; the chosen $k$ and whether it was the recommended one. Any result below a reference, stated as such.
5. **The frames.** The frame table: names, distinguishing concepts, bridging candidates, unplaced concepts; each frame's shares across the populations; the recorded reading of each bridging candidate discussed.
6. **The Part B analyses run**, each with its question and result, and which were declared in advance.
7. **Claims by tier** (§3), each labelled confirmatory or exploratory, with the statement that **nothing in v3.0 is certified**.
8. **The three records**, as supplementary material.
9. **The versions:** *CorRes methodology v3.0*, and the name and version of the software that ran the analysis (the authors' own implementation is ArtieEd v2.0, Ebono Intelligence).

**The method in one sentence**, for a methods section: *CorRes identifies concepts that co-occur beyond what their frequencies predict, groups them by their reproducibility across independent halves of the corpus, reads each group for the concepts that distinguish it and the populations that voice it, and reports every result against references computed by permuting the corpus itself; it certifies no frame.*

# 15. Threats to validity

Each safeguard answers a specific way of being misled. Most were found in the method's own earlier generations, in the review of 16 October, in the synthetic calibration of 28–29 October, or in the joint work with Louis Sanzogni from 30 October 2026.

| Threat | How it misleads | Safeguard | Evidence |
|---|---|---|---|
| Clustering always finds clusters | Any data yield a partition | R1 reproducibility shown against a reference computed by permuting the corpus; groupings below it stay descriptive (§3) | Read as gates, references of this kind passed 0–1% of synthetic no-structure corpora (§20, V11) |
| A threshold set by hand | A threshold set by hand can sit where no corpus reaches it, discounting real structure as readily as noise | Both references computed from the corpus itself, by permutation | Before calibration, the strength threshold of 1.0 and the reproducibility threshold of 0.5 each lay above every no-structure corpus and above cleanly planted structure (§20, V10–V11) |
| Frequency masquerading as structure | Common concepts co-occur with everything | R2 residual | G3's first procedure produced bands of prevalence |
| Diagonal bias | Residuals biased upward for common concepts | R2 quasi-independence | Mean residual tracked prevalence at $\rho$ = 0.925 under G3, −0.254 under quasi-independence |
| Single-select groups | Answers to one question can never co-occur, so their zero co-occurrence reads as strong opposition and inflates the spread | §1: proposed by name and by value; a confirmed group must be removed or declared covariates | On synthetic corpora built from such groups, every no-structure corpus exceeded the strength reference, and all twenty most negative residuals fell inside groups (§20, V16) |
| Compositional data | When values are shares of each document, rows sum to a near-constant, so a rise in one category forces falls in others | Proposed at §1 and confirmed; a standing caution on every co-occurrence result; frame shares over covariates reported without it (Stages 1, 6) | MARPOR median row sum 98.6 |
| Coding richness | Concepts in richly coded documents associate with everything | R2 table-margin null; the both-margins rerun controls it document by document | Under the document-level null, a concept's excess co-occurrence summed over all its partners reached 544 documents on the benchmark; under quasi-independence it is zero |
| Universal and rare concepts | No information, or inflated residuals | R3 support window | A concept in all 188 documents scored under quasi-independence; one in 7 ranked among the strongest connectors |
| Choice of expectation | Results depend on the expectation | B.1 reruns under two other expectations, each refitted throughout | Connecting-concept rankings diverged between expectations on Food Security |
| A rerun that varies nothing | A sensitivity rerun that silently repeats the default reports agreement it never tested | Each rerun refits its own expectation in every resample | Until 28 October 2026 every rerun under another expectation returned the default partition exactly (§20, V6) |
| Mis-declared data type | Ratings declared as counts binarise as any mention | §1 declaration; a Caution when counts look like a rating | Food Security stopped as counts and passed as a rating (§20) |
| Forced negatives read as opposition | A zero diagonal makes half the spectrum negative, and frames built from positive residuals force a shortfall between them | R1 positive spectrum; B.4 opposition measured as a difference from the frame's other shortfalls | Equal positive and negative mass on the benchmark |
| Forced membership | Noise concepts blur the frames, lower reproducibility, or are counted as frames of their own | R4 signal; R1 frame test, with noise groups reported as unplaced; R6 diffuse class; the reproducibility reference calibrated with noise left in | Planted frames reproduced at 0.81–0.90 over their own concepts and 0.35–0.37 with noise included (§20) |
| Choosing $k$ by a statistic biased in $k$ | PAC falls as $k$ rises, so the lowest PAC picks the largest $k$ | R1: the most reproducible evaluated $k$; PAC reported | Lowest PAC returned $k$ = 10 where the planted $k$ was 3 (§20) |
| Populations pooled | The grouping reports the difference between populations as dissonance between concepts, or separates kinds of document coded at different depths | R7 reports who voices what; B.8 analyses populations apart; the both-margins expectation controls coding depth | MARPOR mixed-era samples reproduced 0.15–0.25 higher than single-era samples of equal size, which is temporal change showing as structure; on Food Sustainability Practice, whose populations are coded at very different depths, an earlier development procedure found frames tracking source (up to $\eta$ = 0.74); under this version's procedure the corpus yields no frame (§20, V7) |
| Covariates coded as concepts | A label for the speaker enters a frame as if it were a concept the speaker uses | §1 column roles | Three author types entered the leading axis on Food Security; with them included it passed G3's gate |
| Method artefacts read as nuance | One procedure's quirk appears as a connection | B.6 and the method-contingent class | The check procedure admits repulsion directions |
| Non-independent confirmation | Two analyses of one matrix presented as two pieces of evidence | Frames and the opposition table (B.4) are never presented as confirming each other; the check procedure only flags; under closure, a rise in one frame and a fall in another are one finding | Document-level PCA's first axis matched the leading eigenvector of $R$ (0.945) |
| Co-occurrence read as agreement | Concepts mentioned together are taken to share a position | §3; B.3's reading of each bridging candidate's documents in four categories | Louis V3 §5.24 |
| A projection read as a finding about new material | Frames from one corpus are applied to another as if they had been found there | B.9: the projected label, the same coding protocol, the fit check; replication is a second analysis | The method's original use carried no such check |
| A reference read as a certificate | A grouping above a no-structure reference is taken to be a frame of meaning | Tiers (§3): nothing is certified, and *stable* says only that a grouping reproduces better than no association does | A permutation destroys all association, including between populations; it does not model every way a corpus can mislead |
| A declaration assumed by the software | Software that assumes a scale, rather than reading the researcher's declaration, silently changes what counts as present | §1: the maximum is always the declared one | A test harness that declared every corpus 0–3 emptied S-2's 0–1 matrices under emphasis (§20, V18) |
| Silent zeros | Blank or unreadable cells read as absence | §1.3: a matrix with an undefined cell is not an input until the researcher states what the cell means | Development code read blanks as 0 without report |
| Forking paths | Trying analyses until one looks good | Run history (§14); §1 hypotheses; declaring Part B analyses in advance; tiers | All reruns reported; only pre-stated contrasts and analyses are confirmatory |

# 16. Related approaches

CorRes's resampling stage is consensus clustering (Monti et al., 2003), with PAC reported (Şenbabaoğlu, Michailidis and Li, 2014). Its residual comes from the analysis of contingency tables with structurally empty cells (Goodman, 1968). Its both-margins expectation is the bipartite configuration model of network analysis (Saracco et al., 2015), equivalently the Rasch model, in its canonical form; its relation to the exact fixed-margin null is that of canonical to microcanonical ensemble (Squartini et al., 2015). Its *pull* measure is close in spirit to the participation coefficient of network analysis, which measures how far a node's links are spread across modules other than its own (Guimerà and Amaral, 2005). A formal comparison is owed before any claim of difference is made. Louis V2 and V3 develop a complementary line: a bipolar opposition axis from principal components, and bridging concepts scored by the harmonic mean of their positive associations with both poles. In this version nothing is certified: frames are reported by tier, the opposition table is interpretive, and axes and bridges are v4.0 work (§17). The placing of documents against frame profiles (B.9) is a configurational reading in the sense of Kelly (1963), and is the method's oldest use.

# 17. Limitations, restrictions, declared forks and provisional values

**Limitations of the method as specified.**

- **Miss rate known only for one shape of structure.** The synthetic calibration measures what the method finds and misses when structure takes the form of discrete frames of concepts that rise and fall together (§20). Applied as gates, the references missed most planted structure (§20, V17), which is why v3.0 reports them rather than applying them. How it performs on gradients, crossing structure, and the shapes real data present (below) is not yet measured.
- **One granularity at a time.** The frames reported are those at one $k$. Finer structure is visible through nesting and bridging candidates, at the interpretive tier.
- **Sensitivity to coding.** The method takes the coded matrix as given. Its results are as good as the typology and the coding.
- **Sample size.** Reproducibility estimates vary with the number of splits (by up to 0.11 at 25 splits in development). Small corpora and rare concepts give wide intervals.
- **Significance-based tests scale with $N$.** The signal rule gains power as the corpus grows. The strength reference barely changed between 100 and 300 documents (§20); split-half reproducibility rises with the number of documents (from 0.146 at 44 documents to 0.209 at 177 in an August 2026 study), so the reproducibility reference's calibration at 180 documents may not transfer to much smaller or larger corpora.
- **Data shape is declared, not assumed.** The shape of the data (value type, whether it is compositional, the type of each covariate, any single-select groups) is declared at §1 and confirmed by the researcher. The choices that depend on it (the presence rule, the null model, the covariate measure) follow from that declaration.

**What this version restricts, and why.** Each restriction is listed once, with its kind — **model** (the arithmetic or the null model requires it), **scope** (this version has not yet been shown to handle more), or **convenience** (a choice to limit inputs) — and the extension it awaits. None is built into the core of the method.

| Restriction | Kind | Extension awaited |
|---|---|---|
| Only the binary matrix is analysed; prominence is not used (§1) | model | A null for ordinal values; how ordinal steps are weighted, settled by testing) |
| Emphasis is the authors' default; which rule better recovers structure is not settled (§1) | scope | A synthetic comparison with a generator that plants comparable signal for both rules (v4.0) |
| Any mention binds the robust tier, though it cannot see structure carried only in emphasis (B.1; §20) | scope | Review of the binding set with the rule comparison (v4.0) |
| The both-margins model is reported, not binding (B.1) | scope | v4.0: the exact-margin benchmark |
| One permutation scheme serves every expectation for the references (R2, R5) | convenience | v4.0: a margin-matched shuffle for the both-margins model |
| **Nothing is certified** (§3) | scope | v4.0: certifying gates, set in the joint validation with Louis Sanzogni (§20, V17) |
| Concepts outside the support window enter no claim (R3) | scope | v4.0: rare candidates evaluated against frames estimated from well-supported concepts |
| Single-select groups must be removed or declared covariates (§1) | model | A structural-zero null that leaves impossible pairs out of the comparison, as the diagonal is left out now (v4.0) |
| Author and source columns are kept out of frame formation (§1) | scope | The same structural-zero treatment, where they form single-select groups |
| Compositional data carries a standing caution on every co-occurrence result (§1; §A.3) | model | A null suited to compositions, such as a log-ratio approach (Aitchison, 1986) |
| Low-signal concepts stay in the grouping in Part A, and the reproducibility reference is read with them in (R4; B.7) | convenience | Reading reproducibility over signal concepts, or excluding them by default, with the reference recalibrated (v4.0) |
| The references are validated on one synthetic generator, at one size (§20) | scope | Validation across sizes and generators; the permutation reference itself needs no calibration |
| The permutation destroys association between populations as well as within them (§3) | model | A reference that holds population structure fixed, if one is wanted |
| The researcher sets no numeric threshold (§2) | convenience | v4.0 |
| Frames only; no axes or structural bridges (R6) | scope | v4.0 (F5, F6) |
| Placement against frames carries no warrant of its own (B.9) | scope | v4.0: a warrant for profiles, and for projection |
| The populations comparison needs each population to meet the minimum corpus (B.8) | scope | v4.0: a comparison for small populations |
| The signal rule is a significance test | model | An effect-size form that keeps its meaning at large $N$ |

**Declared forks.** These are open choices that change the output. Each is stated with the authors' default; Appendix A gives the rules they use in departing from it. None is ruled.

| Fork | Options | Status in v4.0 |
|---|---|---|
| F1. The expectation | Quasi-independence; document-level independence; the both-margins model | **Default:** quasi-independence, with reruns under the other two (B.1). Which should lead a certifying method is v4.0 work |
| F2. Scale | Raw counts; standardised | Standardised, with the support window (R3) |
| F3. Presence rule | Emphasis; any mention | **Default:** emphasis, by data type (§1); any mention is a sensitivity rerun (B.1). The comparison is v4.0 work |
| F4. Decomposition | Positive eigenvectors of $R$; PCA on rows of $R$; covariance PCA | Positive eigenvectors for grouping; PCA on rows as the check (R1) |
| F5. Structural object | Frames; a bipolar axis; both | Frames, reported by tier, with the opposition table interpretive (B.4); axes and bridges are v4.0 |
| F6. Poles for an axis | Top 5, 10 or 15 concepts; self-exclusion in pole means | v4.0 |
| F7. Thresholds | All values below | The two references computed by permutation and reported rather than applied (§3); the rest provisional |
| F8. Choice of $k$ | Lowest PAC; highest reproducibility | **Default:** highest reproducibility among evaluated $k$; PAC reported (§20, V13) |

**Provisional values.** Fixed in v3.0; open to revision in a v3.x correction or in v4.0.

| Element | Current value | Stage |
|---|---|---|
| Single-select group by value | 3 or more columns, at most one non-zero per document, covering at least 90% of documents | §1 |
| Counts that look like a rating | at most 6 distinct integer values | §1 |
| Normalised threshold | 0.5 | §1 |
| Count and percentage threshold | half the mean non-zero value, across the whole matrix | §1 |
| Minimum corpus | 50 documents, 6 concepts | §2.1 |
| Support window | 10 documents to 90% of documents | R3 |
| Unevenness flag | 90% of a concept's documents in one group | R3 |
| Fitting tolerance | relative change below $10^{-10}$; at most 10,000 iterations | R2 |
| **Strength reference $s^{*}$** | **95th percentile of the spread over $P$ = 49 column permutations, under the expectation and rule in use; reported, not applied** | R5 |
| Structural limit on $k$ | $k \le d_{+} + 1$; $d_{\mathrm{eff}}$ reported, not gating | R5 |
| Positive eigenvalue | above $10^{-9}$ of the largest eigenvalue | R5 |
| Blur or blob | pair density above 0.5 read as blob | R5 |
| Strong pair | standardised residual of at least 2, attraction only; reported, not a gate | R5 |
| Signal null | each concept's column shuffled alone, 19 shuffles | R4 |
| Signal unstable | signal in fewer than half the half-samples measured | R4 |
| Signal-set stability under exclusion | mean Jaccard similarity of the halves' signal sets ≥ 0.8 | B.7 |
| Signal rule at large $N$ | effect-size form, not yet designed; where the rule flags nothing on a corpus of 1,000 or more documents, that is stated | R4 |
| Range of $k$ | 2 to $\min(10, \lfloor m/3 \rfloor)$ | R1 |
| Grouping procedure | positive eigenvalues of $R$, $k - 1$ dimensions, k-means with 10 starts | R1 |
| Unsupported splits | a $k$ is not evaluated if fewer than half its splits are usable | R1 |
| Pairs never admitted together | excluded from PAC; treated as never together in linkage | R1 |
| Number of splits $J$ | 50 | R1 |
| Reproducibility interval | resampling of split values | R1 |
| **Reproducibility reference $\tau_{\mathrm{rel}}$** | **95th percentile of the best reproducibility over $k$ on the same permutations; reported, not applied** | R5 |
| Choice of $k$ | highest reproducibility among evaluated $k$, ties to the smaller; PAC reported with band 0.1–0.9 | R5 |
| Frame test | a group is a frame if it holds at least two signal concepts inside the support window | R4 |
| Check procedure | PCA on rows of $R$, $k - 1$ components, k-means; disagreement caution below ARI 0.5 | B.6 |
| Prevalence tracks frames | $\eta^2$ of concept prevalence across frames ≥ 0.5 | R5 |
| Population measures | Pearson $r$ or correlation ratio $\eta$, reported; B.8 run by the authors at $\eta \ge 0.5$ | R7 |
| Class-sensitivity step | 0.05 on each cut-off | R6 |
| Placement | frame present at $\varphi_F(d) \ge 0.5$; most-resembles margin 0.25; novel configuration below 3 documents; fit-check frame floor 5% | B.9 |
| R6 cut-offs and order | own 0.5; pull 0.10; concentration 0.6; order outside support, unplaced, diffuse (non-signal), distinguishing, method-contingent, bridging candidate, diffuse | R6 |
| Opposition rule | 95% bootstrap interval of $\Delta_{FG}$ wholly below zero ($B$ = 2,000, frames fixed); none with fewer than three frames | B.4 |
| Bootstrap resamples $B$ | 2,000, 95% percentile interval | B.2 |
| Matching frames between runs | maximum total Jaccard similarity; a frame holds if half its members are shared | B.1 |

The quasi-independence residual is proposed as settled on algebraic grounds, pending independent verification of the derivation.

**The v4.0 work list.** What v3.0 leaves to the certifying version, collected from the tables above: the lead expectation; the presence-rule comparison, with a generator that plants comparable signal for both rules; certifying gates built on the permutation references, and their combined false-positive rate; a margin-matched permutation for the both-margins model; the exact-margin benchmark and the standardising variance; noise dilution and screening inside each split; axes and structural bridges; structural-zero and composition-aware expectations; single-select and compositional data as a modelled stage; a warrant for profiles and projection; a populations comparison for small populations; rare candidates against well-supported frames.

# 18. Lineage

The method has four generations. Each revised the method rather than extending it, and **findings produced under an earlier generation are not carried forward as confirmed under this one.**

| Generation | Form | Period | Shown |
|---|---|---|---|
| First | Hand calculation | 2021–2023 | IST 2022 |
| Second | Spreadsheet analysis | 2024–2025 | IST 2024 |
| Third (G3) | First software implementation, in the ArtIE platform; specification v2.5 | 2026 | IST 2026 |
| Fourth (G4) | Methodology v3.0 (this specification), for use now; methodology v4.0, in development, for certification. Implemented in ArtieEd v2.0 (Ebono Intelligence) | 2026– | — |

**Before the first generation.** Reading documents against frame profiles, which B.9 restores, is the method's first form. It was the basis of Metadex, a document-management system that ran on it in production for nine years (Ebbs, 2018). That use is history: it is not evidence for any result reported under this specification.

**Why v3.0 follows the v4.0 drafts.** The fourth generation was first drafted as v4.0 (drafts 0.1–0.6, 16–29 October 2026), aiming to certify frames. The synthetic calibration of 28–29 October showed that the certifying standard is not yet met (§20), and its validation continues jointly with Louis Sanzogni. **v3.0 was split off from draft 0.6** so that researchers can use the fourth generation's safeguards now, with its results reported by tier and nothing certified. v3.0 and v4.0 share their procedure; they differ in what they claim from it. A defect found in the v4.0 work that also affects v3.0 is corrected as v3.x; a change made in v3.0 is carried into v4.0 or recorded as a divergence.

**Divergence from v4.0.** From 2 November 2026 v3.0 departs from v4.0 draft 0.6 in procedure as well as in claim. Each departure is recorded, when it is made, in a divergence register kept with this specification's project record, with its class: a difference in claim, a difference in procedure, a correction that flows back to v4.0, or an analysis v4.0 lacks. The register is the agenda for the eventual merge of the two. The largest entry is R7: v2.5 and every v4.0 draft treated a frame's association with a population as a possible confound to be checked and, if confirmed, removed by narrowing the corpus; v3.0 treats it as a result (R7, B.8). The others at this draft are the permutation references in place of calibrated gates (R2, R5), the complete reduction for the both-margins expectation (R2), the describe-not-prescribe statement of the forks (Appendix A), and the placing of documents against frames (B.9).

**What changed from G3** (specification v2.5). *The G4 column describes the fourth generation's procedure as first drafted. v3.0's departures from it are in the divergence register.*

| | G3 | G4 |
|---|---|---|
| Expected co-occurrence | Margins of the diagonal-free table, $r_i r_j / T$; biased upward for common concepts | Quasi-independence; each concept's residuals sum to zero by construction; reruns under the document-level and both-margins nulls |
| Grouping | Panel P1: PCA on $R$ (B1) and PCA on the phi matrix (B2), pooled into one consensus | One procedure on the positive eigenstructure of $R$; G3's B1 kept only as a check |
| Splits | 25 | 50 |
| Strength threshold | spread ≥ 1.0, one value | v4.0 drafts: calibrated per expectation and rule on synthetic corpora; v3.0: a permutation reference from the corpus itself, reported |
| Reproducibility | Gate on the best value over all $k$ and both procedures; value at the certified $k$ also reported | v4.0 drafts: a calibrated gate; v3.0: a permutation reference, reported at the chosen $k$ with an interval |
| Dimension test | Effective dimension from absolute eigenvalues, ≥ $k$ | None; $d_{\mathrm{eff}}$ on positive eigenvalues reported as a diagnostic; $k \le d_{+} + 1$ as a structural limit |
| Number of frames | Stability scan, confirmed by the researcher | Most reproducible number of groups, confirmed by the researcher; a group is a frame only if it holds at least two signal concepts inside the support window, and the rest are unplaced |
| Concept roles | Five roles (distinguishing, bridging, anchoring, weak, orthogonal) from $\tau_\sigma$, $c_0$ and affinity ratios | Six classes (outside support, unplaced, distinguishing, method-contingent, bridging candidate, diffuse), plus a frame-level opposition table. v3.0 keeps G3's words *distinguishing* and *bridging* for G4's *core* and *interface* classes; G3's measures do not return |
| Corpus below threshold | Halt with warning | v4.0 drafts: refusal; v3.0: a below-reference result is the run's first finding, and the analysis continues, descriptive only |
| Binarisation | A declared rule | Declared rule by data type (half the declared scale maximum, not the observed maximum), optional normalisation; any mention only as a sensitivity rerun |
| Rare and universal concepts | Fixed floor of 2 documents; advisory counts | Support window for every claim |
| Missing values | Read as zero | An undefined cell is resolved by the researcher before analysis |
| New stages and analyses | — | Signal; populations (in place of the covariate check of the v4.0 drafts); pairwise contrasts; three sensitivity reruns; placing documents against frames, restored from the method's first form |
| Retired | — | The phi matrix; $\tau_\sigma$ and the chance baseline $c_0$; the five-role scheme |
| Kept | Admission rules; spread as the strength statistic; the distinguishing and bridging vocabulary | Same |

# 19. Evidence corpora

The fourth generation was developed on four corpora between 2 and 16 October 2026:
- the same-sex marriage subcorpus of the Media Frames Corpus (Card et al., 2015);
- the Manifesto Project data (MARPOR);
- two food corpora of the authors' own: a Food Security Inquiry corpus (188 submissions, 85 concepts) and a Food Sustainability Practice corpus.

The record is held as four evidence notes (2–8 October) and the 16 October record, in the Ebono Institute research repository. Figures quoted from that period are development history.

**The Manifesto Project data are compositional** (§15; Appendix A, §A.3) and are analysed under the caution; the nationalist-right frame's share from 2000 onward, below, is a result of the kind §A.3 reports without it.

One external check from development is reported with a caution. On MARPOR, without being given the left–right scale, the method found a nationalist-right frame. Among manifestos from 2000 onward, its document share correlated +0.57 with that scale (Laver and Budge, 1992), and across all eras it was unrelated to year ($r$ = −0.06). The scale is itself computed from MARPOR's coded categories, the same categories CorRes takes as concepts. **The correlation is therefore partly built in, and it is illustrative, not independent validation.**

**Conformance** of an implementation to this specification is a property of the implementation, not of the method, and is defined in the authors' implementation note, which is not part of this specification, and not here.

# 20. Validation and refinement of the method

This section is the record of how the fourth generation was tested and what each test changed. It is carried from the v4.0 drafts, because v3.0's references and defaults rest on it. Where an entry records a *decision*, the decision was taken for v4.0; how v3.0 uses it is stated in the stage it governs. Entries V1–V16 use the vocabulary of the drafts they record (*gate*, *refuse*, *null*). Each entry states the question, the test, the result, and what was decided. The tests were run on the development implementation, on development corpora and synthetic corpora; every figure was produced by the implementation's own stages, never by a hand calculation.

**V1. Is spread the right statistic for the strength gate?** On the Food Sustainability Practice corpus, which stopped at the gate, the share of concept pairs with a standardised residual of at least 2 was compared with the spread across four corpora. It tracked the spread and separated the corpora more sharply (Food Sustainability Practice 1.4%; Food Security 3.4%; MFC-A 13.3%; MFC-B 15.2%). **Decided:** spread stays the gate statistic; the strong-pair share is reported beside it).

**V2. Does the declared data type matter?** The Food Security Inquiry corpus, a 0–3 rating, had been declared as counts. As counts, *emphasis* resolves to above half the mean non-zero value, which on small integers keeps every mention, and the corpus stopped at the strength gate. Declared as a rating, it passed under all three nulls (spread 1.17–1.39). **Decided:** the declaration decides whether a corpus is analysed; a Caution now fires when counts look like a rating.

**V3. Does the binarisation rule change the outcome?** On the correctly declared Food Security corpus, emphasis passed the strength gate under all three nulls, and any mention stopped under two of them. This supports making emphasis the analysis.

**V4. Is Food Security's refusal robust?** Under the provisional reproducibility gate of 0.5, the corpus refused under every null and at every $k$ from 2 to 10; the best was $k$ = 2 at 0.4632 [0.4284, 0.4994]. That gate was later found to be uncalibrated (V11). 

**V5. Is every declared setting actually applied?** A normalisation setting was recorded in the parameter record but never applied to the data. It was found by asking for the transformation explicitly, and is now applied and recorded with what it normalised against.

**V6. Do the sensitivity reruns vary anything?** On three corpora, every null rerun returned an adjusted Rand index of exactly 1.0 against the default, with no frame, concept or opposition changed. Each rerun had refitted quasi-independence inside its half-samples and resamples whatever its own null, so the robustness rule had been passing claims no null rerun had tested. Once fixed, a frame on MFC-A moved from certified to limits, failing the document-level rerun. Default runs were byte-identical before and after. **Decided:** every resampled step refits the run's own null, with no default, and a guard fails the build if any stage fits a null directly, CR4-44).

**V7. Can the method detect frames that encode document type?** On Food Sustainability Practice v1.1, which pools literature, interviews and survey responses coded at very different depths, an earlier development procedure (October 2026) found frames that tracked source: under any mention 6 of 8 frames were flagged, the highest $\eta$ 0.74; under emphasis 4 of 8, the highest 0.46. Any mention made frames more source-driven than emphasis (0.74 against 0.23 on one frame), consistent with coding density as the mechanism. **Under this version's procedure that result does not stand.** In the trial runs of 12 and 18 November 2026 the corpus yielded no frame, on raw counts or under normalised presence (above 0.5 of each document's own highest code, §1.2), and no result reached the stable tier: the spread stayed below its chance line in both runs, and under normalised presence reproducibility fell below its line as well. A run of 16 November at another threshold did not follow §1.2; it found no frame either and is kept as a record. The normalised comparison was chosen after the raw results were seen and is exploratory (§3). **Decided:** M-3 tests the detection of source-driven frames. On real data, that detection is not yet shown under v3.0; the October figures are development history, not evidence for this version.

**V8. What was the near-miss of 26 August?** A G3 run that came within 0.026 of the strength gate was identified as the Food Security matrix under any mention and G3's residual. With the 26 author-type columns wrongly included as concepts, the same corpus passed: submitter-type columns read as content can carry a corpus over the gate. This is the reason author and source columns are covariates (§1).

**V9. The synthetic set S-1.** To calibrate the gates and choose between the nulls, 1,085 synthetic corpora of 180 documents and 30 concepts, rated 0–3, were generated with known structure. In each structured corpus, three frames of six concepts each rise and fall with a hidden document-level propensity (normal latents, linear predictors), at four strengths (none, weak, strong, overlapping), with low or high spread of prevalence and of coding density, density linked or not to frame position, and the signal placed in presence or in emphasis. Twelve noise concepts, six uniform and six bell-curve, sit beside the frames as negative controls (after the *Synthetic Stingray* design of March 2026). No-structure corpora carry the same density and prevalence variation with no frames. Tuning and test corpora are kept apart, and the ground truth was sealed by a hash manifest committed before any run. **The same team generated and ran the set, so it is calibration, not independent validation.** An independent synthetic set from Louis Sanzogni is awaited.

**V10. The strength gate.** On the 400 no-structure tuning corpora, the 95th percentile of spread under each null and rule gave the R2 thresholds (0.71–0.92). **The provisional single threshold of 1.0 lay above the largest spread of any no-structure corpus in every cell** (the highest was 0.983), so it refused nearly every corpus, structured or not. An independent sample of 400 corpora on fresh seeds reproduced five of the six thresholds exactly and the sixth within 0.01. A grid of twelve sizes (100–300 documents, 15–90 concepts; 4,800 corpora) found the thresholds nearly size-invariant: across documents they moved by at most 0.03, and across concepts by at most 0.03, except under the document-level null with emphasis, which rose from 0.88 to 0.95. The binarisation rule moved the threshold by 0.13–0.17; the null, by at most 0.08. **Decided:** the strength gate is calibrated per null and rule, CR4-49 (1)).

**V11. The reproducibility gate.** With the strength gate bypassed so that every no-structure tuning corpus reached R1, the best reproducibility over $k$ never exceeded 0.191 in 2,400 runs. On a corpus whose three planted frames a plain k-means on the correlation matrix recovers perfectly, the method's own reproducibility peaked at the planted $k$ = 3, at 0.35–0.37, with an interval clear of every other $k$. **The provisional gate of 0.5 lay above both, and refused structure the method had found.** An August 2026 study had already measured split-half reproducibility below 0.21 at every corpus size it tried; it had been set aside as superseded, and its finding was re-derived here. **Decided:** the gate is calibrated per null and rule as the 95th percentile on the no-structure tuning corpora (0.05–0.07); with the strength gate, the joint false-positive rate on the tuning set is 0–1%).

**V12. Why is reproducibility of clean structure only 0.37?** On the same corpus, reproducibility measured over the 18 planted concepts alone was 0.81–0.90. Per concept, planted concepts were grouped with their own frame's partners in 94–97% of half-analyses; noise concepts were scattered. The signal test had identified the noise (no uniform-noise concept passed), but low-signal concepts stay in the grouping by default, so they lowered the reproducibility the gate reads. **Decided:** the default stands for v4.0 and the gate is calibrated with it in place; the question is v4.0 work).

**V13. How should $k$ be chosen?** On the no-structure tuning corpora, the lowest-PAC rule recommended the top of the range in 83–99.5% of runs, and on the planted corpus it recommended $k$ = 10. **Decided:** $k$ is chosen by highest reproducibility among passing $k$; PAC is reported).

**V14. The build check.** Five near-deterministic corpora (three planted frames, loading 4, signal in presence) were run before the test set. Under the values in force before calibration, no run recovered the planted $k$, and 10 of 15 emphasis runs were refused; that result is kept. Under the calibrated gates and the new rule for $k$, all 30 runs detected structure, and every one recovered the planted frames exactly (adjusted Rand index 1.000 over the planted concepts). The recommended $k$ was 4, 9 or 10 under any mention and 4 or 5 under emphasis, against three planted frames; Every extra group was noise. Across the 30 runs, all 72 groups made only of planted concepts were one whole planted frame; 58 groups held only noise concepts; 18 groups mixed the two, all under emphasis. Where all twelve noise concepts formed one group the recommended $k$ was 4; where they were cut into groups of one to three it was 9 or 10. **What varied with $k$ was only how finely the noise was cut, not the frames.** A group made only of noise concepts is not a frame; its concepts are reported as unplaced.

**V15. Can S-1 compare the binarisation rules?** No. Measured on the generator alone, at the same loading the presence arm plants about five times the recoverable structure of the emphasis arm; at the strong loading no emphasis loading matches it. Any mention cannot see signal placed only in emphasis at all, while emphasis keeps about half of signal placed in presence. A comparison averaged over the design would have chosen any mention because of the generator, not the rule. The error was in the design of the test, and was found before any test result existed. **Decided:** emphasis remains the analysis by ruling, S-1 chooses the lead null among the emphasis cells only, and the rule comparison is v4.0 work).

**V16. Single-select groups.** On 140 synthetic corpora built from six single-select groups of five ordered categories (S-2), every no-structure corpus passed the strength gate under every null, with spreads of 1.11–1.33; planted structure moved the spread by only 0.04. In every corpus, all twenty most negative residuals lay between columns of the same group. The §1 flag fired only when the columns shared a name prefix. **Decided:** single-select groups are proposed by value as well as by name, and a confirmed group must be removed or declared covariates).

**V17. What the gates did on S-1's test set, and why v3.0 reports them as references.** On S-1's 680 test corpora, the two calibrated thresholds were applied as gates. Under the analysis cell, quasi-independence with emphasis, **one structured corpus in 480 was detected**. Under the document-level null, 8.5% were detected with emphasis and 56.7% with any mention. Most planted structure was lost at the strength gate. Together the gates allowed 0–1% false positives against a 5% allowance. **They were conservative to the point of hiding what the method had found.** Recovery of the planted number of frames was poor (5–20%), and the S-1 results recorded recovery only on accepted corpora; the joint programme now reports recovery across all corpora. **Decided for v3.0** (30 October): the thresholds are kept, as calibrated, and reported as references beside each result, so that the researcher sees structure the gates would have hidden and sees how far it stands from noise. How a certifying method should set its gates is v4.0 work, with Louis Sanzogni.

**V18. The S-2 emphasis arm, and a declaration assumed by the software.** On S-2, every one of the 840 emphasis runs stopped at §1 with an empty matrix. The cause was not in the method. The test harness declared every corpus as a 0–3 rating, whatever the corpus's own note said. On S-2's 0–1 data that set the emphasis threshold at 1.5, nothing cleared it, and the method stopped rather than analyse an empty matrix, which is correct. Declared as its note says, the threshold is 0.5 and emphasis keeps every 1, so the two rules coincide on S-2. **The frozen S-2 runs have no emphasis arm and have not been reissued.** The fault was found by Louis Sanzogni (30 October) and traced by the development team (31 October). **Decided**: the declaration is read from each corpus's own note by a data component that stops a run on a note that is silent or contradicts itself. This is a threat to validity in its own right (§15).

**V19. Determined cells in the both-margins fit.** Benchmarking the both-margins model against exact enumeration on tiny and near-boundary matrices, at Louis Sanzogni's request, found that the development implementation rejected as unconverged some matrices whose margins admit exactly one solution. Two causes: the reduction for trivial margins applied a determined value to a whole column rather than to its free cells only, and forced blocks were not reduced at all. **Decided** (2 November): the complete reduction and the existence condition are specified (R2), so that a wholly determined matrix is reported as a finding and a failure to meet the margins after reduction is an implementation fault. The implementation is to be brought into line and tested against enumeration.

**V20. Louis Sanzogni's 90 detections in 840 runs, on S-2.** His count reconciles exactly with the frozen records. **The 840 runs are 420 observations recorded twice:** each corpus was run under two column namings, which agreed in every one of the 420 corpus-and-null cells. Counted per independent corpus, with 95% Wilson intervals:

| Null | No structure (100) | Weak (20) | Strong (20) |
|---|---|---|---|
| Quasi-independence | 3 | 0 | 5 |
| Document-level | 5 | 0 | 7 |
| Both-margins model | 15, [9.3%, 23.3%] | 2 | 8 |

The both-margins model was the least specific of the three nulls: its interval on no-structure corpora lies wholly above 5%. **No null showed evidence of detecting weak single-select structure.** These corpora keep the single-select groups that §1 now asks a researcher to remove or declare, so they measure what happens when that is not done.

# Appendix A — Choosing between approaches

## A.1 What this appendix is for

At several points the method offers more than one approach. Part A states, at each, the approach the authors use by default and the reason. This appendix collects, in one place, the rules the authors follow when deciding whether to depart from a default, and how they read the results when more than one approach has been run. A researcher may apply these rules, adapt them, or set them aside, and the report should say which.

**The authors' practice, and why.** We choose each approach before any result is seen, from properties of the data that are measurable at Stages 1 and 2 (§A.2), and we run the principal alternatives regardless, as the sensitivity reruns of B.1. We do this because a choice made after seeing results makes every claim that depends on it exploratory (§2), and because publishing both results costs nothing once both exist. Where the comparison persuades us to change the primary approach, this is stated, and the claims that depend on the change are labelled exploratory. That is the whole of the rule. It binds our own work and describes the consequence for anyone else's; it does not instruct.

## A.2 Choosing from the shape of the data

Each row names a fork, the approaches, the property of the data that bears on the choice, and the rule the authors apply. Every property is computed from the declared matrix before R2 runs.

| Fork | Approaches | Property of the data | The authors' rule |
|---|---|---|---|
| **Expectation** (R2) | quasi-independence · document-level independence · the both-margins model | **Spread of coding density**: the coefficient of variation of $\ell_d$ across admitted documents. **Prevalence range**: how many concepts sit near the support-window edges | Quasi-independence by default, for its zero-sum residuals and freedom from diagonal bias. Where coding density varies widely (CV above 0.5, *provisional*), the both-margins rerun is read with particular care, since it alone controls density document by document; where it moves frames, the authors report it as the primary analysis and say why |
| **Presence rule** (§1) | emphasis · any mention | **Declared data type.** Presence data admits no choice. For ratings, counts and percentages: the share of the matrix's non-zero values that lie above the emphasis threshold | Emphasis by default, because lowering the threshold to a single mention can only make a corpus look more structured than its emphasis supports. Where fewer than a quarter of non-zero values clear the threshold (*provisional*), most of the coding is below it, and the authors examine the any-mention rerun before reading the frames |
| **Low-signal concepts** (R4) | keep and label diffuse · exclude before grouping | **Share of concepts failing the signal test**; the change in reproducibility at the recommended $k$ when they are excluded | Keep, by default, so that nothing is hidden. Where a third or more of concepts fail the test (*provisional*) and exclusion raises reproducibility at the same $k$, the authors report both groupings and treat the excluded set as a finding about the typology's fit |
| **Granularity** (R1) | the recommended $k$ · a neighbouring $k$ | The **reproducibility profile** across $k$: whether the recommended $k$ stands clear of its neighbours, with the intervals | The recommended $k$ unless its interval overlaps a neighbour's; then the authors report both and show which frames split or merge (nesting, B.5) |
| **Populations** (R7, B.8) | the pooled corpus alone · populations analysed apart and compared | **Unevenness** of coding across populations (R3); R7's associations once a run exists; whether each population meets the minimum corpus | The pooled run always. Where a frame reaches $\eta \ge 0.5$ against a covariate (*provisional*) and the populations are large enough, B.8 is run and the pooled and stratified runs are reported together. Nothing is excluded |
| **Compositional data** (§1) | analyse under the compositional caution · a composition-aware expectation (v4.0) | **Row-sum constancy**: the coefficient of variation of each document's total across the corpus; the share of the strongest negative residuals that fall between the largest categories | Analyse under the caution; §A.3 |

Two forks are not in this table. The method's thresholds are not researcher settings in this version (§2). The class cut-offs of R6 are labels on reported measures, not a choice of approach.

## A.3 Compositional data

**What closure does.** When a document's values are shares of a whole, so that each row sums to a near-constant, a rise in one category forces falls in the others. This induces negative dependence *between categories within a document* that has nothing to do with the discourse (Aitchison, 1986). After binarisation the effect persists in weakened form: a document heavy in one category has fewer presences to spare for the rest. Every null in R2 states an expectation under which presences fall independently given their margins, so on compositional data the residuals carry a built-in negative bias between the larger categories, and the positive residuals from which frames are built are shifted by it.

**What the authors therefore do.**

1. *Co-occurrence results carry the caution.* Residuals, groupings, classes and the opposition table are reported with a standing statement that the data are compositional and that between-category association is partly induced by closure. The frames may be real; some of their boundaries may be artefacts of closure; the method as specified cannot tell which.
2. *A frame's share across a covariate is reported without the caution, with one limit stated.* The quantity $\varphi_F(d)$, averaged within groups of a covariate (R7; B.9), is a function of each document's own row, not an association between concepts. Closure does not manufacture a difference between groups of documents: if a frame's share is higher in 2015 manifestos than in 1995 ones, that is a change in emphasis, and it is what the researcher wants to know. **The limit is that under closure, the rise of one frame and the fall of another are one finding, not two.** The report states the rises and falls together, and does not count them as independent evidence. And because the frame itself was built from residuals that carry the caution, a claim about *which concepts* the rising frame contains inherits it; a claim that *this set of concepts* rose does not.
3. *The diagnostics are reported.* The coefficient of variation of row totals, and the share of the twenty most negative residuals that fall between the largest categories. A low first value and a high second are the signature of closure at work, and the reader can weigh the caution accordingly.

**Why the authors analyse such data at all.** The alternative is to refuse it, which excludes a large class of coded corpora, including the Manifesto Project data, and loses findings of the kind described in (2) that do not depend on the contested quantities. A reader is better served by the result with its caution than by its absence. A composition-aware expectation, such as a log-ratio formulation, is the proper answer and is v4.0 work (§17).

## A.4 Reading a comparison

When two approaches have both been run, the authors read the comparison in this order, and report each item:

1. **Agreement of the groupings:** the adjusted Rand index between the two sets of frames, after matching by greatest overlap (B.1).
2. **What moved:** concepts that change frame; concepts that change class; frames that split, merge or dissolve; unplaced concepts that become placed, or the reverse.
3. **What held:** the claims, in the sense of B.1, that hold under both. These are the robust results (§3).
4. **What the disagreement means.** A result that holds under one approach only is not wrong; it is a result that depends on an assumption, and the report names the assumption. Where the two approaches disagree on a frame the researcher intends to discuss, the authors read the documents behind the moved concepts (B.3) before deciding which approach to treat as primary.

The reruns of B.1 produce this comparison for the expectation and the presence rule automatically. For the other forks the researcher runs the alternative and reads the comparison the same way.

## A.5 Worked examples

*To follow, in v3.1.* The worked examples are to be written from the record: the Food Security Inquiry corpus under the three expectations and both presence rules (§20, V2–V4); the Manifesto Project data, compositional, with the nationalist-right frame's share from 2000 onward (§19); the Food Sustainability Practice corpus, three populations coded at different depths (§20, V7).

---

*The thresholds in §A.2 (density CV 0.5; emphasis share one quarter; signal failure share one third; $\eta$ 0.5) are rules of the authors' practice, not parameters of the method, and are not in §17's table.*

# References

*Cited from the authors' knowledge in this draft. Checked against the sources before issue.*

Aitchison, J. (1986). *The statistical analysis of compositional data*. Chapman and Hall.

Bishop, Y. M. M., Fienberg, S. E., & Holland, P. W. (1975). *Discrete multivariate analysis: Theory and practice*. MIT Press.

Card, D., Boydstun, A. E., Gross, J. H., Resnik, P., & Smith, N. A. (2015). The Media Frames Corpus: Annotations of frames across issues. In *Proceedings of ACL-IJCNLP 2015* (pp. 438–444).

Creswell, J. W., & Plano Clark, V. L. (2018). *Designing and conducting mixed methods research* (3rd ed.). SAGE.

Efron, B., & Tibshirani, R. J. (1993). *An introduction to the bootstrap*. Chapman & Hall.

Entman, R. M. (1993). Framing: Toward clarification of a fractured paradigm. *Journal of Communication, 43*(4), 51–58.

Fetters, M. D., Curry, L. A., & Creswell, J. W. (2013). Achieving integration in mixed methods designs: Principles and practices. *Health Services Research, 48*(6 Pt 2), 2134–2156.

Goodman, L. A. (1968). The analysis of cross-classified data: Independence, quasi-independence, and interactions in contingency tables with or without missing entries. *Journal of the American Statistical Association, 63*(324), 1091–1131.

Guetterman, T. C., Fetters, M. D., & Creswell, J. W. (2015). Integrating quantitative and qualitative results in health science mixed methods research through joint displays. *Annals of Family Medicine, 13*(6), 554–561.

Guimerà, R., & Amaral, L. A. N. (2005). Functional cartography of complex metabolic networks. *Nature, 433*, 895–900.

Hubert, L., & Arabie, P. (1985). Comparing partitions. *Journal of Classification, 2*(1), 193–218.

Laver, M., & Budge, I. (Eds.). (1992). *Party policy and government coalitions*. Macmillan.

Manifesto Project (MRG/CMP/MARPOR). *Manifesto Project dataset*, version 2025a. WZB Berlin Social Science Center.

Monti, S., Tamayo, P., Mesirov, J., & Golub, T. (2003). Consensus clustering: A resampling-based method for class discovery and visualization of gene expression microarray data. *Machine Learning, 52*, 91–118.

Sandelowski, M., Voils, C. I., & Knafl, G. (2009). On quantitizing. *Journal of Mixed Methods Research, 3*(3), 208–222.

Saracco, F., Di Clemente, R., Gabrielli, A., & Squartini, T. (2015). Randomizing bipartite networks: The case of the World Trade Web. *Scientific Reports, 5*, 10595.

Şenbabaoğlu, Y., Michailidis, G., & Li, J. Z. (2014). Critical limitations of consensus clustering in class discovery. *Scientific Reports, 4*, 6207.

Simmons, J. P., Nelson, L. D., & Simonsohn, U. (2011). False-positive psychology: Undisclosed flexibility in data collection and analysis allows presenting anything as significant. *Psychological Science, 22*(11), 1359–1366.

Tashakkori, A., & Teddlie, C. (2008). Quality of inferences in mixed methods research: Calling for an integrative framework. In M. M. Bergman (Ed.), *Advances in mixed methods research* (pp. 101–119). SAGE.

Haberman, S. J. (1977). Maximum likelihood estimates in exponential response models. *The Annals of Statistics, 5*(5), 815–841.

Rinaldo, A., Petrović, S., & Fienberg, S. E. (2013). Maximum likelihood estimation in the β-model. *The Annals of Statistics, 41*(3), 1085–1110.

Squartini, T., de Mol, J., den Hollander, F., & Garlaschelli, D. (2015). Breaking of ensemble equivalence in networks. *Physical Review Letters, 115*, 268701.

Ebbs, G. (2018). *Visualising database content using metadata* [Master of Interactive Media exegesis, Griffith University]. https://github.com/giobono/metadex/blob/master/GEbbs_s2980212_Exegesis.pdf

Kelly, G. A. (1963). *A theory of personality: The psychology of personal constructs*. Norton.

Goffman, E. (1974). *Frame analysis: An essay on the organization of experience*. Harvard University Press.

# About this document

**Status.** Version 3.0 of 20 November 2026, issued by the Ebono Institute. It is the current description of the CorRes method. Specification v2.5 remains the description of the third generation of the method (§18). The specification is written in the plural voice of its authors, Geoff Ebbs and Louis Sanzogni.

**Citation.** Ebbs, G. and Sanzogni, L. (2026). *CorRes methodology v3.0*. Ebono Institute. https://edu.ebono.au/methods/corres/v3.0/. Software that implements the method is cited by its own name and version beside this one.

**Derivation.** v3.0 was split on 30 October 2026 from draft 0.6 of the v4.0 specification, to change what is claimed from the fourth-generation procedure rather than the procedure. From 2 November it departs from draft 0.6 in procedure as well. Every departure is recorded, when made, in a divergence register kept with the project record, classed as a difference in claim, a difference in procedure, a correction that flows back to v4.0, or an analysis v4.0 lacks; the register is the agenda for the eventual merge. The largest entry is R7: v2.5 and every v4.0 draft treated a frame's association with a population as a possible confound to be removed by narrowing the corpus; this version treats it as a result. The others are the permutation references in place of calibrated gates (R2, R5), the complete reduction for the both-margins expectation (R2), the describe-not-prescribe statement of the forks (Appendix A), and the placing of documents against frames (B.9).

**v3.0 and v4.0.** Both use the fourth generation's procedure. v3.0 is for use now; v4.0, in development with Louis Sanzogni, aims to certify, and where v3.0 reports a result against a reference, v4.0 will apply a gate. A defect found in the v4.0 work that also affects v3.0 is corrected as v3.x; a change made in v3.0 is carried into v4.0 or recorded as a divergence.

**The specification describes; it does not prescribe.** It states what the authors compute and why, the rules they follow in choosing between approaches (Appendix A), and what accompanies a result they publish. The order and rigour with which another researcher applies it are theirs, and their report should say what they did. How a tool proposes, confirms, warns and stops is set out in the authors' implementation note, which is the first input to the functional specification of the software that implements this version.

**Provisional values** are the values the authors use, open to revision; they are not researcher settings and are collected in §17. The thresholds in Appendix A, §A.2 are rules of the authors' practice and are not method parameters.

**Other versions referred to.** G3 means the third generation, as specified in v2.5. Louis V2 and Louis V3 mean the two versions of Louis Sanzogni's *Food Security: Conceptual Clustering and Bridging Analysis* (V2, 16 October 2026; V3, last saved 16 October 2026). Points settled in discussion are cited to *Answers to Louis's questions — 16 October 2026* (the 16 October record) and to the session of 26 October 2026. Figures from development runs (2–16 October 2026) are development history; figures from the synthetic calibration of 28–29 October and its reconciliation are in §20.

# Changelog

**v3.0 (20 November 2026).** Issued from working draft 0.6, with the method and its text unchanged. The drafting note becomes *About this document*: the status, the citation with its address, and the authors; the open items and drafting-only lines are removed. The licence is stated in the header. The reference to the implementation note no longer gives an internal path.

**Draft 0.6 (20 November 2026).** A correcting draft; the method is unchanged. **V7 is corrected:** the η = 0.74 finding on Food Sustainability Practice came from an earlier development procedure, and under this version's procedure the trial runs of 12 and 18 November found no frame in that corpus; §15's evidence for pooled populations and R2's reference to V7 say so. R6's open question is settled: Louis V2's harmonic bridging score does not accompany bridging candidates in v3.0. §A.5's worked examples are marked to follow in v3.1. The three citations marked † (Haberman 1977; Rinaldo, Petrović and Fienberg 2013; Squartini, de Mol, den Hollander and Garlaschelli 2015) are checked against their publishers' records and the marks removed. The history of Metadex moves from B.9 to §18, so that B.9 makes no claim from it, and its reference is completed (Ebbs, 2018). The closing note names the authors, as agreed with Louis Sanzogni on 20 November, and gives the citation on issue. The software is named as ArtieEd v2.0 in §14 and §18.

**Draft 0.5 (6 November 2026).** A correcting draft; the method is unchanged. The header and this note read draft 0.5 (draft 0.4 carried *Working draft 0.3* in both places). The implementation note now exists, and the note at the end and §19 point to it by path; conformance is defined there. Cross-references left by the restructure of draft 0.4 are corrected: B.7 and §17 cite R6 for the classes; §A.2 cites B.5 for nesting; V18 cites §15; F7 cites §3; R5's reproducibility reference cites the permutations of the strength reference; the stage column of §17's provisional values follows the refinements. B.3 states what the authors do (read and record) rather than what a tool does. The closing note no longer says the draft was sent to Louis Sanzogni. Section numbers in the changelog entries below refer to the drafts they describe.

**Draft 0.4 (2 November 2026).** §2 restructured as a first view and seven refinements, on the Academic Director's direction. The first view is the sorted residual matrix under document-level independence, reproducible by hand and reported as descriptive. Each refinement is introduced by the way the view before it can mislead: R1 stability (the consensus matrix as the stability diagram, where the method's development first matched a reading by eye); R2 the expectation; R3 support; R4 signal and the frame test; R5 the permutation references, where *stable* is defined; R6 the classes; R7 populations. The mathematics is unchanged and is placed under the refinement that introduces it. Cross-references in Parts B and C and Appendix A point at refinements. §2.3 summarises the refinements in one table.

**Draft 0.3 (2 November 2026).** Rewritten for an academic reader, on the Academic Director's review of draft 0.2. *CorRes at a glance* opens the document: frames and frame analysis; what the method does; where it sits in a mixed-methods study; the two principles; the claim; why a version that certifies nothing. §1 defines the document–concept matrix as the input, with its properties and their consequences, in place of a stage describing how a matrix is declared. §2 states the method in five steps, each as what is computed, its mathematics, and what it contributes to warrant, with no flow control: a quantity is defined for a matrix or it is not, and a value below a reference is a finding. §3 brings together references, tiers and records as what accompanies a result. Everything about how a tool proposes, confirms, warns and stops is removed to an implementation note. The description of the draft's status moves from the front matter to a closing note, removed on issue. Parts B and C and Appendix A are carried from draft 0.2 with cross-references renumbered and the procedural voice removed. The mathematics is unchanged from draft 0.2.

**Draft 0.2 (2 November 2026).** Restructured and extended from draft 0.1 on the decisions of 2 November. Sent to Louis Sanzogni for review and for the question of authorship. Fleet-internal references (project-log rulings, instance names) removed; the project record remains the source for each decision's provenance.

- **Structure.** Part A (the method, seven stages), Part B (nine optional analyses, each with its question, what it changes and when it is declared), Part C (claims, diagnostics, records, threats, limits, lineage, evidence, validation), Appendix A (choosing between approaches). The specification describes and does not prescribe; the rules the authors follow are stated as theirs, with reasons.
- **§3, principles.** A model for expectation; resampling (permutation, split-half, bootstrap) for warrant; stability within the corpus distinguished from replication; the claim sentence gains populations.
- **Stages 3 and 5.** The strength and reproducibility references are computed by permutation of the researcher's own corpus (one shuffle scheme for every expectation, $P$ = 49); the synthetic calibration becomes validation of the procedure. The reason for standardising by $\sqrt{E}$ under every expectation is stated.
- **Stage 3, the both-margins model.** The complete reduction for cells the margins determine (trivial margins, applied to free cells only; forced blocks); existence and uniqueness on the remainder; a wholly determined matrix reported as a finding; the model stated as holding margins in expectation, as a canonical ensemble against the exact null's microcanonical one. *Fast fitted* is retained in the joint programme's code, not here.
- **Stage 6, Populations**, replacing the covariate check. A frame's share across a covariate is a result; *confound* is removed; the surviving caution is a difference in coding depth, answered by the expectation rather than by exclusion. The stratified comparison is B.8.
- **Stage 7.** The measures are the result and the classes are labels at stated cut-offs, with a class-sensitivity line. *Distinguishing* and *bridging candidate* for *core* and *interface*. Reading a bridging candidate, opposition, nesting and the check procedure move to Part B.
- **B.9, placing documents against frames**, new: profiles from distinguishing concepts; presence of a frame in a document; configurations and the configuration table; novel documents; projection onto new material with a fit check.
- **Appendix A.** The forks, the properties of the data the authors read before choosing, the rules they apply, how a comparison is read; compositional data analysed under a caution with the argument for frame shares stated (§A.3).
- **§13 tiers** unchanged in substance; **§14 diagnostics** collected; **§15 records and reporting** merged; conformance moves out of the specification to the implementation record; **§20** keeps the evidence corpora.
- **§19** gains the divergence register. **§21** V19 amended: the near-boundary failures were an incomplete reduction in the development implementation, now specified.
- **Held open:** the citation scheme and licence; the harmonic score beside bridging candidates; §A.5's worked examples; three † citations.

**Draft 0.1 (2 November 2026).** First draft, split from v4.0 draft 0.6 to change what is claimed from the fourth-generation procedure: gates reported as references; tiers without certification; the third generation's vocabulary on the fourth generation's measures; compositional data under a caution; the S-2 declaration fault, the both-margins defect and the S-2 reconciliation added to the validation record (V17–V20).

**Inherited history.** Drafts 0.1–0.6 of the v4.0 specification (16–29 October 2026) carry the fourth generation's earlier changelog, held with the v4.0 specification.
