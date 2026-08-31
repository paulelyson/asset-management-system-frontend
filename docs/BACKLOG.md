# AMS Backlog

Consolidated checklist across both repos — what's done and what's left, including work
from before this session. Testing is manual and one item at a time (see each repo's
`CLAUDE.md` — there's effectively no automated coverage to lean on instead), so this is
laid out as a checklist you can work through and verify individually. Companion to
`docs/PROJECT-SYNC.md` (the narrative/architecture doc); this file is the flat todo list.

Last updated: 2026-08-27.

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

## elyui adoption — DONE 2026-08-27 (was priority #2)

AMS frontend is on Angular 21.2 and consumes `@paulelyson/elyui@0.2.0`. Six hand-rolled
components plus the `toggle-button-group` stub are gone from `src/app/modules/shared/`.

1. [x] **Angular 20 → 21.2.** `ng update @angular/core@21 @angular/cli@21`, then
    `ng update @angular/material@21.2` — the explicit `21.2` matters, because bare `@21`
    resolves to the `21.3.0-next` prerelease. Zero source files changed: the app was
    already on `@angular/build` builders, TypeScript 5.9, stable zoneless, all-standalone,
    and the M3 `mat.theme()` API, so none of Angular's migrations had anything to rewrite.
2. [x] **Karma → Vitest.** `@angular/build:unit-test` builder with no options,
    `types: ["vitest/globals"]`, 7 karma/jasmine devDeps dropped for `vitest` + `jsdom`.
    Matches kurikula and elyui exactly. There were no spec files to port — the failing
    `app.spec.ts` this backlog used to mention had already been deleted.
3. [x] **Wired elyui.** `elyui.css` first in `angular.json`'s `styles`, before
    `custom-theme.scss` and `styles.css`, so AMS's 180 tokens win. `provideAnimationsAsync()`
    proved **unnecessary** — MatSnackBar and MatDialog animate without it on Material 21.
    No token overrides needed either: elyui's `--color-toggle-*` defaults are byte-identical
    to the values AMS had hardcoded.

    ⚠️ **`ng serve` reads `angular.json` once, at startup.** Editing the `styles` array
    while the dev server is running silently does nothing — the watcher watches the files
    *in* the list, never the list itself. This cost a debugging round; restart after any
    config edit.
4. [x] **Five swaps, one commit each**, cheapest first: `SnackbarService` (8 consumers) →
    `Badge` (9 templates) → `Button` (20) → `Icon` (12) → `Toggle` (5). Each deleted its
    local folder. Found along the way:
    - **`app-icon`'s `type` input was dead** — the template was `[ngClass]="[size]"` and the
      CSS had no variant rules, so the input did nothing. elyui implements it, so icons now
      take an explicit `variant` color (default `primary`) where they used to inherit.
      The one app-wide visual change of the migration.
    - **The toggle was already hand-rolled**, not `MatSlideToggle` — `<mat-slide-toggle>`
      appears in no template in the app. The `--mat-slide-toggle-*` overrides in
      `custom-theme.scss` had never applied to anything; deleted, 15 dead lines.
    - **A CSS selector targeted the element name** — `.toolbar-container > app-button` in
      `borrow-toolbar.component.css`, a mobile-layout rule that would have failed silently.
      Sweep `.css`/`.scss` for old selectors, not just `.ts`/`.html`.
    - **Three dead imports** (`ButtonComponent` in `equipment-change-log`, `IconComponent`
      in `header`, `ToggleButtonGroupComponent` in `download-report-dialog`) — imported,
      never in `imports:`, never in a template.
    - elyui's `Badge` and `Button` pass `[variant]` through to their inner icon; the local
      versions did not. Icon buttons on `danger`/`warning` now tint to match.
5. [x] **Retired `toggle-button-group`** — a two-input stub with no output, superseded by
    `SegmentedControl`. Its only references were a dead import and a commented-out line.
6. [x] **Deduplicated the ui models.** `models/ui/button-config.model.ts` deleted (it was
    byte-identical to elyui's, `ButtonConfig` class included); `common-config.model.ts`
    keeps only `FilterDisplay`, which is app-specific. `Size`/`Variant`/`ButtonAppearance`/
    `ButtonConfig` now come from the package.
7. [x] **`textarea` → `ely-textarea`** (2026-08-28, elyui `0.2.0`). `^0.1.3` had to be
    bumped to `^0.2.0` by hand — a caret on a `0.x` range stops at the minor, so
    `npm install` alone would never have picked it up. The 0.1.3→0.2.0 lib diff is purely
    additive (the component plus a `FieldWidth` type), so nothing already migrated moved.
    elyui's `Textarea` is a real `ControlValueAccessor`, so all three reactive-forms call
    sites kept working unchanged. Its defaults are empty strings where the local one
    hardcoded `'Remarks'`/`'(Optional)'`/`'Add note..'`, so every call site now passes
    `label`/`tag`/`placeholder` explicitly. Two latent bugs died with the local component:
    `readonly` was declared but never bound in the template, and `registerOnTouched` was
    registered but never called, so the controls never left `ng-untouched`.

8. [x] **`title-section` → `ely-title-section`** (2026-08-30, elyui `0.4.0`). `^0.2.0`
    bumped to `^0.4.0` by hand for the same caret-on-`0.x` reason as the textarea swap;
    0.2.0→0.4.0 is purely additive (`VerticalStepper` + `TitleSection` in 0.3.0, `Input` in
    0.4.0), so nothing already migrated moved. All four call sites (`borrow`,
    `borrowed-equipment`, `inventory`, `equipment-change-log`) pass plain text and take the
    defaults — `size="lg"`, `variant="primary"`, `showBottomBorder` true — so none needed a
    binding. Two deliberate visual shifts: the title and its rule now read
    `--color-text-primary-default` (#539364) where the local component used
    `--color-text-primary-strong` / `--color-border-primary-active` (#4b7947), and the
    heading is 2.25rem rather than 2.2rem. Note that the variant class sets `--title-color`
    on the inner element, so a host-level `ely-title-section { --title-color: … }` override
    loses to it — restoring the darker green means a new elyui variant, not a consumer
    override.

9. [x] **`vertical-stepper` → `ely-vertical-stepper`** (2026-08-30, elyui `0.4.0`, shipped
    in 0.3.0). Two call sites, both dialogs: `borrowed-equipment-history-dialog` and
    `equipment-change-log-dialog`. Both take the default `size="sm"`, which keeps the badge
    at `xs` exactly as the local component hardcoded it. `VerticalStepperConfig` stays an
    app model — elyui ships the component but no config class — and was renamed to
    `vertical-stepper-config.model.ts` on the way past, the suffix CLAUDE.md flagged.
    Four behaviour changes, all inherited from elyui:
    - The badge and the timestamp are now `@if`-guarded. The local template rendered
      `<ely-badge>` and the time `<span>` unconditionally, so an empty `badgeContent` drew
      a bare badge pill. Neither call site currently passes an empty one.
    - The connector line was `position: absolute` with `height: calc(100% + 15px)`; elyui
      grows it with `flex: 1` against a `align-items: stretch` row. Same look, but it no
      longer overshoots by a hardcoded 15px.
    - Spacing tightens: the local `.step` had `padding: 10px` and `gap: 15px`, elyui has no
      padding and `gap: var(--gap-lg)` (8px).
    - The timestamp reads `--color-text-gray-light` (#adb5bd) instead of
      `--color-text-gray` (rgba(0,0,0,.54)) — lighter.

    Also noticed, left alone: `borrowed-equipment-history-dialog` builds a `title` into
    every `VerticalStepperConfig` and then never binds it in the template, so the step
    titles have never rendered in that dialog. The change-log dialog does bind it. Fixing
    it is a visual change, not a migration change.

10. [x] **`input` → `ely-input`** (2026-08-30, elyui `0.4.0`). The biggest swap so far: 16
    call sites across 8 components (three toolbars, login, change-password,
    class-schedule, update-quantity-status, create-equipment). The class is **`TextInput`**,
    not `Input` — elyui names it that way deliberately so consumers can import it alongside
    Angular's own `@Input` decorator without a collision. Renamed inputs:
    `suffix_icon` → `suffixIcon`, `suffix_icon_clickable` → `suffixIconClickable`,
    `inputType` → `type`.

    **`width` changed meaning, and it is a silent trap.** The local input's `width` was a
    size bucket (`'sm' | 'md' | 'lg'`, where `sm` was a flat 100px); elyui's `width` is a
    layout mode (`'full' | 'auto'`). The one call site passing `width="sm"` — the quantity
    field in `create-equipment-dialog` — now gets its 100px from a
    `.condition-wrapper > ely-input` rule in that dialog's own stylesheet, which is what
    elyui's `FieldWidth` doc comment recommends. Any future `width="sm"` will typecheck as
    a plain string and silently do nothing.

    This one drops Material: the local input wrapped `<mat-form-field appearance="fill"
    floatLabel="always">`, elyui's is hand-rolled with the label sitting *above* the box.
    No call site passed `appearance` or `floatLabel`, so nothing needed rewiring, but the
    look changes everywhere — most visibly the toolbars, whose unlabelled search inputs
    lose the 70px `mat-form-field` height (and the `margin-bottom: -22px` compensating for
    it) that `custom-theme.scss` sets.

    ⚠️ **Do not delete the `mat-form-field` block in `custom-theme.scss`.** It looks
    orphaned after this swap but still serves `autocomplete`, `datepicker`, and `dropdown`,
    which are all still hand-rolled on Material.

    ⚠️ **Mixed rows now look off.** `.condition-wrapper` in `create-equipment-dialog` puts
    an `ely-input` (label above the box) next to an `app-autocomplete` (Material floating
    label inside a 70px field) on an `align-items: baseline` row. They will not line up
    until `autocomplete` migrates. This is the unavoidable cost of a one-component-at-a-time
    sequence; it resolves itself rather than needing a fix.

    **Some inputs are restyled to an underline** — transparent fill, bottom border only —
    via an opt-in `.field-underline` class under "Field Commons" in `styles.css`. Applied
    as `<ely-input class="field-underline" [hasRadius]="false" />`; **both halves are
    required**, see the specificity warning below. Worn by the three toolbar search inputs
    and both login-dialog fields. The rule lives in the global sheet on purpose: global
    styles carry no encapsulation attribute, so they reach a component's internals without
    `::ng-deep`, which this app uses nowhere. elyui exposes no custom properties for
    `.field__box`'s background or border, and `hasBorder="false"` is not a substitute (it
    clears all four edges and restores all four on focus). If elyui ever ships an
    `appearance` input for its fields, this override is the first thing to retire.

    ⚠️ **Overriding an elyui internal from the global sheet has a specificity ceiling.**
    elyui is built with emulated encapsulation, so every one of its rules carries an
    appended `[_ngcontent-*]` attribute worth +1 in the class column. `.field__box` is
    (0,2,0) — beatable — but `.field__box.sm`, which sets the **padding and radius**, is
    (0,3,0) and beats the `.toolbar-container > ely-input .field__box` selector at (0,2,1).
    That is why the radius comes off via `[hasRadius]="false"` and not CSS: elyui orders
    `.radiusless` after its size rules specifically to win that tie. Anything else living
    on a size class needs the component's own API or a longer selector — reaching for
    `!important` means the specificity was misread.

    Two more found along the way: `.toolbar-container > app-input` in
    `borrow-toolbar.component.css` was another element-name selector in a `max-width: 480px`
    block (same trap as `app-button` before it), and elyui gates `suffixIconClick` emission
    on `suffixIconClickable` where the local component emitted unconditionally — only
    `login-dialog` listens, and it already sets the flag, so behaviour is unchanged.

11. [x] **`dropdown` → `ely-dropdown`** (2026-08-31, elyui `0.5.1`). No version bump — the
    package was already on `^0.5.1`. Small swap: 4 call sites across 2 components
    (`create-equipment-dialog` ×3, `equipment-filter-dialog` ×1). Renamed output:
    `selectChanged` → `valueChange`. Options still take a plain `string[]`; elyui's
    `normalizedOptions` getter widens it to `DropdownOption[]` internally, so no call site
    had to change shape.

    **`placeholder` was a dead attribute and is now live.**
    `equipment-filter-dialog.component.html` passed `placeholder="Select.."` to a component
    that declared no `placeholder` input — a static attribute, so no template error, it just
    landed inertly on the host element and did nothing. elyui *has* the input, so it now
    renders as a `disabled hidden` first `<option>`. That is the one visible change of this
    swap, and it's a fix: the Can Be Borrowed filter used to open blank.

    This one drops Material: the local dropdown was `mat-form-field` + `mat-select`, elyui's
    is a native `<select>` with the label above the box. That removed the **last `mat-select`
    in the app**, so the `mat-select` selector in `custom-theme.scss`'s "Dropdown option
    override" block went dead and was deleted, along with the commented-out
    `mat.select-overrides` block under it. `mat-option.mat-mdc-option` **stays** — the
    `mat-autocomplete` panel in `app-autocomplete` still renders `mat-option`. The
    `mat-form-field` block stays too (`autocomplete` and `datepicker` are still on it).

    ⚠️ **Native `<select>` desyncs on a value that isn't in `options`.** With no
    `placeholder`, a bound value of `''` (or anything absent from the list) makes the browser
    display the *first* option while the model still holds the old value — no event fires, so
    the form and the screen disagree. All three `create-equipment-dialog` dropdowns seed a
    real default in the `FormBuilder` group (`unit` → `EquipmentUnit.PC`, `matter` →
    `'solid'`, `inventoryType` → `'inventory'`), so none of them can hit it. Any future
    dropdown over a control that starts empty needs a `placeholder` to render honestly.

    ⚠️ **`equipment-filter-dialog` now has mixed rows**, same cost as the `ely-input` swap:
    three `app-autocomplete`s (Material floating label in a 70px field) stacked above one
    `ely-dropdown` (label above the box). It resolves when `autocomplete` migrates.

    **The filter dialog's fields were never full-width** — `.equipment-filter-container` is
    a column flex with `align-items: center`, which is the *cross* axis, so every field
    shrank to its content. Material's fields hid it behind an intrinsic ~180px input width;
    `ely-dropdown` has none, so it collapsed to the width of "Select.." and made the
    pre-existing bug obvious. Changed to `stretch` — all four fields now fill the dialog.
    Worth watching for elsewhere: `align-items: center` on a column flex container is almost
    always a width bug waiting for a component with no intrinsic width.

12. [x] **`autocomplete` → `ely-autocomplete`** (2026-08-31, elyui `0.5.1`). 8 live call sites
    across 5 components (`create-equipment-dialog` ×3, `equipment-filter-dialog` ×3,
    `borrowed-equipment-filter-dialog` ×2, `class-schedule` ×2, `update-quantity-status`
    ×1), plus the commented-out ones updated so they still work if uncommented.

    **The type rename reached further than the templates.** `IAutocompleteOption` →
    `AutocompleteOption`, and its display field **`view` → `label`**. That is 9 object
    literals in 5 files: `AutocompleteService` (both methods), five `computed()` lists in
    `create-equipment-dialog`, the `forkJoin` map in `equipment-filter-dialog`, and
    `courseOfferingAutoCompleteOptions` in `class-schedule`. Grep `view:` after a rename
    like this, not just the selector.

    Output renamed `optionselected` → `optionSelected`, **and its payload changed from the
    value string to the whole `AutocompleteOption`**. That cost nothing only because no
    template ever listened to it — it was a dead output. Dropped inputs: `floatLabel` and
    `appearance`, both Material-only and never passed by any call site.

    **Two behaviour changes, both fixes.** ① *Typing clears the bound value.* The AMS copy's
    `onInput` only reset the control when the field went empty, so typing a non-matching
    string left the form holding a stale value while the user saw different text. elyui
    treats selection as strict: any keystroke clears until an option is picked. ②
    *`readonly` is honoured.* elyui's `toggle()` returns early when readonly, so the panel
    won't open; Material's autocomplete opened anyway on a readonly input. The one call site
    is `create-equipment-dialog`'s Department field, which is meant to be display-only.

    `borrowed-equipment-filter-dialog.component.css` had the **same `align-items: center`
    width bug** as the equipment filter dialog — a copy-paste of the same container — and
    would have shipped visibly broken once its two Material fields lost their intrinsic
    width. Fixed to `stretch` in the same pass.

    This removed the last `mat-option` in the app, so that block came out of
    `custom-theme.scss`. The `mat-form-field` block **stays** — `app-datepicker` is still on
    Material and is now its only consumer.

    Left behind deliberately: `AutocompleteService.mapIntoAutocompleteOption` is now an
    identity mapper (`value` and `label` are the same string), because elyui accepts a plain
    `string[]` and normalises internally. Its four callers could pass their arrays straight
    through and drop it. Not done here — separate logical change.

13. [x] **`datepicker` → `ely-datepicker`** (2026-08-31, elyui `0.5.1`). Only 4 call sites
    (`create-equipment-dialog` ×2, `class-schedule` ×2), but the first swap in this whole
    sequence that changed **data, not just markup**.

    **Half the local component was dead.** It covered a date range too, switched by a
    `type: 'datepicker' | 'daterange'` input — and nothing ever used it: no call site passed
    `type="daterange"`, nothing imported `IDateRange`, and `initialDateRange` /
    `dateRangeChanged` had no listeners. Deleted rather than ported, which is why elyui's
    `DateRangePicker` stays unused here. Check for this before porting a mode-switching
    component; half of it may be answering a question nobody asked.

    ⚠️ **The control value changed from `Date` to a `yyyy-mm-dd` string.** Material's picker
    held a `Date` (via `provideNativeDateAdapter`); elyui renders a native
    `<input type="date">`, which accepts **only** `yyyy-mm-dd` and renders **blank,
    silently**, for anything else — a `Date` object or the full ISO datetime the API returns
    included. Left alone, editing existing equipment would have shown empty date fields with
    no error anywhere. New `toISODateOnly()` in `utils/date.util.ts` normalises at the
    form-seeding boundary.

    **A latent timezone bug went with it.** `concatDateAndTime()` now takes the
    `yyyy-mm-dd` string and builds its `Date` from the parts, instead of
    `new Date('2026-08-31')` — which parses as midnight **UTC**, i.e. still the previous day
    anywhere west of Greenwich, so `setHours` would have stamped the wrong date. It happened
    to be right in UTC+8; it is right everywhere now. `americanDateToISODate` went with the
    dead range branch that was its only caller.

    This removed the **last `mat-form-field` in the app** — the whole block came out of
    `custom-theme.scss`, along with `provideNativeDateAdapter()` and the Material date
    adapter. Every form control is elyui now; Material is left doing dialogs, tooltips,
    tabs, the sidenav and dividers.

### Still open

- [ ] **Drop `AutocompleteService.mapIntoAutocompleteOption`.** It only existed because the
    old local autocomplete refused bare strings. `ely-autocomplete` and `ely-dropdown` both
    take `string[]`, so its four call sites (`update-quantity-status-dialog`,
    `equipment-filter-dialog`, `borrowed-equipment-filter-dialog`, `class-schedule`) can
    pass their constants directly. `getBorrowedStatusOptions` stays — its value and label
    genuinely differ.
- [ ] **Restore the PDF paper-size selector** with `<ely-segmented-control>`.
    `PDFFormatConfig` declares `pageSize: 'A4' | 'LETTER' | 'LEGAL'` and
    `orientation: 'portrait' | 'landscape'`, but the download dialog only ever sets
    `columns` — so every report ever generated has been LEGAL/landscape with no way to
    change it. ~15 lines: two `SegmentedControlOption[]` arrays, two `valueChange`
    handlers, thread the values into the constructor that already accepts them.
- [ ] **`autocomplete` → `ely-autocomplete`, then `datepicker` → `ely-datepicker`.** Both
    are published (0.5.x); they just need their own go-signal, one at a time.
    `autocomplete` is the higher-value of the two — it has the most call sites and it's what
    makes `create-equipment-dialog`'s and `equipment-filter-dialog`'s mixed rows line up
    again. Note `AutocompleteOption` renames the display field `view` → `label`, which every
    AMS call site and `AutocompleteService.mapIntoAutocompleteOption` currently emits as
    `view`. Doing these two retires the last `mat-form-field` in the app, and with it the
    whole `mat-form-field` / `mat-option` block in `custom-theme.scss`.
- [ ] `tab`, dialogs and a table stay hand-rolled — elyui hasn't shipped them. Everything
    elyui *has* shipped and AMS has a use for is now adopted; `DateRangePicker` is the one
    published component with nothing to point it at.

## kurikula — last priority

Dormant since 2026-04-28, ~35–40% of v1. Revisit once AMS is stable and elyui covers form
controls. One coupling to remember when this resumes: registration hardcodes
`role: 'student'` with a required department — that's what forced the Assignment-collection
design (Phase 1.2) to keep a student row rather than dropping students from authorization
scoping entirely.
