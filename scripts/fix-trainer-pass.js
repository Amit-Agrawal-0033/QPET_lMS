import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function checkTrainer() {
  await mongoose.connect(process.env.MONGODB_URI);
  const u = await mongoose.connection.db.collection("users").findOne({ identifier: "roshni.bajpai@qpet.in" });
  if (!u) {
    console.log("Trainer roshni.bajpai@qpet.in not found!");
    process.exit(1);
  }

  const match = await bcrypt.compare("123456", u.passwordHash);
  console.log("Password 123456 match:", match);

  if (!match) {
    const hash = await bcrypt.hash("123456", 10);
    await mongoose.connection.db.collection("users").updateOne(
      { _id: u._id },
      { $set: { passwordHash: hash } }
    );
    console.log("Successfully ensured password is set to 123456 for roshni.bajpai@qpet.in");
  }

  await mongoose.disconnect();
}

checkTrainer().catch(console.error);
