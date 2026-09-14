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
- **Company detail page** — for each company:
  - Log **contacts** you find (name, title, department, phone, email) — mark the one you
    should call (typically someone in purchasing / procurement / operations) as primary.
  - Log **calls and activity** (call, email, meeting, note) with an outcome, and optionally
    update the company's status and next follow-up date in the same step.
  - Track **status** through a pipeline: New → Researching → Contact Identified → Contacted
    → Follow-Up → Interested / Not Interested, plus Customer and On Hold.
  - Free-form notes, website, and general contact info per company.
- **Dashboard** — counts by status, high-priority companies you haven't started yet,
  upcoming/overdue follow-ups, and a feed of recent call activity.

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
