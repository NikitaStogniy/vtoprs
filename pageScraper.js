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
      await page.waitForSelector(".js-promo-sticky-container");
      // Get the link to all the required books
      const divCount = await page.$$eval(
        "div[class^='iva-item-root-']",
        (divs) => divs.length
      );
      console.log(divCount);
      let data = [];
      const divs = await page.$$(
        "div[data-marker='catalog-serp'] div[class^='iva-item-root-']"
      );
      for (let div of divs) {
        let dataObj = {};
        dataObj["price"] = await div.$eval(
          "strong.styles-module-root-LIAav > span",
          (node) => node.textContent.replace(/\D/g, "")
        );
        dataObj["id"] = await div.evaluate((node) =>
          node.getAttribute("data-item-id")
        );
        await page.hover("div[class^='iva-item-root-']");
        console.log("hover");
        let button = await div.$('button[type="button"]');
        if (button) {
          console.log("click");
          await button.click();
          // Ожидание загрузки изображения после клика
          try {
            // Ожидание загрузки изображения после клика
            await page.waitForSelector('img[data-marker="phone-image"]', {
              timeout: 30000,
            });
            dataObj["phoneImage"] = await parseImg(
              await page.$eval(
                'img[data-marker="phone-image"]',
                (img) => img.src
              )
            );
          } catch (error) {
            console.log("Не удалось загрузить изображение: ", error);
            dataObj["phoneImage"] = "Not found";
          }
        } else {
          dataObj["phoneImage"] = "Not found";
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
