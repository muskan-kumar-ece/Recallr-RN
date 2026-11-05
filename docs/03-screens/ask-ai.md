# Ask AI

**Route:** `(tabs)/ask` (params: `contact`, `category`, `q` for prefilled text)

## Layout
1. **Header:** sparkles icon tile, "Ask Recallr", caption "Answers from your network", round history button (list of past conversations, tap to open, swipe to delete).
2. **Conversation** (scrolls), message types:
   - **User bubble:** accent fill, white text, right aligned, max 80% width.
   - **Assistant bubble:** white card, left aligned, max 92% width.
   - **Person card** inside an assistant message: mini card with avatar, name, role and company, OrangeCorner `sm` arrow (opens profile).
   - **Source line:** caption with file icon, "From his profile and 2 notes".
   - **Suggestion chips** (outline accent): one tap sends the text, for example "Set follow-up", "Show notes", "Draft a message".
   - **Question block:** assistant asks one thing, with quick reply chips (for example "Skip", "Pick from contacts").
   - **Confirm card:** title "Ready to save", FieldRows of what will change (a "New" tag next to things that will be created), buttons "Confirm" (primary small) and "Edit" (outline small). After Confirm: assistant line "Saved" and an undo toast.
3. **Input bar** (pinned): sparkles icon, placeholder "Ask or tell Recallr", OrangeCorner arrow-up as the send button. No microphone in v1.

## Empty conversation
Greeting plus 4 starter cards: "Who did I meet last month?", "Add a new contact", "Who do I know in plastics?", "Remind me to call...". Tapping sends the text.

## Context
Opened from a contact: header caption becomes "About {name}" and the contact id is sent as context. Opened from a category: "About {category}".

## States
- **Typing:** three animated dots in an assistant bubble.
- **Limit reached (Free, 5 per day):** assistant-style card "You've used today's questions" with button "See Recallr Pro" (opens upgrade) and text "Come back tomorrow".
- **Error:** assistant card "Recallr couldn't answer. Try again." with a "Try again" chip. A failed call does not count.
- **Offline:** input disabled with Banner "Connect to ask Recallr".

## Done when
The two example conversations in `docs/06-ai-spec.md` work end to end, including Confirm and undo.
