---
title: "Weekly Business Review: A Practical Format"
meta_description: "How to run a weekly business review that changes decisions: choose input and output metrics, show expected ranges, review by exception and close the action log."
author: "florian-andrews"
published: "2026-11-25"
category: "Metrics and KPIs"
tags: ["Weekly business review", "Operating cadence", "KPIs"]
primary_keyword: "weekly business review"
---

# How to run a weekly business review that changes decisions

A weekly business review (WBR) is a standing meeting where the owners of a business area look at a fixed set of metrics, explain what moved, and agree what to do about it. Done well, it is the cheapest decision-making system a company has. Done badly, it is a slide-reading ritual that nobody remembers on Thursday.

The difference rarely lies in the template. It lies in what happens between meetings: how metrics are shown, who speaks, and whether last week's actions were closed. This article sets out a format built on three ideas: show metrics against expected ranges rather than targets alone, run the meeting by exception, and keep an action log that is reviewed first, every week.

## What a weekly business review is for

A WBR has three jobs, and a meeting that tries to do more usually does none of them well.

1. **Notice.** Surface changes in the business that someone needs to know about, early enough to act.
2. **Explain.** Give an owner the chance to say what they believe is happening, and how confident they are.
3. **Decide.** Agree specific actions, with an owner and a date.

It is not a status update, a planning session or a place to debate strategy. Those need different meetings. If a topic needs thirty minutes of debate, the WBR's job is to name it and assign someone to bring a proposal to the right forum.

## Choosing the metrics: inputs and outputs

Most review packs are dominated by **output** metrics such as revenue, churn or cash collected. These matter, but they move slowly and tell you what has already happened. A useful review also includes **input** metrics: the controllable activity that tends to drive the outputs, such as qualified opportunities created, onboarding completed within the target time, or invoices sent on the due date.

A practical rule is to pair each output with one to three inputs, and to keep the whole set small enough to read in a few minutes. If you cannot say which decision a metric would change, remove it. If you do not have a [KPI definition](/blog/kpi-definition-template/) that states the population, formula and owner, fix that before it goes in the pack: otherwise the first ten minutes of every meeting are spent arguing about what the number means.

Metrics should come from the systems of record, not from slides rebuilt by hand each week. Hand-built packs introduce errors, and they consume the time that should go into thinking.

## Showing expected ranges, not just targets

A target tells you where you want to be. It does not tell you whether this week's number is surprising. A metric that is 4% under target might be a normal week, or a real problem, and the room cannot tell the difference without context.

Show each metric with:

- **This week's value** and the previous several weeks, as a small trend rather than a single point.
- **The expected range**: what a normal week looks like given history and seasonality. This is the band the metric usually sits within.
- **The target**, shown separately.

A point outside the expected range is a signal worth discussing. A point inside it, even if it is below target, usually is not. This one change cuts a great deal of noise from a review, because the room stops explaining ordinary variation. It is also the idea behind [business health metrics](/resources/business-health-metrics/): measure whether performance is consistent with expectation, not only whether it hit a number.

Setting an expected range can start simply. Take the last 13 or so weeks, note the typical spread, and adjust for known effects such as month-end, holidays or campaigns. Refine it as you learn. Label it as your working estimate, not a statistical guarantee.

## Running the meeting by exception

If every owner talks through every metric, the meeting is a reading exercise. Run it by exception instead:

- Everyone reads the pack before the meeting. The meeting starts from the assumption that it has been read.
- Owners speak only about metrics outside the expected range, or about a change they know is coming.
- For each exception, the owner covers four things: what moved, where (which segment, region or process step), what they think caused it, and how sure they are.
- Keep the distinction between **observed** ("failed payments rose in one card network"), **plausible** ("we think the issuer changed a rule") and **verified** ("confirmed with the processor"). Co-movement is not cause, and a review that treats every guess as a conclusion makes decisions on weak evidence.

A good facilitator protects the time. When an exception needs more than a few minutes, record it and assign a follow-up rather than debating it live.

### A copyable agenda (60 minutes)

