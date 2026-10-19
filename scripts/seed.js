const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {}

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

const coursesData = [
  {
    code: "CF-101",
    title: "Computer Fundamentals",
    description: "Introduction to computers, hardware, operating systems, and basic digital literacy.",
    durationMonths: 1,
    durationText: "1 Month",
    defaultFee: 1200,
    isActive: true,
  },
  {
    code: "BCC-102",
    title: "Basic Computer Course (BCC)",
    description: "Fundamental computer skills covering OS, basic word processing, spreadsheet basics, and internet browsing.",
    durationMonths: 2,
    durationText: "2 Months",
    defaultFee: 2000,
    isActive: true,
  },
  {
    code: "CCC-103",
    title: "Course on Computer Concepts (CCC)",
    description: "Standard computer literacy course covering digital concepts, office suites, digital financial tools, and cybersecurity.",
    durationMonths: 3,
    durationText: "3 Months",
    defaultFee: 3000,
    isActive: true,
  },
  {
    code: "CA-104",
    title: "Computer Applications",
    description: "Comprehensive practical training in desktop publishing, office automation, database concepts, and system administration.",
    durationMonths: 6,
    durationText: "6 Months",
    defaultFee: 5500,
    isActive: true,
  },
  {
    code: "MSO-105",
    title: "MS Office (Word, Excel, PowerPoint)",
    description: "In-depth productivity training with Microsoft Word documentation, Excel calculation sheets, and PowerPoint presentations.",
    durationMonths: 2,
    durationText: "2 Months",
    defaultFee: 2500,
    isActive: true,
  },
  {
    code: "AEX-106",
    title: "Advanced Excel",
    description: "Advanced data analysis, pivot tables, VLOOKUP/XLOOKUP, nested formulas, charts, conditional formatting, and dashboard creation.",
    durationMonths: 2,
    durationText: "2 Months",
    defaultFee: 3000,
    isActive: true,
  },
  {
    code: "INE-107",
    title: "Internet & Email",
    description: "Effective web browsing, email management, Google Workspace, cloud storage, online safety, and digital communication.",
    durationMonths: 1,
    durationText: "1 Month",
    defaultFee: 1000,
    isActive: true,
  },
  {
    code: "HET-108",
    title: "Hindi & English Typing",
    description: "Speed typing course in Hindi (Remington/Inscript) and English with touch typing techniques, accuracy testing, and speed enhancement.",
    durationMonths: 3,
    durationText: "3 Months",
    defaultFee: 2400,
    isActive: true,
  },
  {
    code: "DEO-109",
    title: "Data Entry Operator (DEO)",
    description: "Professional data entry, spreadsheet management, speed typing, office clerical documentation, and data verification.",
    durationMonths: 3,
    durationText: "3 Months",
    defaultFee: 3500,
    isActive: true,
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not set in .env.local");
    process.exit(1);
  }

  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected to MongoDB!");

  const db = mongoose.connection.db;

  // 1. Seed Courses
  const Course = mongoose.models.Course || mongoose.model("Course", new mongoose.Schema({}, { strict: false }));
  console.log("Seeding initial 9 Basic Computer Courses...");

  for (const c of coursesData) {
    await Course.findOneAndUpdate(
      { code: c.code },
      { $set: c },
      { upsert: true, new: true }
    );
    console.log(`✓ Course verified/seeded: ${c.title} (${c.code})`);
  }

  // 2. Seed Default Admin User
  const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({}, { strict: false }));
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@qpet.org";
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "Admin@QPET2026";

  const existingAdmin = await User.findOne({
    $or: [{ identifier: adminEmail }, { email: adminEmail }, { role: "admin" }]
  });

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  if (!existingAdmin) {
    await User.create({
      identifier: adminEmail,
      email: adminEmail,
      passwordHash,
      role: "admin",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`✓ Default Admin account created: ${adminEmail} (password: ${adminPassword})`);
  } else {
    // Ensure admin credentials are up to date
    await User.updateOne(
      { _id: existingAdmin._id },
      {
        $set: {
          identifier: adminEmail,
          email: adminEmail,
          passwordHash,
          role: "admin",
          status: "active",
          updatedAt: new Date(),
        }
      }
    );
    console.log(`✓ Default Admin account updated: ${adminEmail} (password: ${adminPassword})`);
  }

  console.log("\nDatabase seeding completed successfully!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
