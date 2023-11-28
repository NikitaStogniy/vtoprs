const parseImg = require("./parseImg");

const scraperObject = {
  async scraper(browser, url, limit) {
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
        "div[data-marker='catalog-serp'] div[class^='iva-item-root-']",
        (divs) => divs.length
      );

      await page.evaluate(() => {
        window.scrollBy(0, 300);
      });
      let rate = await page.$$(
        'form[class="uxs-2w2XclsRLI uxs-scx40f uxs-2Ql_Y1udt8"] > div > div.uxs-QFD9X9QAio.uxs-8a4j0g > button'
      );
      for (let button of rate) {
        await button.click();
      }

      let data = [];
      // if (limit > 0 && divCount < limit) {
      //   let moreButton = await page.$(
      //     "a[data-marker='pagination-button/nextPage']"
      //   );
      //   if (moreButton) {
      //     await moreButton.click();
      //   }
      // }
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
        await page.hover(`div[data-item-id='${dataObj["id"]}']`);
        let button = await div.$('button[type="button"]');
        if (button) {
          await button.click();
          // Ожидание загрузки изображения после клика
          try {
            // Ожидание загрузки изображения после клика
            await div.waitForSelector('img[data-marker="phone-image"]', {
              timeout: 30000,
            });
            dataObj["phoneImage"] = await parseImg(
              await div.$eval(
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
        if (data.length >= limit) {
          break;
        }
      }
      scrapedData = data;
      await page.close();
      return scrapedData;
    }
    let data = await scrapeCurrentPage();
    return data;
  },
};

module.exports = scraperObject;
