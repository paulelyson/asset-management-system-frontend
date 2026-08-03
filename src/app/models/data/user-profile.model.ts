/**
 * What `GET /api/auth/profile` returns.
 *
 * The access token no longer carries roles — it proves *who* you are, and what
 * you may do is loaded from the Assignment collection per request. So this is
 * the only authoritative source of the caller's roles on the client.
 *
 * Note this is still only good enough for *rendering* decisions (hide a button,
 * pick a default department). Every real authorization check happens on the
 * server; nothing here is a security boundary.
 */

export type AssignmentRole =
  | 'administrator'
  | 'dean'
  | 'chairman'
  | 'lab_in_charge'
  | 'instructor'
  | 'assistant'
  | 'student';

/** Populated by the profile endpoint only — elsewhere these are bare ObjectIds. */
export interface AssignmentDepartment {
  _id: string;
  code: string;
  name?: string;
}

export interface AssignmentLocation {
  _id: string;
  name: string;
  /**
   * The department this location belongs to. A lab_in_charge is assigned to a
   * room, but their authority covers that room's department — this is what lets
   * the client mirror the server's scoping rule. Mirrors
   * `AssignmentService.departmentsViaLocationFor`; if that rule changes to true
   * per-room scoping, this changes with it.
   */
  department?: string | null;
}

/**
 * One role, in one scope. A user can hold several — a chairman of two
 * departments has two rows, which is the case the old `roles[0]` shape got
 * wrong.
 *
 * `department` is set for instructor/chairman (and for student, as an
 * affiliation fact that grants nothing); `location` for lab_in_charge/assistant.
 */
export interface UserAssignment {
  _id: string;
  role: AssignmentRole;
  department?: AssignmentDepartment | null;
  location?: AssignmentLocation | null;
  active: boolean;
}

export interface UserProfile {
  _id: string;
  idNumber: string;
  name: string;
  assignments: UserAssignment[];
}
