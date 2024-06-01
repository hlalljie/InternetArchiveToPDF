const axios = require("axios");
const fs = require("fs");
const { PDFDocument } = require("pdf-lib");
const sharp = require("sharp");
const cliProgress = require("cli-progress");
const { performance } = require("perf_hooks");

const downloadImage = async (url) => {
  const response = await axios({
    url,
    responseType: "arraybuffer",
  });
  return response.data;
};

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
  return ((endTime - startTime) / 1000).toFixed(2); // Return the time taken to convert to PDF in seconds
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

const determineTotalPages = async (url) => {
  const { prefix, suffix } = splitUrl(url);
  const firstPageUrl = `${prefix}0000${suffix}`;
  const response = await downloadImage(firstPageUrl);
  // Extract the total number of pages from the response if available, otherwise, estimate it
  // Placeholder for extracting total pages logic:
  const totalPages = 1000; // Replace this with the actual logic to determine total pages
  return totalPages;
};

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

  if (endPage === -1) {
    endPage = await determineTotalPages(url);
    console.log(`Determined end page: ${endPage}`);
  }

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

// Parameters
const startPage = 0;
const endPage = 438; // Set to -1 to download all pages until consecutive failures occur
const maxConsecutiveFailures = 10; // Stop after 10 consecutive failures
const url =
  "https://ia903406.us.archive.org/BookReader/BookReaderImages.php?zip=/28/items/the-4-hour-work-week-by-timothy-ferriss/The%204-Hour%20Work%20Week%20by%20Timothy%20Ferriss_jp2.zip&file=The%204-Hour%20Work%20Week%20by%20Timothy%20Ferriss_jp2/The%204-Hour%20Work%20Week%20by%20Timothy%20Ferriss_0003.jp2&id=the-4-hour-work-week-by-timothy-ferriss&scale=2&rotate=0";
const filename = "The_4-Hour_Work_Week";
const scale = 1; // Set the desired scale for higher resolution
const batchSize = -1; // Number of pages to download in parallel per batch

// Run the function
downloadAndCreatePdf(
  startPage,
  endPage,
  maxConsecutiveFailures,
  url,
  filename,
  scale,
  batchSize
);
