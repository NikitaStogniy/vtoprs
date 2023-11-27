const pageScraper = require("./pageScraper.js");
const client = require("../db.js");

async function scrapeAll(browserInstance, url, id, limit) {
  console.log("controller", limit);
  let browser;
  try {
    browser = await browserInstance;
    let scrapedData = {};
    scrapedData = await pageScraper.scraper(browser, url, limit);
    await browser.close();

    const values = scrapedData
      .map((flat) => `(${flat.id}, ${flat.price}, '${flat.phoneImage}', ${id})`)
      .join(", ");
    await client.query(
      `INSERT INTO flats(flatid, price, phone, reqid) VALUES ${values}`
    );
  } catch (err) {
    console.log("Could not resolve the browser instance => ", err);
  }
}

module.exports = (browserInstance, url, id, limit) =>
  scrapeAll(browserInstance, url, id, limit);
