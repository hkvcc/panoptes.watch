---
title: "Variance Analysis: From Number to Cause"
meta_description: "A practical way to take a budget vs actual variance, break it into drivers, and trace each one to an operational change, with honest grades for the evidence."
author: "kieran-lovell"
published: "2026-11-26"
category: "Metrics and modelling"
tags: ["KPIs", "Finance", "Root cause analysis"]
---

# Variance analysis: from a finance number to an operational cause

Variance analysis compares what you planned with what happened, then explains the gap. Most guides stop at the arithmetic: split the gap into price, volume and mix. That is the easy half. The hard half is the hand-off. Finance can see that margin missed by 2 points. Operations knows what changed on the floor. Someone has to connect the two, and be honest when the evidence is thin.

This post gives a simple method for that connection. It is vendor-neutral and works with a spreadsheet. The numbers in it are made up for illustration.

## Decompose before you explain

Never explain a total. A total variance is a pile of smaller ones that often point in opposite directions. Break it down first.

A common split for revenue or margin is:

- **Volume:** you sold more or fewer units than planned.
- **Price:** you sold at a higher or lower price than planned.
- **Mix:** the share of high-margin and low-margin products changed.
- **Cost:** the unit cost of making or delivering moved.

Keep going until each line is small enough that one person could own it. Stop when the next split would not change who you call. A variance of "price, enterprise segment, EMEA" is something a person can chase. A variance of "margin" is not.

Here is how that looks in a short, fictional case. A distributor plans a 30% gross margin and lands at 28%. The total gap is 2 points. Split it up and four lines explain it: a discount table change, a promotion that shifted the mix, extra re-deliveries and a timing slip. Two of those are operational and fixable. One is a choice the business made on purpose. One will reverse next month. Each needs a different response, and none of that is visible in the number "28%".

## From driver to operational change

Now ask what changed in the business for each line. This is where finance and operations need to talk. For each driver, write a hypothesis in plain words, and name who can confirm it.

| Driver (hypothetical) | Variance | Operational hypothesis | Who can confirm |
|---|---|---|---|
| Price, mid-market | -0.6 pts | A discount table was updated in week 3 | Sales operations |
| Mix, product B | -0.5 pts | A promotion pushed low-margin volume | Marketing |
| Cost, delivery | -0.7 pts | More failed first deliveries and re-sends | Fulfilment lead |
| Volume, product A | +0.2 pts | Demand held up better than planned | Demand planning |
| Timing | -0.4 pts | Two large invoices slipped into next month | Finance |

This table is an illustration for a fictional business. The habit matters more than the numbers: every line gets a hypothesis, an owner and a way to check.

Operational data is where the checks live. Failed deliveries, order changes, rework and contact volumes are all events your systems already record. If you can line them up by week or by segment, you can test each hypothesis instead of arguing about it. Our piece on [how business events connect to outcomes](/resources/how-business-events-connect-to-outcomes/) shows how.

## Evidence grades: observed, plausible, verified

Most variance commentary sounds more certain than it is. A simple three-grade scale keeps you honest.

1. **Observed.** The number moved. That is a fact. "Delivery cost per order rose 9%."
2. **Plausible.** An operational change happened around the same time and could explain it. "Failed first deliveries doubled in the same weeks."
3. **Verified.** You have checked that the change caused the move, for example by comparing affected and unaffected segments, or by seeing the effect reverse when the cause was fixed.

Two things happening together is not proof of cause. A promotion and a margin dip may both be driven by something else, such as a seasonal shift. Say "plausible" when that is all you have. It is fine to write "we do not know yet" and name the next check. That sentence builds more trust than a confident guess that turns out wrong.

Label each line of your bridge with its grade. A reader can then see at a glance which parts of the story are solid.

## Common traps: mix shifts, timing and one-offs

A few patterns cause most wrong explanations.

- **Mix hiding as efficiency.** If you sold more of a cheaper product, unit cost can fall without anyone working better. Always check mix before praising or blaming a team.
- **Timing.** Revenue booked a week late looks like a miss this month and a beat next month. Check cut-offs and invoicing dates before you look for a business cause.
- **One-offs.** A single large credit note or a one-time clean-up can swamp a month. Show it as its own line so it does not distort the rest.
- **Averages.** A flat average can hide one segment up and another down. Cut by segment before you accept "no change".
- **Definitions.** If a measure changed meaning between plan and actual, the variance is partly an artefact. A clear [KPI tree](/blog/how-to-build-a-kpi-tree/) helps you spot this, because every number has a written definition and parent.

## Writing the variance commentary

Good commentary is short and structured. Aim for a few lines per significant driver, in this order:

1. **What moved**, with the size.
2. **Why we think so**, with the evidence grade.
3. **What we are doing**, with an owner and a date.
4. **What we still don't know.**

Skip variances too small to matter. Agree a threshold in advance, such as "anything over 0.3 points or 25,000 in value". Write for someone who was not in the meeting. Avoid phrases like "headwinds" that sound explanatory but say nothing.

## Making it a routine

Variance analysis works best as a habit, not a fire drill at month-end. A light routine looks like this:

- **Weekly:** look at the operational drivers that tend to feed margin, such as delivery cost per order, order changes and contacts per order. Catch movement early.
- **Monthly:** run the full bridge, with grades, and review open hypotheses from last month.
- **Quarterly:** check whether your plan assumptions still hold, and update them.

The weekly step is the one most teams skip, and it is the one that saves the month-end scramble. A related habit is a regular [weekly business review](/blog/weekly-business-review/).

Panoptes is designed to support the operational side of this: connecting business events to a model of customers, orders and processes, so that a finance variance can be traced to the events behind it. Its root cause features, described on the [root cause analysis](/platform/root-cause-analysis/) page, are intended to keep correlation and verified cause apart. It is not an FP&A or budgeting tool, and it is designed to sit beside your finance systems. If you would like to see how [finance teams](/solutions/finance/) could use it on one of your variances, [book a demo](/demo/).

## Frequently asked questions

### What is variance analysis?

It is the process of comparing planned and actual results, measuring the gap, and explaining the causes. It is used for revenue, cost and margin, and is a core part of month-end and forecasting reviews.

### What is a favourable variance?

A favourable variance is one that improves profit against plan, such as higher revenue or lower cost. An unfavourable one reduces profit against plan. Favourable does not always mean good. A cost saving from cutting quality may cause problems later.

### How do I know if a variance is worth investigating?

Set a threshold in advance, based on value or percentage, and investigate anything above it. Also look at small variances that repeat for several periods, since steady drift can matter more than a single jump.

### Can AI explain a variance for me?

It can help to find patterns and draft commentary, but treat its output as a hypothesis. Ask what evidence supports each explanation and whether a person has checked it. The grades above apply to any explanation, from a person or a tool.
