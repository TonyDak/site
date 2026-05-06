import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "portfolio";

async function reset() {
  if (!uri) {
    console.error("MONGODB_URI is not defined in .env.local");
    process.exit(1);
  }

  console.log(`Connecting to MongoDB: ${uri.split("@")[1]}`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    console.log(`Deleting documents from collections in database: ${dbName}`);
    
    // We only delete 'site' and 'about' to force re-initialization from new defaults
    const resultSite = await db.collection("site").deleteMany({});
    const resultAbout = await db.collection("about").deleteMany({});

    console.log(`Deleted ${resultSite.deletedCount} documents from 'site' collection.`);
    console.log(`Deleted ${resultAbout.deletedCount} documents from 'about' collection.`);
    
    console.log("Database reset successful. Restart the dev server to apply new defaults.");
  } catch (error) {
    console.error("Error resetting database:", error);
  } finally {
    await client.close();
  }
}

reset();
