# Subscription, upgrade and limits

Plans and exact limits: see `docs/07-business-rules.md`. Billing is done with the store (Apple and Google) through RevenueCat. Never hard-code prices: show the price strings from the store.

## Subscription page: `settings/subscription`
Top bar: back, "Subscription".
- Plan card: caption "Current plan", "Free" (title), caption "Upgrade for unlimited everything", OrangeCorner "Upgrade" (opens upgrade). For Pro: "Pro", caption "Renews on {date}" or "Ends on {date}", corner "Manage".
- "Your usage": card with ProgressBars: Contacts "{used} of {limit}", Card scans this month, AI questions today. Hidden for Pro.
- Rows: Restore purchases; Manage in store account (opens the store subscription page).

## Upgrade screen: `upgrade` (modal)
Top: close (x) and "Restore" (text). Icon tile (crown), title "Recallr Pro", "Your whole network, no limits." Feature card with check rows: Unlimited contacts and card scans / Unlimited AI questions and actions / Multiple digital cards / 5 GB for documents / Export and backup. SegmentedControl Monthly and "Yearly · Save {X}%" (Yearly selected). Two plan cards (selected has accent border, soft accent background, OrangeCorner `md` with check): Yearly ("{price} per year · about {price per month} a month") and Monthly ("{price} per month"). Primary button "Start 7-day free trial". Caption "Then {price} per year. Cancel anytime in your store account." Links: Terms, Privacy.
The savings percent and the per-month price are computed from the store prices.
After purchase: close, show toast "Welcome to Pro", refresh entitlements.
If the user already used the trial, the button reads "Subscribe".

## Limit sheet (bottom sheet, appears at the moment of need)
Icon tile for the feature, title ("You've used all {N} scans this month", "You've reached {N} contacts", "You've used today's {N} AI questions", "Free includes 1 card"), one sentence, primary "See Recallr Pro" (opens upgrade), outline button with a free alternative where one exists ("Add manually" for scans), text "Maybe later".

Done when: a Free test account hits each limit and sees the right sheet; a sandbox purchase unlocks Pro within seconds; Restore works.
