# Project Sync — AMS, CMS (kurikula), elyui

Single source of truth across the four repos that make up this ecosystem. Any Claude
session working in any of these repos should read this file first. Update it whenever a
cross-repo fact changes (a new elyui component ships, a backend contract changes, a
priority shifts) — don't let it drift into aspiration.

Owner: paulelyson (polusesmercur@gmail.com). Last written: 2026-09-16.

## Repo map

| Repo | Path | Stack | State |
|---|---|---|---|
| **AMS frontend** | `~/Documents/personals/asset-management-system-frontend` |Angular 21, zoneless, signals | Inventory + borrowing built; consumes elyui |
| **AMS backend** | `~/Documents/personals/asset-management-system-backend-v2` | NestJS 11 + Mongoose 9 | 3 of 12 modules real |
| ~~AMS backend (legacy)~~ | `~/Documents/personals/asset-management-system-backend` | Express 5 + Mongoose | **Dead. Do not edit.** |
| **CMS / kurikula** | `~/Documents/personals/kurikula-frontend` | Angular 21 | ~30% of v1; dormant 2026-04-28 → 2026-09-13, now being revived |
| **CMS backend** | `~/Documents/personals/kurikula-backend` | NestJS 12, ESM, vitest | Serves the 6 contract endpoints on `:3001` behind a global auth guard |
| **elyui** | `~/Documents/personals/elyui` | Angular 21 library | `@paulelyson/elyui@0.7.0`, 18 components published |

`asset-management-system-backend` (no `-v2` suffix) is **not** a fallback or a parallel
branch — it is dead. Nothing should read from it, seed from it, or be reconciled against
it except the one item below.

### Why there are two backends

The project started as Express + plain JavaScript when the author was a newer developer,
was rewritten in TypeScript as experience grew, and was rebuilt a third time on NestJS
once it became clear NestJS covered the same ground, unopinionated, with less
boilerplate. `-v2` is that third generation and is the only one that's live. The only
thing still owed to the legacy repo: if any old Mongo data from it is ever carried
forward, its borrow-status vocabulary needs remapping (`faculty_approved` →
`instructor_approved`, `faculty_rejected` → `instructor_cancelled`; v2 also added
`oic_cancelled`, which legacy never had).

## Runtime topology

**Changed 2026-09-13 — the two frontends no longer share one API.**

| Frontend | Dev port | API |
|---|---|---|
| AMS frontend | `localhost:4200` | AMS backend v2, `localhost:3000`, prefix `api` |
| kurikula | `localhost:4201` (now pinned in its `angular.json`) | CMS backend, `localhost:3001`, prefix `api` |

**Updated 2026-09-16 — the CMS backend exists and serves kurikula.** `kurikula-backend`
implements the six endpoints in `kurikula-frontend/docs/API-CONTRACT.md`: `GET /api/course`,
`GET /api/course-offering`, `GET /api/user`, `POST /api/user`, `GET /api/department`,
`GET /api/department/:id`, plus `GET /api` as a liveness check — and, since auth landed the
same day, the `/api/auth/*` family. **The reads are no longer public** — see the auth note
under the kurikula phase table.

The AMS backend still lists `http://localhost:4201` in its CORS origins
(`src/main.ts`). **Remove that entry once kurikula is verified green against `:3001`**,
not before — pulling it early cuts kurikula's only working API mid-migration.

### One database, two services

`users`, `assignments`, `departments`, `schools`, `courses`, `courseofferings`,
`locations` and `terms` live in **one Mongo database** (`asset_mgt_local`), fronted by
both APIs with their own Mongoose schemas. Decided 2026-09-16 — see Decided below.

The invariant that keeps that honest: **a schema's class name is its collection name.**
Mongoose pluralises and lowercases it, so renaming `Course` in one repo silently starts
writing to a second, empty collection while the other repo keeps using the first, with no
error anywhere. Every mirrored schema in `kurikula-backend` carries a `SHARED COLLECTION`
comment naming its AMS counterpart. Adding a field is usually safe; renaming, retyping or
changing a `unique` index is a two-repo change.

## Shared contracts

**`ApiResponse<T>` envelope drift.** `src/common/interceptors/response.interceptor.ts` in
the backend *declares* `interface ApiResponse<T> { data; message; success }` but the
interceptor actually *emits* 7 fields: `data, total, page, limit, hasNextPage, message,
success`. Both frontends' local `ApiResponse` models already have the correct 7 fields —
they were built against the real runtime shape, not the backend's stale type. If the
backend type is ever fixed, do it by widening it to match reality, not by trimming the
frontends. Longer-term this envelope belongs in a shared package (see elyui note below).

## Angular version matrix + the elyui adoption gate

| Repo | Angular |
|---|---|
| AMS frontend | 21.2 |
| kurikula | 21.2 |
| elyui (library + peer requirement) | 21.2 / `^21.0.0` |

`@paulelyson/elyui` declares `peerDependencies: { "@angular/core": "^21.0.0", ... }`. All
three repos are now on 21.2 stable, so the peer range is satisfied. AMS frontend upgraded
on 2026-08-27 and pins Material/CDK to `^21.2.14` — the exact versions elyui was built
against. Do not force-install against a peer range, and avoid the `21.3.0-next` prerelease
line that `ng update @angular/material@21` resolves to by default.