| Minutes | Item | Notes |
|---|---|---|
| 0-10 | Action log from last week | Each item: done, not done (why), or dropped |
| 10-15 | Headline view | Which areas are inside or outside expected ranges |
| 15-45 | Exceptions by area | Owners speak only to metrics outside range or known changes |
| 45-55 | New actions | Owner, date, what "done" means |
| 55-60 | Escalations and parking lot | What needs a different forum, and who takes it |

## The action log and closing the loop

The action log is what turns a conversation into a decision system. Open each meeting with it, before any new metrics. If actions are not reviewed first, owners learn that they do not matter.

Each action needs:

- **A single owner**, not a team.
- **A due date**, usually within one or two weeks.
- **A definition of done**, written so that someone else could tell whether it happened.
- **The metric it is expected to affect**, if any, so that you can later see whether it did.
- **A status** at the next review: done, not done with a reason, or dropped with a reason.

### Action log checklist

- [ ] Every action has one named owner
- [ ] Every action has a date and a definition of done
- [ ] Actions link to the metric or exception that prompted them
- [ ] Last week's actions were reviewed before new ones were added
- [ ] Dropped actions say why
- [ ] Repeated exceptions are escalated to a root-cause owner instead of re-discussed

The last item matters more than it looks. When the same metric is out of range for several weeks, the review is no longer the right place to explain it. Assign a deeper investigation, and report back.

## An illustrative one-page layout

The layout below is hypothetical, to show structure rather than real figures.

| Metric | Type | This week | Expected range | Target | Status |
|---|---|---|---|---|---|
| New customers onboarded within 7 days | Input | 62% | 58-70% | 70% | Inside range |
| Failed payment rate | Input | 4.1% | 2.0-3.0% | 2.5% | Outside: investigate |
| Invoices sent on due date | Input | 94% | 92-97% | 95% | Inside range |
| Cash collected | Output | 98% of plan | 95-105% | 100% | Inside range |

In this example only one row needs airtime, and the discussion is about payment failures, not about the three metrics that are behaving normally.

## Common failure modes

- **A pack with too many metrics.** Nobody reads it, so the meeting reads it aloud.
- **Targets without ranges.** Every miss feels like a crisis, or every miss is ignored.
- **Narrative without evidence.** Confident explanations with no indication of what was observed versus assumed.
- **Actions that vanish.** New items are added each week and old ones are never reviewed.
- **Attending to report, not to decide.** If nobody present can change anything, the right people are not in the room.
- **Using the review to judge individuals.** A WBR looks at business processes and outcomes. If it becomes a place to rank people, owners will stop surfacing problems.

## Making the review easier to run

Much of a WBR's effort goes into assembling data and noticing what changed. Panoptes is designed to monitor business metrics against expected ranges and to bring findings to owners, which would let the meeting start from exceptions rather than from assembly. That is a design intent: it does not remove the need for owners who investigate and decide. If you want to see the idea in practice, look at the [Command Center](/platform/command-center/) overview, or read about [moving from dashboards to decisions](/resources/from-dashboards-to-decisions/). For the executive view of the same cadence, see [solutions for executives](/solutions/executives/) and our piece on the [AI chief of staff](/blog/ai-chief-of-staff/). To talk it through, [book a demo](/demo/).

## Frequently asked questions

### How long should a weekly business review take?

Between 45 and 60 minutes suits most teams, with the action log first. If it regularly overruns, you probably have too many metrics or too much discussion of items that belong in a separate forum.

### Who should attend?

The owners of the metrics in the pack, plus the person who can make resourcing decisions for them. Keep the group small; additional attendees can read the notes.

### How many metrics should be in the pack?

As few as are needed to cover the business area's key outputs and their main inputs, and few enough to be read before the meeting. If you are unsure whether a metric belongs, ask which decision it would change.

### How do we set expected ranges if we have little history?

Use what you have, label the range as provisional, and widen it. Revisit it after a few cycles and when something structural changes. A rough range still beats comparing a single week with a target.

### Is a weekly cadence right for every team?

Not always. Fast-moving operational areas may need daily checks, while slower commercial metrics may suit a monthly review. Match the cadence to how quickly the business can act on what it sees.
