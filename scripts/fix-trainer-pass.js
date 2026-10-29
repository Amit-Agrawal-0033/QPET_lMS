import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function fixTrainer() {
  await mongoose.connect(process.env.MONGODB_URI);
  const hash = await bcrypt.hash("123456", 10);
  const res = await mongoose.connection.collection("users").updateOne(
    { identifier: "roshni.bajpai@qpet.in" },
    { $set: { passwordHash: hash } }
  );
  console.log("Updated trainer passwordHash. Modified count:", res.modifiedCount);

  const u = await mongoose.connection.collection("users").findOne({ identifier: "roshni.bajpai@qpet.in" });
  const check = await bcrypt.compare("123456", u.passwordHash);
  console.log("Confirmed bcrypt check with 123456:", check);

  await mongoose.disconnect();
}

fixTrainer().catch(console.error);