## elyui component inventory vs. what each app still hand-rolls

Published in `@paulelyson/elyui@0.7.0` (single entry point, no secondary entry points —
everything imports from `@paulelyson/elyui`):

- `Icon` (`ely-icon`), `Badge` (`ely-badge`), `Button` (`ely-button`), `Toggle`
  (`ely-toggle`), `SegmentedControl` (`ely-segmented-control`), `Textarea`
  (`ely-textarea`), `Snackbar` + `SnackbarService`.
- Added in **0.3.0**: `VerticalStepper` (`ely-vertical-stepper`), `TitleSection`
  (`ely-title-section`). Added in **0.4.0**: `TextInput` (`ely-input`) — note the class and
  the selector disagree; the `.d.ts` is the authority, and `public-api.ts` exporting
  `./components/input/input` does not mean the symbol is named `Input`.
- Added in **0.5.x**: `DataRow` (`ely-data-row`), `Autocomplete` (`ely-autocomplete`),
  `Dropdown` (`ely-dropdown`), `Datepicker` (`ely-datepicker`), `DateRangePicker`
  (`ely-date-range-picker`). All adopted in AMS on 2026-08-31 except `DateRangePicker`,
  which AMS has no use for — see the `datepicker` note below.
- Added in **0.6.0**: `FileInput` (`ely-file-input`) + the `FileRejection` type, and `Tab`
  (`ely-tab`) + the `TabOption` type. `FileInput` adopted 2026-09-01, `Tab` 2026-09-02.
- Added in **0.7.0**: `Avatar` (`ely-avatar`). Adopted 2026-09-03 — see below.

`Textarea` landed in **0.2.0** — it was absent from the published 0.1.3 bundle even though
elyui's `public-api.ts` exported it. The lesson stands regardless of that one fix: the
authority on what a consumer can import is
`node_modules/@paulelyson/elyui/types/paulelyson-elyui.d.ts`, never elyui's source tree.
Unlike `SegmentedControl`, `Textarea` **is** a `ControlValueAccessor`, so it plugs into
`formControlName` / `[formControl]` directly.

Also exported, and confirmed present in the published bundle: `ButtonConfig`, plus the
`Size` / `Variant` / `ButtonAppearance` / `ButtonShade` / `ButtonWidth` / `ISnackBarConfig`
/ `SnackBarType` / `SegmentedControlOption` / `FieldWidth` types. AMS's own `models/ui/common-config.model.ts`
and `button-config.model.ts` were byte-identical to elyui's, so `button-config.model.ts` is
deleted outright and `common-config.model.ts` keeps only `FilterDisplay`, which is
app-specific and not part of the library.

**`toggle-button-group` is intentionally dropped from the elyui migration** — it was an
empty stub in the source project and is superseded by `SegmentedControl` (see elyui
`CLAUDE.md`). Don't migrate it; replace its call sites with `ely-segmented-control`
instead.

As of 2026-09-02 AMS's own `src/app/modules/shared/` **no longer duplicates any published
elyui component** — `layout/` is gone entirely, `data-row` and `tab` having been its last two
occupants. Every form control and layout primitive in the app is elyui; Angular Material is
left doing dialogs, tooltips, the sidenav and dividers, and both
`@angular/material/form-field` and `@angular/material/tabs` are gone from the app. Still
hand-rolled because elyui hasn't shipped it: the dialogs.

`tab` migrated on **2026-09-02**: `src/app/modules/shared/layout/tab/` is deleted and `Tab`
comes from `@paulelyson/elyui`. `[tabs]` still accepts a plain `string[]` (a `normalizedTabs`
getter widens it to `TabOption[]`), so the one call site was a drop-in. API deltas nobody
felt, because that call site binds no outputs: `tabChange` now emits the whole `TabOption`
rather than the label string, and there's a new two-way `selected` / `selectedChange` (a
number). elyui hand-rolls the strip, so it also owns the arrow/Home/End keyboard handling
Material used to supply. This removed the last `mat-tab-group`, so those overrides came out
of `custom-theme.scss`.

The one call site was, at the time, still on a dead screen — migrating `tab` didn't fix
that on its own. **The screen (`src/app/modules/equipment-change-log/`) was deleted on
2026-09-08**, not routed: it was unreachable (no path in `app.routes.ts`, nothing imported
its module) and half-built (`onActionClicked` empty, `getChangeLogs` appending instead of
replacing). The live per-equipment change-log view is unaffected — it's a separate dialog,
`equipment-change-log-dialog`, opened from Inventory via a different service method
(`getChangeLogsByEquipment`). See `docs/BACKLOG.md` item 19 for the full delta.

