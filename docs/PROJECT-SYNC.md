# Project Sync — AMS, CMS (kurikula), elyui

Single source of truth across the four repos that make up this ecosystem. Any Claude
session working in any of these repos should read this file first. Update it whenever a
cross-repo fact changes (a new elyui component ships, a backend contract changes, a
priority shifts) — don't let it drift into aspiration.

Owner: paulelyson (polusesmercur@gmail.com). Last written: 2026-08-27.

## Repo map

| Repo | Path | Stack | State |
|---|---|---|---|
| **AMS frontend** | `~/Documents/personals/asset-management-system-frontend` |Angular 21, zoneless, signals | Inventory + borrowing built; consumes elyui |
| **AMS backend** | `~/Documents/personals/asset-management-system-backend-v2` | NestJS 11 + Mongoose 9 | 3 of 12 modules real |
| ~~AMS backend (legacy)~~ | `~/Documents/personals/asset-management-system-backend` | Express 5 + Mongoose | **Dead. Do not edit.** |
| **CMS / kurikula** | `~/Documents/personals/kurikula-frontend` | Angular 21 | ~35–40% of v1, dormant since 2026-04-28 |
| **elyui** | `~/Documents/personals/elyui` | Angular 21 library | `@paulelyson/elyui@0.4.0`, 10 components published |

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

One NestJS API (`asset-management-system-backend-v2`) on `localhost:3000`, global prefix
`api`, serving two Angular frontends via CORS (`src/main.ts`, hardcoded to
`localhost:4200` = AMS frontend, `localhost:4201` = kurikula — not env-driven, see
backlog).

Shared Mongo collections consumed by both frontends: `user`, `department`, `school`,
`course`, `course-offering`, `location`, `term`.

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

Published in `@paulelyson/elyui@0.4.0` (single entry point, no secondary entry points —
everything imports from `@paulelyson/elyui`):

- `Icon` (`ely-icon`), `Badge` (`ely-badge`), `Button` (`ely-button`), `Toggle`
  (`ely-toggle`), `SegmentedControl` (`ely-segmented-control`), `Textarea`
  (`ely-textarea`), `Snackbar` + `SnackbarService`.
- Added in **0.3.0**: `VerticalStepper` (`ely-vertical-stepper`), `TitleSection`
  (`ely-title-section`). Added in **0.4.0**: `Input` (`ely-input`).

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

Not yet published — this is elyui's stated roadmap, sourced from the AMS frontend's
`src/app/modules/shared/` components: `autocomplete`, `dropdown`, `datepicker`,
`tab`. Also not on the roadmap at all yet: a
table/`data-row` equivalent, and dialogs. Migration happens one component at a time, only
on the user's explicit go signal (per elyui's own `CLAUDE.md`) — never batch-copy
multiple components.

kurikula independently hand-rolls its own copies of `icon`, `badge`, `button`, `snackbar`,
`avatar`, `input`, `autocomplete`, `tab`, `data-row` under
`src/app/shared/components/` — same token vocabulary (`Size`, `Variant`), same event
naming (`btnclicked`, `iconclicked`). It does **not** consume elyui today. It's a natural
second consumer once elyui's form controls ship, but per priority order below it's last.

## Priority order

1. Finish AMS (frontend + backend) — see the P0/P1 backlog below.
2. Adopt `@paulelyson/elyui` inside AMS frontend (blocked on the Angular 21 upgrade).
3. Migrate AMS's remaining hand-rolled components to elyui as elyui ships them, one at a
   time.
4. kurikula — last. Revisit once AMS is stable and elyui covers form controls.

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

### P0 — backend correctness/security

- **`GET /api/course` fails on every request.**
  `src/course/course.service.ts:29-36` — all three `$or` entries are commented out, so
  `$or: []` ships to Mongo, which rejects an empty `$or`
  (`$or/$and/$nor must be a nonempty array`). This is the endpoint kurikula depends on.
- **Passwords are stored and compared in plaintext.** `src/auth/auth.service.ts:14,41` —
  `user.password !== pass`. No bcrypt/argon anywhere in the repo. Needs a migration path
  for existing rows before hashing can turn on.
- **No RBAC exists.** No `@Roles()` decorator, no `RolesGuard`. `UserRole` is used only
  for *data filtering* inside a few services, never to authorize an endpoint. Any
  authenticated user — including a student — can currently `POST /api/user`,
  `PATCH /api/equipment/:id`, or `PATCH /api/equipment-change-log/:changeLogId/resolve`.
  **Design is blocked on the CMS back-office split decision** — see Open questions below.
