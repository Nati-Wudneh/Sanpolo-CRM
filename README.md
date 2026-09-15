# Sanpolo CRM

A lightweight CRM for tracking e-bike outreach to companies across Ethiopia. Pre-loaded
with 263 prospect companies (banks, NGOs, hospitals, conglomerates, delivery fleets, etc.)
researched for Sanpolo's e-bike sales pitch.

## What it does

- **Three separate lists**, each with its own page (`/outbound`, `/proformas`, `/inbound`),
  plus an "All" view (`/companies`) across everything:
  - **Outbound Prospects** — the 263 researched companies, cold-outreach from scratch.
  - **Proforma Follow-Ups** — companies/individuals who previously asked for a proforma.
  - **Inbound Leads** — people/companies who called or came in on their own.
  A company can be moved between lists at any time from its detail page ("List" field).
- Each list has sector, priority, fit type (NEW / SHIFT / FLEET), and pipeline status
  filters, plus search.
- **Pipeline view** (`/pipeline`) — every company as a kanban board by stage, filterable
  by list. Move a card forward right from its status dropdown.
- **Contacts directory** (`/contacts`) — every individual you've researched across every
  company, with its own "+ Add contact" flow (pick the company, fill in the person). You
  can also add contacts inline from a company's own page — there's no limit per company.
- **Company detail page** — for each company:
  - Log **contacts** you find (name, title, department, phone, email) — mark the one you
    should call (typically someone in purchasing / procurement / operations) as primary.
  - **Click-to-call logging**: clicking any contact's phone number dials it (`tel:` link)
    and instantly logs a call in the activity history, with a quick prompt to fill in the
    outcome and notes right after you hang up — so a call is registered even if you get
    pulled away before writing it up.
  - Log **calls and activity** (call, email, meeting, note) with an outcome, and optionally
    update the company's status and next follow-up date in the same step.
  - Track **status** through a pipeline: New → Researching → Contact Identified → Contacted
    → Follow-Up → Interested / Not Interested, plus Customer and On Hold.
  - A dedicated **Notes** panel per company for anything worth remembering — research
    notes, referral info, objections raised.
  - **Gmail**: once connected (see below), see real email history with each contact and
    send emails straight from the CRM — every send is logged to the activity history
    automatically.
  - Website, general phone/email, and which list the company belongs to.
- **Dashboard** — counts by list and by status, high-priority companies you haven't
  started yet, upcoming/overdue follow-ups, and a feed of recent call/email activity.

## Connecting Gmail

Go to **Settings** (`/settings`) in the app — it walks through creating a free Google
Cloud OAuth client (enable the Gmail API, add yourself as a test user, create a Web
application OAuth client, set the redirect URI it shows you) and where to put the
resulting Client ID/secret (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, see
`.env.example` — copy it to `.env.local` and restart the app). Once connected, every
company with a contact that has an email address gets a live email history panel and a
compose box.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On first run it seeds the database
automatically from `data/prospects.json`.

Data is stored locally in a SQLite file at `data/crm.db` (not committed to git).

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS + SQLite (`better-sqlite3`), using React
Server Components and Server Actions — no separate API layer, no external services.