`dropdown` migrated on **2026-08-31**: `src/app/modules/shared/dropdown/` is deleted and
`Dropdown` comes from `@paulelyson/elyui`. Only rename: the output `selectChanged` →
`valueChange`. `options` still accepts a plain `string[]` (a `normalizedOptions` getter
widens it to `DropdownOption[]` internally). Two things worth carrying forward: the local
component had **no `placeholder` input**, so `equipment-filter-dialog`'s
`placeholder="Select.."` had been an inert host attribute — elyui has the input, so that
filter no longer opens blank. And elyui renders a **native `<select>`**, which silently
displays its first option whenever the bound value isn't in `options` and no `placeholder`
is set; every AMS call site seeds a real default, but a control starting at `''` needs a
`placeholder`. This removed the last `mat-select` in the app, so that selector came out of
`custom-theme.scss`.

`autocomplete` migrated on **2026-08-31**: `src/app/modules/shared/autocomplete/` is deleted
and `Autocomplete` / `AutocompleteOption` come from `@paulelyson/elyui`. The type renamed
`IAutocompleteOption` → `AutocompleteOption` and its display field **`view` → `label`** —
that touched every option-producing site (`AutocompleteService`, five `computed()` lists in
`create-equipment-dialog`, the `forkJoin` map in `equipment-filter-dialog`, the
`courseOfferingAutoCompleteOptions` getter in `class-schedule`). The output renamed
`optionselected` → `optionSelected` **and its payload changed from the value string to the
whole `AutocompleteOption`** — free here only because nothing listened to it. Dropped inputs:
`floatLabel` and `appearance`, both Material-only and never passed. This removed the last
`mat-option` in the app, so that block came out of `custom-theme.scss` too.

Two real behaviour changes, both improvements. **Typing now clears the bound value**: the AMS
copy only reset the control when the field was emptied, so typing a non-matching string left
the form holding a stale value while the user saw different text — elyui treats selection as
strict and clears on any keystroke until an option is picked. And **`readonly` is now
honoured**: the panel refuses to open, where Material's autocomplete opened anyway on a
readonly input (`create-equipment-dialog`'s Department field is the one call site).

`datepicker` migrated on **2026-08-31**: `src/app/modules/shared/datepicker/` is deleted and
`Datepicker` comes from `@paulelyson/elyui`. Only 4 call sites, but this one changed **data,
not just markup** — the others were markup-only.

The local component covered a date range too, switched by a `type: 'datepicker' | 'daterange'`
input. **That half was entirely dead**: no call site ever passed `type="daterange"`, nothing
imported its `IDateRange`, and `initialDateRange` / `dateRangeChanged` had no listeners. It
was deleted rather than ported, which is why elyui's `DateRangePicker` is published but
unused here — adopt it if a range filter is ever actually built.

**The control value changed from a `Date` to a `yyyy-mm-dd` string.** Material's picker held
a `Date` (via `provideNativeDateAdapter`); elyui renders a native `<input type="date">`,
which accepts **only** `yyyy-mm-dd` and renders **blank, silently**, for anything else — a
`Date` object or a full ISO datetime included. Since the API returns dates as ISO datetimes,
editing existing equipment would have shown empty date fields. `toISODateOnly()` in
`utils/date.util.ts` normalises at the form-seeding boundary; use it anywhere a stored date
meets an `ely-datepicker`.

`concatDateAndTime()` was retyped to take that string, and now builds its `Date` from the
parts rather than `new Date('2026-08-31')` — that parses as midnight **UTC**, which is still
the previous day anywhere west of Greenwich, so `setHours` would have landed on the wrong
date. It was correct in UTC+8 by luck; it is correct everywhere now. `americanDateToISODate`
went with the dead range branch that was its only caller.

This removed the last `mat-form-field` in the app, so that whole block came out of
`custom-theme.scss`, along with `provideNativeDateAdapter()` and the Material date adapter.

`file-input` migrated on **2026-09-01** (elyui `0.6.0`): `src/app/modules/shared/file-input/`
is deleted and `FileInput` comes from `@paulelyson/elyui`. One call site, in
`create-equipment-dialog`. The output renamed `filechanged` → `fileRead` with an identical
`string` payload (a data URL), because `readAsDataUrl` defaults to `true` — so `addImage`
needed no change.

**The local control could never be opened.** Its `<input type="file">` was `display: none`,
its `#fileInput` template ref was never used, and the drop zone was a plain `<div>`, not a
`<label for>` — so clicking it did nothing, and there was no drag-and-drop handler either.
elyui's version visually-hides the input instead (keeping it focusable and in the
accessibility tree) and wraps it in a real `<label>`. That means **the swap turns a dead
control into a working one**, which is why the call site now passes `[disabled]="true"`
explicitly: image upload is still blocked pending the server migration, and that is now a
deliberate state rather than an accident. Flip the one attribute when the backend is ready.

Two other API gains worth knowing when it is re-enabled: `rejected` emits `FileRejection[]`
so invalid files stop failing silently (the local component's two feedback calls were both
commented out), and validation runs against the `accept` string rather than a hardcoded
jpeg/png list — the local one would have silently discarded a PDF from `accept="application/pdf"`.
`filesSelected` also emits real `File[]`, which is what an upload endpoint actually wants;
`addImage` still consumes the base64 data URL, so moving to multipart is a separate change.

