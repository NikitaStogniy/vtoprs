const Tesseract = require("tesseract.js");

function parseImg(data) {
  return Tesseract.recognize(data, "eng", {
    logger: (m) => console.log(m),
  }).then(({ data: { text } }) => {
    return text;
  });
}

module.exports = parseImg;
