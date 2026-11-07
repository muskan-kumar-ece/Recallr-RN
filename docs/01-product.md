# 01. Product overview

## One line
Recallr helps people remember everyone they meet: save contacts (by scanning business cards), organize them in categories, keep notes and reminders, and ask an AI "who is this?" and get answers from their own network.

## Who it is for
People who meet many people and need to remember context: business owners, freelancers, sales and marketing people, students, event attendees. First market: India. Language in v1: English only.

## Core promises
1. **Capture fast:** a business card becomes a contact in about 10 seconds.
2. **Remember context:** where you met, notes, files, last contact.
3. **Never miss a follow-up:** reminders and nudges.
4. **Ask your network:** the AI answers only from the user's own data.
5. **Share yourself:** a digital card with a QR code.

## Platforms
- **Mobile:** iOS and Android (one Expo codebase in `apps/mobile`).
- **Web:** Full web application and public card host in Next.js App Router (`apps/web`).
- **Public card page:** Responsive web card page at `/c/[slug]` with vCard download and app store links.
- **Backend:** One shared Firebase backend (Firebase Auth, Cloud Firestore, Cloud Storage, Cloud Functions).

## v1 scope (build this)
Onboarding and sign in; Home; People (with desktop split view on web); Contact profile, add, edit, share, merge; Categories; Quick Add; business card scan (camera on mobile, image upload on web); contact import (phone contacts on mobile, CSV/vCard on web); Notes and reminders (local notifications on mobile, server-scheduled push for cross-platform delivery); Search; AI chat (questions and confirmed actions); My Card with QR and public page (`/c/[slug]`); Settings and notification settings; Free and Pro subscription (in-app purchase on mobile, usage and plan inspection on web); document attachments; shared states (empty, loading, error, offline, undo); hidden `/dev/components` parity showcase on both mobile and web.

## NOT in v1 (do not build, do not add UI for)
- Team or Business plan, shared workspaces
- Dark mode (light only)
- Voice input or voice notes, microphone button
- Auto-capture while scanning (manual shutter only)
- "Ask before sharing my number" request flow for cards
- Card update notifications ("Ramesh updated his card")
- NFC sharing, Apple or Google Wallet pass, card view statistics
- Native in-app PDF preview on mobile (open PDFs in the system viewer; web previews in browser)
- Web payment checkout (web v1 displays plan/usage and directs to the mobile app for subscription management)
- Desktop native apps (Electron/Tauri)
- Languages other than English

## Glossary (use these words exactly)
- **Contact / Person:** someone in the user's network.
- **Category:** a user-made group (for example "School Friends"). A contact can be in many categories.
- **Uncategorized:** contacts that are in no category.
- **Note:** text the user writes, optionally linked to a contact.
- **Reminder:** a note that has a reminder time.
- **Follow-up:** a reminder linked to a contact. Also the "Needs follow-up" list (see business rules).
- **My Card:** the user's own digital business card, shown as a QR code and public page.
- **Quick Add:** the sheet opened by the center + button or top bar button.
- **Pending action:** an AI proposed change waiting for the user's Confirm.
- **Free / Pro:** the two plans.
