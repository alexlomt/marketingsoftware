// models/migrations/001_initial.js
exports.up = async (db) => {
  // Create organizations table
  await db.query(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      industry TEXT,         -- Optional, based on your model needs
      website TEXT,          -- Optional
      phone TEXT,            -- Optional
      address TEXT,          -- Optional
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), -- Add default
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()  -- Add default
    );
  `);
  console.log('Created organizations table (if not exists)');

  // Create users table
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE, -- Add UNIQUE constraint
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      organization_id TEXT NOT NULL REFERENCES organizations(id), -- Add foreign key
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), -- Add default
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()  -- Add default
    );
  `);
  console.log('Created users table (if not exists)');

  // Create forms table
  await db.query(`
    CREATE TABLE IF NOT EXISTS forms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      fields TEXT NOT NULL, -- Consider JSON/JSONB type if your DB supports it
      settings TEXT,       -- Consider JSON/JSONB
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), -- Add default
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), -- Add default
      organization_id TEXT NOT NULL REFERENCES organizations(id), -- Add foreign key
      status TEXT NOT NULL DEFAULT 'active', -- Add default
      form_type TEXT NOT NULL,
      is_public BOOLEAN NOT NULL DEFAULT FALSE
      -- Removed user_id, assuming forms belong to organization now
    );
  `);
  console.log('Created forms table (if not exists)');

  // Create form submissions table
  await db.query(`
    CREATE TABLE IF NOT EXISTS form_submissions (
      id TEXT PRIMARY KEY,
      form_id TEXT NOT NULL REFERENCES forms(id), -- Add foreign key
      data TEXT NOT NULL,       -- Consider JSON/JSONB
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), -- Add default
      ip_address TEXT,
      status TEXT NOT NULL DEFAULT 'pending' -- Add default
    );
  `);
  console.log('Created form_submissions table (if not exists)');
};

exports.down = async (db) => {
  // Drop in reverse order of creation due to foreign keys
  await db.query('DROP TABLE IF EXISTS form_submissions');
  await db.query('DROP TABLE IF EXISTS forms');
  await db.query('DROP TABLE IF EXISTS users');
  await db.query('DROP TABLE IF EXISTS organizations');
  console.log('Dropped tables');
};
