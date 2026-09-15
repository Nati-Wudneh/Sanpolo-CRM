import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import prospects from "@/data/prospects.json";
import proformaFollowUps from "@/data/proforma_followups.json";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "crm.db");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

declare global {
  var __sanpoloDb: Database.Database | undefined;
}

function createConnection() {
  const db = new Database(DB_PATH, { timeout: 20000 });
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Multiple processes (e.g. Next.js's parallel build workers) can open this
  // module at the same time against a brand-new, empty database file. Wrapping
  // the whole migration + seed sequence in one IMMEDIATE transaction makes it
  // atomic and grabs the write lock up front, so concurrent processes queue
  // up (retrying via `timeout` above) instead of racing each other partway
  // through and hitting SQLITE_BUSY.
  const migrateAndSeed = db.transaction(() => {
    runMigrations(db);
    seedOutbound(db);
    reclassifyExistingRows(db);
    seedProformaFollowUps(db);
  });
  migrateAndSeed.immediate();

  return db;
}

function runMigrations(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'outbound',
      sector_group TEXT,
      what_they_do TEXT,
      why_fit TEXT,
      fit_type TEXT,
      priority TEXT,
      hq_presence TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      next_step TEXT,
      next_follow_up_date TEXT,
      website TEXT,
      general_phone TEXT,
      general_email TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      title TEXT,
      department TEXT,
      phone TEXT,
      email TEXT,
      is_primary INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
      type TEXT NOT NULL DEFAULT 'call',
      outcome TEXT,
      summary TEXT,
      occurred_at TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
    CREATE INDEX IF NOT EXISTS idx_interactions_company ON interactions(company_id);
    CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
    CREATE INDEX IF NOT EXISTS idx_companies_source ON companies(source);
  `);

  const companyColumns = (
    db.prepare("PRAGMA table_info(companies)").all() as { name: string }[]
  ).map((c) => c.name);
  if (!companyColumns.includes("source")) {
    db.exec(
      "ALTER TABLE companies ADD COLUMN source TEXT NOT NULL DEFAULT 'outbound'",
    );
  }
}

function seedOutbound(db: Database.Database) {
  const count = (
    db.prepare("SELECT COUNT(*) as n FROM companies").get() as { n: number }
  ).n;
  if (count !== 0) return;

  const insert = db.prepare(`
    INSERT INTO companies
      (name, source, sector_group, what_they_do, why_fit, fit_type, priority, hq_presence, status)
    VALUES (@name, 'outbound', @sectorGroup, @whatTheyDo, @whyFit, @fitType, @priority, @hqPresence, 'new')
  `);
  for (const row of prospects) insert.run(row);
}

// Two names on the proforma follow-up list turned out to already be on the
// outbound research list (Gift Real Estate, Gadaa Bank) — since they've
// since asked for a proforma, reclassify those existing rows instead of
// creating duplicates. Guarded on source = 'outbound' so this only fires once.
function reclassifyExistingRows(db: Database.Database) {
  const reclassify = db.prepare(`
    UPDATE companies SET
      source = 'proforma_followup',
      notes = CASE
        WHEN notes IS NULL OR notes = '' THEN @note
        ELSE notes || char(10) || char(10) || @note
      END,
      updated_at = datetime('now')
    WHERE name = @name AND source = 'outbound'
  `);
  reclassify.run({
    name: "Gift Real Estate",
    note: "Moved from Outbound Prospects to Proforma Follow-Ups — already on the outbound research list under this name, but has since asked for a proforma.",
  });
  reclassify.run({
    name: "Gadaa Bank",
    note: 'Moved from Outbound Prospects to Proforma Follow-Ups — already on the outbound research list (given as "Gadda bank"), but has since asked for a proforma.',
  });
}

function seedProformaFollowUps(db: Database.Database) {
  const insertProforma = db.prepare(`
    INSERT INTO companies
      (name, source, sector_group, hq_presence, website, notes, status)
    VALUES (@name, 'proforma_followup', @sectorGroup, @hqPresence, @website, @notes, 'new')
  `);
  const findByName = db.prepare(
    "SELECT id FROM companies WHERE lower(name) = lower(?)",
  );
  for (const row of proformaFollowUps) {
    if (!findByName.get(row.name)) {
      insertProforma.run({
        name: row.name,
        sectorGroup: row.sectorGroup ?? null,
        hqPresence: row.hqPresence ?? null,
        website: (row as { website?: string }).website ?? null,
        notes: row.notes ?? null,
      });
    }
  }
}

export const db = globalThis.__sanpoloDb ?? createConnection();

if (process.env.NODE_ENV !== "production") {
  globalThis.__sanpoloDb = db;
}
