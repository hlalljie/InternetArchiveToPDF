const axios = require("axios");
const fs = require("fs");
const { PDFDocument } = require("pdf-lib");
const sharp = require("sharp");

const downloadImage = async (url) => {
  const response = await axios({
    url,
    responseType: "arraybuffer",
  });
  return response.data;
};

const createPdf = async (images) => {
  const pdfDoc = await PDFDocument.create();
  for (let imgData of images) {
    const image = await sharp(imgData).jpeg().toBuffer();
    const img = await pdfDoc.embedJpg(image);
    const page = pdfDoc.addPage([img.width, img.height]);
    page.drawImage(img, {
      x: 0,
      y: 0,
      width: img.width,
      height: img.height,
    });
  }
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync("The_4-Hour_Work_Week.pdf", pdfBytes);
  console.log("PDF saved as The_4-Hour_Work_Week.pdf");
};

const downloadAndCreatePdf = async (
  startPage,
  maxConsecutiveFailures,
  baseUrl
) => {
  const images = [];
  let consecutiveFailures = 0;
  let page = startPage;

  while (consecutiveFailures < maxConsecutiveFailures) {
    const pageStr = String(page).padStart(4, "0");
    const url = `${baseUrl}${pageStr}.jp2&id=the-4-hour-work-week-by-timothy-ferriss&scale=4&rotate=0`;
    console.log(`Downloading from: ${url}`);

    try {
      const imgData = await downloadImage(url);
      images.push(imgData);
      consecutiveFailures = 0; // Reset on successful download
    } catch (error) {
      console.log(`Failed to download page ${page}`);
      consecutiveFailures += 1;
    }

    page += 1;
  }

  if (images.length > 0) {
    await createPdf(images);
  } else {
    console.log("No images were downloaded.");
  }
};

// URL details
const baseUrl =
  "https://ia903406.us.archive.org/BookReader/BookReaderImages.php?zip=/28/items/the-4-hour-work-week-by-timothy-ferriss/The%204-Hour%20Work%20Week%20by%20Timothy%20Ferriss_jp2.zip&file=The%204-Hour%20Work%20Week%20by%20Timothy%20Ferriss_jp2/The%204-Hour%20Work%20Week%20by%20Timothy%20Ferriss_";

// Example usage with assumed page range starting from 0
const startPage = 0;
const maxConsecutiveFailures = 10; // Stop after 10 consecutive failures

downloadAndCreatePdf(startPage, maxConsecutiveFailures, baseUrl);