- **Every `HttpException` subclass reports as a 500.**
  `src/common/filters/global-exception.filter.ts` has no generic `HttpException` branch,
  so `NotFoundException`/`ForbiddenException` thrown anywhere in services collapse to
  "Internal server error". Also has a leftover debug `console.log(exception)` at line 20.
- **Mass assignment via `ValidationPipe`.** `src/main.ts:15` — `whitelist: true` is
  commented out. `UpdateEquipmentDto = PartialType(CreateEquipmentDto)` exposes
  `confirmed` and `deleted`, so a client can self-approve their own equipment change or
  soft-delete a record via `PATCH /api/equipment/:id`.
- **Equipment borrow-status lookup can never match.**
  `src/equipment/equipment.repository.ts:26-31` — `$lookup` binds
  `{ $toString: '$_id' }` (a string) against `borrowedEquipment.equipment`, which is an
  ObjectId. Source even carries the comment
  `/* replace with $$equipmentId when testing */`. `accumulatedStatus` is always `[]` on
  `GET /api/equipment`.

### P0 — frontend

- **Login logs itself out.** `src/app/interceptors/auth.interceptor.ts:13-15` calls
  `authService.logout()` on *any* tokenless request — including the login `POST` itself.
- **Borrowed-equipment search/purpose/pagination are no-ops.**
  `src/app/services/borrow.service.ts:47-49` — `page`, `search`, `purpose` params are
  commented out of the request. The search box, purpose filter, and "Show more..." button
  all update the URL but never change the results.
- **Hardcoded placeholder content ships in a live dialog.**
  `src/app/modules/shared/update-quantity-status-dialog/` renders a literal
  `Flat Screw Driver 6.5×200mm` / `SN: entries` for every item, and a hardcoded
  `Add Transaction` label so Cancel/Approve/Release all read "Add Transaction".
- **`/login` route is likely broken.** `homepage.component.ts` is `standalone: false` but
  `HomepageModule` declares nothing — the component is declared nowhere.

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
- Frontend: `equipment-change-log` feature module is unroutable — referenced nowhere in
  `app.routes.ts`.
- Frontend: `borrowed-equipment.component.ts:74` hardcodes transaction condition to
  `'functional'` (`// TODO add functional`).

### P1 — elyui adoption path (priority #2)

1. Upgrade AMS frontend Angular 20 → 21 (`ng update`, including Material/CDK). Manual
   smoke test — the frontend has essentially no test suite to catch regressions.
2. `npm install @paulelyson/elyui @angular/material @angular/cdk`. Add
   `"node_modules/@paulelyson/elyui/styles/elyui.css"` before `src/styles.css` in
   `angular.json`. Add the Material Icons `<link>` to `index.html`. Add
   `provideAnimationsAsync()` to `app.config.ts` (needed for `Snackbar`).
3. Replace `toggle-button-group` with `<ely-segmented-control>`. Its only current call
   site is the commented-out paper-size selector in
   `download-report-dialog.component.html:11` — wiring elyui in also restores PDF
   page-size/orientation selection, which is currently hardcoded to LEGAL/landscape. Note:
   `SegmentedControl` is not a `ControlValueAccessor`, so it won't plug into
   `formControlName` yet.
4. Then swap, one at a time, with a manual test after each: `icon` → `ely-icon`, `badge` →
   `ely-badge`, `button` → `ely-button`, `toggle` → `ely-toggle`, `snackbar` →
   `SnackbarService`, `textarea` → `ely-textarea` (needs elyui ≥ 0.2.0).
5. Everything else (`input`, `autocomplete`, `dropdown`, `datepicker`, `tab`, dialogs, a
   table) stays hand-rolled until elyui ships it.

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
- Frontend: seven 0-byte CSS files (`equipment-change-log`, `inventory`, `autocomplete`,
  `datepicker`, `dropdown`, `tab`, `toggle-button-group`); ~12 leftover `console.log`s;
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

### Open questions (recorded, not decided)

- **Possible split: a separate CMS/back-office backend.** Under consideration: moving
  curriculum management onto its own backend, shaped so students cannot reach it at the
  network layer at all, independent of whatever RBAC exists in the shared API. This
  directly changes the shape of the RBAC work above — if student-facing and back-office
  surfaces end up as separate deployments, RBAC on the shared AMS/kurikula API becomes a
  smaller, targeted job (protect the AMS student-facing surface only) instead of a
  blanket pass over all 12 modules. **Do not design the RBAC guard/role map until this is
  settled** — it changes the scope of that work materially.
