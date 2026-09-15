import {
  getConnectedGmailAddress,
  isGmailConnected,
  isGoogleConfigured,
} from "@/lib/google";
import { disconnectGmailAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  not_configured:
    "Gmail isn't set up yet — add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first (see below).",
  missing_code: "Google didn't return an authorization code. Please try connecting again.",
  access_denied: "Google sign-in was cancelled before it finished.",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const configured = isGoogleConfigured();
  const connected = isGmailConnected();
  const email = getConnectedGmailAddress();
  const errorMessage = sp.error ? ERROR_MESSAGES[sp.error] ?? sp.error : null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">
          Connect Gmail to see email history with your contacts and send emails
          straight from the CRM.
        </p>
      </div>

      {sp.connected && (
        <div className="rounded-md bg-emerald-50 text-emerald-800 text-sm px-4 py-3 ring-1 ring-emerald-200">
          Gmail connected{email ? ` as ${email}` : ""}.
        </div>
      )}
      {errorMessage && (
        <div className="rounded-md bg-red-50 text-red-700 text-sm px-4 py-3 ring-1 ring-red-200">
          {errorMessage}
        </div>
      )}

      <section className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="font-semibold text-slate-900 mb-1">Gmail</h2>

        {!configured ? (
          <div className="space-y-3 text-sm text-slate-600 mt-3">
            <p>Not set up yet. To connect Gmail:</p>
            <ol className="list-decimal list-inside space-y-1.5">
              <li>
                Go to{" "}
                <a
                  className="text-emerald-700 hover:underline"
                  href="https://console.cloud.google.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  console.cloud.google.com
                </a>{" "}
                and create a project (or pick an existing one).
              </li>
              <li>
                Under <strong>APIs &amp; Services → Library</strong>, enable the{" "}
                <strong>Gmail API</strong>.
              </li>
              <li>
                Under <strong>APIs &amp; Services → OAuth consent screen</strong>, choose{" "}
                <strong>External</strong>, fill in the required fields, and add your own
                Gmail address as a <strong>test user</strong>.
              </li>
              <li>
                Under <strong>APIs &amp; Services → Credentials</strong>, create an{" "}
                <strong>OAuth client ID</strong> of type <strong>Web application</strong>.
              </li>
              <li>
                Add this as an <strong>Authorized redirect URI</strong>:
                <code className="block bg-slate-100 rounded px-2 py-1 mt-1 text-xs break-all">
                  {"<your app's URL>"}/api/auth/google/callback
                </code>
              </li>
              <li>
                Copy the <strong>Client ID</strong> and <strong>Client secret</strong> into
                this app&apos;s environment as <code>GOOGLE_CLIENT_ID</code> and{" "}
                <code>GOOGLE_CLIENT_SECRET</code>, then restart the app.
              </li>
            </ol>
          </div>
        ) : connected ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-slate-600">
              Connected{email ? ` as ${email}` : ""}.
            </p>
            <form action={disconnectGmailAction}>
              <button
                type="submit"
                className="rounded-md border border-slate-300 text-sm px-3 py-1.5 text-slate-700 hover:bg-slate-50"
              >
                Disconnect
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-3">
            <a
              href="/api/auth/google"
              className="inline-block rounded-md bg-emerald-600 text-white text-sm px-4 py-2 font-medium hover:bg-emerald-700"
            >
              Connect Gmail
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