`data-row` migrated on **2026-08-31**: `src/app/modules/shared/layout/data-row/` and
`src/app/models/ui/data-row.model.ts` are deleted, and `RowColumnConfig` /
`RowActionConfig` / `RowContentType` now come from `@paulelyson/elyui`. API deltas that
bit: the output is `actionClicked` (was `actionclicked`), `RowActionConfig` is an
**interface** not a class (`new RowActionConfig({...})` no longer compiles — use an object
literal), and the library honours each action's `size`/`appearance`, which the AMS copy
hardcoded to `sm`/`link` and silently ignored. New inputs: `size` (`xs|sm|md|lg`, default
`sm` — AMS passes `md` to match the old row's 50px thumbnail and 16px title),
`hasDivider` (replaces the `<mat-divider>` the AMS copy rendered), and `placeholderImage`
(empty by default; the library draws a local placeholder instead of the AMS copy's
placehold.co request). The AMS copy's `min-width: 900px` is gone — rows now compress
between 768px and 900px instead of forcing a horizontal scroll.

**Gap worth knowing before designing a row action: `RowActionConfig` has `tooltip` but no
`disabled`,** and `data-row.html` does not bind one on the `<ely-button>` it renders
(checked against 0.7.0's `.d.ts` and elyui's source, 2026-09-24). So a row action cannot be
greyed out — an action with no destination yet has to be either removed or left clickable
with a tooltip and a handler that says why. kurikula hit this on its Deactivate button
(phase 4 B2) and took the second option. A `disabled?: boolean` on the interface plus the
binding is the obvious fix whenever elyui is next opened, and it would need both consumers
bumped. Related trap: Material suppresses pointer events on a natively disabled `<button>`,
so `[tooltip]` on a disabled `ely-button` never fires — put the explanation in visible text.

`avatar` migrated on **2026-09-03** (elyui `0.7.0`): `src/app/modules/shared/avatar/` is
deleted and `Avatar` comes from `@paulelyson/elyui`. One call site, the header's user menu
trigger. Output renamed `avatarclicked` → `avatarClicked`, and elyui **gates emission on a
new `clickable` input** (default `false`) — the AMS copy emitted unconditionally, so
`[clickable]="true"` had to be added explicitly or the click handler that opens the account
menu would go dead. `showLabel` is also new and also defaults `false`; without it the name
next to the circle disappears, since the AMS copy always rendered its label with no way to
turn it off.

**The rendered circle changes from a real image to CSS-drawn initials.** The AMS copy built
a `https://placehold.co/60?text=XX&font=poppins` URL from the label and fetched it — a
network request per render, and one that threw a `TypeError` if the label was ever empty
(indexing `parts[0][0]` unguarded). elyui's `Avatar` falls back image → initials → icon and
never received an `image`, so it renders `resolvedInitials` as text inside a plain colored
circle — same information, no network call, and the empty-label case now falls through to
elyui's default `icon="person"` instead of throwing. `variant="primary"` was set explicitly
to keep the circle green rather than elyui's default gray; nothing else was themed to match
the AMS copy's gold (`--accent`) label text or its `--primary-200` hover highlight behind
the whole row — elyui's hover is a `filter: brightness(0.95)` on the circle only. Revisit
only if the flatter hover affordance turns out to matter.

Still not published, and still hand-rolled here: the dialogs. Migration happens one
component at a time, only on the user's explicit go signal (per elyui's own `CLAUDE.md`) —
never batch-copy multiple components.

### kurikula's hand-rolled components → elyui (phase 2 map)

**Executed 2026-09-16 but not yet run** — `kurikula-frontend/docs/ELYUI-MIGRATION.md` is
the record, including the verification checklist and what was deliberately left undone.
The app will not compile until `npm install` pulls `@paulelyson/elyui@0.7.0`.

One thing that caught this migration out, worth remembering for the AMS dialogs too:
**elyui's working tree is ahead of its published version.** Its local `public-api.ts`
exports an uncommitted `tooltip`/`tooltip-panel` that 0.7.0 does not ship. Always plan a
consumer against the published package, not against elyui's source tree.

The map below is as audited 2026-09-13; every row of it held up:

