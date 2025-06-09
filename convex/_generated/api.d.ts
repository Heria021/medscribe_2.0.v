/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as appointments from "../appointments.js";
import type * as audioRecordings from "../audioRecordings.js";
import type * as chatMessages from "../chatMessages.js";
import type * as chatSessions from "../chatSessions.js";
import type * as doctorPatients from "../doctorPatients.js";
import type * as doctors from "../doctors.js";
import type * as medications from "../medications.js";
import type * as notifications from "../notifications.js";
import type * as patients from "../patients.js";
import type * as referrals from "../referrals.js";
import type * as seedAppointments from "../seedAppointments.js";
import type * as sharedSoapNotes from "../sharedSoapNotes.js";
import type * as soapNotes from "../soapNotes.js";
import type * as treatmentPlans from "../treatmentPlans.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  appointments: typeof appointments;
  audioRecordings: typeof audioRecordings;
  chatMessages: typeof chatMessages;
  chatSessions: typeof chatSessions;
  doctorPatients: typeof doctorPatients;
  doctors: typeof doctors;
  medications: typeof medications;
  notifications: typeof notifications;
  patients: typeof patients;
  referrals: typeof referrals;
  seedAppointments: typeof seedAppointments;
  sharedSoapNotes: typeof sharedSoapNotes;
  soapNotes: typeof soapNotes;
  treatmentPlans: typeof treatmentPlans;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
