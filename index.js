const express = require("express");
const app = express();
const browserObject = require("./browser");
const avscraperController = require("./avito/pageController.js");
const cianscraperController = require("./cian/pageController.js");
const dataStore = {};
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

const client = require("./db.js");
app.use(express.json());

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Создаем дочерние процессы
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  app.post("/parse", async (req, res) => {
    const url = req.body.url;
    const reqName = req.body.name;
    const name = url.includes("avito")
      ? "avito"
      : url.includes("cian")
      ? "cian"
      : reqName;
    if (name != "avito" && name != "cian") {
      return res.status(404).send("Wrong name");
    }
    const result = await client.query(
      "INSERT INTO requests(url, name, source) VALUES($1, $2, $3) RETURNING id",
      [url, reqName, name]
    );
    const id = result.rows[0].id;
    res.status(200).json({ id });
    let browserInstance = browserObject.startBrowser();
    if (name == "avito") {
      await avscraperController(browserInstance, url, id);
    } else {
      await cianscraperController(browserInstance, url, id);
    }
  });

  app.get("/data/:id", async (req, res) => {
    const data = req.params;
    if (data) {
      const result = await client.query(
        "SELECT * FROM flats WHERE reqID = $1",
        [data.id]
      );
      res.status(200).json(result.rows);
    } else {
      res.status(404).send("Data not found");
    }
  });

  const server = app.listen(3000, () =>
    console.log(`Worker ${process.pid} running on port 3000`)
  );

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.log(
        `Port 3000 is already in use. Please close the process using this port and try again.`
      );
    } else {
      console.log(`An error occurred: ${error.message}`);
    }
  });
}

module.exports = client;
