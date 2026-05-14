import { MongoClient } from "mongodb";

// Function to generate realistic Indian mobile numbers
function generateMobile() {
  const startDigits = ["9", "8", "7"]; // valid starting digits
  const firstDigit = startDigits[Math.floor(Math.random() * startDigits.length)];
  const rest = Math.floor(100000000 + Math.random() * 900000000).toString(); // ensures 9 digits
  return firstDigit + rest; // total 10 digits
}

async function run() {
  const uri = "mongodb://localhost:27017"; // change if using Atlas
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("mechanics"); // your DB name
    const collection = db.collection("quick_resq"); // your collection name

    // Fetch 100 documents
    const docs = await collection.find().limit(100).toArray();

    // Update each with a random mobile number
    for (const doc of docs) {
      await collection.updateOne(
        { _id: doc._id },
        { $set: { mobile: generateMobile() } }
      );
    }

    console.log("Updated 100 documents with random mobile numbers");
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();