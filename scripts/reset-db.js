const { MongoClient } = require("mongodb");
const path = require("path");

// Native env file loading is handled by node --env-file in Node 22
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "portfolio";

async function reset() {
  if (!uri) {
    console.error("MONGODB_URI is not defined. Ensure you are running with --env-file=.env.local");
    process.exit(1);
  }

  console.log(`Connecting to MongoDB...`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    console.log(`Resetting database: ${dbName}`);
    
    const resultSite = await db.collection("site").deleteMany({});
    const resultAbout = await db.collection("about").deleteMany({});

    console.log(`Deleted ${resultSite.deletedCount} documents from 'site' collection.`);
    console.log(`Deleted ${resultAbout.deletedCount} documents from 'about' collection.`);
    
    console.log("Database reset successful.");
  } catch (error) {
    console.error("Error resetting database:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

reset();
