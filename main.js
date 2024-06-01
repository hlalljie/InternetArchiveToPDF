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

const splitUrl = (url) => {
  const regex = /(.*_)(\d{4})(.*)/;
  const match = url.match(regex);
  if (match) {
    return { prefix: match[1], suffix: match[3].replace(/&scale=\d+/, "") };
  } else {
    throw new Error("URL format is incorrect");
  }
};

const downloadAndCreatePdf = async (
  startPage,
  endPage,
  maxConsecutiveFailures,
  url,
  filename,
  scale
) => {
  const { prefix, suffix } = splitUrl(url);
  const images = [];
  let consecutiveFailures = 0;
  let page = startPage;

  while (
    consecutiveFailures < maxConsecutiveFailures &&
    (endPage === -1 || page <= endPage)
  ) {
    const pageStr = String(page).padStart(4, "0");
    const fullUrl = `${prefix}${pageStr}${suffix}&scale=${scale}&rotate=0`;
    console.log(`Downloading from: ${fullUrl}`);

    try {
      const imgData = await downloadImage(fullUrl);
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
const url =
  "https://ia902905.us.archive.org/BookReader/BookReaderImages.php?zip=/12/items/zenandtheartofmotorcyclemaintenancerobertpirsigm._833_V/Zen%20and%20the%20Art%20of%20Motorcycle%20Maintenance%20Robert%20Pirsig%20M._jp2.zip&file=Zen%20and%20the%20Art%20of%20Motorcycle%20Maintenance%20Robert%20Pirsig%20M._jp2/Zen%20and%20the%20Art%20of%20Motorcycle%20Maintenance%20Robert%20Pirsig%20M._0003.jp2&id=zenandtheartofmotorcyclemaintenancerobertpirsigm._833_V&scale=2&rotate=0";
const filename = "Maintenance";
const scale = 1; // Set the desired scale for higher resolution

// Run the function
downloadAndCreatePdf(
  startPage,
  endPage,
  maxConsecutiveFailures,
  url,
  filename,
  scale
);
