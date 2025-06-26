import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Run profile completion reminders daily at 10 AM UTC
crons.daily(
  "profile-completion-reminders",
  { hourUTC: 10, minuteUTC: 0 },
  api.emailAutomation.scheduleProfileCompletionReminders
);

export default crons;
