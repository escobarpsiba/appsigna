const { Client } = require('pg');

const PROJECT_REF = 'agoungdzmcrrnzhvnpmr';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const connectionString = `postgresql://postgres.${PROJECT_REF}:${SERVICE_ROLE_KEY}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`;

async function runMigration() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Conectado ao banco! Executando migration...');

    await client.query(`
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS recurrence_group_id UUID DEFAULT NULL;
    `);
    console.log('✓ Coluna recurrence_group_id adicionada');

    await client.query(`
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
    `);
    console.log('✓ Coluna is_recurring adicionada');

    console.log('\n✅ Migration concluída com sucesso!');
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

runMigration();
