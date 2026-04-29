import { Client } from 'pg';
import 'dotenv/config';
const client = new Client({ connectionString: process.env.DATABASE_URL });

client.connect()
  .then(() => {
    console.log("✅ Συνδέθηκε επιτυχώς!");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Σφάλμα σύνδεσης:", err.stack);
    process.exit(1);
  });