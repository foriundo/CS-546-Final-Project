import bcrypt from "bcryptjs";
import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import { centers, users } from "../config/mongoCollections.js";

// NYC Open Data - Citywide Public Computer Centers
const NYC_OPEN_DATA_URL =
  "https://data.cityofnewyork.us/resource/sejx-2gn3.json?$limit=500";

const seed = async () => {
  try {
    const db = await dbConnection();

    // Drop existing collection
    await db.dropCollection("centers").catch(() => {});
    console.log("Dropped existing centers collection.");

    await db.dropCollection("users").catch(() => {});
    console.log("Dropped existing users collection.");

    await db.dropCollection("reviews").catch(() => {});
    console.log("Dropped existing reviews collection.");

    await db.dropCollection("reports").catch(() => {});
    console.log("Dropped existing reports collection.");

    // Fetch from NYC Open Data
    const response = await fetch(NYC_OPEN_DATA_URL);
    if (!response.ok) throw new Error("Failed to fetch NYC Open Data.");
    const data = await response.json();
    console.log(`Fetched ${data.length} records from NYC Open Data.`);

    // Insert into MongoDB
    const centerCollection = await centers();
    await centerCollection.insertMany(data);
    console.log(`Seeded ${data.length} centers into the database.`);
  
    const userCollection = await users();
    const hashedPassword = await bcrypt.hash("Password123", 12);

    await userCollection.insertMany([
      {
        name: "Admin User",
        email: "admin@test.com",
        hashedPassword,
        role: "admin",
        favorites: [],
        createdAt: new Date()
      },
      {
        name: "Regular User",
        email: "user@test.com",
        hashedPassword,
        role: "user",
        favorites: [],
        createdAt: new Date()
      }
    ]);

    console.log("Seeded test users.");
  } catch (e) {
    console.error("Seed failed:", e.message);
  } finally {
    await closeConnection();
  }
  
};

seed();
