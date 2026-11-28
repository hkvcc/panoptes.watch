---
title: "Cross-Functional Handoffs: Where Work Waits"
meta_description: "Handoffs between teams are where work waits longest and nobody owns the delay. Define each handoff as two events, measure the gap and assign an owner."
author: "kieran-lovell"
published: "2026-11-28"
category: "Processes and journeys"
tags: ["Process monitoring", "Operations", "Process mapping"]
primary_keyword: "cross-functional handoffs"
---

# Cross-functional handoffs: where work waits and nobody owns it

A handoff is the moment work passes from one team to another: sales to onboarding, onboarding to risk, billing to collections. Handoffs are where work tends to wait longest, because each team is measured on its own stage and nobody is measured on the space between them. The fix is not a new meeting. It is to treat each handoff as a pair of events, measure the gap between them, give that gap an owner, and say how long it should take.

This post sets out that method. It is vendor-neutral and works with a spreadsheet and the event timestamps your systems already hold. All numbers in the examples are made up for illustration.

## Why handoffs are where time goes

Inside a team, work has an owner, a queue and usually a manager watching it. At a handoff, three things go missing at once.

- **Ownership.** The sending team thinks the job is done. The receiving team does not know it exists yet. For a while it belongs to nobody.
- **Visibility.** Each team has its own tool and its own status names. "Sent" in one system is not "received" in the next.
- **Measurement.** Stage targets such as "review within two days" start the clock when the receiving team picks the item up. Time spent waiting to be picked up is in nobody's number.

The result is a familiar pattern. Every team reports that it meets its target, yet the customer still waits. Our guide to [business process analysis before automation](/blog/business-process-analysis-before-automation/) makes a similar point: map how work really moves before you decide what to change. Handoffs are the first place to look.

This is different from a capacity problem. A bottleneck is a stage that cannot keep up with demand, which we cover in [understanding business bottlenecks](/resources/understanding-business-bottlenecks/). A handoff gap can exist even when the receiving team has plenty of capacity. The work is simply not visible to them, or not clearly theirs.

## Define a handoff as two events

To measure a handoff you need exactly two timestamps for the same item:

1. **The "from" event:** the moment the sending team considers its part finished. For example, `contract_signed`.
2. **The "to" event:** the moment the receiving team actually starts. For example, `onboarding_started`.

The handoff gap is the time between the two. Nothing else is needed to begin. Both events usually exist already as status changes or audit-log entries. If you want a longer list of what to record at each stage, see our guide to [business process monitoring](/resources/business-process-monitoring/).

Two rules keep the definition honest:

- **Use the same item identifier on both sides.** If the order number in sales is not the one used in fulfilment, you cannot pair the events. Agree a shared identifier first.
- **Agree what "done" and "started" mean with both teams.** "Started" should mean someone has taken the item and begun working it, not that it appeared in a queue.

## Measuring the gap

Once events are paired, calculate for each handoff over a period:

- **Median and 90th percentile gap.** The median shows the typical wait. The 90th percentile shows how bad it gets, and it is often the one customers feel.
- **Items currently waiting.** Items with a "from" event but no "to" event yet, and how old each is. This is the live view.
- **Items that bounce.** Items sent back to the sender, which create a second gap in the other direction.

A simple relationship helps you sanity-check what you see. Little's law says the average number of items in a system equals the arrival rate multiplied by the average time each spends there. Applied to a handoff, if 20 items arrive a day and the average gap is 3 days, you should expect about 60 items waiting at any moment. If you count far more, something is distorting the picture, such as items abandoned and never closed.

Be careful about what the gap does and does not prove. A long gap tells you that work waited, not why. Possible causes include a missing notification, unclear ownership, a missing document, or genuine lack of capacity. Treat each as a hypothesis, and check it, for example by looking at whether gaps are longer for one source or one product, before you act.

## Owning the gap, not just the stages

This is the step most organisations skip. Each stage has an owner. The gap between stages does not.

