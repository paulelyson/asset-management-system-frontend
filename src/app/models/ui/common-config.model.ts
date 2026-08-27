/**
 * `Size` and `Variant` used to live here. They now come from
 * `@paulelyson/elyui`, which is the single source of truth for the token
 * vocabulary shared by every elyui component — keeping a local copy in sync by
 * hand is how the two drift apart.
 *
 * `FilterDisplay` stays: it describes this app's URL-driven filter chips and is
 * not part of the component library.
 */
export interface FilterDisplay {
  field: string;
  value: any;
  show: boolean;
  canClose: boolean;
}
