const { Client } = require("pg");

const client = new Client({
  connectionString:
    "postgres://postgres:G5bCf1dgcF2eD*G3bCg2BFEabaeed2Fe@monorail.proxy.rlwy.net:57779/railway",
});

const connectDB = async () => {
  try {
    await client.connect();
    console.log("Connected to database");
  } catch (err) {
    console.error("Failed to connect to database", err);
    process.exit(1);
  }
};

connectDB();

module.exports = client;
