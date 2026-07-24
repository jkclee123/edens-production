"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";

const MAILTRAP_API_URL = "https://send.api.mailtrap.io/api/send";

export const sendTodoReminder = internalAction({
  args: {
    to: v.string(),
    todoNames: v.array(v.string()),
  },
  handler: async (_ctx, args) => {
    const token = process.env.MAILTRAP_TOKEN;
    if (!token) {
      console.error("MAILTRAP_TOKEN is not set");
      return { success: false, reason: "missing_token" };
    }

    const namesCsv = args.todoNames.join(", ");
    const subject = `任務提醒：${namesCsv}`;
    const link = "https://edens-production.vercel.app/todo";

    const textBody = [
      `今日要 ${namesCsv}`,
      ``,
      link,
      ``,
    ].join("\n");

    const htmlBody = [
      `<p>今日要 ${escapeHtml(namesCsv)}</p>`,
      `<p><a href="${link}">${link}</a></p>`,
    ].join("\n");

    const res = await fetch(MAILTRAP_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: { email: "todo@edens-core.com", name: "醫癲行動組🔥" },
        to: [{ email: args.to }],
        subject,
        text: textBody,
        html: htmlBody,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(
        `Mailtrap send failed (${res.status}) for ${args.to}: ${detail}`
      );
      return { success: false, reason: "api_error", status: res.status };
    }

    return { success: true };
  },
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
