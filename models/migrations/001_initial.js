/**
 * Initial database migration
 */

exports.up = async (db) => {
  // Create forms table if it doesn't exist
  await db.query(`
    CREATE TABLE IF NOT EXISTS forms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      fields TEXT NOT NULL,
      settings TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL,
      form_type TEXT NOT NULL,
      is_public BOOLEAN NOT NULL DEFAULT FALSE
    )
  `);

  // Create form submissions table if it doesn't exist
  await db.query(`
    CREATE TABLE IF NOT EXISTS form_submissions (
      id TEXT PRIMARY KEY,
      form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
      data TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL,
      ip_address TEXT,
      status TEXT NOT NULL,
      CONSTRAINT fk_form FOREIGN KEY (form_id) REFERENCES forms(id)
    )
  `);

  console.log('Created forms and form_submissions tables');
};

exports.down = async (db) => {
  await db.query('DROP TABLE IF EXISTS form_submissions');
  await db.query('DROP TABLE IF EXISTS forms');
  console.log('Dropped forms and form_submissions tables');
};
