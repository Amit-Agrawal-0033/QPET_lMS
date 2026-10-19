const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  console.log("Testing MongoDB connection with custom DNS (8.8.8.8)...");
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log("MongoDB Atlas connected successfully! Ready state:", mongoose.connection.readyState);
    await mongoose.disconnect();
    console.log("Disconnected successfully.");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

testConnection();
