# Onboarding

**Purpose:** get a new user signed in and to their first saved contact in under a minute.
**Routes:** `(auth)/welcome`, `(auth)/sign-in`, `(auth)/starter-categories`. Shown only when signed out or when `onboarding_done` is false.

## 1. Welcome (3 slides)
Layout: Skip (top right) / illustration (two stacked white cards rotated -8 and +5 degrees, orange corners, floating chip "Who is Ramesh?") / title (titleLg) / one sentence (body, textSecondary) / dots (active dot is a 22x6 accent pill) / primary button "Continue".
Slide copy:
1. "Remember everyone you meet" / "Scan a business card and Recallr saves the person, the place you met and what you talked about."
2. "Ask your network anything" / "Ask who someone is, who you know in an industry, or tell Recallr to add people for you."
3. "Never miss a follow-up" / "Set reminders on people and get nudged when it has been too long."
Last slide button reads "Get started". Skip goes to sign in.

## 2. Sign in
Layout: logo (40 px orange rounded square with "R") + "Recallr" / title "Create your account" / "Your network, safe and always with you." / phone field (+91 prefix, number) / primary "Send OTP" / divider "or" / outline button "Continue with Google" / small legal text with Terms and Privacy links.
Behavior: phone OTP is the main path. After OTP entry screen (6 digits, resend after 30 s), on success go to starter categories if first time, else Home.

## 3. Starter categories
Title "Who do you want to remember?" / "Pick a few to start. You can change these anytime."
2-column cards (selectable, orange outline and filled check when selected): School Friends, Colleagues, App Developers, Clients, Suppliers, plus dashed "Create your own" (opens the category sheet). Button "Continue (N selected)"; with 0 selected the button reads "Continue" and still works.
Creates the selected categories, sets `onboarding_done = true`, goes to Home.

## States
Sending OTP: button loading. Wrong OTP: inline error "That code is not right. Try again." Network error: Banner. Permissions are NOT requested here.

## Done when
- A new user can sign in with a test phone number and Google, pick categories and land on Home
- Skip works, back works, the state is remembered after restarting the app
