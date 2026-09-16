# Deploying Sanpolo CRM live

## The plan

This CRM stores its data in a SQLite file. To make that "save data properly"
once it's a live website, it needs to run as a single, always-on server with
a **persistent disk** attached (not a serverless platform like Vercel, whose
filesystem is wiped constantly and runs many copies at once — that would
lose or corrupt data). **Railway** is a good fit: one server, one attached
volume, simple to set up, no database migration needed.

Since a live website is reachable by anyone with the URL, the app now also
requires a **shared password** to view or edit anything — there was no login
before this, which was fine for local-only use but not for a public URL.

## Accounts you need to create

1. **Railway** — [railway.com](https://railway.com). Sign up with your
   GitHub account (the same one this repo, `Nati-Wudneh/Sanpolo-CRM`, lives
   on) so Railway can deploy straight from it. Railway is usage-based
   billing (no meaningful free tier for an always-on service with a volume)
   — expect roughly $5–10/month for an app this size. You'll need to add a
   payment method during setup.

That's the only new account required to get the site live. (Optional,
covered further down: a domain registrar if you want a custom domain, and
Google Cloud if you want the Gmail feature.)

## Information I need from you

1. **A password for the CRM.** Pick anything reasonably hard to guess — this
   is the one password that gates the entire site. Tell me what you want it
   to be, or tell me to generate one and I'll give it to you.
2. **Nothing else is required to launch.** Everything else below is you
   clicking through Railway's UI (I can't create accounts or enter billing
   details on your behalf), then giving me a shout if anything errors.

Optional, only if/when you want them:
- A **domain name** you own, if you want e.g. `crm.sanpolo.com` instead of
  the free `something.up.railway.app` address Railway gives you.
- **Google Cloud OAuth credentials**, if you want the Gmail sync/send
  feature — steps are already in the app's Settings page; this can be done
  any time after launch, it's not required to go live.

## Steps (in Railway's dashboard)

1. **New Project → Deploy from GitHub repo.** Authorize Railway to access
   your GitHub account if prompted, then pick `Nati-Wudneh/Sanpolo-CRM` and
   the `claude/company-contact-crm-s1lh1w` branch (or `main`, if you've
   merged this branch into it by then).
2. Railway will detect the `Dockerfile` in the repo and build from it
   automatically — no configuration needed for the build itself.
3. **Add a volume**: on the service, go to the **Volumes** tab → **New
   Volume**. Set the **mount path** to exactly `/data`.
4. **Set environment variables**: go to the **Variables** tab and add:
   - `APP_PASSWORD` = the password from above
   - `DB_DIR` = `/data`
   (Leave `PORT` alone — Railway sets it automatically and the app already
   reads it.)
5. **Deploy.** Railway will build and start the app. Once it's up, go to
   **Settings → Networking → Generate Domain** to get a public
   `*.up.railway.app` URL.
6. Open that URL, you'll land on the login screen — enter the password from
   step 4. You should see the same CRM you've been using, now live and
   backed by the persistent volume.

From then on, every `git push` to the branch Railway is watching
auto-deploys the new version, without touching your data (the database
lives on the volume, separate from the app code).

### Custom domain (optional)

In the same **Settings → Networking** area, choose **Custom Domain**,
enter your domain (e.g. `crm.sanpolo.com`), and Railway shows you a CNAME
record to add at your domain registrar (wherever you bought the domain —
Namecheap, GoDaddy, Google Domains, etc.). Add that record there; Railway
handles HTTPS automatically once it verifies.

## After launch

- **Changing the password later**: update `APP_PASSWORD` in Railway's
  Variables tab and redeploy (existing logged-in sessions stay valid for up
  to 180 days unless you also clear cookies / change it again).
- **Backups**: Railway volumes persist across deploys and restarts, but
  it's still one disk. If you want periodic backups of the data down the
  line, say so and I'll add an export feature — not built yet since it
  wasn't asked for.
- **Gmail**: connect it any time from the live site's Settings page — same
  steps as local, just make sure the redirect URI you register in Google
  Cloud matches your live URL (`https://<your-domain>/api/auth/google/callback`).

## If something goes wrong

Tell me what Railway's build/deploy logs say (copy-paste the error) and
I'll fix the code. Common things that are on me to fix, not you: a build
failure, a missing dependency, an env var the app should have defaulted
differently. Things that are on you: entering payment info, clicking the
buttons above, and choosing the password/domain.
