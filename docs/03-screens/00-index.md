# Screen index

Routes use Expo Router. Reference sketches go in `docs/reference/<file-name>.png`.

| Spec file | Route | Entry points |
|---|---|---|
| onboarding.md | (auth)/welcome, sign-in, starter-categories | first launch |
| home.md | (tabs)/index | tab |
| people.md | (tabs)/people | tab, Home links |
| contact-profile.md | contact/[id] | People, Home, Search, AI cards |
| contact-form.md | contact/new, contact/[id]/edit | Quick Add, profile |
| share-contact.md | sheet on contact/[id] | profile menu |
| merge-duplicates.md | merge | duplicate banner, profile menu |
| quick-add.md | sheet on tabs | center + |
| scan-card.md | scan, scan-review | Quick Add, Home |
| import-contacts.md | import | Quick Add |
| notes.md | (tabs)/notes | tab, Home |
| note-editor.md | note/new, note/[id] | Notes, profile, Home |
| ask-ai.md | (tabs)/ask | tab, profile, categories |
| search.md | search | Home, Notes |
| categories.md | categories, category/[id], category sheet | Home, People |
| my-card.md | my-card, my-card/edit, my-card/settings, public page | Home, Settings |
| settings.md | settings, settings/notifications | Home avatar |
| subscription.md | settings/subscription, upgrade, limit sheet | Settings, limits |
| document-viewer.md | document/[id] | profile, note |
| shared-states.md | (components) | everywhere |

Every spec uses this template: Purpose, Route, Layout (top to bottom), Data, Actions, States, Done when.