Assign each handoff gap a single named owner. A useful default is the **sending team**, because they know the item exists and can make sure it is picked up. Another option is a named process owner who spans both. What does not work is "both teams", which means neither.

A simple responsibility matrix per handoff keeps it clear:

| Role | Who | What they do |
|---|---|---|
| Accountable for the gap | One named person | Watches the gap, escalates when it is outside expectation |
| Responsible for sending | Sending team | Makes sure the handoff is complete and visible |
| Responsible for starting | Receiving team | Picks up the item and records the start |
| Informed | Customer-facing owner | Knows if a customer's item is waiting |

The point is not the grid. The point is that a person can answer, for any item waiting between two teams, "whose job is it to move this?"

## Expectations for handoffs

A gap with no expected duration cannot be late. Agree an expectation for each handoff, set with both teams and based on the data you now have, not on hope.

- Start from the measured median and 90th percentile.
- Set the expectation as a time limit and a share of items, for instance "90% start within one working day".
- Alert on items that have been waiting beyond the limit, not on averages. An average can look fine while a few items wait for weeks.
- Review the expectation each quarter, and tighten it only when the process has actually improved.

## A handoff register you can copy

Keep one row per handoff. It can live in a spreadsheet to begin with.

| Handoff | From event | To event | Owner of the gap | Expected gap | Current gap (median / 90th) |
|---|---|---|---|---|---|
| Sales to onboarding | `contract_signed` | `onboarding_started` | Head of sales operations | 90% within 1 working day | 1.5 days / 6 days |
| Onboarding to risk review | `verification_completed` | `risk_review_started` | Onboarding lead | 90% within 1 working day | 0.8 days / 3 days |
| Billing to collections | `invoice_overdue` | `collections_contact_made` | Finance operations manager | 90% within 2 working days | 2 days / 9 days |

The rows above are a fictional example. Use your own events and owners.

## Worked example (hypothetical)

A fictional B2B software company signs a contract with a customer and hands them to onboarding. Both teams report hitting their targets: sales closes within plan, and onboarding completes setup in a median of 5 days from when it starts. Yet customers say it takes a month to get going.

The team builds a register and pairs `contract_signed` with `onboarding_started`. The median gap is 6 days and the 90th percentile is 19. Neither team's target covers it. Looking at the waiting items, most of the long gaps involve contracts signed with a custom clause, which land in a legal review inbox that onboarding cannot see.

That is a hypothesis, so they check it: they compare gaps for custom and standard contracts and find the pattern holds. They name the head of sales operations as owner of the gap, add the contract status to the onboarding queue, and agree that 90% of handoffs should start within one working day. They then track the register for a quarter to see whether the 90th percentile moves.

Nothing in this story needed new software. It needed two events, a pairing identifier, an owner and an expectation.

## Where observability helps

If your handoff events live in several systems, pairing them by hand gets tedious. Panoptes is designed to bring events from different systems together around the same customer or order, so that the time between stages can be seen and investigated as it happens. See [operational bottlenecks](/use-cases/operational-bottlenecks/) for the related investigation, and [book a demo](/demo/) to talk through your own process. It is not a replacement for agreeing ownership, which is a people decision whichever tool you use.

## Frequently asked questions

### What is a handoff in a business process?

It is the point where responsibility for a piece of work moves from one person or team to another, such as from sales to onboarding. Handoffs often cross tools and reporting lines, which makes them hard to see.

### Why do handoffs cause delays?

Because ownership, visibility and measurement tend to stop at the edge of each team. The time between teams belongs to nobody, so nobody is prompted to reduce it.

### How do I measure a handoff delay?

Record two timestamps for the same item: when the sending team finished and when the receiving team started. The difference is the handoff gap. Report the median and the 90th percentile, and list the items still waiting.

### Who should own a handoff?

One named person. Often it is the sender, or a process owner who spans both teams. Shared ownership by two teams usually means no ownership.

### Can automation remove handoffs?

It can remove some manual steps and make others visible, but it does not decide who owns the gap. Map and measure the handoff first, so you automate the right thing.
