const { Client } = require("pg");

async function createDb() {
  // Connect to the default postgres database using the admin user
  const client = new Client({
    connectionString: "postgresql://admin@127.0.0.1:5432/postgres",
  });

  try {
    await client.connect();
    console.log("Connected to default postgres database.");
    
    await client.query('CREATE DATABASE padelbook');
    console.log("Database 'padelbook' created successfully!");
  } catch (error) {
    if (error.code === '42P04') {
      console.log("Database 'padelbook' already exists.");
    } else {
      console.error("Error creating database:", error);
    }
  } finally {
    await client.end();
  }
}

createDb();
