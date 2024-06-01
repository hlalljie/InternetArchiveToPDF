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

const createPdf = async (images, filename) => {
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
  fs.writeFileSync(`${filename}.pdf`, pdfBytes);
  console.log(`PDF saved as ${filename}.pdf`);
};

const downloadAndCreatePdf = async (
  startPage,
  endPage,
  maxConsecutiveFailures,
  baseUrlPrefix,
  urlSuffix,
  filename
) => {
  const images = [];
  let consecutiveFailures = 0;
  let page = startPage;

  while (
    consecutiveFailures < maxConsecutiveFailures &&
    (endPage === -1 || page <= endPage)
  ) {
    const pageStr = String(page).padStart(4, "0");
    const url = `${baseUrlPrefix}${pageStr}${urlSuffix}`;
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
    await createPdf(images, filename);
  } else {
    console.log("No images were downloaded.");
  }
};

// Parameters
const startPage = 0;
const endPage = 10; // Set to -1 to download all pages until consecutive failures occur
const maxConsecutiveFailures = 10; // Stop after 10 consecutive failures
// const baseUrlPrefix =
//   "https://ia903406.us.archive.org/BookReader/BookReaderImages.php?zip=/28/items/the-4-hour-work-week-by-timothy-ferriss/The%204-Hour%20Work%20Week%20by%20Timothy%20Ferriss_jp2.zip&file=The%204-Hour%20Work%20Week%20by%20Timothy%20Ferriss_jp2/The%204-Hour%20Work%20Week%20by%20Timothy%20Ferriss_";
// const urlSuffix =
//   ".jp2&id=the-4-hour-work-week-by-timothy-ferriss&scale=4&rotate=0";
const baseUrlPrefix =
  "https://ia902905.us.archive.org/BookReader/BookReaderImages.php?zip=/12/items/zenandtheartofmotorcyclemaintenancerobertpirsigm._833_V/Zen%20and%20the%20Art%20of%20Motorcycle%20Maintenance%20Robert%20Pirsig%20M._jp2.zip&file=Zen%20and%20the%20Art%20of%20Motorcycle%20Maintenance%20Robert%20Pirsig%20M._jp2/Zen%20and%20the%20Art%20of%20Motorcycle%20Maintenance%20Robert%20Pirsig%20M._";
const urlSuffix =
  ".jp2&id=zenandtheartofmotorcyclemaintenancerobertpirsigm._833_V&scale=4&rotate=0";
const filename = "Ten_Page_Test";

// Run the function
downloadAndCreatePdf(
  startPage,
  endPage,
  maxConsecutiveFailures,
  baseUrlPrefix,
  urlSuffix,
  filename
);
