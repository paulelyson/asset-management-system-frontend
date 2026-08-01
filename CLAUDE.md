# AMS Frontend

Angular frontend for the Asset Management System — inventory management and equipment
borrowing for a university (goal: eventually usable across PH schools, elementary through
university). Talks to `asset-management-system-backend-v2` (NestJS) on `localhost:3000`.

**Read `docs/PROJECT-SYNC.md` first** — it covers the full four-repo picture (this repo,
the backend, kurikula/CMS, and the elyui component library), the priority order, and the
full backlog. This file covers only what's specific to working inside this repo.

## Stack

- Angular 20.3, **zoneless** (`provideZonelessChangeDetection()` in `app.config.ts`),
  standalone components.
- Angular Material 20 + CDK — used as underlying primitives (tooltips, dialogs, tabs), not
  themed directly; the app has its own hand-rolled design system in
  `src/app/modules/shared/`.
- `jwt-decode` for reading the JWT client-side. `rxjs` for streams that aren't local
  component state.
- **No path aliases** in `tsconfig.json` — every import is a deep relative path
  (`../../../models/...`). Don't introduce aliases without discussing it first; it's a
  deliberate-so-far choice, not an oversight.
- Routing is lazy per feature (`borrow`, `inventory`, `borrowed-equipment`, `homepage`),
  but each lazy module is a near-empty `NgModule` shell whose only job is to route to a
  standalone component. This hybrid is legacy scaffolding, not the intended pattern —
  don't copy it for new features; route directly to standalone components instead.

## State pattern — the URL is the store

This is the one thing to internalize before touching a list/filter feature. There is no
NgRx and no client-side cache. Filter state lives in the URL:

`ActivatedRoute.queryParams` → component reads params → sets a signal → refetches →
toolbars call `router.navigate(..., { queryParamsHandling: 'merge' })` to update the URL,
which re-triggers the cycle.

Local component state is **signals** (`signal()`, `computed()`, `effect()`). Cross-
component state that isn't URL-driven uses RxJS `BehaviorSubject` (e.g.
`AuthService.loggedInSubject`, `SideMenuService.openSideMenu`). There's no caching layer —
every dialog open or list load re-hits the API. Don't add a store library or a cache
without discussing it; the pattern is consistent today and changing it is a cross-cutting
decision, not a per-feature one.

Input API is mixed: most components use `@Input()`/`@Output()` decorators (the house
style — matches elyui's convention); a handful of newer components (`toggle`, `avatar`,
the toolbars) use the `input()` signal function. Don't spread `input()` further without a
decision — pick one and finish the migration deliberately, the way the file-naming
migration below is meant to happen.

## Service layer

Every service in `src/app/services/` is `providedIn: 'root'`, builds requests with
`HttpParams`, and returns `Observable<ApiResponse<T>>`. See `docs/PROJECT-SYNC.md` for the
`ApiResponse` envelope shape (7 fields; the backend's declared type only has 3 — trust the
7).

**Error handling is half-migrated** — `ExceptionService.handleError` is the intended
shared handler (used by `equipment.service.ts`, `borrow.service.ts`,
`location.service.ts`), but `auth.service.ts`, `user.service.ts`,
`department.service.ts`, and `course-offering.service.ts` each carry their own private
`handleError` reading a slightly different error shape. When touching one of these
services, prefer migrating it onto `ExceptionService` over adding another local variant.

Some services also carry presentation logic (`BorrowService.getRowData/getRowActions`,
`EquipmentService.getRowData/getChangeLogRowData` build UI row configs inside the HTTP
layer). That's the existing pattern for feeding the `data-row` list component — follow it
for consistency rather than inventing a second convention, but don't extend it further
than necessary.

## Auth

- JWT stored in `localStorage['token']`, decoded client-side with `jwt-decode`.
- `AuthService`: `login`, `logout`, `changePassword`, `isTokenExpired`, `hasToken`,
  `hasRole`.
- `authGuard` — token presence only. `roleGuard(roles[])` — factory guard, calls
  `logout()` on failure (hard redirect, not a 403 page).
- `authInterceptor` (functional, `provideHttpClient(withInterceptors([...]))`) attaches
  `Authorization: Bearer`. **Known bug:** it currently calls `logout()` on any tokenless
  request, including the login POST itself — see the P0 frontend backlog in
  `docs/PROJECT-SYNC.md`.

## Environments

`src/environments/environment.ts` is the **production** file (inverted-looking but
correct — `fileReplacements` swaps in `environment.development.ts` for the dev
config) — currently `api_url: ''` (empty, needs to be filled in before a real prod
deploy). `environment.development.ts` → `http://localhost:3000`.

## File naming convention

Target convention (NestJS-style, already in use for `models/data/`, `models/filters/`,
`models/ui/`): **kebab-case, type-suffixed, in a typed folder** — e.g.
`equipment-filter.model.ts` under `models/filters/`.

11 files in `src/app/models/` still violate this (`ApiResponse.ts`,
`BorrowedEquipment.ts`, `BorrowedEquipmentFilter.ts`, `BorrowedEquipmentHistory.ts`,
`Course.ts`, `CourseOffering.ts`, `Department.ts`, `Equipment.ts`, `MongoDocument.ts`,
`School.ts`, `User.ts`). **Rename opportunistically when a file is touched for other
reasons — not as a bulk pass.** When you do rename one, move it into the matching typed
subfolder (`data/`, `filters/`, or `ui/`) at the same time, and update its imports.

Also worth noting when you're in the area: `models/ui/vertical-stepper-config.ts` is
missing the `.model` suffix its siblings have, and module files are inconsistently
`*-module.ts` vs `*.module.ts` (the latter matches `angular.json`'s own schematic
config — prefer it for new modules).

## Commit convention

Types: `feat`, `fix`, `refactor`, `docs`, `chore` — five, no more. Format:
`type(scope): subject`, scope = the feature/module touched (e.g. `borrow`,
`inventory`, `auth`). One commit per logical change — don't bundle unrelated fixes.

**I don't run git.** Every change ends with a suggested commit message for you to use.

## Working rules

- No `npm`/`ng` commands — the user runs and tests everything manually (there's
  effectively no automated test coverage to lean on instead: one scaffold spec exists and
  it currently fails).
- No git write commands.
- After any change, state plainly what to manually test — which route, which action,
  what the expected result is.
- Don't add abstractions (stores, caches, aliases) beyond what's already established
  without raising it first — several of the patterns above are deliberate, not
  accidental gaps.

See `docs/PROJECT-SYNC.md` for the full cross-repo backlog and the elyui adoption
sequence.
