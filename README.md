# Archive.org Book to PDF Downloader

## Description

This project is a command-line tool designed to download images from books available on [archive.org](https://archive.org/) and convert them into a single PDF file. It supports downloading images in parallel batches and provides detailed progress tracking throughout the process.

## Features

- Downloads images from a specified URL pattern on archive.org.
- Converts downloaded images into a single PDF file.
- Provides progress tracking for both download and conversion steps.
- Handles consecutive download failures gracefully.

## Prerequisites

- Node.js (version 12 or higher)
- npm (Node Package Manager)

### macOS

For macOS, use `brew` to install the necessary dependencies:

```sh
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

### Windows

For Windows, you can use `choco` (Chocolatey) to install the required dependencies. First, install [Chocolatey](https://chocolatey.org/install) if you haven't already. Then, run:

```sh
choco install -y python2
choco install -y vcredist140
choco install -y cairo
```

Alternatively, you can download and install these dependencies manually from their respective websites.

### Linux

For Linux, you can use your package manager to install the required dependencies. For example, on Debian-based distributions (like Ubuntu), you can run:

```sh
sudo apt-get install -y build-essential
sudo apt-get install -y libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev librsvg2-dev
```

For other distributions, use the appropriate package manager and package names.

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/your-username/archive-org-book-to-pdf-downloader.git
   cd archive-org-book-to-pdf-downloader
   ```

2. Install the required dependencies:
   ```sh
   npm install
   ```

## Usage

### Configuration

The tool comes with default parameters, but you can customize them by editing the `main.js` file if needed:

```javascript
const { downloadAndCreatePdf } = require("./download_pdf.js");

// Parameters
const startPage = 0;
const endPage = -1; // Set to -1 to download all pages until consecutive failures occur
const maxConsecutiveFailures = 10; // Stop after 10 consecutive failures
const url =
  "https://ia903406.us.archive.org/BookReader/BookReaderImages.php?zip=/28/items/the-4-hour-work-week-by-timothy-ferriss/The%204-Hour%20Work%20Week%20by%20Timothy%20Ferriss_jp2.zip&file=The%204-Hour%20Work%20Week%20by%20Timothy%20Ferriss_jp2/The%204-Hour%20Work%20Week%20by%20Timothy%20Ferriss_0003.jp2&id=the-4-hour-work-week-by-timothy-ferriss&scale=2&rotate=0";
const filename = "The_4-Hour_Work_Week";
const scale = 1; // Set the desired scale for higher resolution
const batchSize = 32; // Number of pages to download in parallel per batch

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
```

### Running the Tool

To run the tool with the default parameters, simply execute the following command:

```sh
npm start
```

### Example

Here is an example configuration for downloading and converting pages from "The 4-Hour Work Week by Timothy Ferriss":

```javascript
const { downloadAndCreatePdf } = require("./download_pdf.js");

// Parameters
const startPage = 0;
const endPage = -1;
const maxConsecutiveFailures = 10;
const url =
  "https://ia903406.us.archive.org/BookReader/BookReaderImages.php?zip=/28/items/the-4-hour-work-week-by-timothy-ferriss/The%204-Hour%20Work%20Week%20by%20Timothy%20Ferriss_jp2.zip&file=The%204-Hour%20Work%20Week%20by%20Timothy%20Ferriss_jp2/The%204-Hour%20Work%20Week%20by%20Timothy%20Ferriss_0003.jp2&id=the-4-hour-work-week-by-timothy-ferriss&scale=2&rotate=0";
const filename = "The_4-Hour_Work_Week";
const scale = 1;
const batchSize = 32;

downloadAndCreatePdf(
  startPage,
  endPage,
  maxConsecutiveFailures,
  url,
  filename,
  scale,
  batchSize
);
```

## Troubleshooting

- Ensure all dependencies are installed correctly.
- Verify the URL pattern and ensure it follows the expected format.
- Adjust the `maxConsecutiveFailures` parameter if you encounter frequent download errors.
- Modify the `batchSize` if you experience issues with downloading many pages in parallel. A batch size of 32 is a good starting point, but you may need to adjust it based on your network speed and system performance.

# Disclaimer

This extension is provided for the convenience of users to download open-source and public domain books from archive.org. It is the responsibility of the user to ensure they have the legal right to download and use the content.

The authors and contributors of this extension are not liable for any misuse of the tool or for any infringement of copyright or intellectual property laws. By using this extension, you agree to comply with the terms of service of archive.org and all applicable laws.

# Terms of Use

- Users must ensure that they have the legal right to access and download the content.
- Users must comply with the terms of service of archive.org.
- This extension should not be used to download copyrighted materials without permission.

# Limitation of Liability

The software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.

## Contributing

We welcome contributions to this project! If you have ideas or suggestions, please reach out to us via GitHub or Twitter. You can also fork the repository and create a new branch for your feature. Here are the steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Create a new Pull Request.

For discussions and suggestions, feel free to open an issue on GitHub or contact us on Twitter [@haydondo](https://x.com/haydondo).

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgments

- Special thanks to the developers of the libraries used in this project: Axios, PDF-Lib, Sharp, and cli-progress.
