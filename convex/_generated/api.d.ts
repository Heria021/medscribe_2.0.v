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
import type * as doctorPatientConversations from "../doctorPatientConversations.js";
import type * as doctorPatients from "../doctorPatients.js";
import type * as doctors from "../doctors.js";
import type * as drugInteractions from "../drugInteractions.js";
import type * as emailAutomation from "../emailAutomation.js";
import type * as emailService from "../emailService.js";
import type * as medications from "../medications.js";
import type * as notifications from "../notifications.js";
import type * as patients from "../patients.js";
import type * as pharmacies from "../pharmacies.js";
import type * as prescriptions from "../prescriptions.js";
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
  doctorPatientConversations: typeof doctorPatientConversations;
  doctorPatients: typeof doctorPatients;
  doctors: typeof doctors;
  drugInteractions: typeof drugInteractions;
  emailAutomation: typeof emailAutomation;
  emailService: typeof emailService;
  medications: typeof medications;
  notifications: typeof notifications;
  patients: typeof patients;
  pharmacies: typeof pharmacies;
  prescriptions: typeof prescriptions;
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
