const axios = require("axios");
const fs = require("fs");
const { PDFDocument } = require("pdf-lib");
const sharp = require("sharp");
const cliProgress = require("cli-progress");
const { performance } = require("perf_hooks");

/**
 * Downloads an image from the given URL.
 * @param {string} url - The URL of the image to download.
 * @returns {Promise<Buffer>} - The image data as a Buffer.
 */
const downloadImage = async (url) => {
  const response = await axios({
    url,
    responseType: "arraybuffer",
  });
  return response.data;
};

/**
 * Creates a PDF from an array of images.
 * @param {Buffer[]} images - Array of image data as Buffers.
 * @param {string} filename - The name of the output PDF file.
 * @returns {Promise<number>} - The time taken to create the PDF in seconds.
 */
const createPdf = async (images, filename) => {
  console.log("Saving images to PDF...");
  const startTime = performance.now();
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
  const endTime = performance.now();
  console.log(`PDF saved as ${filename}.pdf`);
  return ((endTime - startTime) / 1000).toFixed(2);
};

/**
 * Splits the URL into a prefix and suffix based on the page number pattern.
 * @param {string} url - The URL to split.
 * @returns {Object} - An object containing the prefix and suffix.
 */
const splitUrl = (url) => {
  const regex = /(.*_)(\d{4})(.*)/;
  const match = url.match(regex);
  if (match) {
    return { prefix: match[1], suffix: match[3].replace(/&scale=\d+/, "") };
  } else {
    throw new Error("URL format is incorrect");
  }
};

/**
 * Downloads images from the specified URL range and creates a PDF.
 * @param {number} startPage - The starting page number.
 * @param {number} endPage - The ending page number.
 * @param {number} maxConsecutiveFailures - The maximum number of consecutive download failures allowed.
 * @param {string} url - The base URL for downloading images.
 * @param {string} filename - The name of the output PDF file.
 * @param {number} scale - The scale factor for the images.
 * @param {number} batchSize - The number of pages to download in parallel per batch.
 */
const downloadAndCreatePdf = async (
  startPage,
  endPage,
  maxConsecutiveFailures,
  url,
  filename,
  scale,
  batchSize
) => {
  const { prefix, suffix } = splitUrl(url);
  const images = [];
  let consecutiveFailures = 0;
  let page = startPage;
  let batchCount = 0;

  const overallProgress = new cliProgress.SingleBar(
    {
      format: "Overall Progress |{bar}| {percentage}% | {value}/{total} Pages",
    },
    cliProgress.Presets.shades_classic
  );

  overallProgress.start(endPage - startPage + 1, 0);

  const overallStartTime = performance.now();
  const downloadStartTime = performance.now();

  while (consecutiveFailures < maxConsecutiveFailures && page <= endPage) {
    const batchTasks = [];
    const batchLimit = batchSize === -1 ? endPage - startPage + 1 : batchSize;

    const batchProgress = new cliProgress.SingleBar(
      {
        format: `Batch ${
          batchCount + 1
        } Progress |{bar}| {percentage}% | {value}/{total} Pages`,
      },
      cliProgress.Presets.shades_classic
    );

    batchProgress.start(batchLimit, 0);

    for (let i = 0; i < batchLimit && page <= endPage; i++) {
      const pageStr = String(page).padStart(4, "0");
      const fullUrl = `${prefix}${pageStr}${suffix}&scale=${scale}&rotate=0`;
      batchTasks.push(
        downloadImage(fullUrl)
          .then((imgData) => {
            batchProgress.increment();
            overallProgress.increment();
            return { imgData, success: true };
          })
          .catch(() => {
            batchProgress.increment();
            overallProgress.increment();
            return { imgData: null, success: false };
          })
      );
      page += 1;
    }

    const results = await Promise.all(batchTasks);
    batchProgress.stop();
    let completedCount = 0;
    for (const result of results) {
      if (result.success) {
        images.push(result.imgData);
        consecutiveFailures = 0; // Reset on successful download
        completedCount++;
      } else {
        consecutiveFailures += 1;
      }

      if (consecutiveFailures >= maxConsecutiveFailures) {
        console.log(
          `Stopping due to ${maxConsecutiveFailures} consecutive failures.`
        );
        break;
      }
    }
    batchCount++;
    console.log(
      `Batch ${batchCount} completed: ${completedCount}/${batchLimit} pages downloaded.`
    );
  }

  overallProgress.stop();
  const downloadEndTime = performance.now();
  const downloadDuration = (
    (downloadEndTime - downloadStartTime) /
    1000
  ).toFixed(2);

  const pdfConversionTime = await createPdf(images, filename);

  const overallEndTime = performance.now();
  const overallDuration = ((overallEndTime - overallStartTime) / 1000).toFixed(
    2
  );

  console.log(
    `Total time taken: ${overallDuration} seconds (${downloadDuration} seconds downloading, ${pdfConversionTime} seconds converting).`
  );
};

module.exports = { downloadAndCreatePdf };
