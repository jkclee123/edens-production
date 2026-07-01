import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// 07:00 Hong Kong time (UTC+8, no DST) == 23:00 UTC the previous day.
crons.daily(
  "send todo reminders",
  { hourUTC: 23, minuteUTC: 0 },
  internal.todos.sendReminders
);

export default crons;