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
- [ ] **Phase 2.1** — bcrypt password hashing. **Needs** `npm run db:hash-passwords` (dry
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

- [ ] **Phase 2.4 (remainder)** — enable `whitelist: true` in `main.ts:15`. Deliberately
  held back from the auth rewrite above — it affects every DTO in the app, not just auth,
  and needs its own audit-what-the-frontend-actually-sends pass.
- [ ] **Phase 6.1–6.4** — type safety pass. `JwtPayload`/`AuthenticatedRequest` (in
  `auth/types/`, not `common/`, to avoid a new inverted dependency) threaded through every
  `req: any` — zero remain. `QueryFilter<T>` on the filter sites (**note:** Mongoose 9
  renamed `FilterQuery` → `QueryFilter`; type against the raw schema class, not the hydrated
  `…Document`). Aggregation results typed.
  **Found a real bug:** `equipment.controller.ts` passed a raw string into a parameter
  declared `Types.ObjectId` — invisible for as long as `req` was `any`.
  **⚠️ API contract changed — frontend updated in the same commit:** the equipment list no
  longer returns `data: [rows, count]`. It returns `data: rows` plus
  `meta.pendingApprovalCount`. Also `GET /api/user` now reports a real `total` instead of 0.
  **Test:** the inventory list (rows render, pending-approval badge shows the right number)
  and the borrow page's equipment list. These are the two screens the contract change
  touches.
- [ ] **Phase 6.5 (partial)** — `npm run lint` now checks instead of rewriting your source;
  `npm run lint:fix` does the rewriting. eslint `no-explicit-any` → `warn`.
  **Remaining tsconfig flags deferred on purpose** — `noUnusedParameters` can't pass until
  Phase 7.3 deletes the 15 stub methods that ignore their parameters by construction.
  Enabling it first would just restate 7.3 as a wall of errors.
- [ ] **Phase 7** — correctness/cleanup: remove the now-redundant `$toObjectId` calls (safe
  once Phase 0 is fully verified — it is), fix `equipment.service.ts` omitting
  `deleted: false` so soft-deleted equipment leaks into `GET /equipment`, restore a
  commented-out `$sort`, fix a dead `department` filter in
  `equipment-change-log.service.ts`, replace 15 template-string route stubs and ~25 `+id`
  `NaN` coercions, make `GlobalExceptionFilter` actually log (currently imports `Logger`
  and never instantiates it), dead-code sweep (14 unused imports incl. `path/win32` in a
  Dockerized service, 2 `console.log`s in the request path, etc.).

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

## Frontend — blocked on backend Phase 2, do together (not before)

- [ ] Implement the refresh-token flow: call `/auth/refresh` before expiry or on a 401,
  store both tokens.
- [ ] **Required, not optional, once Phase 2.2 is live**: `hasRole`/`roleGuard`/
  `AuthService.getUser()` need to read assignments from `GET /auth/profile` instead of
  decoding `roles` out of the JWT — the claim no longer exists. Until this lands, every
  role-gated route throws.
- [ ] Migrate `localStorage` → httpOnly cookies (backend already sets `credentials: true`
  CORS and is cookie-transport-ready per the plan; not wired up yet).
- [ ] **Now live, not pending** — backend Phase 4 has landed, so
  `models/BorrowedEquipment.ts` is out of sync: `instructor_approved`, `oic_approved`,
  `instructor_rejected`, `oic_cancelled` and `system_reset` no longer exist. Update
  `BorrowedEquipmentStatusType`, `BORROW_STATUS_DISPLAY`, `BORROW_STATUS_VARIANT` and
  `IN_CIRCULATION_STATUS` to the lifecycle states. "Cancelled by instructor" now comes from
  the transaction's `actedAsRole` field, not from the status value.
- [ ] `borrow.service.ts:110-121` (`getRowActions`) decides who sees approve/cancel buttons
  by reading `user.roles` from the JWT and comparing departments client-side. Both halves
  are now wrong: the JWT has no `roles` (Phase 2.2), and the authority on this is the
  backend's approval policy (Phase 4.3). Longer-term the backend should return what the
  caller may do on each row rather than the frontend re-deriving it.
- [ ] Inventory list reads named response fields instead of `data[0]`/`data[1]` — lands
  together with backend Phase 6.4 (the one backend step that changes the API contract).

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
