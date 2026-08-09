# AMS Backlog

Consolidated checklist across both repos — what's done and what's left, including work
from before this session. Testing is manual and one item at a time (see each repo's
`CLAUDE.md` — there's effectively no automated coverage to lean on instead), so this is
laid out as a checklist you can work through and verify individually. Companion to
`docs/PROJECT-SYNC.md` (the narrative/architecture doc); this file is the flat todo list.

Last updated: 2026-08-02.

---

## Backend — auth & authorization refactor (this session, in progress)

Full design rationale lives in the plan file
(`this-project-is-asset-fancy-mochi.md`) if you want the "why," not just the "what."

### Done — needs your test pass

- [X] **Phase 0** — `normalize-object-ids` migration. Ran with `--apply`; 100% clean
  conversion, zero non-convertible values.
- [X] **7.1** — ObjectId casting at aggregation boundaries (`equipment.service.ts`,
  `borrowed-equipment.service.ts`) — required immediately after Phase 0 or those endpoints
  would've returned empty results.
- [X] **Phase 1.1** — `Assignment` collection (department-scoped instructor/chairman,
  location-scoped lab_in_charge/assistant, student rows kept for affiliation only,
  excluded from every authorization query).
- [X] **Phase 1.2** — `User.roles[]` migrated to `Assignment` docs, `User` is now pure
  identity. Migration script run (dry run + `--apply`); you spot-checked one user post
  and said you'd check the rest later.
- [X] **Phase 1.3** — `getRole()` deleted, `borrowed-equipment` visibility now queries
  `AssignmentService` directly. Fixed a real bug as a byproduct: a chairman assigned to
  **two** departments used to only see one department's worth of records.
  **Test:** log in as a chairman with 2 department assignments, confirm both show up now.
- [X] **Phase 2.1** — bcrypt password hashing. **Needs** `npm run db:hash-passwords` (dry
  run first, then `--apply`) to hash any pre-existing plaintext rows — login will fail for
  those accounts until you run it.
- [ ] **Phase 2.2** — minimal JWT (`{_id, idNumber, name}`, no `roles`) + `AuthGuard`
  resolves assignments fresh on every request instead of trusting the token. Access token
  expiry `10d → 15m`.
  **⚠️ Known break:** frontend `hasRole`/`roleGuard` decode `roles` from the JWT — every
  role-gated route errors until the frontend follow-up below lands. Accepted tradeoff, not
  a bug to chase.
- [ ] **Phase 2.3** — refresh-token rotation. `POST /auth/refresh`, `POST /auth/logout`.
  Reuse of an already-rotated token revokes the whole family (theft signal); plain expiry
  just rejects that one request.
  **Test:** login → refresh → re-submit the *same* used refresh token (expect 401) → confirm
  the token that replaced it is *also* now dead.
- [ ] **Phase 2.4 (partial)** — `SignInDto`/`RefreshTokenDto` added; `change-password` now
  scopes to `req.user._id` instead of a body-supplied `username` (was a cross-account bug).
- [ ] **Phase 3.1** — `instructor`/`department`/`classLocations` denormalized onto
  `BorrowedEquipment`, written at create time from the selected `CourseOffering`.
  **This is what makes Phase 1.3's visibility filter actually work** — those were dead
  `String` columns nothing ever wrote, so the chairman/LIC/instructor scopes were matching
  against absent fields and returning nothing.
  **Needs** `npm run db:backfill-borrow-keys` (dry run, then `--apply`) — existing borrow
  records stay invisible to chairman/LIC scoping until it's run.
  **Test:** create a borrow against an offering that has a mapped instructor and a scheduled
  location; confirm all three fields persist as ObjectIds. Then log in as the chairman of
  that class's department and confirm the borrow now appears.
- [ ] **Phase 3.2** — `preserveNullAndEmptyArrays` on the `$equipment`/`$borrower`
  `$unwind`s. A single unresolvable reference used to delete the whole borrow record from
  the results *and from the total count* — a silently wrong list rather than a visibly
  broken row. Also dropped three `roles: 1` projections orphaned by Phase 1.2.
- [X] **Phase 4.1** — status enum collapsed to lifecycle states
  (`requested → approved → released → mark_returned → returned`, terminal `cancelled` /
  `unreturned`) + `actedAsRole` on `Transaction`. `system_reset` dropped (it could never be
  applied). **Two real bugs fixed here, both found by writing the tests first:**
  a request approved in two acts used to report more units than were requested, and
  equipment could be released off a request with **no approval at all**.
  **Test:** `npm test` (20 cases in `transaction.util.spec.ts`). Then in the app: request
  10 of something, approve 4, confirm the list shows 6 requested + 4 approved; cancel some
  and confirm the totals still add up to 10; try releasing something unapproved and confirm
  it's now rejected.
- [X] **Phase 4.2** — status migration script. **Needs**
  `npm run db:migrate-tx-statuses` (dry run, then `--apply`). Watch for the `system_reset`
  warning — those are left alone deliberately and need resolving by hand if the count isn't
  zero, since the value is no longer valid and those documents will fail validation on their
  next write.
  **Test:** find an existing part-approved borrow *before* running it, note its accumulated
  quantities, then confirm they're unchanged after. This is the riskiest single step in the
  plan.
- [X] **Phase 4.3** — approval policy resolver. Pure, testable rules in
  `policies/approval.policy.ts` + an injectable `ApprovalPolicyService` that resolves
  assignments into a scope. Both expected future changes (LIC department→location scoping,
  any-1→multi-required approval) are isolated behind marked `SWAP POINT` banners.
  **Test:** `npm test` (13 cases). Not yet wired into the request path — that's 5.2 — so
  there's nothing to check in the running app for this one.
- [ ] **Phase 5.1** — `buildVisibilityFilter()` extracted as a pure, testable function
  (`policies/visibility.policy.ts`), separate from `ApprovalScope` so an assistant can *see*
  their department's borrows without gaining the right to approve them.
  **Test:** `npm test` (11 cases). Then the real test — see the four-account scenario at the
  bottom of this section.
- [ ] **Phase 5.2** — approval authorization enforced. `TransactionUpdateGuard` **deleted**
  (it was commented out and returned `true` unconditionally — a control that looked active
  and did nothing). Approving now requires being the class instructor, the chairman of its
  department, or its lab-in-charge; `actedAsRole` is stamped from the server's answer.
  **Two identity holes closed:** `create` took `borrower` from the request body (anyone
  could file a borrow in someone else's name — the frontend always sent self, so no
  behaviour change), and `updatedBy` came from the body too. Both now come from the token.
  **Test:** log in as someone unrelated to a borrow and try to approve it → expect 403.
  Then as its instructor → expect success, and check the stored transaction has
  `actedAsRole: "instructor"`.
- [ ] **Phase 5.3** — `@Roles()` + `RolesGuard`, global, inert on routes that don't opt in.
  Applied: equipment writes and change-log resolve → lab_in_charge/chairman/assistant;
  user writes → administrator. Equipment *reads* and change-log *creation* stay open by
  design. CMS-shared modules left open pending the back-office split.
  **Test:** log in as a student and try `POST /api/equipment` → expect 403 with the role
  list in the message. As a lab_in_charge → expect success.

### Not started

- [ ] **Phase 2.4 (remainder)** — `whitelist: true` now enabled in `main.ts`. The DTO is the
  contract: anything it doesn't declare is stripped from the request body, so server-derived
  fields can't be smuggled in. `forbidNonWhitelisted` is deliberately **off** — it would 400
  on extra fields instead of dropping them.
  Audited both frontends' write payloads first. Four fields are now stripped, all correctly:
  `borrower`, `instructor`/`department` on the borrow payload, `username` on change-password,
  and `_id` on the equipment PATCH. The frontend no longer sends any of them.
  **Test:** create + edit equipment; submit a borrow request; change your password. All three
  should behave exactly as before — if a field silently stops saving, it's this.
- [ ] **Found by that audit — the Inventory Type dropdown has never saved.** The equipment
  create/edit form wrote **`inventorytype`** (lowercase `t`); the backend DTO and schema both
  use **`inventoryType`**. `IEquipment` declared both spellings, which hid the drift. The
  detail dialog reads `inventoryType`, so anything created through that form has always shown
  as "Non-inventory". Fixed in the form, the template and the model.
  **Test:** create equipment with Inventory Type = "non_inventory", reopen it, and confirm
  the value persisted — then check the detail dialog badge agrees.
- [ ] **Phase 6.1–6.4** — type safety pass. `JwtPayload`/`AuthenticatedRequest` (in
  `auth/types/`, not `common/`, to avoid a new inverted dependency) threaded through every
  `req: any` — zero remain. `QueryFilter<T>` on every filter site (**note:** Mongoose 9
  renamed `FilterQuery` → `QueryFilter`. Which form to use depends on where the filter goes:
  a `Model` query method — `find`/`countDocuments`/`distinct` — needs the hydrated
  `QueryFilter<XDocument>`; an aggregation `$match` takes the raw `QueryFilter<X>`).
  Aggregation results typed. `diffEquipment` and the change-log's Mixed values moved off
  `any` too, so `equipment.seeder.ts` is the only explicit `any` left in the backend.
  **Found a real bug:** `equipment.controller.ts` passed a raw string into a parameter
  declared `Types.ObjectId` — invisible for as long as `req` was `any`.
  **⚠️ API contract changed — frontend updated in the same commit:** the equipment list no
  longer returns `data: [rows, count]`. It returns `data: rows` plus
  `meta.pendingApprovalCount`. Also `GET /api/user` now reports a real `total` instead of 0.
  **Test:** the inventory list (rows render, pending-approval badge shows the right number)
  and the borrow page's equipment list. These are the two screens the contract change
  touches.
- [ ] **Phase 6.5** — `npm run lint` now checks instead of rewriting your source;
  `npm run lint:fix` does the rewriting. eslint `no-explicit-any` → `warn`.
  **tsconfig flags now enabled** (they were blocked on 7.3/7.5, which is done):
  `useUnknownInCatchVariables`, `noUnusedLocals`, `noUnusedParameters`. Each was surveyed
  before flipping — the only code that had to change was three `catch` blocks in the seeders
  that assumed the caught value was an `Error`.
  **`noImplicitAny` is now on too.** It surfaced one latent bug: `equipment.seeder.ts` was
  indexing the `DEPARTMENT` string enum (keyed by department ObjectId) with a plain string.
  `strictPropertyInitialization` is still held — it needs `!` on every schema and DTO field.
  Fallout was 22 errors, all TS6133 — dead imports, plus a commented-out one-off migration
  block in `equipment.service.create` and an unreferenced seeder helper. `intersects` in
  `approval.policy.ts` was **exported rather than deleted**: it's the entire body of the
  future lab-in-charge location-scoping swap, and deleting it would cost that.
  **Test:** `npm run build`. Nothing here changes behaviour — the only runtime-visible edit
  is that `POST /api/equipment` no longer creates an unused local.
- [ ] **Found while enabling the flags: four lookup routes ignore their query DTO.**
  `find()` on department, location, school and term accept a `Query…Dto` and never read it —
  they return every row, unfiltered and unpaginated. For dropdown lookups that's plausibly
  the intent, so the parameters are now `_query` with the mismatch noted in the code rather
  than hidden. **Decide:** implement the paging/filtering those DTOs advertise, or strip
  those fields from the DTOs so they stop promising it. Low priority — these are the CMS
  modules that may move to their own backend.
- [ ] **Phase 7** — correctness/cleanup, all done:
  - **7.1b** 12 redundant `$toObjectId` calls removed (both defensive `$convert` blocks kept).
  - **7.2** `GET /equipment` was serving **soft-deleted equipment** while its own count
    excluded it — `deleted: false` added. `$sort` restored (without it, `$skip`/`$limit`
    paginated over an unspecified order — a row could appear on two pages or none). The
    change-log `department` filter now actually applies; its `find()` moved to `$facet` so
    data and total come from one pass.
  - **7.3** 35 stub routes now return **501** instead of `200 OK` with a fake message; 9
    unrouted `findAll()` scaffolds deleted; 24 `+id` coercions (which produce `NaN`) fixed.
    **Decided: soft delete everywhere when these get implemented** — recorded in each
    message.
  - **7.4** `GlobalExceptionFilter` now logs unhandled faults (it imported `Logger` and never
    instantiated it, so every 500 was silent). Duplicate branches collapsed.
  - **7.5** `path/win32` import gone (wrong for a Linux deploy), stray `console.log`s
    removed, and the equipment seeder now logs real validation messages instead of
    `[object Object]`.
    **Test:** `npm run start:dev`. Inventory list should no longer show deleted items and
    should paginate stably. `DELETE /api/school/:id` should now return 501, not 200.

---

## Backend — carried over from earlier sessions, still open

Already-fixed P0 items from earlier in this project are omitted here (course `$or` crash,
plaintext passwords, exception filter 500s, equipment `$lookup` ObjectId mismatch — all
done). What's left:

- [ ] `school`, `term`, `location` modules are `nest g resource` scaffolds — every method
  past `create`/`find` returns a literal template string. `department` `update`/`remove`
  are stubs too.
- [ ] Empty/near-empty DTOs: `create-school`, `create-term`, `create-department`,
  `create-equipment-change-log` (zero validation); `create-course` (only `department`),
  `create-location` (only `department?`).
- [ ] Query DTOs (`school`, `term`, `location`, `department`) have no page/limit defaults →
  `NaN` skip/limit if the client omits them.
- [ ] `findOne(+id)`/`update(+id)`/`remove(+id)` coerce a Mongo ObjectId string with unary
  `+`, producing `NaN`. Dormant today only because those methods are stubs — becomes a live
  bug the moment any of them is implemented.
- [ ] Seeders are half-disabled — `seed.ts` has `CourseOfferingsSeeder` and
  `EquipmentSeeder` commented out; no seeder exists for School, Department, Location,
  Course, or Term; seed data directory is gitignored, so a fresh clone can't seed without
  that data supplied separately.
- [ ] `Dockerfile` doesn't install Chromium and uses `npm install --ignore-scripts`, so
  Puppeteer PDF generation (`/api/equipment/report/download`) will fail in the built image.
  `equipment.controller.ts` also imports `path/win32` in a Linux-deployed service.

### P2 — architecture debt (deliberately deferred)

- [ ] **Multi-tenancy is effectively absent.** `School` exists as a schema; only
  `Department` references it; zero queries filter by school; no school claim on the JWT;
  no tenant guard. Nothing supports elementary→senior-high concepts yet (`gradeLevel`,
  `strand`, `track`, `section`, `curriculum`, `schoolYear`). `Term` is an orphan model
  nothing references. Cheaper to retrofit before this has live multi-school data than
  after.
- [ ] Two overlapping inventory-type enums with **different string values**
  (`EquipmentTag.NON_INVENTORY = 'non_inventory'` vs
  `EquipmentInventoryType.NON_INVENTORY = 'non-inventory'`), plus a third boolean (`hasTag`)
  carrying the same concept again.
- [ ] No real test coverage. Highest-value first targets once Phase 4.2 makes it urgent:
  `common/utils/transaction.util.ts` (the borrow state machine), `diff-eqipment.util.ts`.
- [ ] `.env` secrets in cleartext (gitignored but plaintext on disk, both live backends).
  The **legacy** Express repo's `.env` contains a GitHub PAT that should be rotated
  regardless of what happens to that repo.
- [ ] `src/modules/` restructure + `common/` consolidation — its own task, after the
  refactor above lands. Known items to fold in when it happens: the two inverted
  dependencies in `common/utils/` (`transaction.util.ts` — the other, `user.util.ts`, is
  already deleted), `day-of-week.enum.ts` being CMS-only, `ChangeAction`/`ChangeStatus`
  inline in a schema file, `src/course/schema/` singular, `diff-eqipment.util.ts` typo.

### Open questions — not decided

- [ ] **Who may release / mark-returned / return / cancel a borrow?** Phase 5.2 gated
  *approval* only, because that rule was specified and the others weren't. Specifically
  undecided: can a borrower cancel their own request? May an assistant release without an
  approver present? Can anyone mark something returned? The quantity arithmetic still
  constrains all of them (and since Phase 4.1, you cannot release what was never approved),
  but there is **no role check** on those transitions today. The resolver to hang it on
  already exists — `policies/approval.policy.ts` — so this is a rule decision, not a
  building job.
- [ ] **Public self-registration has no endpoint.** kurikula's registration form posts to
  `POST /api/user`, which has always sat behind the global `AuthGuard` — so signup returns
  401 and has been non-functional against this backend regardless of Phase 5.3. It now also
  requires `administrator`. A real signup flow needs its own `@Public()` endpoint that
  cannot let the caller pick their own role; opening this one back up would be the wrong
  fix.
- [ ] **Possible split: a separate CMS/back-office backend.** Under consideration: moving
  curriculum management onto its own backend, shaped so students can't reach it at the
  network layer at all. **This is why the CMS-shared modules (course, course-offering,
  department, school, term, location) were left ungated in Phase 5.3** — if they move to
  their own deployment, gating them here is throwaway work. The AMS-side role map
  (equipment, change-log, user) is decided and applied.

---

## Frontend — done this session (before the backend pivot)

- [X] `auth.interceptor.ts` — no longer logs out on every tokenless request (was including
  the login `POST` itself).
- [X] `homepage.component.ts` — `standalone: false` removed, unblocks `/login`.
- [X] `borrow.service.ts` — `search`/`page`/`purpose` params wired up (search box, purpose
  filter, and "Show more..." were all no-ops).
- [X] `update-quantity-status-dialog` — hardcoded "Flat Screw Driver 6.5×200mm" / "Add
  Transaction" replaced with real equipment binding.
- [X] `class-schedule.component.ts:112` — null-pointer crash on borrow submit fixed
  (missing `?.` on `courseOffer?.instructor?._id`).

## Frontend — auth & status migration (done, needs your test pass)

**Prerequisite before testing any of this:** run `npm run db:backfill-borrow-keys`
(dry run, then `-- --apply`). Existing borrow records have no `instructor`/`department`
until you do, so chairman/LIC visibility and the Approve button will look broken when
they aren't. See Phase 3.1 above.

- [X] **Roles now come from `GET /api/auth/profile`, not the JWT.** `AuthService` caches the
  profile in a **signal** — the call sites that need roles (route guards, `computed()` in
  templates, form defaults) are all synchronous while the profile is an HTTP call, and a
  signal is what lets `computed()` consumers recompute when it lands.
  `authGuard`/`roleGuard` now return Observables and await it: on a hard refresh the token
  is in localStorage but the profile isn't, and answering synchronously would report "no
  roles" and bounce you to login on every direct navigation.
  Login moved token storage into `AuthService.login()` so the profile is fetched as part of
  logging in. `roles[0].department._id` (3 sites) → `AuthService.primaryDepartmentId()`,
  which also stops throwing for users with no department-scoped assignment.
  `IUser.roles` is **deleted** — the API stopped returning it in Phase 1.2, so it was
  reading `undefined` everywhere, not merely unused.
  **Test:** log in as each role; check the header subtitle lists every assignment
  (`CHAIRMAN - CPE`); hard-refresh `/inventory` directly and confirm you aren't bounced to
  login; confirm a chairman of two departments sees both listed.
- [X] **Status model updated to the collapsed lifecycle.** `BorrowedEquipmentStatusType`,
  `BORROW_STATUS_DISPLAY`, `BORROW_STATUS_VARIANT`, `IN_CIRCULATION_STATUS` and the status
  filter dropdown all rebuilt around `requested → approved → released → mark_returned →
  returned` + `cancelled`/`unreturned`.
  **Two live bugs fixed:** the Approve action was still sending `instructor_approved` (a
  status the backend no longer accepts), and `canRelease` still tested for
  `instructor_approved`/`oic_approved` — so **the Release button could never appear**.
  Also: `getVariantFromBorrowStatus` held a second, already-drifted copy of
  `BORROW_STATUS_VARIANT` (`cancelled` rendered neutral there, danger elsewhere); it now
  delegates. "Approve as faculty"/"Approve as LIC" collapse to one option — who approved is
  on the transaction's `actedAsRole`, not in the status.
  **Test:** request → approve → release → return → confirm, and watch the badges.
- [X] `getRowActions` ports to assignments. The lab-in-charge check needs a
  location→department resolution the client can't do, so `/auth/profile` now populates
  `location.department` — mirroring `AssignmentService.departmentsViaLocationFor`. Marked
  as moving with SWAP POINT 1 on both sides.
  This still re-derives permissions client-side; the server re-checks and 403s regardless.
  **Still open:** the API should return what the caller may do per row so there's one copy
  of the rules.

## Config loading — both instances fixed

- [X] **`.env` was never being read.** `app.module.ts` read `process.env.DATABASE` in a
  top-level `const`, which executes at module *load* time — before
  `ConfigModule.forRoot()` has loaded `.env`. It always saw `undefined` and fell through to
  its hardcoded default. Now `MongooseModule.forRootAsync` + `ConfigService`, and it logs
  the database it connects to on startup: connecting to the wrong database looks like
  missing data rather than like a misconfiguration, and costs hours.
  **`.env` itself was wrong too** — it named `nestdb`, a database that has never existed,
  so fixing the loading without fixing the value would have silently created an empty one.
  Corrected to `asset_mgt_local`, and `JWT_EXPIRES_IN` from `10d` to `15m` (a 10-day access
  token would undo the point of refresh rotation).
- [X] **Same bug in `auth.module.ts`** — `JwtModule.register()` read `process.env` inside the
  decorator's object literal, which runs even earlier (at import resolution). Now
  `registerAsync`. **Effect: the signing secret changes** from the `test_jwt_local_`
  fallback to the real `JWT_SECRET`, so every existing access token is invalid. Sessions
  survive anyway — refresh tokens are opaque random values stored hashed, not JWTs, so the
  refresh flow mints a new access token on the next 401. That ordering was deliberate.
- [ ] `JWT_SECRET` is 8 characters. Too short for HS256 — brute-forceable offline from a
  captured token. Replace with 32+ random bytes before any deployment.

## Frontend — auth, still open

- [X] **Refresh-token flow.** The interceptor now refreshes instead of logging you out. Two
  paths: if the access token is already expired it refreshes *before* sending (rather than
  spending a request it knows will 401), and if a request 401s anyway — revoked token,
  changed signing secret — it refreshes once and retries. Anything other than a 401 is left
  alone for the caller to handle, and logout only happens after a refresh attempt has
  already failed.
  **The subtle part:** `refreshAccessToken()` shares one in-flight exchange across all
  callers. The server *rotates* the refresh token on every exchange and treats reuse of a
  spent one as theft by revoking the whole family — so without deduplication, a page that
  fires several requests at once would refresh several times, and the second exchange would
  log the user out. That sharing isn't an optimization, it's a correctness requirement.
  `logout()` now also POSTs `/auth/logout` to revoke server-side (fire-and-forget: clearing
  the local session must happen even if the server is unreachable). `isTokenExpired` no
  longer throws on a malformed token — the interceptor calls it on every request, so
  throwing there would take down the whole app.
  **Test:** log in, wait out the 15 minutes (or edit the stored token), then click around —
  you should stay logged in, with a single `POST /auth/refresh` in the network tab. Open a
  page that fires several requests at once and confirm you still see only **one** refresh.
  Then `POST /auth/logout` and confirm the old refresh token is rejected.
  **One-time:** anyone logged in from before this change has no `refresh_token` stored and
  will be logged out once on their next 401. Log back in and it's fine.
- [ ] Migrate `localStorage` → httpOnly cookies (backend already sets `credentials: true`
  CORS and is cookie-transport-ready per the plan; not wired up yet).

## Frontend — carried over, still open

- [ ] No user-management UI (`UserService.getUsers()` is never called), no dashboard, no
  settings page. Header renders a `Register` button with no click handler.
- [ ] `equipment-change-log` feature module is unroutable — not referenced in
  `app.routes.ts`.
- [ ] `borrowed-equipment.component.ts:74` hardcodes a transaction condition to
  `'functional'` (`// TODO add functional`).
- [ ] Seven 0-byte CSS files (`equipment-change-log`, `inventory`, `autocomplete`,
  `datepicker`, `dropdown`, `tab`, `toggle-button-group`); ~12 leftover `console.log`s;
  large commented-out template blocks in 9 templates; near-duplicated filter/search logic
  across three toolbar components; two separate `utils/` folders (`src/app/utils/` and
  `src/app/modules/shared/utils/`); `BorrowedEquimentFilter` spelling typo propagated
  through the codebase; `IEquipment` carries both `inventorytype` and `inventoryType`
  (create dialog writes one, detail dialog reads the other — pick one).
- [ ] Duplicate Prettier config — `package.json` says `printWidth: 100`, `.prettierrc` says
  `150`. Pick one, delete the other.
- [ ] One scaffold spec (`app.spec.ts`) exists and currently **fails** — asserts an `<h1>`
  no longer in the template.
- [ ] File-naming migration (opportunistic only, not a bulk pass — see `CLAUDE.md`): 11
  files in `src/app/models/` still need kebab-case + typed-folder renames —
  `ApiResponse.ts`, `BorrowedEquipment.ts`, `BorrowedEquipmentFilter.ts`,
  `BorrowedEquipmentHistory.ts`, `Course.ts`, `CourseOffering.ts`, `Department.ts`,
  `Equipment.ts`, `MongoDocument.ts`, `School.ts`, `User.ts`.

---

## elyui adoption (priority #2, after AMS is finished)

1. [ ] Upgrade AMS frontend Angular 20 → 21 (`ng update`, including Material/CDK) — blocks
    everything below; elyui's peer range is `^21.0.0`.
2. [ ] `npm install @paulelyson/elyui @angular/material @angular/cdk`; add the elyui CSS
    before `src/styles.css` in `angular.json`; add the Material Icons `<link>` to
    `index.html`; add `provideAnimationsAsync()` to `app.config.ts` (needed for `Snackbar`).
3. [ ] Replace `toggle-button-group` with `<ely-segmented-control>` — its only call site is
    the commented-out paper-size selector in `download-report-dialog.component.html:11`, so
    this also restores PDF page-size/orientation selection (currently hardcoded to
    LEGAL/landscape).
4. [ ] Swap one at a time, manual test after each: `icon` → `ely-icon`, `badge` →
    `ely-badge`, `button` → `ely-button`, `toggle` → `ely-toggle`, `snackbar` →
    `SnackbarService`.
5. [ ] Everything else (`input`, `textarea`, `autocomplete`, `dropdown`, `datepicker`,
    `tab`, dialogs, a table) stays hand-rolled until elyui ships it — migrate one component
    at a time, only on your explicit go-signal.

## kurikula — last priority

Dormant since 2026-04-28, ~35–40% of v1. Revisit once AMS is stable and elyui covers form
controls. One coupling to remember when this resumes: registration hardcodes
`role: 'student'` with a required department — that's what forced the Assignment-collection
design (Phase 1.2) to keep a student row rather than dropping students from authorization
scoping entirely.
