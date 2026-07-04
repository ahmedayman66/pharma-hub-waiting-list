// backend/delete-fake.js
require("dotenv").config();
const mongoose = require("mongoose");
const Signup = require("./models/Signup");

const FAKE_EMAIL = "fake@pharmacareerhub.com";

async function deleteFakeUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const fakeCount = await Signup.countDocuments({ email: FAKE_EMAIL });

    if (fakeCount === 0) {
      console.log("ℹ️ No fake users found to delete.");
      process.exit(0);
    }

    console.log(`🗑️ Deleting ${fakeCount} fake users...`);
    const result = await Signup.deleteMany({ email: FAKE_EMAIL });

    console.log(`✅ Deleted ${result.deletedCount} fake users`);
    console.log(`📊 Remaining users: ${await Signup.countDocuments()}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Delete failed:", err);
    process.exit(1);
  }
}

deleteFakeUsers();
