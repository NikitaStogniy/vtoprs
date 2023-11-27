const parseImg = require("./parseImg");

const scraperObject = {
  async scraper(browser, url) {
    let page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    console.log(`Navigating to ${url}...`);
    // Navigate to the selected category
    await page.goto(url);
    let scrapedData = [];
    async function scrapeCurrentPage() {
      // Wait for the required DOM to be rendered
      await page.waitForSelector("aside[data-name='PreInfiniteBanner']");
      // Get the link to all the required books
      const divCount = await page.$$eval(
        "div[data-testid='offer-card']",
        (divs) => divs.length
      );
      console.log(divCount);
      let data = [];
      const divs = await page.$$("div[data-testid='offer-card']");
      for (let div of divs) {
        let dataObj = {};
        dataObj["price"] = await div.$eval(
          "span[data-mark='MainPrice']",
          (node) => node.textContent.replace(/\D/g, "")
        );
        dataObj["id"] = await div.$eval(
          "a._93444fe79c--media--9P6wN",
          (node) => node.getAttribute("href").match(/\d+/)[0]
        );
        let button = await div.$('button[data-mark="PhoneButton"]');
        console.log("click");
        await button.click();
        // Ожидание загрузки изображения после клика
        try {
          dataObj["phoneImage"] = await page.$eval(
            'span[data-mark="PhoneValue"]',
            (span) => span.textContent.replace(/\D/g, "")
          );
        } catch (error) {
          console.error(
            "Ошибка: Не удалось найти элемент, соответствующий селектору 'span[data-mark=\"PhoneValue\"]'"
          );
        }
        data.push(dataObj);
      }
      scrapedData = data;
      console.log(data);
      await page.close();
      return scrapedData;
    }
    let data = await scrapeCurrentPage();
    console.log(data);
    return data;
  },
};

module.exports = scraperObject;
