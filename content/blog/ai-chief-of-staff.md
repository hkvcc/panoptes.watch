---
title: "AI Chief of Staff: What It Should Actually Do"
meta_description: "What an AI chief of staff should do for a leadership team: run the operating cadence, prepare reviews, track commitments and follow up, with people deciding."
author: "florian-andrews"
published: "2026-11-11"
category: "Operating cadence"
tags: ["AI chief of staff", "Agentic AI", "Operating cadence", "Leadership"]
primary_keyword: "AI chief of staff"
---

# AI chief of staff: what it should actually do

"AI chief of staff" has become a popular label for almost any assistant that summarises email or drafts a meeting agenda. Those are useful features, but they miss what a chief of staff actually does. A good chief of staff is not a better inbox. They run the operating cadence of a leadership team: they make sure the right issues reach the right meeting with the right evidence, that decisions are recorded, that commitments are followed up, and that nothing important falls between two executives' areas of responsibility.

An agentic AI chief of staff should be judged against that job. This article sets out what the role involves, which parts an agent can genuinely take on, which parts it should not, and what it needs underneath to do the work well. It reflects the direction I am working towards, so read it as a design argument rather than a product description.

## What a human chief of staff actually does

Strip away the variation between organisations and the role tends to cover five jobs:

1. **Run the cadence.** Own the rhythm of weekly operating reviews, monthly business reviews and quarterly planning, so that each meeting has a purpose and an agenda that reflects what is actually happening.
2. **Prepare the evidence.** Make sure that when an issue is discussed, the relevant facts are on the table: what changed, since when, how big it is, and what is already known about why.
3. **Record decisions.** Capture what was decided, by whom, and on what basis, so that the organisation does not relitigate the same question every quarter.
4. **Chase commitments.** Track the actions that came out of each meeting, follow up with owners, and surface the ones that are slipping before they become surprises.
5. **Cover the gaps.** Notice issues that span several teams and that no single executive owns, and get them in front of someone who can act.

None of these is glamorous, and all of them are where leadership teams quietly lose time. Most of the work is gathering, connecting and following up, which is exactly why it is a reasonable target for an agent.

## The operating cadence is the product

The single most important idea here is that an AI chief of staff should be organised around the operating cadence, not around a chat window. A chat assistant waits to be asked. A chief of staff works to a rhythm and comes to you.

A hypothetical weekly cycle for an agentic chief of staff might look like this:

| When | What the agent does | What people do |
| --- | --- | --- |
| Continuously | Watches business signals against expected ranges; notes deviations and links them to owners | Nothing, unless something is urgent |
| Two days before the review | Drafts the agenda from open deviations, slipping commitments and unresolved cross-team issues | Review owner adjusts priorities |
| One day before | Assembles an evidence pack per agenda item: what changed, scope, related signals, candidate explanations | Owners add context and correct the record |
| In the meeting | Keeps the decision log and the action list | Leaders discuss and decide |
| After the meeting | Distributes decisions and actions; sets follow-ups against each commitment's due date | Owners do the work |
| Through the week | Checks progress on commitments; flags slippage to the owner first, then to the review if it persists | Owners update or escalate |

Notice the split. The agent prepares, records and follows up. People prioritise, decide and act. That division is not a limitation to be engineered away; it is the design.

## What an agent should not do

There are parts of the chief of staff role that an agent should stay out of, at least for now and probably for good:

- **Make decisions.** An agent can lay out options and evidence. Choosing between them, especially where they involve trade-offs between teams or people, is a leadership responsibility.
- **Assert causes it cannot verify.** If conversion fell at the same time as a pricing change, the agent should say both happened and show the evidence, not announce that one caused the other. Correlation is a lead, not a conclusion.
- **Change systems on its own authority.** Routing a finding to an owner, scheduling a follow-up or drafting a message are coordination. Changing prices, pausing a campaign or altering a process should need explicit human approval.
- **Monitor individuals.** The subject of a chief of staff's attention should be the business (its processes, outcomes and commitments), not a ranking of employees' activity.

These boundaries are also what make the agent trustworthy enough to use. A leadership team that cannot predict what the agent will do on its own will not let it near the cadence.

## What the agent needs underneath

The difference between a convincing demo and a useful AI chief of staff is almost entirely in what sits underneath. Four foundations matter:

**A model of the business.** To notice that a problem spans several teams, the agent needs to know how those teams' work connects: that a verification backlog affects onboarding, which affects activation, which affects renewal. Without that structure it can only summarise each team's reports in isolation. This is why we think of a connected [business graph](/platform/business-graph/) as the prerequisite, not an add-on.

**Expectations, not just metrics.** An agent that reports every number every week adds noise. One that knows what normal looks like for each signal can bring only the deviations. Setting those expectations is a modelling task in its own right, covered in our guide to [business health metrics](/resources/business-health-metrics/).

**Ownership.** Every process stage and outcome needs an accountable owner in the model, or follow-up has nowhere to go. In practice, assembling the ownership map is often the first useful thing an organisation does in preparing for an agent.

**Evidence with provenance.** Every claim in an evidence pack should link back to the data it came from, so that an executive can check it in one click. Panoptes' [AI intelligence vision](/platform/ai-intelligence/) is built on the same rule: answers should show their working, and people should be able to verify them.

## How to start without an agent

You do not need an AI system to begin, and starting without one is the best way to find out what the agent should do. Run the cadence manually for a quarter with these disciplines:

1. **Write the agenda from deviations, not from a fixed list of slides.** Every item should be something that moved outside its expected range or a commitment that is slipping.
2. **Use a standard evidence format** for each item: what changed, since when, scope, related signals, what is known and unknown about the cause.
3. **Keep a decision log** with the decision, the owner, the evidence it rested on and a review date.
4. **Track every commitment** with an owner and a due date, and review the list at the start of each meeting.
5. **Note every cross-team issue** that did not have an obvious owner, and who eventually took it.

After a quarter, you will know which parts of the work are repetitive gathering and following up (good candidates for an agent) and which parts depend on judgement (keep those with people). You will also have built the foundations the agent needs: a list of the signals that matter, expected ranges, owners and an evidence format.

## Where this is heading

The case for an agentic chief of staff is not that it replaces the human role. Many organisations never had a chief of staff at all, and the operating cadence was simply something executives tried to hold together between other commitments. An agent that takes on the gathering, the record-keeping and the follow-up gives every leadership team some of that discipline.

The pieces are coming together: connected models of how a business runs, monitoring against expectations, [findings routed to accountable owners](/platform/actions-automation/) with human approval, and grounded answers to plain-language questions. Our [solutions for executives](/solutions/executives/) describe how Panoptes is designed to support leadership teams today. The agentic chief of staff is the next step on the same path, and the most useful way to get ready for it is to run your operating cadence as if one already existed.
