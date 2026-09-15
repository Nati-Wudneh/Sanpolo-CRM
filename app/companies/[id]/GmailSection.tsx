import Link from "next/link";
import { isGmailConnected } from "@/lib/google";
import { listMessagesForAddress } from "@/lib/gmail";
import { Contact } from "@/lib/types";
import { EmailComposer } from "./EmailComposer";

export async function GmailSection({
  companyId,
  contacts,
}: {
  companyId: number;
  contacts: Contact[];
}) {
  const contactsWithEmail = contacts.filter((c) => !!c.email);

  if (!isGmailConnected()) {
    return (
      <section className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="font-semibold text-slate-900 mb-2">Email</h2>
        <p className="text-sm text-slate-500">
          Connect Gmail in{" "}
          <Link href="/settings" className="text-emerald-700 hover:underline">
            Settings
          </Link>{" "}
          to see email history with contacts and send emails from here.
        </p>
      </section>
    );
  }

  if (contactsWithEmail.length === 0) {
    return (
      <section className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="font-semibold text-slate-900 mb-2">Email</h2>
        <p className="text-sm text-slate-500">
          Add a contact with an email address to see history and send email.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-5">
      <h2 className="font-semibold text-slate-900 mb-4">Email</h2>
      <div className="space-y-5">
        {await Promise.all(
          contactsWithEmail.map(async (contact) => {
            const messages = await listMessagesForAddress(contact.email!);
            return (
              <div key={contact.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-800">
                    {contact.name}{" "}
                    <span className="font-normal text-slate-400">
                      {contact.email}
                    </span>
                  </div>
                  <EmailComposer
                    companyId={companyId}
                    contactId={contact.id}
                    to={contact.email!}
                  />
                </div>
                {messages === null ? (
                  <p className="text-xs text-red-600">
                    Couldn&apos;t reach Gmail — try reconnecting in Settings.
                  </p>
                ) : messages.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No email history with this address yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100 border border-slate-100 rounded-md">
                    {messages.map((m) => (
                      <li key={m.id} className="px-3 py-2">
                        <a
                          href={m.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-slate-800 hover:text-emerald-700 font-medium"
                        >
                          {m.subject}
                        </a>
                        <div className="text-xs text-slate-400 truncate">
                          {m.snippet}
                        </div>
                        <div className="text-xs text-slate-400">{m.date}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          }),
        )}
      </div>
    </section>
  );
}
