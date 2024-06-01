const { downloadAndCreatePdf } = require("./download_pdf.js");

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