| kurikula | elyui | Delta to expect |
|---|---|---|
| `app-button` | `ely-button` | identical API, `btnclicked` and all; elyui adds `tooltip`, `hasBorder`, `hasRadius` |
| `app-badge` | `ely-badge` | identical (`closed`, `hasCloseIcon`); elyui adds `hasBorder` |
| `app-icon` | `ely-icon` | **`type` → `variant`**, and the local `IconType` union lacks `neutral`/`accent` |
| `app-avatar` | `ely-avatar` | `avatarclicked` → `avatarClicked`, gated on a new `clickable` (default `false`); `showLabel` also defaults `false`; placehold.co image → CSS initials |
| `app-title` | `ely-title-section` | rename only; `showBottomBorder` matches |
| `app-tab` | `ely-tab` | **`tabChange` emits `TabOption`, not the label string** — kurikula's one call site *does* bind it (`onTabChange($event)` writes `?tab=`), so this one is not a drop-in |
| `app-data-row` | `ely-data-row` | `actionclicked` → `actionClicked`; `RowActionConfig` becomes an interface; elyui honours `size`/`appearance` the local copy ignored |
| `app-input` | `ely-input` | **`suffix_icon` → `suffixIcon`**, `suffix_icon_clickable` → `suffixIconClickable`, `inputType` → `type`, `width` takes `FieldWidth` not `'sm'\|'md'\|'lg'`; drops the Material `appearance`/`floatLabel` |
| `app-autocomplete` | `ely-autocomplete` | **`AutocompleteOption.view` → `label`** (touches `register.component.ts`'s `departmentOptions`), `optionselected` → `optionSelected` emitting the whole option |
| `SnackbarService` + `app-snackbar` | `SnackbarService` | elyui's service replaces both; `SnackBarConfig` → `ISnackBarConfig`. Note kurikula's local type has a typo'd `'dafault'` member |
| `app-header`, the two dialogs | — | app-specific, stay hand-rolled |

Models that get deleted with them: `models/ui/button-config.model.ts`,
`data-row.model.ts`, `snackbar-config.model.ts`, and `common.model.ts` minus
`FilterDisplay` (which is app-specific, exactly as in AMS).

Removing them also removes most of kurikula's Angular Material surface:
`form-field`, `input`, `autocomplete`, `tabs`, `icon`, `tooltip`, `divider` and the
snackbar all leave with the components above, and `src/material-theme.scss` (3.3 KB of
overrides, all of them aimed at `mat-form-field`) can shrink to whatever `MatDialog`
still needs.

Prerequisites, same as AMS's: `npm install @paulelyson/elyui`, add
`node_modules/@paulelyson/elyui/styles/elyui.css` before `src/styles.css` in
`angular.json`, and add `provideAnimationsAsync()` to `app.config.ts` — kurikula has no
animations provider today, which elyui's `Snackbar` needs. The Material Icons `<link>`
is already in `index.html`.

## Priority order

Revised 2026-09-13: kurikula is no longer "last". It moved to the front because the CMS
back-office split (see Open questions) is being executed, and because AMS's own elyui
adoption path is finished.

1. **kurikula revival, in phases** — see below.
2. Finish AMS (frontend + backend) — see the P0/P1 backlog below.
3. Migrate AMS's remaining hand-rolled components (the dialogs) to elyui as elyui ships
   them, one at a time.

### kurikula phases

Phases 1–3 are done and verified as of 2026-09-22; 4 and 5 are planned.

| Phase | What | Owner | State |
|---|---|---|---|
| 1 | **Detach from the AMS backend.** Frontend repoints at `:3001`, dev port pinned to 4201, contract written (`docs/API-CONTRACT.md`); `kurikula-backend` stood up serving all six endpoints. | frontend + CMS backend | **done 2026-09-16** |
| 2 | **Drop the hand-rolled shared components, consume `@paulelyson/elyui`.** 10 components + 3 UI models + the local `SnackbarService` came out. | frontend | **done — verified in the browser 2026-09-22** |
| 3 | **Auth of its own.** `AuthService`, a real login dialog, token storage, `authGuard`/`roleGuard`, `isLoggedIn` wiring. Landed with backend B2. | frontend + CMS backend (B2) | **done — login verified end to end 2026-09-22** |
| 4 | **Unbreak what exists.** `/location` crashes, user list filters are inert, course-offering pagination duplicates rows, the Courses screen's row actions go nowhere, `Usersff` typo, four dead NgModules — plus four things found while verifying 2 and 3. Checklist: `kurikula-frontend/docs/PHASE-4-UNBREAK.md`. | frontend (one item needs B3) | **in progress** — B1 (offerings list) and B2 (user detail dialog) done |
| 5 | **Build the actual product.** Course/offering CRUD, curriculum & program structure, terms, and the K-12 concepts (`gradeLevel`, `strand`, `track`, `section`, `schoolYear`) that neither repo models today. | both | after 4 |

**The CMS backend's reads closed on 2026-09-16, when auth landed on both sides.** Until
then they were public because kurikula had no way to obtain a token, so a guard would have
blacked out every screen. Both halves shipped together for exactly that reason.

Everything now requires a bearer token except five routes, each of which cannot present
one by definition: `GET /api` (liveness), `POST /api/user` (self-registration), and
`POST /api/auth/login` / `refresh` / `logout`.

`POST /api/user` being public is still not what makes it safe — the service is, and that
constraint survived B2 exactly as it had to: the role is hardcoded to `student` and the
status to `pending_approval`, and `CreateUserDto` does not declare `role`, `roles`,
`account_status` or `activated`, so `whitelist: true` strips them from the body.

`RolesGuard` and `@Roles()` ship on the CMS backend but **no route uses them yet** — the
guard is inert without the decorator. Role gates are B3.

### CMS backend phases

| Phase | What | Pairs with | State |
|---|---|---|---|
| **B1** | Foundation (envelope interceptor, exception filter, shared schemas) + the six contract endpoints, reads public | kurikula phase 1 | **done 2026-09-16** |
| B2 | Auth of its own — port AMS v2's JWT + refresh-token family revocation + `AuthGuard`/`RolesGuard`/`@Public()`, then close the reads | kurikula phase 3 | **done — verified 2026-09-22** |
| B3 | Real CRUD for course / course-offering / department / location / school / term, with role gates **and scope gates** — see below | kurikula phase 5 | next |
| B4 | K-12 curriculum models — `program`, `curriculum`, `gradeLevel`, `strand`, `track`, `section`, `schoolYear` | kurikula phase 5 | after B3 |

B2 copied AMS v2's `src/auth/` rather than re-deriving it, and fixed both of the things it
was meant to fix on the way in: the guards are `APP_GUARD` providers in `app.module.ts`
(AMS still resolves them with `app.get()` in `main.ts`), and the refresh TTL is read
through `ConfigService` rather than a module-level `process.env` that evaluates before
`.env` is parsed. Because the `users` collection is shared, a password hashed by either
service must verify in the other — bcrypt at 10 rounds, both sides.

`refreshtokens`, note, is **not** a shared collection. Only `users` and `assignments` are
shared identity; a CMS session is not an AMS session and the two sign with different
secrets, so `JWT_SECRET` deliberately does not have to match.

**Found while verifying phase 3 (2026-09-22): the CMS has role gates coming in B3 but no
*scope* gates, and they are not the same thing.** A chairman of CPE currently sees every
user in the system, because `UserService.find` filters by whatever the query asks for and
nothing else — there is no "you may only see your own department". `@Roles(CHAIRMAN)`
would not fix that; it answers "may you call this endpoint", not "which rows may you see".

The client passing `?department=` is a convenience, not a boundary — the param can simply
be deleted. **B3 has to carry scoping, not just role checks**, and AMS's own visibility
filters are the reference for what that looks like. Tracked as item A1 in
`kurikula-frontend/docs/PHASE-4-UNBREAK.md`.

## Cross-repo working rules

- No `npm`/`ng`/`nest` commands, no git write commands (add/commit/push) — the user runs
  and tests everything themself. Read-only shell commands (`ls`, `grep`, file moves within
  the four repos above) are fine.
- Every code change ends with a suggested commit message in the format below — see
  `CLAUDE.md` in each repo for the convention.
- Separate `CLAUDE.md` per repo (this file is the only *cross*-repo doc).
- File naming: kebab-case, NestJS-style, type-suffixed (`*.model.ts`, `*.service.ts`,
  `*.dto.ts`) — see each repo's `CLAUDE.md` for the specific target set. Rename
  opportunistically when a file is touched; no bulk renaming pass.
- This file is the first thing to update when a cross-repo fact changes.

---

## Backlog

Severity is P0 (broken/insecure now) → P1 (blocks "finish AMS") → P2 (debt, deliberately
deferred). Each P0 item has a corresponding line in the execution checklist in
`CLAUDE.md` (backend) with a commit message; this list is the "what and why", the
checklist is the "in what order".

### P0 — all clear as of 2026-09-13

Every P0 that used to be listed here has been fixed. Re-verified against both repos on
2026-09-13, item by item, because this list had drifted badly out of date:

- `GET /api/course` — fixed (`ea3f632`); the filter is a plain `title` regex, no empty `$or`.
- Plaintext passwords — fixed (`9230714`); `hashPassword`/`comparePassword` in
  `src/common/utils/password.util.ts`, with a migration script, plus refresh tokens with
  family revocation on reuse.
- No RBAC — fixed (`5b650d8`, `900d24b`); `@Roles()` + a `RolesGuard` registered globally
  alongside `AuthGuard` in `main.ts`, backed by the new `Assignment` collection rather
  than roles embedded on the user.
- `HttpException` → 500 — fixed; `global-exception.filter.ts` has a generic
  `instanceof HttpException` branch and the debug `console.log` is gone.
- Mass assignment — fixed; `whitelist: true` is live in `main.ts` (deliberately without
  `forbidNonWhitelisted`, so extra client fields are stripped rather than rejected).
- Equipment borrow-status `$lookup` — fixed; binds `$$equipmentId`, ids normalised to
  ObjectId (`8e7f73e`, `672d04b`).
- Frontend: the login-logs-itself-out interceptor is rewritten around token endpoints +
  a single refresh attempt; `borrow.service.ts` sends `page`/`search`/`purpose`/`status`;
  the `update-quantity-status-dialog` placeholders are gone; `homepage.component.ts` is
  standalone (Angular 21 default) so the `/login` route resolves.

**Consequence for the CMS backend being built now:** auth, hashing, refresh-token
rotation, the global exception filter, the response interceptor and the assignment-based
`RolesGuard` all exist in working form in `asset-management-system-backend-v2` — copy
them rather than re-deriving. They are the reference implementation.

### P1 — gaps blocking "finish AMS"

- Backend: `school`, `term`, `location` modules are pure `nest g resource` scaffolds
  (every method past `create`/`find` returns a literal template string). `department`
  `update`/`remove` are stubs too.
- Backend: empty DTOs (zero validation) — `create-school`, `create-term`,
  `create-department`, `create-equipment-change-log`. Near-empty —
  `create-course` (only `department`), `create-location` (only `department?`).
- Backend: query DTOs (`school`, `term`, `location`, `department`) have no
  page/limit defaults → `NaN` skip/limit if the client omits them.
- Backend: `findOne(+id)`/`update(+id)`/`remove(+id)` coerce a Mongo ObjectId string with
  unary `+`, producing `NaN`. Currently harmless only because those methods are stubs —
  becomes a live bug the moment any of them is implemented.
- Backend: `PATCH /api/auth/change-password` reads `username` from the request body
  instead of `req.user` — operates cross-account.
- Backend: `AuthService.signIn` ignores `account_status` entirely, so a `deactivated`,
  `rejected` or never-approved account can still obtain a token from AMS. The CMS backend
  gates on it as of 2026-09-16 (see Decided above); against one shared `users` collection
  the two now disagree, and AMS is the permissive side. Port the check — and note that
  doing so locks out every currently-seeded account until statuses are set, which is the
  same constraint kurikula already lives with.
- Backend: seeders are half-disabled. `src/database/seeders/seed.ts` has
  `CourseOfferingsSeeder` and `EquipmentSeeder` commented out; there is no seeder at all
  for School, Department, Location, Course, or Term — hence hardcoded department
  ObjectIds in `equipment.seeder.ts`. Seeder data directory is gitignored, so a fresh
  clone cannot seed without that data being supplied separately.
- Backend: `Dockerfile` doesn't install Chromium and uses `npm install --ignore-scripts`,
  so Puppeteer PDF generation (`/api/equipment/report/download`) will fail in the built
  image. `equipment.controller.ts` also imports `path/win32` in a Linux-deployed service.
- Frontend: no user-management UI (`UserService.getUsers()` is never called), no
  dashboard, no settings page. Header renders a `Register` button with no click handler.
- Frontend: `borrowed-equipment.component.ts:74` hardcodes transaction condition to
  `'functional'` (`// TODO add functional`).

### P1 — elyui adoption path (priority #2)

1. Upgrade AMS frontend Angular 20 → 21 (`ng update`, including Material/CDK). Manual
   smoke test — the frontend has essentially no test suite to catch regressions.
2. `npm install @paulelyson/elyui @angular/material @angular/cdk`. Add
   `"node_modules/@paulelyson/elyui/styles/elyui.css"` before `src/styles.css` in
   `angular.json`. Add the Material Icons `<link>` to `index.html`. Add
   `provideAnimationsAsync()` to `app.config.ts` (needed for `Snackbar`).
3. Replace `toggle-button-group` with `<ely-segmented-control>` — **done**. Its only call
   site, the PDF paper-size/orientation selector in `download-report-dialog`, was wired up
   in commit `994ecbf` (2026-08-27) — every report used to ship LEGAL/landscape with no way
   to change it; now both are real `<ely-segmented-control>` pickers. Note:
   `SegmentedControl` is not a `ControlValueAccessor`, so it doesn't plug into
   `formControlName`.
4. Then swap, one at a time, with a manual test after each: `icon` → `ely-icon`, `badge` →
   `ely-badge`, `button` → `ely-button`, `toggle` → `ely-toggle`, `snackbar` →
   `SnackbarService`, `textarea` → `ely-textarea` (needs elyui ≥ 0.2.0).
5. `data-row` → `ely-data-row` (elyui ≥ 0.5.1) — **done 2026-08-31**; see the delta notes
   in the component-inventory section above.
6. `dropdown` → `ely-dropdown`, `autocomplete` → `ely-autocomplete`, `datepicker` →
   `ely-datepicker` (elyui ≥ 0.5.1) — all **done 2026-08-31**; see the delta notes in the
   component-inventory section above.
7. `file-input` → `ely-file-input` (elyui ≥ 0.6.0) — **done 2026-09-01**; see the delta
   notes in the component-inventory section above.
8. `tab` → `ely-tab` (elyui ≥ 0.6.0) — **done 2026-09-02**. **The adoption path is finished:**
   AMS consumes every elyui component it has a use for, and `src/app/modules/shared/`
   duplicates none of them. Dialogs stay hand-rolled until elyui ships them;
   `DateRangePicker` is published but AMS has nothing to point it at.

### P2 — architecture debt (documented, deliberately deferred)

- **Multi-tenancy is effectively absent.** `School` exists as a schema; only
  `Department` references it; **zero queries anywhere filter by school**; no school claim
  on the JWT; no tenant guard/interceptor. Nothing supports elementary→senior-high
  concepts — no `gradeLevel`, `strand`, `track`, `section`, `curriculum`, or `schoolYear`.
  `Term` is an orphan model that nothing references (`CourseOffering` has no `term`
  link). Seeders hardcode literal USJR department ObjectIds. Target design when this is
  picked up: `school` field on every tenant-scoped collection, `school` in the JWT
  payload, a request-scoped tenant guard, and real (non-hardcoded) seeders. Retrofit cost
  grows with every collection and every row of real data — cheaper to do before this app
  has live multi-school data than after.
- Frontend: one 0-byte CSS file left, `inventory.component.css` (the other six named here
  — `equipment-change-log`, `autocomplete`, `datepicker`, `dropdown`, `tab`,
  `toggle-button-group` — went with the directories they were in as those components were
  migrated to elyui or, for `equipment-change-log`, deleted outright); ~12 leftover
  `console.log`s;
  large commented-out template blocks in 9 templates; near-duplicated filter/search logic
  across three toolbar components; two separate `utils/` folders
  (`src/app/utils/` and `src/app/modules/shared/utils/`); `BorrowedEquimentFilter`
  spelling typo propagated through the codebase; `IEquipment` carries both
  `inventorytype` and `inventoryType` (create dialog writes one, detail dialog reads the
  other — pick one).
- Backend: two overlapping inventory-type enums with **different string values**
  (`EquipmentTag.NON_INVENTORY = 'non_inventory'` vs
  `EquipmentInventoryType.NON_INVENTORY = 'non-inventory'`), plus a third boolean
  (`hasTag`) carrying the same concept again.
- Tests: AMS frontend has one scaffold spec (`app.spec.ts`) and it currently **fails** —
  it asserts an `<h1>` that no longer exists in the template. Backend has two scaffold
  specs, neither exercising real logic. Highest-value first tests to write:
  `src/common/utils/transaction.util.ts` (the borrow state machine — `getAccumulatedStatus`,
  `validateTransactionQty`) and `diff-eqipment.util.ts`.
- Hygiene: `.env` secrets are in cleartext in both live backends (gitignored, but
  plaintext on disk). The legacy Express repo's `.env` contains a GitHub PAT that should
  be rotated regardless of what happens to that repo. AMS frontend has a duplicate
  Prettier config — `package.json` says `printWidth: 100`, `.prettierrc` says `150`. Pick
  one and delete the other.

### Decided — the CMS/back-office split (2026-09-13)

**The split is happening.** Curriculum management moves onto its own backend, so students
cannot reach the back-office at the network layer at all, independent of RBAC. Kurikula's
frontend was repointed at it the same day; the backend is the owner's to build.

What this settles: RBAC on the AMS API no longer has to cover the curriculum surface. It
shipped anyway (`RolesGuard` + `@Roles()`, assignment-backed), so the remaining question
is only which of the 12 AMS modules still need role gates once curriculum is gone.

### Decided — how the two services share data (2026-09-16)

**One Mongo database, two services in front of it.** `kurikula-backend` connects to the
same `asset_mgt_local` as AMS v2 and declares its own Mongoose schemas over the same
collections.

Chosen over the alternatives because it was the only one that made kurikula work the day
the backend landed: separate databases with a sync means kurikula starts empty and the
sync becomes a permanent chore, and CMS-owns-it-AMS-reads-through-an-API means refactoring
AMS's hot paths before kurikula has rendered a single row. The boundary this buys is a
network boundary, not a data one — which is what the split was actually for (students
cannot reach the back-office at all, independent of RBAC).

What it costs: the schemas must not drift, and nothing enforces that but convention. See
the class-name-is-collection-name invariant under Runtime topology. Revisit if the two
services ever want genuinely different shapes for the same entity — that is the signal
this choice has run out.

### Decided — one user record (2026-09-16)

**`users` and `assignments` are shared; the CMS owns registration.** kurikula's register
form creates the account AMS authenticates. AMS has no registration form and does not need
one.

Consequences, both live now:

- A password hashed by either service must verify in the other — **bcrypt, 10 rounds,
  both sides**. Changing the algorithm in one repo locks accounts out of the other.
- An `assignments` row written by the CMS grants authority in AMS, where `RolesGuard`
  reads it. That is why `POST /api/user` hardcodes `student` rather than trusting the
  body, and why the `Assignment` scope guard is mirrored in `kurikula-backend`.

### Decided — the CMS requires an active account to log in (2026-09-16)

`kurikula-backend`'s `signIn` refuses any account whose `account_status` is not `active`,
and re-checks it on every refresh so that deactivating an account ends the session it
already holds. **AMS's `signIn` checks nothing** — so against one shared `users` collection
the two services now disagree about who may log in, and a `deactivated` account can still
get a token from AMS. That gap is on the AMS side; see the P1 line below.

The live consequence is operational and affects testing immediately: `account_status`
defaults to `pending_approval` on both `User` schemas, `UsersSeeder` never sets it, and
`kurikula-backend`'s `create()` hardcodes it. **Nothing in either repo ever writes
`'active'`**, and there is no approval UI until phase 5 — so every account, including any
registered through kurikula's own form, has to be activated by hand:

```bash
mongosh asset_mgt_local --eval 'db.users.updateOne({ idNumber: "<id>" }, { $set: { account_status: "active" } })'
```

Worth settling when phase 5 is planned: either registration mints `active` accounts, or the
approval UI comes forward. Leaving it as manual Mongo edits is not a resting state.

### Open questions (recorded, not decided)

- **Which service owns writes to a shared collection when both want them.** B3 gives the
  CMS real CRUD for course/offering/department/location/school/term — the collections AMS
  also reads. Read-read is fine; two writers on one document is the case nobody has
  designed for yet. Worth settling before B3, not during.
