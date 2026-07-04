// backend/add-fake.js
// ملف واحد فقط - أضف 322 مستخدم وهمي بنفس الاسم والإيميل
// طريقة التشغيل: node add-fake.js

require("dotenv").config();
const mongoose = require("mongoose");
const Signup = require("./models/Signup");

const FAKE_EMAIL = "fake@pharmacareerhub.com";
const FAKE_NAME = "Fake User";
const TARGET_FAKE_COUNT = 322;

async function addFakeUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // شوف كام مستخدم فيك موجود بالفعل
    const existingFake = await Signup.countDocuments({ email: FAKE_EMAIL });
    console.log(
      `📊 Existing fake users with email ${FAKE_EMAIL}: ${existingFake}`,
    );

    if (existingFake >= TARGET_FAKE_COUNT) {
      console.log(
        `✅ Already have ${existingFake} fake users. No need to add.`,
      );
      console.log(`📊 Total users in DB: ${await Signup.countDocuments()}`);
      process.exit(0);
    }

    // كم مستخدم محتاج نضيف؟
    const needed = TARGET_FAKE_COUNT - existingFake;
    console.log(`📝 Need to add ${needed} fake users...`);

    const fakeUsers = [];
    const prefixes = ["010", "011", "012", "015"]; // الأرقام المسموحة في RegEx

    for (let i = existingFake + 1; i <= TARGET_FAKE_COUNT; i++) {
      const randomPrefix =
        prefixes[Math.floor(Math.random() * prefixes.length)];
      // رقم مميز لكل مستخدم عشان الـ unique constraint
      const randomSuffix = String(i).padStart(8, "0").slice(0, 8);
      const uniqueWhatsapp = randomPrefix + randomSuffix;

      fakeUsers.push({
        name: FAKE_NAME,
        whatsapp: uniqueWhatsapp,
        email: FAKE_EMAIL,
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ),
      });
    }

    await Signup.insertMany(fakeUsers);

    const newFakeCount = await Signup.countDocuments({ email: FAKE_EMAIL });
    const totalCount = await Signup.countDocuments();

    console.log(`✅ Added ${fakeUsers.length} fake users successfully!`);
    console.log(`📊 Total fake users now: ${newFakeCount}`);
    console.log(`📊 Total users in DB (fake + real): ${totalCount}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to add fake users:", err);
    process.exit(1);
  }
}

addFakeUsers();
