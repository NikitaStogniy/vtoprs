const express = require("express");
const app = express();
const browserObject = require("./browser");
const scraperController = require("./pageController");
const dataStore = {};
const client = require("./db.js");
app.use(express.json());

app.post("/parse", async (req, res) => {
  const url = req.body.url;
  const reqName = req.body.name;
  const result = await client.query(
    "INSERT INTO requests(url, name) VALUES($1, $2) RETURNING id",
    [url, reqName]
  );
  const id = result.rows[0].id;
  res.json({ id });
  let browserInstance = browserObject.startBrowser();
  await scraperController(browserInstance, url, id);
});

app.get("/data/:id", async (req, res) => {
  const data = req.params; // Добавьте эту строку
  if (data) {
    const result = await client.query("SELECT * FROM flats WHERE reqID = $1", [
      data.id,
    ]);
    const flats = await result.rows;

    res.json(flats);
  } else {
    res.status(404).send("Data not found");
  }
});

app.listen(3000, () => console.log("Web server running on port 3000"));

module.exports = client;
