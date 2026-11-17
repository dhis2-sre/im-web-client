# Presets: design

Date: 2026-11-13. Base branch: `feat/ui-revision` ([#980](https://github.com/dhis2-sre/im-web-client/pull/980)). Work branch: `feat/presets`.

## Intent

A preset is a saved dhis2-v2 configuration (its settings and companions) that people in a group start new instances from. Today presets can only be saved from a side door of the new instance form, they can't be edited, and starting from one drops every password and key. A prototype (uncommitted in the main checkout on `prototype/presets-ux`; a mixed backup is on `backup/presets-ux-with-phase0`) explored a fuller set of flows. This work brings the parts Joe confirmed to production, on the redesigned UI, against the new `/presets` resource in im-manager.

It is production code, not a prototype: the prototype is a reference for behaviour and copy, not code to copy over.

## Backend (im-manager [#1828](https://github.com/dhis2-sre/im-manager/pull/1828), merged 2026-11-12)

| Call                                   | Use                                                                                                                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET /presets`                         | list, in the groups the user belongs to                                                                                                                                        |
| `POST /presets`                        | save a preset with all its instances in one call (`SavePresetRequest`: name, group, description, ttl, instances[]); 409 if the name is taken                                   |
| `GET /presets/availability?group&name` | is a preset name free in a group (same response shape as the deployment name check)                                                                                            |
| `GET /presets/:id`                     | one preset; sensitive values come back masked                                                                                                                                  |
| `PATCH /presets/:id`                   | edit in place (`EditPresetRequest`: the deployment edit body plus `name` and `group`); left-out values stay, so masked values survive                                          |
| `DELETE /presets/:id`                  | delete, 204                                                                                                                                                                    |
| `POST /presets/:id/deployments`        | create (not deploy) one deployment from the preset, with decrypted sensitive values; body: name, optional group, description, ttl and `instances` overrides in the edit format |

Breaking: `GET /deployments/presets`, `preset`/`overwrite` on `POST /deployments`, and `preset=true` on `/deployments/availability` are gone, and `/deployments/:id` no longer returns presets. The client must ship with (or after) this backend release; there is no compatibility path.

Write access (edit, delete) is the owner while in the group, an admin of the group, or an administrator (`CanWriteDeployment`). The server enforces it.

### Known limit: copies lose sensitive values

The browser only ever sees sensitive values masked (dhis2-v2: custom dhis.conf, Google auth ×5, DB username/password, S3 ×3, Doris ×2; pgAdmin: login). Anything the client copies from a preset or an instance therefore can't carry them, and they fall back to the stack defaults. Joe chose to design around this rather than wait for backend support. Where it happens, a notice says so (see "Copy notice"). If the backend later adds a source id to `POST /presets` or a preset id to `POST /deployments/bulk`, those paths switch over and the notice goes.

## Goals

1. Manage presets from the Presets pages: create, edit (including rename and move group), duplicate, delete.
2. Start one instance from a preset with its passwords and keys intact.
3. Start several instances from a preset or from the form.
4. Save an existing instance's settings as a preset, or a blank new instance form's configuration.

## Non-goals

- Presets for stacks other than dhis2-v2.
- "Start numbering at" in Create several (the bulk endpoint always numbers from 1).
- The prototype's summary card on the preset page (the facts line was deliberately trimmed to match the instance page).
- The prototype's "Save as…" on the edit page (Duplicate covers it).
- Backend changes.

## Anti-goals

- Silently losing a password or key. Every lossy copy says so.
- A rename or edit that changes a preset's id or drops its saved values (the prototype's save-new-then-delete-old trick).
- Changing a shared preset as a side effect of creating an instance: the new instance form never writes to the preset it was filled from.

## The UI, screen by screen

Mockups for each screen were reviewed with Joe; the descriptions below are what was agreed.

### 1. Presets list (`/presets`) and preset page (`/presets/:id`)

- Both read from `/presets` and `/presets/:id`. The preset page's "Not a preset" error state goes, since `/presets/:id` only returns presets.
- List: a primary **New preset** button in the page header, placed as **New instance** is on the instances list. It goes to `/presets/new`.
- Each row has **Create instance** (to `/instances/new?preset=:id`; was "Use preset") and gains a ··· `ActionsMenu`: **Create several instances…**, **Edit**, **Duplicate**, **Delete**. The preset page's existing ··· menu (today only Delete) gets the same four, beside its primary **Create instance**.
    - Create several opens the dialog from screen 4 for that preset. Edit goes to `/presets/:id/edit`. Duplicate goes to `/presets/new?from=:id`. Delete keeps today's confirm dialog and copy.
    - Create instance and Create several are disabled for a preset with no dhis2-v2 instance.
- Empty state description: "Create one with New preset, or save one from an instance."
- Unchanged: grouping by group, search, group filter, Only mine, the columns, the facts line, the Stacks panels.

### 2. Preset page form: new, edit, duplicate

One page component, three routes: `/presets/new`, `/presets/:id/edit`, `/presets/new?from=:id` (duplicate), plus `/presets/new?instance=:id` (screen 5). It uses the same sections as the new instance form (`Dhis2V2Form`) with no deploy progress panel.

- Title: "New preset", "Edit {name}", "Duplicate {name}", "New preset from {instance}". Parent link: Presets, or the preset/instance it came from.
- Intro under the title on New: "A saved configuration to start new instances from. Nothing is deployed."
- Fields: Group, Name, Description, Lifetime, then the DHIS2 and companion sections as in the new instance form. Group and Name are editable in all modes, including Edit.
- Name: checked as you type with `GET /presets/availability`; on Edit, the preset's own name in its own group counts as free. A 409 on save is shown on the form.
- Lifetime label: "Lifetime of instances created from it".
- Save:
    - New, duplicate, from an instance: `POST /presets` with the full configuration, built as the new instance form builds it (same included parameters, companions, no confirm-password fields). Button "Save preset".
    - Edit: `PATCH /presets/:id` with only what changed, built like the instance edit payload (`buildEditPayload`), plus `name`/`group` when changed. Button "Save". Disabled while nothing has changed.
    - Sensitive fields on Edit behave as on the instance edit form: blank with "Leave blank to keep current value", not required. Unlike the instance edit form, nothing is immutable on a preset (no `immutableReasons`).
    - On success: alert "Saved preset {name}" and go to `/presets/:id`.
- Cancel returns to where the page came from.
- Edit: switching a companion off asks first, with the same confirm the instance edit form uses, since it drops that companion's saved login. (My call.)
- Duplicate pre-fills Name with `{name}-copy`. Duplicate and from-an-instance show the copy notice.

### 3. New instance form (`/instances/new`)

**Fill from preset** (replaces today's "Presets" fieldset and its Delete preset button). Updated 2026-11-17: picking a preset is an action, not a state, so nothing on the form keeps claiming it _is_ the preset once edited.

- A toolbar across the top of the form card (8px padding, 1px grey300 line under it) holds a **Fill from preset** menu button. The menu has a search, presets grouped by group with the summary line under each name, and **Blank form** at the bottom. The toolbar shows only when there are dhis2-v2 presets.
- Picking a preset fills the form from `/presets/:id`, replacing everything. An inline note beside the button, "✓ Filled from **{name}**" (or "Cleared the form" for Blank form), shows until the first change. No Undo, View preset or Reset.
- Sensitive fields filled from a preset say "Leave blank to keep {name}'s value", the one place the preset still shows, since creation copies its stored values.
- Picking another preset or Blank after the user changed something asks first: dialog "Replace your changes?", body "Filling the form from **{name}** replaces everything you've changed." (or "Starting from a blank form clears everything you've changed."), buttons Keep editing / Replace. "Changed" means a field that differs from the loaded preset; on a blank form, a field the user actually touched.
- Blank resets to the form as it opens, keeping the chosen group.
- Name: the preset name with the first number free in the group (`{name}-1`, `-2`, …), from the existing `/deployments/bulk/availability`; falls back to `{name}-1`.
- `?preset=:id` (from Create instance on a preset) loads that preset once on open, with the same note.

**Creating from a preset:**

- Filled from a preset, Create instance calls `POST /presets/:id/deployments` with name, group, description, ttl and `instances` holding only what differs from the preset (edit format, so turning a companion on or off is a change). Then `POST /deployments/:id/deploy` and go to the details page, as today.
- Sensitive fields show blank with a placeholder meaning "from the preset" and aren't required; typing one overrides it.
- A blank form creates as today (`POST /deployments`, instances, deploy).
- The deploy progress panel still shows; when creating from a preset, the instances are registered in one call, so the steps settle together.

**Preset section**, the last section before the buttons, on a blank form only:

- Checkbox "Save this configuration as a preset"; when ticked, a Preset name field (checked with `/presets/availability`), defaulting to the instance name.
- On submit, the preset is saved first (`POST /presets`). If that fails, nothing is created and the error shows on the form ("Couldn't save the preset: …"). On success, alert "Saved preset {name}", then create the instance.
- A form filled from a preset has no Preset section: presets only prefill the form, and the form isn't connected to the preset afterwards. Presets are changed on their own pages (Edit, Duplicate) or saved from an instance (screen 5). (Joe's call, 2026-11-17: an earlier version offered "Update {preset}" and "Save as a new preset" here; dropped as unneeded now that presets can be edited properly.)

**Buttons:** the split button and its menu go. The strip is: **Create instance** (primary), **Create several instances…** (secondary), **Cancel**.

### 4. Create several instances dialog

Today's Bulk deploy dialog (`BulkDeployModal`), renamed and extended. Opened from the form's Create several instances… and from a preset's ··· menu (with that preset's values, without passing through the form).

- Title "Create several instances". Button "Create {n} instances" ("Create" when n is invalid). Error titles: "Nothing was created" (refused) / "Some instances may have been created".
- Summary line under the intro: "Each instance: DHIS2 {tag} · {database label} · {storage} · {lifetime} lifetime", skipping missing parts.
- Totals under the names: "In total: **{disk}** of disk and **{memory}** of requested memory ({each} each)." Disk is database size plus the file store size (minio or filesystem); memory is core and DB memory requests, plus Doris frontend and backend when Doris is on. Kubernetes quantities (Gi, Mi, G, …) are converted to Gi; anything unreadable counts as zero. Hidden when both totals are zero.
- Busy warning from `GET /groups/:group/resources`: when the cluster isn't autoscaled and CPU or memory use is at or above 70%, a warning "{group} is already busy", body "It's using {cpu} of its CPU and {memory} of its memory. {n} more instances may not fit."
- Still `POST /deployments/bulk` with the full configuration. When the values came from a preset, the copy notice shows ("…so these instances get the stack defaults").
- Opened from a preset's ··· menu, the dialog also asks for any required sensitive value that has no default and that the copy can't carry, for the stacks the preset includes. Today that is the pgAdmin login (`PGADMIN_USERNAME`, `PGADMIN_PASSWORD`) when pgAdmin is on; it is derived from the stack definitions (required, sensitive, no default), not hard-coded. Create stays disabled until they're filled.
- From a blank form: if the Preset section's checkbox is ticked, the preset is saved first, as with Create instance.

### 5. Save as preset from an instance

- A **Save as preset** item in the instance ··· menu (list and details page share `InstanceActionsMenu`), after Edit. No ellipsis: it navigates (house rule: "…" only when a dialog opens). Only for deployments with a dhis2-v2 instance.
- Goes to `/presets/new?instance=:id`: the preset page form filled from `GET /deployments/:id`, Name defaulting to the instance name, Group to its group, with the copy notice. Saved with `POST /presets`.

### Copy notice

One component, used wherever the browser copies settings:

- Title "Passwords and keys aren't copied". Body: "Passwords, keys and the custom dhis.conf of {source} can't be copied, so {the preset starts | these instances get} the stack defaults. Enter any you need in the form." (the last sentence only on forms).
- Shown on: Duplicate, New preset from an instance, Create several when the values came from a preset.
- Not shown on: Create instance from a preset, Edit preset (neither copies).
- It shows every time on those paths: the client can't tell whether a masked value differs from the default.

### Required values a copy can't carry

Some sensitive parameters are required and have no default (today the pgAdmin login). A copy that drops them is refused by the server with a 400, so wherever the client copies, those fields are required again (Joe's choice, over looping the single preset endpoint):

- Duplicate and New preset from an instance: already required, since those forms are in create mode.
- New instance form filled from a preset: Create several asks for them in its dialog (my call, kept by Joe until the backend decides whether bulk can carry a preset's stored values). Creating a single instance from the preset doesn't need them (the server carries them).
- Create several from a preset's ··· menu: the dialog asks for them (screen 4).

## Mock API

`~/Documents/github/im-mock-api` (local only, never pushed) gets the new routes so the UI can be built and checked against it: all seven `/presets` routes with the shapes above (409 on taken names, masked sensitive values on reads, PATCH merging only what's sent, including rename and move), and the removal of `/deployments/presets`. `/presets/:id/deployments` should keep the preset's unmasked values server-side so the "carries passwords" path can be seen working. Add a seed-cases preset whose sensitive values differ from the defaults.

## Left to the builder

- Component and file structure, and how much of the prototype's code shape to reuse.
- How the preset page form and the new instance form share creation logic.
- Exact styling within the ui-revision components (`Page`, `ListPage`, `ActionsMenu`, `ConfirmationModal`, alerts).
- Regenerating or hand-editing the generated API types for the new requests.
- Tests: follow the repo's existing patterns (unit tests next to pure helpers such as payload builders and the resource maths; e2e only if an existing spec covers presets).
- Copy not quoted above, following the copy review's tone.
