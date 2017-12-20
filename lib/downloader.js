const path = require("path");
const https = require("https");
const {
  getDirectories,
  createFolderIfNotExist,
  writeResponseToFile
} = require("./utils");
const { createArchiver } = require("./archive");

let archiver = null;
const createLogger = require("./logger").createLogger;

const download = options => {
  const logger = createLogger(options.verbose);
  logger.info("Downloading...");
  logger.verbose(`Arcihive: ${options.archive}`);
  logger.verbose(`Flat: ${options.flat}`);

  if (options.archive) {
    archiver = createArchiver("extensions", () => {
      logger.info("Archive created successfully");
    });
  }
  const extensionsDirectory = getExtensionsDirectory();

  const folder = path.join(process.cwd(), "extensions");
  createFolderIfNotExist(folder);

  const installedExtensions = getInstalledExtensions(extensionsDirectory);
  let filesRemaining = installedExtensions.length;
  installedExtensions.forEach(({ publisher, extension, version }) => {
    const fileName = `${publisher}.${extension}-${version}.vsix`;
    const fullPathToFile = path.join(folder, fileName);
    const downloadUrl = `https://${publisher}.gallery.vsassets.io/_apis/public/gallery/publisher/${publisher}/extension/${extension}/${version}/assetbyname/Microsoft.VisualStudio.Services.VSIXPackage`;
    downloadFile(downloadUrl, fullPathToFile, () => {
      logger.verbose(`${fileName} Downloaded`);
      filesRemaining--;
      if (filesRemaining === 0) {
        logger.info("All files downloaded");
      }
      if (archiver) {
        logger.verbose(`${fileName} added to archive`);
        archiveFile(
          fullPathToFile,
          fileName,
          options,
          publisher,
          extension,
          version,
          filesRemaining
        );
      }
    });
  });
};

const getInstalledExtensions = directory => {
  return getDirectories(directory).map(folder => {
    const publisherSeparator = folder.indexOf(".", 0);
    const extensionSeparator = folder.lastIndexOf("-");
    const publisher = folder.slice(0, publisherSeparator);
    const extension = folder.slice(publisherSeparator + 1, extensionSeparator);
    const version = folder.slice(extensionSeparator + 1, folder.length);
    return { publisher, extension, version };
  });
};

const downloadFile = (url, fileName, cb) => {
  const request = https.get(url, response => {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      writeResponseToFile(fileName, response, cb);
    } else if (response.headers.location) {
      return downloadFile(response.headers.location, fileName);
    }
  });
};

const archiveFile = (
  fullPathToFile,
  fileName,
  options,
  publisher,
  extension,
  version,
  filesRemaining
) => {
  archiver.file(fullPathToFile, {
    name: fileName,
    prefix: options.flat ? "" : `${publisher}/${extension}/${version}`
  });
  if (filesRemaining === 0) {
    archiver.finalize();
  }
};

const getExtensionsDirectory = () => {
  const extensionsDirectory = path.join(
    process.env.HOME,
    "/.vscode/extensions"
  );
  return extensionsDirectory;
};

module.exports.download = download;
