import { getValidAccessToken } from "@/lib/google";

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  link: string;
}

function header(headers: { name: string; value: string }[], name: string) {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

/** Fetches the most recent Gmail messages exchanged with the given address. Returns null if Gmail isn't connected. */
export async function listMessagesForAddress(
  email: string,
  limit = 8,
): Promise<GmailMessageSummary[] | null> {
  const accessToken = await getValidAccessToken();
  if (!accessToken) return null;

  const q = `(from:${email} OR to:${email})`;
  const listRes = await fetch(
    `${GMAIL_API}/messages?maxResults=${limit}&q=${encodeURIComponent(q)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!listRes.ok) return null;
  const list = (await listRes.json()) as { messages?: { id: string; threadId: string }[] };
  if (!list.messages?.length) return [];

  const messages = await Promise.all(
    list.messages.map(async (m) => {
      const res = await fetch(
        `${GMAIL_API}/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      if (!res.ok) return null;
      const data = (await res.json()) as {
        id: string;
        threadId: string;
        snippet: string;
        payload: { headers: { name: string; value: string }[] };
      };
      const headers = data.payload.headers;
      return {
        id: data.id,
        threadId: data.threadId,
        subject: header(headers, "Subject") || "(no subject)",
        from: header(headers, "From"),
        to: header(headers, "To"),
        date: header(headers, "Date"),
        snippet: data.snippet,
        link: `https://mail.google.com/mail/u/0/#all/${data.threadId}`,
      };
    }),
  );

  return messages
    .filter((m): m is GmailMessageSummary => m !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function toBase64Url(input: string) {
  return Buffer.from(input, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sendEmail({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    throw new Error("Gmail is not connected. Connect it from Settings first.");
  }

  const raw = toBase64Url(
    [
      `To: ${to}`,
      `Subject: ${subject}`,
      "Content-Type: text/plain; charset=\"UTF-8\"",
      "MIME-Version: 1.0",
      "",
      body,
    ].join("\r\n"),
  );

  const res = await fetch(`${GMAIL_API}/messages/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });
  if (!res.ok) {
    throw new Error(`Failed to send email: ${res.status} ${await res.text()}`);
  }
}
