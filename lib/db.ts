import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import prospects from "@/data/prospects.json";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "crm.db");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

declare global {
  var __sanpoloDb: Database.Database | undefined;
}

function createConnection() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
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

    CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
    CREATE INDEX IF NOT EXISTS idx_interactions_company ON interactions(company_id);
    CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
  `);

  const count = (
    db.prepare("SELECT COUNT(*) as n FROM companies").get() as { n: number }
  ).n;

  if (count === 0) {
    const insert = db.prepare(`
      INSERT INTO companies
        (name, sector_group, what_they_do, why_fit, fit_type, priority, hq_presence, status)
      VALUES (@name, @sectorGroup, @whatTheyDo, @whyFit, @fitType, @priority, @hqPresence, 'new')
    `);
    const insertMany = db.transaction((rows: typeof prospects) => {
      for (const row of rows) insert.run(row);
    });
    insertMany(prospects);
  }

  return db;
}

export const db = globalThis.__sanpoloDb ?? createConnection();

if (process.env.NODE_ENV !== "production") {
  globalThis.__sanpoloDb = db;
}
