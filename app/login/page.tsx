import { login } from "@/lib/auth-actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next || "/";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-block h-8 w-8 rounded bg-emerald-600 mb-2" />
          <h1 className="text-xl font-semibold text-slate-900">Sanpolo CRM</h1>
        </div>
        <form
          action={login}
          className="bg-white border border-slate-200 rounded-lg p-6 space-y-4"
        >
          <input type="hidden" name="next" value={next} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              autoFocus
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          {sp.error && (
            <p className="text-sm text-red-600">Wrong password. Try again.</p>
          )}
          <button
            type="submit"
            className="w-full rounded-md bg-emerald-600 text-white text-sm font-medium px-4 py-2 hover:bg-emerald-700"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
