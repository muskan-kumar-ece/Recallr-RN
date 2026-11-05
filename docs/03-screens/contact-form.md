# Add and edit contact

**Routes:** `contact/new` (optionally `?category={id}`), `contact/[id]/edit`

## Layout
Top bar: close (x), title "New contact" or "Edit contact", "Save" (accent text).
1. **Photo:** 84 px avatar with a camera badge (28 px accent circle). Tap: Take photo, Choose photo, Remove.
2. **Fields card (FieldRows):** Name (required), Role, Company, Phone, Email, Address, and a last row "+ Add field" (adds Website, LinkedIn, Instagram or Other, stored in `links`).
3. **Categories:** header "Categories", multi select Chips plus dashed "+ New" (opens category sheet inline).
4. **How you met:** FieldRows for Where, Date, Tags (tag chips; type and press return to add).
5. **Notes (new only):** optional first note field.
6. Primary button "Save changes" (edit) or "Save contact" (new). Edit mode also shows text button "Delete contact" (danger) at the bottom.

## Validation
Name required. Phone: digits, spaces, + and dashes; at least 7 digits. Email: valid format. Date not in the future. Tags max 10, each max 24 characters.

## Behavior
- On save, run duplicate check (business rules). If a match is found, show Banner "{name} may already exist." with actions Merge and Keep both.
- Free plan at 50 contacts: show the limit sheet instead of saving (subscription.md).
- Back with unsaved changes opens a sheet "Discard changes?" with Discard and Keep editing.
- Delete is a soft delete with undo toast, then returns to People.

## Done when
- New, edit, delete and undo all work; duplicate banner appears for the same phone number
- Category created inline appears selected immediately
